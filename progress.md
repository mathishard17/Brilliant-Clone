# Project Progress

Concise milestone log for **Royal Academy — Counting Adventures**.

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
- `review-lesson/COMMON_MISTAKES.md` — shared QA patterns for future lesson reviews.

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
- Simplified README and progress docs.

## Current Status

- Lessons 1–5 exist in the registry.
- Latest `npm run lint` and `npm run build` pass.
- Vite still reports the existing large chunk warning.
- Live Firebase site may need redeploy to include recent curriculum changes.

## Next

- Manual smoke-test Lessons 1–5 in the browser.
- Add a Vitest suite for core logic and registry integrity.
- Run `review-lesson` before major demos.
