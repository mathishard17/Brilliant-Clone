import { createVoiceFallbackResponse } from './voiceCache'
import { getVoiceClip } from './voiceClips'
import { getThemeVoiceProfile } from './voiceProfiles'
import type { Lesson1ThemePack } from '../themes/themeTypes'
import type {
  LessonVoiceClip,
  ThemeVoiceProfile,
  VoiceClipRequest,
  VoiceClipResponse,
  VoiceValidationResult,
} from './voiceTypes'
import { validateLessonVoiceClip, validateThemeVoiceProfile } from './voiceValidation'

export interface ResolvedVoiceClipRequest {
  clip: LessonVoiceClip
  profile: ThemeVoiceProfile
  fallbackResponse: VoiceClipResponse
}

export function resolveVoiceClipRequest(
  request: VoiceClipRequest,
  themePack?: Lesson1ThemePack | null,
): ResolvedVoiceClipRequest | null {
  const clip = getVoiceClip(request.clipKey, themePack)
  if (!clip || clip.lessonId !== request.lessonId) return null

  const profile = getThemeVoiceProfile(request.themePreference)
  return {
    clip,
    profile,
    fallbackResponse: createVoiceFallbackResponse(clip),
  }
}

export function validateResolvedVoiceClipRequest({
  clip,
  profile,
}: ResolvedVoiceClipRequest): VoiceValidationResult {
  const errors = [
    ...validateThemeVoiceProfile(profile).errors,
    ...validateLessonVoiceClip(clip).errors,
  ]

  return {
    valid: errors.length === 0,
    errors,
  }
}
