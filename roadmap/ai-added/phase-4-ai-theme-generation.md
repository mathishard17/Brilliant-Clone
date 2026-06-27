# Phase 4 — Firebase AI Theme Generation

## Objective

Generate a validated Lesson 1 theme pack from the learner's interest using Firebase AI Logic.

## Prerequisite

Phases 1-3 must work without AI first.

## Scope

Add/update:

- `src/services/themeGeneration.ts`
- `src/lib/firebase.ts`
- `src/vite-env.d.ts`
- `.env.example`
- `src/screens/HomeHub.tsx` or another small UI entry point

## Firebase AI Requirements

- Use Firebase AI Logic / Gemini Developer API for web.
- Run Firebase AI setup before using the SDK.
- Use structured JSON output when possible.
- Add App Check before serious production use.

## AI Contract

AI may generate:

- theme name
- role
- category labels
- item labels
- intro text
- feedback flavor

AI may not generate:

- correct answers
- category counts
- section count
- arbitrary UI layouts
- Firestore schema changes

## Runtime Flow

```text
themePreference -> AI prompt -> JSON parse -> validate -> cache or fallback
```

## Caching

Save valid theme packs in the user profile:

```ts
themePacks[LESSON_1_ID] = generatedTheme
```

Do not call AI on every render or screen.

## Parallel Agent Plan

Use sequential implementation for this phase because it touches Firebase and profile state.

Optional parallel work:

- **Agent A:** draft prompt and JSON schema.
- **Agent B:** review Firebase AI Logic docs and current model guidance.

Integrator owns code changes.

## Checklist

- [x] AI generation service exists.
- [x] Generated JSON validates.
- [x] Invalid JSON falls back.
- [x] Failure does not block the lesson.
- [x] Generated theme is cached.
- [x] No repeated AI calls on render.

## Tests / Verification

- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual test: generation failure falls back safely.
- [ ] Manual test: cached theme persists after reload.

## Done When

The app can generate, validate, cache, and render a Lesson 1 theme pack safely.

