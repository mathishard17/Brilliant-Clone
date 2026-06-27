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
- Changed progress storage to use `activeLessonId` and `lessons: Record<string, LessonProgress>` only; the original one-lesson `lesson` compatibility field is no longer read or written.
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
- Added Vercel API generation code for Lesson 1 theme packs, including validation, fallback behavior, caching, and server-side OpenAI calls.
- Added optional Coach Hints with safe JSON validation, fallback hints, and a server-side second-pass safety review for generated hints.
- Added theme visual identity, including distinct Royal/Space color schemes and an astronaut-style Space character.
- Added bounded flexible copy slots so themes can change headings, transitions, and summary language while equations and answers stay code-owned.
- Added full theme visual tokens for buttons, hints, success states, and motif shapes.
- Added manual Dinosaur, Animal, Sports, and Surprise theme fallbacks.
- Added bounded `characterConfig` presets and reusable character drawing primitives so Lesson 1 can render explorer/helper/athlete/studio outfits, not just recolored princess dresses.
- Made the login/signup copy theme-neutral and updated the Home Hub title/cards/emoji sets to reflect the active theme.
- Added lesson-local theme bridges for Lessons 2–5 while shared per-lesson theme-pack contracts remain future work.
- Expanded the shared theme visual contract with optional UI state tokens for error, warning, status, selected, disabled, input/focus, diagram, spinner, meter, neutral, and dialog-like surfaces.
- Mapped those theme tokens into CSS variables and applied them to shared feedback, voice status, inputs, selected states, clickthrough dots, Lesson 4 spinners, and Lesson 5 tray/meter/spinner review surfaces.
- Current AI roadmap status: OpenAI-backed hints, graph Feedback summaries, and generated theme packs now run through Vercel-style API routes in `api/`. Manual AI smoke validation and browser testing are still needed before demo/deploy.

## Voice, Sound, And Theme Review Loop

- Added a voice layer that keeps provider calls behind a Vercel API route:
  - client voice catalog and request validation live in `src/voice/`
  - browser code calls `/api/get-voice-clip`
  - `api/get-voice-clip.js` calls Cartesia server-side and returns MP3 data URLs when audio is available
  - local development serves `/api` through the Vite middleware used by `npm run dev`
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
- Gate progression on correct answers; visual experiments should scaffold thinking, not require every outfit, ordering, bag, or outcome before accepting a correct answer.
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
- Added a Cartesia-first voice roadmap and voice contract modules with theme voice profiles, clip keys, safety validation, and fallback response helpers.
- Added a Vercel API route for Cartesia voice clips, client fallback handling, and opt-in voice buttons with captions.
- Added persisted `voiceEnabled` profile preference and a shared app-header Voice On/Off toggle so narration stays opt-in.
- Expanded opt-in voice buttons to Lesson 1 Anchor Trick, Lesson 1 shoes challenge, Lesson 1 shortcut summary, Lesson 4 spinner intro, and Lesson 5 sample-space/fairness intros.
- Added one-time autoplay for instruction/tip voice clips when Voice is on, while keeping shortcut-style narration manual and replayable.
- Added generic correct/try-again voice cues for Lesson 1, Lesson 4, and Lesson 5 challenge feedback so spoken feedback supports the written message without repeating it.
- Expanded voice to Lessons 2 and 3, added the missing Lesson 5 screen 2 voice hook, and mirrored all new clip keys in the client/server voice catalogs.
- Fixed Lesson 2 resubmission after visual proof: a correct number entered before finishing the visual no longer gets blocked as a duplicate once the visual proof is complete.
- Updated Lesson 2 feedback/progression so the visual proof supports the explanation without blocking a correct typed answer.
- Reworked Lesson 1 non-dress character rendering toward generated inline SVG primitives with explicit color slots instead of brittle path tweaks.
- Added shared theme state tokens and themed CSS overrides after the cross-lesson theme review loop.
- Adjusted Lesson 4 and Lesson 5 spinner labels farther from the center hub.
- Swapped the app header order so Home appears before the Voice On/Off toggle inside lessons.
- Added global enabled-button tap sounds.
- Implemented the first `roadmap/newdirection` bridge: lessons now map to stable knowledge graph node IDs, graph mastery derives from existing lesson progress, and Home Hub renders a themed neural graph overlay above the existing lesson list.
- Refined the new-direction Home Hub into a black neon schema board: the current Lessons 1-5 build one Counting + Probability schema, with schema-colored dots, glowing lines, hover/focus content, and schema brightness meters.
- Added graph node Feedback for in-progress, completed, and mastered nodes only; Feedback opens from the node detail panel and regenerates automatically when the learner's progress/context cache key changes.
- Migrated AI hint generation, AI theme generation, graph Feedback summaries, and Cartesia voice generation off Firebase Cloud Functions and onto Vercel-style API routes.
- Removed the original one-lesson profile compatibility field from app reads/writes. User progress now lives only in `users/{uid}.lessons[lessonId]`.
- Fixed shared Firestore save payload cleanup so `undefined` values from optional memory/progress fields do not trigger the generic "Couldn't save your progress" banner.
- Updated Coach Hint behavior: generated hints may include helpful non-answer numbers, but a second OpenAI safety check rejects direct answer reveals; hint UI resets when moving to a new problem and shows dev-only fallback reasons.
- Standardized Lesson 1 create-outfit wording so instructions, prompts, voice clips, fallback themes, and graph copy say "outfits" instead of "looks/styles" for the outfit-building flow.
- Changed Lessons 1, 2, 3, and 5 so visual experiments are optional scaffolds: correct typed answers unlock Continue without requiring all outfits, orderings, bags, tray entries, or repaint states first. Lesson 4 already followed this rule.
- Polished Lesson 1 non-dress character rendering by simplifying the casual shirt body and removing unnecessary decorative torso shapes.

## Current Status

- Lessons 1–5 exist in the registry.
- Lesson 1 supports validated manual theme packs and has Vercel-backed AI generation code behind a safe fallback path.
- Lessons 6–10 appear as coming-soon placeholders through Home Hub pagination.
- Home Hub now includes a black neon knowledge graph for Lessons 1-10; Lessons 1-5 derive active/mastered states from existing progress and Lessons 6-10 remain locked coming-soon nodes.
- Knowledge Graph node Feedback is present locally, gated to in-progress/completed/mastered nodes, and keyed by node, status, progress ratio, tried contexts, lesson title, and active theme.
- Latest `npm run build` passes after the optional-visual-gating, Coach Hint safety, Firestore save, and Lesson 1 outfit wording updates.
- Vite still reports the existing large chunk warning.
- Live Firebase site may need redeploy to include recent curriculum and theme changes.
- Voice work has Lesson 1-5 UI integration and a Cartesia-backed Vercel API route; production voice still needs deploy QA and selected production voice IDs.
- Shared per-lesson theme-pack contracts for Lessons 2–5 remain future architecture work; today’s implementation uses bridge helpers plus shared theme-state tokens.

## Next

- Manually smoke-test Lessons 1–5 in the browser, especially that correct answers unlock Continue without exhaustive visual-building.
- Manually smoke-test the Lesson 1 theme flow, including fallback, generated theme validation, cached theme reload, outfit wording, and unchanged math answers.
- Manually smoke-test the Coach Hint flow, including generated hints with non-answer numbers, fallback debug reasons, wrong-answer retry, and reset behavior when moving to a new problem.
- Manually read through Lesson 1 in Royal and Space themes to verify color, copy, capitalization, and astronaut/outfit visuals.
- Manually inspect Lesson 1 Dinosaur/Animal/Sports/Surprise character visuals for outfit quality, hat placement, pants/shirt layering, and selected-item color changes.
- Manually test every theme picker option to verify colors, motifs, labels, hub cards, and Lesson 2-5 local theme copy/change as expected.
- Manually smoke-test Voice Off/Voice On across Lessons 1–5, including captions, autoplay gating, fallback audio, and feedback cue timing.
- Decide whether to add dedicated `Lesson2ThemePack`, `Lesson3ThemePack`, `Lesson4ThemePack`, and `Lesson5ThemePack` contracts instead of deriving later lessons from the Lesson 1 theme pack.
- Manually smoke-test the new Home Hub graph on phone and iPad widths with incomplete, in-progress, completed, and mastered lesson profiles.
- Manually smoke-test Knowledge Graph Feedback opening, cached reuse, and automatic regeneration after progress changes.
- Add a Vitest suite for core logic and registry integrity.
- Run `review-lesson` before major demos.
