# Princess Outfits — Royal Academy

An interactive combinatorics lesson for 3rd graders, built as a Brilliant-style learning app. Students dress a princess by tapping crowns, gowns, and shoes, discover every unique outfit, and learn the **multiplication shortcut** for counting choices — without ever counting one by one.

**Live demo:** [https://brilliantclone-4276b.web.app](https://brilliantclone-4276b.web.app) *(deploy with `npm run firebase:deploy` to update)*

---

## What it teaches

A single, fully built lesson — **Lesson 1: Princess Outfits** — that builds the idea of multiplicative counting in four guided steps:

1. **Discover** that 2 crowns × 3 dresses = **6** unique outfits.
2. **Learn the "Anchor Trick"** — lock one crown, cycle every dress, then repeat — to see *why* it's 6.
3. **Extend** the idea by adding 2 pairs of shoes for **12** total outfits.
4. **Generalize** to the multiplication shortcut, then **practice** it on a fresh problem (4 × 5 × 2 = 40).

The closet catalog: **2 crowns** (Gold Tiara, Diamond Crown), **3 gowns** (Pink Ballgown, Purple Dress, Emerald Gown), **2 pairs of shoes** (Glass Slippers, Riding Boots).

---

## Lesson flow & capabilities

The app is a single-page experience that routes between screens based on the student's saved progress. A **4-step progress bar** (Dress Up → The Trick → Add Shoes → Finish) appears across the lesson screens so the student always knows where they are and how much is left.

### Princess Registry (sign-in / sign-up)

- Username + password account creation with a custom **princess name** that personalizes every screen.
- Login and sign-up tabs in one form, with inline field validation (username format, length, password length).
- Friendly, kid-appropriate error messages ("That username is already taken — try another!").
- Duplicate-username prevention backed by a dedicated `usernames` collection.

### The Royal Academy (home hub — screen 0)

- Landing hub after login showing the lesson card with a **✓ Completed** badge once finished.
- **Resume** logic: an in-progress lesson reopens on the last screen viewed; a **completed** lesson always reopens on the summary ("Review Lesson 1").
- **Reset progress** with a confirmation dialog to replay from scratch.
- Placeholder cards for future Lesson 2 and Lesson 3.

### Screen 1 — Dressing Room

- Hands-on **closet sandbox**: tap crowns and gowns to dress the princess on a live canvas.
- **Outfit log** that records each unique combination, with automatic **de-duplication** so repeats don't count.
- A reset control to clear discovered outfits and try again.
- A **challenge question** ("how many unique looks?") with correct/incorrect feedback and retry.

### Screen 2 — The Anchor Trick

- A step-through explanation that "locks" one crown and cycles all dresses, then repeats for the next crown.
- An animated **tree diagram** visualizing how the 3 + 3 = 6 outfits branch out.

### Screen 3 — Shoes Challenge

- Adds a third category (shoes), turning pairs into **triples**.
- Same discover-and-dedupe sandbox, now counting toward **12** total outfits.
- Challenge question with a targeted hint if the student is close.

### Screen 4 — Lesson Summary

- A click-through reveal of the **Ultimate Multiplication Shortcut** (2 × 3 × 2 = 12), one factor at a time, with step dots and back/next navigation.
- A **practice question** with no closet — "4 crowns, 5 gowns, 2 shoes" — to apply the shortcut (answer 40), with feedback and retry.
- A celebratory closing message featuring the student's princess name, and a **Finish** button that marks the lesson complete.

---

## Platform features

- **Lesson progress bar** — a 4-step indicator (Dress Up → The Trick → Add Shoes → Finish) on screens 1–4 shows how far along the student is; accessible via `role="progressbar"`.
- **Persistent progress** — every answer, discovered outfit, and current screen is saved to Cloud Firestore, so a student can leave and resume on any device.
- **Optimistic updates with rollback** — UI updates instantly and reverts if a save fails.
- **Debounced outfit saves** — rapid outfit discoveries are batched to minimize writes.
- **Automatic retry** — transient save failures retry before surfacing a dismissible "couldn't save" banner.
- **Offline-tolerant reads** — profile loads fall back to cached data when the server is unreachable.
- **Resilient session handling** — a failed profile load shows a recoverable error screen (Try Again / Sign Out) instead of hanging; expired sessions prompt a friendly re-login.
- **Centered "Saving…" indicator** in the header while writes are in flight.
- **Developer tools** (dev build + configured dev user only) — jump directly to any screen, and jump between the summary's shortcut / practice / closing phases.
- **Works on phones, iPads, and computers** — a touch-optimized, responsive UI (see [Device support](#device-support) below).

---

## Device support

Built mobile-first and verified to work on **phones, iPads/tablets, and desktop browsers** — important because the target learner most often uses a tablet or phone.

- **Responsive layout** — a fluid, centered column with breakpoints at **480 → 768 → 1024px**. The closet and princess canvas stack vertically on phones and move side-by-side from tablet width up; the content column widens on larger screens, and the princess gets a bit more room on desktops/large iPads.
- **Touch-optimized for little fingers** — every control meets the **44px** minimum tap target, double-tap zoom delay is removed (`touch-action: manipulation`), and tap highlights plus accidental text selection from tap-and-hold are suppressed.
- **No surprise zooming** — form inputs use ≥16px text so iOS Safari won't zoom on focus, and iPad/iOS text auto-inflation is disabled.
- **Notch & safe-area aware** — `viewport-fit=cover` plus `env(safe-area-inset-*)` padding keep content clear of notches, home indicators, and rounded corners on modern iPhones and iPads.
- **Mobile browser chrome friendly** — uses `svh` viewport units so the layout fits correctly around dynamic toolbars, and curbs rubber-band overscroll.
- **Add-to-Home-Screen ready** — web-app meta tags and a theme color give a clean launch when saved to an iPad/iPhone home screen.

## Data model

Stored in Cloud Firestore:


| Collection             | Document                                                       | Purpose                                      |
| ---------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| `users/{uid}`          | `username`, `princessName`, `createdAt`, `updatedAt`, `lesson` | Full per-student profile and lesson progress |
| `usernames/{username}` | `uid`, `createdAt`                                             | Reverse lookup enforcing unique usernames    |


The `lesson` object tracks `lessonId`, `currentScreen`, `lastLessonScreen`, `completed`, and per-screen state (`screen1`–`screen3`) including discovered outfits and submitted answers. Reads are normalized against defaults so missing or legacy fields never break the UI.

Security rules restrict each user to their own `users/{uid}` document and allow the pre-signup username existence check, while keeping the `usernames` collection un-listable.

---

## Tech stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Firebase Authentication (Email/Password), Cloud Firestore, Firebase Hosting (Spark free tier)
- **Styling:** Hand-written CSS with a mobile-first, responsive layout (phones, iPads, desktops; touch- and safe-area-optimized)
- **Tooling:** ESLint, `firebase-tools`

---

## Local development

```bash
npm install
cp .env.example .env   # fill in your Firebase web app config
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment variables

All variables are `VITE_`-prefixed and embedded into the client bundle at build time (the Firebase web config is public by design and protected by Firestore security rules).


| Variable                            | Required | Description                                                                                                                |
| ----------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | ✅        | Firebase web API key                                                                                                       |
| `VITE_FIREBASE_AUTH_DOMAIN`         | ✅        | Firebase auth domain                                                                                                       |
| `VITE_FIREBASE_PROJECT_ID`          | ✅        | Firebase project ID                                                                                                        |
| `VITE_FIREBASE_STORAGE_BUCKET`      | ✅        | Firebase storage bucket                                                                                                    |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅        | Firebase messaging sender ID                                                                                               |
| `VITE_FIREBASE_APP_ID`              | ✅        | Firebase app ID                                                                                                            |
| `VITE_AUTH_EMAIL_DOMAIN`            | optional | Domain for synthetic `{username}@<domain>` auth emails (default `brilliant-clone.local`). Keep stable across environments. |
| `VITE_DEV_USERNAME`                 | optional | Username that sees the dev screen-jump nav in dev builds. Leave blank to disable.                                          |


Missing required Firebase values fail fast at startup with a clear message rather than a cryptic runtime error.

### Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Email/Password** authentication.
3. Create a **Firestore** database.
4. Register a web app and copy its config into `.env`.
5. Deploy security rules: `npx firebase deploy --only firestore:rules`.

See [roadmap/phase-1-mvp.md](roadmap/phase-1-mvp.md) for the full Phase 1 checklist.

---

## Scripts


| Command                           | Description                                          |
| --------------------------------- | ---------------------------------------------------- |
| `npm run dev`                     | Start the Vite dev server                            |
| `npm run build`                   | Type-check and produce a production build in `dist/` |
| `npm run preview`                 | Preview the production build locally                 |
| `npm run lint`                    | Run ESLint                                           |
| `npm run firebase:login`          | Authenticate the Firebase CLI                        |
| `npm run firebase:init`           | Initialize Firebase in the project                   |
| `npm run firebase:deploy`         | Build + deploy hosting and Firestore rules           |
| `npm run firebase:deploy:hosting` | Build + deploy hosting only                          |


---

## Project structure

```
src/
  screens/       # Lesson flow: PrincessRegistry, HomeHub, DressingRoom,
                 #   AnchorTrickLesson, ShoesChallenge, LessonSummary
  components/    # Closet, PrincessCanvas, OutfitLog, ChallengeQuestion,
                 #   FeedbackBanner, tree diagrams, AppShell, dialogs, etc.
  context/       # Auth and Lesson React contexts + providers
  hooks/         # useAuth, useLesson, useUserProgress, useOutfitTracker
  services/      # Firebase auth & Firestore (userProgress) access
  data/          # Static closet catalog & correct answers
  copy/          # Student-facing lesson text (single source of wording)
  utils/         # Outfit dedup keys, progress merge/normalize, resume logic,
                 #   retry, debounce, dev-mode gating
  types/         # Lesson and user TypeScript models
  lib/           # Firebase app initialization
```

### Architecture notes

- **Layered design:** screens render UI, hooks orchestrate state, services own all Firebase I/O, and `data`/`copy` keep content out of components.
- **Single source of progress:** `useUserProgress` owns optimistic updates, debounced saves, and retry; the Firestore service persists the whole `lesson` object to avoid partial overwrites.
- **Content separation:** every student-facing string lives in `src/copy/lesson1.ts`, making wording easy to tweak without touching logic.

---

## User persona

Built for an 8-year-old girl who loves dress-up, fairy tales, and seeing her custom name throughout the lesson. Authentication uses a simple username + password, mapped internally to `{username}@brilliant-clone.local` emails in Firebase so kids never deal with real email addresses.

---

## License

Alpha AI Engineering project.