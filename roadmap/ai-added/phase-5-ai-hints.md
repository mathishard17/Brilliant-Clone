# Phase 5 — AI Hint Button

## Objective

Add a safe, optional hint button for selected challenge questions.

## Scope

Potential files:

- `src/services/hintGeneration.ts`
- shared `HintButton` component
- selected challenge screens only

## Guardrails

- Hints must not reveal the answer.
- Hints must be short.
- Hints must use current problem context.
- App must provide a fallback hint if AI fails.
- Do not use AI to decide correctness.

## Hint Schema

```ts
type HintResponse = {
  hint: string
  shouldRevealAnswer: false
}
```

## UI

Button copy:

```text
Need a hint?
```

States:

- loading
- hint shown
- fallback hint
- error hidden from learner

## Parallel Agent Plan

Possible parallel split:

- **Agent A:** design shared `HintButton`.
- **Agent B:** implement hint-generation service.
- **Agent C:** identify safe screens/challenges to attach hints.

Integrator decides final scope and ensures hints do not leak answers.

## Checklist

- [x] Hint never reveals the answer.
- [x] Hint works without AI using fallback.
- [x] Hint is not shown automatically.
- [x] Hint does not change saved correctness.
- [x] Hints are age-appropriate.

## Tests / Verification

- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual wrong-answer + hint flow.
- [ ] Manual AI failure fallback.

## Done When

At least one lesson has safe optional hints, and failure does not block learning.

