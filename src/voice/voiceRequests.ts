import { createVoiceFallbackResponse } from './voiceCache'
import { getVoiceClip } from './voiceClips'
import type { Lesson1ThemePack } from '../themes/themeTypes'
import type {
  LessonVoiceClip,
  VoiceClipRequest,
  VoiceClipResponse,
  VoiceValidationResult,
} from './voiceTypes'
import { validateLessonVoiceClip } from './voiceValidation'

export interface ResolvedVoiceClipRequest {
  clip: LessonVoiceClip
  fallbackResponse: VoiceClipResponse
}

export function resolveVoiceClipRequest(
  request: VoiceClipRequest,
  themePack?: Lesson1ThemePack | null,
): ResolvedVoiceClipRequest | null {
  const clip = getVoiceClip(request.clipKey, themePack)
  if (!clip || clip.lessonId !== request.lessonId) return null

  return {
    clip,
    fallbackResponse: createVoiceFallbackResponse(clip),
  }
}

export function validateResolvedVoiceClipRequest({
  clip,
}: ResolvedVoiceClipRequest): VoiceValidationResult {
  const errors = validateLessonVoiceClip(clip).errors

  return {
    valid: errors.length === 0,
    errors,
  }
}
