import { useState, type FormEvent } from 'react'
import { renderLessonText } from '../utils/renderLessonText'
import { LessonButton } from './LessonButton'

export interface RetrievalPracticeProblem {
  id: string
  prompt: string
  answer: number
  correctFeedback: string
  solutionFeedback?: string
  tryAgainFeedback: string
}

interface RetrievalPracticeSetProps {
  initiallySolved?: boolean
  onSolvedChange?: (solved: boolean) => void
  problems: RetrievalPracticeProblem[]
  subtitle?: string
}

function normalizeAnswer(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const answer = Number(trimmed)
  return Number.isFinite(answer) ? answer : null
}

function normalizeNumericAnswer(value: string): string {
  const trimmed = value.trim()
  const answer = Number(trimmed)
  return Number.isFinite(answer) ? String(answer) : trimmed
}

export function RetrievalPracticeSet({
  initiallySolved = false,
  onSolvedChange,
  problems,
  subtitle,
}: RetrievalPracticeSetProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [attemptedAnswers, setAttemptedAnswers] = useState<Record<string, string[]>>({})
  const [repeatAnswer, setRepeatAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [solvedProblems, setSolvedProblems] = useState<Record<string, boolean>>(() => {
    if (!initiallySolved) return {}
    return problems.reduce<Record<string, boolean>>((solved, problem) => {
      solved[problem.id] = true
      return solved
    }, {})
  })
  const [currentProblemIndex, setCurrentProblemIndex] = useState(() =>
    initiallySolved ? Math.max(problems.length - 1, 0) : 0,
  )
  if (problems.length === 0) return null

  const safeProblemIndex = Math.min(currentProblemIndex, problems.length - 1)
  const currentProblem = problems[safeProblemIndex]
  const solvedCount = problems.filter((problem) => solvedProblems[problem.id]).length
  const allSolved = solvedCount === problems.length

  function handleSubmit(event: FormEvent, problem: RetrievalPracticeProblem) {
    event.preventDefault()
    const normalizedAnswer = normalizeNumericAnswer(answers[problem.id] ?? '')
    const problemAttempts = attemptedAnswers[problem.id] ?? []
    if (problemAttempts.includes(normalizedAnswer)) {
      setRepeatAnswer(normalizedAnswer)
      return
    }

    setAttemptedAnswers((current) => ({
      ...current,
      [problem.id]: [...problemAttempts, normalizedAnswer],
    }))
    setRepeatAnswer(null)
    setSubmitted((current) => ({ ...current, [problem.id]: true }))
    if (normalizeAnswer(answers[problem.id] ?? '') !== problem.answer) return

    const nextSolvedProblems = { ...solvedProblems, [problem.id]: true }
    setSolvedProblems(nextSolvedProblems)
    if (problems.every((practiceProblem) => nextSolvedProblems[practiceProblem.id])) {
      onSolvedChange?.(true)
    }
  }

  function handleNextProblem() {
    setRepeatAnswer(null)
    setCurrentProblemIndex((index) => Math.min(index + 1, problems.length - 1))
  }

  const value = answers[currentProblem.id] ?? ''
  const numericAnswer = normalizeAnswer(value)
  const currentProblemAttempts = attemptedAnswers[currentProblem.id] ?? []
  const wrongAttemptCount = currentProblemAttempts.filter((answer) => Number(answer) !== currentProblem.answer).length
  const repeatMessage = repeatAnswer
    ? `You already tried **${repeatAnswer}**. Try a different answer!`
    : null
  const wasSubmitted = submitted[currentProblem.id] === true
  const isCorrect = solvedProblems[currentProblem.id] === true
  const canGoNext = isCorrect && safeProblemIndex < problems.length - 1
  const shouldRevealSolution = wasSubmitted && !isCorrect && wrongAttemptCount >= 3
  const cardStatusClass = wasSubmitted
    ? isCorrect
      ? ' retrieval-practice__card--correct'
      : ' retrieval-practice__card--incorrect'
    : ''

  return (
    <section className="retrieval-practice" aria-label="Practice">
      <p className="retrieval-practice__eyebrow">Practice</p>
      <h2>Remember and connect</h2>
      <p>{subtitle ?? 'Solve both quick problems, one at a time, to unlock the finish button.'}</p>
      <p className="retrieval-practice__progress">
        Problem {safeProblemIndex + 1} of {problems.length} - {solvedCount} solved
      </p>
      <div className="retrieval-practice__grid">
        <form
          className={`retrieval-practice__card${cardStatusClass}`}
          onSubmit={(event) => handleSubmit(event, currentProblem)}
        >
          <p className="retrieval-practice__prompt">
            {renderLessonText(currentProblem.prompt)}
          </p>
          <label className="retrieval-practice__answer-label">
            <span>Your answer</span>
            <input
              className="form-input"
              disabled={isCorrect}
              inputMode="numeric"
              min={0}
              onChange={(event) => {
                setRepeatAnswer(null)
                setAnswers((current) => ({
                  ...current,
                  [currentProblem.id]: event.target.value,
                }))
              }}
              type="number"
              value={value}
            />
          </label>
          {repeatMessage && (
            <p className="challenge__repeat-warning retrieval-practice__repeat-warning" role="status">
              {renderLessonText(repeatMessage)}
            </p>
          )}
          <div className="retrieval-practice__actions">
            <LessonButton
              type="submit"
              label={isCorrect ? 'Solved' : 'Check'}
              disabled={numericAnswer === null || isCorrect}
            />
            {canGoNext && (
              <LessonButton
                type="button"
                variant="secondary"
                label="Next problem"
                onClick={handleNextProblem}
              />
            )}
          </div>
          {wasSubmitted && (
            <p className={`retrieval-practice__feedback ${isCorrect ? 'retrieval-practice__feedback--correct' : ''}`}>
              {renderLessonText(isCorrect ? currentProblem.correctFeedback : currentProblem.tryAgainFeedback)}
            </p>
          )}
          {shouldRevealSolution && (
            <p className="retrieval-practice__solution" role="status">
              {renderLessonText(`Solution: ${currentProblem.solutionFeedback ?? currentProblem.correctFeedback}`)}
            </p>
          )}
        </form>
      </div>
      {allSolved && (
        <p className="retrieval-practice__complete">
          Nice work. Both practice problems are solved, so you can finish the lesson now.
        </p>
      )}
    </section>
  )
}
