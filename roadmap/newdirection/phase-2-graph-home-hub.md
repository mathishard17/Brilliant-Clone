# Phase 2: Graph Home Hub

## Goal

Replace or augment the current Home Hub lesson list with a neural knowledge graph where nodes light up as the learner progresses.

## Experience

The learner should feel like they are lighting up a math brain map, not checking off a list.

Updated UI direction:

- Treat the graph as a sleek black neon schema board.
- Use small dots and thin glowing lines, not bulky lesson cards, inside the board.
- Keep the board view focused: compact title, one hint line, graph map, then node detail on selection.
- Schema summary cards and full node lists live off the main board (manage page / future help panel).
- Node glow states: dim locked, pulsing available/in progress, brightest mastered.
- The current five-lesson curriculum builds one `Counting + Probability` schema.
- Future math areas should become separate schema circuits with their own neon colors.
- Hover/focus reveals node content; click/tap selects the dot and preserves lesson entry.

## Likely Files

- `src/screens/HomeHub.tsx`
- `src/screens/homeHubDisplay.ts`
- `src/screens/screens.css`
- `src/components/KnowledgeGraphHub.tsx`
- `src/components/KnowledgeNodeCard.tsx`
- `src/components/KnowledgeEdgePath.tsx`
- `src/types/knowledgeGraph.ts`

## Implementation Slices

1. Build a static graph hub component using current lesson status.
2. Render SVG or CSS-based edges between nodes.
3. Add node states: locked, available, in progress, mastered.
4. Add theme/context badges around nodes.
5. Keep list view as fallback or accessible alternative.
6. Add a node detail panel that opens the existing lesson.

## Parallel Agent Plan

- Agent A: Layout prototype
  - Propose a static node/edge layout for phone and tablet.
  - Return coordinates, responsive behavior, and visual states.
- Agent B: Accessibility review
  - Design keyboard navigation, focus order, labels, and fallback list behavior.
  - No edits until parent approves.
- Agent C: Component slice
  - Implement or propose isolated `KnowledgeNodeCard` and `KnowledgeEdgePath` components only.
- Agent D: Theme styling slice
  - Propose CSS variables and animations for node glow, edge pulse, and context badges.
- Agent E: QA matrix
  - Draft manual QA cases for incomplete, in-progress, and mastered profiles across all themes.
- Parent/integrator:
  - Owns `HomeHub.tsx` integration, routing into lessons, shared graph state helpers, global CSS placement, and final verification.

## Done When

- [x] Home Hub can show the graph.
- [x] Current lesson entry still works.
- [x] Mastered/completed lessons visibly glow.
- [x] Locked/future lessons remain understandable.
- [x] Keyboard navigation works.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.

## Implementation Status

- Code-present as of the graph Home Hub pass.
- Added `KnowledgeGraphHub`, `KnowledgeNodeCard`, and `KnowledgeEdgePath`.
- Home Hub board view is graph-first; theme/lesson list moved to a separate manage page.
- Graph states use derived lesson progress: locked, available, in progress, and mastered.
- Starter nodes (`counting_choices`, `chance_as_fraction`) are available on day one so learners can begin with themed outfit counting or chance spinners.
- Adjacent nodes unlock only after all listed prerequisite nodes are mastered.
- Locked nodes show a disabled Open action and cannot be entered from the graph or manage list.

## Manual QA

- Test on phone width.
- Test on iPad/desktop width.
- Test with completed and incomplete profiles.
- Test every theme preference.
