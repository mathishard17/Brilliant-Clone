import type { ThemePreference } from '../themes/themeTypes'

export type VoiceProviderName = 'cartesia'
export type VoiceRevealPolicy = 'safeBeforeAnswer' | 'postCorrect' | 'solutionOnly'
export type VoiceStyle = 'storyteller' | 'mission' | 'fieldGuide' | 'helper' | 'coach' | 'studio'
export type VoicePace = 'calm' | 'medium' | 'bright'
export type VoicePitch = 'low' | 'medium' | 'high'
export type VoiceClipStatus = 'ready' | 'generating' | 'fallback'

export interface ThemeVoiceProfile {
  themePreference: ThemePreference
  provider: VoiceProviderName
  /**
   * App-owned symbolic key. The server maps this to a real Cartesia voice ID.
   */
  voiceKey: string
  style: VoiceStyle
  pace: VoicePace
  pitch?: VoicePitch
}

export interface LessonVoiceClip {
  lessonId: string
  clipKey: string
  text: string
  revealPolicy: VoiceRevealPolicy
  scriptHash: string
  caption: string
}

export interface VoiceClipRequest {
  lessonId: string
  clipKey: string
  themePreference: ThemePreference
}

export interface VoiceClipResponse {
  status: VoiceClipStatus
  audioUrl?: string
  caption: string
  scriptHash: string
}

export interface VoiceValidationResult {
  valid: boolean
  errors: string[]
}
