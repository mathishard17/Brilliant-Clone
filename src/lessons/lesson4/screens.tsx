import { useState, type CSSProperties } from 'react'
import '../../screens/screens.css'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { HintButton } from '../../components/HintButton'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
import { RetrievalPracticeSet, type RetrievalPracticeState } from '../../components/RetrievalPracticeSet'
import { ScreenBackButton } from '../../components/ScreenBackButton'
import { VoiceButton } from '../../components/VoiceButton'
import { useLesson } from '../../hooks/useLesson'
import { useSectionState } from '../../hooks/useSectionState'
import { LESSON_4_ID } from '../../types/lesson'
import { lesson1ThemeStyle, resolveLesson1Theme } from '../../themes/themeResolver'
import { playCompletionTada } from '../../utils/completionSound'
import { getProfileLessonProgress } from '../../utils/lessonProgress'
import { canRevealSolution } from '../../utils/solutionReveal'
import {
  certainVisual,
  compareSpinnerVisual,
  finaleVisual,
  getLesson4ThemeFlavor,
  getThemedScreen1Copy,
  getThemedScreen2MiniLesson,
  getThemedScreen3Copy,
  getThemedScreen4MiniLesson,
  getThemedScreen5Copy,
  getThemedSpinnerVisual,
  impossibleVisual,
  type Lesson4ThemeFlavor,
  rubySpinnerVisual,
  screen1Visual,
  screen2KeyLine,
  type ChoiceChallenge,
  type Lesson4MiniLessonPage,
  type PrizeKind,
  prizeDefinitions,
  type SpinnerSpace,
  type SpinnerVisual,
} from './copy'

interface Lesson4ScreenProps {
  princessName: string
}

function useThemedLesson() {
  const lesson = useLesson()
  const activeTheme = resolveLesson1Theme(lesson.profile.themePreference, lesson.profile.themePacks)
  const themeStyle = lesson1ThemeStyle(activeTheme)

  return {
    ...lesson,
    lesson4Flavor: getLesson4ThemeFlavor(activeTheme),
    lesson4Style: themeStyle,
  }
}

const prizeColors: Record<PrizeKind, string> = {
  crown: '#facc15',
  ruby: '#fb7185',
  gown: '#c084fc',
  dragon: '#86efac',
  star: '#fde68a',
  sparkle: '#93c5fd',
}

const lesson4RetrievalPracticeProblems = [
  {
    id: 'lesson-4-previous-counting-outcomes',
    prompt:
      'Outcome count: a spinner shows **Ruby, Ruby, Ruby, Star, Star, Crown, Dragon**. A friend says there are only 4 outcomes because there are 4 picture names. How many possible landing outcomes should the sample space count?',
    answer: 7,
    correctFeedback: 'Yes. The sample space counts each equal space, so repeated pictures still make **7** possible landings.',
    tryAgainFeedback: 'Count every equal space, including repeated Ruby and Star spaces.',
  },
  {
    id: 'lesson-4-current-favorable-spaces',
    prompt:
      'Favorable spaces: the spinner shows **Crown, Ruby, Crown, Star, Ruby, Dragon**. If Crown is the winning event, how many favorable outcomes are there?',
    answer: 2,
    correctFeedback: 'Right: only the **2 Crown spaces** are favorable for the Crown event.',
    tryAgainFeedback: 'Favorable means the spaces that match the event you want. Count only Crown spaces.',
  },
]

interface Lesson4ChoiceState {
  selectedAnswer: string | null
  attemptedAnswers: string[]
  wrongAttempts: number
  isCorrect: boolean
}

interface Lesson4FinaleState extends Record<string, unknown> {
  retrievalPracticeSolved: boolean
  retrievalPracticeState?: RetrievalPracticeState
  showPracticePage: boolean
}

function isChallengePage(
  page: Lesson4MiniLessonPage,
): page is Extract<Lesson4MiniLessonPage, { type: 'challenge' }> {
  return page.type === 'challenge'
}

function countPrize(spaces: readonly SpinnerSpace[], prize: PrizeKind): number {
  return spaces.filter((space) => space.prize === prize).length
}

function getVisiblePrizes(visual: SpinnerVisual): PrizeKind[] {
  const prizes = new Set<PrizeKind>()
  if (visual.targetPrize) prizes.add(visual.targetPrize)
  visual.spaces.forEach((space) => prizes.add(space.prize))
  return [...prizes]
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function themePrizeText(text: string, flavor: Lesson4ThemeFlavor): string {
  return Object.values(prizeDefinitions).reduce((nextText, basePrize) => {
    const themedPrize = flavor.prizeDefinitions[basePrize.prize]
    return nextText.replace(
      new RegExp(`\\b${escapeRegExp(basePrize.label)}\\b`, 'g'),
      themedPrize.label,
    )
  }, text)
}

function themeSpinnerVisualText(visual: SpinnerVisual, flavor: Lesson4ThemeFlavor): SpinnerVisual {
  return {
    ...visual,
    title: themePrizeText(visual.title, flavor),
    helperText: themePrizeText(visual.helperText, flavor),
  }
}

function themeChoiceChallenge(challenge: ChoiceChallenge, flavor: Lesson4ThemeFlavor): ChoiceChallenge {
  const themedOptions = challenge.options.map((option) => themePrizeText(option, flavor))
  return {
    ...challenge,
    prompt: themePrizeText(challenge.prompt, flavor),
    answer: themePrizeText(challenge.answer, flavor),
    options: themedOptions,
    feedback: {
      correct: themePrizeText(challenge.feedback.correct, flavor),
      tryAgain: themePrizeText(challenge.feedback.tryAgain, flavor),
      solution: themePrizeText(challenge.feedback.solution, flavor),
    },
  }
}

function getSpinnerBackground(spaces: readonly SpinnerSpace[], themeFlavor: Lesson4ThemeFlavor): string {
  const slice = 100 / spaces.length
  const gradient = spaces
    .map((space, index) => {
      const start = index * slice
      const end = (index + 1) * slice
      const separatorStart = Math.max(start, end - 0.45)
      return `${themeFlavor.visual.spinnerColors[space.prize] ?? prizeColors[space.prize]} ${start}% ${separatorStart}%, var(--theme-spinner-separator, rgb(15 23 42 / 0.92)) ${separatorStart}% ${end}%`
    })
    .join(', ')

  return `conic-gradient(from 0deg, ${gradient})`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : []
}

function getStoredChoiceState(
  sectionState: Record<string, Record<string, unknown>>,
  challenge: ChoiceChallenge,
): Lesson4ChoiceState {
  const savedState = sectionState[`lesson-4-choice-${challenge.id}`]
  if (!isRecord(savedState)) {
    return {
      selectedAnswer: null,
      attemptedAnswers: [],
      wrongAttempts: 0,
      isCorrect: false,
    }
  }

  const selectedAnswer =
    typeof savedState.selectedAnswer === 'string' ? savedState.selectedAnswer : null
  const attemptedAnswers = getStringArray(savedState.attemptedAnswers)

  return {
    selectedAnswer,
    attemptedAnswers:
      attemptedAnswers.length > 0
        ? attemptedAnswers
        : selectedAnswer === null
          ? []
          : [selectedAnswer],
    wrongAttempts:
      typeof savedState.wrongAttempts === 'number' && savedState.wrongAttempts >= 0
        ? savedState.wrongAttempts
        : 0,
    isCorrect: savedState.isCorrect === true || selectedAnswer === challenge.answer,
  }
}

function hasStoredCorrectChoice(
  sectionState: Record<string, Record<string, unknown>>,
  challenge: ChoiceChallenge,
): boolean {
  return getStoredChoiceState(sectionState, challenge).isCorrect
}

function getStoredPageIndex(
  sectionState: Record<string, Record<string, unknown>>,
  sectionId: string,
  pageCount: number,
): number {
  const pageIndex = sectionState[sectionId]?.pageIndex
  const maxPageIndex = Math.max(pageCount - 1, 0)
  if (typeof pageIndex !== 'number' || !Number.isInteger(pageIndex)) return 0
  return Math.min(Math.max(pageIndex, 0), maxPageIndex)
}

function addSolvedChallengeId(solvedChallengeIds: string[], challengeId: string): string[] {
  return solvedChallengeIds.includes(challengeId)
    ? solvedChallengeIds
    : [...solvedChallengeIds, challengeId]
}

function hasSolvedChoice(
  sectionState: Record<string, Record<string, unknown>>,
  challenge: ChoiceChallenge,
  solvedChallengeIds: string[],
): boolean {
  return solvedChallengeIds.includes(challenge.id) || hasStoredCorrectChoice(sectionState, challenge)
}

function ChanceSpinner({
  visual,
  themeFlavor,
  showCountSummary,
}: {
  visual: SpinnerVisual
  themeFlavor: Lesson4ThemeFlavor
  showCountSummary: boolean
}) {
  const [selectedPrize, setSelectedPrize] = useState<PrizeKind>(
    visual.targetPrize ?? visual.spaces[0].prize,
  )
  const [landedIndex, setLandedIndex] = useState<number | null>(null)
  const [spinRotation, setSpinRotation] = useState(0)
  const themedVisual = themeSpinnerVisualText(visual, themeFlavor)
  const selectedPrizeDefinition = themeFlavor.prizeDefinitions[selectedPrize]
  const selectedCount = countPrize(visual.spaces, selectedPrize)
  const visiblePrizes = getVisiblePrizes(visual)
  const visualTheme = themeFlavor.visual

  function handleSpin() {
    const nextIndex = Math.floor(Math.random() * visual.spaces.length)
    const slice = 360 / visual.spaces.length
    const segmentCenter = nextIndex * slice + slice / 2
    const targetMod = (360 - segmentCenter) % 360

    setLandedIndex(nextIndex)
    setSelectedPrize(visual.spaces[nextIndex].prize)
    setSpinRotation((currentRotation) => {
      const currentMod = ((currentRotation % 360) + 360) % 360
      const delta = (targetMod - currentMod + 360) % 360
      return currentRotation + 720 + delta
    })
  }

  return (
    <div
      className="chance-spinner-card"
      style={{ background: visualTheme.panelBackground, borderColor: visualTheme.borderColor }}
    >
      <div className="chance-spinner-card__header">
        <h2 style={{ color: visualTheme.buttonText }}>{themedVisual.title}</h2>
        <p style={{ color: visualTheme.hintText }}>{themedVisual.helperText}</p>
      </div>

      <div className="chance-spinner-wrap">
        <div
          className="chance-spinner"
          style={
            {
              '--spinner-bg': getSpinnerBackground(visual.spaces, themeFlavor),
              '--spinner-rotation': `${spinRotation}deg`,
              borderColor: visualTheme.accentColor,
            } as CSSProperties
          }
          aria-label={`${themedVisual.title} with equal prize spaces`}
        >
          <div className="chance-spinner__rotor">
            <div className="chance-spinner__wheel" aria-hidden="true" />
            {visual.spaces.map((space, index) => {
              const prize = themeFlavor.prizeDefinitions[space.prize]
              const angle = index * (360 / visual.spaces.length) + 180 / visual.spaces.length
              const isSelected = selectedPrize === space.prize
              const isLanded = landedIndex === index

              return (
                <button
                  key={space.id}
                  type="button"
                  className={`chance-spinner__space${isSelected ? ' chance-spinner__space--selected' : ''}${isLanded ? ' chance-spinner__space--landed' : ''}`}
                  style={
                    {
                      '--chance-space-angle': `${angle}deg`,
                      background: visualTheme.buttonBackground,
                      borderColor: isSelected || isLanded ? visualTheme.accentColor : visualTheme.buttonBorder,
                      color: visualTheme.buttonText,
                      outlineColor: visualTheme.accentColor,
                    } as CSSProperties
                  }
                  aria-pressed={isSelected}
                  onClick={() => setSelectedPrize(space.prize)}
                  aria-label={`Inspect ${prize.label} space ${index + 1}`}
                >
                  <span aria-hidden="true">{prize.icon}</span>
                  <span>{prize.label}</span>
                </button>
              )
            })}
          </div>
          <div
            className="chance-spinner__arrow"
            style={{ borderTopColor: visualTheme.accentColor }}
            aria-hidden="true"
          />
          <div
            className="chance-spinner__hub"
            style={{
              background: `linear-gradient(135deg, ${visualTheme.accentColor}, ${visualTheme.spinnerColors.gown})`,
            }}
            aria-hidden="true"
          >
            ✦
          </div>
        </div>
      </div>

      <div className="chance-spinner-card__controls">
        <LessonButton label="Spin once" variant="secondary" onClick={handleSpin} />
        <div className="chance-spinner-card__prizes" aria-label="Prize counts">
          {visiblePrizes.map((prize) => {
            const definition = themeFlavor.prizeDefinitions[prize]
            const isSelected = selectedPrize === prize
            return (
              <button
                key={prize}
                type="button"
                className={`chance-spinner-card__prize${isSelected ? ' chance-spinner-card__prize--selected' : ''}`}
                style={{
                  background: isSelected ? visualTheme.accentColor : visualTheme.buttonBackground,
                  borderColor: isSelected ? visualTheme.accentColor : visualTheme.buttonBorder,
                  color: isSelected ? '#ffffff' : visualTheme.buttonText,
                }}
                aria-pressed={isSelected}
                onClick={() => setSelectedPrize(prize)}
              >
                <span aria-hidden="true">{definition.icon}</span>
                {definition.label}
              </button>
            )
          })}
        </div>
      </div>

      {showCountSummary && (
        <p className="chance-spinner-card__count" style={{ color: visualTheme.hintText }} aria-live="polite">
          {selectedPrizeDefinition.icon} {selectedPrizeDefinition.label} spaces:{' '}
          <strong>{selectedCount}</strong> / Total spaces: <strong>{visual.spaces.length}</strong>
        </p>
      )}
    </div>
  )
}

function ChoiceChallengeCard({
  challenge,
  themeFlavor,
  onCorrect,
}: {
  challenge: ChoiceChallenge
  themeFlavor: Lesson4ThemeFlavor
  onCorrect?: () => void
}) {
  const { profile, recordStudentMemoryEvent, updateLesson } = useLesson()
  const activeLesson = getProfileLessonProgress(profile)
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const sectionId = `lesson-4-choice-${challenge.id}`
  const savedChoiceState = getStoredChoiceState(activeLesson.sectionState, challenge)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(() => savedChoiceState.selectedAnswer)
  const [attemptedAnswers, setAttemptedAnswers] = useState<string[]>(() => savedChoiceState.attemptedAnswers)
  const [repeatMessage, setRepeatMessage] = useState<string | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(savedChoiceState.wrongAttempts)
  const isCorrect = selectedAnswer === challenge.answer
  const showFeedback = selectedAnswer !== null
  const conceptKey = `lesson-4-${challenge.id}`
  const shouldRevealSolution = canRevealSolution({
    memory: profile.studentMemory,
    conceptKey,
    wrongAttempts,
  })
  const visualTheme = themeFlavor.visual
  const submittedAnswer = attemptedAnswers[attemptedAnswers.length - 1] ?? selectedAnswer ?? ''
  const feedbackSubmissionKey = [
    attemptedAnswers.join(','),
    wrongAttempts,
    String(isCorrect),
  ].join('|')

  function handleAnswer(answer: string) {
    if (attemptedAnswers.includes(answer)) {
      setRepeatMessage(`You already tried **${answer}**. Try a different answer!`)
      return
    }

    const correct = answer === challenge.answer
    const nextAttemptedAnswers = [...attemptedAnswers, answer]
    const nextWrongAttempts = correct ? wrongAttempts : wrongAttempts + 1

    setAttemptedAnswers(nextAttemptedAnswers)
    setRepeatMessage(null)
    setSelectedAnswer(answer)
    setWrongAttempts(nextWrongAttempts)
    void updateLesson({
      sectionState: {
        [sectionId]: {
          selectedAnswer: answer,
          attemptedAnswers: nextAttemptedAnswers,
          wrongAttempts: nextWrongAttempts,
          isCorrect: correct,
        },
      },
    }).catch(() => undefined)
    void recordStudentMemoryEvent({
      type: 'challengeAttempt',
      lessonId: LESSON_4_ID,
      conceptKey,
      label: 'Spinner chance',
      outcome: correct ? 'correct' : 'incorrect',
      learnerAnswer: answer,
      correctAnswer: challenge.answer,
    }).catch(() => undefined)
    setFeedbackVoiceToken((token) => token + 1)
    if (correct) {
      onCorrect?.()
      return
    }
  }

  return (
    <div
      className="chance-challenge"
      style={{ background: visualTheme.hintBackground, borderColor: visualTheme.borderColor }}
    >
      <p className="chance-challenge__prompt" style={{ color: visualTheme.hintText }}>
        {challenge.prompt}
      </p>
      <div className="chance-challenge__choices" role="group" aria-label={challenge.prompt}>
        {challenge.options.map((option) => {
          const isSelected = selectedAnswer === option
          return (
            <button
              key={option}
              type="button"
              className={`chance-challenge__choice${isSelected ? ' chance-challenge__choice--selected' : ''}`}
              style={{
                background: isSelected ? visualTheme.accentColor : visualTheme.buttonBackground,
                borderColor: isSelected ? visualTheme.accentColor : visualTheme.buttonBorder,
                color: isSelected ? '#ffffff' : visualTheme.buttonText,
              }}
              aria-pressed={isSelected}
              onClick={() => handleAnswer(option)}
              disabled={isCorrect}
            >
              {option}
            </button>
          )
        })}
      </div>

      <HintButton
        lessonId={LESSON_4_ID}
        conceptKey={conceptKey}
        conceptLabel="Spinner chance"
        prompt={challenge.prompt}
        context="The learner is choosing which spinner outcome statement matches the visible winning spaces."
        fallbackHint={challenge.feedback.tryAgain}
        blockedAnswerTerms={[challenge.answer]}
        learnerAnswer={selectedAnswer ?? ''}
        attemptedAnswers={attemptedAnswers}
        wrongAttempts={wrongAttempts}
        disabled={!showFeedback || isCorrect}
      />

      {showFeedback && (
        <FeedbackBanner
          variant={isCorrect ? 'success' : 'error'}
          submissionKey={feedbackSubmissionKey}
          aiFeedback={{
            lessonId: LESSON_4_ID,
            conceptKey,
            conceptLabel: 'Spinner chance',
            problem: challenge.prompt,
            learnerAnswer: submittedAnswer,
            correctAnswer: challenge.answer,
            attemptedAnswers,
            context: 'The learner is choosing which spinner outcome statement matches the visible winning spaces.',
          }}
          voiceCue={{
            correctClipKey: 'lesson4.feedback.correct',
            enabled: profile.voiceEnabled,
            lessonId: LESSON_4_ID,
            playToken: feedbackVoiceToken || null,
            themePreference: profile.themePreference,
            tryAgainClipKey: 'lesson4.feedback.tryAgain',
          }}
          message={
            isCorrect
              ? challenge.feedback.correct
              : shouldRevealSolution
                ? challenge.feedback.solution
                : challenge.feedback.tryAgain
          }
          solution={isCorrect ? challenge.feedback.solution : undefined}
        />
      )}
      {repeatMessage && <FeedbackBanner variant="info" message={repeatMessage} />}
    </div>
  )
}

function MiniLessonPage({
  page,
  themeFlavor,
  onCorrect,
  showCountSummary,
}: {
  page: Lesson4MiniLessonPage
  themeFlavor: Lesson4ThemeFlavor
  onCorrect: () => void
  showCountSummary: boolean
}) {
  if (isChallengePage(page)) {
    const themedPage = themeChoiceChallenge(page, themeFlavor)
    return (
      <div className="chance-mini-lesson__page">
        <ChanceSpinner
          visual={getThemedSpinnerVisual(page.visual, themeFlavor)}
          themeFlavor={themeFlavor}
          showCountSummary={showCountSummary}
        />
        <ChoiceChallengeCard challenge={themedPage} themeFlavor={themeFlavor} onCorrect={onCorrect} />
      </div>
    )
  }

  return (
    <div className="chance-mini-lesson__page">
      <LessonText
        text={themePrizeText(page.body, themeFlavor)}
        className="anchor-lesson__text anchor-lesson__text--enter"
      />
      {page.equation && (
        <div className="chance-equation" aria-label="Chance equation">
          {themePrizeText(page.equation, themeFlavor).split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}

export function Lesson4OneSpin({ princessName }: Lesson4ScreenProps) {
  const { lesson4Flavor, lesson4Style, profile, updateScreen } = useThemedLesson()
  const activeLesson = getProfileLessonProgress(profile)
  const copy = getThemedScreen1Copy(lesson4Flavor)
  const challenge = themeChoiceChallenge(copy.challenge, lesson4Flavor)
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<string[]>([])
  const challengeSolved = hasSolvedChoice(activeLesson.sectionState, challenge, solvedChallengeIds)

  return (
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton label="← Back to Lessons" onClick={() => void updateScreen(0)} />
      <h1>{copy.heading}</h1>
      <LessonText text={copy.body(princessName)} className="anchor-lesson__text" />
      <VoiceButton
        autoPlay={!challengeSolved}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_4_ID}
        clipKey="lesson4.screen1.spinnerIntro"
        themePreference={profile.themePreference}
        label="Listen to spinner tip"
      />
      <ChanceSpinner
        visual={getThemedSpinnerVisual(screen1Visual, lesson4Flavor)}
        themeFlavor={lesson4Flavor}
        showCountSummary={challengeSolved}
      />
      <ChoiceChallengeCard
        challenge={challenge}
        themeFlavor={lesson4Flavor}
        onCorrect={() =>
          setSolvedChallengeIds((ids) => addSolvedChallengeId(ids, challenge.id))
        }
      />
      {challengeSolved && (
        <>
          <FeedbackBanner variant="info" message={copy.keyLine} />
          <LessonButton label="Find winning spaces" onClick={() => void updateScreen(2)} />
        </>
      )}
    </section>
  )
}

export function Lesson4WinningSpaces() {
  const { lesson4Flavor, lesson4Style, profile, updateLesson, updateScreen } = useThemedLesson()
  const activeLesson = getProfileLessonProgress(profile)
  const miniLesson = getThemedScreen2MiniLesson(lesson4Flavor)
  const sectionId = 'lesson-4-winning-spaces'
  const [pageIndex, setPageIndex] = useState(() =>
    getStoredPageIndex(activeLesson.sectionState, sectionId, miniLesson.pages.length),
  )
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<string[]>([])
  const rubyChallengeSolved = isPageSolved(miniLesson.pages[2])

  function handlePageChange(nextPageIndex: number) {
    const pageIndexToSave = Math.min(Math.max(nextPageIndex, 0), miniLesson.pages.length - 1)
    setPageIndex(pageIndexToSave)
    void updateLesson({
      sectionState: {
        [sectionId]: { pageIndex: pageIndexToSave },
      },
    }).catch(() => undefined)
  }

  function isPageSolved(page: Lesson4MiniLessonPage) {
    return (
      isChallengePage(page) &&
      hasSolvedChoice(activeLesson.sectionState, themeChoiceChallenge(page, lesson4Flavor), solvedChallengeIds)
    )
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{miniLesson.title}</h1>
      {miniLesson.description && (
        <LessonText text={miniLesson.description} className="anchor-lesson__text" />
      )}
      {pageIndex < 2 && (
        <ChanceSpinner
          visual={getThemedSpinnerVisual(rubySpinnerVisual, lesson4Flavor)}
          themeFlavor={lesson4Flavor}
          showCountSummary={rubyChallengeSolved}
        />
      )}
      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={handlePageChange}
        onComplete={() => void updateScreen(3)}
        nextLabel="Next"
        completeLabel="Compare prizes"
        navClassName="anchor-lesson__nav"
        showDots
        showNext={(page) => !isChallengePage(page) || isPageSolved(page)}
        renderPage={(page) => (
          <MiniLessonPage
            key={page.id}
            page={page}
            themeFlavor={lesson4Flavor}
            showCountSummary={isPageSolved(page)}
            onCorrect={() =>
              setSolvedChallengeIds((ids) => addSolvedChallengeId(ids, page.id))
            }
          />
        )}
      />
      {rubyChallengeSolved && (
        <FeedbackBanner variant="info" message={screen2KeyLine} />
      )}
    </section>
  )
}

export function Lesson4MoreLikely() {
  const { lesson4Flavor, lesson4Style, profile, updateScreen } = useThemedLesson()
  const activeLesson = getProfileLessonProgress(profile)
  const copy = getThemedScreen3Copy(lesson4Flavor)
  const compareChallenge = themeChoiceChallenge(copy.compareChallenge, lesson4Flavor)
  const crownChallenge = themeChoiceChallenge(copy.crownChallenge, lesson4Flavor)
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<string[]>([])
  const compareSolved = hasSolvedChoice(activeLesson.sectionState, compareChallenge, solvedChallengeIds)
  const crownSolved = hasSolvedChoice(activeLesson.sectionState, crownChallenge, solvedChallengeIds)

  return (
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{copy.heading}</h1>
      <LessonText text={copy.body} className="anchor-lesson__text" />
      <ChanceSpinner
        visual={getThemedSpinnerVisual(compareSpinnerVisual, lesson4Flavor)}
        themeFlavor={lesson4Flavor}
        showCountSummary={compareSolved && crownSolved}
      />
      <ChoiceChallengeCard
        challenge={compareChallenge}
        themeFlavor={lesson4Flavor}
        onCorrect={() =>
          setSolvedChallengeIds((ids) => addSolvedChallengeId(ids, compareChallenge.id))
        }
      />
      {compareSolved && (
        <ChoiceChallengeCard
          challenge={crownChallenge}
          themeFlavor={lesson4Flavor}
          onCorrect={() =>
            setSolvedChallengeIds((ids) => addSolvedChallengeId(ids, crownChallenge.id))
          }
        />
      )}
      {compareSolved && crownSolved && (
        <LessonButton label="Check impossible outcomes" onClick={() => void updateScreen(4)} />
      )}
    </section>
  )
}

export function Lesson4ImpossibleCertain() {
  const { lesson4Flavor, lesson4Style, profile, updateLesson, updateScreen } = useThemedLesson()
  const activeLesson = getProfileLessonProgress(profile)
  const miniLesson = getThemedScreen4MiniLesson(lesson4Flavor)
  const sectionId = 'lesson-4-impossible-certain'
  const [pageIndex, setPageIndex] = useState(() =>
    getStoredPageIndex(activeLesson.sectionState, sectionId, miniLesson.pages.length),
  )
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<string[]>([])
  const impossibleChallengeSolved = isPageSolved(miniLesson.pages[1])
  const certainChallengeSolved = isPageSolved(miniLesson.pages[3])

  function handlePageChange(nextPageIndex: number) {
    const pageIndexToSave = Math.min(Math.max(nextPageIndex, 0), miniLesson.pages.length - 1)
    setPageIndex(pageIndexToSave)
    void updateLesson({
      sectionState: {
        [sectionId]: { pageIndex: pageIndexToSave },
      },
    }).catch(() => undefined)
  }

  function isPageSolved(page: Lesson4MiniLessonPage) {
    return (
      isChallengePage(page) &&
      hasSolvedChoice(activeLesson.sectionState, themeChoiceChallenge(page, lesson4Flavor), solvedChallengeIds)
    )
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(3)} />
      <h1>{miniLesson.title}</h1>
      {pageIndex === 0 && (
        <ChanceSpinner
          visual={getThemedSpinnerVisual(impossibleVisual, lesson4Flavor)}
          themeFlavor={lesson4Flavor}
          showCountSummary={impossibleChallengeSolved}
        />
      )}
      {pageIndex === 2 && (
        <ChanceSpinner
          visual={getThemedSpinnerVisual(certainVisual, lesson4Flavor)}
          themeFlavor={lesson4Flavor}
          showCountSummary={certainChallengeSolved}
        />
      )}
      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={handlePageChange}
        onComplete={() => void updateScreen(5)}
        nextLabel="Next"
        completeLabel="Final wheel"
        navClassName="anchor-lesson__nav"
        showDots
        showNext={(page) => !isChallengePage(page) || isPageSolved(page)}
        renderPage={(page) => (
          <MiniLessonPage
            key={page.id}
            page={page}
            themeFlavor={lesson4Flavor}
            showCountSummary={isPageSolved(page)}
            onCorrect={() =>
              setSolvedChallengeIds((ids) => addSolvedChallengeId(ids, page.id))
            }
          />
        )}
      />
    </section>
  )
}

export function Lesson4Finale() {
  const { lesson4Flavor, lesson4Style, profile, updateLesson, updateScreen } = useThemedLesson()
  const activeLesson = getProfileLessonProgress(profile)
  const copy = getThemedScreen5Copy(lesson4Flavor)
  const crownChallenge = themeChoiceChallenge(copy.crownChallenge, lesson4Flavor)
  const rubyDragonChallenge = themeChoiceChallenge(copy.rubyDragonChallenge, lesson4Flavor)
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<string[]>([])
  const [finishing, setFinishing] = useState(false)
  const [finaleState, setFinaleState] = useSectionState<Lesson4FinaleState>(
    'lesson-4-finale',
    { retrievalPracticeSolved: false, showPracticePage: false },
  )
  const lessonCompleted = activeLesson.completed
  const retrievalPracticeSolved = finaleState.retrievalPracticeSolved === true
  const showPracticePage = finaleState.showPracticePage === true
  const crownSolved =
    lessonCompleted || hasSolvedChoice(activeLesson.sectionState, crownChallenge, solvedChallengeIds)
  const compareSolved =
    lessonCompleted || hasSolvedChoice(activeLesson.sectionState, rubyDragonChallenge, solvedChallengeIds)

  async function handleFinish() {
    if (finishing) return
    setFinishing(true)
    try {
      if (lessonCompleted) {
        await updateScreen(0)
        return
      }
      playCompletionTada()
      await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
    } catch (error) {
      setFinishing(false)
      throw error
    }
  }

  function setShowPracticePage(showPractice: boolean) {
    setFinaleState({ showPracticePage: showPractice })
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton
        label={showPracticePage ? '← Back to Final Wheel' : '← Back'}
        onClick={() => {
          if (showPracticePage) {
            setShowPracticePage(false)
          } else {
            void updateScreen(4)
          }
        }}
      />
      <h1>{showPracticePage ? 'Practice' : copy.heading}</h1>
      {showPracticePage ? (
        <>
          <LessonText text="Solve both practice problems to unlock the finish button." />
          <RetrievalPracticeSet
            initiallySolved={retrievalPracticeSolved}
            initialState={finaleState.retrievalPracticeState}
            onStateChange={(retrievalPracticeState) => setFinaleState({ retrievalPracticeState })}
            onSolvedChange={(solved) => {
              if (solved && !retrievalPracticeSolved) {
                setFinaleState({ retrievalPracticeSolved: true })
              }
            }}
            problems={lesson4RetrievalPracticeProblems}
          />
          <LessonButton
            label={lessonCompleted ? 'Return to Academy' : finishing ? 'Saving...' : 'Finish Lesson'}
            onClick={handleFinish}
            disabled={!retrievalPracticeSolved || finishing}
          />
        </>
      ) : (
        <>
          <LessonText text={copy.body} className="anchor-lesson__text" />
          <ChanceSpinner
            visual={getThemedSpinnerVisual(finaleVisual, lesson4Flavor)}
            themeFlavor={lesson4Flavor}
            showCountSummary={crownSolved && compareSolved}
          />
          <ChoiceChallengeCard
            challenge={crownChallenge}
            themeFlavor={lesson4Flavor}
            onCorrect={() =>
              setSolvedChallengeIds((ids) => addSolvedChallengeId(ids, crownChallenge.id))
            }
          />
          {crownSolved && (
            <ChoiceChallengeCard
              challenge={rubyDragonChallenge}
              themeFlavor={lesson4Flavor}
              onCorrect={() =>
                setSolvedChallengeIds((ids) => addSolvedChallengeId(ids, rubyDragonChallenge.id))
              }
            />
          )}
          {crownSolved && compareSolved && (
            <>
              <FeedbackBanner variant="info" message={copy.finalMessage} />
              <LessonButton
                label={lessonCompleted && retrievalPracticeSolved ? 'Return to Academy' : 'Practice'}
                onClick={lessonCompleted && retrievalPracticeSolved ? handleFinish : () => setShowPracticePage(true)}
                disabled={finishing}
              />
            </>
          )}
        </>
      )}
    </section>
  )
}
