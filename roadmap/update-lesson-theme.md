# Update Lesson Theme Guide

Use this guide when extending AI/manual theme support from Lesson 1 to another lesson.

Core rule:

```text
Theme owns flavor. Code owns learning, counts, answers, gates, and progress.
```

## Lesson 1 Reference Pattern

Lesson 1 now has a deterministic theme layer with:

- validated theme-pack data in `src/themes/`
- manual fallback themes for every signup preference
- theme preference and cached theme packs in the user profile
- theme-aware labels, copy, colors, motif symbols, and character visuals
- AI generation that can fill bounded flavor fields but cannot control math

Reference files:

- `src/themes/themeTypes.ts`
- `src/themes/defaultThemes.ts`
- `src/themes/themeValidation.ts`
- `src/themes/themeResolver.ts`
- `src/themes/lesson1ThemeItems.ts`
- `src/services/themeGeneration.ts`
- `src/screens/homeHubDisplay.ts`
- `src/screens/DressingRoom.tsx`
- `src/screens/AnchorTrickLesson.tsx`
- `src/screens/ShoesChallenge.tsx`
- `src/screens/LessonSummary.tsx`
- shared visual components such as `Closet`, `OutfitLog`, `PrincessCanvas`, and `ColoredHeart`

## What To Put In A Theme Pack

Theme packs may include:

- display labels for categories and items
- short flavor copy, headings, transitions, hints, and feedback
- color tokens for screens, panels, buttons, hints, success states, and stage backgrounds
- motif shapes and per-item colors for visual markers
- character or visualization variants when the lesson supports them

Theme packs must not include:

- correct answers
- equations or answer derivations
- item/category counts
- lesson section counts
- correctness rules
- progress keys
- arbitrary component layout

## Porting Steps

1. Identify the lesson’s stable math contract.
   - List categories, item IDs, counts, answer values, section order, and progress keys.
   - Decide which labels can change and which IDs must stay stable.

2. Add a lesson-specific theme type.
   - Mirror the Lesson 1 pattern: `LessonNThemePack`, `LessonNThemeVisual`, and `LessonNThemeCopy` if needed.
   - Keep optional copy/visual fields fallback-safe.

3. Add manual fallback themes.
   - Create deterministic fallbacks for every `ThemePreference`.
   - Do not make non-royal preferences silently display royal copy unless that is explicitly accepted.

4. If shared theme-pack support is not ready, use a lesson-local bridge.
   - Keep the bridge inside `src/lessons/lessonN/`.
   - Read the active profile theme/preference through existing lesson hooks.
   - Derive local labels, headings, and colors from existing theme helpers where possible.
   - Do not edit shared theme files, registry, shared CSS, or other lessons from parallel lesson agents.
   - Leave shared `LessonNThemePack` types/resolvers as a parent/integrator follow-up.

5. Validate the theme contract.
   - Enforce exact category counts and stable keys.
   - Validate hex colors and motif enum values.
   - Reject answer leakage in hints and flexible copy.
   - Treat missing optional visual/copy fields as fallback cases.

6. Add resolver helpers.
   - Resolve cached pack first, then manual fallback.
   - Map stable IDs to themed labels.
   - Map stable IDs to per-item visual styles.
   - Provide helper functions for screen-level CSS variables.

7. Update screens and components.
   - Replace hardcoded theme nouns with resolved labels/copy.
   - Keep equations, counts, and answers assembled in code.
   - Pass theme style variables to the lesson screen root.
   - Pass per-item styles into clickers, logs, diagrams, and character visuals.

8. Update AI generation only after deterministic rendering works.
   - Add schema fields for safe flavor copy and visual tokens.
   - Repeat guardrails in the prompt.
   - Validate and fall back before caching.
   - Never call AI on render.

9. Update docs and QA.
   - Add phase docs under `roadmap/ai-added/` if work is large.
   - Update `progress.md` when code is present.
   - Run `npm run lint` and `npm run build`.

## Parallel Lesson-Agent Boundaries

When updating several lessons at once:

- Give each subagent exactly one lesson folder, such as `src/lessons/lesson2/`.
- Allow reads of shared theme files and components, but do not allow writes outside the assigned lesson folder.
- Keep shared files with the parent/integrator: `src/themes/*`, `src/screens/screens.css`, `src/lessons/registry.ts`, shared components, docs, package files, and Firebase config.
- Ask subagents to return shared follow-up requests instead of making shared edits.
- Run one full lint/build after all lesson-local changes are integrated.

## Visual Token Checklist

For each lesson, decide whether it needs:

- `screenBackground`
- `panelBackground`
- `borderColor`
- `accentColor`
- `stageBackground`
- `buttonBackground`
- `buttonText`
- `buttonBorder`
- `hintBackground`
- `hintText`
- `successBackground`
- `successText`
- motif shapes per category
- per-item motif colors
- visualization/character variant

For Lesson 1, different clothing categories use different motif shapes, while individual options use different colors. Reuse that idea when a lesson has multiple item categories.

## Character Renderer Rules

Use the character renderer for on-stage avatars or outfit previews:

- Code owns SVG primitives, body layout, animation hooks, selected item slots, and accessibility labels.
- Theme config chooses from bounded character fields such as base, head, torso, feet, and stage.
- Do not add a whole new hardcoded character component for each theme.
- Do not let AI output raw SVG, JSX, HTML, or CSS.
- If a generated character config is missing or invalid, fall back to a manual preset.
- Selected stable item IDs should still drive the visual slots and colors.
- Character primitives should look like complete clothing, not disconnected lines.
- Draw pants/shorts behind shirts, jackets, jerseys, aprons, or smocks so lower-body shapes do not show through the torso.
- Hats and helmets should sit on the head with a crown/brim and highlight; avoid floating brim lines or detached accessories.
- Caps and hats should render above the face/head layer, not hidden behind it.
- Shirts should have actual sleeve shapes, not just stick-arm lines. Sleeves should visually connect to the torso.
- Shirt hems should cover the top of pants/shorts so the outfit reads as layered clothing.
- Arms should not disappear when sleeves are added. Use a clear layer order: pants/legs first, skin arms behind clothes, sleeves connected to the torso, torso on top, and visible hands at the cuffs.
- Do not recolor pants from a hat/cap selection before an outfit has been selected; blank outfit states should stay neutral.
- Give each torso enum its own polished primitive when needed. Do not let `jacketAndPants`, apron, overalls, and smock all fall through to one generic body if the silhouettes read poorly.
- Prefer simple, readable reusable primitives over clever SVG detail. If the clothing starts looking awkward, simplify to a clean paper-doll layer stack before adding decoration.
- Non-dress bodies should default to clear cartoon basics: outlined forearms and hands, simple sleeves, a simple torso, and legs/pants behind the torso.
- Prefer generated inline SVG primitives for theme characters over ad hoc per-screen path edits. Keep explicit color slots for head/accessory, outfit, pants, and shoes so item clicks can recolor the cartoon predictably.
- If external vector assets are introduced later, import or inline SVGs so CSS variables/props can recolor parts; avoid plain `<img>` SVG usage for assets that need live recoloring.

Lesson 1 currently uses this pattern for:

- Royal: hair + dress + slippers
- Space: helmet + space suit + boots
- Dinosaurs: cap + jacket/pants + boots
- Animals: cap + helper outfit + field shoes
- Sports: cap + jersey + sneakers
- Surprise: beret + smock + shoes

## Emoji Vs Motif Rules

Use motifs and emojis for different jobs:

- **Motif shapes** are the stable visual markers inside interactive item systems.
  - Use these for closet buttons, unique-look logs, found-combination lists, tree diagrams, and other places where the learner is tracking selected choices.
  - Match the exact button marker: same shape and same color.
  - Example: if hats use stars, outfits use squares, and shoes use circles, the "Unique Looks Found" log should also use stars/squares/circles, not object emojis.

- **Emojis** are decorative or semantic labels.
  - Use these for Home Hub cards, headings, spinners, sample spaces, or outcome labels where the emoji represents a named object.
  - Make each visible lesson card use a distinct theme-appropriate emoji.
  - Make object emojis match the object label. For example, `Panda Jacket` should use a panda emoji, not a tiger emoji.

Do not let emoji matching override motif markers in a choice-tracking visual. If a component is showing combinations of selected items, prefer the active theme's `motifShape` and per-item motif colors.

## Copy Slot Checklist

Good copy slots are:

- short
- optional
- validated
- theme-flavored
- free of numbers, equations, and answers

Bad copy slots:

- include `6`, `12`, `40`, or other answers
- explain the whole solution
- duplicate code-owned equations
- smuggle in item counts
- depend on one specific theme

## Feedback And Hint Timing

For wrong answers:

- `tryAgain` and early incorrect feedback should scaffold strategy only.
- Do not name the correct answer, winner, category, final count, fraction, equation, or complete solution in early feedback.
- Use prompts such as "count the target spaces," "compare the two groups," or "ask whether order matters."
- Full equations, answer values, and worked explanations belong only in explicit solution messages after the lesson's solution threshold/path.
- Label solution reveals clearly in the UI when they include the full answer.

## Shared Component Rules

When changing shared components:

- Add props for labels, colors, motifs, and copy instead of importing one lesson’s theme directly.
- Preserve existing defaults so older lessons do not break.
- Do not rename stable IDs just because labels changed.
- Keep broad CSS scoped through variables or lesson/theme modifier classes.

## Theme State Tokens

Theme visuals should cover more than the happy path. When a lesson adds or revises UI, prefer existing theme CSS variables for:

- core text and muted text
- error, warning, info/status, and success states
- selected, focused, disabled, and pressed states
- input borders/focus rings
- diagram/equation/spinner/meter neutral chrome

If a surface still needs a literal white, purple, or pink fallback, first ask whether a shared token such as `errorBackground`, `statusText`, `selectedBorder`, `inputBorder`, `spinnerRim`, `meterTrack`, or `neutralBackground` should exist instead.

## Manual QA

For every themed lesson:

1. Test each manual theme preference.
2. Confirm labels/copy change without changing answers.
3. Confirm visual markers have distinct shapes/colors when categories need them.
4. Confirm item-tracking visuals use motif shapes, not object emojis.
5. Confirm object emojis match their labels where emojis are used.
6. Confirm reset clears lesson progress but not theme preference/cache.
7. Confirm returning home and re-entering preserves progress.
8. Confirm AI failure falls back safely if AI generation is wired.
9. Run `npm run lint` and `npm run build`.

## Hub Integration

When a lesson becomes theme-aware, update the Home Hub too:

- Derive the lesson card title, emoji, and description from the active theme when the lesson supports it.
- Keep the registered lesson definition as the fallback for older or unthemed lessons.
- Avoid theme-specific hardcoded text in hub cards.
- Give each visible lesson card its own theme-appropriate emoji; do not reuse one emoji for every card in a theme.
- Update hub heading and front-page text colors to use active theme variables.
- Keep login/signup copy theme-neutral unless the selected theme is already known and intentionally applied.
- If the hub offers a custom theme idea, keep it local until shared AI generation accepts freeform prompts.
- For now, custom/AI unavailable paths should fall back to a manual theme and clearly tell the learner what happened.

Shared follow-up: `generateLesson1ThemePack` currently accepts `ThemePreference`, not an arbitrary user-entered theme idea. Add an integrator-owned API/schema change before treating custom ideas as real generated themes.

## Done When

A lesson is theme-ready when:

- manual fallbacks render without AI
- all theme output is validated
- non-default themes read coherently from start to finish
- UI colors/motifs match the selected theme
- math behavior is unchanged
- lint and build pass
- manual browser smoke test passes
