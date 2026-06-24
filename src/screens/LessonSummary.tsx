import { useMemo } from 'react'
import '../screens/screens.css'
import { ClickthroughMiniLesson } from '../components/ClickthroughMiniLesson'
import { LessonText } from '../components/LessonText'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { ChallengeQuestion } from '../components/ChallengeQuestion'
import { FeedbackBanner } from '../components/FeedbackBanner'
import {
  screen4Body,
  screen4Heading,
  screen4MiniLesson,
  type Screen4MiniLessonPage,
  type Screen4PracticePage,
} from '../lessons/lesson1/copy'
import { useLesson } from '../hooks/useLesson'
import { useSectionState } from '../hooks/useSectionState'
import { showDevNav } from '../utils/devMode'

interface LessonSummaryProps {
  princessName: string
}

function isPracticePage(page: Screen4MiniLessonPage): page is Screen4PracticePage {
  return page.type === 'challenge'
}

export function LessonSummary({ princessName }: LessonSummaryProps) {
  const { profile, updateLesson, updateScreen } = useLesson()
  const miniLesson = useMemo(() => screen4MiniLesson(princessName), [princessName])
  const [summaryState, setSummaryState] = useSectionState('lesson-1-summary', {
    pageIndex: 0,
    practiceAnswer: '',
    practiceSubmitted: false,
    practiceCorrect: null as boolean | null,
    practiceWrongAttempts: 0,
    practiceAttemptedAnswers: [] as string[],
  })
  const {
    pageIndex,
    practiceAnswer,
    practiceSubmitted,
    practiceCorrect,
    practiceWrongAttempts,
    practiceAttemptedAnswers,
  } = summaryState

  const practicePageIndex = miniLesson.pages.findIndex(isPracticePage)
  const closingPageIndex = miniLesson.pages.findIndex((page) => page.id === 'lesson-1-complete')

  async function handleFinish() {
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 4 })
  }

  function handlePracticeSubmit() {
    const practicePage = miniLesson.pages.find(isPracticePage)
    if (!practicePage) return

    const normalizedAnswer = practiceAnswer.trim()
    const correct = Number(practiceAnswer) === practicePage.answer
    const attemptedAnswers = practiceAttemptedAnswers.includes(normalizedAnswer)
      ? practiceAttemptedAnswers
      : [...practiceAttemptedAnswers, normalizedAnswer]
    setSummaryState({
      practiceSubmitted: true,
      practiceCorrect: correct,
      practiceWrongAttempts: correct ? practiceWrongAttempts : practiceWrongAttempts + 1,
      practiceAttemptedAnswers: attemptedAnswers,
    })
  }

  return (
    <section className="lesson-screen lesson-summary">
      <ScreenBackButton
        label={pageIndex > 0 ? '← Back' : '← Back to Shoes Challenge'}
        onClick={() => {
          if (pageIndex > 0) {
            setSummaryState({ pageIndex: Math.max(pageIndex - 1, 0) })
          } else {
            void updateScreen(3)
          }
        }}
      />
      <h1>{screen4Heading()}</h1>
      <LessonText text={screen4Body(princessName)} />

      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={(nextPageIndex) => setSummaryState({ pageIndex: nextPageIndex })}
        onComplete={handleFinish}
        backLabel="← Back"
        nextLabel="Next →"
        completeLabel="Finish Lesson Complete! 🎉"
        navClassName="lesson-summary__step-nav"
        showDots
        showNext={(page) => !isPracticePage(page) || practiceCorrect === true}
        renderPage={(page) => {
          if (isPracticePage(page)) {
            return (
              <div className="lesson-summary__practice">
                {page.title && <h2>{page.title}</h2>}
                <ChallengeQuestion
                  prompt={page.prompt}
                  value={practiceAnswer}
                  onChange={(value) => setSummaryState({ practiceAnswer: value })}
                  onSubmit={handlePracticeSubmit}
                  attemptedAnswers={practiceAttemptedAnswers}
                  submitted={practiceSubmitted}
                  allowRetry={practiceSubmitted && practiceCorrect === false}
                />
                {practiceSubmitted && practiceCorrect !== null && (
                  <FeedbackBanner
                    variant={practiceCorrect ? 'success' : 'error'}
                    message={
                      practiceCorrect
                        ? page.feedback?.correct ?? ''
                        : practiceWrongAttempts >= 2
                          ? page.feedback?.incorrect ?? ''
                          : page.feedback?.tryAgain ?? page.feedback?.incorrect ?? ''
                    }
                  />
                )}
                {practiceCorrect === false && practiceWrongAttempts >= 3 && page.feedback?.solution && (
                  <FeedbackBanner variant="info" message={page.feedback.solution} />
                )}
                {practiceCorrect && (
                  <p className="lesson-summary__equation lesson-summary__equation--reveal">
                    {page.successEquation}
                  </p>
                )}
              </div>
            )
          }

          if (page.id === 'lesson-1-complete') {
            return <LessonText text={page.body} />
          }

          return (
            <div className="lesson-summary__shortcut">
              <h2>{miniLesson.title}</h2>
              {miniLesson.description && (
                <LessonText text={miniLesson.description} className="lesson-summary__intro" />
              )}
              <div className="lesson-summary__step" key={page.id}>
                <LessonText text={page.body} className="lesson-summary__step-body" />
                {page.equation && (
                  <p className="lesson-summary__equation lesson-summary__equation--reveal">
                    {page.equation}
                  </p>
                )}
              </div>
            </div>
          )
        }}
      />

      {showDevNav(profile.username) && (
        <div className="dev-nav dev-nav--inline">
          <p>Dev: jump to Screen 4 page</p>
          <div className="dev-nav__buttons">
            <button
              type="button"
              className={pageIndex < practicePageIndex ? 'active' : ''}
              onClick={() => setSummaryState({ pageIndex: 0 })}
            >
              Shortcut
            </button>
            <button
              type="button"
              className={pageIndex === practicePageIndex ? 'active' : ''}
              onClick={() => setSummaryState({ pageIndex: practicePageIndex })}
            >
              Practice
            </button>
            <button
              type="button"
              className={pageIndex === closingPageIndex ? 'active' : ''}
              onClick={() => setSummaryState({ pageIndex: closingPageIndex })}
            >
              Closing
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
