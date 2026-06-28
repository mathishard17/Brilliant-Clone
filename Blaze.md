# Avoiding Firebase Blaze

Firebase Blaze is not required to use OpenAI APIs directly. It is required only if this app uses Firebase server infrastructure, such as Cloud Functions, to call OpenAI or other external APIs.

## Current Situation

The app previously called Firebase callable functions for optional AI features:

- AI hints
- Generated theme packs
- Knowledge-node summaries
- Generated concept maps and node material
- Learning notes and answer feedback
- Voice clips

Those calls require a backend so API keys never ship to the browser. The repo no longer configures a Firebase Functions source in `firebase.json`; backend AI/provider calls live behind Vercel-style API routes.

## No-Blaze Option

Use Firebase Spark for Auth, Firestore, and static app hosting if desired, and move AI calls to a separate backend such as Vercel, Netlify, Cloudflare Workers, or Supabase Edge Functions.

This repo now includes a Vercel-style `/api` backend scaffold:

- `/api/generate-ai-hint`
- `/api/generate-answer-feedback`
- `/api/generate-concept-map`
- `/api/generate-custom-theme`
- `/api/generate-learning-notes`
- `/api/generate-node-material`
- `/api/generate-knowledge-node-summary`
- `/api/get-voice-clip`

Set `OPENAI_API_KEY` in Vercel project environment variables to enable the OpenAI-backed endpoints. Set `CARTESIA_API` to enable generated voice audio. Optional Firebase Admin credentials let `/api/get-voice-clip` cache eligible generated MP3s in Firebase Storage.

## Cost

Vercel Hobby is generally free for small personal projects within platform limits. OpenAI usage is billed separately by OpenAI. If traffic grows or you need commercial/team limits, Vercel may require a paid plan.

## Notes

The voice endpoint now calls Cartesia from `/api/get-voice-clip`. Without Firebase Admin credentials, it returns MP3 audio as a data URL; with Firebase Admin credentials and a Storage bucket, eligible narration clips can be cached in Firebase Storage.
