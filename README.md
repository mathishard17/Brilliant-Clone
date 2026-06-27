# Counting Adventures

Interactive themed combinatorics and probability lessons for 3rd graders, built as a Brilliant-style React app with Firebase Auth, Firestore progress, Firebase Hosting, and early AI personalization.

**Live demo:** [https://brilliant-clone-mu.vercel.app/](https://brilliant-clone-mu.vercel.app/)

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
- Meaningful section state persists for newer lessons: challenge answers, solved gates, page indices, and optional visual work.
- Home Hub includes a black neon Knowledge Graph for Lessons 1-10; current nodes derive their status from lesson progress and future nodes stay locked.
- Node Feedback is available only for in-progress, completed, and mastered graph nodes, and refreshes automatically when the learner's progress state changes.
- Interactive visuals: closets, jewel slots, treasure bags, spinners, sorting cards.
- Visual experiments are scaffolds, not hard blockers: a correct answer can unlock progress without requiring every outfit, ordering, bag, or outcome to be built first.
- Two-stage wrong-answer feedback and duplicate-answer blocking.
- Lesson 1 can render from validated theme packs, with manual fallbacks for every theme preference.
- Vercel API theme generation can create, validate, cache, and safely fall back for Lesson 1 themes.
- Optional Coach Hint buttons use safe AI JSON validation, a second-pass server safety check for generated hints, and local fallback hints.
- Royal and Space themes now carry distinct colors, character visuals, and bounded copy slots.
- Theme packs include button, feedback, and motif-shape tokens, with manual fallbacks for all signup theme options.
- Lesson 1 character visuals use bounded theme character configs, so non-royal themes can render structured outfits like explorer jackets, helper outfits, jerseys, and smocks instead of only recoloring the original dress shape.
- Lessons 2–5 have lesson-local theme bridges while shared per-lesson theme-pack contracts are still a future step.
- Theme visuals now include broader UI state tokens for error, status, selected, disabled, input/focus, spinner, meter, diagram, and neutral surfaces.
- Optional opt-in voice narration uses a Vercel API route as the server boundary for Cartesia-generated MP3s, with captions and fallback responses.
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
  voice/           # voice clip catalog, profiles, request validation
api/
  *.js             # Vercel-style server routes for OpenAI and Cartesia calls
```

Important patterns:

- Add lessons as `src/lessons/lessonN/`, then register them in `src/lessons/registry.ts`.
- Keep student-facing text in lesson-local `copy.ts`.
- Keep custom visuals lesson-local until a pattern repeats.
- Keep AI personalization constrained: AI can change labels/flavor, but code owns counts, answers, section order, and validation.
- Keep visual experiments optional unless the task is explicitly to build the answer itself.
- Keep graph Feedback progress-aware: cached summaries are keyed by node, status, progress, tried contexts, lesson title, and theme.
- Keep API keys server-side: the browser calls Vercel-style `/api` routes, and those routes call OpenAI or Cartesia.
- Use theme CSS variables for UI state surfaces, not just main panels and buttons.
- Use `review-lesson` before demos to catch answer leakage, weak gating, static visuals, and plan drift.

## Data Model

Firestore collections:

| Collection | Purpose |
| --- | --- |
| `users/{uid}` | user profile, active lesson, theme preference/cache, `lessons` progress map |
| `usernames/{username}` | username uniqueness lookup |

Each lesson progress entry tracks `lessonId`, `currentScreen`, `lastLessonScreen`, `completed`, screen-specific state, and a flexible `sectionState` map for newer lesson interactions. The old top-level single-lesson `lesson` field is no longer read or written.

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
- `OPENAI_API_KEY`
- `OPENAI_THEME_MODEL`
- `OPENAI_HINT_MODEL`
- `OPENAI_NODE_SUMMARY_MODEL`
- `CARTESIA_API`
- `CARTESIA_MODEL_ID`
- `CARTESIA_VERSION`
- `CARTESIA_DEFAULT_VOICE_ID`

OpenAI-backed hints, graph Feedback summaries, generated theme packs, and Cartesia voice clips run through Vercel-style API routes in `api/`. Coach Hint uses a second OpenAI safety pass so generated hints can include helpful numbers without directly revealing final answers. Manual fallback themes, fallback hints, local progress-based Feedback, and voice captions work without server API keys.

For local API testing with Vite, `npm run dev` serves the same `/api` routes through local middleware. You can also run a Vercel dev server:

```bash
npx vercel dev
```

Voice audio uses `CARTESIA_API` and returns MP3 data URLs directly; it does not currently cache generated audio in Firebase Storage.

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

- Latest local build passes after the optional-visual-gating and Coach Hint safety updates.
- Vite still reports a large chunk warning.
- AI-added roadmap status: Lesson 1 manual themes/character presets, hub/login theming, shared theme-state tokens, Lessons 2-5 local theme bridges, and Vercel API routes for OpenAI-backed features are present. Manual theme validation and hint/visual smoke testing are still needed before demo/deploy.
- Voice status: opt-in voice UI, shared clip catalogs, Cartesia `/api/get-voice-clip`, captions, and local fallback behavior are present for Lessons 1-5. Production voice still needs deploy QA and final voice IDs.
- Knowledge Graph status: graph navigation, status-derived nodes, reset/open actions, and progress-aware node Feedback are present locally; browser smoke testing and redeploy are still needed.
- The live demo may lag local changes until redeployed.

## License

Alpha AI Engineering project.
