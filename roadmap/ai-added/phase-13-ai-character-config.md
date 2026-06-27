# Phase 13 — AI Character Config

## Objective

Let Firebase AI generate validated character configuration fields while code continues to own rendering, layout, and math.

## Why

AI can make themes feel more flexible, but raw SVG/HTML/CSS from AI would be unsafe and hard to validate. AI should choose from code-owned character primitives and bounded enum values.

## Scope

Potential updates:

- `src/services/themeGeneration.ts`
- `src/themes/themeTypes.ts`
- `src/themes/themeValidation.ts`
- `src/themes/defaultThemes.ts`
- `src/components/ThemeCharacterCanvas.tsx`
- `.env.example` only if model/config changes

## AI May Generate

- character enum choices
- stage enum choice
- short visual flavor strings
- colors within validated hex fields
- decorative non-math copy

## AI May Not Generate

- raw SVG
- arbitrary JSX/HTML/CSS
- item counts
- item IDs
- answers
- equations
- section order
- correctness rules
- progress keys

## Prompt Shape

The AI prompt should list allowed values explicitly:

```text
Choose only from these character fields:
- baseKind: human | astronaut | creature | animal | mascot
- headStyle: hair | helmet | dino | animalEars | cap
- bodyStyle: dress | spaceSuit | explorerVest | jersey | apron | overalls | smock
- footStyle: slippers | boots | sneakers
- stageStyle: plain | space | jungle | field | studio | garden | kitchen

Do not invent new field names or values.
Do not output SVG, HTML, CSS, answers, counts, equations, or lesson structure.
```

## Runtime Flow

```text
themePreference/custom idea -> AI prompt -> JSON parse -> validate -> cache generated theme or fallback
```

## Parallel Plan

Run AI integration planning in parallel, then let the parent integrate shared code:

- **Agent A — Prompt Schema:** draft the AI prompt section for character config and allowed enum values.
- **Agent B — JSON Shape:** draft the exact response JSON shape and examples.
- **Agent C — Validator Rules:** draft validation checks for unknown fields, invalid enums, missing fields, and fallback behavior.
- **Agent D — Fallback/Caching:** review whether invalid character config should drop only the character block or the whole generated pack.
- **Agent E — Custom Theme Ideas:** design how `Other...` freeform ideas should flow into AI prompt text safely.
- **Agent F — Security/Abuse:** review whether user-entered custom theme text needs length/filtering before prompt use.
- **Agent G — Manual QA:** draft browser test cases for valid AI, invalid AI, fallback, and cached generated character config.
- **Agent H — Error UX:** draft learner-facing messages for generated vs fallback character config.
- **Agent I — Docs:** draft roadmap/README updates for AI character config behavior.

Integrator owns:

- shared AI generation service changes
- validation integration
- caching behavior
- final prompt wording
- final docs
- lint/build

Do not parallel-edit `src/services/themeGeneration.ts` or `src/themes/themeValidation.ts`. Subagents should return proposed snippets; parent/integrator applies the final schema, validator, and fallback behavior.

## Checklist

- [ ] AI prompt includes character config schema and allowed enum values.
- [ ] Validator rejects unknown character fields and enum values.
- [ ] Invalid character config falls back without blocking lessons.
- [ ] Generated config never controls math or layout.
- [ ] Custom theme idea support is considered alongside `ThemePreference`.

## Tests / Verification

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual test: invalid AI character config falls back.
- [ ] Manual test: generated valid character config renders.
- [ ] Manual test: AI unavailable path still uses manual preset.

## Done When

AI can safely generate character configuration by choosing from code-owned primitives, and invalid output never breaks lesson access.
