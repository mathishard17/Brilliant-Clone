# Phase 10 — Theme Tokens & Manual Theme Library

## Objective

Expand theme packs from labels/copy into a richer visual design contract, then add deterministic manual themes beyond Royal and Space.

## Scope

Update:

- `src/themes/themeTypes.ts`
- `src/themes/defaultThemes.ts`
- `src/themes/themeValidation.ts`
- `src/themes/themeResolver.ts`
- `src/components/Closet.tsx`
- `src/components/OutfitLogEntry.tsx`
- `src/components/ColoredHeart.tsx`
- `src/screens/screens.css`
- `src/services/themeGeneration.ts`

## Requirements

- Theme visual identity includes background, panel, border, accent, button, hint, and success colors.
- Theme packs can choose a motif shape for category/item markers: heart, circle, square, star, diamond, triangle, or paw.
- The UI should use the motif shape instead of always showing hearts.
- Manual fallback themes exist for Royal, Space, Dinosaurs, Animals, Sports, and Surprise.
- Stable category keys, item IDs, counts, answers, and progress keys must not change.
- AI-generated visual fields remain optional and validated; invalid visuals fall back safely.

## Checklist

- [x] Visual token type includes background, panel, button, feedback, and motif fields.
- [x] Validator checks all visual token colors and motif enums.
- [x] Closet and outfit logs render motif shapes from the active theme.
- [x] Lesson buttons and hint/success surfaces consume theme color tokens.
- [x] Manual Dinosaurs, Animals, Sports, and Surprise themes exist.
- [x] AI prompt documents visual token and motif fields.

## Tests / Verification

- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual browser test: theme picker changes colors and motifs across all manual themes.

## Done When

Theme packs can deterministically control the Lesson 1 visual palette and motif shape, and every signup theme option has a real manual fallback.
