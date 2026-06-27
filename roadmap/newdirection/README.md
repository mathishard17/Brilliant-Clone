# New Direction Roadmap

This folder turns the schema-based learning vision in `vision.md` into an executable roadmap.

## North Star

Move from a linear lesson list to a living knowledge graph where students light up conceptual connections across real-world contexts. AI-generated themes become "world lenses" over stable math nodes, not replacements for the math structure.

## UI North Star

The Home Hub should feel like a sleek neon schema board inside the linear curriculum. The learner is not just opening Lesson 1, Lesson 2, and Lesson 3; they are physically building a long-term-memory network on the board.

- Small neon dots represent atomic math ideas.
- Thin glowing lines represent schema connections forming in memory.
- A whole schema grows brighter as more of its dots are mastered.
- The current curriculum builds one `Counting + Probability` schema across counting choices, order, groups, chance, and fairness.
- Future math areas should become separate schema networks, such as number structure, place value, geometry, measurement, or fractions.
- Hover/focus on a dot reveals the math content; tap/click selects it and opens the existing lesson path.

## Current Status

- Vision document moved to `vision.md`.
- Phases 0-2 are code-present: current lessons map to stable graph node IDs, the deterministic knowledge graph model exists, and Home Hub renders a focused schema-board graph.
- Graph unlock rules are derived from node edges and lesson progress; no Firestore migration required.
- Starter nodes open on day one: **Counting Choices** (themed outfit counting, e.g. expedition looks) and **Chance** (themed spinners, e.g. dinosaur chance spinners).
- Other nodes unlock when all connected prerequisite nodes are mastered.
- Home Hub board view is graph-first; theme/lesson list moved to a separate manage page.
- Phases 3-7 remain future work.

## Phase Order

1. `phase-0-current-app-bridge.md` — map the existing app to the future graph without breaking current lessons.
2. `phase-1-knowledge-graph-model.md` — define nodes, edges, mastery state, and persistence shape.
3. `phase-2-graph-home-hub.md` — replace/augment Home Hub with the neural knowledge graph.
4. `phase-3-world-lens-theme-generator.md` — evolve AI themes into graph-aware world lenses.
5. `phase-4-real-world-missions.md` — add mission framing and schema bridges to lessons.
6. `phase-5-animation-and-interaction-polish.md` — add purposeful motion tied to math states.
7. `phase-6-voice-reflection-and-transfer.md` — add optional metacognitive voice reflection.
8. `phase-7-dedicated-lesson-theme-contracts.md` — graduate later lessons into dedicated theme contracts.

## Implementation Principles

- Code owns math, gates, progress, node IDs, and validation.
- AI owns flavor, real-world contexts, safe copy, safe voice scripts, and visual atmosphere.
- Existing lesson progress must keep working during migration.
- Build the graph as an overlay first, then deepen the model.
- Each phase should pass `npm run lint` and `npm run build` before advancing.

## Parallel Agent Protocol

Use parallel agents aggressively for this roadmap, but keep shared contracts with one parent/integrator.

Parallel-safe work:

- read-only lesson reviews
- visual/UX proposals
- lesson-local implementation slices
- copy/microcopy drafts
- manual QA checklist drafting
- isolated component prototypes

Integrator-only work:

- shared types
- registry changes
- Firestore profile shape
- Firebase Functions
- theme validation
- global CSS tokens
- final conflict resolution
- final lint/build verification

Each phase below names suggested agents. The parent agent should merge outputs in small slices and verify before moving to the next phase.

## Manual QA Themes

Use every manual theme preference during QA:

- Royal
- Space
- Dinosaurs
- Animals
- Sports
- Surprise
