# Royal Academy — Counting Adventures

Interactive royal/fantasy-themed combinatorics and probability lessons for 3rd graders, built as a Brilliant-style React app with Firebase Auth, Firestore progress, and Firebase Hosting.

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

- Username/password sign-up with a custom princess name.
- Home hub renders lessons from `src/lessons/registry.ts`.
- Per-lesson progress bars, resume, reset, and completion badges.
- Firestore progress stored per lesson in `users/{uid}.lessons`.
- Meaningful section state persists for newer lessons: challenge answers, solved gates, page indices, and key visual work.
- Interactive visuals: closets, jewel slots, treasure bags, spinners, sorting cards.
- Two-stage wrong-answer feedback and duplicate-answer blocking.
- Mobile-first layout for phones, iPads, and desktop.
- Project skills for curriculum work:
  - `create-lesson`
  - `review-lesson`
  - `revise-lesson`

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
  services/        # Firebase Auth and Firestore I/O
  types/           # lesson/user TypeScript models
  utils/           # progress normalization, retry, resume, rendering helpers
```

Important patterns:

- Add lessons as `src/lessons/lessonN/`, then register them in `src/lessons/registry.ts`.
- Keep student-facing text in lesson-local `copy.ts`.
- Keep custom visuals lesson-local until a pattern repeats.
- Use `review-lesson` before demos to catch answer leakage, weak gating, static visuals, and plan drift.

## Data Model

Firestore collections:

| Collection | Purpose |
| --- | --- |
| `users/{uid}` | user profile, active lesson, `lessons` progress map, legacy `lesson` field |
| `usernames/{username}` | username uniqueness lookup |

Each lesson progress entry tracks `lessonId`, `currentScreen`, `lastLessonScreen`, `completed`, legacy screen state, and a flexible `sectionState` map for newer lesson interactions.

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
- The live demo may lag local changes until redeployed.

## License

Alpha AI Engineering project.