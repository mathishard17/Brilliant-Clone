# Phase 3 — Polish, Deploy & Pass Requirements

## Objective

Refine the Princess Outfits app to production quality with kingdom-themed mobile-responsive UI, layered princess visuals, Screen 2 animations, robust edge-case handling, performance optimizations, and public Firebase deployment. This phase ensures every item in the [prd.md](../prd.md) Project Requirements to Pass checklist is satisfied.

## Dependencies

- **Phase 1 complete** — architecture, auth, Firestore services, types
- **Phase 2 complete** — all five screens functional with persistence and feedback
- [roadmap/phase-1-mvp.md](./phase-1-mvp.md) and [roadmap/phase-2-core.md](./phase-2-core.md)
- Firebase project with Auth, Firestore, and Hosting configured (from Phase 1)
- All lesson screens and shared components from Phase 2

## Step-by-Step Task Checklist

### 1. Kingdom Theme & Global Styles

- [ ] Expand [src/index.css](../src/index.css) with a cohesive princess/kingdom theme:
  - CSS custom properties: `--color-royal-purple`, `--color-gold`, `--color-pink`, `--color-bg-castle`, `--color-text`, `--font-display`, `--radius-soft`, `--shadow-card`
  - Base typography: large readable font sizes (min 16px body, 24px+ headings) suitable for 8-year-olds
  - Global button styles: rounded, gold/purple gradient or solid fills, clear hover/active states
- [ ] Create `src/styles/theme.css` imported in `main.tsx` with shared card, heading, and form input styles
- [ ] Remove any remaining Vite starter boilerplate styles from [src/App.css](../src/App.css) or delete file if unused
- [ ] Apply consistent padding and max-width container (`max-width: 480px` on mobile, `768px` on tablet) across all screens

### 2. Mobile-First Responsive Layout

- [ ] Update `src/screens/screens.css` (or per-screen styles) with mobile-first breakpoints:
  - **Mobile (< 640px):** `flex-direction: column` — closet stacks above princess canvas; full-width tap targets
  - **Tablet+ (≥ 640px):** closet and canvas side-by-side in a `display: flex` row with `gap`
- [ ] Ensure all interactive elements meet **44px minimum touch target** size (closet items, buttons, inputs)
- [ ] Test form inputs on Screen 0: no zoom-on-focus issues (use `font-size: 16px` on inputs to prevent iOS zoom)
- [ ] Verify no horizontal scroll on 375px-wide viewport (iPhone SE) across all 5 screens
- [ ] Add `viewport` meta tag verification in [index.html](../index.html) — confirm `width=device-width, initial-scale=1` is set

### 3. Princess Canvas — Layered Visual Assets

- [ ] Add princess silhouette base image or SVG to `src/assets/princess/` (silhouette, crown overlays, dress overlays, shoe overlays — can be simple illustrated PNGs or CSS-styled shapes for MVP)
- [ ] Refactor `src/components/PrincessCanvas.tsx` to use `position: absolute` layering:
  - Base silhouette at `z-index: 1`
  - Dress layer at `z-index: 2` — positioned with percentage `top`/`left`/`width` offsets
  - Shoe layer at `z-index: 3`
  - Crown layer at `z-index: 4`
  - Lock icon overlay at `z-index: 5` when `showLock === true`
- [ ] Map each item ID (`gold-tiara`, `pink-gown`, etc.) to an asset or styled emoji block with consistent percentage-based positioning so alignment holds on all screen sizes
- [ ] Add `src/data/assetPositions.ts` exporting per-item CSS position overrides (`{ top: "5%", left: "30%", width: "40%" }`) for each crown, dress, and shoe
- [ ] Verify princess figure scales proportionally when container resizes (use `width: 100%` on container with `aspect-ratio`)

### 4. Closet UI Polish

- [ ] Style `src/components/Closet.tsx`:
  - Category headings with sparkle/crown icons
  - Selected item: gold border + subtle scale transform
  - Unselected items: soft pastel card background
  - Grid layout: 2 columns on mobile, 3 on tablet for closet items
- [ ] Add tap feedback: brief scale or color flash on `onTouchStart` / `onClick`
- [ ] Ensure emoji labels from `src/data/lesson1.ts` render at readable size (24px+)

### 5. Screen 2 Animations & Tree Diagram

- [ ] Add dress-cycling animation in `src/screens/AnchorTrickLesson.tsx` for Step 3:
  - Auto-cycle through 3 dresses on the princess canvas over ~2 seconds when step loads, or on "Play" button tap
  - Use CSS `@keyframes` or React `useState` + `setInterval` to swap `dressId` prop on `PrincessCanvas`
- [ ] Add lock icon animation for Steps 2–4: padlock emoji/SVG with a subtle pulse CSS animation when `showLock` is true
- [ ] Enhance `src/components/TreeDiagram.tsx`:
  - Progressive reveal: show tree branches one line at a time as student clicks "Next" within steps 3–5
  - Monospace font, left-aligned, scrollable on mobile if needed
- [ ] Add step transition fade: brief CSS opacity transition when moving between steps 1–5

### 6. Feedback, Loading & Empty States

- [ ] Style `src/components/FeedbackBanner.tsx`:
  - Success: green/gold background with sparkle accent
  - Error/info: soft purple with encouraging tone (not harsh red for wrong answers — keep kid-friendly)
- [ ] Add `src/components/LoadingSpinner.tsx` — kingdom-themed spinner shown during auth load and Firestore fetches
- [ ] Wire `LoadingSpinner` in `AppShell` when `AuthContext.loading` or `useUserProgress.saving` is true
- [ ] Empty state for `OutfitLog`: show "Try tapping items in the closet!" when `outfits.length === 0`
- [ ] Disable Submit button on `ChallengeQuestion` when input is empty or non-numeric; re-enable after editing post-submit if retry is allowed

### 7. Form Validation & Edge Cases

- [ ] Screen 0 — comprehensive validation in `src/screens/PrincessRegistry.tsx`:
  - Username: required, min 3 chars, alphanumeric + underscores only, auto-lowercase
  - Password: required, min 6 chars
  - Princess Name: required, min 2 chars, max 40 chars
  - Show specific inline error per field (not a single generic message)
- [ ] Duplicate username: catch Firestore `checkUsernameAvailable === false` and Auth `auth/email-already-in-use`; display "That username is already taken — try another!"
- [ ] Wrong password on login: catch `auth/wrong-password` / `auth/user-not-found`; display "Hmm, that username or password doesn't match. Try again!"
- [ ] Network failure on Firestore write: catch error in `useUserProgress`; show dismissible banner "Couldn't save your progress — we'll try again" with automatic retry (1–2 attempts)
- [ ] Auth session expiry: if `onAuthStateChanged` fires `null` mid-lesson, redirect to Screen 0 with message "Your session ended — please log in again"
- [ ] Mid-lesson refresh: verify all screens restore full state (already in Phase 2 — regression test here)
- [ ] Completed lesson: if `lesson.completed === true` on login, route directly to Screen 4 with completion badge; prevent re-doing challenges unless intentional reset is desired

### 8. Performance Optimizations

- [ ] Debounce Firestore writes in `src/hooks/useOutfitTracker.ts`: when student rapidly taps outfits, batch discovered-outfit writes with a 500ms debounce (keep local UI instant; defer Firestore call)
- [ ] Memoize expensive renders: wrap `PrincessCanvas`, `Closet`, and `OutfitLog` with `React.memo` if re-renders cause jank
- [ ] Lazy-load screen components in `src/components/AppShell.tsx` using `React.lazy` + `Suspense` with `LoadingSpinner` fallback:
  - `const DressingRoom = React.lazy(() => import('../screens/DressingRoom'))` (repeat for all 5 screens)
- [ ] Run `npm run build` and check bundle size in terminal output; confirm no single chunk exceeds 500KB gzipped (Vite default splitting should suffice)
- [ ] Preload princess assets: add `<link rel="preload">` for silhouette image in `index.html` if using a large base asset

### 9. Accessibility Basics

- [ ] Add `aria-label` to closet item buttons (e.g. `aria-label="Select Gold Tiara"`)
- [ ] Ensure all buttons are `<button type="button">` (not div click handlers)
- [ ] Add `role="status"` to `FeedbackBanner` and `OutfitLog` counter for screen reader updates
- [ ] Verify focus outlines are visible on keyboard navigation for form fields and buttons
- [ ] Add `alt` text to princess silhouette and overlay images

### 10. Firebase Production Deployment

- [ ] Confirm `firestore.rules` matches PRD (deployed in Phase 1 — re-deploy to be safe): `npx firebase deploy --only firestore:rules`
- [ ] Run production build: `npm run build` — zero errors
- [ ] Deploy hosting + rules: `npm run firebase:deploy` (or `npx firebase deploy --only hosting,firestore:rules`)
- [ ] Verify public URL loads in an incognito browser window (no cached dev state)
- [ ] Test sign up, lesson play, and progress persistence on the **live deployed URL** (not just localhost)
- [ ] Confirm Firebase Console → Hosting shows the deployment with SSL active
- [ ] Optional: configure a custom domain in Firebase Hosting if required by course submission

### 11. README Update

- [ ] Update [README.md](../README.md) with:
  - Project description (Princess Outfits combinatorics lesson for 3rd graders)
  - Live demo URL (Firebase Hosting URL)
  - Local dev setup: `npm install`, copy `.env.example` → `.env`, `npm run dev`
  - Firebase setup steps (link to Phase 1 checklist)
  - Tech stack summary (React, Vite, Firebase)

### 12. PRD Pass Requirements — Full QA Matrix

- [ ] Execute manual QA checklist below and fix any failures before marking phase complete

## Verification/Testing Criteria

Phase 3 is **100% complete** when all of the following pass:

### PRD Pass Requirements (all 9 must pass)

| # | Requirement | Test |
|---|-------------|------|
| 1 | Chosen subject with specific user persona | App is clearly a math combinatorics lesson for an 8-year-old princess persona; copy and visuals reflect this throughout |
| 2 | One interactive lesson on a real concept | Full Lesson 1 (counting combinations via multiplication) playable end-to-end on deployed URL |
| 3 | Learner manipulates directly | Student taps closet items to build outfits on Screens 1 and 3; taps Next/Back on Screen 2 |
| 4 | Interactive visual element | Princess canvas responds to taps; tree diagram on Screen 2; outfit log updates live |
| 5 | Instant specific feedback | Submit on Screens 1 and 3 shows correct/incorrect message with princess name and PRD explanation text immediately |
| 6 | Progress persists | Start lesson on deployed URL, reach Screen 3, close browser, reopen and log in → resumes at Screen 3 with outfits intact |
| 7 | Accounts and names (auth) | Sign up with username/password/princess name works on production; app uses princess name in copy |
| 8 | Works on mobile | All 5 screens usable on 375px viewport — no clipped content, no horizontal scroll, tappable buttons |
| 9 | Deployed and public | Firebase Hosting URL loads for anyone without localhost; HTTPS active |

### Additional Quality Gates

10. **Screen 2 animations** — Dress cycling plays on Step 3; lock icon visible on Steps 2–4; step transitions are smooth
11. **Edge cases** — Duplicate username shows friendly error; wrong login shows friendly error; network retry works on simulated offline (DevTools → Network → Offline)
12. **Performance** — Rapid outfit tapping does not cause UI freeze; debounced writes appear in Firestore within 1 second of stopping
13. **Build & lint** — `npm run build` and `npm run lint` pass with zero errors
14. **Security** — Unauthenticated Firestore read/write attempts fail (verify in Firebase Console rules playground); users cannot read other users' `users/{uid}` documents
15. **Lesson completion** — Finishing Screen 4 sets `lesson.completed: true` in production Firestore; returning user sees completion state

### Device Test Matrix

Test on at least two form factors before signing off:

- [ ] Mobile: 375×667 (iPhone SE) — Chrome DevTools device mode
- [ ] Tablet: 768×1024 (iPad) — closet and canvas side-by-side
- [ ] Desktop: 1280×800 — layout scales without excessive whitespace

### Sign-Off

- [ ] Live demo URL documented in README
- [ ] All Phase 1, Phase 2, and Phase 3 checklist items above are checked
- [ ] No critical console errors on production URL during a full lesson playthrough
