# Phase 12 — Manual Character Presets

## Objective

Add deterministic character presets for each manual theme before asking AI to generate character configs.

## Why

Manual fallbacks must always work. AI should enhance a system that already renders safe, validated character configs.

## Scope

Potential updates:

- `src/themes/defaultThemes.ts`
- `src/themes/themeTypes.ts`
- `src/themes/themeValidation.ts`
- `src/components/ThemeCharacterCanvas.tsx`
- `src/themes/lesson1ThemeItems.ts`

## Manual Presets

Suggested mappings:

| Theme | Character Direction |
| --- | --- |
| Royal | human + hair + dress + slippers |
| Space | human/astronaut + helmet + space suit + boots |
| Dinosaurs | explorer or dino mascot + cap/dino head + explorer vest + trail boots |
| Animals | animal helper + safari/rescue hat + helper outfit + field shoes |
| Sports | athlete + cap + jersey + sneakers |
| Surprise | inventor/mascot + topper + playful outfit + shoes |
| Artist | artist + beret/cap + smock + shoes |
| Plants | gardener + sun hat + overalls + boots |
| Foodie | chef + chef hat + apron + shoes |

## Parallel Plan

Run preset drafting in parallel because each group can work independently:

- **Agent A — Royal/Space:** draft manual character configs, stage styles, and color alignment.
- **Agent B — Dinosaurs:** draft explorer and/or dino mascot preset options.
- **Agent C — Animals:** draft animal helper preset options.
- **Agent D — Sports:** draft athlete/team preset options.
- **Agent E — Surprise:** draft flexible studio/mascot preset options.
- **Agent F — Artist:** draft artist/beret/smock/studio preset.
- **Agent G — Plants:** draft gardener/sun-hat/overalls/garden preset.
- **Agent H — Foodie:** draft chef/chef-hat/apron/kitchen preset.
- **Agent I — UX Copy:** review display names so character presets match theme labels.
- **Agent J — QA Matrix:** produce a table of every theme preference and expected character fields.

Integrator owns:

- shared `ThemePreference` changes
- shared defaults
- validation
- UI dropdown updates
- final consistency check

Safe implementation split:

- Theme option drafts can be parallel.
- The parent/integrator should make the final edits to `src/themes/themeTypes.ts`, `src/themes/defaultThemes.ts`, `src/themes/themeValidation.ts`, and signup/Home Hub options.
- If a subagent needs shared files, it returns a proposed patch instead of applying it.

## Checklist

- [x] Manual presets exist for all current theme preferences.
- [ ] New Artist, Plants, and Foodie theme preferences are represented if added.
- [x] Character presets use only allowed enum values.
- [x] Character colors align with theme visual tokens.
- [x] No preset changes item counts, answers, or stable IDs.

## Tests / Verification

- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual browser test: each theme shows a distinct character direction.
- [ ] Manual browser test: fallback themes work without AI.

## Done When

Each manual theme has a coherent character preset that renders deterministically without AI.
