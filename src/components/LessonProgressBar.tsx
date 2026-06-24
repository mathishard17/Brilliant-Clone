const LESSON_STEPS = ['Dress Up', 'The Trick', 'Add Shoes', 'Finish'] as const
const TOTAL_STEPS = LESSON_STEPS.length

interface LessonProgressBarProps {
  /** Current lesson screen, 1–4. */
  step: number
  /** Whether the whole lesson is finished (fills all sections). */
  completed?: boolean
}

export function LessonProgressBar({ step, completed = false }: LessonProgressBarProps) {
  const current = Math.min(Math.max(step, 1), TOTAL_STEPS)
  const stepName = LESSON_STEPS[current - 1]
  // Segments show sections *finished*: empty on the first screen, one more
  // each time the student moves on, all filled once the lesson is complete.
  const completedCount = completed ? TOTAL_STEPS : current - 1

  return (
    <div
      className="lesson-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={TOTAL_STEPS}
      aria-valuenow={completedCount}
      aria-valuetext={`Step ${current} of ${TOTAL_STEPS}: ${stepName} (${completedCount} of ${TOTAL_STEPS} sections done)`}
    >
      <div className="lesson-progress__label">
        <span>
          Step {current} of {TOTAL_STEPS}
        </span>
        <span className="lesson-progress__step-name">{stepName}</span>
      </div>
      <div className="lesson-progress__track">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            className={`lesson-progress__segment${
              i < completedCount ? ' lesson-progress__segment--filled' : ''
            }`}
          />
        ))}
      </div>
    </div>
  )
}
