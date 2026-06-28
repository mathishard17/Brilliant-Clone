import type { ThemePreference } from '../themes/themeTypes'

export type VoiceRevealPolicy = 'safeBeforeAnswer' | 'postCorrect' | 'solutionOnly'
export type VoiceClipStatus = 'ready' | 'fallback'

export interface LessonVoiceClip {
  lessonId: string
  clipKey: string
  text: string
  revealPolicy: VoiceRevealPolicy
  scriptHash: string
  caption: string
}

export interface VoiceFeedbackContext {
  outcome: 'correct' | 'tryAgain'
  message: string
  nonce: string
}

export interface VoiceClipRequest {
  lessonId: string
  clipKey: string
  themePreference: ThemePreference
  cacheBust?: string
  feedbackContext?: VoiceFeedbackContext
  storageCacheScope?: 'global' | 'user'
  storageCacheUserId?: string
}

export interface VoiceClipResponse {
  status: VoiceClipStatus
  audioUrl?: string
  caption: string
  scriptHash: string
  debugError?: string
}

export interface VoiceValidationResult {
  valid: boolean
  errors: string[]
}
