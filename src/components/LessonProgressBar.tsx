const DEFAULT_LESSON_STEPS = ['Dress Up', 'The Trick', 'Add Shoes', 'Finish'] as const

interface LessonProgressBarProps {
  /** Current lesson screen, 1–4. */
  step: number
  /** Whether the whole lesson is finished (fills all sections). */
  completed?: boolean
  steps?: readonly string[]
}

export function LessonProgressBar({
  step,
  completed = false,
  steps = DEFAULT_LESSON_STEPS,
}: LessonProgressBarProps) {
  const totalSteps = steps.length
  const current = Math.min(Math.max(step, 1), totalSteps)
  const stepName = steps[current - 1]
  // Segments show sections *finished*: empty on the first screen, one more
  // each time the student moves on, all filled once the lesson is complete.
  const completedCount = completed ? totalSteps : current - 1

  return (
    <div
      className="lesson-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={totalSteps}
      aria-valuenow={completedCount}
      aria-valuetext={`Step ${current} of ${totalSteps}: ${stepName} (${completedCount} of ${totalSteps} sections done)`}
    >
      <div className="lesson-progress__label">
        <span>
          Step {current} of {totalSteps}
        </span>
        <span className="lesson-progress__step-name">{stepName}</span>
      </div>
      <div className="lesson-progress__track">
        {Array.from({ length: totalSteps }, (_, i) => (
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
