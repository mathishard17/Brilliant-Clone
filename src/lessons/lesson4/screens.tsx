import type { CSSProperties } from 'react'
import '../../screens/screens.css'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
import { ScreenBackButton } from '../../components/ScreenBackButton'
import { useLesson } from '../../hooks/useLesson'
import { useSectionState } from '../../hooks/useSectionState'
import {
  certainVisual,
  compareSpinnerVisual,
  finaleVisual,
  impossibleVisual,
  prizeDefinitions,
  rubySpinnerVisual,
  screen1Copy,
  screen1Visual,
  screen2KeyLine,
  screen2MiniLesson,
  screen3Copy,
  screen4MiniLesson,
  screen5Copy,
  type ChoiceChallenge,
  type Lesson4MiniLessonPage,
  type PrizeKind,
  type SpinnerSpace,
  type SpinnerVisual,
} from './copy'

interface Lesson4ScreenProps {
  princessName: string
}

const prizeColors: Record<PrizeKind, string> = {
  crown: '#facc15',
  ruby: '#fb7185',
  gown: '#c084fc',
  dragon: '#86efac',
  star: '#fde68a',
  sparkle: '#93c5fd',
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

function getSpinnerBackground(spaces: readonly SpinnerSpace[]): string {
  const slice = 100 / spaces.length
  const gradient = spaces
    .map((space, index) => {
      const start = index * slice
      const end = (index + 1) * slice
      const separatorStart = Math.max(start, end - 0.45)
      return `${prizeColors[space.prize]} ${start}% ${separatorStart}%, rgb(255 255 255 / 0.78) ${separatorStart}% ${end}%`
    })
    .join(', ')

  return `conic-gradient(from 0deg, ${gradient})`
}

function addSolvedChallengeId(solvedChallengeIds: readonly string[], challengeId: string): string[] {
  return solvedChallengeIds.includes(challengeId)
    ? [...solvedChallengeIds]
    : [...solvedChallengeIds, challengeId]
}

function ChanceSpinner({ visual }: { visual: SpinnerVisual }) {
  const [state, setState] = useSectionState(`lesson-4-spinner-${visual.id}`, {
    selectedPrize: visual.targetPrize ?? visual.spaces[0].prize,
    landedIndex: null as number | null,
    spinRotation: 0,
  })
  const { selectedPrize, landedIndex, spinRotation } = state
  const selectedPrizeDefinition = prizeDefinitions[selectedPrize]
  const selectedCount = countPrize(visual.spaces, selectedPrize)
  const visiblePrizes = getVisiblePrizes(visual)

  function handleSpin() {
    const nextIndex = landedIndex === null ? 0 : (landedIndex + 3) % visual.spaces.length
    const slice = 360 / visual.spaces.length
    const segmentCenter = nextIndex * slice + slice / 2
    const currentMod = ((spinRotation % 360) + 360) % 360
    const targetMod = (360 - segmentCenter) % 360
    const delta = (targetMod - currentMod + 360) % 360

    setState({
      landedIndex: nextIndex,
      selectedPrize: visual.spaces[nextIndex].prize,
      spinRotation: spinRotation + 720 + delta,
    })
  }

  return (
    <div className="chance-spinner-card">
      <div className="chance-spinner-card__header">
        <h2>{visual.title}</h2>
        <p>{visual.helperText}</p>
      </div>

      <div className="chance-spinner-wrap">
        <div
          className="chance-spinner"
          style={
            {
              '--spinner-bg': getSpinnerBackground(visual.spaces),
              '--spinner-rotation': `${spinRotation}deg`,
            } as CSSProperties
          }
          aria-label={`${visual.title} with ${visual.spaces.length} equal spaces`}
        >
          <div className="chance-spinner__rotor">
            <div className="chance-spinner__wheel" aria-hidden="true" />
            {visual.spaces.map((space, index) => {
              const prize = prizeDefinitions[space.prize]
              const angle = index * (360 / visual.spaces.length) + 180 / visual.spaces.length
              const isSelected = selectedPrize === space.prize
              const isLanded = landedIndex === index

              return (
                <button
                  key={space.id}
                  type="button"
                  className={`chance-spinner__space chance-spinner__space--${space.prize}${isSelected ? ' chance-spinner__space--selected' : ''}${isLanded ? ' chance-spinner__space--landed' : ''}`}
                  style={
                    {
                      '--chance-space-angle': `${angle}deg`,
                    } as CSSProperties
                  }
                  onClick={() => setState({ selectedPrize: space.prize })}
                  aria-label={`Inspect ${prize.label} space ${index + 1}`}
                >
                  <span aria-hidden="true">{prize.icon}</span>
                  <span>{prize.label}</span>
                </button>
              )
            })}
          </div>
          <div className="chance-spinner__arrow" aria-hidden="true" />
          <div className="chance-spinner__hub" aria-hidden="true">
            ✦
          </div>
        </div>
      </div>

      <div className="chance-spinner-card__controls">
        <LessonButton label="Spin once" variant="secondary" onClick={handleSpin} />
        <div className="chance-spinner-card__prizes" aria-label="Prize counts">
          {visiblePrizes.map((prize) => {
            const definition = prizeDefinitions[prize]
            return (
              <button
                key={prize}
                type="button"
                className={`chance-spinner-card__prize${selectedPrize === prize ? ' chance-spinner-card__prize--selected' : ''}`}
                onClick={() => setState({ selectedPrize: prize })}
              >
                <span aria-hidden="true">{definition.icon}</span>
                {definition.label}
              </button>
            )
          })}
        </div>
      </div>

      <p className="chance-spinner-card__count" aria-live="polite">
        {selectedPrizeDefinition.icon} {selectedPrizeDefinition.label} spaces:{' '}
        <strong>{selectedCount}</strong> / Total spaces: <strong>{visual.spaces.length}</strong>
      </p>
    </div>
  )
}

function ChoiceChallengeCard({
  challenge,
  onCorrect,
}: {
  challenge: ChoiceChallenge
  onCorrect?: () => void
}) {
  const [state, setState] = useSectionState(`lesson-4-choice-${challenge.id}`, {
    selectedAnswer: null as string | null,
    attemptedAnswers: [] as string[],
    repeatMessage: null as string | null,
    wrongAttempts: 0,
  })
  const { selectedAnswer, attemptedAnswers, repeatMessage, wrongAttempts } = state
  const isCorrect = selectedAnswer === challenge.answer
  const showFeedback = selectedAnswer !== null

  function handleAnswer(answer: string) {
    if (attemptedAnswers.includes(answer)) {
      setState({ repeatMessage: `You already tried **${answer}**. Try a different answer!` })
      return
    }

    setState({
      attemptedAnswers: [...attemptedAnswers, answer],
      repeatMessage: null,
      selectedAnswer: answer,
      wrongAttempts: answer === challenge.answer ? wrongAttempts : wrongAttempts + 1,
    })
    if (answer === challenge.answer) {
      onCorrect?.()
      return
    }
  }

  return (
    <div className="chance-challenge">
      <p className="chance-challenge__prompt">{challenge.prompt}</p>
      <div className="chance-challenge__choices" role="group" aria-label={challenge.prompt}>
        {challenge.options.map((option) => (
          <button
            key={option}
            type="button"
            className={`chance-challenge__choice${selectedAnswer === option ? ' chance-challenge__choice--selected' : ''}`}
            onClick={() => handleAnswer(option)}
            disabled={isCorrect}
          >
            {option}
          </button>
        ))}
      </div>

      {showFeedback && (
        <FeedbackBanner
          variant={isCorrect ? 'success' : 'error'}
          message={
            isCorrect
              ? challenge.feedback.correct
              : wrongAttempts >= 2
                ? challenge.feedback.solution
                : challenge.feedback.tryAgain
          }
        />
      )}
      {repeatMessage && <FeedbackBanner variant="info" message={repeatMessage} />}
    </div>
  )
}

function MiniLessonPage({
  page,
  onCorrect,
}: {
  page: Lesson4MiniLessonPage
  onCorrect: () => void
}) {
  if (isChallengePage(page)) {
    return (
      <div className="chance-mini-lesson__page">
        <ChanceSpinner visual={page.visual} />
        <ChoiceChallengeCard challenge={page} onCorrect={onCorrect} />
      </div>
    )
  }

  return (
    <div className="chance-mini-lesson__page">
      <LessonText text={page.body} className="anchor-lesson__text anchor-lesson__text--enter" />
      {page.equation && (
        <div className="chance-equation" aria-label="Chance equation">
          {page.equation.split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}

export function Lesson4OneSpin({ princessName }: Lesson4ScreenProps) {
  const { updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-4-one-spin', { challengeCorrect: false })
  const { challengeCorrect } = state

  return (
    <section className="lesson-screen lesson-4">
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0)} />
      <h1>{screen1Copy.heading}</h1>
      <LessonText text={screen1Copy.body(princessName)} className="anchor-lesson__text" />
      <ChanceSpinner visual={screen1Visual} />
      <ChoiceChallengeCard
        challenge={screen1Copy.challenge}
        onCorrect={() => setState({ challengeCorrect: true })}
      />
      {challengeCorrect && (
        <>
          <FeedbackBanner variant="info" message={screen1Copy.keyLine} />
          <LessonButton label="Find winning spaces" onClick={() => void updateScreen(2)} />
        </>
      )}
    </section>
  )
}

export function Lesson4WinningSpaces() {
  const { updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-4-winning-spaces', {
    pageIndex: 0,
    challengeCorrect: false,
    solvedChallengeIds: [] as string[],
  })
  const { pageIndex, challengeCorrect, solvedChallengeIds } = state

  function handlePageChange(nextPageIndex: number) {
    setState({ pageIndex: nextPageIndex })
  }

  function isPageSolved(page: Lesson4MiniLessonPage) {
    return (
      isChallengePage(page) &&
      (solvedChallengeIds.includes(page.id) || (challengeCorrect && page.id === 'ruby-chance'))
    )
  }

  function handleChallengeCorrect(challengeId: string) {
    setState({
      challengeCorrect: true,
      solvedChallengeIds: addSolvedChallengeId(solvedChallengeIds, challengeId),
    })
  }

  return (
    <section className="lesson-screen lesson-4">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{screen2MiniLesson.title}</h1>
      {screen2MiniLesson.description && (
        <LessonText text={screen2MiniLesson.description} className="anchor-lesson__text" />
      )}
      {pageIndex < 2 && <ChanceSpinner visual={rubySpinnerVisual} />}
      <ClickthroughMiniLesson
        miniLesson={screen2MiniLesson}
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
            onCorrect={() => handleChallengeCorrect(page.id)}
          />
        )}
      />
      {isPageSolved(screen2MiniLesson.pages[2]) && (
        <FeedbackBanner variant="info" message={screen2KeyLine} />
      )}
    </section>
  )
}

export function Lesson4MoreLikely() {
  const { updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-4-more-likely', {
    compareCorrect: false,
    crownCorrect: false,
  })
  const { compareCorrect, crownCorrect } = state

  return (
    <section className="lesson-screen lesson-4">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{screen3Copy.heading}</h1>
      <LessonText text={screen3Copy.body} className="anchor-lesson__text" />
      <ChanceSpinner visual={compareSpinnerVisual} />
      <ChoiceChallengeCard
        challenge={screen3Copy.compareChallenge}
        onCorrect={() => setState({ compareCorrect: true })}
      />
      {compareCorrect && (
        <ChoiceChallengeCard
          challenge={screen3Copy.crownChallenge}
          onCorrect={() => setState({ crownCorrect: true })}
        />
      )}
      {compareCorrect && crownCorrect && (
        <LessonButton label="See impossible magic" onClick={() => void updateScreen(4)} />
      )}
    </section>
  )
}

export function Lesson4ImpossibleCertain() {
  const { updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-4-impossible-certain', {
    pageIndex: 0,
    challengeCorrect: false,
    solvedChallengeIds: [] as string[],
  })
  const { pageIndex, challengeCorrect, solvedChallengeIds } = state

  function handlePageChange(nextPageIndex: number) {
    setState({ pageIndex: nextPageIndex })
  }

  function isPageSolved(page: Lesson4MiniLessonPage) {
    return (
      isChallengePage(page) &&
      (solvedChallengeIds.includes(page.id) ||
        (challengeCorrect && screen4MiniLesson.pages[pageIndex]?.id === page.id))
    )
  }

  function handleChallengeCorrect(challengeId: string) {
    setState({
      challengeCorrect: true,
      solvedChallengeIds: addSolvedChallengeId(solvedChallengeIds, challengeId),
    })
  }

  return (
    <section className="lesson-screen lesson-4">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(3)} />
      <h1>{screen4MiniLesson.title}</h1>
      {pageIndex === 0 && <ChanceSpinner visual={impossibleVisual} />}
      {pageIndex === 2 && <ChanceSpinner visual={certainVisual} />}
      <ClickthroughMiniLesson
        miniLesson={screen4MiniLesson}
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
            onCorrect={() => handleChallengeCorrect(page.id)}
          />
        )}
      />
    </section>
  )
}

export function Lesson4Finale() {
  const { updateLesson, updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-4-finale', {
    crownCorrect: false,
    compareCorrect: false,
  })
  const { crownCorrect, compareCorrect } = state

  async function handleFinish() {
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
  }

  return (
    <section className="lesson-screen lesson-4">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(4)} />
      <h1>{screen5Copy.heading}</h1>
      <LessonText text={screen5Copy.body} className="anchor-lesson__text" />
      <ChanceSpinner visual={finaleVisual} />
      <ChoiceChallengeCard
        challenge={screen5Copy.crownChallenge}
        onCorrect={() => setState({ crownCorrect: true })}
      />
      {crownCorrect && (
        <ChoiceChallengeCard
          challenge={screen5Copy.rubyDragonChallenge}
          onCorrect={() => setState({ compareCorrect: true })}
        />
      )}
      {crownCorrect && compareCorrect && (
        <>
          <FeedbackBanner variant="info" message={screen5Copy.finalMessage} />
          <LessonButton label="Finish Lesson" onClick={handleFinish} />
        </>
      )}
    </section>
  )
}
