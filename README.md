# Princess Outfits — Royal Academy

An interactive combinatorics lesson for 3rd graders, built as a Brilliant-style learning app. Students dress a princess by tapping crowns, gowns, and shoes, discover unique outfit combinations, and learn the **multiplication shortcut** for counting choices.

**Live demo:** [https://brilliantclone-4276b.web.app](https://brilliantclone-4276b.web.app) *(deploy with `npm run firebase:deploy` to update)*

## What it teaches

- **Lesson 1: Princess Outfits** — count combinations with 2 crowns × 3 dresses = 6, then add shoes for 12 total
- Hands-on closet sandbox with instant visual feedback
- Step-by-step **Anchor Trick** explanation with tree diagram
- Progress saves to Firebase so students can leave and resume

## Tech stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Firebase Auth, Cloud Firestore, Firebase Hosting (Spark free tier)
- **Styling:** CSS with mobile-first responsive layout

## Local development

```bash
npm install
cp .env.example .env   # fill in Firebase web app config
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore** database
4. Register a web app and copy config into `.env`
5. Deploy security rules: `npx firebase deploy --only firestore:rules`

See [roadmap/phase-1-mvp.md](roadmap/phase-1-mvp.md) for the full Phase 1 checklist.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint |
| `npm run firebase:deploy` | Build + deploy hosting & Firestore rules |

## Project structure

```
src/
  screens/       # Lesson flow (registry, hub, screens 1–4)
  components/    # Closet, PrincessCanvas, OutfitLog, etc.
  services/      # Firebase auth & Firestore
  data/          # Static lesson catalog
  copy/          # Student-facing lesson text
```

## User persona

Built for **Princess** — an 8-year-old who loves dress-up, fairy tales, and seeing her custom name in the lesson. Auth uses username + password (mapped to `{username}@brilliant-clone.local` emails in Firebase).

## License

Private course project.
