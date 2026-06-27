# Phase 1: Voice Contract

Goal: define a safe app-owned voice contract before wiring a provider.

Status: complete for the first local contract pass. Code is present in `src/voice/`.

## Data Shape

Add a bounded voice config separate from lesson math:

```ts
type VoiceProviderName = 'cartesia'
type VoiceRevealPolicy = 'safeBeforeAnswer' | 'postCorrect' | 'solutionOnly'

interface ThemeVoiceProfile {
  themePreference: ThemePreference
  provider: VoiceProviderName
  voiceKey: string
  style: 'storyteller' | 'mission' | 'fieldGuide' | 'helper' | 'coach' | 'studio'
  pace: 'calm' | 'medium' | 'bright'
  pitch?: 'low' | 'medium' | 'high'
}

interface LessonVoiceClip {
  lessonId: string
  clipKey: string
  text: string
  revealPolicy: VoiceRevealPolicy
  scriptHash: string
  caption: string
}
```

## Rules

- `clipKey` is stable and code-owned.
- `text` comes from validated lesson copy or a safe voice copy slot.
- `revealPolicy` controls when a clip can play.
- `safeBeforeAnswer` clips must not include final answers, equations, exact counts, or intermediate counts that reveal the answer.
- `postCorrect` clips may include a short confirmation after the learner is correct.
- `solutionOnly` clips may include worked answers, but only behind the same UI reveal gate as the written solution.
- Cartesia voice IDs stay in config/server code, not in lesson components.
- Captions must match the spoken script closely enough for accessibility.
- Clip text should not include the learner's name in the first implementation.
- Keep the type narrow for the first pass. Add another provider only if Cartesia blocks and the backup is approved.

## Validation

Add validation before provider integration:

- reject unsafe numbers in `safeBeforeAnswer` clips unless explicitly allowlisted
- reject answer words for the active challenge
- reject empty captions
- reject unknown provider names, style tokens, or pace values
- keep provider-specific request options behind an adapter-owned config

## First Clip Set

Start with Lesson 1 only:

- `lesson1.screen1.welcome`
- `lesson1.screen2.anchorIntro`
- `lesson1.screen3.tryAgain`
- `lesson1.screen4.complete`

Then expand to Lessons 4-5 once spinner labels/icons are manually smoke-tested.

## Files To Expect

Implementation files:

- `src/voice/voiceTypes.ts`
- `src/voice/voiceProfiles.ts`
- `src/voice/voiceClips.ts`
- `src/voice/voiceCache.ts`
- `src/voice/voiceRequests.ts`
- `src/voice/voiceValidation.ts`
- `src/voice/index.ts`

## Done When

- [x] voice clip keys are stable
- [x] theme voice profiles exist for each manual theme
- [x] answer-leak checks cover `safeBeforeAnswer` voice text
- [x] no provider code is imported by lesson screens
- [x] unit-level validation is possible without network calls
- [x] Phase 2 has enough typed data to build cache keys and provider requests
