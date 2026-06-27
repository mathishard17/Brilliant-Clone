import type { ThemePreference } from '../themes/themeTypes'
import type { LessonVoiceClip, VoiceClipResponse, VoiceProviderName } from './voiceTypes'

export const VOICE_AUDIO_EXTENSION = 'mp3'

export interface VoiceCacheKeyInput {
  provider: VoiceProviderName
  themePreference: ThemePreference
  lessonId: string
  clipKey: string
  scriptHash: string
  extension?: typeof VOICE_AUDIO_EXTENSION
}

export function createVoiceScriptHash(text: string): string {
  let hash = 5381
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index)
  }

  return (hash >>> 0).toString(36)
}

function sanitizeCacheSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createVoiceCacheKey({
  provider,
  themePreference,
  lessonId,
  clipKey,
  scriptHash,
  extension = VOICE_AUDIO_EXTENSION,
}: VoiceCacheKeyInput): string {
  return [
    'voice',
    sanitizeCacheSegment(provider),
    sanitizeCacheSegment(themePreference),
    sanitizeCacheSegment(lessonId),
    sanitizeCacheSegment(clipKey),
    `${sanitizeCacheSegment(scriptHash)}.${extension}`,
  ].join('/')
}

export function createVoiceFallbackResponse(clip: LessonVoiceClip): VoiceClipResponse {
  return {
    status: 'fallback',
    caption: clip.caption,
    scriptHash: clip.scriptHash,
  }
}
