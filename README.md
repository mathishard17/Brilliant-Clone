# Counting Adventures

Interactive themed combinatorics and probability lessons for 3rd graders, built as a Brilliant-style React app with Firebase Auth, Firestore progress, Firebase Hosting, and early AI personalization.

**Live demo:** [https://brilliantclone-4276b.web.app](https://brilliantclone-4276b.web.app)

## Curriculum

The app now has five registered lessons:

1. **Princess Outfits** — multiplication rule / counting choices.
2. **Royal Arrangements** — permutations, factorials, constraints, identical items.
3. **Royal Treasure Bags** — combinations, where order does not matter.
4. **Magic Chance Spinners** — probability as favorable outcomes over total outcomes.
5. **Fair Games** — sample spaces and fairness.

Sequence:

```text
count choices → order objects → choose groups → count chance → check fairness
```

## Core Features

- Username/password sign-up with a custom display name and adventure theme preference.
- Home hub renders lessons from `src/lessons/registry.ts` with theme-aware card titles, descriptions, emojis, and shell colors.
- Per-lesson progress bars, resume, reset, and completion badges.
- Firestore progress stored per lesson in `users/{uid}.lessons`.
- Meaningful section state persists for newer lessons: challenge answers, solved gates, page indices, and key visual work.
- Interactive visuals: closets, jewel slots, treasure bags, spinners, sorting cards.
- Two-stage wrong-answer feedback and duplicate-answer blocking.
- Lesson 1 can render from validated theme packs, with manual fallbacks for every theme preference.
- Firebase AI Logic theme generation code can create, validate, cache, and safely fall back for Lesson 1 themes.
- Optional Lesson 1 hint buttons use safe AI JSON validation and local fallback hints.
- Royal and Space themes now carry distinct colors, character visuals, and bounded copy slots.
- Theme packs include button, feedback, and motif-shape tokens, with manual fallbacks for all signup theme options.
- Lesson 1 character visuals use bounded theme character configs, so non-royal themes can render structured outfits like explorer jackets, helper outfits, jerseys, and smocks instead of only recoloring the original dress shape.
- Lessons 2–5 have lesson-local theme bridges while shared per-lesson theme-pack contracts are still a future step.
- Theme visuals now include broader UI state tokens for error, status, selected, disabled, input/focus, spinner, meter, diagram, and neutral surfaces.
- Optional opt-in voice narration uses a Firebase callable Function as the server boundary for Cartesia-generated MP3s, with captions and fallback responses.
- Lightweight local UI sounds play on enabled buttons, with a separate completion tada for final lesson finish actions.
- Mobile-first layout for phones, iPads, and desktop.
- Project skills for curriculum work:
  - `create-lesson`
  - `review-lesson`
  - `revise-lesson`
  - `looping`

## Architecture

```text
src/
  lessons/
    registry.ts
    lesson1/
      copy.ts
      data.ts
      screens.tsx
    lesson2/
      copy.ts
      screens.tsx
    ...
  components/      # shared UI and lesson primitives
  hooks/           # auth, lesson, progress hooks
  services/        # Firebase Auth, Firestore I/O, AI/theme/voice client calls
  themes/          # theme contracts, fallbacks, validation, resolving, CSS variables
  types/           # lesson/user TypeScript models
  utils/           # progress normalization, sounds, retry, resume, rendering helpers
  voice/           # voice clip catalog, cache keys, request validation
functions/
  index.js         # callable Functions for Cartesia voice and AI theme generation
```

Important patterns:

- Add lessons as `src/lessons/lessonN/`, then register them in `src/lessons/registry.ts`.
- Keep student-facing text in lesson-local `copy.ts`.
- Keep custom visuals lesson-local until a pattern repeats.
- Keep AI personalization constrained: AI can change labels/flavor, but code owns counts, answers, section order, and validation.
- Keep API keys server-side: the browser calls Firebase callable Functions, and Functions call Cartesia or AI providers.
- Use theme CSS variables for UI state surfaces, not just main panels and buttons.
- Use `review-lesson` before demos to catch answer leakage, weak gating, static visuals, and plan drift.

## Data Model

Firestore collections:

| Collection | Purpose |
| --- | --- |
| `users/{uid}` | user profile, active lesson, theme preference/cache, `lessons` progress map, legacy `lesson` field |
| `usernames/{username}` | username uniqueness lookup |

Each lesson progress entry tracks `lessonId`, `currentScreen`, `lastLessonScreen`, `completed`, legacy screen state, and a flexible `sectionState` map for newer lesson interactions.

Theme personalization stores a selected `themePreference` and optional cached `themePacks`. Generated packs are validated before rendering, and the deterministic fallback themes keep Lesson 1 usable if AI is unavailable.

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Required Firebase values live in `.env` as `VITE_FIREBASE_*`. Optional:

- `VITE_AUTH_EMAIL_DOMAIN`
- `VITE_DEV_USERNAME`
- `VITE_FIREBASE_AI_MODEL`
- `CARTESIA_API`
- `CARTESIA_MODEL_ID`
- `CARTESIA_VERSION`
- `CARTESIA_DEFAULT_VOICE_ID`

Firebase AI Logic is only needed for generated Lesson 1 theme packs. Manual fallback themes work without an AI API.

For local voice testing, run the Functions emulator:

```bash
npx firebase emulators:start --only functions
```

In development, the web app connects callable Functions to `127.0.0.1:5001`. Cartesia is still a real external API call unless mocked; Storage is real unless the Storage emulator is also running.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm run firebase:deploy` | Build + deploy Hosting and Firestore rules |
| `npm run firebase:deploy:hosting` | Build + deploy Hosting only |

## Status Notes

- Latest local lint/build passes.
- Vite still reports a large chunk warning.
- AI-added roadmap status: Phases 1-12 are code-present for Lesson 1 manual themes/character presets; hub/login theming, shared theme-state tokens, and Lessons 2-5 local theme bridges are present. Firebase AI provisioning, manual theme validation, and manual hint/visual smoke testing are still needed before demo/deploy.
- Voice status: opt-in voice UI, shared clip catalogs, Cartesia callable scaffold, captions, and local fallback behavior are present for Lessons 1-5. Production voice still needs emulator/deploy QA, Storage/cache confirmation, and final voice IDs.
- The live demo may lag local changes until redeployed.

## License

Alpha AI Engineering project.