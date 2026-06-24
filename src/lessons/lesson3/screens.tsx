import '../../screens/screens.css'
import { ChallengeQuestion } from '../../components/ChallengeQuestion'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
import { ScreenBackButton } from '../../components/ScreenBackButton'
import { useLesson } from '../../hooks/useLesson'
import { useSectionState } from '../../hooks/useSectionState'
import type { ChallengeMiniLessonPage } from '../../types/lesson'
import {
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
  type Lesson3TreasureId,
} from './copy'

interface Lesson3SectionProps {
  princessName: string
}

interface FoundTreasureBag {
  key: string
  treasures: Lesson3TreasureId[]
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

function getTreasureLabel(treasureId: Lesson3TreasureId) {
  return lesson3Treasures.find((treasure) => treasure.id === treasureId)?.label ?? treasureId
}

function sortTreasureIds(treasureIds: readonly Lesson3TreasureId[]) {
  return [...treasureIds].sort((a, b) => getTreasureLabel(a).localeCompare(getTreasureLabel(b)))
}

function makeTreasureKey(treasureIds: readonly Lesson3TreasureId[]) {
  return sortTreasureIds(treasureIds).join('-')
}

function TreasureJewel({ treasureId, small = false }: { treasureId: Lesson3TreasureId; small?: boolean }) {
  return (
    <span
      className={`treasure-bag__jewel ${TREASURE_STYLES[treasureId]}${small ? ' treasure-bag__jewel--small' : ''}`}
      aria-label={`${getTreasureLabel(treasureId)} treasure`}
    />
  )
}

function TreasurePair({ treasures }: { treasures: readonly Lesson3TreasureId[] }) {
  return (
    <span className="treasure-bag__pair">
      {treasures.map((treasureId, index) => (
        <span key={treasureId} className="treasure-bag__pair-item">
          <TreasureJewel treasureId={treasureId} small />
          <span>{getTreasureLabel(treasureId)}</span>
          {index === 0 && <span className="treasure-bag__plus">+</span>}
        </span>
      ))}
    </span>
  )
}

function ChallengeBlock({
  page,
  onCorrect,
}: {
  page: ChallengeMiniLessonPage<number>
  onCorrect?: () => void
}) {
  const [state, setState] = useSectionState(`lesson-3-challenge-${page.id}`, {
    answerInput: '',
    attemptedAnswers: [] as string[],
    repeatAnswer: '',
    submitted: false,
    isCorrect: null as boolean | null,
    wrongAttempts: 0,
  })
  const { answerInput, attemptedAnswers, repeatAnswer, submitted, isCorrect, wrongAttempts } = state

  function handleSubmit() {
    const normalizedAnswer = answerInput.trim()
    if (attemptedAnswers.includes(normalizedAnswer)) {
      setState({ repeatAnswer: normalizedAnswer })
      return
    }

    const correct = Number(answerInput) === page.answer
    setState({
      attemptedAnswers: [...attemptedAnswers, normalizedAnswer],
      repeatAnswer: '',
      submitted: true,
      isCorrect: correct,
      wrongAttempts: correct ? wrongAttempts : wrongAttempts + 1,
    })
    if (correct) {
      onCorrect?.()
    }
  }

  return (
    <div className="lesson-summary__practice">
      {page.body && <LessonText text={page.body} />}
      <ChallengeQuestion
        prompt={page.prompt}
        value={answerInput}
        onChange={(value) => setState({ answerInput: value, repeatAnswer: '' })}
        onSubmit={handleSubmit}
        submitted={submitted}
        allowRetry={submitted && isCorrect === false}
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

function TreasureBagPicker({ princessName }: Lesson3SectionProps) {
  const [state, setState] = useSectionState('lesson-3-treasure-bag-picker', {
    selectedTreasures: [] as Lesson3TreasureId[],
    foundBags: [] as FoundTreasureBag[],
    statusMessage: 'Tap two different treasures to make your first royal bag.',
    statusVariant: 'info' as 'info' | 'success' | 'error',
  })
  const { selectedTreasures, foundBags, statusMessage, statusVariant } = state

  function selectTreasure(treasureId: Lesson3TreasureId) {
    if (selectedTreasures.includes(treasureId) || selectedTreasures.length >= 2) return

    const nextSelection = [...selectedTreasures, treasureId]

    if (nextSelection.length === 1) {
      setState({
        selectedTreasures: nextSelection,
        statusVariant: 'info',
        statusMessage: 'Great first pick! Choose one more treasure for the bag.',
      })
      return
    }

    const key = makeTreasureKey(nextSelection)
    const sortedTreasures = sortTreasureIds(nextSelection)
    const duplicate = foundBags.some((bag) => bag.key === key)

    if (duplicate) {
      setState({
        selectedTreasures: nextSelection,
        statusVariant: 'error',
        statusMessage: `Royal repeat, ${princessName}! ${getTreasureLabel(sortedTreasures[0])} + ${getTreasureLabel(sortedTreasures[1])} is already in the list.`,
      })
      return
    }

    setState({
      selectedTreasures: nextSelection,
      foundBags: [...foundBags, { key, treasures: sortedTreasures }],
      statusVariant: 'success',
      statusMessage: `New treasure bag found! ${getTreasureLabel(sortedTreasures[0])} + ${getTreasureLabel(sortedTreasures[1])}.`,
    })
  }

  function clearBag() {
    setState({
      selectedTreasures: [],
      statusVariant: 'info',
      statusMessage: 'Choose two treasures for the next bag.',
    })
  }

  return (
    <div className="treasure-bag" aria-label="Royal treasure bag picker">
      <div className="treasure-bag__stage">
        <div className="treasure-bag__bag" aria-label="Current royal gift bag">
          {[0, 1].map((slotIndex) => {
            const treasureId = selectedTreasures[slotIndex]
            return (
              <div
                key={slotIndex}
                className={`treasure-bag__slot${treasureId ? ' treasure-bag__slot--filled' : ''}`}
              >
                {treasureId ? <TreasureJewel treasureId={treasureId} /> : <span>?</span>}
              </div>
            )
          })}
        </div>

        <div className="treasure-bag__choices" aria-label="Royal vault treasures">
          {lesson3Treasures.map((treasure) => {
            const selected = selectedTreasures.includes(treasure.id)
            return (
              <button
                key={treasure.id}
                type="button"
                className={`treasure-bag__choice${selected ? ' treasure-bag__choice--selected' : ''}`}
                onClick={() => selectTreasure(treasure.id)}
                disabled={selected || selectedTreasures.length >= 2}
                aria-label={`Choose ${treasure.ariaLabel}`}
              >
                <TreasureJewel treasureId={treasure.id} />
                <span>{treasure.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="treasure-bag__actions">
        <LessonButton
          label="Start a New Bag"
          variant="secondary"
          onClick={clearBag}
          disabled={selectedTreasures.length === 0}
        />
      </div>

      <FeedbackBanner variant={statusVariant} message={statusMessage} />

      <div className="treasure-bag__found" aria-live="polite">
        <h2>Unique treasure bags found</h2>
        {foundBags.length === 0 ? (
          <p className="treasure-bag__empty">No bags yet. Try Ruby + Sapphire!</p>
        ) : (
          <ol>
            {foundBags.map((bag) => (
              <li key={bag.key}>
                <TreasurePair treasures={bag.treasures} />
              </li>
            ))}
          </ol>
        )}
        <p className="treasure-bag__counter">
          Unique treasure bags found: <strong>{foundBags.length}</strong>
        </p>
      </div>
    </div>
  )
}

function DuplicateBagReveal() {
  return (
    <div className="same-bag-reveal" aria-label="Ruby and Sapphire make the same bag in either order">
      <div className="same-bag-reveal__card">
        <h2>Bag A</h2>
        <p>Ruby, then Sapphire</p>
        <TreasurePair treasures={['ruby', 'sapphire']} />
      </div>
      <div className="same-bag-reveal__stamp">Same bag</div>
      <div className="same-bag-reveal__card">
        <h2>Bag B</h2>
        <p>Sapphire, then Ruby</p>
        <TreasurePair treasures={['sapphire', 'ruby']} />
      </div>
    </div>
  )
}

function CountingShortcutVisual({
  collapsed,
  onToggleCollapsed,
  showShortcut,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
  showShortcut: boolean
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
        <h2>Ordered picks from 3 treasures</h2>
        <ol>
          {ORDERED_PICK_EXAMPLES.map((pick, index) => {
            const isRepeat = index % 2 === 1
            return (
              <li
                key={`${pick.first}-${pick.second}`}
                className={collapsed && isRepeat ? 'counting-shortcut__order--repeat' : ''}
              >
                <TreasurePair treasures={[pick.first, pick.second]} />
                {collapsed && isRepeat && <span className="counting-shortcut__repeat-label">repeat</span>}
              </li>
            )
          })}
        </ol>
      </div>

      <LessonButton
        label={collapsed ? 'Show Pick Orders' : 'Cross Out Royal Repeats'}
        variant="secondary"
        onClick={onToggleCollapsed}
      />

      {collapsed && (
        <div className="counting-shortcut__unique" aria-live="polite">
          <h2>Unique bags left</h2>
          <ol>
            {uniquePairs.map((pick) => (
              <li key={makeTreasureKey([pick.first, pick.second])}>
                <TreasurePair treasures={sortTreasureIds([pick.first, pick.second])} />
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
            <strong>20 / 2 = 10</strong> unique treasure bags
          </p>
        </div>
      ) : (
        <div className="counting-shortcut__equation">
          <p>Try the 5-treasure challenge below. The shortcut will appear after you answer.</p>
        </div>
      )}
    </div>
  )
}

function SmallerVaultVisual({ showBags }: { showBags: boolean }) {
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
      <div className="smaller-vault__treasures" aria-label="Four treasures in the smaller vault">
        {smallerVaultTreasures.map((treasureId) => (
          <div key={treasureId} className="smaller-vault__treasure">
            <TreasureJewel treasureId={treasureId} />
            <span>{getTreasureLabel(treasureId)}</span>
          </div>
        ))}
      </div>
      <div className="smaller-vault__bags">
        <h2>{showBags ? 'Unique bags in the smaller vault' : 'Check your answer first'}</h2>
        {showBags ? (
          <ol aria-live="polite">
            {uniqueBags.map((bag) => (
              <li key={makeTreasureKey(bag)}>
                <TreasurePair treasures={bag} />
              </li>
            ))}
          </ol>
        ) : (
          <p className="treasure-bag__empty">
            The finished bag list will appear after you solve the challenge.
          </p>
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
  const { updateScreen } = useLesson()

  return (
    <section className="lesson-screen lesson-3">
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0)} />
      <h1>{lesson3TreasureBagSection.heading}</h1>
      <LessonText text={lesson3TreasureBagSection.body(princessName)} />
      <TreasureBagPicker princessName={princessName} />
      <LessonButton
        label={lesson3TreasureBagSection.nextLabel}
        onClick={() => void updateScreen(2)}
      />
    </section>
  )
}

export function Lesson3SameBagLesson() {
  const { updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-3-same-bag', { pageIndex: 0 })
  const { pageIndex } = state

  return (
    <section className="lesson-screen lesson-3">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{lesson3SameBagMiniLesson.title}</h1>
      <DuplicateBagReveal />
      <ClickthroughMiniLesson
        miniLesson={lesson3SameBagMiniLesson}
        currentPageIndex={pageIndex}
        onPageChange={(nextPageIndex) => setState({ pageIndex: nextPageIndex })}
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
  const { updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-3-counting-shortcut', {
    challengeSolved: false,
    repeatsCollapsed: false,
  })
  const { challengeSolved, repeatsCollapsed } = state

  return (
    <section className="lesson-screen lesson-3">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{lesson3CountingSection.heading}</h1>
      <LessonText text={lesson3CountingSection.body(princessName)} />
      <CountingShortcutVisual
        collapsed={repeatsCollapsed}
        onToggleCollapsed={() => setState({ repeatsCollapsed: !repeatsCollapsed })}
        showShortcut={challengeSolved}
      />
      <ChallengeBlock
        page={lesson3CountingChallenge(princessName)}
        onCorrect={() => setState({ challengeSolved: true })}
      />
      <LessonButton
        label={lesson3CountingSection.nextLabel}
        onClick={() => void updateScreen(4)}
        disabled={!challengeSolved}
      />
    </section>
  )
}

export function Lesson3RoyalBagChallenge({ princessName }: Lesson3SectionProps) {
  const { updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-3-royal-bag-challenge', {
    challengeSolved: false,
  })
  const { challengeSolved } = state

  return (
    <section className="lesson-screen lesson-3">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(3)} />
      <h1>👑 Royal Bag Challenge</h1>
      <LessonText text="A smaller royal vault is ready. Use the same rule: count pick orders, then divide out the repeats." />
      <SmallerVaultVisual showBags={challengeSolved} />
      <ChallengeBlock
        page={lesson3RoyalBagChallenge(princessName)}
        onCorrect={() => setState({ challengeSolved: true })}
      />
      <LessonButton label="Final Order Check" onClick={() => void updateScreen(5)} disabled={!challengeSolved} />
    </section>
  )
}

export function Lesson3FinalSort({ princessName }: Lesson3SectionProps) {
  const { updateLesson, updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-3-final-sort', {
    answers: {} as Record<string, Lesson3SortAnswer>,
  })
  const { answers } = state
  const allCorrect = lesson3FinalSortCards.every((card) => answers[card.id] === card.correctAnswer)

  function setCardAnswer(cardId: string, answer: Lesson3SortAnswer) {
    setState({ answers: { ...answers, [cardId]: answer } })
  }

  async function handleFinish() {
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
  }

  return (
    <section className="lesson-screen lesson-3">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(4)} />
      <h1>Arrangement or Combination?</h1>
      <LessonText text="Ask the royal counting question: **Does order matter?** Sort each story before finishing the lesson." />
      <div className="combination-sort" aria-label="Sort stories by whether order matters">
        {lesson3FinalSortCards.map((card) => (
          <SortCard
            key={card.id}
            card={card}
            selectedAnswer={answers[card.id]}
            onSelect={(answer) => setCardAnswer(card.id, answer)}
          />
        ))}
      </div>
      {allCorrect && <FeedbackBanner variant="success" message={lesson3CompletionMessage(princessName)} />}
      <LessonButton label="Finish Lesson" onClick={handleFinish} disabled={!allCorrect} />
    </section>
  )
}
