# Project Progress

Concise milestone log for **Counting Adventures**.

## MVP Baseline

- Built a React/Vite/TypeScript app with Firebase Auth, Firestore progress, and Firebase Hosting.
- Shipped Lesson 1: Princess Outfits.
  - closet sandbox
  - outfit de-duplication
  - Anchor Trick minilesson
  - shoes challenge
  - multiplication shortcut summary
- Added auth, profile loading, resume/reset, save indicators, mobile/iPad responsive support, and Firestore rules.
- Committed the passing first-deadline MVP before larger refactors.

## Multi-Lesson Architecture

- Added `src/lessons/registry.ts` with per-lesson metadata, screen maps, reset logic, resume logic, and progress labels.
- Changed progress storage to support `activeLessonId` and `lessons: Record<string, LessonProgress>`, while keeping legacy `lesson` compatibility.
- Made section counts configurable through each lesson's `progressSteps`.
- Reorganized lesson files into `src/lessons/lessonN/` folders.
- Added lesson title chrome and per-lesson progress bars.

## Curriculum Expansion

- Added an overall syllabus: `roadmap/lesson-plans/combinatorics-syllabus.md`.
- Added plans for Lessons 3–5 in `roadmap/lesson-plans/`.
- Implemented five registered lessons:
  1. **Princess Outfits** — multiplication rule / counting choices.
  2. **Royal Arrangements** — permutations, factorials, constraints, identical items.
  3. **Royal Treasure Bags** — combinations / order does not matter.
  4. **Magic Chance Spinners** — probability as favorable outcomes over total outcomes.
  5. **Fair Games** — sample spaces and fairness.

## Agent Skills Added

- `create-lesson` — creates new lesson folders using the registry architecture.
- `review-lesson` — reviews lessons against plans, pedagogy, difficulty, interaction quality, and common mistakes.
- `revise-lesson` — implements bounded improvements from a review.
- `looping` — keeps long roadmap work moving through explicit execute/review/advance loops.
- `review-lesson/COMMON_MISTAKES.md` — shared QA patterns for future lesson reviews.

## AI Theme Personalization

- Created `roadmap/ai-added/` to phase AI work safely.
- Established the principle: AI creates the costume; code owns the math.
- Added Lesson 1 theme-pack types, validation, fallback themes, and theme resolving.
- Added profile fields for `themePreference` and cached `themePacks`.
- Updated signup and the Home Hub so a learner can choose or change a theme preference, including custom-theme fallback behavior.
- Updated Lesson 1 rendering so labels and flavor copy can come from a validated theme pack while counts and answers stay deterministic.
- Added Firebase AI Logic generation code for Lesson 1 theme packs, including validation, fallback behavior, caching, and `VITE_FIREBASE_AI_MODEL` support.
- Added optional Lesson 1 AI hints with safe JSON validation and fallback hints that do not change correctness or progress.
- Added theme visual identity, including distinct Royal/Space color schemes and an astronaut-style Space character.
- Added bounded flexible copy slots so themes can change headings, transitions, and summary language while equations and answers stay code-owned.
- Added full theme visual tokens for buttons, hints, success states, and motif shapes.
- Added manual Dinosaur, Animal, Sports, and Surprise theme fallbacks.
- Added bounded `characterConfig` presets and reusable character drawing primitives so Lesson 1 can render explorer/helper/athlete/studio outfits, not just recolored princess dresses.
- Made the login/signup copy theme-neutral and updated the Home Hub title/cards/emoji sets to reflect the active theme.
- Added lesson-local theme bridges for Lessons 2–5 while shared per-lesson theme-pack contracts remain future work.
- Expanded the shared theme visual contract with optional UI state tokens for error, warning, status, selected, disabled, input/focus, diagram, spinner, meter, neutral, and dialog-like surfaces.
- Mapped those theme tokens into CSS variables and applied them to shared feedback, voice status, inputs, selected states, clickthrough dots, Lesson 4 spinners, and Lesson 5 tray/meter/spinner review surfaces.
- Current AI roadmap status: Phases 1-11 are code-present; current manual Phase 12 character presets are present for existing themes. Phase 4 still needs Firebase AI provisioning/manual AI smoke validation, and Phases 5/7/8/9/10/11/12 still need browser smoke testing.

## Voice, Sound, And Theme Review Loop

- Added a voice layer that keeps provider calls behind Firebase callable Functions:
  - client voice catalog and request validation live in `src/voice/`
  - browser code calls `getVoiceClip` through Firebase Functions
  - `functions/index.js` calls Cartesia server-side, caches MP3s in Storage when available, and returns caption fallback when audio is unavailable
  - local development uses the Functions emulator at `127.0.0.1:5001`
- Added opt-in voice controls across Lessons 1–5:
  - replay buttons near important instructional text
  - one-time autoplay only when Voice is on and the relevant section is incomplete
  - generic correct/try-again voice cues through `FeedbackBanner`
  - local non-persisted play tokens so old saved feedback does not speak again on resume
- Added theme-specific voice script override support in theme packs, while preserving safe fallback clips.
- Added a global button tap sound in `src/utils/uiSound.ts`, wired once from `AppShell`, plus the existing final-completion tada in `src/utils/completionSound.ts`.
- Ran parallel `review-lesson` agents for Lessons 1–5 focused on theme/UI gaps, then integrated the common findings:
  - more UI state tokens were needed
  - Lesson 4 needed `lesson-screen--themed` roots
  - Lesson 4/5 spinner and meter chrome still leaked royal/purple/white
  - feedback error, voice status, selected, disabled, and input/focus states needed theme variables
- Updated `review-lesson`, `COMMON_MISTAKES.md`, `roadmap/update-lesson-theme.md`, and `roadmap/voice/voice-progress.md` with voice and theme-state review rules.

## Major QA Lessons Learned

- Do not reveal answers immediately before a challenge.
- Gate progression on correct answers and required visual state.
- Make visuals genuinely interactive, not just static text/buttons.
- Spinner visuals must have fixed pointers, aligned sectors/labels, one-direction spin, and random landing when appropriate.
- Keep arithmetic scaffolded for the 3rd-grade learner.
- Preserve per-lesson progress isolation.

## Recent Fixes

- Fixed Lesson 1 challenge gating and Anchor Trick resume.
- Fixed Lesson 2 visualization gating.
- Fixed answer leakage in Lessons 3–5.
- Rebuilt Lesson 5 spinner visuals as true circular spinners with random landing sectors.
- Added duplicate-answer blocking for typed challenges and Lesson 4 multiple-choice challenges.
- Added generic `sectionState` persistence so newer lesson answers, page indices, solved gates, and key visual work survive home/re-entry.
- Fixed lesson reset so saved `sectionState` is actually cleared and pending debounced outfit saves cannot restore old outfits.
- Updated README/progress docs to reflect the multi-lesson app, agent workflow, and AI theme-pack roadmap.
- Updated Lessons 2-5 with active-theme visual colors, labels, motifs, selected states, and theme-aware in-lesson chrome.
- Added shared pressed/selected button feedback so pale lesson buttons visibly change after a learner clicks them.
- Added a Cartesia-first voice roadmap and the first local voice contract module with theme voice profiles, Lesson 1 clip keys, safety validation, cache keys, and fallback response helpers.
- Added a Firebase callable scaffold for Cartesia voice clips, Cloud Storage MP3 caching, client fallback handling, and the first opt-in Lesson 1 voice button with captions.
- Added persisted `voiceEnabled` profile preference and a shared app-header Voice On/Off toggle so narration stays opt-in.
- Expanded opt-in voice buttons to Lesson 1 Anchor Trick, Lesson 1 shoes challenge, Lesson 1 shortcut summary, Lesson 4 spinner intro, and Lesson 5 sample-space/fairness intros.
- Added one-time autoplay for instruction/tip voice clips when Voice is on, while keeping shortcut-style narration manual and replayable.
- Added generic correct/try-again voice cues for Lesson 1, Lesson 4, and Lesson 5 challenge feedback so spoken feedback supports the written message without repeating it.
- Expanded voice to Lessons 2 and 3, added the missing Lesson 5 screen 2 voice hook, and mirrored all new clip keys in the client and Functions catalogs.
- Fixed Lesson 2 resubmission after visual proof: a correct number entered before finishing the visual no longer gets blocked as a duplicate once the visual proof is complete.
- Clarified Lesson 2 feedback so learners know their answer is correct but they still need to click/build all visual proof orders.
- Reworked Lesson 1 non-dress character rendering toward generated inline SVG primitives with explicit color slots instead of brittle path tweaks.
- Added shared theme state tokens and themed CSS overrides after the cross-lesson theme review loop.
- Adjusted Lesson 4 and Lesson 5 spinner labels farther from the center hub.
- Swapped the app header order so Home appears before the Voice On/Off toggle inside lessons.
- Added global enabled-button tap sounds.

## Current Status

- Lessons 1–5 exist in the registry.
- Lesson 1 supports validated manual theme packs and has AI generation code behind a safe fallback path.
- Lessons 6–10 appear as coming-soon placeholders through Home Hub pagination.
- Latest `npm run lint` and `npm run build` pass after the voice, sound, and cross-lesson theme-state pass.
- Vite still reports the existing large chunk warning.
- Live Firebase site may need redeploy to include recent curriculum and theme changes.
- Voice work has a server/client scaffold and Lesson 1-5 UI integration; real Cartesia generation still needs full emulator/deploy QA, cache-rights confirmation, Storage behavior confirmation, and selected production voice IDs.
- Shared per-lesson theme-pack contracts for Lessons 2–5 remain future architecture work; today’s implementation uses bridge helpers plus shared theme-state tokens.

## Next

- Manual smoke-test Lessons 1–5 in the browser.
- Manually smoke-test the Lesson 1 theme flow, including fallback, generated theme validation, cached theme reload, and unchanged math answers.
- Manually smoke-test the Lesson 1 hint flow, including fallback behavior and wrong-answer retry.
- Manually read through Lesson 1 in Royal and Space themes to verify color, copy, capitalization, and astronaut visuals.
- Manually inspect Lesson 1 Dinosaur/Animal/Sports/Surprise character visuals for outfit quality, hat placement, pants/shirt layering, and selected-item color changes.
- Manually test every theme picker option to verify colors, motifs, labels, hub cards, and Lesson 2-5 local theme copy/change as expected.
- Manually smoke-test Voice Off/Voice On across Lessons 1–5, including captions, autoplay gating, fallback audio, and feedback cue timing.
- Decide whether to add dedicated `Lesson2ThemePack`, `Lesson3ThemePack`, `Lesson4ThemePack`, and `Lesson5ThemePack` contracts instead of deriving later lessons from the Lesson 1 theme pack.
- Add a Vitest suite for core logic and registry integrity.
- Run `review-lesson` before major demos.
