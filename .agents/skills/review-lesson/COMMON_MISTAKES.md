# Common Lesson Mistakes

Use this as a quick review checklist for lesson QA. Add new items only when a pattern is reusable across lessons.

## Core Review Checklist

### Answer Leakage

- Problem copy should not reveal the exact answer immediately before asking for it.
- Worked solutions belong in feedback, post-correct explanations, or later review screens.
- Watch for meters, lists, or equations that reveal the answer before the prompt.

### Challenge Gating

- Continue/Next should appear only after a correct answer when the section is a challenge.
- If a visual builder is part of the task, the required visual state should be correct too.
- Duplicate answer attempts should be blocked or called out.

### Interaction Quality

- A visual should involve real manipulation: place, sort, spin, repaint, flip, drag, build, reveal, or classify.
- Avoid static diagrams pretending to be interactive.
- Tie visual state to the math question whenever possible.

### Spinner Geometry

- Pointer stays fixed; wheel/rotor moves underneath it.
- Labels sit in the center of colored sectors, not between sectors.
- Sector colors and label positions use the same angle origin.
- Chance spinners should land randomly when they claim to model chance.
- Spinners should rotate one direction unless there is a reason not to.
- Do not fake spinning by swapping rectangular buttons.

### Progress And Resume

- Do not reset saved progress on mount.
- Completed lessons should reopen on their final section.
- Use `progressSteps.length`, not hardcoded section counts.
- Updating one lesson must not mutate another lesson's progress.

### Difficulty Fit

- Keep arithmetic small or scaffolded for the learner defined in `.agents/theme.md`.
- Introduce formal terms after concrete examples.
- Avoid too many new terms in one section.
- Be careful with large factorials, decimals, percentages, or formulas.

### Plan Alignment

- Compare against `roadmap/lesson-plans/lessonN-plan.md`.
- Check that planned interactions, challenge questions, answers, and feedback exist.
- Note deliberate deviations instead of silently simplifying.
- Keep the theme from `.agents/theme.md` unless the plan says otherwise.

### Persistence Decisions

- Decide whether local state is just practice or meaningful progress.
- Consider persistence for discovered orderings, built spinners, sorted cards, or other work a student may expect to resume.
- Challenge answers, correctness, wrong attempts, page index, and solved gates should usually persist when leaving and returning to a lesson.
- Visualized problems should save meaningful discovered/worked state, not just the final section number.
- Returning home and re-entering a lesson is a required persistence test, not just page refresh.
- Reset must clear saved `sectionState`; an empty reset object should not merge with old state.
- Cancel pending debounced saves before reset so stale writes do not restore old progress.
- Avoid over-persisting every tap.

## Preferred Fix Pattern

1. Fix correctness/gating first.
2. Move answer reveals into feedback.
3. Improve the visual interaction.
4. Simplify or scaffold difficult arithmetic.
5. Run `npm run lint` and `npm run build`.

