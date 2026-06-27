# AI-Added Roadmap Outline

Core principle:

```text
AI creates the costume. Code owns the math.
```

## Phase Groups

### Baseline And Deterministic Theme Layer

1. **Phase 0 — Stabilize Current App**
   - Freeze a reliable baseline.
   - Lint/build pass.
   - Manual lesson smoke test remains important.

2. **Phase 1 — Theme Contract & Manual Fallbacks**
   - Add Lesson 1 theme-pack types, defaults, validation, and resolver.
   - Manual themes work without AI.

3. **Phase 2 — Profile Theme Preference & Cache**
   - Store selected theme preference and cached generated packs in user profile.
   - Existing users default safely.

4. **Phase 3 — Render Lesson 1 From Theme Pack**
   - Lesson 1 labels/copy render from the active theme.
   - Stable IDs, counts, answers, and progress stay unchanged.

### AI Theme Generation And Hints

5. **Phase 4 — Firebase AI Theme Generation**
   - Add Firebase AI Logic theme generation.
   - Parse, validate, cache, or fallback.
   - Still needs Firebase provisioning/manual AI validation.

6. **Phase 5 — AI Hint Button**
   - Add optional safe hints with fallback.
   - AI hints must not reveal answers.
   - Manual browser smoke test still needed.

### QA And Demo Readiness

7. **Phase 6 — QA, Review, Deploy**
   - Review Lesson 1 theming/hints.
   - Test AI fallback/cache/reload behavior.
   - Deploy only when explicitly requested.

### Visual And Copy Theming

8. **Phase 7 — Theme Visual Identity**
   - Add color tokens and visual styling.
   - Space can render astronaut-like visuals.
   - Manual visual QA remains.

9. **Phase 8 — Full Lesson 1 Theme Copy Pass**
   - Remove non-theme copy leaks from Lesson 1 sections.
   - Theme Anchor Trick, summary, logs, and labels.

10. **Phase 9 — Flexible Theme Language**
    - Add bounded copy slots.
    - Theme language becomes authored/flavorful without AI owning math.

11. **Phase 10 — Theme Tokens & Manual Theme Library**
    - Add button/hint/success/motif tokens.
    - Add manual fallback themes for all theme preferences.
    - Add motif shapes and per-item colors.

### Character System Next Steps

12. **Phase 11 — Theme Character Renderer**
    - Refactor `PrincessCanvas` into a reusable theme character renderer.
    - Code owns SVG/layout primitives.
    - Themes choose bounded character styles.
    - Parallel work: geometry audit, enum contract, validation design, screen migration audit, accessibility audit, animation audit, QA checklist.

13. **Phase 12 — Manual Character Presets**
    - Add deterministic character presets for every manual theme.
    - Include potential new themes such as Artist, Plants, and Foodie.
    - Parallel work: one preset-drafting agent per theme/group, plus UX copy and QA matrix agents.

14. **Phase 13 — AI Character Config**
    - Let AI generate only bounded character config fields.
    - No raw SVG/HTML/CSS from AI.
    - Invalid configs fall back safely.
    - Parallel work: prompt schema, JSON shape, validator rules, fallback/cache review, custom idea security, error UX, docs, manual QA.

## Current Code-Present Areas

- Theme preference/profile/cache.
- Lesson 1 theme rendering.
- Manual theme fallbacks.
- Theme-aware Home Hub and login copy.
- Theme-aware Lessons 2-4 local bridges.
- Theme-aware Lesson 4 and 5 spinner object labels/icons.
- AI theme generation and AI hint code paths, pending Firebase/manual validation.

## Remaining Manual QA

- Manual browser pass for every theme picker option.
- Verify labels/copy/colors/motifs across Lessons 1-5.
- Verify hints and wrong-answer feedback do not reveal answers early.
- Verify AI unavailable fallback behavior.
- Verify cached theme reload behavior.
- Verify reset does not corrupt theme profile data.

## Parallel Work Rules

- Lesson-local agents can work in separate `src/lessons/lessonN/` folders.
- Character work can use many parallel research/design agents because geometry, enum design, validation, accessibility, animation, UX, and QA can be scoped separately.
- Parent/integrator owns shared files:
  - `src/themes/*`
  - `src/components/*`
  - `src/screens/screens.css`
  - `src/lessons/registry.ts`
  - Firebase/config/docs
- Subagents should report shared needs instead of editing shared contracts directly.
- Run full lint/build after integrating parallel work.
