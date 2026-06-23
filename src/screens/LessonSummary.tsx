import { useState } from 'react'
import '../screens/screens.css'
import { LessonText } from '../components/LessonText'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import {
  screen4Body,
  screen4Closing,
  screen4Heading,
  screen4ShortcutBody,
  screen4ShortcutHeading,
  screen4ShortcutSteps,
} from '../copy/lesson1'
import { useLesson } from '../hooks/useLesson'

interface LessonSummaryProps {
  princessName: string
}

export function LessonSummary({ princessName }: LessonSummaryProps) {
  const { updateLesson, updateScreen } = useLesson()
  const [shortcutStep, setShortcutStep] = useState(0)
  const [showClosing, setShowClosing] = useState(false)

  const totalShortcutSteps = screen4ShortcutSteps.length
  const currentStep = screen4ShortcutSteps[shortcutStep]
  const isLastStep = shortcutStep === totalShortcutSteps - 1

  async function handleFinish() {
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 4 })
  }

  function handleShortcutNext() {
    if (isLastStep) {
      setShowClosing(true)
    } else {
      setShortcutStep((s) => s + 1)
    }
  }

  function handleShortcutBack() {
    if (showClosing) {
      setShowClosing(false)
      return
    }
    if (shortcutStep > 0) {
      setShortcutStep((s) => s - 1)
    }
  }

  const showShortcutBack = showClosing || shortcutStep > 0

  return (
    <section className="lesson-screen lesson-summary">
      <ScreenBackButton
        label={showClosing || shortcutStep > 0 ? '← Back' : '← Back to Shoes Challenge'}
        onClick={() => {
          if (showShortcutBack) {
            handleShortcutBack()
          } else {
            void updateScreen(3)
          }
        }}
      />
      <h1>{screen4Heading()}</h1>
      <LessonText text={screen4Body(princessName)} />

      <div className="lesson-summary__shortcut">
        <h2>{screen4ShortcutHeading()}</h2>
        <LessonText text={screen4ShortcutBody()} className="lesson-summary__intro" />

        {!showClosing && currentStep && (
          <div className="lesson-summary__step" key={shortcutStep}>
            <LessonText text={currentStep.body} className="lesson-summary__step-body" />
            {currentStep.equation && (
              <p className="lesson-summary__equation lesson-summary__equation--reveal">
                {currentStep.equation}
              </p>
            )}
            <div className="lesson-summary__step-nav">
              {shortcutStep > 0 && (
                <LessonButton label="← Back" variant="secondary" onClick={handleShortcutBack} />
              )}
              <LessonButton
                label={isLastStep ? 'Got it! ✨' : 'Next →'}
                onClick={handleShortcutNext}
              />
            </div>
            <p
              className="lesson-summary__step-dots"
              aria-label={`Step ${shortcutStep + 1} of ${totalShortcutSteps}`}
            >
              {Array.from({ length: totalShortcutSteps }, (_, i) => (
                <span
                  key={i}
                  className={`lesson-summary__dot${i <= shortcutStep ? ' lesson-summary__dot--active' : ''}`}
                />
              ))}
            </p>
          </div>
        )}
      </div>

      {showClosing && (
        <>
          <LessonText text={screen4Closing(princessName)} />
          <LessonButton
            label="Finish Lesson Complete! 🎉"
            onClick={() => void handleFinish()}
          />
        </>
      )}
    </section>
  )
}
