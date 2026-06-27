import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import '../../screens/screens.css'
import { ChallengeQuestion } from '../../components/ChallengeQuestion'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
import { ScreenBackButton } from '../../components/ScreenBackButton'
import { VoiceButton } from '../../components/VoiceButton'
import { useLesson } from '../../hooks/useLesson'
import { useSectionState } from '../../hooks/useSectionState'
import { LESSON_5_ID } from '../../types/lesson'
import {
  getLesson1ThemeVisual,
  lesson1ThemeStyle,
  resolveLesson1Theme,
} from '../../themes/themeResolver'
import type { Lesson1ThemePack } from '../../themes/themeTypes'
import { playCompletionTada } from '../../utils/completionSound'
import { iconForThemeLabel } from '../../utils/themeEmoji'
import {
  builderStartingSpaces,
  challenge1,
  challenge3,
  challenge4,
  lesson5Sections,
  royalReviewMiniLesson,
  sampleSpaceMiniLesson,
  sixSpaceFairSpinnerSpaces,
  spinnerInspectorSpaces,
  unfairSpinnerSpaces,
  type Lesson5ChallengePage,
  type Lesson5MiniLessonPage,
  type Lesson5OutcomeKind,
  type Lesson5Player,
  type Lesson5SpinnerSpace,
} from './copy'

interface Lesson5SectionProps {
  princessName: string
}

const OUTCOME_SYMBOLS: Record<Lesson5OutcomeKind, string> = {
  crown: '👑',
  dragon: '🐉',
  jewel: '💎',
  star: '⭐',
  shield: '🛡️',
}

const KIND_LABELS: Record<Lesson5OutcomeKind, string> = {
  crown: 'Crown',
  dragon: 'Dragon',
  jewel: 'Jewel',
  star: 'Star',
  shield: 'Shield',
}

const WINNER_BY_KIND: Record<Lesson5OutcomeKind, Lesson5Player> = {
  crown: 'princess',
  dragon: 'dragon',
  jewel: 'none',
  star: 'princess',
  shield: 'knight',
}

const OUTCOME_COLORS: Record<Lesson5OutcomeKind, string> = {
  crown: '#fef3c7',
  dragon: '#dcfce7',
  jewel: '#dbeafe',
  star: '#fef9c3',
  shield: '#ede9fe',
}

interface OutcomeDisplay {
  label: string
  icon: string
}

type OutcomeDisplayMap = Record<Lesson5OutcomeKind, OutcomeDisplay>

const DEFAULT_OUTCOME_DISPLAY: OutcomeDisplayMap = {
  crown: { label: KIND_LABELS.crown, icon: OUTCOME_SYMBOLS.crown },
  dragon: { label: KIND_LABELS.dragon, icon: OUTCOME_SYMBOLS.dragon },
  jewel: { label: KIND_LABELS.jewel, icon: OUTCOME_SYMBOLS.jewel },
  star: { label: KIND_LABELS.star, icon: OUTCOME_SYMBOLS.star },
  shield: { label: KIND_LABELS.shield, icon: OUTCOME_SYMBOLS.shield },
}

interface OutcomeVisual {
  background: string
  border: string
  text: string
}

type OutcomeVisualMap = Record<Lesson5OutcomeKind, OutcomeVisual>

interface Lesson5ThemeCopy {
  activityName: string
  activityNoun: string
  activityTitleNoun: string
  themeAdjective: string
  themeAdjectiveLower: string
  heroPlayer: string
  heroPlayerLower: string
  reviewTitle: string
  sampleHeading: string
  fixHeading: string
  hubIcon: string
}

interface Lesson5ThemeBridge {
  display: OutcomeDisplayMap
  outcomeVisuals: OutcomeVisualMap
  screenStyle: CSSProperties
  spinnerStyle: CSSProperties
  pointerStyle: CSSProperties
  hubStyle: CSSProperties
  selectedColor: string
  fairResultStyle: CSSProperties
  unfairResultStyle: CSSProperties
  matchOutcomeStyle: CSSProperties
  copy: Lesson5ThemeCopy
}

const MOTIF_SYMBOLS = {
  heart: '♥',
  circle: '●',
  square: '■',
  star: '★',
  diamond: '◆',
  triangle: '▲',
  paw: '●',
} as const

function createOutcomeDisplay(label: string | undefined, fallbackLabel: string, fallbackIcon: string): OutcomeDisplay {
  const resolvedLabel = label ?? fallbackLabel
  return {
    label: resolvedLabel,
    icon: iconForThemeLabel(resolvedLabel, fallbackIcon),
  }
}

function createLesson5OutcomeDisplayMap(activeTheme: Lesson1ThemePack): OutcomeDisplayMap {
  const themeName = activeTheme.themeName.toLowerCase()
  const [topCategory, middleCategory, bottomCategory] = activeTheme.categories

  if (themeName.includes('royal')) {
    return DEFAULT_OUTCOME_DISPLAY
  }

  if (activeTheme.visual?.character === 'astronaut' || themeName.includes('space')) {
    const planetLabel = topCategory?.items[0] ?? 'Planet'
    const cometLabel = middleCategory?.items[2] ?? middleCategory?.items[1] ?? 'Comet'
    const satelliteLabel = topCategory?.items[1] ?? 'Satellite'
    const moonLabel = bottomCategory?.items[0] ?? 'Moon'
    const rocketLabel = bottomCategory?.items[1] ?? 'Rocket'
    return {
      crown: createOutcomeDisplay(planetLabel, 'Planet', '🪐'),
      dragon: createOutcomeDisplay(cometLabel, 'Comet', '☄️'),
      jewel: createOutcomeDisplay(satelliteLabel, 'Satellite', '🛰️'),
      star: createOutcomeDisplay(moonLabel, 'Moon', '🌙'),
      shield: createOutcomeDisplay(rocketLabel, 'Rocket', '🚀'),
    }
  }

  if (themeName.includes('dinosaur')) {
    const dinoLabel = topCategory?.items[0] ?? 'Dino'
    const raptorLabel = middleCategory?.items[2] ?? middleCategory?.items[1] ?? 'Raptor'
    const fossilLabel = topCategory?.items[1] ?? 'Fossil'
    const volcanoLabel = bottomCategory?.items[0] ?? 'Volcano'
    const eggLabel = bottomCategory?.items[1] ?? 'Egg'
    return {
      crown: createOutcomeDisplay(dinoLabel, 'Dino', '🦕'),
      dragon: createOutcomeDisplay(raptorLabel, 'Raptor', '🦖'),
      jewel: createOutcomeDisplay(fossilLabel, 'Fossil', '🦴'),
      star: createOutcomeDisplay(volcanoLabel, 'Volcano', '🌋'),
      shield: createOutcomeDisplay(eggLabel, 'Egg', '🥚'),
    }
  }

  if (themeName.includes('animal')) {
    const pawLabel = topCategory?.items[0] ?? 'Paw'
    const tigerLabel = middleCategory?.items[2] ?? 'Tiger'
    const foxLabel = middleCategory?.items[0] ?? topCategory?.items[1] ?? 'Fox'
    const pandaLabel = middleCategory?.items[1] ?? 'Panda'
    const fieldLabel = bottomCategory?.items[0] ?? 'Field Shoes'
    return {
      crown: createOutcomeDisplay(pawLabel, 'Paw', '🐾'),
      dragon: createOutcomeDisplay(tigerLabel, 'Tiger', '🐯'),
      jewel: createOutcomeDisplay(foxLabel, 'Fox', '🦊'),
      star: createOutcomeDisplay(pandaLabel, 'Panda', '🐼'),
      shield: createOutcomeDisplay(fieldLabel, 'Field Shoes', '👟'),
    }
  }

  if (themeName.includes('sport')) {
    const medalLabel = topCategory?.items[0] ?? 'Medal'
    const footballLabel = middleCategory?.items[2] ?? middleCategory?.items[1] ?? 'Football'
    const soccerLabel = topCategory?.items[1] ?? 'Soccer'
    const basketballLabel = middleCategory?.items[0] ?? 'Basketball'
    const trophyLabel = bottomCategory?.items[0] ?? 'Trophy'
    return {
      crown: createOutcomeDisplay(medalLabel, 'Medal', '🏅'),
      dragon: createOutcomeDisplay(footballLabel, 'Football', '🏈'),
      jewel: createOutcomeDisplay(soccerLabel, 'Soccer', '⚽'),
      star: createOutcomeDisplay(basketballLabel, 'Basketball', '🏀'),
      shield: createOutcomeDisplay(trophyLabel, 'Trophy', '🏆'),
    }
  }

  if (themeName.includes('surprise') || themeName.includes('studio')) {
    const sparkLabel = topCategory?.items[0] ?? 'Spark'
    const cometLabel = middleCategory?.items[2] ?? middleCategory?.items[1] ?? 'Comet'
    const glowLabel = topCategory?.items[1] ?? 'Glow'
    const bounceLabel = bottomCategory?.items[0] ?? 'Bounce'
    const glideLabel = bottomCategory?.items[1] ?? 'Glide'
    return {
      crown: createOutcomeDisplay(sparkLabel, 'Spark', '✨'),
      dragon: createOutcomeDisplay(cometLabel, 'Comet', '☄️'),
      jewel: createOutcomeDisplay(glowLabel, 'Glow', '💡'),
      star: createOutcomeDisplay(bounceLabel, 'Bounce', '🟡'),
      shield: createOutcomeDisplay(glideLabel, 'Glide', '💫'),
    }
  }

  return {
    crown: createOutcomeDisplay(topCategory?.items[0], 'First Symbol', OUTCOME_SYMBOLS.crown),
    dragon: createOutcomeDisplay(
      middleCategory?.items[2] ?? middleCategory?.items[1],
      'Second Symbol',
      OUTCOME_SYMBOLS.dragon,
    ),
    jewel: createOutcomeDisplay(topCategory?.items[1], 'Bonus Symbol', OUTCOME_SYMBOLS.jewel),
    star: createOutcomeDisplay(bottomCategory?.items[0], 'Third Symbol', OUTCOME_SYMBOLS.star),
    shield: createOutcomeDisplay(bottomCategory?.items[1], 'Fourth Symbol', OUTCOME_SYMBOLS.shield),
  }
}

function getThemeHeroPlayer(themeName: string): { title: string; lower: string } {
  if (themeName.includes('space')) return { title: 'Astronaut', lower: 'astronaut' }
  if (themeName.includes('dinosaur')) return { title: 'Explorer', lower: 'explorer' }
  if (themeName.includes('animal')) return { title: 'Helper', lower: 'helper' }
  if (themeName.includes('sport')) return { title: 'Home Team', lower: 'home team' }
  if (themeName.includes('surprise') || themeName.includes('studio')) return { title: 'Inventor', lower: 'inventor' }
  return { title: 'Player 1', lower: 'player 1' }
}

function createLesson5ThemeCopy(activeTheme: Lesson1ThemePack): Lesson5ThemeCopy {
  const themeName = activeTheme.themeName.toLowerCase()
  const isRoyal = themeName.includes('royal')
  const visual = getLesson1ThemeVisual(activeTheme)
  const heroPlayer = isRoyal ? { title: 'Princess', lower: 'princess' } : getThemeHeroPlayer(themeName)
  const activityName = isRoyal ? 'Royal Carnival' : `${activeTheme.themeName} Game Lab`
  const themeAdjective = isRoyal ? 'Royal' : activeTheme.themeName
  const motifShape = visual.motifShape as keyof typeof MOTIF_SYMBOLS

  return {
    activityName,
    activityNoun: isRoyal ? 'carnival' : 'game lab',
    activityTitleNoun: isRoyal ? 'Carnival' : 'Game Lab',
    themeAdjective,
    themeAdjectiveLower: isRoyal ? 'royal' : activeTheme.themeName.toLowerCase(),
    heroPlayer: heroPlayer.title,
    heroPlayerLower: heroPlayer.lower,
    reviewTitle: isRoyal ? 'Royal Review' : `${activeTheme.themeName} Review`,
    sampleHeading: isRoyal
      ? '🎪 Royal Carnival Spinner'
      : `${iconForThemeLabel(activeTheme.themeName, '🎲')} ${activeTheme.themeName} Spinner`,
    fixHeading: isRoyal ? '🎨 Fix the Carnival Game' : `🎨 Fix the ${activeTheme.themeName} Game`,
    hubIcon: MOTIF_SYMBOLS[motifShape] ?? '✦',
  }
}

function createLesson5OutcomeVisuals(activeTheme: Lesson1ThemePack): OutcomeVisualMap {
  const visual = getLesson1ThemeVisual(activeTheme)
  return {
    crown: {
      background: visual.hintBackground,
      border: visual.motifPrimary,
      text: visual.hintText,
    },
    dragon: {
      background: visual.successBackground,
      border: visual.motifSecondary,
      text: visual.successText,
    },
    jewel: {
      background: visual.panelBackground,
      border: visual.borderColor,
      text: visual.buttonText,
    },
    star: {
      background: visual.stageBackground,
      border: visual.motifPrimary,
      text: visual.buttonText,
    },
    shield: {
      background: visual.screenBackground,
      border: visual.buttonBorder,
      text: visual.buttonText,
    },
  }
}

function createLesson5ThemeBridge(activeTheme: Lesson1ThemePack): Lesson5ThemeBridge {
  const visual = getLesson1ThemeVisual(activeTheme)
  const display = createLesson5OutcomeDisplayMap(activeTheme)
  const copy = createLesson5ThemeCopy(activeTheme)
  const screenStyle = {
    ...lesson1ThemeStyle(activeTheme),
    '--color-primary': visual.accentColor,
    '--color-border': visual.borderColor,
  } as CSSProperties

  return {
    display,
    outcomeVisuals: createLesson5OutcomeVisuals(activeTheme),
    screenStyle,
    spinnerStyle: {
      borderColor: visual.accentColor,
      background: visual.panelBackground,
      boxShadow: `0 10px 24px ${visual.borderColor}`,
    },
    pointerStyle: {
      borderTopColor: visual.accentColor,
    },
    hubStyle: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      zIndex: 7,
      display: 'grid',
      placeItems: 'center',
      width: '3.2rem',
      height: '3.2rem',
      border: `4px solid ${visual.buttonBackground}`,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${visual.accentColor}, ${visual.motifSecondary})`,
      color: '#fff',
      fontWeight: 900,
      transform: 'translate(-50%, -50%)',
      boxShadow: `0 6px 16px ${visual.borderColor}`,
      pointerEvents: 'none',
    },
    selectedColor: visual.accentColor,
    fairResultStyle: {
      background: visual.successBackground,
      color: visual.successText,
    },
    unfairResultStyle: {
      background: visual.hintBackground,
      color: visual.hintText,
    },
    matchOutcomeStyle: {
      background: visual.successBackground,
      borderColor: visual.motifSecondary,
      color: visual.successText,
    },
    copy,
  }
}

function useLesson5ThemeBridge(): Lesson5ThemeBridge {
  const { profile } = useLesson()
  return useMemo(
    () => createLesson5ThemeBridge(resolveLesson1Theme(profile.themePreference, profile.themePacks)),
    [profile.themePacks, profile.themePreference],
  )
}

function isChallengePage(page: Lesson5MiniLessonPage): page is Lesson5ChallengePage {
  return page.type === 'challenge'
}

type Lesson5ExplanationPage = Extract<Lesson5MiniLessonPage, { type: 'explanation' }>

function makeSpinnerSpace(
  id: string,
  kind: Lesson5OutcomeKind,
  display: OutcomeDisplayMap = DEFAULT_OUTCOME_DISPLAY,
): Lesson5SpinnerSpace {
  return {
    id,
    kind,
    label: display[kind].label,
    winner: WINNER_BY_KIND[kind],
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function themeLesson5Text(text: string, themeBridge: Lesson5ThemeBridge): string {
  const { copy, display } = themeBridge
  const replacements: Array<[string, string]> = [
    ['Royal Carnival', copy.activityName],
    ['Royal Review', copy.reviewTitle],
    ['Royal work', 'Great work'],
    ['royal spinners', `${copy.themeAdjectiveLower} spinners`],
    ['royal spinner', `${copy.themeAdjectiveLower} spinner`],
    ['royal pictures', `${copy.themeAdjectiveLower} pictures`],
    ['royal', copy.themeAdjectiveLower],
    ['Royal', copy.themeAdjective],
    ['carnival', copy.activityNoun],
    ['Carnival', copy.activityTitleNoun],
    ['booth', copy.activityNoun === 'carnival' ? 'booth' : 'game board'],
    ['Booth', copy.activityNoun === 'carnival' ? 'Booth' : 'Game Board'],
    ['Princess', copy.heroPlayer],
    ['princess', copy.heroPlayerLower],
    ['Knight', display.shield.label],
    ['knight', display.shield.label],
    ['Crown', display.crown.label],
    ['Dragon', display.dragon.label],
    ['Jewel', display.jewel.label],
    ['Star', display.star.label],
    ['Shield', display.shield.label],
  ]

  return replacements.reduce(
    (nextText, [from, to]) => nextText.replace(new RegExp(`\\b${escapeRegExp(from)}\\b`, 'g'), to),
    text,
  )
}

function themeLesson5Challenge(
  challenge: Lesson5ChallengePage,
  themeBridge: Lesson5ThemeBridge,
): Lesson5ChallengePage {
  return {
    ...challenge,
    prompt: themeLesson5Text(challenge.prompt, themeBridge),
    body: challenge.body ? themeLesson5Text(challenge.body, themeBridge) : undefined,
    feedback: challenge.feedback && {
      correct: themeLesson5Text(challenge.feedback.correct, themeBridge),
      incorrect: themeLesson5Text(challenge.feedback.incorrect, themeBridge),
      tryAgain: challenge.feedback.tryAgain
        ? themeLesson5Text(challenge.feedback.tryAgain, themeBridge)
        : undefined,
      solution: challenge.feedback.solution
        ? themeLesson5Text(challenge.feedback.solution, themeBridge)
        : undefined,
    },
  }
}

function getOutcomeVisualStyle(
  kind: Lesson5OutcomeKind,
  themeBridge: Lesson5ThemeBridge,
  selected = false,
): CSSProperties {
  const visual = themeBridge.outcomeVisuals[kind]
  return {
    background: visual.background,
    borderColor: visual.border,
    color: visual.text,
    ...(selected
      ? {
          outline: `4px solid ${themeBridge.selectedColor}`,
          outlineOffset: '-3px',
          boxShadow: `0 0 0 4px ${themeBridge.outcomeVisuals[kind].background}`,
        }
      : {}),
  }
}

function getCarnivalSpinnerBackground(
  spaces: readonly Lesson5SpinnerSpace[],
  outcomeVisuals: OutcomeVisualMap,
): string {
  const slice = 100 / spaces.length
  return `conic-gradient(from 0deg, ${spaces
    .map((space, index) => {
      const start = index * slice
      const end = (index + 1) * slice
      const separatorStart = Math.max(start, end - 0.55)
      return `${outcomeVisuals[space.kind]?.background ?? OUTCOME_COLORS[space.kind]} ${start}% ${separatorStart}%, rgb(255 255 255 / 0.78) ${separatorStart}% ${end}%`
    })
    .join(', ')})`
}

function getRandomIndex(length: number): number {
  if (length <= 1) return 0
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1)
    globalThis.crypto.getRandomValues(values)
    return values[0] % length
  }
  return Math.floor(Math.random() * length)
}

interface CarnivalSpinnerProps {
  spaces: readonly Lesson5SpinnerSpace[]
  selectedIndexes?: readonly number[]
  onSelect?: (index: number) => void
  onSpin?: (index: number) => void
  ariaLabel: string
}

function CarnivalSpinner({
  spaces,
  selectedIndexes = [],
  onSelect,
  onSpin,
  ariaLabel,
}: CarnivalSpinnerProps) {
  const themeBridge = useLesson5ThemeBridge()
  const { display, outcomeVisuals } = themeBridge
  const interactive = Boolean(onSelect)
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0)
  const [spinTurns, setSpinTurns] = useState(0)
  const selectedIndex = internalSelectedIndex
  const slice = 360 / spaces.length
  const spinRotation = spinTurns * 360 - (selectedIndex * slice + slice / 2)

  function handleSelect(index: number) {
    setSpinTurns((turns) => turns + 1)
    setInternalSelectedIndex(index)
    onSelect?.(index)
  }

  function handleSpin() {
    const nextIndex = getRandomIndex(spaces.length)
    setSpinTurns((turns) => turns + 2 + getRandomIndex(3))
    setInternalSelectedIndex(nextIndex)
    onSpin?.(nextIndex)
  }

  return (
    <div className="lesson-5-spinner-shell">
      <div
        className={`lesson-5-spinner lesson-5-spinner--${spaces.length}`}
        role="group"
        aria-label={ariaLabel}
        style={
          {
            ...themeBridge.spinnerStyle,
            '--lesson-5-spinner-bg': getCarnivalSpinnerBackground(spaces, outcomeVisuals),
            '--lesson-5-spinner-rotation': `${spinRotation}deg`,
          } as CSSProperties
        }
      >
        <div className="lesson-5-spinner__pointer" style={themeBridge.pointerStyle} aria-hidden="true" />
        <div className="lesson-5-spinner__rotor">
          <div className="lesson-5-spinner__wheel" aria-hidden="true" />
          {spaces.map((space, index) => {
            const selected = selectedIndexes.includes(index) || selectedIndex === index
            const displaySpace = display[space.kind]
            const angle = index * slice + slice / 2
            return (
              <button
                key={space.id}
                type="button"
                className={`lesson-5-spinner__space lesson-5-spinner__space--${space.kind}${selected ? ' lesson-5-spinner__space--selected' : ''}`}
                style={
                  {
                    ...getOutcomeVisualStyle(space.kind, themeBridge, selected),
                    '--lesson-5-space-angle': `${angle}deg`,
                  } as CSSProperties
                }
                onClick={interactive ? () => handleSelect(index) : undefined}
                disabled={!interactive}
                aria-pressed={interactive ? selected : undefined}
                aria-label={`${displaySpace.label} spinner space`}
              >
                <span className="lesson-5-spinner__symbol" aria-hidden="true">
                  {displaySpace.icon}
                </span>
                <span>{displaySpace.label}</span>
              </button>
            )
          })}
        </div>
        <div className="lesson-5-spinner__hub" style={themeBridge.hubStyle} aria-hidden="true">
          {themeBridge.copy.hubIcon}
        </div>
      </div>
      <LessonButton label="Spin spinner" variant="secondary" onClick={handleSpin} />
    </div>
  )
}

interface SampleSpaceTrayProps {
  spaces: readonly Lesson5SpinnerSpace[]
  selectedIndexes?: readonly number[]
  emptyText?: string
}

function SampleSpaceTray({ spaces, selectedIndexes, emptyText }: SampleSpaceTrayProps) {
  const themeBridge = useLesson5ThemeBridge()
  const { display } = themeBridge
  const visibleIndexes = selectedIndexes ?? spaces.map((_, index) => index)

  return (
    <div className="lesson-5-tray" aria-live="polite">
      <h2>Sample space tray</h2>
      {visibleIndexes.length === 0 ? (
        <p className="lesson-5-tray__empty">
          {emptyText ?? 'Tap spinner spaces to add possible outcomes here.'}
        </p>
      ) : (
        <ol className="lesson-5-tray__cards">
          {visibleIndexes.map((spaceIndex, listIndex) => {
            const space = spaces[spaceIndex]
            const displaySpace = display[space.kind]
            return (
              <li
                key={`${space.id}-${listIndex}`}
                className={`lesson-5-tray__card lesson-5-tray__card--${space.kind}`}
                style={getOutcomeVisualStyle(space.kind, themeBridge)}
              >
                <span aria-hidden="true">{displaySpace.icon}</span>
                <span>{displaySpace.label}</span>
              </li>
            )
          })}
        </ol>
      )}
      <p className="lesson-5-tray__total">
        Total outcomes: <strong>{visibleIndexes.length}</strong>
      </p>
    </div>
  )
}

interface FairnessMeterProps {
  spaces: readonly Lesson5SpinnerSpace[]
  opponent: 'dragon' | 'knight'
  showResult?: boolean
}

function FairnessMeter({ spaces, opponent, showResult = true }: FairnessMeterProps) {
  const themeBridge = useLesson5ThemeBridge()
  const { display, outcomeVisuals } = themeBridge
  const total = spaces.length
  const princessCount = spaces.filter((space) => space.winner === 'princess').length
  const opponentCount = spaces.filter((space) => space.winner === opponent).length
  const noWinnerCount = spaces.filter((space) => space.winner === 'none').length
  const fair = princessCount === opponentCount
  const opponentKind: Lesson5OutcomeKind = opponent === 'dragon' ? 'dragon' : 'shield'
  const playerLabel = themeBridge.copy.heroPlayer
  const opponentLabel = display[opponentKind].label

  return (
    <div className="lesson-5-meter" aria-live="polite">
      <h2>Fairness meter</h2>
      <div className="lesson-5-meter__rows">
        <div className="lesson-5-meter__row">
          <span>{playerLabel}</span>
          <div className="lesson-5-meter__bar" aria-hidden="true">
            <span
              style={{
                width: `${(princessCount / total) * 100}%`,
                background: `linear-gradient(90deg, ${outcomeVisuals.crown.border}, ${outcomeVisuals.crown.background})`,
              }}
            />
          </div>
          <strong>{princessCount}/{total}</strong>
        </div>
        <div className="lesson-5-meter__row">
          <span>{opponentLabel}</span>
          <div className="lesson-5-meter__bar lesson-5-meter__bar--opponent" aria-hidden="true">
            <span
              style={{
                width: `${(opponentCount / total) * 100}%`,
                background: `linear-gradient(90deg, ${outcomeVisuals[opponentKind].border}, ${outcomeVisuals[opponentKind].background})`,
              }}
            />
          </div>
          <strong>{opponentCount}/{total}</strong>
        </div>
      </div>
      {noWinnerCount > 0 && (
        <p className="lesson-5-meter__note">
          No-winner spaces: <strong>{noWinnerCount}/{total}</strong>
        </p>
      )}
      {showResult && (
        <p
          className={`lesson-5-meter__result ${fair ? 'lesson-5-meter__result--fair' : ''}`}
          style={fair ? themeBridge.fairResultStyle : themeBridge.unfairResultStyle}
        >
          {fair
            ? `Fair: ${playerLabel} and ${opponentLabel} have the same chance.`
            : `Unfair: ${playerLabel} and ${opponentLabel} do not have the same chance.`}
        </p>
      )}
    </div>
  )
}

interface Lesson5ChallengeBlockProps {
  challenge: Lesson5ChallengePage
  onCorrect?: () => void
  children?: ReactNode
}

function Lesson5ChallengeBlock({ challenge, onCorrect, children }: Lesson5ChallengeBlockProps) {
  const { profile } = useLesson()
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const [state, setState] = useSectionState(`lesson-5-challenge-${challenge.id}`, {
    answerInput: '',
    submitted: false,
    isCorrect: null as boolean | null,
    wrongAttempts: 0,
    attemptedAnswers: [] as string[],
    repeatedAnswer: null as string | null,
  })
  const { answerInput, submitted, isCorrect, wrongAttempts, attemptedAnswers, repeatedAnswer } = state

  function handleSubmit() {
    const normalizedAnswer = answerInput.trim()
    if (attemptedAnswers.includes(normalizedAnswer)) {
      setState({ repeatedAnswer: normalizedAnswer })
      return
    }

    const correct = Number(normalizedAnswer) === challenge.answer
    setState({
      submitted: true,
      isCorrect: correct,
      wrongAttempts: correct ? wrongAttempts : wrongAttempts + 1,
      attemptedAnswers: [...attemptedAnswers, normalizedAnswer],
      repeatedAnswer: null,
    })
    setFeedbackVoiceToken((token) => token + 1)
    if (correct) onCorrect?.()
  }

  const feedback =
    isCorrect === true
      ? challenge.feedback?.correct
      : wrongAttempts >= 2
        ? challenge.feedback?.incorrect
        : challenge.feedback?.tryAgain ?? challenge.feedback?.incorrect

  return (
    <div className="lesson-summary__practice">
      {children}
      {challenge.body && <LessonText text={challenge.body} />}
      <ChallengeQuestion
        prompt={challenge.prompt}
        value={answerInput}
        onChange={(value) => setState({ answerInput: value, repeatedAnswer: null })}
        onSubmit={handleSubmit}
        submitted={submitted}
        allowRetry={submitted && isCorrect === false}
      />
      {repeatedAnswer && (
        <p className="challenge__repeat-warning" role="status">
          You already tried <strong>{repeatedAnswer}</strong>. Try a different answer!
        </p>
      )}
      {submitted && isCorrect !== null && feedback && (
        <FeedbackBanner
          variant={isCorrect ? 'success' : 'error'}
          voiceCue={{
            correctClipKey: 'lesson5.feedback.correct',
            enabled: profile.voiceEnabled,
            lessonId: LESSON_5_ID,
            playToken: feedbackVoiceToken || null,
            themePreference: profile.themePreference,
            tryAgainClipKey: 'lesson5.feedback.tryAgain',
          }}
          message={feedback}
        />
      )}
      {isCorrect === false && wrongAttempts >= 3 && challenge.feedback?.solution && (
        <FeedbackBanner variant="info" message={challenge.feedback.solution} />
      )}
    </div>
  )
}

function MiniLessonPageContent({ page }: { page: Lesson5ExplanationPage }) {
  const themeBridge = useLesson5ThemeBridge()
  return (
    <div className="lesson-5-mini-page">
      {page.title && <h2>{themeLesson5Text(page.title, themeBridge)}</h2>}
      <LessonText
        text={themeLesson5Text(page.body, themeBridge)}
        className="anchor-lesson__text anchor-lesson__text--enter"
      />
      {page.equation && (
        <p className="lesson-summary__equation">{themeLesson5Text(page.equation, themeBridge)}</p>
      )}
    </div>
  )
}

const TWO_SPINNER_CHOICES: Lesson5OutcomeKind[] = ['crown', 'dragon']

function TinyRoyalSpinner({
  label,
  selected,
  onSpin,
}: {
  label: string
  selected: Lesson5OutcomeKind
  onSpin: () => void
}) {
  const themeBridge = useLesson5ThemeBridge()
  const { display, outcomeVisuals } = themeBridge
  const selectedIndex = TWO_SPINNER_CHOICES.indexOf(selected)
  const [spinTurns, setSpinTurns] = useState(0)
  const spinRotation = spinTurns * 360 - (selectedIndex * 180 + 90)
  const wheelBackground = `conic-gradient(from 0deg, ${outcomeVisuals.crown.background} 0 50%, ${outcomeVisuals.dragon.background} 50% 100%)`

  function handleSpin() {
    setSpinTurns((turns) => turns + 2 + getRandomIndex(3))
    onSpin()
  }

  return (
    <div className="lesson-5-mini-spinner">
      <h3>{label}</h3>
      <div
        className="lesson-5-mini-spinner__wheel"
        style={{ '--lesson-5-mini-spinner-rotation': `${spinRotation}deg` } as CSSProperties}
        aria-label={`${label} with ${display.crown.label} and ${display.dragon.label}`}
      >
        <div className="lesson-5-mini-spinner__rotor">
          <div
            className="lesson-5-mini-spinner__wheel-bg"
            style={{ background: wheelBackground }}
            aria-hidden="true"
          />
          {TWO_SPINNER_CHOICES.map((choice) => (
            <span
              key={choice}
              className={`lesson-5-mini-spinner__half lesson-5-mini-spinner__half--${choice}${selected === choice ? ' lesson-5-mini-spinner__half--selected' : ''}`}
              style={getOutcomeVisualStyle(choice, themeBridge, selected === choice)}
            >
              <span aria-hidden="true">{display[choice].icon}</span>
              {display[choice].label}
            </span>
          ))}
        </div>
        <div className="lesson-5-mini-spinner__pointer" aria-hidden="true" />
      </div>
      <LessonButton label={`Spin ${label}`} variant="secondary" onClick={handleSpin} />
    </div>
  )
}

function TwoSpinnerReviewVisual() {
  const themeBridge = useLesson5ThemeBridge()
  const { display } = themeBridge
  const [spinnerA, setSpinnerA] = useState<Lesson5OutcomeKind>('crown')
  const [spinnerB, setSpinnerB] = useState<Lesson5OutcomeKind>('dragon')
  const outcomes = TWO_SPINNER_CHOICES.flatMap((first) =>
    TWO_SPINNER_CHOICES.map((second) => [first, second] as const),
  )

  function spinA() {
    setSpinnerA(TWO_SPINNER_CHOICES[getRandomIndex(TWO_SPINNER_CHOICES.length)])
  }

  function spinB() {
    setSpinnerB(TWO_SPINNER_CHOICES[getRandomIndex(TWO_SPINNER_CHOICES.length)])
  }

  return (
    <div
      className="lesson-5-two-spinners"
      aria-label={`Two interactive ${themeBridge.copy.themeAdjectiveLower} spinners`}
    >
      <div className="lesson-5-two-spinners__wheels">
        <TinyRoyalSpinner label="Spinner A" selected={spinnerA} onSpin={spinA} />
        <TinyRoyalSpinner label="Spinner B" selected={spinnerB} onSpin={spinB} />
      </div>

      <p className="lesson-5-two-spinners__current" aria-live="polite">
        Current spin: <strong>{display[spinnerA].icon} {display[spinnerA].label} + {display[spinnerB].icon} {display[spinnerB].label}</strong>
        {spinnerA === spinnerB ? ' — Match!' : ' — Not a match.'}
      </p>

      <div className="lesson-5-two-spinners__outcomes">
        <h3>All possible pairs</h3>
        <ol>
          {outcomes.map(([first, second]) => (
            <li
              key={`${first}-${second}`}
              className={first === second ? 'lesson-5-two-spinners__outcome--match' : ''}
              style={first === second ? themeBridge.matchOutcomeStyle : undefined}
            >
              <span className="lesson-5-two-spinners__pair">
                <span
                  className={`lesson-5-two-spinners__token lesson-5-two-spinners__token--${first}`}
                  style={getOutcomeVisualStyle(first, themeBridge)}
                >
                  <span aria-hidden="true">{display[first].icon}</span>
                  {display[first].label}
                </span>
                <span className="lesson-5-two-spinners__plus">+</span>
                <span
                  className={`lesson-5-two-spinners__token lesson-5-two-spinners__token--${second}`}
                  style={getOutcomeVisualStyle(second, themeBridge)}
                >
                  <span aria-hidden="true">{display[second].icon}</span>
                  {display[second].label}
                </span>
              </span>
              <strong>{first === second ? 'Match' : 'No match'}</strong>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
export function Lesson5SampleSpaceIntro({ princessName }: Lesson5SectionProps) {
  const { profile, updateScreen } = useLesson()
  const themeBridge = useLesson5ThemeBridge()
  const [state, setState] = useSectionState('lesson-5-sample-space-intro', {
    selectedIndexes: [] as number[],
    challengeCorrect: false,
  })
  const { selectedIndexes, challengeCorrect } = state
  const section = lesson5Sections.sampleSpaceIntro

  function handleSelect(index: number) {
    setState({
      selectedIndexes: selectedIndexes.includes(index) ? selectedIndexes : [...selectedIndexes, index],
    })
  }

  function resetSampleSpace() {
    setState({ selectedIndexes: [] })
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-5" style={themeBridge.screenStyle}>
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0)} />
      <h1>{themeBridge.copy.sampleHeading}</h1>
      <LessonText text={themeLesson5Text(section.body(princessName), themeBridge)} />
      <VoiceButton
        autoPlay={!challengeCorrect}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_5_ID}
        clipKey="lesson5.screen1.sampleSpaceIntro"
        themePreference={profile.themePreference}
        label="Listen to sample space tip"
      />

      <div className="lesson-screen__play-area">
        <CarnivalSpinner
          spaces={spinnerInspectorSpaces}
          selectedIndexes={selectedIndexes}
          onSelect={handleSelect}
          onSpin={handleSelect}
          ariaLabel={themeLesson5Text('Four equal carnival spinner spaces', themeBridge)}
        />
        <div>
          <SampleSpaceTray spaces={spinnerInspectorSpaces} selectedIndexes={selectedIndexes} />
          <LessonButton
            label="Reset sample space"
            variant="secondary"
            onClick={resetSampleSpace}
            disabled={selectedIndexes.length === 0}
          />
        </div>
      </div>

      <Lesson5ChallengeBlock
        challenge={themeLesson5Challenge(challenge1(princessName), themeBridge)}
        onCorrect={() => setState({ challengeCorrect: true })}
      />
      {challengeCorrect && <LessonButton label="Build the sample space" onClick={() => void updateScreen(2)} />}
    </section>
  )
}

export function Lesson5SpinnerInspector({ princessName }: Lesson5SectionProps) {
  const { profile, updateScreen } = useLesson()
  const themeBridge = useLesson5ThemeBridge()
  const miniLesson = useMemo(() => sampleSpaceMiniLesson(princessName), [princessName])
  const [state, setState] = useSectionState('lesson-5-spinner-inspector', {
    pageIndex: 0,
    correctPageIds: [] as string[],
  })
  const { pageIndex, correctPageIds } = state
  const outcomesChallengeSolved = correctPageIds.includes('lesson-5-count-favorable-outcomes')

  function handlePageChange(nextPageIndex: number) {
    setState({ pageIndex: nextPageIndex })
  }

  function markCorrect(pageId: string) {
    setState({
      correctPageIds: correctPageIds.includes(pageId) ? correctPageIds : [...correctPageIds, pageId],
    })
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-5" style={themeBridge.screenStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{themeLesson5Text(miniLesson.title, themeBridge)}</h1>
      <SampleSpaceTray spaces={spinnerInspectorSpaces} emptyText="The recorder is ready to list outcomes." />
      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={handlePageChange}
        onComplete={() => void updateScreen(3)}
        nextLabel="Next"
        completeLabel="Check fairness"
        navClassName="anchor-lesson__nav"
        showDots
        showNext={(page) => !isChallengePage(page) || correctPageIds.includes(page.id)}
        renderPage={(page) =>
          isChallengePage(page) ? (
            <Lesson5ChallengeBlock
              key={page.id}
              challenge={themeLesson5Challenge(page, themeBridge)}
              onCorrect={() => markCorrect(page.id)}
            />
          ) : (
            <>
              <MiniLessonPageContent page={page} />
              {page.id === 'sample-space-word' && (
                <VoiceButton
                  autoPlay={!outcomesChallengeSolved}
                  enabled={profile.voiceEnabled}
                  lessonId={LESSON_5_ID}
                  clipKey="lesson5.screen2.outcomesIntro"
                  themePreference={profile.themePreference}
                  label="Listen to outcome-list tip"
                />
              )}
            </>
          )
        }
      />
    </section>
  )
}

export function Lesson5FairnessCheck({ princessName }: Lesson5SectionProps) {
  const { profile, updateScreen } = useLesson()
  const themeBridge = useLesson5ThemeBridge()
  const [state, setState] = useSectionState('lesson-5-fairness-check', {
    challengeCorrect: false,
  })
  const { challengeCorrect } = state
  const section = lesson5Sections.fairnessCheck

  return (
    <section className="lesson-screen lesson-screen--themed lesson-5" style={themeBridge.screenStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{themeLesson5Text(section.heading, themeBridge)}</h1>
      <LessonText text={themeLesson5Text(section.body(princessName), themeBridge)} />
      <VoiceButton
        autoPlay={!challengeCorrect}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_5_ID}
        clipKey="lesson5.screen3.fairnessIntro"
        themePreference={profile.themePreference}
        label="Listen to fairness tip"
      />

      <div className="lesson-screen__play-area">
        <CarnivalSpinner
          spaces={unfairSpinnerSpaces}
          ariaLabel={themeLesson5Text('Carnival spinner with Crown, Crown, Dragon, and Jewel', themeBridge)}
        />
        <FairnessMeter
          spaces={unfairSpinnerSpaces}
          opponent="dragon"
          showResult={challengeCorrect}
        />
      </div>

      <Lesson5ChallengeBlock
        challenge={themeLesson5Challenge(challenge3(princessName), themeBridge)}
        onCorrect={() => setState({ challengeCorrect: true })}
      />
      {challengeCorrect && <LessonButton label="Fix the game" onClick={() => void updateScreen(4)} />}
    </section>
  )
}

export function Lesson5FairSpinnerBuilder({ princessName }: Lesson5SectionProps) {
  const { updateScreen } = useLesson()
  const themeBridge = useLesson5ThemeBridge()
  const { display } = themeBridge
  const [state, setState] = useSectionState('lesson-5-fair-spinner-builder', {
    spaces: builderStartingSpaces,
    challengeCorrect: false,
  })
  const { spaces, challengeCorrect } = state
  const princessCount = spaces.filter((space) => space.winner === 'princess').length
  const dragonCount = spaces.filter((space) => space.winner === 'dragon').length
  const isFair = princessCount === dragonCount
  const section = lesson5Sections.fairSpinnerBuilder

  function cycleSpace(index: number) {
    const cycle: Lesson5OutcomeKind[] = ['crown', 'dragon', 'jewel']
    setState({
      spaces: spaces.map((space, spaceIndex) => {
        if (spaceIndex !== index) return space
        const nextKind = cycle[(cycle.indexOf(space.kind) + 1) % cycle.length]
        return makeSpinnerSpace(space.id, nextKind, display)
      }),
    })
  }

  function resetBuilder() {
    setState({ spaces: builderStartingSpaces })
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-5" style={themeBridge.screenStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(3)} />
      <h1>{themeBridge.copy.fixHeading}</h1>
      <LessonText text={themeLesson5Text(section.body(princessName), themeBridge)} />

      <div className="lesson-screen__play-area">
        <div className="lesson-5-builder">
          <CarnivalSpinner
            spaces={spaces}
            onSelect={cycleSpace}
            ariaLabel={themeLesson5Text('Editable four-space carnival spinner', themeBridge)}
          />
          <LessonButton label="Reset spinner" variant="secondary" onClick={resetBuilder} />
        </div>
        <FairnessMeter spaces={spaces} opponent="dragon" />
      </div>

      {isFair && (
        <FeedbackBanner
          variant="success"
          message={themeLesson5Text(
            `The booth is fair now: ${display.crown.label} and ${display.dragon.label} each have **2 out of 4** winning spaces.`,
            themeBridge,
          )}
        />
      )}

      <Lesson5ChallengeBlock
        challenge={themeLesson5Challenge(challenge4(princessName), themeBridge)}
        onCorrect={() => setState({ challengeCorrect: true })}
      />
      {challengeCorrect && !isFair && (
        <FeedbackBanner
          variant="info"
          message={`Great answer. Now repaint the spinner so ${display.crown.label} and ${display.dragon.label} each have the same number of winning spaces.`}
        />
      )}
      {challengeCorrect && isFair && <LessonButton label={themeBridge.copy.reviewTitle} onClick={() => void updateScreen(5)} />}
    </section>
  )
}

export function Lesson5RoyalReview({ princessName }: Lesson5SectionProps) {
  const { updateLesson, updateScreen } = useLesson()
  const themeBridge = useLesson5ThemeBridge()
  const miniLesson = useMemo(() => royalReviewMiniLesson(princessName), [princessName])
  const [state, setState] = useSectionState('lesson-5-royal-review', {
    pageIndex: 0,
    correctPageIds: [] as string[],
  })
  const { pageIndex, correctPageIds } = state
  const section = lesson5Sections.royalReview

  function markCorrect(pageId: string) {
    setState({
      correctPageIds: correctPageIds.includes(pageId) ? correctPageIds : [...correctPageIds, pageId],
    })
  }

  async function handleFinish() {
    playCompletionTada()
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-5" style={themeBridge.screenStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(4)} />
      <h1>{themeLesson5Text(section.heading, themeBridge)}</h1>
      <LessonText text={themeLesson5Text(section.body(princessName), themeBridge)} />
      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={(nextPageIndex) => setState({ pageIndex: nextPageIndex })}
        onComplete={handleFinish}
        nextLabel="Next"
        completeLabel="Finish Lesson"
        navClassName="anchor-lesson__nav"
        showDots
        showNext={(page) => !isChallengePage(page) || correctPageIds.includes(page.id)}
        renderPage={(page) => {
          if (isChallengePage(page)) {
            return (
              <Lesson5ChallengeBlock
                key={page.id}
                challenge={themeLesson5Challenge(page, themeBridge)}
                onCorrect={() => markCorrect(page.id)}
              >
                {page.id === 'lesson-5-check-built-game' ? (
                  <>
                    <CarnivalSpinner
                      spaces={sixSpaceFairSpinnerSpaces}
                      ariaLabel={themeLesson5Text('Six-space carnival spinner with stars and shields', themeBridge)}
                    />
                    <FairnessMeter
                      spaces={sixSpaceFairSpinnerSpaces}
                      opponent="knight"
                      showResult={correctPageIds.includes(page.id)}
                    />
                  </>
                ) : (
                  <TwoSpinnerReviewVisual />
                )}
              </Lesson5ChallengeBlock>
            )
          }

          return (
            <>
              <MiniLessonPageContent page={page} />
              {page.id === 'two-spinner-grid' && <TwoSpinnerReviewVisual />}
            </>
          )
        }}
      />
    </section>
  )
}
