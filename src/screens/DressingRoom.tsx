import { useCallback, useState } from 'react'
import '../screens/screens.css'
import { Closet, type ClosetCategory } from '../components/Closet'
import { ChallengeQuestion } from '../components/ChallengeQuestion'
import { DefaultInteractiveVisualization } from '../components/DefaultInteractiveVisualization'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { HintButton } from '../components/HintButton'
import { LessonText } from '../components/LessonText'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { VoiceButton } from '../components/VoiceButton'
import { OutfitLog } from '../components/OutfitLog'
import { PrincessCanvas } from '../components/PrincessCanvas'
import { screen1InteractiveChallenge } from '../lessons/lesson1/copy'
import { useLesson } from '../hooks/useLesson'
import { CROWNS, DRESSES } from '../lessons/lesson1/data'
import { LESSON_1_ID } from '../types/lesson'
import { useOutfitTracker } from '../hooks/useOutfitTracker'
import type { OutfitPair } from '../types/lesson'
import {
  getLesson1ThemeCopy,
  getLesson1ThemeVisual,
  getThemeCategory,
  getThemeItemLabels,
  getThemeItemMotifs,
  getThemeMotif,
  lesson1ThemeStyle,
  resolveLesson1Theme,
  themedItems,
} from '../themes/themeResolver'

interface DressingRoomProps {
  princessName: string
}

export function DressingRoom({ princessName }: DressingRoomProps) {
  const { profile, recordOutfitPair, updateLesson, updateScreen } = useLesson()
  const screen1 = profile.lesson.screen1
  const content = screen1InteractiveChallenge
  const theme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const copy = getLesson1ThemeCopy(theme)
  const visual = getLesson1ThemeVisual(theme)
  const itemLabels = getThemeItemLabels(theme)
  const itemMotifs = getThemeItemMotifs(theme)
  const motif = getThemeMotif(theme)
  const crowns = getThemeCategory(theme, 'crowns')
  const dresses = getThemeCategory(theme, 'dresses')
  const lookName = copy.lookNamePlural
  const crownsLabel = crowns?.label ?? 'category 1'
  const dressesLabel = dresses?.label ?? 'category 2'
  const challengePrompt = `How many completely **unique ${lookName}** can you make in total? (A look is one choice from the ${crownsLabel} category and one choice from the ${dressesLabel} category.)`
  const detailedIncorrectMessage = `Not quite, ${princessName}! Try locking one choice from **${crownsLabel}** first, then count every choice from **${dressesLabel}** that can go with it.`
  const solutionMessage = `Solution: **2 ${crownsLabel} × 3 ${dressesLabel} = 6 unique ${lookName}**.`
  const closetCategories: ClosetCategory[] = [
    { key: 'crowns', title: crowns?.label ?? 'Sparkly Crowns', items: crowns ? themedItems(crowns, theme) : CROWNS },
    { key: 'dresses', title: dresses?.label ?? 'Princess Gowns', items: dresses ? themedItems(dresses, theme) : DRESSES },
  ]

  const [answerInput, setAnswerInput] = useState(
    screen1.answer !== null ? String(screen1.answer) : '',
  )
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const wrongAttempts = screen1.wrongAttempts
  const submitted = screen1.answer !== null

  const handleNewOutfit = useCallback(
    (outfit: OutfitPair) => {
      void recordOutfitPair(outfit)
    },
    [recordOutfitPair],
  )

  const { selected, handleSelect, crownId, dressId, resetSelected } = useOutfitTracker({
    mode: 'pair',
    discoveredOutfits: screen1.discoveredOutfits,
    onNewOutfit: handleNewOutfit,
  })

  async function handleReset() {
    resetSelected()
    await updateLesson({
      screen1: { ...screen1, discoveredOutfits: [] },
    })
  }

  async function handleSubmit() {
    const normalizedAnswer = answerInput.trim()
    const answer = Number(answerInput)
    const isCorrect = answer === content.answer
    const attemptedAnswers = screen1.attemptedAnswers.includes(normalizedAnswer)
      ? screen1.attemptedAnswers
      : [...screen1.attemptedAnswers, normalizedAnswer]
    await updateLesson({
      screen1: {
        ...screen1,
        answer,
        isCorrect,
        attemptedAnswers,
        wrongAttempts: isCorrect ? screen1.wrongAttempts : screen1.wrongAttempts + 1,
      },
    })
    setFeedbackVoiceToken((token) => token + 1)
  }

  return (
    <section className="lesson-screen lesson-screen--themed dressing-room" style={lesson1ThemeStyle(theme)}>
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0)} />
      <h1>{copy.screen1Heading}</h1>
      <LessonText text={`${princessName}, ${theme.intro}`} />
      <VoiceButton
        autoPlay={screen1.isCorrect !== true}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_1_ID}
        clipKey="lesson1.screen1.welcome"
        themePreference={profile.themePreference}
        label="Listen to this part"
      />

      {content.visualization === 'outfit-pairs' ? (
        <>
          <div className="lesson-screen__play-area">
            <Closet categories={closetCategories} selected={selected} onSelect={handleSelect} />
            <PrincessCanvas
              crownId={crownId}
              dressId={dressId}
              variant={visual.character}
              characterConfig={visual.characterConfig}
              itemStyles={itemMotifs}
            />
          </div>

          <OutfitLog
            outfits={screen1.discoveredOutfits}
            total={screen1.discoveredOutfits.length}
            mode="pair"
            onReset={() => void handleReset()}
            heading={copy.logHeading}
            emptyMessage={copy.logEmpty}
            counterLabel={copy.logCounter}
            itemLabels={itemLabels}
            itemMotifs={itemMotifs}
            motifColor={motif.primary}
            motifShape={motif.shape}
          />
        </>
      ) : (
        <DefaultInteractiveVisualization />
      )}

      <ChallengeQuestion
        prompt={challengePrompt}
        value={answerInput}
        onChange={setAnswerInput}
        onSubmit={handleSubmit}
        attemptedAnswers={screen1.attemptedAnswers}
        submitted={submitted}
        allowRetry={submitted && screen1.isCorrect === false}
      />

      <HintButton
        prompt={challengePrompt}
        context={`The learner is counting possible ${lookName} from one choice in ${crownsLabel} and one choice in ${dressesLabel}.`}
        fallbackHint={`Try holding one ${crownsLabel} choice still, then list what can pair with it from ${dressesLabel}.`}
        blockedAnswerTerms={['6', 'six', '2 × 3', '2 x 3', 'two times three']}
        disabled={!submitted || screen1.isCorrect === true}
      />

      {submitted && screen1.isCorrect !== null && (
        <FeedbackBanner
          variant={screen1.isCorrect ? 'success' : 'error'}
          voiceCue={{
            correctClipKey: 'lesson1.feedback.correct',
            enabled: profile.voiceEnabled,
            lessonId: LESSON_1_ID,
            playToken: feedbackVoiceToken || null,
            themePreference: profile.themePreference,
            tryAgainClipKey: 'lesson1.feedback.tryAgain',
          }}
          message={
            screen1.isCorrect
              ? `${theme.feedback.correct} You found all **6 combinations**, ${princessName}!`
              : wrongAttempts >= 2
                ? detailedIncorrectMessage
                : `${theme.feedback.tryAgain} ${princessName}!`
          }
        />
      )}

      {submitted && screen1.isCorrect === false && wrongAttempts >= 3 && (
        <FeedbackBanner
          variant="info"
          message={`Solution reveal: ${theme.feedback.hint}\n\n${solutionMessage}`}
        />
      )}

      {submitted && screen1.isCorrect && (
        <LessonButton label="Continue" onClick={() => void updateScreen(2)} />
      )}
    </section>
  )
}
