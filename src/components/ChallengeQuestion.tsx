import { useState, type FormEvent } from 'react'
import { renderLessonText } from '../utils/renderLessonText'
import { LessonButton } from './LessonButton'

interface ChallengeQuestionProps {
  prompt: string
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  attemptedAnswers?: readonly string[]
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
  attemptedAnswers: savedAttemptedAnswers = [],
  disabled = false,
  submitted = false,
  allowRetry = false,
}: ChallengeQuestionProps) {
  const [attemptState, setAttemptState] = useState<{ prompt: string; answers: string[] }>({
    prompt,
    answers: [],
  })
  const [repeatState, setRepeatState] = useState<{ prompt: string; message: string } | null>(null)
  const inputDisabled = submitted && !allowRetry
  const canSubmit = !disabled && isValidNumeric(value) && (!submitted || allowRetry)
  const normalizedValue = value.trim()
  const localAttemptedAnswers = attemptState.prompt === prompt ? attemptState.answers : []
  const attemptedAnswers = [...new Set([...savedAttemptedAnswers, ...localAttemptedAnswers])]
  const repeatMessage = repeatState?.prompt === prompt ? repeatState.message : null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    if (attemptedAnswers.includes(normalizedValue)) {
      setRepeatState({
        prompt,
        message: `You already tried **${normalizedValue}**. Try a different answer!`,
      })
      return
    }

    setAttemptState({ prompt, answers: [...attemptedAnswers, normalizedValue] })
    setRepeatState(null)
    onSubmit()
  }

  return (
    <form className="challenge" onSubmit={handleSubmit}>
      <p className="challenge__prompt">{renderLessonText(prompt)}</p>
      <input
        type="number"
        className="challenge__input form-input"
        value={value}
        onChange={(e) => {
          setRepeatState(null)
          onChange(e.target.value)
        }}
        disabled={inputDisabled}
        min={0}
        inputMode="numeric"
        aria-label="Your answer"
      />
      {repeatMessage && (
        <p className="challenge__repeat-warning" role="status">
          {renderLessonText(repeatMessage)}
        </p>
      )}
      <LessonButton type="submit" label="Submit" disabled={!canSubmit} />
    </form>
  )
}
