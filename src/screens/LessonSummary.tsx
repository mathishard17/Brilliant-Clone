import { useMemo, useRef, useState } from 'react'
import '../screens/screens.css'
import { ClickthroughMiniLesson } from '../components/ClickthroughMiniLesson'
import { LessonText } from '../components/LessonText'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { VoiceButton } from '../components/VoiceButton'
import { ChallengeQuestion } from '../components/ChallengeQuestion'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { HintButton } from '../components/HintButton'
import { RetrievalPracticeSet, type RetrievalPracticeProblem } from '../components/RetrievalPracticeSet'
import {
  screen4MiniLesson,
  type Screen4MiniLessonPage,
  type Screen4PracticePage,
} from '../lessons/lesson1/copy'
import { useLesson } from '../hooks/useLesson'
import { LESSON_1_ID } from '../types/lesson'
import { showDevNav } from '../utils/devMode'
import { getProfileLessonProgress } from '../utils/lessonProgress'
import { canRevealSolution } from '../utils/solutionReveal'
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

interface LessonSummaryState {
  pageIndex: number
  practiceAnswer: string
  practiceSubmitted: boolean
  practiceCorrect: boolean | null
  retrievalPracticeSolved: boolean
  practiceWrongAttempts: number
  practiceAttemptedAnswers: string[]
}

const SUMMARY_SECTION_ID = 'lesson-1-summary'
const SUMMARY_DEFAULT_STATE: LessonSummaryState = {
  pageIndex: 0,
  practiceAnswer: '',
  practiceSubmitted: false,
  practiceCorrect: null,
  retrievalPracticeSolved: false,
  practiceWrongAttempts: 0,
  practiceAttemptedAnswers: [],
}
const LESSON_1_RETRIEVAL_PROBLEMS: RetrievalPracticeProblem[] = [
  {
    id: 'lesson-1-counting-choices',
    prompt: 'A quick choice check: if there are **5 crowns** and **3 gowns**, how many outfits can you make?',
    answer: 15,
    correctFeedback: 'Yes: 5 choices times 3 choices makes **15** outfits.',
    tryAgainFeedback: 'Try multiplying the choices: crowns times gowns.',
  },
  {
    id: 'lesson-1-equal-groups-bridge',
    prompt: 'Related idea: there are **5 rows** with **4 stars** in each row. How many stars are there?',
    answer: 20,
    correctFeedback: 'Right: 5 groups of 4 makes **20** stars.',
    tryAgainFeedback: 'Think of 5 equal groups, with 4 in each group.',
  },
]
const LESSON_1_RETRIEVAL_PAGE_ID = 'lesson-1-retrieval-practice'

export function LessonSummary({ princessName }: LessonSummaryProps) {
  const { profile, recordStudentMemoryEvent, updateLesson, updateScreen } = useLesson()
  const activeLesson = getProfileLessonProgress(profile, LESSON_1_ID)
  const theme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const copy = getLesson1ThemeCopy(theme)
  const crownsLabel = getThemeCategory(theme, 'crowns')?.label ?? 'top choices'
  const dressesLabel = getThemeCategory(theme, 'dresses')?.label ?? 'middle choices'
  const shoesLabel = getThemeCategory(theme, 'shoes')?.label ?? 'third choices'
  const miniLesson = useMemo(() => {
    const lesson = screen4MiniLesson(princessName)
    return {
      ...lesson,
      pages: [
        ...lesson.pages,
        {
          id: LESSON_1_RETRIEVAL_PAGE_ID,
          type: 'explanation' as const,
          body: '',
          nextLabel: 'Finish Lesson Complete! 🎉',
        },
      ],
    }
  }, [princessName])
  const savedSummaryState = activeLesson.sectionState[SUMMARY_SECTION_ID] as
    | Partial<LessonSummaryState>
    | undefined
  const summaryState: LessonSummaryState = { ...SUMMARY_DEFAULT_STATE, ...savedSummaryState }
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const {
    pageIndex,
    practiceSubmitted,
    practiceCorrect,
    retrievalPracticeSolved,
    practiceWrongAttempts,
    practiceAttemptedAnswers,
  } = summaryState
  const [practiceAnswer, setPracticeAnswer] = useState(
    typeof summaryState.practiceAnswer === 'string' ? summaryState.practiceAnswer : '',
  )
  const finishInFlightRef = useRef(false)
  const practiceSubmitInFlightRef = useRef(false)

  const practicePageIndex = miniLesson.pages.findIndex(isPracticePage)
  const closingPageIndex = miniLesson.pages.findIndex((page) => page.id === 'lesson-1-complete')
  const practicePrompt = `${copy.practicePrompt} There are **4 ${crownsLabel}**, **5 ${dressesLabel}**, and **2 ${shoesLabel}**. How many ${copy.lookNamePlural} can you make?`
  const practiceEquation = `4 ${crownsLabel} × 5 ${dressesLabel} × 2 ${shoesLabel} = 40 ${copy.lookNamePlural}`

  function setSummaryState(partial: Partial<LessonSummaryState>) {
    void updateLesson({
      sectionState: {
        [SUMMARY_SECTION_ID]: {
          ...summaryState,
          ...partial,
        },
      },
    }, LESSON_1_ID)
  }

  async function handleFinish() {
    if (finishInFlightRef.current) return
    finishInFlightRef.current = true
    try {
      if (activeLesson.completed) {
        await updateScreen(0, LESSON_1_ID)
        return
      }
      playCompletionTada()
      await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 4 }, LESSON_1_ID)
    } finally {
      finishInFlightRef.current = false
    }
  }

  function handlePageChange(nextPageIndex: number) {
    if (nextPageIndex === pageIndex) return
    setSummaryState({ pageIndex: nextPageIndex })
  }

  function handlePracticeAnswerChange(value: string) {
    practiceSubmitInFlightRef.current = false
    setPracticeAnswer(value)
  }

  function handlePracticeSubmit() {
    if (practiceSubmitInFlightRef.current) return
    const practicePage = miniLesson.pages.find(isPracticePage)
    if (!practicePage) return

    practiceSubmitInFlightRef.current = true
    const normalizedAnswer = practiceAnswer.trim()
    const correct = Number(practiceAnswer) === practicePage.answer
    const attemptedAnswers = practiceAttemptedAnswers.includes(normalizedAnswer)
      ? practiceAttemptedAnswers
      : [...practiceAttemptedAnswers, normalizedAnswer]
    setSummaryState({
      practiceAnswer: normalizedAnswer,
      practiceSubmitted: true,
      practiceCorrect: correct,
      practiceWrongAttempts: correct ? practiceWrongAttempts : practiceWrongAttempts + 1,
      practiceAttemptedAnswers: attemptedAnswers,
    })
    void recordStudentMemoryEvent({
      type: 'challengeAttempt',
      lessonId: LESSON_1_ID,
      conceptKey: 'multiplication-shortcut',
      label: 'Multiplication shortcut',
      outcome: correct ? 'correct' : 'incorrect',
      learnerAnswer: normalizedAnswer,
      correctAnswer: String(practicePage.answer),
    }).catch(() => undefined)
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

  const submittedPracticeAnswer =
    practiceAttemptedAnswers[practiceAttemptedAnswers.length - 1] ?? practiceAnswer
  const practiceFeedbackSubmissionKey = [
    practiceAttemptedAnswers.join(','),
    practiceWrongAttempts,
    String(practiceCorrect),
  ].join('|')
  const canShowPracticeSolution = canRevealSolution({
    memory: profile.studentMemory,
    conceptKey: 'multiplication-shortcut',
    wrongAttempts: practiceWrongAttempts,
  })

  return (
    <section className="lesson-screen lesson-screen--themed lesson-summary" style={lesson1ThemeStyle(theme)}>
      <ScreenBackButton
        label={pageIndex > 0 ? '← Back' : '← Back to Previous Challenge'}
        onClick={() => {
          if (pageIndex > 0) {
            handlePageChange(Math.max(pageIndex - 1, 0))
          } else {
            void updateScreen(3, LESSON_1_ID)
          }
        }}
      />
      <h1>{copy.screen4Heading}</h1>
      <LessonText
        text={`Excellent work, ${princessName}! You discovered how **choices stack up** for ${copy.lookNamePlural}.`}
      />
      <VoiceButton
        autoPlay={!activeLesson.completed}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_1_ID}
        clipKey="lesson1.screen4.shortcutIntro"
        themePreference={profile.themePreference}
        label="Listen to the shortcut"
      />

      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={handlePageChange}
        onComplete={handleFinish}
        backLabel="← Back"
        nextLabel="Next →"
        completeLabel="Finish Lesson Complete! 🎉"
        navClassName="lesson-summary__step-nav"
        showDots
        showNext={(page) => {
          if (page.id === LESSON_1_RETRIEVAL_PAGE_ID) return retrievalPracticeSolved
          return activeLesson.completed || !isPracticePage(page) || practiceCorrect === true
        }}
        renderPage={(page) => {
          if (isPracticePage(page)) {
            return (
              <div className="lesson-summary__practice">
                {page.title && <h2>{page.title}</h2>}
                <ChallengeQuestion
                  prompt={practicePrompt}
                  value={practiceAnswer}
                  onChange={handlePracticeAnswerChange}
                  onSubmit={handlePracticeSubmit}
                  attemptedAnswers={practiceAttemptedAnswers}
                  submitted={practiceSubmitted}
                  allowRetry={practiceSubmitted && practiceCorrect === false}
                />
                <HintButton
                  lessonId={LESSON_1_ID}
                  conceptKey="multiplication-shortcut"
                  conceptLabel="Multiplication shortcut"
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
                  learnerAnswer={practiceAnswer}
                  attemptedAnswers={practiceAttemptedAnswers}
                  wrongAttempts={practiceWrongAttempts}
                  disabled={!practiceSubmitted || practiceCorrect === true}
                />
                {practiceSubmitted && practiceCorrect !== null && (
                  <FeedbackBanner
                    variant={practiceCorrect ? 'success' : 'error'}
                    submissionKey={practiceFeedbackSubmissionKey}
                    aiFeedback={{
                      lessonId: LESSON_1_ID,
                      conceptKey: 'multiplication-shortcut',
                      conceptLabel: 'Multiplication shortcut',
                      problem: practicePrompt,
                      learnerAnswer: submittedPracticeAnswer,
                      correctAnswer: '40',
                      attemptedAnswers: practiceAttemptedAnswers,
                      context: `The learner is practicing the multiplication shortcut with ${crownsLabel}, ${dressesLabel}, and ${shoesLabel}.`,
                    }}
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
                    solution={practiceCorrect ? `Solution: **${practiceEquation}**.` : undefined}
                  />
                )}
                {practiceCorrect === false && canShowPracticeSolution && (
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

          if (page.id === LESSON_1_RETRIEVAL_PAGE_ID) {
            return (
              <RetrievalPracticeSet
                initiallySolved={retrievalPracticeSolved}
                onSolvedChange={(solved) => {
                  if (solved && !retrievalPracticeSolved) {
                    setSummaryState({ retrievalPracticeSolved: true })
                  }
                }}
                problems={LESSON_1_RETRIEVAL_PROBLEMS}
              />
            )
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
              onClick={() => handlePageChange(0)}
            >
              Shortcut
            </button>
            <button
              type="button"
              className={pageIndex === practicePageIndex ? 'active' : ''}
              onClick={() => handlePageChange(practicePageIndex)}
            >
              Practice
            </button>
            <button
              type="button"
              className={pageIndex === closingPageIndex ? 'active' : ''}
              onClick={() => handlePageChange(closingPageIndex)}
            >
              Closing
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
