import type { Lesson1ThemePack } from '../themes/themeTypes'
import {
  type LessonVoiceClip,
  resolveVoiceClipRequest,
  validateResolvedVoiceClipRequest,
  type VoiceClipRequest,
  type VoiceClipResponse,
} from '../voice'
import { postAiEndpoint } from './aiBackend'

function isUsableVoiceResponse(value: VoiceClipResponse): boolean {
  return Boolean(value.caption && value.scriptHash && value.status)
}

function withDevDebug(response: VoiceClipResponse, debugError: string): VoiceClipResponse {
  return import.meta.env.DEV ? { ...response, debugError } : response
}

interface VoiceClipApiRequest extends VoiceClipRequest {
  clip: LessonVoiceClip
}

export async function getVoiceClipAudio(
  request: VoiceClipRequest,
  themePack?: Lesson1ThemePack | null,
): Promise<VoiceClipResponse> {
  const resolved = resolveVoiceClipRequest(request, themePack)
  if (!resolved) {
    return withDevDebug(
      {
        status: 'fallback',
        caption: '',
        scriptHash: '',
      },
      'Voice clip could not be resolved on the client.',
    )
  }

  const validation = validateResolvedVoiceClipRequest(resolved)
  if (!validation.valid) {
    return withDevDebug(
      resolved.fallbackResponse,
      `Voice clip request failed client validation: ${validation.errors.join(' ')}`,
    )
  }

  try {
    const result = await postAiEndpoint<VoiceClipApiRequest, VoiceClipResponse>('/api/get-voice-clip', {
      ...request,
      clip: resolved.clip,
    })
    return isUsableVoiceResponse(result)
      ? result
      : withDevDebug(resolved.fallbackResponse, 'Voice clip API returned an unusable response.')
  } catch (error) {
    return withDevDebug(
      resolved.fallbackResponse,
      error instanceof Error ? error.message : 'Voice clip request failed on the client.',
    )
  }
}
