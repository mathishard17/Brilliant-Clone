# Phase 1 — MVP Foundation

## Objective

Establish the core architecture, Firebase integration, TypeScript data schema, and authenticated app shell for the Princess Outfits lesson. This phase delivers a runnable app where a student can sign up, log in, and be routed to a placeholder screen matching their saved progress — without implementing full lesson gameplay yet.

## Dependencies

- [prd.md](../prd.md) — lesson spec, user stories, and Data Schema section
- Existing scaffold: React 19 + Vite 8 in [package.json](../package.json)
- Existing Firebase init in [src/lib/firebase.ts](../src/lib/firebase.ts)
- Existing hosting config in [firebase.json](../firebase.json)
- `.env.example` with `VITE_FIREBASE_*` variables (local `.env` must be created manually)
- Firebase project created in the [Firebase Console](https://console.firebase.google.com/) with **Authentication (Email/Password)** and **Firestore** enabled
- No prior phases required — this is the starting phase

## Step-by-Step Task Checklist

### 1. Firebase Project & Environment Setup

- [ ] Create a Firebase project in the Firebase Console (or use an existing one)
- [ ] Register a Web app in Project Settings and copy the Firebase config object
- [ ] Copy `.env.example` to `.env` and fill in all `VITE_FIREBASE_*` values from the console
- [ ] Run `npx firebase login` to authenticate the Firebase CLI locally
- [ ] Run `npx firebase init` — select **Firestore** and **Hosting**; use existing `firestore.rules`, `firestore.indexes.json`, and `firebase.json`; set public directory to `dist`; enable SPA rewrite; do **not** overwrite existing config files
- [ ] Confirm `.firebaserc` is created with the correct `projectId`
- [ ] In Firebase Console → Authentication → Sign-in method → enable **Email/Password**
- [ ] In Firebase Console → Firestore → create database (start in test mode for dev; rules will be deployed from repo)

### 2. TypeScript Schema Types

- [ ] Create `src/types/lesson.ts` with interfaces:
  - `OutfitPair` — `{ crownId: string; dressId: string }`
  - `OutfitTriple` — `{ crownId: string; dressId: string; shoeId: string }`
  - `Screen1Progress` — `{ discoveredOutfits: OutfitPair[]; answer: number | null; isCorrect: boolean | null }`
  - `Screen2Progress` — `{ currentStep: number }` (range 1–5)
  - `Screen3Progress` — `{ discoveredOutfits: OutfitTriple[]; answer: number | null; isCorrect: boolean | null }`
  - `LessonProgress` — `{ lessonId: string; currentScreen: number; completed: boolean; screen1: Screen1Progress; screen2: Screen2Progress; screen3: Screen3Progress }`
  - `LESSON_ID` constant — `"lesson-1-princess-outfits"`
  - `createDefaultLessonProgress()` factory returning empty initial state (`currentScreen: 1`, all answers `null`, empty outfit arrays, `screen2.currentStep: 1`)
- [ ] Create `src/types/user.ts` with interfaces:
  - `UserProfile` — `{ username: string; princessName: string; createdAt: Firebase Timestamp; updatedAt: Firebase Timestamp; lesson: LessonProgress }`
  - `UsernameRecord` — `{ uid: string; createdAt: Firebase Timestamp }`
  - `ScreenNumber` type alias — `0 | 1 | 2 | 3 | 4`

### 3. Static Lesson Catalog

- [ ] Create `src/data/lesson1.ts` exporting:
  - `CROWNS` array — `{ id: "gold-tiara", label: "👑 Gold Tiara" }`, `{ id: "diamond-crown", label: "💎 Diamond Crown" }`
  - `DRESSES` array — `{ id: "pink-gown", label: "👗 Pink Ballgown" }`, `{ id: "purple-dress", label: "🟣 Purple Dress" }`, `{ id: "emerald-gown", label: "🟢 Emerald Gown" }`
  - `SHOES` array — `{ id: "glass-slippers", label: "🥿 Glass Slippers" }`, `{ id: "riding-boots", label: "🥾 Riding Boots" }`
  - `CORRECT_ANSWERS` — `{ screen1: 6, screen3: 12 }`
  - `MAX_UNIQUE_OUTFITS` — `{ screen1: 6, screen3: 12 }`
  - Helper `getItemLabel(category, id)` to resolve display labels from IDs

### 4. Outfit Dedup Utilities

- [ ] Create `src/utils/outfitKeys.ts` with functions:
  - `makeOutfitPairKey(crownId: string, dressId: string): string` — returns `{crownId}_{dressId}`
  - `makeOutfitTripleKey(crownId: string, dressId: string, shoeId: string): string` — returns `{crownId}_{dressId}_{shoeId}`
  - `isDuplicatePair(outfits: OutfitPair[], crownId: string, dressId: string): boolean`
  - `isDuplicateTriple(outfits: OutfitTriple[], crownId: string, dressId: string, shoeId: string): boolean`
  - `normalizeUsername(username: string): string` — lowercase + trim

### 5. Auth Service

- [ ] Create `src/services/auth.ts` with functions:
  - `toAuthEmail(username: string): string` — returns `{normalizeUsername(username)}@brilliant-clone.local`
  - `signUp(username: string, password: string, princessName: string): Promise<UserCredential>` — calls Firebase `createUserWithEmailAndPassword`, then batch-writes Firestore docs (see userProgress service)
  - `signIn(username: string, password: string): Promise<UserCredential>` — calls `signInWithEmailAndPassword` with synthetic email
  - `signOut(): Promise<void>` — calls Firebase `signOut`
  - `onAuthChange(callback): Unsubscribe` — wraps `onAuthStateChanged`

### 6. User Progress Service

- [ ] Create `src/services/userProgress.ts` with functions:
  - `checkUsernameAvailable(username: string): Promise<boolean>` — reads `usernames/{normalizedUsername}`; returns `true` if doc does not exist
  - `createUserProfile(uid: string, username: string, princessName: string): Promise<void>` — batch write `users/{uid}` (with `createDefaultLessonProgress()`) and `usernames/{username}`
  - `getUserProfile(uid: string): Promise<UserProfile | null>` — reads `users/{uid}`
  - `updateUserProfile(uid: string, partial: Partial<UserProfile>): Promise<void>` — merges update with `updatedAt: serverTimestamp()`
  - `updateLessonProgress(uid: string, lesson: Partial<LessonProgress>): Promise<void>` — nested merge on `lesson` field
  - `updateCurrentScreen(uid: string, screen: ScreenNumber): Promise<void>` — updates `lesson.currentScreen` and `updatedAt`

### 7. Firestore Security Rules

- [ ] Replace [firestore.rules](../firestore.rules) deny-all placeholder with PRD rules:
  - `users/{userId}` — `allow read, write: if request.auth != null && request.auth.uid == userId`
  - `usernames/{username}` — `allow read: if request.auth != null`; `allow create: if request.auth != null && request.resource.data.uid == request.auth.uid`
- [ ] Deploy rules with `npx firebase deploy --only firestore:rules` and confirm success in Firebase Console

### 8. Auth Context

- [ ] Create `src/context/AuthContext.tsx` providing:
  - State: `user` (Firebase `User | null`), `profile` (`UserProfile | null`), `loading` (boolean), `error` (string | null)
  - Methods: `signUp`, `signIn`, `signOut` (delegating to auth + userProgress services)
  - `useEffect` on mount: subscribe to `onAuthChange`; when user is set, call `getUserProfile(uid)` and store in state; clear profile on sign-out
  - Export `AuthProvider` component and `useAuth()` hook
- [ ] Wrap app in `AuthProvider` inside [src/main.tsx](../src/main.tsx)

### 9. User Progress Hook

- [ ] Create `src/hooks/useUserProgress.ts` accepting `uid` and initial `profile`:
  - Returns `{ profile, updateScreen, updateLesson, refreshProfile, saving, saveError }`
  - `updateScreen(screen: ScreenNumber)` — optimistic local update + `updateCurrentScreen` Firestore call
  - `updateLesson(partial)` — optimistic merge + `updateLessonProgress` Firestore call
  - `refreshProfile()` — re-fetch from Firestore

### 10. App Shell & Screen Router

- [ ] Create placeholder screen components (minimal text only — full UI comes in Phase 2):
  - `src/screens/PrincessRegistry.tsx` — placeholder: "Screen 0: Princess Registry"
  - `src/screens/DressingRoom.tsx` — placeholder: "Screen 1: Dressing Room"
  - `src/screens/AnchorTrickLesson.tsx` — placeholder: "Screen 2: Anchor Trick"
  - `src/screens/ShoesChallenge.tsx` — placeholder: "Screen 3: Shoes Challenge"
  - `src/screens/LessonSummary.tsx` — placeholder: "Screen 4: Summary"
- [ ] Create `src/components/AppShell.tsx` with:
  - Loading spinner while `AuthContext.loading === true`
  - Error banner when `AuthContext.error` is set
  - Header showing `profile.princessName` and a Sign Out button when authenticated
  - Screen router: switch on `profile.lessons[profile.activeLessonId].currentScreen` (or `0` when unauthenticated) to render the correct placeholder screen
  - Dev-only footer with buttons to jump between screens 0–4 (for testing navigation + persistence)
- [ ] Replace starter content in [src/App.tsx](../src/App.tsx) with `<AppShell />`
- [ ] Remove unused Vite starter assets and CSS from `App.tsx` / `App.css` (keep `index.css` base styles)

### 11. Global Styles Baseline

- [ ] Update [src/index.css](../src/index.css) with base reset, font stack suitable for children (e.g. system-ui or a rounded sans-serif), and CSS custom properties for kingdom theme colors (`--color-primary`, `--color-bg`, `--color-accent`) to be refined in Phase 3

### 12. Build & Lint Verification

- [ ] Run `npm run lint` and fix any TypeScript/ESLint errors introduced
- [ ] Run `npm run build` and confirm zero compile errors
- [ ] Run `npm run dev` and confirm the app loads without console errors related to Firebase config (missing `.env` values will throw — document this in README if needed)

## Verification/Testing Criteria

Phase 1 is **100% complete** when all of the following pass:

1. **Environment** — `.env` is populated; `npm run dev` starts without Firebase init errors
2. **Types compile** — `npm run build` succeeds with all new `src/types/`, `src/data/`, `src/services/`, `src/utils/` files
3. **Firestore rules deployed** — `firebase deploy --only firestore:rules` succeeds; Firebase Console shows updated rules (not deny-all)
4. **Sign up flow** — A new student can register with username, password, and princess name; Firebase Auth user is created with `{username}@brilliant-clone.local`; Firestore contains `users/{uid}` with correct schema and `usernames/{username}` with matching `uid`
5. **Sign in flow** — Same student can log out and log back in with username + password; profile loads from Firestore
6. **Duplicate username blocked** — Attempting signup with an existing username shows an error (service returns unavailable)
7. **Screen routing** — After signup, authenticated user lands on placeholder Screen 1 (not Screen 0); dev navigation buttons change the visible placeholder screen
8. **Progress persistence** — Changing screen via dev nav writes `lesson.currentScreen` to Firestore; refreshing the browser restores the same screen
9. **Sign out** — Sign Out clears auth state and returns user to Screen 0 placeholder
10. **Data shape** — `users/{uid}` document in Firestore Console matches the schema defined in [prd.md](../prd.md) Data Schema section (all fields present with correct types)
