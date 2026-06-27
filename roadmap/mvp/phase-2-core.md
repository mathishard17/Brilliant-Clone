# Phase 2 — Core Lesson Workflows

## Objective

Implement all five PRD lesson screens with interactive closet gameplay, unique outfit tracking, challenge questions with instant feedback, the anchor-trick step-through lesson, and full Firestore progress synchronization. This phase delivers a complete end-to-end lesson loop that satisfies all six user stories from [prd.md](../prd.md) at a functional level (visual polish deferred to Phase 3).

## Dependencies

- **Phase 1 complete** — all Phase 1 verification criteria must pass before starting
- [roadmap/phase-1-mvp.md](./phase-1-mvp.md) — types, services, auth context, app shell, static catalog
- Existing files: `src/types/`, `src/data/lesson1.ts`, `src/services/`, `src/context/AuthContext.tsx`, `src/hooks/useUserProgress.ts`, `src/screens/` placeholders
- [prd.md](../prd.md) — Screens 0–4 copy, feedback messages, closet items, correct answers

## Step-by-Step Task Checklist

### 1. Lesson Copy & Personalization

- [ ] Create `src/copy/lesson1.ts` exporting all PRD text strings as functions accepting `princessName: string`:
  - `screen0Heading()`, `screen0Body()`, `screen1Heading(princessName)`, `screen1Body(princessName)`
  - `screen1ChallengePrompt()`, `screen1FeedbackCorrect(princessName)`, `screen1FeedbackIncorrect(princessName)`
  - `screen2Steps` — array of 5 objects with `lessonText` and optional `treeDiagram` string per step (from PRD Screen 2 Steps 1–5)
  - `screen2SummaryButton()`, `screen3Heading(princessName)`, `screen3Body(princessName)`, `screen3ChallengePrompt()`
  - `screen3FeedbackCorrect(princessName)`, `screen3FeedbackIncorrect(princessName)`
  - `screen4Heading()`, `screen4Body(princessName)`, `screen4ShortcutHeading()`, `screen4ShortcutBody()`, `screen4Equation()`, `screen4Closing(princessName)`
- [ ] Create `src/utils/personalize.ts` with `interpolate(template: string, vars: Record<string, string>): string` helper if needed for `{Chosen Princess Name}` placeholders

### 2. Shared UI Components

- [ ] Create `src/components/Closet.tsx`:
  - Props: `categories: { title: string; items: { id: string; label: string }[] }[]`, `selected: Record<string, string | null>`, `onSelect: (categoryKey: string, itemId: string) => void`
  - Render category headings and tappable item buttons; highlight currently selected item per category
  - Emit selection on tap (no drag required for MVP)
- [ ] Create `src/components/PrincessCanvas.tsx`:
  - Props: `crownId: string | null`, `dressId: string | null`, `shoeId?: string | null`, `showLock?: boolean`
  - Render a princess silhouette container with layered slots for crown, dress, shoes (use emoji or placeholder divs in Phase 2; asset layering refined in Phase 3)
  - Display selected item labels/emojis on the figure when IDs are set
- [ ] Create `src/components/OutfitLog.tsx`:
  - Props: `outfits: { label: string }[]`, `total: number`, `max: number`
  - Render "Unique Princess Looks Found:" list and "Total Unique Found: X / Y" counter
- [ ] Create `src/components/ChallengeQuestion.tsx`:
  - Props: `prompt: string`, `value: string`, `onChange`, `onSubmit`, `disabled?: boolean`, `submitted?: boolean`
  - Render prompt text, number input, and Submit button
- [ ] Create `src/components/FeedbackBanner.tsx`:
  - Props: `message: string`, `variant: "success" | "error" | "info"`
  - Render styled banner with princess-personalized message after answer submission
- [ ] Create `src/components/LessonButton.tsx`:
  - Props: `label: string`, `onClick`, `variant?: "primary" | "secondary"`
  - Reusable CTA button used across screens

### 3. Outfit Tracking Hook

- [ ] Create `src/hooks/useOutfitTracker.ts`:
  - Accept: `mode: "pair" | "triple"`, `discoveredOutfits` from profile, `onNewOutfit: (outfit) => void`
  - Track local `selectedCrown`, `selectedDress`, `selectedShoe` state
  - `useEffect`: when all required selections are non-null, check dedup via `outfitKeys.ts`; if new, call `onNewOutfit` with `{ crownId, dressId }` or `{ crownId, dressId, shoeId }`
  - Return `{ selected, setSelected, outfitLabels }` where `outfitLabels` maps discovered outfits to display strings (e.g. "👑 + 👗")
- [ ] Wire `onNewOutfit` in parent screens to call `updateLesson` → append to `lesson.screen1.discoveredOutfits` or `lesson.screen3.discoveredOutfits` and persist to Firestore

### 4. Screen 0 — Princess Registry (Full UI)

- [ ] Replace placeholder in `src/screens/PrincessRegistry.tsx` with full form:
  - Fields: Username, Password, Princess Name (per PRD Screen 0)
  - Heading: 🏰 Welcome to the Kingdom! + body copy from `src/copy/lesson1.ts`
  - Button: "Create Account & Enter 🔑"
- [ ] Add toggle or secondary form for **returning users**: Username + Password + "Log In" button calling `signIn`
- [ ] On successful signup: set `lesson.currentScreen` to `1` via `updateScreen(1)` and navigate
- [ ] On successful login: load existing profile; route to `profile.lessons[profile.activeLessonId].currentScreen` (skip Screen 0)
- [ ] Basic validation: all fields non-empty; username min 3 chars; password min 6 chars; show inline error messages
- [ ] Show error from AuthContext/service on duplicate username or auth failure

### 5. Screen 1 — Dressing Room (Exercise 1)

- [ ] Replace placeholder in `src/screens/DressingRoom.tsx`:
  - Heading + welcome text with `profile.princessName`
  - `Closet` with crowns and dresses categories only (from `src/data/lesson1.ts`)
  - `PrincessCanvas` showing current crown + dress selection
  - `useOutfitTracker` in `"pair"` mode wired to `lesson.screen1.discoveredOutfits`
  - `OutfitLog` showing discovered combos and `X / 6` counter
- [ ] Implement challenge section:
  - `ChallengeQuestion` with Screen 1 prompt from copy file
  - On Submit: compare answer to `CORRECT_ANSWERS.screen1` (6); set `lesson.screen1.answer` and `lesson.screen1.isCorrect`; persist to Firestore
  - Show `FeedbackBanner` with correct or incorrect message (personalized with princess name)
- [ ] Add "Continue" button (visible after Submit) that calls `updateScreen(2)` regardless of correct/incorrect (per PRD: both paths lead to Screen 2)
- [ ] Restore state on mount from `profile.lessons[profile.activeLessonId].screen1` (selections, discovered outfits, prior answer/feedback if already submitted)

### 6. Screen 2 — Anchor Trick Lesson (Step-by-Step)

- [ ] Replace placeholder in `src/screens/AnchorTrickLesson.tsx`:
  - Read `profile.lessons[profile.activeLessonId].screen2.currentStep` (default 1)
  - Render current step's `lessonText` from `screen2Steps` copy array
  - `PrincessCanvas` updated per step (bare figure step 1; locked crown step 2; cycling dresses step 3; second anchor step 4; summary step 5)
  - `showLock` prop true on steps 2–4 when anchor crown is active
- [ ] Create `src/components/TreeDiagram.tsx`:
  - Props: `lines: string[]` or `content: string` (monospace pre block)
  - Render tree diagram from PRD for steps 3, 4, and 5
- [ ] Navigation controls:
  - "Next" button advances step (max 5); persist `screen2.currentStep` to Firestore on each advance
  - "Back" button decrements step (min 1); persist step change
  - Step 5: show button "Try the Princess Challenge! 🔥" → `updateScreen(3)`
- [ ] Restore step on mount from `profile.lessons[profile.activeLessonId].screen2.currentStep`

### 7. Screen 3 — Shoes Challenge (Harder Exercise)

- [ ] Replace placeholder in `src/screens/ShoesChallenge.tsx`:
  - Heading + body with `profile.princessName`
  - `Closet` with crowns, dresses, **and shoes** categories
  - `PrincessCanvas` with crown + dress + shoe layers
  - `useOutfitTracker` in `"triple"` mode wired to `lesson.screen3.discoveredOutfits`
  - `OutfitLog` showing `X / 12` counter
- [ ] Challenge section:
  - Prompt from copy file; Submit compares to `CORRECT_ANSWERS.screen3` (12)
  - Persist `lesson.screen3.answer` and `lesson.screen3.isCorrect`
  - Show correct/incorrect `FeedbackBanner` (personalized)
- [ ] "Continue" button after Submit → `updateScreen(4)` regardless of answer
- [ ] Restore state from `profile.lessons[profile.activeLessonId].screen3` on mount

### 8. Screen 4 — Final Summary & Review

- [ ] Replace placeholder in `src/screens/LessonSummary.tsx`:
  - Heading: 🏆 Princess Designer Confirmed!
  - Body copy with `profile.princessName`
  - "💥 The Ultimate Multiplication Shortcut" section with shortcut body text
  - Display master equation: `2 Crowns × 3 Dresses × 2 Shoes = 12 Total Outfits` (render as styled text; LaTeX optional)
  - Closing copy from `screen4Closing(princessName)`
- [ ] Button: "Finish Lesson Complete! 🎉"
  - On click: call `updateLesson({ completed: true, currentScreen: 4 })` and persist
  - Show completion state if `profile.lessons[profile.activeLessonId].completed === true` (disable button or show "Lesson Complete!" badge)

### 9. App Shell Integration

- [ ] Remove dev-only screen-jump footer from `src/components/AppShell.tsx` (or gate behind `import.meta.env.DEV`)
- [ ] Update screen router to render full screen components instead of placeholders
- [ ] Unauthenticated users see only `PrincessRegistry`; authenticated users see screen matching `profile.lessons[profile.activeLessonId].currentScreen`
- [ ] Prevent navigating to Screen 0 while authenticated unless signed out
- [ ] Pass `profile`, `updateScreen`, `updateLesson`, and `princessName` props or via a `LessonContext` if prop drilling becomes excessive

### 10. Progress Write Triggers (PRD Compliance)

- [ ] Verify all PRD write triggers are implemented:
  - Signup → `createUserProfile` (Phase 1) ✓
  - New unique outfit → append to `discoveredOutfits` + Firestore write
  - Challenge Submit → save `answer` + `isCorrect`
  - Screen navigation → update `currentScreen`
  - Screen 2 step change → update `screen2.currentStep`
  - Lesson finish → set `completed: true`
- [ ] Add `saving` indicator in AppShell header or screen footer when Firestore write is in flight
- [ ] Log and surface `saveError` from `useUserProgress` as a non-blocking toast/banner

### 11. Screen-Specific CSS (Functional)

- [ ] Create `src/screens/screens.css` with functional layout styles for each screen (flex containers, closet grid, canvas area side-by-side on wide screens) — polish deferred to Phase 3
- [ ] Import screen CSS in respective screen components

### 12. Build Verification

- [ ] Run `npm run lint` and fix all errors
- [ ] Run `npm run build` and confirm zero compile errors
- [ ] Manual smoke test: complete full lesson flow Screens 0 → 4 in browser

## Verification/Testing Criteria

Phase 2 is **100% complete** when all of the following pass:

1. **User Story 0 (Auth & Personalization)** — Student can create account with username, password, princess name; app greets them by princess name on Screens 1–4
2. **User Story 1 (Interactive Sandbox)** — Tapping crowns and dresses on Screen 1 instantly updates the princess canvas; same for shoes on Screen 3
3. **User Story 2 (Outfit Tracking)** — Each new unique crown+dress pair appears in the outfit log on Screen 1; counter increments to max 6; triple combos tracked on Screen 3 to max 12
4. **User Story 3 (Step-Through Lesson)** — Screen 2 advances through 5 steps with Next/Back; lesson text and tree diagrams match PRD; step persists across refresh
5. **User Story 4 (3-Category Challenge)** — Screen 3 closet includes shoes; challenge asks for 12; tracking works with three categories
6. **User Story 5 (Feedback & Reward)** — Submitting `6` on Screen 1 shows correct feedback with princess name; submitting wrong answer shows incorrect feedback; same for `12` on Screen 3; Screen 4 shows multiplication shortcut
7. **Challenge gating** — Both correct and incorrect answers on Screens 1 and 3 allow progression to the next screen (per PRD narrative flow)
8. **Progress persistence** — Mid-lesson browser refresh on any screen restores: current screen, discovered outfits, submitted answers, Screen 2 step, and completion status
9. **Returning user** — Log out, log back in → lands on last saved screen with all progress intact
10. **Firestore documents** — After full lesson completion, `users/{uid}` in console shows `lesson.completed: true`, populated `screen1`/`screen2`/`screen3` fields, and `currentScreen: 4`
11. **Build passes** — `npm run build` and `npm run lint` succeed with no errors
