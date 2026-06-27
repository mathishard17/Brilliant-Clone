# Phase 5: Animation And Interaction Polish

## Goal

Add purposeful animation that reveals mathematical structure and makes the app feel alive.

## Animation Principles

- Motion should clarify state.
- Motion should reveal grouping, matching, repeated jumps, arrays, or probability outcomes.
- Motion should not delay progress saving or answer submission.
- Reduced-motion preferences should be respected.

## Likely Files

- `src/screens/screens.css`
- `src/index.css`
- `src/components/`
- `src/lessons/lesson2/screens.tsx`
- `src/lessons/lesson3/screens.tsx`
- `src/lessons/lesson4/screens.tsx`
- `src/lessons/lesson5/screens.tsx`

## Implementation Slices

1. Add reduced-motion CSS guardrails.
2. Add duplicate-choice wiggle states.
3. Add snap/glow states for completed sets.
4. Add graph unlock pulse animations.
5. Add spinner tick/settle polish.
6. Add tray/card slide-in animations for sample-space and grouping visuals.

## Parallel Agent Plan

- Agent A: Reduced-motion foundation
  - Audit existing animation/transitions.
  - Propose global `prefers-reduced-motion` rules.
- Agent B: Lesson 2 motion slice
  - Add or propose ordering-specific feedback motion such as duplicate wiggle and valid-order snap.
- Agent C: Lesson 3 motion slice
  - Add or propose grouping/container motion that emphasizes "same group, different order."
- Agent D: Lesson 4 motion slice
  - Add or propose spinner tick, sector highlight, and outcome settle states.
- Agent E: Lesson 5 motion slice
  - Add or propose sample-space card slide, fairness meter fill, and review reveal motion.
- Agent F: Graph hub motion slice
  - Add or propose node unlock pulses and edge light-up behavior.
- Parent/integrator:
  - Owns shared CSS tokens, reduced-motion policy, duplicate animation naming, and final interaction QA.

## Done When

- Animations support the learning state.
- No animation blocks interaction.
- Reduced-motion mode remains usable.
- `npm run lint` passes.
- `npm run build` passes.

## Manual QA

- Test every lesson with normal motion.
- Test with reduced motion enabled.
- Confirm wrong/correct/duplicate states are visually distinct.
