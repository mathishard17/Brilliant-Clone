import type { LessonVoiceClip, VoiceClipResponse } from './voiceTypes'

export function createVoiceScriptHash(text: string): string {
  let hash = 5381
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index)
  }

  return (hash >>> 0).toString(36)
}

export function createVoiceFallbackResponse(clip: LessonVoiceClip): VoiceClipResponse {
  return {
    status: 'fallback',
    caption: clip.caption,
    scriptHash: clip.scriptHash,
  }
}
