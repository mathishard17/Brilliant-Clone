import { useState } from 'react'
import { generateSafeHint, type HintRequest } from '../services/hintGeneration'
import { renderLessonText } from '../utils/renderLessonText'
import { LessonButton } from './LessonButton'

interface HintButtonProps extends HintRequest {
  disabled?: boolean
}

export function HintButton({ disabled = false, ...request }: HintButtonProps) {
  const [hint, setHint] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const buttonDisabled = disabled || loading || hint !== null

  async function handleClick() {
    if (buttonDisabled) return
    setLoading(true)
    const nextHint = await generateSafeHint(request)
    setHint(nextHint)
    setLoading(false)
  }

  return (
    <div className="hint-button">
      <LessonButton
        label={loading ? 'Thinking of a hint...' : hint ? 'Hint shown' : 'Need a hint?'}
        onClick={() => void handleClick()}
        variant="secondary"
        disabled={buttonDisabled}
      />
      {hint && (
        <p className="hint-button__message" role="status" aria-live="polite">
          {renderLessonText(hint)}
        </p>
      )}
    </div>
  )
}
