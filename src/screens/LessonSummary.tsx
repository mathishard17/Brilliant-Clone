import { useState } from 'react'
import '../screens/screens.css'
import { LessonText } from '../components/LessonText'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { ChallengeQuestion } from '../components/ChallengeQuestion'
import { FeedbackBanner } from '../components/FeedbackBanner'
import {
  firstTryAgainFeedback,
  screen4Body,
  screen4Closing,
  screen4Heading,
  screen4PracticeCorrect,
  screen4PracticeEquation,
  screen4PracticeHeading,
  screen4PracticeIncorrect,
  screen4PracticePrompt,
  screen4ShortcutBody,
  screen4ShortcutHeading,
  screen4ShortcutSteps,
  SCREEN4_PRACTICE_ANSWER,
} from '../copy/lesson1'
import { useLesson } from '../hooks/useLesson'
import { showDevNav } from '../utils/devMode'

interface LessonSummaryProps {
  princessName: string
}

export function LessonSummary({ princessName }: LessonSummaryProps) {
  const { profile, updateLesson, updateScreen } = useLesson()
  const [shortcutStep, setShortcutStep] = useState(0)
  const [showPractice, setShowPractice] = useState(false)
  const [showClosing, setShowClosing] = useState(false)
  const [practiceAnswer, setPracticeAnswer] = useState('')
  const [practiceSubmitted, setPracticeSubmitted] = useState(false)
  const [practiceCorrect, setPracticeCorrect] = useState<boolean | null>(null)
  const [practiceWrongAttempts, setPracticeWrongAttempts] = useState(0)

  const totalShortcutSteps = screen4ShortcutSteps.length
  const currentStep = screen4ShortcutSteps[shortcutStep]
  const isLastStep = shortcutStep === totalShortcutSteps - 1

  async function handleFinish() {
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 4 })
  }

  function handleShortcutNext() {
    if (isLastStep) {
      setShowPractice(true)
    } else {
      setShortcutStep((s) => s + 1)
    }
  }

  function handleShortcutBack() {
    if (showClosing) {
      setShowClosing(false)
      setShowPractice(true)
      return
    }
    if (showPractice) {
      setShowPractice(false)
      return
    }
    if (shortcutStep > 0) {
      setShortcutStep((s) => s - 1)
    }
  }

  function handlePracticeSubmit() {
    const correct = Number(practiceAnswer) === SCREEN4_PRACTICE_ANSWER
    if (!correct) setPracticeWrongAttempts((n) => n + 1)
    setPracticeSubmitted(true)
    setPracticeCorrect(correct)
  }

  const showShortcutBack = showClosing || showPractice || shortcutStep > 0

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

        {!showPractice && !showClosing && currentStep && (
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

      {showPractice && !showClosing && (
        <div className="lesson-summary__practice">
          <h2>{screen4PracticeHeading()}</h2>
          <ChallengeQuestion
            prompt={screen4PracticePrompt()}
            value={practiceAnswer}
            onChange={setPracticeAnswer}
            onSubmit={handlePracticeSubmit}
            submitted={practiceSubmitted}
            allowRetry={practiceSubmitted && practiceCorrect === false}
          />
          {practiceSubmitted && practiceCorrect !== null && (
            <FeedbackBanner
              variant={practiceCorrect ? 'success' : 'error'}
              message={
                practiceCorrect
                  ? screen4PracticeCorrect(princessName)
                  : practiceWrongAttempts >= 2
                    ? screen4PracticeIncorrect(princessName)
                    : firstTryAgainFeedback(princessName)
              }
            />
          )}
          {practiceCorrect && (
            <>
              <p className="lesson-summary__equation lesson-summary__equation--reveal">
                {screen4PracticeEquation()}
              </p>
              <LessonButton label="Continue →" onClick={() => setShowClosing(true)} />
            </>
          )}
        </div>
      )}

      {showClosing && (
        <>
          <LessonText text={screen4Closing(princessName)} />
          <LessonButton
            label="Finish Lesson Complete! 🎉"
            onClick={() => void handleFinish()}
          />
        </>
      )}

      {showDevNav(profile.username) && (
        <div className="dev-nav dev-nav--inline">
          <p>Dev: jump to Screen 4 phase</p>
          <div className="dev-nav__buttons">
            <button
              type="button"
              className={!showPractice && !showClosing ? 'active' : ''}
              onClick={() => {
                setShowPractice(false)
                setShowClosing(false)
                setShortcutStep(0)
              }}
            >
              Shortcut
            </button>
            <button
              type="button"
              className={showPractice && !showClosing ? 'active' : ''}
              onClick={() => {
                setShowClosing(false)
                setShowPractice(true)
                setShortcutStep(totalShortcutSteps - 1)
              }}
            >
              Practice
            </button>
            <button
              type="button"
              className={showClosing ? 'active' : ''}
              onClick={() => {
                setShowPractice(false)
                setShowClosing(true)
              }}
            >
              Closing
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
