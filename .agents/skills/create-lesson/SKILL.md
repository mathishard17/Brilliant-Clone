---
name: create-lesson
description: Creates new lessons for this Brilliant-style React/Firebase curriculum app. Use when the user asks to create, plan, implement, scaffold, or add a lesson, lesson plan, interactive visual, clickthrough mini lesson, or visualized problem in this repository.
---

# Create Lesson

Use this skill to add a new lesson to this curriculum app.

## Required Inputs

- lesson number / id
- matching `roadmap/lesson-plans/lessonN-plan.md`
- target concept, persona, and section count

If `lessonN-plan.md` is missing, stop and ask whether to create it first.

## Read First

- `roadmap/lesson-plans/lessonN-plan.md`
- `src/lessons/registry.ts`
- `src/lessons/lesson1/` and `src/lessons/lesson2/` as examples
- `src/types/lesson.ts`
- `src/components/ClickthroughMiniLesson.tsx`
- `src/components/ChallengeQuestion.tsx`
- `src/screens/screens.css`
- `.agents/theme.md`

## Lesson Creation Workflow

1. Create `src/lessons/lessonN/`.
2. Add `copy.ts` for text, prompts, answers, and feedback.
3. Add `screens.tsx` for React screens and lesson-local visuals.
4. Add `data.ts` only if reusable static data is needed.
5. Update `src/lessons/registry.ts` with metadata, `progressSteps`, and screen map.
6. Update shared types/CSS only when necessary.
7. Run `npm run lint` and `npm run build`.

## Important Guardrails

- Do not edit existing lessons unless explicitly asked.
- Do not let parallel lesson subagents edit shared files directly; parent/integrator should own `registry.ts`, shared types, and broad CSS.
- Keep answers hidden until the learner has a chance to think.
- Prefer visuals that move, fill, sort, spin, drag, place, flip, reveal, or change state.
- Read `.agents/theme.md` and preserve the current learner persona/theme.
- Avoid universal exercise engines until patterns repeat.
- Do not touch Firebase rules or persisted data shape unless the lesson requires new saved state.
- Do not deploy unless the user explicitly asks.

## Done Checklist

- [ ] `progressSteps.length` equals registered screens count.
- [ ] Correct answers are not revealed before prompts.
- [ ] Wrong answers use gentle feedback before detailed hints.
- [ ] Interaction is more than static text/buttons.
- [ ] New lesson progress is isolated from other lessons.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Summary Format

- Files created
- Files changed
- Lesson flow
- Verification results
- Manual smoke-test steps

