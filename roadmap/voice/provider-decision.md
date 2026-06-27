# Voice Provider Decision

Status: selected for first implementation.

## Decision

Use Cartesia for the first voice implementation.

ElevenLabs remains a backup only if Cartesia blocks on:

- kid-appropriate voice availability
- pricing
- caching rights
- browser playback reliability
- server-side integration limits

## Why Cartesia First

The app needs short, responsive narration rather than long-form audiobook narration. Cartesia is the better first bet for low-latency clips, theme-responsive lesson moments, and a small server-side provider adapter.

## API Budget Rule

Do not run a broad provider shootout. Generate only 1-3 Cartesia clips before implementation if a smoke test is needed.

Recommended first smoke clips:

- neutral Lesson 1 welcome line
- one Space or Royal theme line
- one safe try-again hint

## Phase 1 Defaults

- Provider: `cartesia`
- Server env var: `CARTESIA_API`
- Voice IDs: to be selected during the Cartesia smoke test or first implementation pass
- Backup provider: `elevenlabs`
- First rollout: Lesson 1 only
- Voice behavior: opt-in, captioned, cached, and safe before answers

## Open Checks

- Confirm generated audio caching rights.
- Confirm server-side API usage and environment variable setup.
- Confirm at least one kid-appropriate voice/style.
- Confirm pronunciation controls for risky words like `Silver Helmet`, `probability`, and `sample space`.
