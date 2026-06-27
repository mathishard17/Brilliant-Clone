# Voice Roadmap

Use this folder to plan theme-matched narration for Counting Adventures.

Core rule:

```text
Voice owns delivery and accessibility. Code owns math, answers, gates, and progress.
```

## Goal

Add optional spoken narration to selected lesson moments:

- welcome lines and section transitions
- gentle encouragement after correct answers
- non-leaking hints after wrong answers
- summary/review celebration lines

Do not voice every paragraph by default. Short, purposeful audio should make the app feel alive without slowing down the learner.

## Phase Map

Work through the phases in order:

1. `phase-0-provider-spike.md` — record the Cartesia-first decision and do one tiny smoke test if needed.
2. `phase-1-voice-contract.md` — define app-owned clip keys, safety metadata, and theme voice profiles.
3. `phase-2-provider-adapter.md` — add the server-side provider/cache boundary so API keys and generated audio stay off the client.
4. `phase-3-playback-ux.md` — add opt-in playback UI, captions, and failure fallback.
5. `phase-4-lesson-rollout.md` — wire a small Lesson 1 pilot, then expand only after manual QA.

Do not skip Phase 2. Client playback should consume cached or server-signed audio, not call Cartesia or ElevenLabs directly.

## Provider Decision

Use Cartesia for the first implementation.

Cartesia is the best first fit because the app needs:

- fast, interactive voice playback
- low-latency generated lines
- theme voices that feel responsive during lesson flow
- a small provider adapter around text-to-speech calls

Keep ElevenLabs only as a backup option if Cartesia blocks on pricing, kid-appropriate voices, caching rights, or implementation limits.

Before implementation, still confirm:

- kid-appropriate voices without voice cloning risk
- browser playback reliability on iPad/mobile
- server-side API support so keys never ship to the client
- cost for cached lesson clips versus live generation
- rights to cache generated audio
- pronunciation control for lesson/theme words
- safety controls for generated text and voice style

Build a tiny `VoiceProvider` adapter around Cartesia. Do not import Cartesia directly into lesson components.

## Theme Voice Profiles

Voice should follow the active theme preference with bounded style tokens:

- **Royal:** warm fairy-tale narrator, bright and encouraging.
- **Space:** upbeat mission-control guide, clear and adventurous.
- **Dinosaurs:** curious field-guide voice, explorer energy.
- **Animals:** gentle rescue-helper voice, calm and friendly.
- **Sports:** supportive coach voice, energetic but not shouty.
- **Surprise:** playful studio host, creative and light.

Avoid imitating real people, celebrities, or specific copyrighted characters.

## Architecture Sketch

Use server-side generation and cached audio:

1. Client requests a voice clip by stable key, for example `lesson1.screen1.intro`.
2. Server resolves the active theme voice profile and safe script.
3. Server calls Cartesia or ElevenLabs with a bounded voice config.
4. Generated audio is saved to storage/CDN with a deterministic cache key.
5. Client plays the cached audio with captions visible.

Suggested cache key:

```text
voice/{provider}/{themePreference}/{lessonId}/{clipKey}/{scriptHash}.mp3
```

Never send arbitrary lesson math, answers, or user-generated freeform text to the TTS provider until safety review is done.

## Non-Goals For The First Pass

- No voice cloning.
- No student-recorded voice input.
- No fully generated lesson narration.
- No provider API keys in Vite client code.
- No automatic narration for every screen.
- No personalized lines that include the learner's name until privacy review approves it.

## Accessibility And UX Rules

- Voice is optional and starts muted/off unless the learner opts in.
- Always show the same text as captions or visible lesson copy.
- Add pause/replay controls.
- Respect browser autoplay restrictions.
- Store only a simple user preference like `voiceEnabled`.
- Keep sound effects separate from narrated instructional audio.

## Safety Rules

- TTS scripts must be authored or generated from validated safe copy slots.
- Hints must not reveal final answers earlier than the existing UI.
- Voice style can change tone, pace, and warmth, not lesson correctness.
- Do not use voice cloning for a child-facing MVP.
- Do not send the learner's name to a provider unless privacy review approves it.

## Open Questions

- Should audio be available for all lessons or only Lesson 1 first?
- Should voice clips be pre-generated for manual themes or generated on demand?
- Which Firebase runtime should host the provider adapter?
- Do we need per-theme voice IDs in profile data, or only a theme-to-voice map in code/config?
- What is the allowed monthly TTS budget for demos?
- Should the demo prefer lowest latency or most expressive narration if the two providers split on those strengths?

## Done When

- Cartesia is confirmed as the first provider, with ElevenLabs documented only as a backup.
- A clean adapter exists for future swaps if needed.
- Audio is cached and replayable.
- Captions are always visible.
- Theme voice changes match the active theme.
- Lint/build pass.
- Manual smoke test passes on desktop, iPad, and mobile.
