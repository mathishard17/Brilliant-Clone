# Phase 0: Current App Bridge

## Goal

Map the current linear app into the future knowledge-graph model without changing user-facing behavior yet.

## Why This Comes First

The app already has five lessons, progress state, theme preference, voice, and lesson-local theme bridges. Before building the graph UI, we need a compatibility layer that says which existing lesson corresponds to which future math node.

## Likely Files

- `src/lessons/registry.ts`
- `src/types/lesson.ts`
- `src/types/user.ts`
- `src/services/userProgress.ts`
- `src/screens/HomeHub.tsx`
- `roadmap/newdirection/vision.md`

## Implementation Slices

1. Add metadata to the lesson registry for conceptual node IDs.
2. Define a read-only mapping from current lesson IDs to future graph node IDs.
3. Add helper functions that can derive graph-like status from existing lesson progress.
4. Keep the current Home Hub rendering unchanged while helpers are introduced.
5. Add documentation for how old lesson progress maps to future mastery state.

## Parallel Agent Plan

- Agent A: Registry audit
  - Read `src/lessons/registry.ts` and report current lesson IDs, titles, progress steps, and concept fit.
  - No edits.
- Agent B: Progress compatibility audit
  - Read `src/types/user.ts` and `src/services/userProgress.ts`.
  - Identify how existing completion/current screen data can derive graph status.
  - No edits.
- Agent C: Home Hub impact audit
  - Read `src/screens/HomeHub.tsx` and `src/screens/homeHubDisplay.ts`.
  - Report what must stay stable while graph helpers are introduced.
  - No edits.
- Parent/integrator:
  - Owns `src/types/lesson.ts`, `src/lessons/registry.ts`, shared helper creation, docs, and verification.

## Done When

- [x] Existing lessons still render from `src/lessons/registry.ts`.
- [x] No Firestore migration is required yet.
- [x] Current lesson completion can be interpreted as node completion.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.

## Implementation Status

- Code-present as of the graph Home Hub pass.
- `LessonDefinition` now includes a stable `graphNodeId`.
- `src/types/knowledgeGraph.ts` maps current lesson progress into derived node mastery state.
- Home Hub still supports lesson entry through the graph and manage-page list, gated by derived unlock state.

## Manual QA

- Complete or reopen each existing lesson.
- Confirm starter nodes (outfit counting + chance spinners) are open on a fresh profile.
- Confirm locked nodes cannot be opened until prerequisite topics are mastered.
- Confirm reset/resume behavior is unchanged for unlocked nodes.
