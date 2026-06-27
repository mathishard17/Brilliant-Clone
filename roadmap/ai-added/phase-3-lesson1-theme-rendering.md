# Phase 3 — Render Lesson 1 From Theme Pack

## Objective

Make Lesson 1 display labels and light copy from the selected theme pack. No AI API is used in this phase.

## Scope

Update:

- `src/screens/DressingRoom.tsx`
- `src/screens/ShoesChallenge.tsx`
- `src/components/Closet.tsx`
- possibly `src/lessons/lesson1/copy.ts`

## Rules

- Internal item IDs stay stable.
- Outfit keys stay stable.
- Correct answers remain deterministic.
- `PrincessCanvas` can remain visually princess-themed for v1.
- Theme changes display labels/copy, not math logic.

## Implementation Notes

Use:

```ts
resolveLesson1Theme(profile.themePreference, profile.themePacks)
```

Then map stable IDs to theme labels:

- `gold-tiara`, `diamond-crown`
- `pink-gown`, `purple-dress`, `emerald-gown`
- `glass-slippers`, `riding-boots`

## Parallel Agent Plan

Possible parallel split:

- **Agent A:** update `Closet` to respect passed item labels.
- **Agent B:** update `DressingRoom`.
- **Agent C:** update `ShoesChallenge`.

Integrator:

- ensure all use the same resolver
- run Lesson 1 smoke test

## Checklist

- [x] Royal theme renders current labels.
- [x] Space theme renders different labels.
- [x] Lesson 1 answer remains `6`.
- [x] Lesson 1 shoes answer remains `12`.
- [x] Outfit logs still de-dupe correctly.
- [x] Saved progress still works across theme labels.

## Tests / Verification

- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual test: switch Royal/Space and enter Lesson 1.

## Done When

Lesson 1 is themeable using manual theme packs with no AI involved.

