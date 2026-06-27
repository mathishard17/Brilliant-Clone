import { useMemo, useState } from 'react'
import '../screens/screens.css'
import { ClickthroughMiniLesson } from '../components/ClickthroughMiniLesson'
import { LessonText } from '../components/LessonText'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { VoiceButton } from '../components/VoiceButton'
import { ChallengeQuestion } from '../components/ChallengeQuestion'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { HintButton } from '../components/HintButton'
import {
  screen4MiniLesson,
  type Screen4MiniLessonPage,
  type Screen4PracticePage,
} from '../lessons/lesson1/copy'
import { useLesson } from '../hooks/useLesson'
import { useSectionState } from '../hooks/useSectionState'
import { LESSON_1_ID } from '../types/lesson'
import { showDevNav } from '../utils/devMode'
import {
  getLesson1ThemeCopy,
  getThemeCategory,
  lesson1ThemeStyle,
  resolveLesson1Theme,
} from '../themes/themeResolver'
import { playCompletionTada } from '../utils/completionSound'

interface LessonSummaryProps {
  princessName: string
}

function isPracticePage(page: Screen4MiniLessonPage): page is Screen4PracticePage {
  return page.type === 'challenge'
}

export function LessonSummary({ princessName }: LessonSummaryProps) {
  const { profile, updateLesson, updateScreen } = useLesson()
  const theme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const copy = getLesson1ThemeCopy(theme)
  const crownsLabel = getThemeCategory(theme, 'crowns')?.label ?? 'top choices'
  const dressesLabel = getThemeCategory(theme, 'dresses')?.label ?? 'middle choices'
  const shoesLabel = getThemeCategory(theme, 'shoes')?.label ?? 'third choices'
  const miniLesson = useMemo(() => screen4MiniLesson(princessName), [princessName])
  const [summaryState, setSummaryState] = useSectionState('lesson-1-summary', {
    pageIndex: 0,
    practiceAnswer: '',
    practiceSubmitted: false,
    practiceCorrect: null as boolean | null,
    practiceWrongAttempts: 0,
    practiceAttemptedAnswers: [] as string[],
  })
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
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
  const practicePrompt = `${copy.practicePrompt} There are **4 ${crownsLabel}**, **5 ${dressesLabel}**, and **2 ${shoesLabel}**. How many ${copy.lookNamePlural} can you make?`
  const practiceEquation = `4 ${crownsLabel} × 5 ${dressesLabel} × 2 ${shoesLabel} = 40 ${copy.lookNamePlural}`

  async function handleFinish() {
    playCompletionTada()
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
    setFeedbackVoiceToken((token) => token + 1)
  }

  function getShortcutBody(pageId: string) {
    switch (pageId) {
      case 'shortcut-count-choices':
        return copy.shortcutCountChoices
      case 'shortcut-crowns':
        return copy.shortcutFirstCategory
      case 'shortcut-dresses':
        return copy.shortcutSecondCategory
      case 'shortcut-shoes':
        return copy.shortcutThirdCategory
      case 'shortcut-total':
        return copy.shortcutTotal
      default:
        return ''
    }
  }

  function getShortcutEquation(pageId: string) {
    switch (pageId) {
      case 'shortcut-crowns':
        return `2 ${crownsLabel}`
      case 'shortcut-dresses':
        return `2 ${crownsLabel} × 3 ${dressesLabel}`
      case 'shortcut-shoes':
        return `2 ${crownsLabel} × 3 ${dressesLabel} × 2 ${shoesLabel}`
      case 'shortcut-total':
        return `2 ${crownsLabel} × 3 ${dressesLabel} × 2 ${shoesLabel} = 12 ${copy.lookNamePlural}`
      default:
        return ''
    }
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-summary" style={lesson1ThemeStyle(theme)}>
      <ScreenBackButton
        label={pageIndex > 0 ? '← Back' : '← Back to Previous Challenge'}
        onClick={() => {
          if (pageIndex > 0) {
            setSummaryState({ pageIndex: Math.max(pageIndex - 1, 0) })
          } else {
            void updateScreen(3)
          }
        }}
      />
      <h1>{copy.screen4Heading}</h1>
      <LessonText
        text={`Excellent work, ${princessName}! You discovered how **choices stack up** for ${copy.lookNamePlural}.`}
      />
      <VoiceButton
        autoPlay={!profile.lesson.completed}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_1_ID}
        clipKey="lesson1.screen4.shortcutIntro"
        themePreference={profile.themePreference}
        label="Listen to the shortcut"
      />

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
                  prompt={practicePrompt}
                  value={practiceAnswer}
                  onChange={(value) => setSummaryState({ practiceAnswer: value })}
                  onSubmit={handlePracticeSubmit}
                  attemptedAnswers={practiceAttemptedAnswers}
                  submitted={practiceSubmitted}
                  allowRetry={practiceSubmitted && practiceCorrect === false}
                />
                <HintButton
                  prompt={practicePrompt}
                  context={`The learner is practicing the multiplication shortcut with ${crownsLabel}, ${dressesLabel}, and ${shoesLabel}.`}
                  fallbackHint="Count each category first, then multiply the counts in order."
                  blockedAnswerTerms={[
                    '40',
                    'forty',
                    '4 × 5 × 2',
                    '4 x 5 x 2',
                    'four times five times two',
                  ]}
                  disabled={!practiceSubmitted || practiceCorrect === true}
                />
                {practiceSubmitted && practiceCorrect !== null && (
                  <FeedbackBanner
                    variant={practiceCorrect ? 'success' : 'error'}
                    voiceCue={{
                      correctClipKey: 'lesson1.feedback.correct',
                      enabled: profile.voiceEnabled,
                      lessonId: LESSON_1_ID,
                      playToken: feedbackVoiceToken || null,
                      themePreference: profile.themePreference,
                      tryAgainClipKey: 'lesson1.feedback.tryAgain',
                    }}
                    message={
                      practiceCorrect
                        ? `${copy.practiceCorrect} ${practiceEquation}.`
                        : practiceWrongAttempts >= 2
                          ? copy.practiceIncorrect
                          : page.feedback?.tryAgain ?? copy.practiceIncorrect
                    }
                  />
                )}
                {practiceCorrect === false && practiceWrongAttempts >= 3 && page.feedback?.solution && (
                  <FeedbackBanner
                    variant="info"
                    message={`${copy.practiceSolution}\n\nSolution: **${practiceEquation}**.`}
                  />
                )}
                {practiceCorrect && (
                  <p className="lesson-summary__equation lesson-summary__equation--reveal">
                    {practiceEquation}
                  </p>
                )}
              </div>
            )
          }

          if (page.id === 'lesson-1-complete') {
            return <LessonText text={`${copy.completeBody} Great work, ${princessName}!`} />
          }

          return (
            <div className="lesson-summary__shortcut">
              <h2>{copy.shortcutTitle}</h2>
              <LessonText text={copy.shortcutIntro} className="lesson-summary__intro" />
              <div className="lesson-summary__step" key={page.id}>
                <LessonText text={getShortcutBody(page.id)} className="lesson-summary__step-body" />
                {getShortcutEquation(page.id) && (
                  <p className="lesson-summary__equation lesson-summary__equation--reveal">
                    {getShortcutEquation(page.id)}
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
