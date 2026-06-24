# Manual QA Checklist

Use this before demos, deploys, or major refactors. Focus on real bugs and awkward learner moments, not new feature ideas.

## Setup

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start local app with `npm run dev`.
- [ ] Test at desktop width.
- [ ] Test at phone/narrow width.
- [ ] Test at tablet/iPad-ish width.

## Auth And Hub

- [ ] New user can sign up with username, password, and princess name.
- [ ] Returning user can log in.
- [ ] Wrong login shows friendly error.
- [ ] Duplicate username shows friendly error.
- [ ] Hub shows Lessons 1-5.
- [ ] Completed lessons show completed badge.
- [ ] Reset confirmation appears before clearing a lesson.
- [ ] Reset affects only the selected lesson.
- [ ] Sign out returns to registry.

## Per-Lesson Smoke Test

For each lesson:

- [ ] Enter from hub.
- [ ] Lesson title appears above progress bar.
- [ ] Progress bar labels match the lesson sections.
- [ ] Back button goes to the previous section or hub.
- [ ] Home button returns to hub.
- [ ] Re-enter resumes in the expected section.
- [ ] Finish returns to hub.
- [ ] Reopening completed lesson lands on final section.
- [ ] Reset clears the lesson and starts fresh.

## Challenge Behavior

For every challenge:

- [ ] Empty input cannot submit.
- [ ] First wrong answer gives gentle feedback.
- [ ] Repeating the same wrong answer is blocked or called out.
- [ ] Second/new wrong answer gives more helpful feedback.
- [ ] Correct answer is bolded in feedback/solution.
- [ ] Continue/Next appears only when appropriate.
- [ ] Challenge body does not reveal the exact answer before the prompt.

## Visual Interaction

- [ ] Visuals require meaningful action: place, sort, spin, repaint, reveal, or build.
- [ ] Visual state matches the math question.
- [ ] Buttons have understandable labels.
- [ ] Tap targets are easy to hit.
- [ ] No visual looks like a static worksheet unless intentionally explanatory.

## Spinner QA

For spinner lessons:

- [ ] Pointer stays fixed at the top.
- [ ] Wheel/rotor spins underneath pointer.
- [ ] Labels sit in the middle of colored sectors.
- [ ] Sector colors match labels.
- [ ] Chance spinner landing is random when using Spin.
- [ ] Spinner rotates in one direction.
- [ ] Spin result matches the highlighted/selected outcome.
- [ ] Sample-space tray updates correctly after spins/taps.
- [ ] Reset buttons clear the intended local state.

## Lesson-Specific Checks

### Lesson 1

- [ ] Outfit pair duplicates are not counted twice.
- [ ] Shoes/triples duplicates are not counted twice.
- [ ] Anchor Trick resumes from saved step.
- [ ] Must answer correctly before continuing from challenge sections.

### Lesson 2

- [ ] Jewel lineups record unique orders.
- [ ] Restricted Ruby-first section marks valid/invalid orders clearly.
- [ ] Identical Ruby section de-dupes visually identical orders.
- [ ] Factorial challenges do not reveal answers first.

### Lesson 3

- [ ] Same Bag Test shows opposite order in Bag A vs Bag B.
- [ ] Treasure bag duplicate pairs are recognized.
- [ ] Counting shortcut reveals solution only after correct answer.

### Lesson 4

- [ ] Spinners visually spin.
- [ ] Fraction answers are not leaked before challenge.
- [ ] Impossible/certain examples are clear.

### Lesson 5

- [ ] Carnival spinner adds spin results to sample-space tray.
- [ ] Reset sample space clears tray.
- [ ] Fairness meter verdict is hidden until challenge is solved.
- [ ] Spinner builder requires both correct answer and fair spinner state.
- [ ] Royal Review spinners are understandable and not chart-like.

## Notes / Bugs Found

Write concrete issues here:

- [ ] 

