import { useState, type CSSProperties } from 'react'
import '../../screens/screens.css'
import './styles.css'
import { ChallengeQuestion } from '../../components/ChallengeQuestion'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { HintButton } from '../../components/HintButton'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
import { ScreenBackButton } from '../../components/ScreenBackButton'
import { VoiceButton } from '../../components/VoiceButton'
import { useLesson } from '../../hooks/useLesson'
import { useSectionState } from '../../hooks/useSectionState'
import { lesson1ThemeStyle, resolveLesson1Theme } from '../../themes/themeResolver'
import { LESSON_3_ID, type ChallengeMiniLessonPage } from '../../types/lesson'
import { playCompletionTada } from '../../utils/completionSound'
import { getProfileLessonProgress } from '../../utils/lessonProgress'
import {
  getLesson3ContainerLabel,
  getLesson3PairLabel,
  getLesson3SameContainerStamp,
  getLesson3ThemeCopy,
  getLesson3TreasureAriaLabel,
  getLesson3TreasureLabel,
  lesson3CompletionMessage,
  lesson3CountingChallenge,
  lesson3CountingSection,
  lesson3FinalSortCards,
  lesson3RoyalBagChallenge,
  lesson3SameBagMiniLesson,
  lesson3TreasureBagSection,
  lesson3Treasures,
  type Lesson3SortAnswer,
  type Lesson3SortCard,
  type Lesson3ThemeCopy,
  type Lesson3TreasureId,
} from './copy'
import type { ThemePreference } from '../../themes/themeTypes'

interface Lesson3SectionProps {
  princessName: string
}

interface FoundTreasureBag {
  key: string
  treasures: Lesson3TreasureId[]
}

interface Lesson3ChallengeState {
  answerInput: string
  attemptedAnswers: string[]
  submitted: boolean
  isCorrect: boolean | null
  wrongAttempts: number
}

interface Lesson3SameBagState {
  [key: string]: unknown
  pageIndex: number
}

interface Lesson3CountingShortcutState {
  [key: string]: unknown
  repeatsCollapsed: boolean
}

interface Lesson3FinalSortState {
  [key: string]: unknown
  answers: Record<string, Lesson3SortAnswer>
}

interface Lesson3TreasureVisual {
  fill: string
  highlight: string
  background: string
  text: string
  border: string
}

type Lesson3TreasureVisuals = Record<Lesson3TreasureId, Lesson3TreasureVisual>
type Lesson3TreasureStyles = Record<Lesson3TreasureId, CSSProperties>

const LESSON_3_TREASURE_VISUALS: Record<ThemePreference, Lesson3TreasureVisuals> = {
  royal: {
    ruby: {
      fill: '#ef4444',
      highlight: '#fecaca',
      background: '#fef2f2',
      text: '#991b1b',
      border: '#f87171',
    },
    sapphire: {
      fill: '#2563eb',
      highlight: '#bfdbfe',
      background: '#eff6ff',
      text: '#1d4ed8',
      border: '#60a5fa',
    },
    emerald: {
      fill: '#16a34a',
      highlight: '#bbf7d0',
      background: '#f0fdf4',
      text: '#166534',
      border: '#4ade80',
    },
    pearl: {
      fill: '#e5e7eb',
      highlight: '#ffffff',
      background: '#f8fafc',
      text: '#374151',
      border: '#cbd5e1',
    },
    amethyst: {
      fill: '#9333ea',
      highlight: '#e9d5ff',
      background: '#faf5ff',
      text: '#6b21a8',
      border: '#c084fc',
    },
  },
  space: {
    ruby: {
      fill: '#94a3b8',
      highlight: '#f8fafc',
      background: '#f8fafc',
      text: '#334155',
      border: '#cbd5e1',
    },
    sapphire: {
      fill: '#38bdf8',
      highlight: '#e0f2fe',
      background: '#eff6ff',
      text: '#075985',
      border: '#7dd3fc',
    },
    emerald: {
      fill: '#14b8a6',
      highlight: '#ccfbf1',
      background: '#ecfeff',
      text: '#0f766e',
      border: '#5eead4',
    },
    pearl: {
      fill: '#8b5cf6',
      highlight: '#ede9fe',
      background: '#f5f3ff',
      text: '#5b21b6',
      border: '#a78bfa',
    },
    amethyst: {
      fill: '#f97316',
      highlight: '#fed7aa',
      background: '#fff7ed',
      text: '#c2410c',
      border: '#fb923c',
    },
  },
  dinosaurs: {
    ruby: {
      fill: '#65a30d',
      highlight: '#d9f99d',
      background: '#f7fee7',
      text: '#3f6212',
      border: '#84cc16',
    },
    sapphire: {
      fill: '#16a34a',
      highlight: '#bbf7d0',
      background: '#f0fdf4',
      text: '#166534',
      border: '#4ade80',
    },
    emerald: {
      fill: '#d97706',
      highlight: '#fde68a',
      background: '#fffbeb',
      text: '#92400e',
      border: '#f59e0b',
    },
    pearl: {
      fill: '#64748b',
      highlight: '#e2e8f0',
      background: '#f8fafc',
      text: '#334155',
      border: '#94a3b8',
    },
    amethyst: {
      fill: '#92400e',
      highlight: '#fed7aa',
      background: '#fff7ed',
      text: '#78350f',
      border: '#fb923c',
    },
  },
  animals: {
    ruby: {
      fill: '#f97316',
      highlight: '#fed7aa',
      background: '#fff7ed',
      text: '#c2410c',
      border: '#fb923c',
    },
    sapphire: {
      fill: '#111827',
      highlight: '#e5e7eb',
      background: '#f9fafb',
      text: '#1f2937',
      border: '#9ca3af',
    },
    emerald: {
      fill: '#ea580c',
      highlight: '#fdba74',
      background: '#ffedd5',
      text: '#9a3412',
      border: '#fb923c',
    },
    pearl: {
      fill: '#16a34a',
      highlight: '#bbf7d0',
      background: '#f0fdf4',
      text: '#166534',
      border: '#4ade80',
    },
    amethyst: {
      fill: '#ec4899',
      highlight: '#fbcfe8',
      background: '#fdf2f8',
      text: '#be185d',
      border: '#f472b6',
    },
  },
  sports: {
    ruby: {
      fill: '#0284c7',
      highlight: '#bae6fd',
      background: '#f0f9ff',
      text: '#075985',
      border: '#38bdf8',
    },
    sapphire: {
      fill: '#f59e0b',
      highlight: '#fde68a',
      background: '#fffbeb',
      text: '#92400e',
      border: '#fbbf24',
    },
    emerald: {
      fill: '#16a34a',
      highlight: '#bbf7d0',
      background: '#f0fdf4',
      text: '#166534',
      border: '#4ade80',
    },
    pearl: {
      fill: '#e5e7eb',
      highlight: '#ffffff',
      background: '#f8fafc',
      text: '#374151',
      border: '#cbd5e1',
    },
    amethyst: {
      fill: '#8b5cf6',
      highlight: '#ddd6fe',
      background: '#f5f3ff',
      text: '#5b21b6',
      border: '#a78bfa',
    },
  },
  surprise: {
    ruby: {
      fill: '#d946ef',
      highlight: '#f5d0fe',
      background: '#fdf4ff',
      text: '#a21caf',
      border: '#e879f9',
    },
    sapphire: {
      fill: '#06b6d4',
      highlight: '#cffafe',
      background: '#ecfeff',
      text: '#0e7490',
      border: '#67e8f9',
    },
    emerald: {
      fill: '#22c55e',
      highlight: '#bbf7d0',
      background: '#f0fdf4',
      text: '#15803d',
      border: '#4ade80',
    },
    pearl: {
      fill: '#94a3b8',
      highlight: '#f8fafc',
      background: '#f8fafc',
      text: '#475569',
      border: '#cbd5e1',
    },
    amethyst: {
      fill: '#a855f7',
      highlight: '#e9d5ff',
      background: '#faf5ff',
      text: '#7e22ce',
      border: '#c084fc',
    },
  },
}

const TREASURE_STYLES: Record<Lesson3TreasureId, string> = {
  ruby: 'treasure-bag__jewel--ruby',
  sapphire: 'treasure-bag__jewel--sapphire',
  emerald: 'treasure-bag__jewel--emerald',
  pearl: 'treasure-bag__jewel--pearl',
  amethyst: 'treasure-bag__jewel--amethyst',
}

const ORDERED_PICK_EXAMPLES: { first: Lesson3TreasureId; second: Lesson3TreasureId }[] = [
  { first: 'ruby', second: 'sapphire' },
  { first: 'sapphire', second: 'ruby' },
  { first: 'ruby', second: 'emerald' },
  { first: 'emerald', second: 'ruby' },
  { first: 'sapphire', second: 'emerald' },
  { first: 'emerald', second: 'sapphire' },
]

const TREASURE_ORDER = new Map(
  lesson3Treasures.map((treasure, index) => [treasure.id, index] as const),
)

function sortTreasureIds(treasureIds: readonly Lesson3TreasureId[]) {
  return [...treasureIds].sort(
    (a, b) => (TREASURE_ORDER.get(a) ?? 0) - (TREASURE_ORDER.get(b) ?? 0),
  )
}

function makeTreasureKey(treasureIds: readonly Lesson3TreasureId[]) {
  return sortTreasureIds(treasureIds).join('-')
}

function lesson3ChallengeSectionId(pageId: string) {
  return `lesson-3-challenge-${pageId}`
}

function isLesson3ChallengeCorrect(
  sectionState: Record<string, Record<string, unknown>>,
  pageId: string,
) {
  return sectionState[lesson3ChallengeSectionId(pageId)]?.isCorrect === true
}

function treasureCssStyle(visual: Lesson3TreasureVisual): CSSProperties {
  return {
    '--lesson3-treasure-fill': visual.fill,
    '--lesson3-treasure-highlight': visual.highlight,
    '--lesson3-treasure-bg': visual.background,
    '--lesson3-treasure-text': visual.text,
    '--lesson3-treasure-border': visual.border,
  } as CSSProperties
}

function createLesson3TreasureStyles(themePreference: ThemePreference): Lesson3TreasureStyles {
  const palette = LESSON_3_TREASURE_VISUALS[themePreference] ?? LESSON_3_TREASURE_VISUALS.royal
  return {
    ruby: treasureCssStyle(palette.ruby),
    sapphire: treasureCssStyle(palette.sapphire),
    emerald: treasureCssStyle(palette.emerald),
    pearl: treasureCssStyle(palette.pearl),
    amethyst: treasureCssStyle(palette.amethyst),
  }
}

function useLesson3Screen() {
  const lesson = useLesson()
  const activeTheme = resolveLesson1Theme(lesson.profile.themePreference, lesson.profile.themePacks)
  return {
    ...lesson,
    lessonStyle: lesson1ThemeStyle(activeTheme),
    themeCopy: getLesson3ThemeCopy(lesson.profile.themePreference),
    treasureStyles: createLesson3TreasureStyles(lesson.profile.themePreference),
  }
}

function TreasureJewel({
  treasureId,
  themeCopy,
  treasureStyles,
  small = false,
}: {
  treasureId: Lesson3TreasureId
  themeCopy: Lesson3ThemeCopy
  treasureStyles: Lesson3TreasureStyles
  small?: boolean
}) {
  return (
    <span
      className={`treasure-bag__jewel ${TREASURE_STYLES[treasureId]}${small ? ' treasure-bag__jewel--small' : ''}`}
      style={treasureStyles[treasureId]}
      aria-label={getLesson3TreasureAriaLabel(themeCopy, treasureId)}
    />
  )
}

function TreasurePair({
  treasures,
  themeCopy,
  treasureStyles,
}: {
  treasures: readonly Lesson3TreasureId[]
  themeCopy: Lesson3ThemeCopy
  treasureStyles: Lesson3TreasureStyles
}) {
  return (
    <span className="treasure-bag__pair">
      {treasures.map((treasureId, index) => (
        <span
          key={treasureId}
          className="treasure-bag__pair-item"
          style={treasureStyles[treasureId]}
        >
          <TreasureJewel
            treasureId={treasureId}
            themeCopy={themeCopy}
            treasureStyles={treasureStyles}
            small
          />
          <span>{getLesson3TreasureLabel(themeCopy, treasureId)}</span>
          {index === 0 && <span className="treasure-bag__plus">+</span>}
        </span>
      ))}
    </span>
  )
}

function ChallengeBlock({
  page,
}: {
  page: ChallengeMiniLessonPage<number>
}) {
  const { profile, recordStudentMemoryEvent, updateLesson } = useLesson()
  const activeLesson = getProfileLessonProgress(profile)
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const sectionId = lesson3ChallengeSectionId(page.id)
  const savedState = activeLesson.sectionState[sectionId] as Partial<Lesson3ChallengeState> | undefined
  const state: Lesson3ChallengeState = {
    answerInput: '',
    attemptedAnswers: [] as string[],
    submitted: false,
    isCorrect: null as boolean | null,
    wrongAttempts: 0,
    ...savedState,
  }
  const { attemptedAnswers, submitted, isCorrect, wrongAttempts } = state
  const [answerInput, setAnswerInput] = useState(state.answerInput)
  const [repeatAnswer, setRepeatAnswer] = useState('')

  function handleSubmit() {
    const normalizedAnswer = answerInput.trim()
    if (attemptedAnswers.includes(normalizedAnswer)) {
      setRepeatAnswer(normalizedAnswer)
      return
    }

    const correct = Number(answerInput) === page.answer
    const nextWrongAttempts = correct ? wrongAttempts : wrongAttempts + 1
    void updateLesson({
      sectionState: {
        [sectionId]: {
          answerInput,
          attemptedAnswers: [...attemptedAnswers, normalizedAnswer],
          submitted: true,
          isCorrect: correct,
          wrongAttempts: nextWrongAttempts,
        },
      },
    })
    setRepeatAnswer('')
    void recordStudentMemoryEvent({
      type: 'challengeAttempt',
      lessonId: LESSON_3_ID,
      conceptKey: `lesson-3-${page.id}`,
      label: 'Groups without order',
      outcome: correct ? 'correct' : 'incorrect',
      learnerAnswer: normalizedAnswer,
      correctAnswer: String(page.answer),
    }).catch(() => undefined)
    setFeedbackVoiceToken((token) => token + 1)
  }

  function handleAnswerChange(value: string) {
    setAnswerInput(value)
    setRepeatAnswer('')
  }

  return (
    <div className="lesson-summary__practice">
      {page.body && <LessonText text={page.body} />}
      <ChallengeQuestion
        prompt={page.prompt}
        value={answerInput}
        onChange={handleAnswerChange}
        onSubmit={handleSubmit}
        submitted={submitted}
        allowRetry={submitted && isCorrect === false}
      />
      <HintButton
        lessonId={LESSON_3_ID}
        conceptKey={`lesson-3-${page.id}`}
        conceptLabel="Groups without order"
        prompt={page.prompt}
        context={page.body ?? 'The learner is counting groups where order does not make a new group.'}
        fallbackHint={page.feedback?.tryAgain ?? 'Look for groups that use the same items, even if they appear in a different order.'}
        blockedAnswerTerms={[String(page.answer)]}
        learnerAnswer={answerInput}
        attemptedAnswers={attemptedAnswers}
        wrongAttempts={wrongAttempts}
        disabled={!submitted || isCorrect === true}
      />
      {repeatAnswer && (
        <FeedbackBanner
          variant="info"
          message={`You already tried **${repeatAnswer}**. Try a different answer!`}
        />
      )}
      {submitted && isCorrect !== null && (
        <FeedbackBanner
          variant={isCorrect ? 'success' : 'error'}
          voiceCue={{
            correctClipKey: 'lesson3.feedback.correct',
            enabled: profile.voiceEnabled,
            lessonId: LESSON_3_ID,
            playToken: feedbackVoiceToken || null,
            themePreference: profile.themePreference,
            tryAgainClipKey: 'lesson3.feedback.tryAgain',
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

function TreasureBagPicker({
  princessName,
  themeCopy,
  treasureStyles,
}: Lesson3SectionProps & { themeCopy: Lesson3ThemeCopy; treasureStyles: Lesson3TreasureStyles }) {
  const { profile, updateLesson } = useLesson()
  const activeLesson = getProfileLessonProgress(profile)
  const sectionId = 'lesson-3-treasure-bag-picker'
  const savedState = activeLesson.sectionState[sectionId] as
    | { foundBags?: FoundTreasureBag[] }
    | undefined
  const foundBags = savedState?.foundBags ?? []
  const [selectedTreasures, setSelectedTreasures] = useState<Lesson3TreasureId[]>([])
  const [status, setStatus] = useState({
    statusMessage: themeCopy.initialStatus,
    statusVariant: 'info' as 'info' | 'success' | 'error',
  })

  function saveFoundBags(nextFoundBags: FoundTreasureBag[]) {
    void updateLesson({
      sectionState: {
        [sectionId]: {
          foundBags: nextFoundBags,
        },
      },
    })
  }

  function updateStatus(
    statusVariant: 'info' | 'success' | 'error',
    statusMessage: string,
  ) {
    setStatus({ statusMessage, statusVariant })
  }

  function selectTreasure(treasureId: Lesson3TreasureId) {
    if (selectedTreasures.includes(treasureId) || selectedTreasures.length >= 2) return

    const nextSelection = [...selectedTreasures, treasureId]
    setSelectedTreasures(nextSelection)

    if (nextSelection.length === 1) {
      updateStatus('info', themeCopy.firstPickStatus)
      return
    }

    const key = makeTreasureKey(nextSelection)
    const sortedTreasures = sortTreasureIds(nextSelection)
    const duplicate = foundBags.some((bag) => bag.key === key)

    if (duplicate) {
      updateStatus(
        'error',
        themeCopy.duplicateStatus(
          princessName,
          getLesson3PairLabel(themeCopy, sortedTreasures),
        ),
      )
      return
    }

    saveFoundBags([...foundBags, { key, treasures: sortedTreasures }])
    updateStatus('success', themeCopy.newFoundStatus(getLesson3PairLabel(themeCopy, sortedTreasures)))
  }

  function clearBag() {
    setSelectedTreasures([])
    updateStatus('info', themeCopy.nextContainerStatus)
  }

  const { statusMessage, statusVariant } = status

  return (
    <div className="treasure-bag" aria-label={`${themeCopy.containerPlural} picker`}>
      <div className="treasure-bag__stage">
        <div className="treasure-bag__bag" aria-label={themeCopy.currentContainerAriaLabel}>
          {[0, 1].map((slotIndex) => {
            const treasureId = selectedTreasures[slotIndex]
            return (
              <div
                key={slotIndex}
                className={`treasure-bag__slot${treasureId ? ' treasure-bag__slot--filled' : ''}`}
              >
                {treasureId ? (
                  <TreasureJewel
                    treasureId={treasureId}
                    themeCopy={themeCopy}
                    treasureStyles={treasureStyles}
                  />
                ) : (
                  <span>?</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="treasure-bag__choices" aria-label={themeCopy.choiceAreaLabel}>
          {lesson3Treasures.map((treasure) => {
            const selected = selectedTreasures.includes(treasure.id)
            return (
              <button
                key={treasure.id}
                type="button"
                className={`treasure-bag__choice${selected ? ' treasure-bag__choice--selected' : ''}`}
                style={treasureStyles[treasure.id]}
                onClick={() => selectTreasure(treasure.id)}
                disabled={selected || selectedTreasures.length >= 2}
                aria-pressed={selected}
                aria-label={`Choose ${getLesson3TreasureAriaLabel(themeCopy, treasure.id)}`}
              >
                <TreasureJewel
                  treasureId={treasure.id}
                  themeCopy={themeCopy}
                  treasureStyles={treasureStyles}
                />
                <span>{getLesson3TreasureLabel(themeCopy, treasure.id)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="treasure-bag__actions">
        <LessonButton
          label={themeCopy.startNewContainerLabel}
          variant="secondary"
          onClick={clearBag}
          disabled={selectedTreasures.length === 0}
        />
      </div>

      <FeedbackBanner variant={statusVariant} message={statusMessage} />

      <div className="treasure-bag__found" aria-live="polite">
        <h2>{themeCopy.foundHeading}</h2>
        {foundBags.length === 0 ? (
          <p className="treasure-bag__empty">
            {themeCopy.foundEmpty} Try {getLesson3PairLabel(themeCopy, ['ruby', 'sapphire'])}!
          </p>
        ) : (
          <ol>
            {foundBags.map((bag) => (
              <li key={bag.key}>
                <TreasurePair
                  treasures={bag.treasures}
                  themeCopy={themeCopy}
                  treasureStyles={treasureStyles}
                />
              </li>
            ))}
          </ol>
        )}
        <p className="treasure-bag__counter">
          {themeCopy.foundCounter}: <strong>{foundBags.length}</strong>
        </p>
      </div>
    </div>
  )
}

function DuplicateBagReveal({
  themeCopy,
  treasureStyles,
}: {
  themeCopy: Lesson3ThemeCopy
  treasureStyles: Lesson3TreasureStyles
}) {
  return (
    <div className="same-bag-reveal" aria-label={themeCopy.sameBagAriaLabel}>
      <div className="same-bag-reveal__card">
        <h2>{getLesson3ContainerLabel(themeCopy, 'A')}</h2>
        <p>{getLesson3PairLabel(themeCopy, ['ruby', 'sapphire']).replace(' + ', ', then ')}</p>
        <TreasurePair
          treasures={['ruby', 'sapphire']}
          themeCopy={themeCopy}
          treasureStyles={treasureStyles}
        />
      </div>
      <div className="same-bag-reveal__stamp">{getLesson3SameContainerStamp(themeCopy)}</div>
      <div className="same-bag-reveal__card">
        <h2>{getLesson3ContainerLabel(themeCopy, 'B')}</h2>
        <p>{getLesson3PairLabel(themeCopy, ['sapphire', 'ruby']).replace(' + ', ', then ')}</p>
        <TreasurePair
          treasures={['sapphire', 'ruby']}
          themeCopy={themeCopy}
          treasureStyles={treasureStyles}
        />
      </div>
    </div>
  )
}

function CountingShortcutVisual({
  collapsed,
  onToggleCollapsed,
  showShortcut,
  themeCopy,
  treasureStyles,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
  showShortcut: boolean
  themeCopy: Lesson3ThemeCopy
  treasureStyles: Lesson3TreasureStyles
}) {
  const seenPairs = new Set<string>()
  const uniquePairs = ORDERED_PICK_EXAMPLES.filter((pick) => {
    const key = makeTreasureKey([pick.first, pick.second])
    if (seenPairs.has(key)) return false
    seenPairs.add(key)
    return true
  })

  return (
    <div className="counting-shortcut">
      <div className="counting-shortcut__orders">
        <h2>{themeCopy.orderedPicksHeading}</h2>
        <ol>
          {ORDERED_PICK_EXAMPLES.map((pick, index) => {
            const isRepeat = index % 2 === 1
            return (
              <li
                key={`${pick.first}-${pick.second}`}
                className={collapsed && isRepeat ? 'counting-shortcut__order--repeat' : ''}
              >
                <TreasurePair
                  treasures={[pick.first, pick.second]}
                  themeCopy={themeCopy}
                  treasureStyles={treasureStyles}
                />
                {collapsed && isRepeat && (
                  <span className="counting-shortcut__repeat-label">{themeCopy.repeatLabel}</span>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <LessonButton
        label={collapsed ? themeCopy.showPickOrdersLabel : themeCopy.collapseRepeatsLabel}
        variant="secondary"
        onClick={onToggleCollapsed}
      />

      {collapsed && (
        <div className="counting-shortcut__unique" aria-live="polite">
          <h2>{themeCopy.uniqueLeftHeading}</h2>
          <ol>
            {uniquePairs.map((pick) => (
              <li key={makeTreasureKey([pick.first, pick.second])}>
                <TreasurePair
                  treasures={sortTreasureIds([pick.first, pick.second])}
                  themeCopy={themeCopy}
                  treasureStyles={treasureStyles}
                />
              </li>
            ))}
          </ol>
        </div>
      )}

      {showShortcut ? (
        <div className="counting-shortcut__equation" aria-live="polite">
          <p>
            <strong>5 x 4 = 20</strong> pick orders
          </p>
          <p>
            <strong>20 / 2 = 10</strong> unique {themeCopy.containerPlural}
          </p>
        </div>
      ) : (
        <div className="counting-shortcut__equation">
          <p>{themeCopy.shortcutHidden}</p>
        </div>
      )}
    </div>
  )
}

function SmallerVaultVisual({
  showBags,
  themeCopy,
  treasureStyles,
}: {
  showBags: boolean
  themeCopy: Lesson3ThemeCopy
  treasureStyles: Lesson3TreasureStyles
}) {
  const smallerVaultTreasures: Lesson3TreasureId[] = ['ruby', 'sapphire', 'emerald', 'pearl']
  const uniqueBags: Lesson3TreasureId[][] = [
    ['ruby', 'sapphire'],
    ['ruby', 'emerald'],
    ['ruby', 'pearl'],
    ['sapphire', 'emerald'],
    ['sapphire', 'pearl'],
    ['emerald', 'pearl'],
  ]

  return (
    <div className="smaller-vault">
      <div className="smaller-vault__treasures" aria-label={themeCopy.smallerCollectionAriaLabel}>
        {smallerVaultTreasures.map((treasureId) => (
          <div
            key={treasureId}
            className="smaller-vault__treasure"
            style={treasureStyles[treasureId]}
          >
            <TreasureJewel
              treasureId={treasureId}
              themeCopy={themeCopy}
              treasureStyles={treasureStyles}
            />
            <span>{getLesson3TreasureLabel(themeCopy, treasureId)}</span>
          </div>
        ))}
      </div>
      <div className="smaller-vault__bags">
        <h2>{showBags ? themeCopy.smallerListHeading : 'Check your answer first'}</h2>
        {showBags ? (
          <ol aria-live="polite">
            {uniqueBags.map((bag) => (
              <li key={makeTreasureKey(bag)}>
                <TreasurePair
                  treasures={bag}
                  themeCopy={themeCopy}
                  treasureStyles={treasureStyles}
                />
              </li>
            ))}
          </ol>
        ) : (
          <p className="treasure-bag__empty">{themeCopy.smallerListHidden}</p>
        )}
      </div>
    </div>
  )
}

function SortCard({
  card,
  selectedAnswer,
  onSelect,
}: {
  card: Lesson3SortCard
  selectedAnswer?: Lesson3SortAnswer
  onSelect: (answer: Lesson3SortAnswer) => void
}) {
  const isCorrect = selectedAnswer === card.correctAnswer
  const isWrong = selectedAnswer !== undefined && !isCorrect

  return (
    <article
      className={`combination-sort__card${isCorrect ? ' combination-sort__card--correct' : ''}${isWrong ? ' combination-sort__card--wrong' : ''}`}
    >
      <p>{card.prompt}</p>
      <div className="combination-sort__actions">
        <button
          type="button"
          className={selectedAnswer === 'order' ? 'combination-sort__choice combination-sort__choice--selected' : 'combination-sort__choice'}
          onClick={() => onSelect('order')}
        >
          Order matters
        </button>
        <button
          type="button"
          className={selectedAnswer === 'group' ? 'combination-sort__choice combination-sort__choice--selected' : 'combination-sort__choice'}
          onClick={() => onSelect('group')}
        >
          Order does not matter
        </button>
      </div>
      {selectedAnswer && (
        <p className="combination-sort__feedback">
          {isCorrect ? card.correctFeedback : card.tryAgainFeedback}
        </p>
      )}
    </article>
  )
}

export function Lesson3TreasureBagPicker({ princessName }: Lesson3SectionProps) {
  const { updateScreen, lessonStyle, profile, themeCopy, treasureStyles } = useLesson3Screen()
  const section = lesson3TreasureBagSection(themeCopy)
  const activeLesson = getProfileLessonProgress(profile)
  const pickerState = activeLesson.sectionState['lesson-3-treasure-bag-picker'] as
    | { foundBags?: FoundTreasureBag[] }
    | undefined
  const pickerHasStarted = (pickerState?.foundBags?.length ?? 0) > 0

  return (
    <section className="lesson-screen lesson-screen--themed lesson-3" style={lessonStyle}>
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0)} />
      <h1>{section.heading}</h1>
      <LessonText text={section.body(princessName)} />
      <VoiceButton
        autoPlay={!pickerHasStarted}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_3_ID}
        clipKey="lesson3.screen1.combinationsIntro"
        themePreference={profile.themePreference}
        label="Listen to combinations intro"
      />
      <TreasureBagPicker
        princessName={princessName}
        themeCopy={themeCopy}
        treasureStyles={treasureStyles}
      />
      <p className="treasure-bag__scaffold-note">
        Build a few {themeCopy.containerPlural} if it helps. You do not need to find every
        possible {themeCopy.containerSingular} before continuing.
      </p>
      <LessonButton
        label={section.nextLabel}
        onClick={() => void updateScreen(2)}
      />
    </section>
  )
}

export function Lesson3SameBagLesson() {
  const { updateScreen, lessonStyle, profile, themeCopy, treasureStyles } = useLesson3Screen()
  const miniLesson = lesson3SameBagMiniLesson(themeCopy)
  const [sameBagState, setSameBagState] = useSectionState<Lesson3SameBagState>(
    'lesson-3-same-bag',
    { pageIndex: 0 },
  )
  const pageIndex = Math.min(sameBagState.pageIndex, miniLesson.pages.length - 1)

  return (
    <section className="lesson-screen lesson-screen--themed lesson-3" style={lessonStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{miniLesson.title}</h1>
      <VoiceButton
        autoPlay={pageIndex === 0}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_3_ID}
        clipKey="lesson3.screen2.duplicatesIntro"
        themePreference={profile.themePreference}
        label="Listen to same-bag intro"
      />
      <DuplicateBagReveal themeCopy={themeCopy} treasureStyles={treasureStyles} />
      <ClickthroughMiniLesson
        miniLesson={miniLesson}
        currentPageIndex={pageIndex}
        onPageChange={(nextPageIndex) => setSameBagState({ pageIndex: nextPageIndex })}
        onComplete={() => void updateScreen(3)}
        nextLabel="Next"
        completeLabel="Count Without Repeats"
        navClassName="anchor-lesson__nav"
        showDots
        renderPage={(page) => (
          <LessonText
            key={page.id}
            text={page.body}
            className="anchor-lesson__text anchor-lesson__text--enter"
          />
        )}
      />
    </section>
  )
}

export function Lesson3CountingShortcut({ princessName }: Lesson3SectionProps) {
  const { updateScreen, lessonStyle, profile, themeCopy, treasureStyles } = useLesson3Screen()
  const activeLesson = getProfileLessonProgress(profile)
  const section = lesson3CountingSection(themeCopy)
  const challenge = lesson3CountingChallenge(princessName, themeCopy)
  const challengeSolved = isLesson3ChallengeCorrect(activeLesson.sectionState, challenge.id)
  const [shortcutState, setShortcutState] = useSectionState<Lesson3CountingShortcutState>(
    'lesson-3-counting-shortcut',
    { repeatsCollapsed: false },
  )

  return (
    <section className="lesson-screen lesson-screen--themed lesson-3" style={lessonStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{section.heading}</h1>
      <LessonText text={section.body(princessName)} />
      <CountingShortcutVisual
        collapsed={shortcutState.repeatsCollapsed}
        onToggleCollapsed={() =>
          setShortcutState({ repeatsCollapsed: !shortcutState.repeatsCollapsed })
        }
        showShortcut={challengeSolved}
        themeCopy={themeCopy}
        treasureStyles={treasureStyles}
      />
      <ChallengeBlock page={challenge} />
      <LessonButton
        label={section.nextLabel}
        onClick={() => void updateScreen(4)}
        disabled={!challengeSolved}
      />
    </section>
  )
}

export function Lesson3RoyalBagChallenge({ princessName }: Lesson3SectionProps) {
  const { updateScreen, lessonStyle, profile, themeCopy, treasureStyles } = useLesson3Screen()
  const activeLesson = getProfileLessonProgress(profile)
  const challenge = lesson3RoyalBagChallenge(princessName, themeCopy)
  const challengeSolved = isLesson3ChallengeCorrect(activeLesson.sectionState, challenge.id)

  return (
    <section className="lesson-screen lesson-screen--themed lesson-3" style={lessonStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(3)} />
      <h1>{themeCopy.smallerChallengeHeading}</h1>
      <LessonText text={themeCopy.smallerChallengeBody} />
      <SmallerVaultVisual
        showBags={challengeSolved}
        themeCopy={themeCopy}
        treasureStyles={treasureStyles}
      />
      <ChallengeBlock page={challenge} />
      <LessonButton
        label={themeCopy.finalNextLabel}
        onClick={() => void updateScreen(5)}
        disabled={!challengeSolved}
      />
    </section>
  )
}

export function Lesson3FinalSort({ princessName }: Lesson3SectionProps) {
  const { updateLesson, updateScreen, lessonStyle, profile, themeCopy } = useLesson3Screen()
  const activeLesson = getProfileLessonProgress(profile)
  const [finalSortState, setFinalSortState] = useSectionState<Lesson3FinalSortState>(
    'lesson-3-final-sort',
    { answers: {} },
  )
  const [isFinishing, setIsFinishing] = useState(false)
  const sortCards = lesson3FinalSortCards(themeCopy)
  const answers = finalSortState.answers
  const allCardsCorrect = sortCards.every((card) => answers[card.id] === card.correctAnswer)
  const allCorrect = activeLesson.completed || allCardsCorrect

  function setCardAnswer(cardId: string, answer: Lesson3SortAnswer) {
    setFinalSortState({ answers: { ...answers, [cardId]: answer } })
  }

  async function handleFinish() {
    if (isFinishing) return
    setIsFinishing(true)
    if (activeLesson.completed) {
      try {
        await updateScreen(0)
      } catch (error) {
        setIsFinishing(false)
        throw error
      }
      return
    }

    playCompletionTada()
    try {
      await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
    } catch (error) {
      setIsFinishing(false)
      throw error
    }
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-3" style={lessonStyle}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(4)} />
      <h1>{themeCopy.finalHeading}</h1>
      <LessonText text={themeCopy.finalIntro} />
      <div className="combination-sort" aria-label="Sort stories by whether order matters">
        {sortCards.map((card) => (
          <SortCard
            key={card.id}
            card={card}
            selectedAnswer={answers[card.id]}
            onSelect={(answer) => setCardAnswer(card.id, answer)}
          />
        ))}
      </div>
      {allCorrect && (
        <FeedbackBanner
          variant="success"
          message={lesson3CompletionMessage(princessName, themeCopy)}
        />
      )}
      <LessonButton
        label={activeLesson.completed ? 'Return to Academy' : 'Finish Lesson'}
        onClick={handleFinish}
        disabled={!allCorrect || isFinishing}
      />
    </section>
  )
}
