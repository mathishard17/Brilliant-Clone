# Phase 4: Real-World Missions

## Goal

Wrap each math node in a real-world mission where the learner uses math to make something happen.

## Mission Structure

Each mission should define:

- mission title
- real-world problem
- why the math helps
- object nouns
- interaction template
- completion consequence
- safe voice intro
- safe hint

## Likely Files

- `src/lessons/lesson1/`
- `src/lessons/lesson2/`
- `src/lessons/lesson3/`
- `src/lessons/lesson4/`
- `src/lessons/lesson5/`
- `src/types/knowledgeGraph.ts`
- `src/themes/themeTypes.ts`
- `roadmap/newdirection/vision.md`

## Implementation Slices

1. Add a mission metadata layer for existing lessons.
2. Retrofit Lesson 1 as the first mission-style example.
3. Update Lessons 2-5 with mission framing without changing answers.
4. Add schema-bridge copy to explain why the math is useful in that context.
5. Keep equations and final answers code-owned.

## Parallel Agent Plan

- Agent A: Lesson 1 mission draft
  - Convert Lesson 1 into the canonical mission example.
  - Keep math logic, gates, and answers unchanged.
- Agent B: Lesson 2 mission draft
  - Draft ordering/permutation mission framing and theme-neutral nouns.
  - Identify copy-only versus code-touch files.
- Agent C: Lesson 3 mission draft
  - Draft grouping/combination mission framing where order does not matter.
  - Call out any wording that could confuse combinations with permutations.
- Agent D: Lesson 4 mission draft
  - Draft spinner/chance mission framing with concrete real-world stakes.
  - Keep probabilities code-owned.
- Agent E: Lesson 5 mission draft
  - Draft fairness/game mission framing and transfer copy.
  - Keep sample-space outcomes and fairness decisions code-owned.
- Agent F: Safety/curriculum review
  - Review all mission drafts for answer leaks, age fit, and math clarity.
- Parent/integrator:
  - Owns shared mission metadata type, final copy merge, lesson registry integration, and verification.

## Done When

- Every existing lesson has a mission frame.
- Mission copy explains a real-world reason for the math.
- No challenge answer is leaked before the learner solves it.
- `npm run lint` passes.
- `npm run build` passes.

## Manual QA

- Read each lesson in at least two themes.
- Confirm missions feel real-world, not decorative.
- Confirm math behavior is unchanged.
