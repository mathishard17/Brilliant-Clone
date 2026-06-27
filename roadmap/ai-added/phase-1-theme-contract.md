# Phase 1 — Theme Contract & Manual Fallbacks

## Objective

Create the data contract for theme packs and manual fallback themes. No AI API is used in this phase.

## Scope

Add:

- `src/themes/themeTypes.ts`
- `src/themes/defaultThemes.ts`
- `src/themes/themeValidation.ts`
- `src/themes/themeResolver.ts`

## Theme Pack Contract

For Lesson 1, the theme pack may change labels and copy but not structure:

```ts
type Lesson1ThemePack = {
  themeName: string
  learnerRole: string
  intro: string
  categories: [
    { key: 'crowns'; label: string; items: [string, string] },
    { key: 'dresses'; label: string; items: [string, string, string] },
    { key: 'shoes'; label: string; items: [string, string] },
  ]
  feedback: {
    correct: string
    tryAgain: string
    hint: string
  }
}
```

## Manual Fallback Themes

- [ ] Royal / existing default
- [ ] Space Academy: astronauts, outfit colors, shoes/boots, planets/stars/rockets as flavor

## Parallel Agent Plan

Can run in parallel:

- **Agent A:** define TypeScript types and validator.
- **Agent B:** draft fallback theme packs.

Integrator:

- merge both outputs
- ensure theme item counts are exactly 2/3/2
- run verification

## Checklist

- [x] Theme schema exists.
- [x] Validator rejects missing/extra/empty category items.
- [x] Royal fallback matches current Lesson 1 labels.
- [x] Space fallback is age-appropriate.
- [x] No lesson screens changed yet.

## Tests / Verification

- [x] Unit-style manual check: invalid theme falls back.
- [x] `npm run lint`
- [x] `npm run build`

## Done When

The app has validated theme pack data and manual fallbacks, but no UI uses them yet.

