# Phase 6 — QA, Review, Deploy

## Objective

Stabilize AI-added features before demo or deploy.

## Scope

- lesson smoke tests
- AI fallback tests
- review/revise pass
- docs update
- deploy only when explicitly requested

## Required Reviews

Run:

- `review-lesson` for Lesson 1 after theming
- `review-lesson` for any lesson that receives hints
- one manual browser pass through the AI flow

## QA Checklist

- [ ] Royal fallback works without AI.
- [ ] Manual Space theme renders correctly.
- [ ] Generated theme validates and renders.
- [ ] Invalid AI output falls back.
- [ ] Cached theme survives reload.
- [ ] Lesson 1 math remains correct.
- [ ] No answer leakage introduced.
- [ ] Duplicate-answer blocking still works.
- [ ] Progress persists after theme generation.
- [ ] Reset clears lesson progress but does not corrupt profile.
- [ ] App remains usable if AI service is unavailable.

## Verification Commands

```bash
npm run lint
npm run build
```

## Manual Smoke Test

1. Create a new account with Royal preference.
2. Create a new account with Space preference.
3. Change theme preference from the hub.
4. Generate AI theme.
5. Enter Lesson 1.
6. Confirm labels/copy changed but answers are still `6` and `12`.
7. Reload and confirm cached theme remains.
8. Reset Lesson 1 and confirm theme preference is not accidentally wiped.

## Deploy Criteria

Deploy only if:

- lint passes
- build passes
- manual smoke test passes
- AI failure fallback was tested
- user explicitly asks to deploy

## Done When

The AI-added feature is demo-safe and documented.

