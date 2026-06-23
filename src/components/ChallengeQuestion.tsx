import type { FormEvent } from 'react'
import { renderLessonText } from './LessonText'
import { LessonButton } from './LessonButton'

interface ChallengeQuestionProps {
  prompt: string
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  submitted?: boolean
  allowRetry?: boolean
}

function isValidNumeric(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed === '') return false
  const num = Number(trimmed)
  return Number.isFinite(num) && num >= 0
}

export function ChallengeQuestion({
  prompt,
  value,
  onChange,
  onSubmit,
  disabled = false,
  submitted = false,
  allowRetry = false,
}: ChallengeQuestionProps) {
  const inputDisabled = submitted && !allowRetry
  const canSubmit = !disabled && isValidNumeric(value) && (!submitted || allowRetry)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (canSubmit) {
      onSubmit()
    }
  }

  return (
    <form className="challenge" onSubmit={handleSubmit}>
      <p className="challenge__prompt">{renderLessonText(prompt)}</p>
      <input
        type="number"
        className="challenge__input form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={inputDisabled}
        min={0}
        inputMode="numeric"
        aria-label="Your answer"
      />
      <LessonButton type="submit" label="Submit" disabled={!canSubmit} />
    </form>
  )
}
