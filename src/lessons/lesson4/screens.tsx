import { useState, type CSSProperties } from 'react'
import '../../screens/screens.css'
import { ClickthroughMiniLesson } from '../../components/ClickthroughMiniLesson'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { LessonButton } from '../../components/LessonButton'
import { LessonText } from '../../components/LessonText'
import { ScreenBackButton } from '../../components/ScreenBackButton'
import { VoiceButton } from '../../components/VoiceButton'
import { useLesson } from '../../hooks/useLesson'
import { useSectionState } from '../../hooks/useSectionState'
import { LESSON_4_ID } from '../../types/lesson'
import { lesson1ThemeStyle, resolveLesson1Theme } from '../../themes/themeResolver'
import { playCompletionTada } from '../../utils/completionSound'
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
    lesson4Style: {
      ...themeStyle,
      background: 'linear-gradient(180deg, var(--theme-screen-bg) 0%, var(--theme-stage-bg) 100%)',
    } as CSSProperties,
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

const solutionRevealWrongAttempts = 2

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
      incorrect: themePrizeText(challenge.feedback.incorrect, flavor),
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
      return `${themeFlavor.visual.spinnerColors[space.prize] ?? prizeColors[space.prize]} ${start}% ${separatorStart}%, rgb(255 255 255 / 0.78) ${separatorStart}% ${end}%`
    })
    .join(', ')

  return `conic-gradient(from 0deg, ${gradient})`
}

function addSolvedChallengeId(solvedChallengeIds: readonly string[], challengeId: string): string[] {
  return solvedChallengeIds.includes(challengeId)
    ? [...solvedChallengeIds]
    : [...solvedChallengeIds, challengeId]
}

function ChanceSpinner({
  visual,
  themeFlavor,
}: {
  visual: SpinnerVisual
  themeFlavor: Lesson4ThemeFlavor
}) {
  const [state, setState] = useSectionState(`lesson-4-spinner-${visual.id}`, {
    selectedPrize: visual.targetPrize ?? visual.spaces[0].prize,
    landedIndex: null as number | null,
    spinRotation: 0,
  })
  const { selectedPrize, landedIndex, spinRotation } = state
  const themedVisual = themeSpinnerVisualText(visual, themeFlavor)
  const selectedPrizeDefinition = themeFlavor.prizeDefinitions[selectedPrize]
  const selectedCount = countPrize(visual.spaces, selectedPrize)
  const visiblePrizes = getVisiblePrizes(visual)
  const visualTheme = themeFlavor.visual

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
          aria-label={`${themedVisual.title} with ${visual.spaces.length} equal spaces`}
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
                  className={`chance-spinner__space chance-spinner__space--${space.prize}${isSelected ? ' chance-spinner__space--selected' : ''}${isLanded ? ' chance-spinner__space--landed' : ''}`}
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
                  onClick={() => setState({ selectedPrize: space.prize })}
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
                onClick={() => setState({ selectedPrize: prize })}
              >
                <span aria-hidden="true">{definition.icon}</span>
                {definition.label}
              </button>
            )
          })}
        </div>
      </div>

      <p className="chance-spinner-card__count" style={{ color: visualTheme.hintText }} aria-live="polite">
        {selectedPrizeDefinition.icon} {selectedPrizeDefinition.label} spaces:{' '}
        <strong>{selectedCount}</strong> / Total spaces: <strong>{visual.spaces.length}</strong>
      </p>
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
  const { profile } = useLesson()
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const [state, setState] = useSectionState(`lesson-4-choice-${challenge.id}`, {
    selectedAnswer: null as string | null,
    attemptedAnswers: [] as string[],
    repeatMessage: null as string | null,
    wrongAttempts: 0,
  })
  const { selectedAnswer, attemptedAnswers, repeatMessage, wrongAttempts } = state
  const isCorrect = selectedAnswer === challenge.answer
  const showFeedback = selectedAnswer !== null
  const shouldRevealSolution = wrongAttempts >= solutionRevealWrongAttempts
  const visualTheme = themeFlavor.visual

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
    setFeedbackVoiceToken((token) => token + 1)
    if (answer === challenge.answer) {
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

      {showFeedback && (
        <FeedbackBanner
          variant={isCorrect ? 'success' : 'error'}
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
}: {
  page: Lesson4MiniLessonPage
  themeFlavor: Lesson4ThemeFlavor
  onCorrect: () => void
}) {
  if (isChallengePage(page)) {
    const themedPage = themeChoiceChallenge(page, themeFlavor)
    return (
      <div className="chance-mini-lesson__page">
        <ChanceSpinner visual={getThemedSpinnerVisual(page.visual, themeFlavor)} themeFlavor={themeFlavor} />
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
  const [state, setState] = useSectionState('lesson-4-one-spin', { challengeCorrect: false })
  const { challengeCorrect } = state
  const copy = getThemedScreen1Copy(lesson4Flavor)
  const challenge = themeChoiceChallenge(copy.challenge, lesson4Flavor)

  return (
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton label="← Back to Lessons" onClick={() => void updateScreen(0)} />
      <h1>{copy.heading}</h1>
      <LessonText text={copy.body(princessName)} className="anchor-lesson__text" />
      <VoiceButton
        autoPlay={!challengeCorrect}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_4_ID}
        clipKey="lesson4.screen1.spinnerIntro"
        themePreference={profile.themePreference}
        label="Listen to spinner tip"
      />
      <ChanceSpinner visual={getThemedSpinnerVisual(screen1Visual, lesson4Flavor)} themeFlavor={lesson4Flavor} />
      <ChoiceChallengeCard
        challenge={challenge}
        themeFlavor={lesson4Flavor}
        onCorrect={() => setState({ challengeCorrect: true })}
      />
      {challengeCorrect && (
        <>
          <FeedbackBanner variant="info" message={copy.keyLine} />
          <LessonButton label="Find winning spaces" onClick={() => void updateScreen(2)} />
        </>
      )}
    </section>
  )
}

export function Lesson4WinningSpaces() {
  const { lesson4Flavor, lesson4Style, updateScreen } = useThemedLesson()
  const [state, setState] = useSectionState('lesson-4-winning-spaces', {
    pageIndex: 0,
    challengeCorrect: false,
    solvedChallengeIds: [] as string[],
  })
  const { pageIndex, challengeCorrect, solvedChallengeIds } = state
  const miniLesson = getThemedScreen2MiniLesson(lesson4Flavor)

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
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{miniLesson.title}</h1>
      {miniLesson.description && (
        <LessonText text={miniLesson.description} className="anchor-lesson__text" />
      )}
      {pageIndex < 2 && (
        <ChanceSpinner visual={getThemedSpinnerVisual(rubySpinnerVisual, lesson4Flavor)} themeFlavor={lesson4Flavor} />
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
            onCorrect={() => handleChallengeCorrect(page.id)}
          />
        )}
      />
      {isPageSolved(miniLesson.pages[2]) && (
        <FeedbackBanner variant="info" message={screen2KeyLine} />
      )}
    </section>
  )
}

export function Lesson4MoreLikely() {
  const { lesson4Flavor, lesson4Style, updateScreen } = useThemedLesson()
  const [state, setState] = useSectionState('lesson-4-more-likely', {
    compareCorrect: false,
    crownCorrect: false,
  })
  const { compareCorrect, crownCorrect } = state
  const copy = getThemedScreen3Copy(lesson4Flavor)
  const compareChallenge = themeChoiceChallenge(copy.compareChallenge, lesson4Flavor)
  const crownChallenge = themeChoiceChallenge(copy.crownChallenge, lesson4Flavor)

  return (
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{copy.heading}</h1>
      <LessonText text={copy.body} className="anchor-lesson__text" />
      <ChanceSpinner visual={getThemedSpinnerVisual(compareSpinnerVisual, lesson4Flavor)} themeFlavor={lesson4Flavor} />
      <ChoiceChallengeCard
        challenge={compareChallenge}
        themeFlavor={lesson4Flavor}
        onCorrect={() => setState({ compareCorrect: true })}
      />
      {compareCorrect && (
        <ChoiceChallengeCard
          challenge={crownChallenge}
          themeFlavor={lesson4Flavor}
          onCorrect={() => setState({ crownCorrect: true })}
        />
      )}
      {compareCorrect && crownCorrect && (
        <LessonButton label="Check impossible outcomes" onClick={() => void updateScreen(4)} />
      )}
    </section>
  )
}

export function Lesson4ImpossibleCertain() {
  const { lesson4Flavor, lesson4Style, updateScreen } = useThemedLesson()
  const [state, setState] = useSectionState('lesson-4-impossible-certain', {
    pageIndex: 0,
    challengeCorrect: false,
    solvedChallengeIds: [] as string[],
  })
  const { pageIndex, challengeCorrect, solvedChallengeIds } = state
  const miniLesson = getThemedScreen4MiniLesson(lesson4Flavor)

  function handlePageChange(nextPageIndex: number) {
    setState({ pageIndex: nextPageIndex })
  }

  function isPageSolved(page: Lesson4MiniLessonPage) {
    return (
      isChallengePage(page) &&
      (solvedChallengeIds.includes(page.id) ||
        (challengeCorrect && miniLesson.pages[pageIndex]?.id === page.id))
    )
  }

  function handleChallengeCorrect(challengeId: string) {
    setState({
      challengeCorrect: true,
      solvedChallengeIds: addSolvedChallengeId(solvedChallengeIds, challengeId),
    })
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(3)} />
      <h1>{miniLesson.title}</h1>
      {pageIndex === 0 && (
        <ChanceSpinner visual={getThemedSpinnerVisual(impossibleVisual, lesson4Flavor)} themeFlavor={lesson4Flavor} />
      )}
      {pageIndex === 2 && (
        <ChanceSpinner visual={getThemedSpinnerVisual(certainVisual, lesson4Flavor)} themeFlavor={lesson4Flavor} />
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
            onCorrect={() => handleChallengeCorrect(page.id)}
          />
        )}
      />
    </section>
  )
}

export function Lesson4Finale() {
  const { lesson4Flavor, lesson4Style, updateLesson, updateScreen } = useThemedLesson()
  const [state, setState] = useSectionState('lesson-4-finale', {
    crownCorrect: false,
    compareCorrect: false,
  })
  const { crownCorrect, compareCorrect } = state
  const copy = getThemedScreen5Copy(lesson4Flavor)
  const crownChallenge = themeChoiceChallenge(copy.crownChallenge, lesson4Flavor)
  const rubyDragonChallenge = themeChoiceChallenge(copy.rubyDragonChallenge, lesson4Flavor)

  async function handleFinish() {
    playCompletionTada()
    await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
  }

  return (
    <section className="lesson-screen lesson-screen--themed lesson-4" style={lesson4Style}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(4)} />
      <h1>{copy.heading}</h1>
      <LessonText text={copy.body} className="anchor-lesson__text" />
      <ChanceSpinner visual={getThemedSpinnerVisual(finaleVisual, lesson4Flavor)} themeFlavor={lesson4Flavor} />
      <ChoiceChallengeCard
        challenge={crownChallenge}
        themeFlavor={lesson4Flavor}
        onCorrect={() => setState({ crownCorrect: true })}
      />
      {crownCorrect && (
        <ChoiceChallengeCard
          challenge={rubyDragonChallenge}
          themeFlavor={lesson4Flavor}
          onCorrect={() => setState({ compareCorrect: true })}
        />
      )}
      {crownCorrect && compareCorrect && (
        <>
          <FeedbackBanner variant="info" message={copy.finalMessage} />
          <LessonButton label="Finish Lesson" onClick={handleFinish} />
        </>
      )}
    </section>
  )
}
