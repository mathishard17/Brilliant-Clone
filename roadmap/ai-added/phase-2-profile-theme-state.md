# Phase 2 — Profile Theme Preference & Cache

## Objective

Let a user choose an interest/theme and store it safely in their profile. No AI API is used in this phase.

## Scope

Update:

- `src/types/user.ts`
- `src/services/userProgress.ts`
- `src/services/auth.ts`
- `src/context/auth-context.ts`
- `src/context/AuthContext.tsx`
- `src/screens/PrincessRegistry.tsx`

## Data Shape

Add optional or default-normalized fields:

```ts
themePreference: ThemePreference
themePacks: Record<string, Lesson1ThemePack>
```

## UI

At signup, add a simple interest picker:

- Royal
- Space
- Dinosaurs
- Animals
- Sports
- Surprise me

For existing users, default to `royal`.

## Parallel Agent Plan

Possible parallel split:

- **Agent A:** profile types + Firestore parsing defaults.
- **Agent B:** signup UI and auth function signatures.

Integrator:

- ensure type names/imports match Phase 1
- verify existing users without theme fields still load

## Checklist

- [x] New users save `themePreference`.
- [x] Existing users default to `royal`.
- [x] `themePacks` normalizes to `{}` if missing.
- [x] Signup still works.
- [x] Login still works.
- [x] No AI calls happen.

## Tests / Verification

- [x] New user signup path type-checks.
- [x] Existing profile parsing handles missing theme fields.
- [x] `npm run lint`
- [x] `npm run build`

## Done When

Theme preference is part of profile state and can be saved/loaded without AI.

