import { useState } from 'react'
import { generateSafeHint, type HintRequest } from '../services/hintGeneration'
import { useLesson } from '../hooks/useLesson'
import { renderLessonText } from '../utils/renderLessonText'
import { summarizeStudentMemoryForHint } from '../utils/studentMemory'
import { LessonButton } from './LessonButton'

interface HintButtonProps extends HintRequest {
  disabled?: boolean
}

export function HintButton({ disabled = false, ...request }: HintButtonProps) {
  const requestKey = `${request.lessonId}:${request.conceptKey}:${request.prompt}`
  return <HintButtonContent key={requestKey} disabled={disabled} request={request} />
}

function HintButtonContent({
  disabled,
  request,
}: {
  disabled: boolean
  request: HintRequest
}) {
  const { profile, recordStudentMemoryEvent } = useLesson()
  const [hint, setHint] = useState<string | null>(null)
  const [source, setSource] = useState<'generated' | 'fallback' | null>(null)
  const [debugError, setDebugError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const buttonDisabled = disabled || loading || hint !== null

  async function handleClick() {
    if (buttonDisabled) return
    setLoading(true)
    try {
      const result = await generateSafeHint({
        ...request,
        studentMemory: summarizeStudentMemoryForHint(profile.studentMemory, request.conceptKey),
      })
      setHint(result.hint)
      setSource(result.source)
      setDebugError(result.debugError ?? null)
      void recordStudentMemoryEvent({
        type: 'hintRequested',
        lessonId: request.lessonId,
        conceptKey: request.conceptKey,
        label: request.conceptLabel,
        learnerAnswer: request.learnerAnswer,
      }).catch(() => undefined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hint-button">
      <LessonButton
        label={loading ? 'AI coach is thinking...' : hint ? 'Coach hint shown' : 'Ask AI Coach'}
        onClick={() => void handleClick()}
        variant="secondary"
        disabled={buttonDisabled}
      />
      {hint && (
        <div className="hint-button__message" role="status" aria-live="polite">
          <span className="hint-button__eyebrow">
            {source === 'generated' ? 'AI Hint Coach' : 'Coach fallback'}
          </span>
          <p>{renderLessonText(hint)}</p>
          {import.meta.env.DEV && debugError && (
            <p className="hint-button__debug">Debug: {debugError}</p>
          )}
        </div>
      )}
    </div>
  )
}
