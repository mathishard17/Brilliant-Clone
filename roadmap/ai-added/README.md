# AI-Added Roadmap

Goal: add AI personalization without letting AI control lesson correctness.

Core principle:

```text
AI creates the costume. Code owns the math.
```

The first phases intentionally require **no AI API**. They build the deterministic theme system, fallback themes, profile fields, and Lesson 1 rendering layer. Firebase AI Logic comes later, after the app can already render a validated theme pack.

## Phase Overview

1. [Phase 0 — Stabilize Current App](./phase-0-stabilize.md) — complete except manual smoke test.
2. [Phase 1 — Theme Contract & Manual Fallbacks](./phase-1-theme-contract.md) — complete.
3. [Phase 2 — Profile Theme Preference & Cache](./phase-2-profile-theme-state.md) — complete.
4. [Phase 3 — Render Lesson 1 From Theme Pack](./phase-3-lesson1-theme-rendering.md) — complete except manual browser smoke test.
5. [Phase 4 — Firebase AI Theme Generation](./phase-4-ai-theme-generation.md) — code present, lint/build pass, needs Firebase AI provisioning/manual AI validation.
6. [Phase 5 — AI Hint Button](./phase-5-ai-hints.md) — code present, lint/build pass, needs manual browser smoke test.
7. [Phase 6 — QA, Review, Deploy](./phase-6-qa-review-deploy.md) — partially complete; deploy only after manual AI smoke test.
8. [Phase 7 — Theme Visual Identity](./phase-7-theme-visual-identity.md) — code present, lint/build pass, needs manual visual QA.
9. [Phase 8 — Full Lesson 1 Theme Copy Pass](./phase-8-full-lesson1-theme-copy.md) — code present, lint/build pass, needs manual copy read-through.
10. [Phase 9 — Flexible Theme Language](./phase-9-flexible-theme-language.md) — code present, lint/build pass, needs manual AI/fallback validation.
11. [Phase 10 — Theme Tokens & Manual Theme Library](./phase-10-theme-tokens-manual-library.md) — code present, lint/build pass, needs manual theme picker QA.
12. [Phase 11 — Theme Character Renderer](./phase-11-theme-character-renderer.md) — Lesson 1 code present, needs manual character QA.
13. [Phase 12 — Manual Character Presets](./phase-12-manual-character-presets.md) — current manual presets code present, needs manual character QA.
14. [Phase 13 — AI Character Config](./phase-13-ai-character-config.md) — planned.

## Agent Strategy

Use the `looping` skill when working through these phases sequentially. It keeps each step in an execute, verify, and advance loop so agents do not skip phase gates.

Use parallel agents only when they do not edit the same shared files.

Good parallel work:

- planning/research
- theme contract in new files
- isolated UI copy review
- independent lesson review
- character geometry audit
- character enum/schema design
- manual preset drafting by theme group
- AI prompt/validator/fallback review as separate proposals

Avoid parallel edits to:

- `src/lessons/registry.ts`
- `src/types/*`
- `src/services/userProgress.ts`
- broad shared CSS
- Firebase setup/config

For implementation, prefer:

```text
parallel planning -> one integrator -> lint/build -> review -> revise
```

For shared character/theme work, use many parallel subagents for proposals, but keep final edits to shared files with one parent/integrator.

## Non-Negotiable Guardrails

- AI must not generate correct answers.
- AI must not change item counts.
- AI must not change lesson section count.
- AI output must be validated before rendering.
- Manual fallback theme must always work.
- AI failure must never block lesson access.
- Cache generated theme packs; do not call AI on every screen.

## Suggested Deadline Story

For the next deadline, the strongest scoped demo is:

> The same Lesson 1 math engine can render with different learner-interest themes. Manual themes work first; AI can generate a validated theme pack and cache it.

