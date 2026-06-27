# Phase 11 — Theme Character Renderer

## Objective

Refactor the current character visual from a princess/astronaut-specific component into a reusable theme character renderer.

## Why

The current Lesson 1 visual can switch between princess and astronaut, but future themes like dinosaurs, plants, artists, food, sports, and animals need a scalable system. The app should not hardcode a brand-new SVG component for every theme.

## Scope

Potential updates:

- `src/components/PrincessCanvas.tsx`
- new `src/components/ThemeCharacterCanvas.tsx`
- `src/themes/themeTypes.ts`
- `src/themes/defaultThemes.ts`
- `src/themes/themeValidation.ts`
- `src/themes/themeResolver.ts`
- `src/themes/lesson1ThemeItems.ts`
- Lesson 1 screen imports/usages

## Proposed Contract

Code owns:

- stable item slots
- character layout
- SVG primitives
- animation states
- accessibility labels
- selected item IDs

Theme owns:

- character role
- allowed head/body/foot/stage styles
- colors
- decorative details
- item labels

Use bounded enums instead of arbitrary SVG:

```ts
type ThemeCharacterBase = 'human' | 'astronaut' | 'creature' | 'animal' | 'mascot'
type ThemeHeadStyle = 'hair' | 'helmet' | 'dino' | 'animalEars' | 'cap'
type ThemeBodyStyle = 'dress' | 'spaceSuit' | 'explorerVest' | 'jersey' | 'apron' | 'overalls' | 'smock'
type ThemeFootStyle = 'slippers' | 'boots' | 'sneakers'
type ThemeStageStyle = 'plain' | 'space' | 'jungle' | 'field' | 'studio' | 'garden' | 'kitchen'
```

## Parallel Plan

Run as many read-only/design subagents as possible before implementation:

- **Agent A — Geometry Audit:** audit current `PrincessCanvas` SVG geometry and identify reusable head/body/feet/stage primitives.
- **Agent B — Contract Design:** design enum names, field shape, and fallback behavior for character config.
- **Agent C — Validation Design:** draft validator rules for all enum fields and invalid/missing config fallback.
- **Agent D — Screen Usage Audit:** inspect Lesson 1 screens and list import/prop migration points.
- **Agent E — Accessibility Audit:** propose `aria-label` and readable-name rules for character variants.
- **Agent F — Animation Audit:** identify current animations and propose theme-safe animation hooks.
- **Agent G — Visual QA Checklist:** draft manual QA cases for Royal, Space, and at least one non-human/non-astronaut preset.

Parallel implementation slices after the design pass:

- **Agent H:** implement isolated new renderer primitives in a new component file only.
- **Agent I:** update a compatibility wrapper/export only.
- **Agent J:** draft tests or static usage checks if a test setup exists.

Integrator owns:

- shared type changes
- component rename/wrapper strategy
- final import migration
- conflict resolution across implementation slices
- lint/build

Do not let parallel agents edit the same shared files. If multiple agents need `src/themes/themeTypes.ts` or `PrincessCanvas` migration, they should return proposed patches and the parent/integrator applies the final version.

## Checklist

- [x] New neutral `ThemeCharacterCanvas` exists or `PrincessCanvas` is internally refactored.
- [x] Backward-compatible export path prevents existing lesson imports from breaking during migration.
- [x] Character visual uses code-owned slots, not theme-owned layout.
- [x] Theme character fields are bounded by enums.
- [x] Manual Royal and Space still render correctly.
- [x] Existing selected item colors still update the character visual.

## Tests / Verification

- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual test: Royal character still works.
- [ ] Manual test: Space astronaut still works.
- [ ] Manual test: item color changes still affect the visual.

## Done When

The app has a neutral, reusable character renderer ready for more theme presets without duplicating an entire SVG per theme.
