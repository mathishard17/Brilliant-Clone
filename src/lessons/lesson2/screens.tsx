import { useRef, useState, type CSSProperties } from 'react'
import '../../screens/screens.css'
import { ChallengeQuestion } from '../../components/ChallengeQuestion'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { HintButton } from '../../components/HintButton'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
import { RetrievalPracticeSet } from '../../components/RetrievalPracticeSet'
import { ScreenBackButton } from '../../components/ScreenBackButton'
import { VoiceButton } from '../../components/VoiceButton'
import {
  createLesson2ThemeText,
  lesson2Clickthrough,
  lesson2FinalClickthrough,
  lesson2VisualizationSections,
  type Lesson2ClickthroughPage,
  type Lesson2FinalPage,
  type Lesson2ThemeText,
} from './copy'
import { useLesson } from '../../hooks/useLesson'
import { useSectionState } from '../../hooks/useSectionState'
import {
  getThemeItemMotifs,
  getThemeMotif,
  lesson1ThemeStyle,
  resolveLesson1Theme,
} from '../../themes/themeResolver'
import type { Lesson1ThemePack, ThemeMotifShape } from '../../themes/themeTypes'
import { LESSON_2_ID } from '../../types/lesson'
import { playCompletionTada } from '../../utils/completionSound'
import { getProfileLessonProgress } from '../../utils/lessonProgress'
import { canRevealSolution } from '../../utils/solutionReveal'

interface Lesson2SectionProps {
  princessName: string
}

type JewelMode = 'normal' | 'restricted' | 'identical'
type StableJewelValue = 'ruby' | 'sapphire' | 'gold'
type JewelLabelKey = 'firstItemLabel' | 'secondItemLabel' | 'thirdItemLabel'

interface ChallengeUiState {
  answerInput: string
  attemptedAnswers: string[]
  submitted: boolean
  isCorrect: boolean | null
  wrongAttempts: number
}

interface MiniLessonProgressState extends Record<string, unknown> {
  pageIndex: number
  challengeStates: Record<string, ChallengeUiState>
  retrievalPracticeSolved: boolean
}

function createChallengeUiState(): ChallengeUiState {
  return {
    answerInput: '',
    attemptedAnswers: [],
    submitted: false,
    isCorrect: null,
    wrongAttempts: 0,
  }
}

function createMiniLessonProgressState(): MiniLessonProgressState {
  return {
    pageIndex: 0,
    challengeStates: {},
    retrievalPracticeSolved: false,
  }
}

function clampPageIndex(pageIndex: number, pageCount: number) {
  if (pageCount <= 0) return 0
  return Math.min(Math.max(pageIndex, 0), pageCount - 1)
}

function getSavedChallengeState(progress: MiniLessonProgressState, pageId: string): ChallengeUiState {
  return {
    ...createChallengeUiState(),
    ...progress.challengeStates[pageId],
  }
}

function recordChallengeAttempt(
  current: ChallengeUiState,
  normalizedAnswer: string,
  correct: boolean,
  countWrongAttempt: boolean,
): ChallengeUiState {
  return {
    ...current,
    attemptedAnswers: current.attemptedAnswers.includes(normalizedAnswer)
      ? current.attemptedAnswers
      : [...current.attemptedAnswers, normalizedAnswer],
    submitted: true,
    isCorrect: correct,
    wrongAttempts: countWrongAttempt ? current.wrongAttempts + 1 : current.wrongAttempts,
  }
}

const DISPLAY_TOKENS = [
  { id: 'ruby', value: 'ruby', labelKey: 'firstItemLabel', className: 'marble-visualization__marble--red' },
  { id: 'sapphire', value: 'sapphire', labelKey: 'secondItemLabel', className: 'marble-visualization__marble--blue' },
  { id: 'gold', value: 'gold', labelKey: 'thirdItemLabel', className: 'marble-visualization__marble--gold' },
] as const

const IDENTICAL_FIRST_TOKENS = [
  { id: 'ruby-1', value: 'ruby', labelKey: 'firstItemLabel', className: 'marble-visualization__marble--red' },
  { id: 'ruby-2', value: 'ruby', labelKey: 'firstItemLabel', className: 'marble-visualization__marble--red' },
  { id: 'sapphire', value: 'sapphire', labelKey: 'secondItemLabel', className: 'marble-visualization__marble--blue' },
] as const

const LESSON_2_RETRIEVAL_PRACTICE_PROBLEMS = [
  {
    id: 'lesson-1-counting-choices',
    prompt: 'Remember choices: a badge maker has **4 shapes** and **3 colors**. How many different badges can they make?',
    answer: 12,
    correctFeedback: 'Yes: 4 shapes times 3 colors makes **12** badges.',
    tryAgainFeedback: 'Multiply the two kinds of choices.',
  },
  {
    id: 'lesson-2-ordered-arrangements',
    prompt: 'Order check: how many ways can **4 different jewels** line up in 4 spots?',
    answer: 24,
    correctFeedback: 'Exactly: 4 choices, then 3, then 2, then 1 makes **24** orders.',
    tryAgainFeedback: 'Count spot by spot: first spot, second spot, third spot, last spot.',
  },
]
const LESSON_2_RETRIEVAL_PRACTICE_PAGE_ID = 'lesson-2-retrieval-practice'

type Jewel = {
  id: string
  value: StableJewelValue
  labelKey: JewelLabelKey
  className: string
}

interface Lesson2VisualTheme {
  screenStyle: CSSProperties
  panelStyle: CSSProperties
  spotStyle: CSSProperties
  filledSpotStyle: CSSProperties
  choiceStyle: CSSProperties
  choiceUsedStyle: CSSProperties
  ordersStyle: CSSProperties
  orderHeadingStyle: CSSProperties
  counterStyle: CSSProperties
  marbleStyles: Record<StableJewelValue, CSSProperties>
  restrictedSpotStyle: CSSProperties
  restrictedLabelStyle: CSSProperties
}

interface Lesson2ItemMotif {
  background: string
  border?: string
  heartColor?: string
  motifShape?: ThemeMotifShape
}

function motifShapeStyle(shape: ThemeMotifShape | undefined): CSSProperties {
  switch (shape) {
    case 'square':
      return { borderRadius: '0.7rem' }
    case 'diamond':
      return {
        borderRadius: '0.35rem',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      }
    case 'triangle':
      return {
        borderRadius: '0.2rem',
        clipPath: 'polygon(50% 0%, 100% 92%, 0% 92%)',
      }
    case 'star':
      return {
        borderRadius: '0.25rem',
        clipPath:
          'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      }
    case 'heart':
      return {
        borderRadius: '0.85rem',
        clipPath:
          'polygon(50% 85%, 17% 52%, 9% 35%, 12% 18%, 25% 7%, 39% 11%, 50% 24%, 61% 11%, 75% 7%, 88% 18%, 91% 35%, 83% 52%)',
      }
    case 'paw':
      return { borderRadius: '44% 56% 48% 52%', transform: 'rotate(-8deg)' }
    default:
      return { borderRadius: '50%' }
  }
}

function marbleStyle(motif: Lesson2ItemMotif, fallbackPrimary: string): CSSProperties {
  const primary = motif.heartColor ?? motif.border ?? fallbackPrimary
  return {
    ...motifShapeStyle(motif.motifShape),
    background: `radial-gradient(circle at 32% 28%, ${motif.background} 0 18%, ${primary} 19% 100%)`,
    borderColor: motif.border ?? 'var(--theme-neutral-border, rgb(148 163 184 / 0.42))',
  }
}

function createLesson2VisualTheme(theme: Lesson1ThemePack): Lesson2VisualTheme {
  const itemMotifs = getThemeItemMotifs(theme)
  const motif = getThemeMotif(theme)
  const firstItem = itemMotifs['pink-gown']
  const secondItem = itemMotifs['purple-dress']
  const thirdItem = itemMotifs['emerald-gown']

  return {
    screenStyle: lesson1ThemeStyle(theme),
    panelStyle: {
      background: 'var(--theme-panel-bg, #faf5ff)',
      borderColor: 'var(--theme-border, var(--color-border))',
    },
    spotStyle: {
      borderColor: 'var(--theme-button-border, #c4b5fd)',
      background: 'var(--theme-button-bg, #fff)',
    },
    filledSpotStyle: {
      borderStyle: 'solid',
      borderColor: 'var(--theme-accent, var(--color-primary))',
      background: 'var(--theme-stage-bg, #fce7f3)',
    },
    choiceStyle: {
      background: 'var(--theme-button-bg, #fff)',
      color: 'var(--theme-button-text, var(--color-text))',
      borderColor: 'var(--theme-button-border, var(--color-border))',
    },
    choiceUsedStyle: {
      opacity: 1,
      background: 'var(--theme-hint-bg, #eff6ff)',
      borderColor: 'var(--theme-accent, var(--color-primary))',
      boxShadow: '0 0 0 3px color-mix(in srgb, var(--schema-neon, var(--theme-accent, #22d3ee)) 28%, transparent)',
    },
    ordersStyle: {
      background: 'var(--theme-panel-bg, #fff)',
      borderColor: 'var(--theme-border, var(--color-border))',
    },
    orderHeadingStyle: {
      color: 'var(--theme-accent, var(--color-primary))',
    },
    counterStyle: {
      color: 'var(--theme-hint-text, var(--color-text-muted))',
    },
    marbleStyles: {
      ruby: marbleStyle(firstItem, '#ef4444'),
      sapphire: marbleStyle(secondItem, '#3b82f6'),
      gold: marbleStyle(thirdItem, '#f59e0b'),
    },
    restrictedSpotStyle: {
      borderColor: motif.primary,
      background: 'var(--theme-hint-bg, #fdf2f8)',
    },
    restrictedLabelStyle: {
      position: 'absolute',
      top: '0.2rem',
      fontSize: '0.65rem',
      fontWeight: 700,
      color: 'var(--theme-hint-text, #831843)',
    },
  }
}

function useLesson2Theme() {
  const { profile } = useLesson()
  const theme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  return {
    themeText: createLesson2ThemeText(theme),
    visualTheme: createLesson2VisualTheme(theme),
  }
}

interface FoundJewelOrder {
  key: string
  order: string[]
  valid: boolean
}

interface MarblePermutationVisualizationProps extends Lesson2SectionProps {
  mode: JewelMode
  themeText: Lesson2ThemeText
  visualTheme: Lesson2VisualTheme
  onSolved: () => void
}

function MarblePermutationVisualization({
  princessName,
  mode,
  themeText,
  visualTheme,
  onSolved,
}: MarblePermutationVisualizationProps) {
  const [state, setState] = useSectionState(`lesson-2-${mode}-visual-proof`, {
    uniqueOrders: [] as FoundJewelOrder[],
  })
  const { profile, recordStudentMemoryEvent } = useLesson()
  const [placedMarbles, setPlacedMarbles] = useState<string[]>([])
  const [challengeState, setChallengeState] = useState(createChallengeUiState)
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const { uniqueOrders } = state
  const { answerInput, attemptedAnswers, submitted, isCorrect, wrongAttempts } = challengeState
  const jewels: readonly Jewel[] = mode === 'identical' ? IDENTICAL_FIRST_TOKENS : DISPLAY_TOKENS
  const targetAnswer = mode === 'normal' ? 6 : mode === 'restricted' ? 4 : 3
  const validOrdersFound = uniqueOrders.filter((order) => order.valid).length
  const answerMatchesTarget = Number(answerInput) === targetAnswer
  const submittedAnswer = attemptedAnswers[attemptedAnswers.length - 1] ?? answerInput
  const conceptKey = `lesson-2-${mode}`
  const canShowSolution = canRevealSolution({
    memory: profile.studentMemory,
    conceptKey,
    wrongAttempts,
  })
  const feedbackSubmissionKey = [
    attemptedAnswers.join(','),
    wrongAttempts,
    String(isCorrect),
  ].join('|')
  const visualSolved = validOrdersFound >= targetAnswer
  const optionalProofNudge = visualSolved
    ? ''
    : ` You can keep using the display to test more ${themeText.arrangementNounPlural}, or continue when you're ready.`
  const prompt =
    mode === 'normal'
      ? `How many different display orders can you make with 3 different ${themeText.itemNounPlural}?`
      : mode === 'restricted'
        ? `How many valid display orders are there if ${themeText.firstItemLabel} cannot go first?`
        : `How many displays look different with 2 matching ${themeText.firstItemLabel} ${themeText.itemNounPlural} and 1 ${themeText.secondItemLabel} ${themeText.itemNoun}?`
  const solutionMessage =
    mode === 'normal'
      ? `Solution: the first spot has **3** choices, the second spot has **2**, and the last spot has **1**, so **3 × 2 × 1 = 6**.`
      : mode === 'restricted'
        ? `Solution: with ${themeText.firstItemLabel} banned from the first spot, the first spot has **2** choices. Then the remaining spots have **2** and **1**, so **2 × 2 × 1 = 4**.`
        : `Solution: only the position of the ${themeText.secondItemLabel} ${themeText.itemNoun} changes the visible display: first, middle, or last. That makes **3** visible displays.`
  const emptyText =
    mode === 'identical'
      ? `Complete a 3-${themeText.itemNoun} ${themeText.arrangementNoun} to record the visible order here.`
      : `Complete a 3-${themeText.itemNoun} ${themeText.arrangementNoun} to record it here.`
  const counterLabel =
    mode === 'restricted' ? 'Valid unique orderings found' : 'Total unique orderings found'
  const counterValue = isCorrect === true
    ? String(validOrdersFound)
    : validOrdersFound === 0
      ? 'None yet'
      : 'Some found'

  function placeMarble(marbleId: string) {
    if (placedMarbles.includes(marbleId) || placedMarbles.length >= jewels.length) return
    const next = [...placedMarbles, marbleId]
    setPlacedMarbles(next)
    let nextOrders = uniqueOrders
    if (next.length === jewels.length) {
      const values = next.map((id) => getMarble(id)?.value ?? id)
      const key = values.join('-')
      const valid = mode !== 'restricted' || values[0] !== 'ruby'
      nextOrders = uniqueOrders.some((order) => order.key === key)
        ? uniqueOrders
        : [...uniqueOrders, { key, order: next, valid }]
    }
    if (nextOrders !== uniqueOrders) {
      setState({ uniqueOrders: nextOrders })
    }
  }

  function resetMarbles() {
    setPlacedMarbles([])
  }

  function handleSubmit() {
    const normalizedAnswer = answerInput.trim()
    const correct = answerMatchesTarget
    if (correct) onSolved()
    setChallengeState((current) => recordChallengeAttempt(current, normalizedAnswer, correct, !correct))
    void recordStudentMemoryEvent({
      type: 'challengeAttempt',
      lessonId: LESSON_2_ID,
      conceptKey,
      label: 'Ordered arrangements',
      outcome: correct ? 'correct' : 'incorrect',
      learnerAnswer: normalizedAnswer,
      correctAnswer: String(targetAnswer),
    }).catch(() => undefined)
    setFeedbackVoiceToken((token) => token + 1)
  }

  function getMarble(marbleId: string) {
    return jewels.find((marble) => marble.id === marbleId)
  }

  function getMarbleLabel(marble: Jewel) {
    return themeText[marble.labelKey]
  }

  function renderMarbleSequence(order: string[]) {
    return order.map((marbleId) => {
      const marble = getMarble(marbleId)
      if (!marble) return null
      return (
        <span
          key={marbleId}
          className={`marble-visualization__marble marble-visualization__marble--small ${marble.className}`}
          style={visualTheme.marbleStyles[marble.value]}
          aria-label={getMarbleLabel(marble)}
        />
      )
    })
  }

  return (
    <div className="marble-visualization" style={visualTheme.panelStyle}>
      <div
        className="marble-visualization__spots"
        aria-label={`Three blank ${themeText.itemNoun} display spots`}
      >
        {Array.from({ length: jewels.length }, (_, index) => {
          const marble = placedMarbles[index] ? getMarble(placedMarbles[index]) : null
          const restrictedFirstSpot = mode === 'restricted' && index === 0
          const spotStyle: CSSProperties = {
            ...visualTheme.spotStyle,
            ...(marble ? visualTheme.filledSpotStyle : {}),
            ...(restrictedFirstSpot ? visualTheme.restrictedSpotStyle : {}),
          }
          return (
            <div
              key={index}
              className={`marble-visualization__spot${marble ? ' marble-visualization__spot--filled' : ''}`}
              style={spotStyle}
            >
              {restrictedFirstSpot && (
                <span style={visualTheme.restrictedLabelStyle}>No {themeText.firstItemLabel}</span>
              )}
              {marble && (
                <span
                  className={`marble-visualization__marble ${marble.className}`}
                  style={visualTheme.marbleStyles[marble.value]}
                  aria-label={getMarbleLabel(marble)}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="marble-visualization__choices" aria-label={`Available ${themeText.itemNounPlural}`}>
        {jewels.map((marble) => {
          const used = placedMarbles.includes(marble.id)
          const marbleLabel = getMarbleLabel(marble)
          const choiceStyle = used
            ? { ...visualTheme.choiceStyle, ...visualTheme.choiceUsedStyle }
            : visualTheme.choiceStyle
          return (
            <button
              key={marble.id}
              type="button"
              className={`marble-visualization__choice ${used ? 'marble-visualization__choice--used' : ''}`}
              style={choiceStyle}
              onClick={() => placeMarble(marble.id)}
              disabled={used || placedMarbles.length >= jewels.length}
              aria-pressed={used}
              aria-label={used ? `${marbleLabel} placed` : `Place ${marbleLabel}`}
            >
              <span
                className={`marble-visualization__marble ${marble.className}`}
                style={visualTheme.marbleStyles[marble.value]}
              />
              <span>{used ? `${marbleLabel} placed` : marbleLabel}</span>
            </button>
          )
        })}
      </div>

      <LessonButton label="Clear lineup" variant="secondary" onClick={resetMarbles} />

      <div className="marble-visualization__orders" style={visualTheme.ordersStyle} aria-live="polite">
        <h2 style={visualTheme.orderHeadingStyle}>
          {mode === 'identical' ? 'Unique visible orders found' : 'Unique orderings found'}
        </h2>
        {uniqueOrders.length === 0 ? (
          <p>{emptyText}</p>
        ) : (
          <ol>
            {uniqueOrders.map((foundOrder) => (
              <li
                key={foundOrder.key}
                className={foundOrder.valid ? '' : 'marble-visualization__order--invalid'}
              >
                <span className="marble-visualization__order-combo">
                  {renderMarbleSequence(foundOrder.order)}
                </span>
                {mode === 'restricted' && (
                  <span className="marble-visualization__order-status">
                    {foundOrder.valid ? 'Valid' : `${themeText.firstItemLabel} first is not allowed`}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
        <p className="marble-visualization__counter" style={visualTheme.counterStyle}>
          {counterLabel}: <strong>{counterValue}</strong>
        </p>
      </div>

      <ChallengeQuestion
        key={mode}
        prompt={prompt}
        value={answerInput}
        onChange={(value) => setChallengeState((current) => ({ ...current, answerInput: value }))}
        onSubmit={handleSubmit}
        attemptedAnswers={attemptedAnswers}
        submitted={submitted}
        allowRetry={submitted && isCorrect === false}
      />
      <HintButton
        lessonId={LESSON_2_ID}
        conceptKey={conceptKey}
        conceptLabel="Ordered arrangements"
        prompt={prompt}
        context={`The learner is arranging ${themeText.itemNounPlural} in spots and checking unique visible ${themeText.arrangementNounPlural}.`}
        fallbackHint={
          mode === 'restricted'
            ? `Start with the first spot, then skip any ${themeText.itemNoun} that is not allowed there.`
            : mode === 'identical'
              ? `Ask which ${themeText.itemNoun} actually changes the visible display.`
              : `Pick the first spot first, then count what is left for the next spot.`
        }
        blockedAnswerTerms={[String(targetAnswer)]}
        learnerAnswer={answerInput}
        attemptedAnswers={attemptedAnswers}
        wrongAttempts={wrongAttempts}
        disabled={!submitted || isCorrect === true}
      />

      {submitted && isCorrect !== null && (
        <FeedbackBanner
          variant={isCorrect ? 'success' : 'error'}
          submissionKey={feedbackSubmissionKey}
          aiFeedback={{
            lessonId: LESSON_2_ID,
            conceptKey,
            conceptLabel: 'Ordered arrangements',
            problem: prompt,
            learnerAnswer: submittedAnswer,
            correctAnswer: String(targetAnswer),
            attemptedAnswers,
            context: `The learner is arranging ${themeText.itemNounPlural} in spots and checking unique visible ${themeText.arrangementNounPlural}.`,
          }}
          voiceCue={{
            correctClipKey: 'lesson2.feedback.correct',
            enabled: profile.voiceEnabled,
            lessonId: LESSON_2_ID,
            playToken: feedbackVoiceToken || null,
            themePreference: profile.themePreference,
            tryAgainClipKey: 'lesson2.feedback.tryAgain',
          }}
          message={
            isCorrect
              ? mode === 'normal'
                ? `Exactly, ${princessName}! **3 × 2 × 1 = 6** ${themeText.itemNoun} ${themeText.arrangementNounPlural}.${optionalProofNudge}`
                : mode === 'restricted'
                  ? `Exactly, ${princessName}! ${themeText.firstItemLabel} cannot go first, so **2 × 2 × 1 = 4** valid ${themeText.arrangementNounPlural}.${optionalProofNudge}`
                  : `Exactly, ${princessName}! The two ${themeText.firstItemLabel} ${themeText.itemNounPlural} match, so there are **3** visible displays.${optionalProofNudge}`
              : wrongAttempts >= 2
                ? mode === 'normal'
                  ? `Not quite, ${princessName}! Think spot by spot: pick the first ${themeText.itemNoun}, then count what remains for the next spot and the last spot.`
                  : mode === 'restricted'
                    ? `Not quite, ${princessName}! Start with the banned first spot. Count which ${themeText.itemNounPlural} are still allowed there, then continue spot by spot.`
                    : `Not quite, ${princessName}! Focus on what actually looks different: moving the non-matching ${themeText.itemNoun} changes the display, but swapping matching ${themeText.itemNounPlural} does not.`
                : `Try again, ${princessName}!`
          }
          solution={isCorrect ? solutionMessage : undefined}
        />
      )}

      {submitted && isCorrect === false && canShowSolution && !answerMatchesTarget && (
        <FeedbackBanner variant="info" message={solutionMessage} />
      )}
    </div>
  )
}

interface VisualizationSectionProps extends Lesson2SectionProps {
  sectionNumber: 1 | 3 | 4
  currentScreen: number
  nextScreen: number
}

function isFinalChallengePage(
  page: Lesson2FinalPage,
): page is Extract<Lesson2FinalPage, { type: 'challenge' }> {
  return page.type === 'challenge'
}

function isClickthroughChallengePage(
  page: Lesson2ClickthroughPage,
): page is Extract<Lesson2ClickthroughPage, { type: 'challenge' }> {
  return page.type === 'challenge'
}

function Lesson2VisualizationSection({
  princessName,
  sectionNumber,
  currentScreen,
  nextScreen,
}: VisualizationSectionProps) {
  const { profile, updateScreen } = useLesson()
  const { themeText, visualTheme } = useLesson2Theme()
  const section = lesson2VisualizationSections(themeText)[sectionNumber]
  const [sectionState, setSectionState] = useSectionState(`lesson-2-section-${currentScreen}`, {
    challengeSolved: false,
  })
  const challengeSolved = sectionState.challengeSolved
  const backScreen = currentScreen === 1 ? 0 : currentScreen - 1
  const introVoiceClipKey =
    sectionNumber === 1
      ? 'lesson2.screen1.arrangementsIntro'
      : sectionNumber === 3
        ? 'lesson2.screen2.restrictionIntro'
        : null
  const visualization = (() => {
    const handleSolved = () => {
      if (!challengeSolved) setSectionState({ challengeSolved: true })
    }

    if (section.visualization === 'marble-permutations') {
      return (
        <MarblePermutationVisualization
          princessName={princessName}
          mode="normal"
          themeText={themeText}
          visualTheme={visualTheme}
          onSolved={handleSolved}
        />
      )
    }
    if (section.visualization === 'restricted-jewel-permutations') {
      return (
        <MarblePermutationVisualization
          princessName={princessName}
          mode="restricted"
          themeText={themeText}
          visualTheme={visualTheme}
          onSolved={handleSolved}
        />
      )
    }
    if (section.visualization === 'identical-jewel-permutations') {
      return (
        <MarblePermutationVisualization
          princessName={princessName}
          mode="identical"
          themeText={themeText}
          visualTheme={visualTheme}
          onSolved={handleSolved}
        />
      )
    }
  })()

  return (
    <section className="lesson-screen lesson-screen--themed" style={visualTheme.screenStyle}>
      <ScreenBackButton
        label={currentScreen === 1 ? '← Back to Academy' : '← Back'}
        onClick={() => void updateScreen(backScreen)}
      />
      <h1>{section.heading}</h1>
      <LessonText text={section.body(princessName)} />
      {currentScreen === 1 && (
        <p className="endurance-tip">
          Endurance boost: try different display orders before answering. New orders you find can add Endurance points.
        </p>
      )}
      {introVoiceClipKey && (
        <VoiceButton
          autoPlay={!challengeSolved}
          enabled={profile.voiceEnabled}
          lessonId={LESSON_2_ID}
          clipKey={introVoiceClipKey}
          themePreference={profile.themePreference}
          label={sectionNumber === 1 ? 'Listen to arrangements' : 'Listen to the restriction'}
        />
      )}
      {visualization}
      <LessonButton
        label={section.nextLabel}
        onClick={() => void updateScreen(nextScreen)}
        disabled={!challengeSolved}
      />
    </section>
  )
}

export function Lesson2VisualizationOne({ princessName }: Lesson2SectionProps) {
  return (
    <Lesson2VisualizationSection
      princessName={princessName}
      sectionNumber={1}
      currentScreen={1}
      nextScreen={2}
    />
  )
}

export function Lesson2Clickthrough() {
  const { profile, recordStudentMemoryEvent, updateScreen } = useLesson()
  const { themeText, visualTheme } = useLesson2Theme()
  const miniLesson = lesson2Clickthrough(themeText)
  const [miniLessonState, setMiniLessonState] = useSectionState(
    'lesson-2-factorials-clickthrough',
    createMiniLessonProgressState(),
  )
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const pageIndex = clampPageIndex(miniLessonState.pageIndex, miniLesson.pages.length)
  const currentPage = miniLesson.pages[pageIndex]
  const challengeState = isClickthroughChallengePage(currentPage)
    ? getSavedChallengeState(miniLessonState, currentPage.id)
    : createChallengeUiState()
  const { answerInput, attemptedAnswers, submitted, isCorrect, wrongAttempts } = challengeState
  const submittedAnswer = attemptedAnswers[attemptedAnswers.length - 1] ?? answerInput
  const feedbackSubmissionKey = [
    attemptedAnswers.join(','),
    wrongAttempts,
    String(isCorrect),
  ].join('|')

  function saveChallengeState(
    page: Extract<Lesson2ClickthroughPage, { type: 'challenge' }>,
    nextChallengeState: ChallengeUiState,
  ) {
    setMiniLessonState({
      challengeStates: {
        ...miniLessonState.challengeStates,
        [page.id]: nextChallengeState,
      },
    })
  }

  function handleSubmit(page: Extract<Lesson2ClickthroughPage, { type: 'challenge' }>) {
    const normalizedAnswer = answerInput.trim()
    const correct = Number(answerInput) === page.answer
    const nextChallengeState = recordChallengeAttempt(challengeState, normalizedAnswer, correct, !correct)
    saveChallengeState(page, nextChallengeState)
    void recordStudentMemoryEvent({
      type: 'challengeAttempt',
      lessonId: LESSON_2_ID,
      conceptKey: `lesson-2-${page.id}`,
      label: 'Factorial shortcuts',
      outcome: correct ? 'correct' : 'incorrect',
      learnerAnswer: normalizedAnswer,
      correctAnswer: String(page.answer),
    }).catch(() => undefined)
    setFeedbackVoiceToken((token) => token + 1)
  }

  function handlePageChange(nextPageIndex: number) {
    setMiniLessonState({ pageIndex: nextPageIndex })
  }

  return (
    <section className="lesson-screen lesson-screen--themed" style={visualTheme.screenStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{miniLesson.title}</h1>
      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={handlePageChange}
        onComplete={() => void updateScreen(3)}
        nextLabel="Next"
        completeLabel="Continue"
        navClassName="anchor-lesson__nav"
        showDots
        showNext={(page) => !isClickthroughChallengePage(page) || isCorrect === true}
        renderPage={(page) => {
          if (isClickthroughChallengePage(page)) {
            const conceptKey = `lesson-2-${page.id}`
            const canShowSolution = canRevealSolution({
              memory: profile.studentMemory,
              conceptKey,
              wrongAttempts,
            })
            return (
              <div className="lesson-summary__practice">
                <ChallengeQuestion
                  prompt={page.prompt}
                  value={answerInput}
                  onChange={(value) => saveChallengeState(page, { ...challengeState, answerInput: value })}
                  onSubmit={() => handleSubmit(page)}
                  attemptedAnswers={attemptedAnswers}
                  submitted={submitted}
                  allowRetry={submitted && isCorrect === false}
                />
                <HintButton
                  lessonId={LESSON_2_ID}
                  conceptKey={conceptKey}
                  conceptLabel="Factorial shortcuts"
                  prompt={page.prompt}
                  context={page.body ?? 'The learner is using spot-by-spot counting to reason about arrangements.'}
                  fallbackHint={page.feedback?.tryAgain ?? 'Count the first spot, then count what remains for each next spot.'}
                  blockedAnswerTerms={[String(page.answer)]}
                  learnerAnswer={answerInput}
                  attemptedAnswers={attemptedAnswers}
                  wrongAttempts={wrongAttempts}
                  disabled={!submitted || isCorrect === true}
                />
                {page.body && <LessonText text={page.body} className="anchor-lesson__text" />}
                {submitted && isCorrect !== null && (
                  <FeedbackBanner
                    variant={isCorrect ? 'success' : 'error'}
                    submissionKey={feedbackSubmissionKey}
                    aiFeedback={{
                      lessonId: LESSON_2_ID,
                      conceptKey,
                      conceptLabel: 'Factorial shortcuts',
                      problem: page.prompt,
                      learnerAnswer: submittedAnswer,
                      correctAnswer: String(page.answer),
                      attemptedAnswers,
                      context: page.body ?? 'The learner is using spot-by-spot counting to reason about arrangements.',
                    }}
                    voiceCue={{
                      correctClipKey: 'lesson2.feedback.correct',
                      enabled: profile.voiceEnabled,
                      lessonId: LESSON_2_ID,
                      playToken: feedbackVoiceToken || null,
                      themePreference: profile.themePreference,
                      tryAgainClipKey: 'lesson2.feedback.tryAgain',
                    }}
                    message={
                      isCorrect
                        ? page.feedback?.correct ?? ''
                        : wrongAttempts >= 2
                          ? page.feedback?.incorrect ?? ''
                          : page.feedback?.tryAgain ?? page.feedback?.incorrect ?? ''
                    }
                    solution={isCorrect ? page.feedback?.solution : undefined}
                  />
                )}
                {isCorrect === false && canShowSolution && page.feedback?.solution && (
                  <FeedbackBanner variant="info" message={page.feedback.solution} />
                )}
              </div>
            )
          }

          return (
            <LessonText
              key={page.id}
              text={page.body}
              className="anchor-lesson__text anchor-lesson__text--enter"
            />
          )
        }}
      />
    </section>
  )
}

export function Lesson2VisualizationTwo({ princessName }: Lesson2SectionProps) {
  return (
    <Lesson2VisualizationSection
      princessName={princessName}
      sectionNumber={3}
      currentScreen={3}
      nextScreen={4}
    />
  )
}

export function Lesson2VisualizationThree({ princessName }: Lesson2SectionProps) {
  return (
    <Lesson2VisualizationSection
      princessName={princessName}
      sectionNumber={4}
      currentScreen={4}
      nextScreen={5}
    />
  )
}

export function Lesson2FinalClickthrough() {
  const { profile, recordStudentMemoryEvent, updateLesson, updateScreen } = useLesson()
  const activeLesson = getProfileLessonProgress(profile, LESSON_2_ID)
  const { themeText, visualTheme } = useLesson2Theme()
  const baseMiniLesson = lesson2FinalClickthrough(themeText)
  const miniLesson = {
    ...baseMiniLesson,
    pages: [
      ...baseMiniLesson.pages.map((page) =>
        page.id === 'lesson-2-final-question' ? { ...page, nextLabel: 'Practice' } : page,
      ),
      {
        id: LESSON_2_RETRIEVAL_PRACTICE_PAGE_ID,
        type: 'explanation' as const,
        body: '',
      },
    ],
  }
  const [miniLessonState, setMiniLessonState] = useSectionState(
    'lesson-2-final-clickthrough',
    createMiniLessonProgressState(),
  )
  const finishInFlightRef = useRef(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const pageIndex = clampPageIndex(miniLessonState.pageIndex, miniLesson.pages.length)
  const currentPage = miniLesson.pages[pageIndex]
  const challengeState = isFinalChallengePage(currentPage)
    ? getSavedChallengeState(miniLessonState, currentPage.id)
    : createChallengeUiState()
  const { answerInput, attemptedAnswers, submitted, isCorrect, wrongAttempts } = challengeState
  const submittedAnswer = attemptedAnswers[attemptedAnswers.length - 1] ?? answerInput
  const feedbackSubmissionKey = [
    attemptedAnswers.join(','),
    wrongAttempts,
    String(isCorrect),
  ].join('|')

  function saveChallengeState(
    page: Extract<Lesson2FinalPage, { type: 'challenge' }>,
    nextChallengeState: ChallengeUiState,
  ) {
    setMiniLessonState({
      challengeStates: {
        ...miniLessonState.challengeStates,
        [page.id]: nextChallengeState,
      },
    })
  }

  function handleSubmit(page: Extract<Lesson2FinalPage, { type: 'challenge' }>) {
    const normalizedAnswer = answerInput.trim()
    const correct = Number(answerInput) === page.answer
    const nextChallengeState = recordChallengeAttempt(challengeState, normalizedAnswer, correct, !correct)
    saveChallengeState(page, nextChallengeState)
    void recordStudentMemoryEvent({
      type: 'challengeAttempt',
      lessonId: LESSON_2_ID,
      conceptKey: `lesson-2-${page.id}`,
      label: 'Arrangement transfer',
      outcome: correct ? 'correct' : 'incorrect',
      learnerAnswer: normalizedAnswer,
      correctAnswer: String(page.answer),
    }).catch(() => undefined)
    setFeedbackVoiceToken((token) => token + 1)
  }

  async function handleFinish() {
    if (finishInFlightRef.current) return
    finishInFlightRef.current = true
    setIsFinishing(true)
    try {
      if (activeLesson.completed) {
        await updateScreen(0)
        return
      }
      playCompletionTada()
      await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
    } catch (error) {
      finishInFlightRef.current = false
      setIsFinishing(false)
      throw error
    }
  }

  return (
    <section className="lesson-screen lesson-screen--themed" style={visualTheme.screenStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(4)} />
      <h1>{miniLesson.title}</h1>
      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={(nextPageIndex) => setMiniLessonState({ pageIndex: nextPageIndex })}
        onComplete={handleFinish}
        nextLabel="Next"
        completeLabel={activeLesson.completed ? 'Return to Academy' : 'Finish Lesson'}
        navClassName="anchor-lesson__nav"
        showDots
        showNext={(page) => {
          if (page.id === LESSON_2_RETRIEVAL_PRACTICE_PAGE_ID) {
            return miniLessonState.retrievalPracticeSolved === true
          }
          return activeLesson.completed || !isFinalChallengePage(page) || (isCorrect === true && !isFinishing)
        }}
        renderPage={(page) => {
          if (page.id === LESSON_2_RETRIEVAL_PRACTICE_PAGE_ID) {
            return (
              <RetrievalPracticeSet
                initiallySolved={miniLessonState.retrievalPracticeSolved === true}
                onSolvedChange={(solved) => {
                  if (solved && miniLessonState.retrievalPracticeSolved !== true) {
                    setMiniLessonState({ retrievalPracticeSolved: true })
                  }
                }}
                problems={LESSON_2_RETRIEVAL_PRACTICE_PROBLEMS}
              />
            )
          }

          if (isFinalChallengePage(page)) {
            const conceptKey = `lesson-2-${page.id}`
            const canShowSolution = canRevealSolution({
              memory: profile.studentMemory,
              conceptKey,
              wrongAttempts,
            })
            return (
              <div className="lesson-summary__practice">
                <ChallengeQuestion
                  prompt={page.prompt}
                  value={answerInput}
                  onChange={(value) => saveChallengeState(page, { ...challengeState, answerInput: value })}
                  onSubmit={() => handleSubmit(page)}
                  attemptedAnswers={attemptedAnswers}
                  submitted={submitted}
                  allowRetry={submitted && isCorrect === false}
                />
                <HintButton
                  lessonId={LESSON_2_ID}
                  conceptKey={conceptKey}
                  conceptLabel="Arrangement transfer"
                  prompt={page.prompt}
                  context="The learner is transferring ordered arrangement reasoning to a final check."
                  fallbackHint={page.feedback?.tryAgain ?? 'Think about each spot separately, then combine the choices.'}
                  blockedAnswerTerms={[String(page.answer)]}
                  learnerAnswer={answerInput}
                  attemptedAnswers={attemptedAnswers}
                  wrongAttempts={wrongAttempts}
                  disabled={!submitted || isCorrect === true}
                />
                {submitted && isCorrect !== null && (
                  <FeedbackBanner
                    variant={isCorrect ? 'success' : 'error'}
                    submissionKey={feedbackSubmissionKey}
                    aiFeedback={{
                      lessonId: LESSON_2_ID,
                      conceptKey,
                      conceptLabel: 'Arrangement transfer',
                      problem: page.prompt,
                      learnerAnswer: submittedAnswer,
                      correctAnswer: String(page.answer),
                      attemptedAnswers,
                      context: 'The learner is transferring ordered arrangement reasoning to a final check.',
                    }}
                    voiceCue={{
                      correctClipKey: 'lesson2.feedback.correct',
                      enabled: profile.voiceEnabled,
                      lessonId: LESSON_2_ID,
                      playToken: feedbackVoiceToken || null,
                      themePreference: profile.themePreference,
                      tryAgainClipKey: 'lesson2.feedback.tryAgain',
                    }}
                    message={
                      isCorrect
                        ? page.feedback?.correct ?? ''
                        : wrongAttempts >= 2
                          ? page.feedback?.incorrect ?? ''
                          : page.feedback?.tryAgain ?? page.feedback?.incorrect ?? ''
                    }
                    solution={isCorrect ? page.feedback?.solution : undefined}
                  />
                )}
                {isCorrect === false && canShowSolution && page.feedback?.solution && (
                  <FeedbackBanner variant="info" message={page.feedback.solution} />
                )}
                {isCorrect && (
                  <FeedbackBanner variant="info" message={page.successMessage} />
                )}
              </div>
            )
          }

          return (
            <LessonText
              key={page.id}
              text={page.body}
              className="anchor-lesson__text anchor-lesson__text--enter"
            />
          )
        }}
      />
    </section>
  )
}
