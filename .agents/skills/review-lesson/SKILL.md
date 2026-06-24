---
name: review-lesson
description: Reviews implemented lessons in this Brilliant-style curriculum app. Use when the user asks to review, try, audit, QA, evaluate, or compare a lesson against its lesson plan, including learning outcomes, mistakes, difficulty fit, and plan alignment.
---

# Review Lesson

Use this skill to review an implemented lesson against its plan and learning goals.

## Read First

- `.agents/skills/review-lesson/COMMON_MISTAKES.md`
- `src/lessons/registry.ts`
- `src/lessons/lessonN/copy.ts`
- `src/lessons/lessonN/screens.tsx`
- `roadmap/lesson-plans/lessonN-plan.md` if present
- relevant shared components/types/CSS if needed
- `.agents/theme.md`

## Review Checklist

Check:

- lesson title, concept, section count, and registry wiring
- plan alignment: sections, interactions, challenges, feedback
- what the student actually learns
- answer leakage before prompts
- challenge gating and duplicate-answer behavior
- interaction quality and accessibility
- difficulty fit for the current learner persona/theme in `.agents/theme.md`
- progress, resume, reset, and completion behavior
- local state that may need persistence

Run `npm run lint` and `npm run build` when code changed or user asks.

## Update Common Mistakes

If user feedback or review findings reveal a reusable lesson mistake, update `.agents/skills/review-lesson/COMMON_MISTAKES.md`. Avoid duplicates and one-off nits.

## Review Output Format

Use this structure:

```markdown
# Lesson Review: [Lesson Title]

## Summary
[2-4 sentence overview.]

## What The Student Learns
- ...

## Plan Alignment
- **Matches plan:** ...
- **Partially matches:** ...
- **Missing or changed:** ...

## Interaction Review
- ...

## Difficulty Fit
- **Too easy:** ...
- **Too hard:** ...
- **Just right:** ...

## Mistakes / Risks
1. [Most important issue]
2. ...

## Suggested Improvements
1. [High-impact, low-risk]
2. ...

## Future Improvement Plan

### Quick Wins
- [Small changes that are safe and improve the lesson quickly.]

### Next Iteration
- [Medium changes that improve learning quality, visuals, or flow.]

### Later / Bigger Refactor
- [Larger work that may require new abstractions, shared components, persistence changes, or curriculum design.]

### Recommended Order
1. [First thing to do and why]
2. [Second thing to do and why]
3. [Third thing to do and why]

## Verification
- `npm run lint`: [pass/fail/not run]
- `npm run build`: [pass/fail/not run]

## Manual Smoke Test
1. Enter Lesson [N] from the hub.
2. ...
```

Lead with the most important findings. Do not bury bugs under praise.

## Guardrails

- Review only unless the user explicitly asks for fixes.
- Do not modify lesson code during a review unless asked.
- Do not deploy during a review.
- Do not rewrite the lesson plan unless asked.

