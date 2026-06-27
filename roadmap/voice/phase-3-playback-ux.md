# Phase 3: Playback UX

Goal: add voice playback without interrupting lesson flow.

Status: implementation present. `VoiceButton`, `useVoiceClip`, a persisted `voiceEnabled` toggle, opt-in autoplay for instruction clips, and replay buttons are implemented. Manual smoke testing remains.

## Components

Add shared UI before lesson-specific wiring:

- `VoiceToggle` for enabling/disabling narration.
- `VoiceButton` for playing, replaying, and pausing a clip.
- `VoiceCaption` for visible matching text.
- `useVoiceClip(clipKey)` hook for loading clip metadata/audio.
- `VoiceProvider` or app-level context only if state needs to be shared across screens.

## UX Rules

- No autoplay until the learner turns voice on.
- Use autoplay only for short instruction/tip clips that make sense at page entry.
- Keep shortcut, summary, solution, and celebration clips manual unless the learner presses play.
- Always show text captions.
- Provide replay and pause.
- Keep controls large enough for iPad use.
- Show a quiet loading state while audio is fetched.
- If audio fails, lesson progress must continue normally.
- Voice controls should not cover challenge inputs or Continue buttons.
- Respect reduced-motion and browser autoplay restrictions.

## Storage

Store only simple preferences:

- `voiceEnabled`
- optional `voiceSpeed`
- optional `preferredVoiceVariant`

Do not store provider responses in user profile data.

## First UX Placement

Start small:

1. Add a Home Hub or lesson chrome voice toggle.
2. Add one replay button next to a Lesson 1 welcome/intro line.
3. Add captions under the button using the exact clip caption.
4. Confirm the lesson is fully usable when audio fails or is disabled.

## Verification

- Keyboard can reach and operate voice controls.
- Voice disabled path renders no broken buttons.
- Audio failure shows text/caption fallback.
- Returning home and re-entering preserves `voiceEnabled`.
- Manual smoke test passes on desktop and mobile.

## Done When

- [x] voice can be turned on/off from the app header
- [x] one Lesson 1 clip can request cached audio
- [x] pause/replay works through `VoiceButton`
- [x] instruction clips can autoplay once per page when Voice is on
- [x] captions are visible
- [x] failures fall back to caption-only mode
- [ ] manual smoke test passes on desktop, iPad, and mobile
