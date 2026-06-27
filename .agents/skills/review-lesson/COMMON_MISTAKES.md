# Common Lesson Mistakes

Use this as a quick review checklist for lesson QA. Add new items only when a pattern is reusable across lessons.

## Core Review Checklist

### Answer Leakage

- Problem copy should not reveal the exact answer immediately before asking for it.
- Worked solutions belong in feedback, post-correct explanations, or later review screens.
- Watch for meters, lists, or equations that reveal the answer before the prompt.

### Challenge Gating

- Continue/Next should appear only after a correct answer when the section is a challenge.
- Visual experiments/builders should support the thinking, not block a correct typed or selected answer, unless the lesson explicitly asks the learner to build the answer itself.
- Do not require learners to enter every permutation, outfit, ordering, bag, or outcome before accepting a correct answer.
- Duplicate answer attempts should be blocked or called out.
- Duplicate-answer guards must not block an intentionally requested resubmit after the learner completes missing visual proof.

### Interaction Quality

- A visual should involve real manipulation: place, sort, spin, repaint, flip, drag, build, reveal, or classify.
- Avoid static diagrams pretending to be interactive.
- Tie visual state to the math question whenever possible.
- Clickable choice buttons should show a clear selected/pressed state, especially when the default button color is white or pale.
- Character/outfit visuals should look intentional: avoid stray limbs, floating hats, detached lines, and lower-body shapes showing through shirts or jackets.
- Reusable character primitives should be polished enough for every theme that uses them.
- Shirts, jerseys, jackets, aprons, and smocks need connected sleeve shapes and enough overlap to hide pants/shorts underneath.
- Adding sleeves should not erase the learner's arms/hands; keep hands visible at sleeve cuffs.
- Avoid using hat/cap accent colors as pants colors before an outfit is selected.
- Do not keep adding SVG detail to a bad silhouette; reset to a simple readable paper-doll body first.
- For recolorable characters, prefer inline SVG primitives with named color slots instead of static image assets or one-off path tweaks.

### Spinner Geometry

- Pointer stays fixed; wheel/rotor moves underneath it.
- Labels sit in the center of colored sectors, not between sectors.
- Sector colors and label positions use the same angle origin.
- Chance spinners should land randomly when they claim to model chance.
- Spinners should rotate one direction unless there is a reason not to.
- Do not fake spinning by swapping rectangular buttons.
- Theme-aware spinner labels and icons should come from the same resolved display map; do not let old short labels like Crown override a themed outcome such as Silver Helmet.

### Progress And Resume

- Do not reset saved progress on mount.
- Completed lessons should reopen on their final section.
- Final completion buttons must never silently no-op. If progress already says the lesson is completed, the button should still route the learner home or show a clear completed state.
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
- Do not assume a specific content theme in reusable lesson components, skill guidance, or shared patterns.

### Theme-Aware Lesson Chrome

- If the Home Hub card title/emoji/description changes with the active theme, the in-lesson title chrome should use the same resolved theme display instead of the registry's royal fallback title.
- Lesson-local headings, button labels, feedback, and visual colors should not silently stay royal for non-royal theme preferences.
- Theme visuals should use active theme tokens for backgrounds, borders, buttons, hints, and success states while keeping math, answers, gates, and progress keys code-owned.
- Review error, warning, info/status, selected, disabled, input/focus, spinner, meter, and diagram surfaces too; happy-path panel/button colors are not enough.

### Voice Support

- Voice must stay opt-in: use `profile.voiceEnabled`, keep replay controls disabled when Voice is off, and never autoplay without an explicit enabled preference.
- Every client clip key in `src/voice/voiceClips.ts` must be supported by the Vercel voice API route/catalog; otherwise the request falls back or fails.
- Safe-before-answer voice clips must not reveal answers, exact counts, equations, or number words that shortcut the learner's task.
- Feedback voice should use short generic success/try-again clips, not read the full visible feedback or solution.
- Feedback voice needs a local, non-persisted `playToken` incremented only on fresh answer submissions so saved banners do not speak again on resume.
- Captions should remain available even when audio generation falls back or the API/cache is unavailable.

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

