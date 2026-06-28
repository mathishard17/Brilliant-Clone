# Phase 7: Dedicated Lesson Theme Contracts

## Goal

Move Lessons 2-5 from Lesson 1-derived bridge helpers to dedicated theme contracts.

## Why

The current theme bridge approach works, but later lessons have concepts that do not fit Lesson 1 wardrobe categories:

- Lesson 2 needs ordered items and arrangement language.
- Lesson 3 needs group items, containers, and "order does not matter" visuals.
- Lesson 4 needs spinner outcomes, sector colors, and probability labels.
- Lesson 5 needs player/outcome labels, sample-space cards, fairness meter tokens, and game language.

## Likely Files

- `src/themes/themeTypes.ts`
- `src/themes/themeValidation.ts`
- `src/themes/defaultThemes.ts`
- `src/themes/themeResolver.ts`
- `src/lessons/lesson2/`
- `src/lessons/lesson3/`
- `src/lessons/lesson4/`
- `src/lessons/lesson5/`
- `api/generate-custom-theme.js`
- `api/get-voice-clip.js`

## Implementation Slices

1. Add `Lesson2ThemePack` and migrate Lesson 2 bridge data.
2. Add `Lesson3ThemePack` and migrate Lesson 3 item/container visuals.
3. Add `Lesson4ThemePack` for spinner outcomes and chance copy.
4. Add `Lesson5ThemePack` for sample-space/fairness game semantics.
5. Extend AI/world-lens validation to support lesson-specific packs.
6. Keep backward-compatible fallbacks while migrating.

## Parallel Agent Plan

- Agent A: Lesson 2 contract
  - Propose `Lesson2ThemePack` fields for ordered items, arrangement labels, invalid order feedback, and proof language.
  - Migrate only lesson-local usage after parent creates shared type.
- Agent B: Lesson 3 contract
  - Propose `Lesson3ThemePack` fields for group items, containers, equivalent-order visuals, and combination copy.
  - Flag anything still borrowing Lesson 1 closet language.
- Agent C: Lesson 4 contract
  - Propose `Lesson4ThemePack` fields for spinner sectors, chance labels, probability copy, and outcome states.
  - Include label-radius and center-hub theming needs.
- Agent D: Lesson 5 contract
  - Propose `Lesson5ThemePack` fields for players, outcome cards, fairness meter, sample-space review, and game framing.
  - Include win/loss/neutral state tokens.
- Agent E: AI validation contract
  - Propose the generated JSON shape and validation additions for all lesson-specific packs.
  - Keep stable IDs and answer logic blocked from AI.
- Agent F: Default theme migration
  - Draft default packs for Royal, Space, Dinosaurs, Animals, Sports, and Surprise.
- Agent G: Cross-theme QA
  - Draft a matrix covering every theme preference across Lessons 2-5.
- Parent/integrator:
  - Owns `themeTypes.ts`, `themeValidation.ts`, `themeResolver.ts`, `defaultThemes.ts`, API-route prompt/catalog updates, backward-compatible fallbacks, and final build.

## Done When

- Lessons 2-5 no longer depend on Lesson 1 closet category structure for their own visuals/copy.
- Stable IDs remain code-owned.
- Theme packs validate before rendering.
- Manual fallbacks exist for every theme preference.
- `npm run lint` passes.
- `npm run build` passes.

## Manual QA

- Test every theme preference in Lessons 2-5.
- Confirm labels, visuals, and voice lines match the lesson concept.
- Confirm answers and progress gates are unchanged.
