import { useEffect, useRef } from 'react'
import { useVoiceClip } from '../hooks/useVoiceClip'
import { renderLessonText } from '../utils/renderLessonText'
import type { VoiceClipRequest } from '../voice'
import { LessonButton } from './LessonButton'

interface VoiceButtonProps extends VoiceClipRequest {
  autoPlay?: boolean
  enabled: boolean
  label?: string
}

export function VoiceButton({
  autoPlay = false,
  enabled,
  label = 'Listen',
  lessonId,
  clipKey,
  themePreference,
}: VoiceButtonProps) {
  const requestKey = `${lessonId}:${clipKey}:${themePreference}`
  const autoPlayedRef = useRef<string | null>(null)
  const { caption, error, loading, pause, play, playing, status } = useVoiceClip({
    lessonId,
    clipKey,
    themePreference,
  })
  const buttonLabel = !enabled ? 'Voice is off' : loading ? 'Loading voice...' : playing ? 'Pause voice' : label

  useEffect(() => {
    if (!autoPlay || !enabled || autoPlayedRef.current === requestKey) return
    autoPlayedRef.current = requestKey
    void play()
  }, [autoPlay, enabled, play, requestKey])

  return (
    <div className="voice-button">
      <LessonButton
        label={buttonLabel}
        onClick={() => {
          if (playing) {
            pause()
            return
          }
          void play()
        }}
        variant="secondary"
        disabled={!enabled || loading}
        pressed={playing}
      />
      {!enabled && (
        <p className="voice-button__status" role="status">
          Turn on Voice in the top bar to listen.
        </p>
      )}
      {caption && (
        <p className="voice-button__caption" aria-live="polite">
          {renderLessonText(caption)}
        </p>
      )}
      {error && (
        <p className="voice-button__status" role="status">
          {error}
        </p>
      )}
      {status === 'fallback' && !error && (
        <p className="voice-button__status" role="status">
          Voice audio is warming up. Caption is ready.
        </p>
      )}
    </div>
  )
}
