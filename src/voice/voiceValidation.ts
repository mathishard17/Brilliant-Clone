import type {
  LessonVoiceClip,
  VoiceRevealPolicy,
  VoiceValidationResult,
} from './voiceTypes'

const VOICE_REVEAL_POLICIES: readonly VoiceRevealPolicy[] = [
  'safeBeforeAnswer',
  'postCorrect',
  'solutionOnly',
]

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
