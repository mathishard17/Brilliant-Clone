# Phase 2: Provider Adapter And Audio Cache

Goal: create the server-side boundary that turns safe voice clips into cached audio URLs.

Status: first scaffold implemented. Local request/cache/fallback helpers exist in `src/voice/`, and `functions/getVoiceClip` can call Cartesia server-side, cache MP3 files in Cloud Storage, and return signed URLs after deployment.

## Why This Phase Exists

Cartesia keys must never ship in Vite client code. The client should ask for a stable clip key and receive a cached or short-lived audio URL.

## Server Contract

Define a provider-neutral request shape:

```ts
interface VoiceClipRequest {
  lessonId: string
  clipKey: string
  themePreference: ThemePreference
}

interface VoiceClipResponse {
  status: 'ready' | 'generating' | 'fallback'
  audioUrl?: string
  caption: string
  scriptHash: string
}
```

## Adapter Rules

- Cartesia API keys live only in server environment variables. Use `CARTESIA_API` for the first implementation.
- Never create a `VITE_CARTESIA_*` variable; Vite exposes `VITE_*` values to the browser.
- Cache key includes provider, theme preference, lesson ID, clip key, and script hash.
- If cached audio exists, return it without calling the provider.
- If generation fails, return text/caption fallback and do not block lesson progress.
- Log provider failures without logging sensitive keys or unnecessary student data.
- Do not generate clips for unknown `clipKey` values.
- Do not generate `solutionOnly` clips until the client sends proof that the written solution gate is open, or leave those clips out of the first pass.
- Keep the adapter boundary provider-neutral enough that ElevenLabs can replace Cartesia later, but implement only Cartesia first.

## Firebase Options

Prefer one of:

- Firebase Functions callable/HTTPS endpoint plus Cloud Storage for audio files.
- Firebase App Hosting backend route if the project moves to that stack later.

For the current Vite/Firebase Hosting app, Firebase Functions is the likely first implementation.

## Storage

Cache generated audio outside the user profile:

- Cloud Storage path: `voice/{provider}/{themePreference}/{lessonId}/{clipKey}/{scriptHash}.mp3`
- Firestore metadata document if needed: generation status, created timestamp, provider, script hash

Do not store provider responses in `users/{uid}`.

## Verification

- Unit test cache key generation.
- Unit test unknown clip rejection.
- Unit test fallback response when provider generation fails.
- Manual test one cached clip request with local emulator or a staging Firebase project.

## Done When

- [x] local request/cache/fallback design is implemented behind a provider-neutral helper interface
- [x] provider secrets are documented as server-only
- [x] server endpoint is implemented
- [x] cached audio can be reused from Cloud Storage after deployment
- [x] fallback responses include captions
- [x] no lesson component imports Cartesia SDK code

## Remaining Manual / Deploy Work

- Deploy or run the Functions emulator before real audio can be requested.
- Confirm Cartesia cache rights before using generated clips beyond local/demo testing.
- Pick real Cartesia voice IDs and configure `CARTESIA_DEFAULT_VOICE_ID` or per-theme `CARTESIA_VOICE_ID_*` values if the default example voice is not suitable.
