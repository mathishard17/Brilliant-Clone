# Phase 6: Voice Reflection And Transfer

## Goal

Use optional voice reflection to help learners explain where they see the same math structure in the real world.

## Experience

After a node is mastered, the app asks a short reflective question:

"Where else have you seen things grouped like this?"

The learner may answer verbally or skip.

## Likely Files

- `src/voice/`
- `src/hooks/useVoiceClip.ts`
- `src/components/VoiceButton.tsx`
- `api/get-voice-clip.js`
- `src/services/userProgress.ts`
- `src/types/user.ts`

## Implementation Slices

1. Add reflection prompt clip keys.
2. Add optional reflection UI after node completion.
3. Decide privacy-safe storage rules before recording audio.
4. Store summary tags or typed reflections first; avoid raw audio by default.
5. Use reflection tags as future world-lens prompt context.

## Parallel Agent Plan

- Agent A: Voice clip catalog proposal
  - Draft reflection clip keys and safe scripts for each current node.
  - Keep scripts short and answer-neutral.
- Agent B: Reflection UI proposal
  - Design a skippable post-completion reflection card.
  - Include voice-on and voice-off states.
- Agent C: Privacy/storage review
  - Propose the minimal stored shape for typed reflections or tags.
  - Explicitly reject raw audio storage unless a future privacy plan exists.
- Agent D: API/cache review
  - Review `api/get-voice-clip.js` and voice cache behavior for new reflection clips.
  - Identify backend changes only; parent applies shared edits.
- Agent E: Transfer prompt proposal
  - Draft how reflection tags can later become world-lens context without changing math logic.
- Parent/integrator:
  - Owns `src/voice/voiceClips.ts`, `api/get-voice-clip.js`, profile data shape, reflection persistence, and final privacy checks.

## Privacy Guardrails

- Reflection must be optional.
- Do not store raw child audio without a clear privacy plan.
- Prefer typed text or local summary tags.
- Keep parent/teacher visibility explicit if added later.

## Done When

- Learner can hear a reflection prompt.
- Learner can skip reflection.
- Stored reflection data is safe and minimal.
- `npm run lint` passes.
- `npm run build` passes.

## Manual QA

- Voice off.
- Voice on.
- Skip reflection.
- Submit a typed reflection.
- Confirm profile data stays minimal.
