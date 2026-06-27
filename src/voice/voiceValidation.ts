import { THEME_PREFERENCES } from '../themes/themeTypes'
import type {
  LessonVoiceClip,
  ThemeVoiceProfile,
  VoicePace,
  VoicePitch,
  VoiceProviderName,
  VoiceRevealPolicy,
  VoiceStyle,
  VoiceValidationResult,
} from './voiceTypes'

const VOICE_PROVIDERS: readonly VoiceProviderName[] = ['cartesia']
const VOICE_REVEAL_POLICIES: readonly VoiceRevealPolicy[] = [
  'safeBeforeAnswer',
  'postCorrect',
  'solutionOnly',
]
const VOICE_STYLES: readonly VoiceStyle[] = [
  'storyteller',
  'mission',
  'fieldGuide',
  'helper',
  'coach',
  'studio',
]
const VOICE_PACES: readonly VoicePace[] = ['calm', 'medium', 'bright']
const VOICE_PITCHES: readonly VoicePitch[] = ['low', 'medium', 'high']

const NUMBER_WORD_PATTERN =
  /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|forty)\b/i
const DIGIT_OR_EQUATION_PATTERN = /[\d=×*/+]/
const EARLY_REVEAL_PATTERN = /\b(answer|solution|equals|out of|total is|there are)\b/i

function result(errors: string[]): VoiceValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  }
}

function isOneOf<T extends string>(value: string, options: readonly T[]): value is T {
  return (options as readonly string[]).includes(value)
}

function hasText(value: string): boolean {
  return value.trim().length > 0
}

export function validateThemeVoiceProfile(profile: ThemeVoiceProfile): VoiceValidationResult {
  const errors: string[] = []

  if (!THEME_PREFERENCES.includes(profile.themePreference)) {
    errors.push(`Unknown theme preference: ${profile.themePreference}`)
  }
  if (!isOneOf(profile.provider, VOICE_PROVIDERS)) {
    errors.push(`Unknown voice provider: ${profile.provider}`)
  }
  if (!hasText(profile.voiceKey)) {
    errors.push('Voice profile is missing a voiceKey.')
  }
  if (!isOneOf(profile.style, VOICE_STYLES)) {
    errors.push(`Unknown voice style: ${profile.style}`)
  }
  if (!isOneOf(profile.pace, VOICE_PACES)) {
    errors.push(`Unknown voice pace: ${profile.pace}`)
  }
  if (profile.pitch && !isOneOf(profile.pitch, VOICE_PITCHES)) {
    errors.push(`Unknown voice pitch: ${profile.pitch}`)
  }

  return result(errors)
}

export function validateLessonVoiceClip(
  clip: LessonVoiceClip,
  blockedTerms: readonly string[] = [],
): VoiceValidationResult {
  const errors: string[] = []
  const combinedText = `${clip.text} ${clip.caption}`

  if (!hasText(clip.lessonId)) errors.push('Voice clip is missing a lessonId.')
  if (!hasText(clip.clipKey)) errors.push('Voice clip is missing a clipKey.')
  if (!hasText(clip.text)) errors.push('Voice clip is missing text.')
  if (!hasText(clip.caption)) errors.push('Voice clip is missing a caption.')
  if (!hasText(clip.scriptHash)) errors.push('Voice clip is missing a scriptHash.')
  if (!isOneOf(clip.revealPolicy, VOICE_REVEAL_POLICIES)) {
    errors.push(`Unknown reveal policy: ${clip.revealPolicy}`)
  }

  if (clip.revealPolicy === 'safeBeforeAnswer') {
    if (DIGIT_OR_EQUATION_PATTERN.test(combinedText)) {
      errors.push('safeBeforeAnswer clip includes a digit or equation symbol.')
    }
    if (NUMBER_WORD_PATTERN.test(combinedText)) {
      errors.push('safeBeforeAnswer clip includes a number word.')
    }
    if (EARLY_REVEAL_PATTERN.test(combinedText)) {
      errors.push('safeBeforeAnswer clip includes reveal-style wording.')
    }
  }

  blockedTerms.forEach((term) => {
    const trimmed = term.trim()
    if (!trimmed) return
    if (combinedText.toLowerCase().includes(trimmed.toLowerCase())) {
      errors.push(`Voice clip includes blocked term: ${trimmed}`)
    }
  })

  return result(errors)
}

export function validateVoiceCatalog(
  profiles: readonly ThemeVoiceProfile[],
  clips: readonly LessonVoiceClip[],
): VoiceValidationResult {
  const errors = [
    ...profiles.flatMap((profile) => validateThemeVoiceProfile(profile).errors),
    ...clips.flatMap((clip) => validateLessonVoiceClip(clip).errors),
  ]

  return result(errors)
}
