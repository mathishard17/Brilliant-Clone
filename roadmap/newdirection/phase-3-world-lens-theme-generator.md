# Phase 3: World Lens Theme Generator

## Goal

Keep the AI theme generator, but evolve it from "theme one lesson" into "generate a world lens over the knowledge graph."

## World Lens Definition

A world lens changes presentation, copy, voice, missions, icons, colors, and real-world framing while leaving graph structure and math logic untouched.

## Likely Files

- `src/themes/themeTypes.ts`
- `src/themes/themeValidation.ts`
- `src/themes/themeResolver.ts`
- `src/themes/defaultThemes.ts`
- `src/services/themeGeneration.ts`
- `functions/index.js`
- `src/types/knowledgeGraph.ts`
- `src/services/userProgress.ts`

## Implementation Slices

1. Define `GeneratedWorldLens`, `NodeSkin`, and `EdgeTransferPrompt`.
2. Add validation for generated world lenses.
3. Extend the callable prompt to use `MATH_NODE`, `USER_THEME`, and graph node IDs.
4. Store saved lenses without resetting mastery.
5. Render active lens styling in the graph hub.
6. Fall back to manual lens presets if AI fails.

## Parallel Agent Plan

- Agent A: World lens type proposal
  - Draft TypeScript interfaces and validation rules.
  - Include examples for at least two themes.
- Agent B: Prompt engineering proposal
  - Rewrite the AI generation prompt around graph node IDs, schema bridges, and safe world-lens output.
  - Include blocked fields and examples.
- Agent C: Manual lens preset drafting
  - Draft manual fallback lenses for Royal, Space, Dinosaurs, Animals, Sports, and Surprise.
- Agent D: Storage/cache review
  - Review how generated lenses should be stored in `themePacks` or a new profile field.
  - Identify migration risks.
- Agent E: UI integration proposal
  - Propose how generated world lenses appear in the graph hub and node detail panel.
- Parent/integrator:
  - Owns `functions/index.js`, validation, profile storage, final prompt, and fallback behavior.

## Guardrails

- AI cannot change node IDs.
- AI cannot change prerequisites.
- AI cannot change answers or counts.
- AI cannot generate code, arbitrary SVG, or unsafe voice scripts.

## Done When

- A custom idea can generate or fall back to a world lens.
- Switching worlds does not erase mastery.
- Graph node display changes while lesson logic stays stable.
- `npm run lint` passes.
- `npm run build` passes.

## Manual QA

- Generate a custom theme idea.
- Switch back to a manual world.
- Confirm completed nodes stay completed.
- Confirm generated text does not reveal answers.
