# Phase 7 — Theme Visual Identity

## Objective

Make manual themes feel visually distinct without letting themes change lesson math.

## Scope

Update:

- `src/themes/themeTypes.ts`
- `src/themes/defaultThemes.ts`
- `src/themes/themeValidation.ts`
- `src/screens/DressingRoom.tsx`
- `src/screens/ShoesChallenge.tsx`
- `src/components/PrincessCanvas.tsx`
- `src/screens/screens.css`

## Requirements

- Theme packs may provide color tokens for Lesson 1 shell, closet items, feedback accents, and character staging.
- Royal and Space must have visibly different color schemes.
- Space theme should render an astronaut-like character instead of a princess-like character.
- Stable item IDs, category counts, answers, and progress keys must not change.
- If a generated theme omits visual fields, the app must fall back safely.

## Checklist

- [x] Theme contract includes validated visual identity fields.
- [x] Royal fallback keeps the current warm royal feeling.
- [x] Space fallback has a distinct space color scheme.
- [x] Lesson 1 screens apply theme colors without breaking layout.
- [x] Space theme renders astronaut-like visual styling.
- [x] Stable IDs and answer logic remain unchanged.

## Tests / Verification

- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual browser test: Royal and Space look visually different.

## Done When

Lesson 1 can look like Royal or Space using deterministic theme visuals while preserving the same math engine.
