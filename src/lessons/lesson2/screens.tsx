import { useState, type CSSProperties } from 'react'
import '../../screens/screens.css'
import { ChallengeQuestion } from '../../components/ChallengeQuestion'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { DefaultInteractiveVisualization } from '../../components/DefaultInteractiveVisualization'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
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

interface Lesson2SectionProps {
  princessName: string
}

type JewelMode = 'normal' | 'restricted' | 'identical'
type StableJewelValue = 'ruby' | 'sapphire' | 'gold'
type JewelLabelKey = 'firstItemLabel' | 'secondItemLabel' | 'thirdItemLabel'

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
    borderColor: motif.border ?? 'rgb(255 255 255 / 0.8)',
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
      boxShadow: `0 0 0 3px ${motif.secondary}`,
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
  const [state, setState] = useSectionState(`lesson-2-${mode}`, {
    placedMarbles: [] as string[],
    uniqueOrders: [] as FoundJewelOrder[],
    answerInput: '',
    submitted: false,
    isCorrect: null as boolean | null,
    wrongAttempts: 0,
  })
  const { profile } = useLesson()
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const { placedMarbles, uniqueOrders, answerInput, submitted, isCorrect, wrongAttempts } = state
  const jewels: readonly Jewel[] = mode === 'identical' ? IDENTICAL_FIRST_TOKENS : DISPLAY_TOKENS
  const targetAnswer = mode === 'normal' ? 6 : mode === 'restricted' ? 4 : 3
  const validOrdersFound = uniqueOrders.filter((order) => order.valid).length
  const answerMatchesTarget = Number(answerInput) === targetAnswer
  const visualSolved = validOrdersFound >= targetAnswer
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

  function placeMarble(marbleId: string) {
    if (placedMarbles.includes(marbleId) || placedMarbles.length >= jewels.length) return
    const next = [...placedMarbles, marbleId]
    let nextOrders = uniqueOrders
    if (next.length === jewels.length) {
      const values = next.map((id) => getMarble(id)?.value ?? id)
      const key = values.join('-')
      const valid = mode !== 'restricted' || values[0] !== 'ruby'
      nextOrders = uniqueOrders.some((order) => order.key === key)
        ? uniqueOrders
        : [...uniqueOrders, { key, order: next, valid }]
    }
    setState({ placedMarbles: next, uniqueOrders: nextOrders })
  }

  function resetMarbles() {
    setState({ placedMarbles: [] })
  }

  function handleSubmit() {
    const correct = answerMatchesTarget && visualSolved
    const nextWrongAttempts = answerMatchesTarget ? wrongAttempts : wrongAttempts + 1
    if (correct) onSolved()
    setState({ submitted: true, isCorrect: correct, wrongAttempts: nextWrongAttempts })
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
          {counterLabel}: <strong>{validOrdersFound}</strong>
        </p>
      </div>

      <ChallengeQuestion
        key={`${mode}-${visualSolved ? 'visual-complete' : 'visual-incomplete'}`}
        prompt={prompt}
        value={answerInput}
        onChange={(value) => setState({ answerInput: value })}
        onSubmit={handleSubmit}
        submitted={submitted}
        allowRetry={submitted && isCorrect === false}
      />

      {submitted && isCorrect !== null && (
        <FeedbackBanner
          variant={isCorrect ? 'success' : 'error'}
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
                ? `Exactly, ${princessName}! **3 × 2 × 1 = 6** ${themeText.itemNoun} ${themeText.arrangementNounPlural}.`
                : mode === 'restricted'
                  ? `Exactly, ${princessName}! ${themeText.firstItemLabel} cannot go first, so **2 × 2 × 1 = 4** valid ${themeText.arrangementNounPlural}.`
                  : `Exactly, ${princessName}! The two ${themeText.firstItemLabel} ${themeText.itemNounPlural} match, so there are **3** visible displays.`
              : answerMatchesTarget && !visualSolved
                ? `Your answer is right, ${princessName}! To unlock Continue, click through and build all the valid ${themeText.arrangementNounPlural} in the visual proof above, then submit again.`
                : answerMatchesTarget && visualSolved
                  ? `Great visual proof, ${princessName}! Submit the same answer again to unlock Continue.`
              : wrongAttempts >= 2
                ? mode === 'normal'
                  ? `Not quite, ${princessName}! Think spot by spot: pick the first ${themeText.itemNoun}, then count what remains for the next spot and the last spot.`
                  : mode === 'restricted'
                    ? `Not quite, ${princessName}! Start with the banned first spot. Count which ${themeText.itemNounPlural} are still allowed there, then continue spot by spot.`
                    : `Not quite, ${princessName}! Focus on what actually looks different: moving the non-matching ${themeText.itemNoun} changes the display, but swapping matching ${themeText.itemNounPlural} does not.`
                : `Try again, ${princessName}!`
          }
        />
      )}

      {submitted && isCorrect === false && wrongAttempts >= 3 && !answerMatchesTarget && (
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
    if (section.visualization === 'marble-permutations') {
      return (
        <MarblePermutationVisualization
          princessName={princessName}
          mode="normal"
          themeText={themeText}
          visualTheme={visualTheme}
          onSolved={() => setSectionState({ challengeSolved: true })}
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
          onSolved={() => setSectionState({ challengeSolved: true })}
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
          onSolved={() => setSectionState({ challengeSolved: true })}
        />
      )
    }
    return <DefaultInteractiveVisualization />
  })()

  return (
    <section className="lesson-screen lesson-screen--themed lesson-2" style={visualTheme.screenStyle}>
      <ScreenBackButton
        label={currentScreen === 1 ? '← Back to Academy' : '← Back'}
        onClick={() => void updateScreen(backScreen)}
      />
      <h1>{section.heading}</h1>
      <LessonText text={section.body(princessName)} />
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
  const { profile, updateScreen } = useLesson()
  const { themeText, visualTheme } = useLesson2Theme()
  const miniLesson = lesson2Clickthrough(themeText)
  const [state, setState] = useSectionState('lesson-2-factorials', {
    pageIndex: 0,
    answerInput: '',
    submitted: false,
    isCorrect: null as boolean | null,
    wrongAttempts: 0,
  })
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const { pageIndex, answerInput, submitted, isCorrect, wrongAttempts } = state

  function handleSubmit(page: Extract<Lesson2ClickthroughPage, { type: 'challenge' }>) {
    const correct = Number(answerInput) === page.answer
    setState({
      submitted: true,
      isCorrect: correct,
      wrongAttempts: correct ? wrongAttempts : wrongAttempts + 1,
    })
    setFeedbackVoiceToken((token) => token + 1)
  }

  function handlePageChange(nextPageIndex: number) {
    setState({
      pageIndex: nextPageIndex,
      answerInput: '',
      submitted: false,
      isCorrect: null,
      wrongAttempts: 0,
    })
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-2" style={visualTheme.screenStyle}>
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
            return (
              <div className="lesson-summary__practice">
                <ChallengeQuestion
                  prompt={page.prompt}
                  value={answerInput}
                  onChange={(value) => setState({ answerInput: value })}
                  onSubmit={() => handleSubmit(page)}
                  submitted={submitted}
                  allowRetry={submitted && isCorrect === false}
                />
                {page.body && <LessonText text={page.body} />}
                {submitted && isCorrect !== null && (
                  <FeedbackBanner
                    variant={isCorrect ? 'success' : 'error'}
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
                  />
                )}
                {isCorrect === false && wrongAttempts >= 3 && page.feedback?.solution && (
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
  const { profile, updateLesson, updateScreen } = useLesson()
  const { themeText, visualTheme } = useLesson2Theme()
  const miniLesson = lesson2FinalClickthrough(themeText)
  const [state, setState] = useSectionState('lesson-2-final-check', {
    pageIndex: 0,
    answerInput: '',
    submitted: false,
    isCorrect: null as boolean | null,
    wrongAttempts: 0,
  })
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const { pageIndex, answerInput, submitted, isCorrect, wrongAttempts } = state

  function handleSubmit(page: Extract<Lesson2FinalPage, { type: 'challenge' }>) {
    const correct = Number(answerInput) === page.answer
    setState({
      submitted: true,
      isCorrect: correct,
      wrongAttempts: correct ? wrongAttempts : wrongAttempts + 1,
    })
    setFeedbackVoiceToken((token) => token + 1)
  }

  async function handleFinish() {
    playCompletionTada()
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-2" style={visualTheme.screenStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(4)} />
      <h1>{miniLesson.title}</h1>
      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={(nextPageIndex) => setState({ pageIndex: nextPageIndex })}
        onComplete={handleFinish}
        nextLabel="Next"
        completeLabel="Finish Lesson"
        navClassName="anchor-lesson__nav"
        showDots
        showNext={(page) => !isFinalChallengePage(page) || isCorrect === true}
        renderPage={(page) => {
          if (isFinalChallengePage(page)) {
            return (
              <div className="lesson-summary__practice">
                <ChallengeQuestion
                  prompt={page.prompt}
                  value={answerInput}
                  onChange={(value) => setState({ answerInput: value })}
                  onSubmit={() => handleSubmit(page)}
                  submitted={submitted}
                  allowRetry={submitted && isCorrect === false}
                />
                {submitted && isCorrect !== null && (
                  <FeedbackBanner
                    variant={isCorrect ? 'success' : 'error'}
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
                  />
                )}
                {isCorrect === false && wrongAttempts >= 3 && page.feedback?.solution && (
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
