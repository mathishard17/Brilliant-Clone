import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'
import type { Lesson1ThemePack } from '../themes/themeTypes'
import {
  resolveVoiceClipRequest,
  validateResolvedVoiceClipRequest,
  type VoiceClipRequest,
  type VoiceClipResponse,
} from '../voice'

const getVoiceClipCallable = httpsCallable<VoiceClipRequest, VoiceClipResponse>(
  functions,
  'getVoiceClip',
)

function isUsableVoiceResponse(value: VoiceClipResponse): boolean {
  return Boolean(value.caption && value.scriptHash && value.status)
}

export async function getVoiceClipAudio(
  request: VoiceClipRequest,
  themePack?: Lesson1ThemePack | null,
): Promise<VoiceClipResponse> {
  const resolved = resolveVoiceClipRequest(request, themePack)
  if (!resolved) {
    return {
      status: 'fallback',
      caption: '',
      scriptHash: '',
    }
  }

  const validation = validateResolvedVoiceClipRequest(resolved)
  if (!validation.valid) {
    return resolved.fallbackResponse
  }

  try {
    const result = await getVoiceClipCallable(request)
    return isUsableVoiceResponse(result.data) ? result.data : resolved.fallbackResponse
  } catch {
    return resolved.fallbackResponse
  }
}
