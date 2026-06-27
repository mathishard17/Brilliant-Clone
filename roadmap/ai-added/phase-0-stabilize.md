# Phase 0 — Stabilize Current App

## Objective

Freeze a reliable baseline before adding AI. This phase does not add features.

## Why

AI personalization will touch profile data, lesson rendering, and Firebase. The current multi-lesson app should be clean before adding another layer.

## Agent Plan

Run sequentially, not in parallel:

1. Parent agent runs static verification.
2. Optional `review-lesson` agents review Lessons 1-5.
3. Parent agent applies only critical fixes.

## Checklist

- [x] `git status` is clean or intentional changes are committed/stashed.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] Manual QA checklist exists at `roadmap/manual-qa.md`.
- [ ] Current lessons 1-5 enter from hub.
- [x] Reset clears answers/progress.
- [x] Returning home and re-entering preserves expected progress.

## Tests / Verification

- [x] Lint.
- [x] Build.
- [ ] Manual smoke test for Lesson 1 and one newer lesson.

## Done When

The project has a clean baseline commit/branch for AI work.

