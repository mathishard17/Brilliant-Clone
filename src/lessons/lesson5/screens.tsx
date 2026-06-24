import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import '../../screens/screens.css'
import { ChallengeQuestion } from '../../components/ChallengeQuestion'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
import { ScreenBackButton } from '../../components/ScreenBackButton'
import { useLesson } from '../../hooks/useLesson'
import { useSectionState } from '../../hooks/useSectionState'
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

function isChallengePage(page: Lesson5MiniLessonPage): page is Lesson5ChallengePage {
  return page.type === 'challenge'
}

type Lesson5ExplanationPage = Extract<Lesson5MiniLessonPage, { type: 'explanation' }>

function makeSpinnerSpace(id: string, kind: Lesson5OutcomeKind): Lesson5SpinnerSpace {
  return {
    id,
    kind,
    label: KIND_LABELS[kind],
    winner: WINNER_BY_KIND[kind],
  }
}

function getCarnivalSpinnerBackground(spaces: readonly Lesson5SpinnerSpace[]): string {
  const slice = 100 / spaces.length
  return `conic-gradient(from 0deg, ${spaces
    .map((space, index) => {
      const start = index * slice
      const end = (index + 1) * slice
      const separatorStart = Math.max(start, end - 0.55)
      return `${OUTCOME_COLORS[space.kind]} ${start}% ${separatorStart}%, rgb(255 255 255 / 0.78) ${separatorStart}% ${end}%`
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
            '--lesson-5-spinner-bg': getCarnivalSpinnerBackground(spaces),
            '--lesson-5-spinner-rotation': `${spinRotation}deg`,
          } as CSSProperties
        }
      >
        <div className="lesson-5-spinner__pointer" aria-hidden="true" />
        <div className="lesson-5-spinner__rotor">
          <div className="lesson-5-spinner__wheel" aria-hidden="true" />
          {spaces.map((space, index) => {
            const selected = selectedIndexes.includes(index) || selectedIndex === index
            const label = space.shortLabel ?? space.label
            const angle = index * slice + slice / 2
            return (
              <button
                key={space.id}
                type="button"
                className={`lesson-5-spinner__space lesson-5-spinner__space--${space.kind}${selected ? ' lesson-5-spinner__space--selected' : ''}`}
                style={
                  {
                    '--lesson-5-space-angle': `${angle}deg`,
                  } as CSSProperties
                }
                onClick={interactive ? () => handleSelect(index) : undefined}
                disabled={!interactive}
                aria-pressed={interactive ? selected : undefined}
                aria-label={`${space.label} spinner space`}
              >
                <span className="lesson-5-spinner__symbol" aria-hidden="true">
                  {OUTCOME_SYMBOLS[space.kind]}
                </span>
                <span>{label}</span>
              </button>
            )
          })}
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
            return (
              <li key={`${space.id}-${listIndex}`} className={`lesson-5-tray__card lesson-5-tray__card--${space.kind}`}>
                <span aria-hidden="true">{OUTCOME_SYMBOLS[space.kind]}</span>
                <span>{space.label}</span>
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
  const total = spaces.length
  const princessCount = spaces.filter((space) => space.winner === 'princess').length
  const opponentCount = spaces.filter((space) => space.winner === opponent).length
  const noWinnerCount = spaces.filter((space) => space.winner === 'none').length
  const fair = princessCount === opponentCount
  const opponentLabel = opponent === 'dragon' ? 'Dragon' : 'Knight'

  return (
    <div className="lesson-5-meter" aria-live="polite">
      <h2>Fairness meter</h2>
      <div className="lesson-5-meter__rows">
        <div className="lesson-5-meter__row">
          <span>Princess</span>
          <div className="lesson-5-meter__bar" aria-hidden="true">
            <span style={{ width: `${(princessCount / total) * 100}%` }} />
          </div>
          <strong>{princessCount}/{total}</strong>
        </div>
        <div className="lesson-5-meter__row">
          <span>{opponentLabel}</span>
          <div className="lesson-5-meter__bar lesson-5-meter__bar--opponent" aria-hidden="true">
            <span style={{ width: `${(opponentCount / total) * 100}%` }} />
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
        <p className={`lesson-5-meter__result ${fair ? 'lesson-5-meter__result--fair' : ''}`}>
          {fair ? 'Fair: same chance.' : 'Unfair: one player has more winning spaces.'}
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
        <FeedbackBanner variant={isCorrect ? 'success' : 'error'} message={feedback} />
      )}
      {isCorrect === false && wrongAttempts >= 3 && challenge.feedback?.solution && (
        <FeedbackBanner variant="info" message={challenge.feedback.solution} />
      )}
    </div>
  )
}

function MiniLessonPageContent({ page }: { page: Lesson5ExplanationPage }) {
  return (
    <div className="lesson-5-mini-page">
      {page.title && <h2>{page.title}</h2>}
      <LessonText text={page.body} className="anchor-lesson__text anchor-lesson__text--enter" />
      {page.equation && <p className="lesson-summary__equation">{page.equation}</p>}
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
  const selectedIndex = TWO_SPINNER_CHOICES.indexOf(selected)
  const [spinTurns, setSpinTurns] = useState(0)
  const spinRotation = spinTurns * 360 - (selectedIndex * 180 + 90)

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
        aria-label={`${label} with Crown and Dragon`}
      >
        <div className="lesson-5-mini-spinner__rotor">
          <div className="lesson-5-mini-spinner__wheel-bg" aria-hidden="true" />
          {TWO_SPINNER_CHOICES.map((choice) => (
            <span
              key={choice}
              className={`lesson-5-mini-spinner__half lesson-5-mini-spinner__half--${choice}${selected === choice ? ' lesson-5-mini-spinner__half--selected' : ''}`}
            >
              <span aria-hidden="true">{OUTCOME_SYMBOLS[choice]}</span>
              {KIND_LABELS[choice]}
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
    <div className="lesson-5-two-spinners" aria-label="Two interactive royal spinners">
      <div className="lesson-5-two-spinners__wheels">
        <TinyRoyalSpinner label="Spinner A" selected={spinnerA} onSpin={spinA} />
        <TinyRoyalSpinner label="Spinner B" selected={spinnerB} onSpin={spinB} />
      </div>

      <p className="lesson-5-two-spinners__current" aria-live="polite">
        Current spin: <strong>{OUTCOME_SYMBOLS[spinnerA]} {KIND_LABELS[spinnerA]} + {OUTCOME_SYMBOLS[spinnerB]} {KIND_LABELS[spinnerB]}</strong>
        {spinnerA === spinnerB ? ' — Match!' : ' — Not a match.'}
      </p>

      <div className="lesson-5-two-spinners__outcomes">
        <h3>All possible pairs</h3>
        <ol>
          {outcomes.map(([first, second]) => (
            <li
              key={`${first}-${second}`}
              className={first === second ? 'lesson-5-two-spinners__outcome--match' : ''}
            >
              <span className="lesson-5-two-spinners__pair">
                <span className={`lesson-5-two-spinners__token lesson-5-two-spinners__token--${first}`}>
                  <span aria-hidden="true">{OUTCOME_SYMBOLS[first]}</span>
                  {KIND_LABELS[first]}
                </span>
                <span className="lesson-5-two-spinners__plus">+</span>
                <span className={`lesson-5-two-spinners__token lesson-5-two-spinners__token--${second}`}>
                  <span aria-hidden="true">{OUTCOME_SYMBOLS[second]}</span>
                  {KIND_LABELS[second]}
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
  const { updateScreen } = useLesson()
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
    <section className="lesson-screen lesson-5">
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0)} />
      <h1>{section.heading}</h1>
      <LessonText text={section.body(princessName)} />

      <div className="lesson-screen__play-area">
        <CarnivalSpinner
          spaces={spinnerInspectorSpaces}
          selectedIndexes={selectedIndexes}
          onSelect={handleSelect}
          onSpin={handleSelect}
          ariaLabel="Four equal carnival spinner spaces"
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

      <Lesson5ChallengeBlock challenge={challenge1(princessName)} onCorrect={() => setState({ challengeCorrect: true })} />
      {challengeCorrect && <LessonButton label="Build the sample space" onClick={() => void updateScreen(2)} />}
    </section>
  )
}

export function Lesson5SpinnerInspector({ princessName }: Lesson5SectionProps) {
  const { updateScreen } = useLesson()
  const miniLesson = useMemo(() => sampleSpaceMiniLesson(princessName), [princessName])
  const [state, setState] = useSectionState('lesson-5-spinner-inspector', {
    pageIndex: 0,
    correctPageIds: [] as string[],
  })
  const { pageIndex, correctPageIds } = state

  function handlePageChange(nextPageIndex: number) {
    setState({ pageIndex: nextPageIndex })
  }

  function markCorrect(pageId: string) {
    setState({
      correctPageIds: correctPageIds.includes(pageId) ? correctPageIds : [...correctPageIds, pageId],
    })
  }

  return (
    <section className="lesson-screen lesson-5">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{miniLesson.title}</h1>
      <SampleSpaceTray spaces={spinnerInspectorSpaces} emptyText="The royal scribe is ready to list outcomes." />
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
              challenge={page}
              onCorrect={() => markCorrect(page.id)}
            />
          ) : (
            <MiniLessonPageContent page={page} />
          )
        }
      />
    </section>
  )
}

export function Lesson5FairnessCheck({ princessName }: Lesson5SectionProps) {
  const { updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-5-fairness-check', {
    challengeCorrect: false,
  })
  const { challengeCorrect } = state
  const section = lesson5Sections.fairnessCheck

  return (
    <section className="lesson-screen lesson-5">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{section.heading}</h1>
      <LessonText text={section.body(princessName)} />

      <div className="lesson-screen__play-area">
        <CarnivalSpinner
          spaces={unfairSpinnerSpaces}
          ariaLabel="Carnival spinner with Crown, Crown, Dragon, and Jewel"
        />
        <FairnessMeter
          spaces={unfairSpinnerSpaces}
          opponent="dragon"
          showResult={challengeCorrect}
        />
      </div>

      <Lesson5ChallengeBlock challenge={challenge3(princessName)} onCorrect={() => setState({ challengeCorrect: true })} />
      {challengeCorrect && <LessonButton label="Fix the game" onClick={() => void updateScreen(4)} />}
    </section>
  )
}

export function Lesson5FairSpinnerBuilder({ princessName }: Lesson5SectionProps) {
  const { updateScreen } = useLesson()
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
        return makeSpinnerSpace(space.id, nextKind)
      }),
    })
  }

  function resetBuilder() {
    setState({ spaces: builderStartingSpaces })
  }

  return (
    <section className="lesson-screen lesson-5">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(3)} />
      <h1>{section.heading}</h1>
      <LessonText text={section.body(princessName)} />

      <div className="lesson-screen__play-area">
        <div className="lesson-5-builder">
          <CarnivalSpinner
            spaces={spaces}
            onSelect={cycleSpace}
            ariaLabel="Editable four-space carnival spinner"
          />
          <LessonButton label="Reset spinner" variant="secondary" onClick={resetBuilder} />
        </div>
        <FairnessMeter spaces={spaces} opponent="dragon" />
      </div>

      {isFair && (
        <FeedbackBanner
          variant="success"
          message="The booth is fair now: Princess and Dragon each have **2 out of 4** winning spaces."
        />
      )}

      <Lesson5ChallengeBlock challenge={challenge4(princessName)} onCorrect={() => setState({ challengeCorrect: true })} />
      {challengeCorrect && !isFair && (
        <FeedbackBanner
          variant="info"
          message="Great answer. Now repaint the spinner so Princess and Dragon each have the same number of winning spaces."
        />
      )}
      {challengeCorrect && isFair && <LessonButton label="Royal review" onClick={() => void updateScreen(5)} />}
    </section>
  )
}

export function Lesson5RoyalReview({ princessName }: Lesson5SectionProps) {
  const { updateLesson, updateScreen } = useLesson()
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
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
  }

  return (
    <section className="lesson-screen lesson-5">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(4)} />
      <h1>{section.heading}</h1>
      <LessonText text={section.body(princessName)} />
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
                challenge={page}
                onCorrect={() => markCorrect(page.id)}
              >
                {page.id === 'lesson-5-check-built-game' ? (
                  <>
                    <CarnivalSpinner
                      spaces={sixSpaceFairSpinnerSpaces}
                      ariaLabel="Six-space carnival spinner with stars and shields"
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
