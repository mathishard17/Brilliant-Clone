# Phase 8 — Full Lesson 1 Theme Copy Pass

## Objective

Remove royal-only wording from Lesson 1 screens when a non-royal theme is active.

## Scope

Update:

- `src/themes/themeTypes.ts`
- `src/themes/defaultThemes.ts`
- `src/themes/themeValidation.ts`
- `src/screens/AnchorTrickLesson.tsx`
- `src/screens/LessonSummary.tsx`
- `src/components/OutfitLog.tsx`
- `src/components/AnchorTreeDiagram.tsx`
- related Lesson 1 helper components as needed

## Requirements

- Section 2 and Section 4 must use theme labels for crowns, dresses, shoes, roles, and look names.
- Royal copy may remain royal, but Space copy should say helmets, suits, boots, astronaut/space looks, and space-appropriate language.
- Fix awkward lowercase/capitalization in generated phrases and UI labels.
- Keep numeric answers and section order deterministic.
- Avoid broad rewrites of unrelated lessons.

## Checklist

- [x] Anchor Trick copy uses themed category/item labels.
- [x] Anchor tree and outfit summaries use themed item labels.
- [x] Summary shortcut and practice copy use themed language.
- [x] UI headings and counters avoid hardcoded `Princess` when non-royal.
- [x] Capitalization is consistent in labels, headings, and equations.

## Tests / Verification

- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual browser test: Space theme has no stray princess/crown/gown/shoe wording except documented visual compatibility.

## Done When

Lesson 1 reads coherently from start to finish under Royal and Space themes.
