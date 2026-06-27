import { useEffect, useRef } from 'react'
import { useVoiceClip } from '../hooks/useVoiceClip'
import type { ThemePreference } from '../themes/themeTypes'
import { renderLessonText } from '../utils/renderLessonText'

interface FeedbackVoiceCue {
  correctClipKey: string
  enabled: boolean
  lessonId: string
  playToken?: number | string | null
  themePreference: ThemePreference
  tryAgainClipKey: string
}

interface FeedbackBannerProps {
  message: string
  variant: 'success' | 'error' | 'info'
  voiceCue?: FeedbackVoiceCue
}

function FeedbackVoiceCuePlayer({
  cue,
  message,
  variant,
}: {
  cue: FeedbackVoiceCue
  message: string
  variant: 'success' | 'error'
}) {
  const clipKey = variant === 'success' ? cue.correctClipKey : cue.tryAgainClipKey
  const outcome = variant === 'success' ? 'correct' : 'tryAgain'
  const cueKey = `${cue.lessonId}:${clipKey}:${cue.themePreference}:${variant}:${String(cue.playToken)}`
  const playedCueRef = useRef<string | null>(null)
  const { play } = useVoiceClip({
    lessonId: cue.lessonId,
    clipKey,
    feedbackContext: cue.playToken == null
      ? undefined
      : {
          outcome,
          message,
          nonce: String(cue.playToken),
        },
    themePreference: cue.themePreference,
  })

  useEffect(() => {
    if (cue.playToken == null || !cue.enabled || playedCueRef.current === cueKey) return
    playedCueRef.current = cueKey
    void play()
  }, [cue.enabled, cue.playToken, cueKey, play])

  return null
}

export function FeedbackBanner({ message, variant, voiceCue }: FeedbackBannerProps) {
  const icon = variant === 'success' ? '✅ ' : variant === 'error' ? '❌ ' : ''
  return (
    <div className={`feedback-banner feedback-banner--${variant}`} role="status" aria-live="polite">
      {voiceCue && variant !== 'info' && (
        <FeedbackVoiceCuePlayer cue={voiceCue} message={message} variant={variant} />
      )}
      {icon}
      {renderLessonText(message)}
    </div>
  )
}
