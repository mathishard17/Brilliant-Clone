---
name: revise-lesson
description: Implements scoped improvements from a review-lesson review. Use when the user asks to revise, improve, fix, iterate on, or loop-review a lesson based on review findings or a Future Improvement Plan.
---

# Revise Lesson

Use this skill to improve an existing lesson after a `review-lesson` style review.

Turn review findings into safe, scoped changes, then verify the app still works.

## Inputs

- lesson number/id
- `review-lesson` output
- review’s Future Improvement Plan
- `roadmap/lesson-plans/lessonN-plan.md`

If no review exists, run/request `review-lesson` first unless the user explicitly asks for a direct fix.

## Read

- `.agents/skills/review-lesson/SKILL.md`
- `src/lessons/registry.ts`
- `src/lessons/lessonN/copy.ts`
- `src/lessons/lessonN/screens.tsx`
- `roadmap/lesson-plans/lessonN-plan.md`
- `.agents/theme.md`

## Revision Workflow

1. Pick 1-3 related findings. Prioritize correctness, answer leakage, gating, completion/resume, missing plan requirements, then polish.
2. Keep changes in `src/lessons/lessonN/` when possible.
3. Touch shared files only for shared bugs or needed CSS/types.
4. Preserve the current learner persona/theme from `.agents/theme.md`.
5. Run `npm run lint` and `npm run build`; fix failures and rerun.
6. Summarize addressed findings, files changed, verification, and remaining issues.

## Looping With Review-Lesson

To iteratively improve a lesson:

1. Run `review-lesson` for Lesson N.
2. Use `revise-lesson` to implement one scoped batch from the review.
3. Run lint/build.
4. Run `review-lesson` again.
5. Stop when:
   - no critical/high-impact findings remain
   - the next improvements require a broader design decision
   - lint/build fails and the fix is not obvious
   - the user-specified max number of cycles is reached

Never create an unbounded loop.

- Default: **1 review + 1 revision**.
- Maximum normal loop: **2-3 cycles total**, only if explicitly requested.
- If user says “keep going,” still state a finite stopping point first.
- Stop when no high-impact issues remain, remaining work is risky/architectural, lint/build fails, cycle limit is reached, or user judgment is needed.

## Safe Loop Prompt Example

```text
Review Lesson 3 with review-lesson. Then use revise-lesson to implement the top 2 quick wins only. Run lint/build. Repeat for at most 2 cycles total, then stop and summarize remaining issues.
```

## Output Format

```markdown
# Lesson Revision: [Lesson Title]

## Addressed Findings
- ...

## Changes Made
- ...

## Files Changed
- ...

## Verification
- `npm run lint`: pass/fail
- `npm run build`: pass/fail

## Remaining Issues
- ...

## Suggested Next Revision
1. ...
```

## Guardrails

- Review first, revise second.
- One lesson at a time.
- One small batch at a time.
- No infinite loops.
- Always state and obey a finite cycle limit.
- Keep improvements traceable to review findings.
- Do not silently broaden scope.
- Do not deploy unless explicitly asked.

