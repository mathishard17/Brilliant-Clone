import '../../screens/screens.css'
import { ChallengeQuestion } from '../../components/ChallengeQuestion'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { DefaultInteractiveVisualization } from '../../components/DefaultInteractiveVisualization'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
import { ScreenBackButton } from '../../components/ScreenBackButton'
import {
  lesson2Clickthrough,
  lesson2FinalClickthrough,
  lesson2VisualizationSections,
  type Lesson2ClickthroughPage,
  type Lesson2FinalPage,
  type Lesson2VisualizationSection,
} from './copy'
import { useLesson } from '../../hooks/useLesson'
import { useSectionState } from '../../hooks/useSectionState'

interface Lesson2SectionProps {
  princessName: string
}

type JewelMode = 'normal' | 'restricted' | 'identical'

const ROYAL_JEWELS = [
  { id: 'ruby', value: 'ruby', label: 'Ruby jewel', className: 'marble-visualization__marble--red' },
  { id: 'sapphire', value: 'sapphire', label: 'Sapphire jewel', className: 'marble-visualization__marble--blue' },
  { id: 'gold', value: 'gold', label: 'Gold jewel', className: 'marble-visualization__marble--gold' },
] as const

const IDENTICAL_RUBY_JEWELS = [
  { id: 'ruby-1', value: 'ruby', label: 'Ruby jewel', className: 'marble-visualization__marble--red' },
  { id: 'ruby-2', value: 'ruby', label: 'Ruby jewel', className: 'marble-visualization__marble--red' },
  { id: 'sapphire', value: 'sapphire', label: 'Sapphire jewel', className: 'marble-visualization__marble--blue' },
] as const

type Jewel = (typeof ROYAL_JEWELS)[number] | (typeof IDENTICAL_RUBY_JEWELS)[number]

interface FoundJewelOrder {
  key: string
  order: string[]
  valid: boolean
}

interface MarblePermutationVisualizationProps extends Lesson2SectionProps {
  mode: JewelMode
  onSolved: () => void
}

function MarblePermutationVisualization({
  princessName,
  mode,
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
  const { placedMarbles, uniqueOrders, answerInput, submitted, isCorrect, wrongAttempts } = state
  const jewels: readonly Jewel[] = mode === 'identical' ? IDENTICAL_RUBY_JEWELS : ROYAL_JEWELS
  const targetAnswer = mode === 'normal' ? 6 : mode === 'restricted' ? 4 : 3
  const validOrdersFound = uniqueOrders.filter((order) => order.valid).length
  const answerMatchesTarget = Number(answerInput) === targetAnswer
  const visualSolved = validOrdersFound >= targetAnswer
  const prompt =
    mode === 'normal'
      ? 'How many different royal display orders can you make with 3 different jewels?'
      : mode === 'restricted'
        ? 'How many valid royal display orders are there if Ruby cannot go first?'
        : 'How many displays look different with 2 matching Rubies and 1 Sapphire?'
  const emptyText =
    mode === 'identical'
      ? 'Complete a 3-jewel lineup to record the visible order here.'
      : 'Complete a 3-jewel lineup to record it here.'
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
  }

  function getMarble(marbleId: string) {
    return jewels.find((marble) => marble.id === marbleId)
  }

  function renderMarbleSequence(order: string[]) {
    return order.map((marbleId) => {
      const marble = getMarble(marbleId)
      if (!marble) return null
      return (
        <span
          key={marbleId}
          className={`marble-visualization__marble marble-visualization__marble--small ${marble.className}`}
          aria-label={marble.label}
        />
      )
    })
  }

  return (
    <div className="marble-visualization">
      <div className="marble-visualization__spots" aria-label="Three blank royal jewel display spots">
        {Array.from({ length: jewels.length }, (_, index) => {
          const marble = placedMarbles[index] ? getMarble(placedMarbles[index]) : null
          const restrictedFirstSpot = mode === 'restricted' && index === 0
          return (
            <div
              key={index}
              className={`marble-visualization__spot${marble ? ' marble-visualization__spot--filled' : ''}${restrictedFirstSpot ? ' marble-visualization__spot--restricted' : ''}`}
            >
              {marble && (
                <span
                  className={`marble-visualization__marble ${marble.className}`}
                  aria-label={marble.label}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="marble-visualization__choices" aria-label="Available royal jewels">
        {jewels.map((marble) => {
          const used = placedMarbles.includes(marble.id)
          return (
            <button
              key={marble.id}
              type="button"
              className={`marble-visualization__choice ${used ? 'marble-visualization__choice--used' : ''}`}
              onClick={() => placeMarble(marble.id)}
              disabled={used || placedMarbles.length >= jewels.length}
              aria-label={`Place ${marble.label}`}
            >
              <span className={`marble-visualization__marble ${marble.className}`} />
              <span>{marble.label}</span>
            </button>
          )
        })}
      </div>

      <LessonButton label="Clear lineup" variant="secondary" onClick={resetMarbles} />

      <div className="marble-visualization__orders" aria-live="polite">
        <h2>{mode === 'identical' ? 'Unique visible orders found' : 'Unique orderings found'}</h2>
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
                    {foundOrder.valid ? 'Valid' : 'Ruby first is not allowed'}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
        <p className="marble-visualization__counter">
          {counterLabel}: <strong>{validOrdersFound}</strong>
        </p>
      </div>

      <ChallengeQuestion
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
          message={
            isCorrect
              ? mode === 'normal'
                ? `Exactly, ${princessName}! **3 × 2 × 1 = 6** royal jewel lineups.`
                : mode === 'restricted'
                  ? `Exactly, ${princessName}! Ruby cannot go first, so **2 × 2 × 1 = 4** valid lineups.`
                  : `Exactly, ${princessName}! The two Rubies match, so there are **3** visible displays.`
              : answerMatchesTarget && !visualSolved
                ? `That number is right, ${princessName}! Build all **${targetAnswer}** matching jewel lineups above, then submit again.`
                : answerMatchesTarget && visualSolved
                  ? `Great visual proof, ${princessName}! Submit the answer again to unlock Continue.`
              : wrongAttempts >= 2
                ? mode === 'normal'
                  ? `Not quite, ${princessName}! There are **3** ways to pick the first jewel. How about the second? The last?`
                  : mode === 'restricted'
                    ? `Not quite, ${princessName}! For the first spot, Ruby is banned, so there are **2** choices. Then there are **2** choices, then **1**.`
                    : `Not quite, ${princessName}! There are only **3** visible places the Sapphire can go: first, middle, or last.`
                : `Try again, ${princessName}!`
          }
        />
      )}
    </div>
  )
}

interface VisualizationSectionProps extends Lesson2SectionProps {
  section: Lesson2VisualizationSection
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
  section,
  currentScreen,
  nextScreen,
}: VisualizationSectionProps) {
  const { updateScreen } = useLesson()
  const [sectionState, setSectionState] = useSectionState(`lesson-2-section-${currentScreen}`, {
    challengeSolved: false,
  })
  const challengeSolved = sectionState.challengeSolved
  const backScreen = currentScreen === 1 ? 0 : currentScreen - 1
  const visualization = (() => {
    if (section.visualization === 'marble-permutations') {
      return (
        <MarblePermutationVisualization
          princessName={princessName}
          mode="normal"
          onSolved={() => setSectionState({ challengeSolved: true })}
        />
      )
    }
    if (section.visualization === 'restricted-jewel-permutations') {
      return (
        <MarblePermutationVisualization
          princessName={princessName}
          mode="restricted"
          onSolved={() => setSectionState({ challengeSolved: true })}
        />
      )
    }
    if (section.visualization === 'identical-jewel-permutations') {
      return (
        <MarblePermutationVisualization
          princessName={princessName}
          mode="identical"
          onSolved={() => setSectionState({ challengeSolved: true })}
        />
      )
    }
    return <DefaultInteractiveVisualization />
  })()

  return (
    <section className="lesson-screen lesson-2">
      <ScreenBackButton
        label={currentScreen === 1 ? '← Back to Academy' : '← Back'}
        onClick={() => void updateScreen(backScreen)}
      />
      <h1>{section.heading}</h1>
      <LessonText text={section.body(princessName)} />
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
      section={lesson2VisualizationSections[1]}
      currentScreen={1}
      nextScreen={2}
    />
  )
}

export function Lesson2Clickthrough() {
  const { updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-2-factorials', {
    pageIndex: 0,
    answerInput: '',
    submitted: false,
    isCorrect: null as boolean | null,
    wrongAttempts: 0,
  })
  const { pageIndex, answerInput, submitted, isCorrect, wrongAttempts } = state

  function handleSubmit(page: Extract<Lesson2ClickthroughPage, { type: 'challenge' }>) {
    const correct = Number(answerInput) === page.answer
    setState({
      submitted: true,
      isCorrect: correct,
      wrongAttempts: correct ? wrongAttempts : wrongAttempts + 1,
    })
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
    <section className="lesson-screen lesson-2">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{lesson2Clickthrough.title}</h1>
      <ClickthroughMiniLesson
        miniLesson={lesson2Clickthrough}
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
      section={lesson2VisualizationSections[3]}
      currentScreen={3}
      nextScreen={4}
    />
  )
}

export function Lesson2VisualizationThree({ princessName }: Lesson2SectionProps) {
  return (
    <Lesson2VisualizationSection
      princessName={princessName}
      section={lesson2VisualizationSections[4]}
      currentScreen={4}
      nextScreen={5}
    />
  )
}

export function Lesson2FinalClickthrough() {
  const { updateLesson, updateScreen } = useLesson()
  const [state, setState] = useSectionState('lesson-2-final-check', {
    pageIndex: 0,
    answerInput: '',
    submitted: false,
    isCorrect: null as boolean | null,
    wrongAttempts: 0,
  })
  const { pageIndex, answerInput, submitted, isCorrect, wrongAttempts } = state

  function handleSubmit(page: Extract<Lesson2FinalPage, { type: 'challenge' }>) {
    const correct = Number(answerInput) === page.answer
    setState({
      submitted: true,
      isCorrect: correct,
      wrongAttempts: correct ? wrongAttempts : wrongAttempts + 1,
    })
  }

  async function handleFinish() {
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
  }

  return (
    <section className="lesson-screen lesson-2">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(4)} />
      <h1>{lesson2FinalClickthrough.title}</h1>
      <ClickthroughMiniLesson
        miniLesson={lesson2FinalClickthrough}
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
