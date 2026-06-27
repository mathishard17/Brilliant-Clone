# Phase 4: Lesson Rollout And QA

Goal: expand voice from the first Lesson 1 clip to a small, polished set of theme-matched lesson moments.

Status: first expanded rollout present. Lesson 1, Lesson 4, and Lesson 5 now have a small set of opt-in voice buttons. Manual QA remains before adding more.

## Rollout Order

1. Lesson 1 pilot clips.
2. Lesson 4 spinner/probability clips.
3. Lesson 5 sample-space/fairness clips.
4. Lessons 2-3 only after the voice pattern feels useful and not noisy.

## Lesson 1 Pilot

Add only a few clips first:

- [x] welcome/closet intro
- [x] Anchor Trick intro
- [x] shoes challenge intro
- [x] shortcut summary intro
- [x] generic correct-answer cue
- [x] generic try-again cue
- [ ] completion celebration

Keep challenge answers and equations text-only until reveal timing is proven.

## Lessons 4-5 Gate

Before adding more voice to spinner lessons:

- manually smoke-test spinner labels and icons for every manual theme
- confirm labels like `Silver Helmet` do not show royal icons or stale `Crown` labels
- confirm spinner voice scripts use themed labels from the same display map as the UI
- confirm probability/fairness explanations do not reveal answers before the challenge gate

## QA Checklist

For each voiced clip:

- autoplay is used only when the clip is an instruction or tip that helps at page entry
- answer feedback clips are short generic cues, not the same text as the written feedback
- theme voice matches the active theme
- caption matches the spoken content
- no answer leakage before the UI allows it
- clip still makes sense if the learner replayed it after answering
- audio failure does not block the lesson
- mobile/iPad controls are tappable
- reset/resume does not replay audio unexpectedly

## Review Workflow

Use `review-lesson` after each voiced lesson batch. Add reusable voice mistakes to `.agents/skills/review-lesson/COMMON_MISTAKES.md` if the review finds patterns such as answer leakage, stale themed labels, or inaccessible playback controls.

## Done When

- [x] Lesson 1 has a small polished voice pilot
- [x] voice can be enabled/disabled reliably
- [x] Lessons 4-5 have only safe intro/tip clips
- [x] captions are present for every clip
- [ ] lint/build pass
- [ ] manual smoke test passes across all manual themes selected for the rollout
