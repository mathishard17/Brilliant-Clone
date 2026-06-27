# Phase 1: Knowledge Graph Model

## Goal

Define the stable data model for math nodes, graph edges, context badges, and mastery state.

## Core Concepts

- `KnowledgeNode`: a stable math concept such as counting choices, ordered arrangements, chance, or fairness.
- `KnowledgeEdge`: a relationship between concepts.
- `NodeMasteryState`: per-user progress for a node across contexts/themes.
- `WorldLens`: the active theme layer over the graph.

## Likely Files

- `src/types/knowledgeGraph.ts`
- `src/lessons/registry.ts`
- `src/services/userProgress.ts`
- `src/types/user.ts`
- `firestore.rules`
- `roadmap/newdirection/vision.md`

## Implementation Slices

1. Create typed graph models.
2. Define the initial graph for the current five lessons.
3. Add derived mastery helpers that read existing lesson progress.
4. Decide what is persisted now versus derived for compatibility.
5. Update Firestore profile types only if persistence is needed in this phase.

## Parallel Agent Plan

- Agent A: Graph schema proposal
  - Draft TypeScript interfaces for nodes, edges, contexts, and mastery state.
  - Return a proposed file shape for `src/types/knowledgeGraph.ts`.
- Agent B: Curriculum graph proposal
  - Map current Lessons 1-5 into conceptual nodes and edges.
  - Identify missing future nodes such as arrays, skip counting, bundling, and estimation.
- Agent C: Persistence risk review
  - Review Firestore/user profile implications.
  - Recommend derived-first versus persisted-first strategy.
- Agent D: Validation/test proposal
  - Propose unit tests for graph IDs, edge validity, and lesson registry alignment.
- Parent/integrator:
  - Owns final `src/types/knowledgeGraph.ts`, user profile shape decisions, Firestore rules, and compatibility helpers.

## Done When

- [x] Current lessons map to graph nodes.
- [x] Graph edges are deterministic and code-owned.
- [x] AI cannot modify node IDs or prerequisites.
- [x] Existing profiles still load.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.

## Implementation Status

- Code-present as of the graph Home Hub pass.
- `src/types/knowledgeGraph.ts` defines `KnowledgeNode`, `KnowledgeEdge`, `NodeMasteryState`, and deterministic current/future graph nodes.
- Mastery is derived from existing `LessonProgress` instead of persisted separately.
- Unlock rules:
  - `isStarter` nodes (`counting_choices`, `chance_as_fraction`) are available immediately when their lesson exists.
  - Other nodes unlock only when every `unlockedBy` prerequisite is `mastered`.
  - Locked nodes cannot be opened from the graph detail panel or manage-page lesson list.
- Future nodes are represented as locked/coming-soon graph nodes until their lessons exist.

## Manual QA

- Test an old profile.
- Test a new profile.
- Confirm all five lessons still appear and can be entered.
