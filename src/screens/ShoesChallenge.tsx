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
import { screen3InteractiveChallenge } from '../lessons/lesson1/copy'
import { useLesson } from '../hooks/useLesson'
import { CROWNS, DRESSES, SHOES } from '../lessons/lesson1/data'
import { LESSON_1_ID } from '../types/lesson'
import { useOutfitTracker } from '../hooks/useOutfitTracker'
import type { OutfitTriple } from '../types/lesson'
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

interface ShoesChallengeProps {
  princessName: string
}

export function ShoesChallenge({ princessName }: ShoesChallengeProps) {
  const { profile, recordOutfitTriple, updateLesson, updateScreen } = useLesson()
  const screen3 = profile.lesson.screen3
  const content = screen3InteractiveChallenge
  const theme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const copy = getLesson1ThemeCopy(theme)
  const visual = getLesson1ThemeVisual(theme)
  const itemLabels = getThemeItemLabels(theme)
  const itemMotifs = getThemeItemMotifs(theme)
  const motif = getThemeMotif(theme)
  const crowns = getThemeCategory(theme, 'crowns')
  const dresses = getThemeCategory(theme, 'dresses')
  const shoes = getThemeCategory(theme, 'shoes')
  const variationName = copy.variationNamePlural
  const crownsLabel = crowns?.label ?? 'category 1'
  const dressesLabel = dresses?.label ?? 'category 2'
  const shoesLabel = shoes?.label ?? 'category 3'
  const challengePrompt = `How many **${variationName}** can you make now using one choice from ${crownsLabel}, one choice from ${dressesLabel}, and one choice from ${shoesLabel}?`
  const detailedIncorrectMessage = `Close! Think about it, ${princessName}: start with each finished look, then match it with each possible choice from **${shoesLabel}**.`
  const solutionMessage = `Solution: **2 ${crownsLabel} × 3 ${dressesLabel} × 2 ${shoesLabel} = 12 total variations**.`
  const closetCategories: ClosetCategory[] = [
    { key: 'crowns', title: crowns?.label ?? 'Crowns', items: crowns ? themedItems(crowns, theme) : CROWNS },
    { key: 'dresses', title: dresses?.label ?? 'Dresses', items: dresses ? themedItems(dresses, theme) : DRESSES },
    { key: 'shoes', title: shoes?.label ?? 'Shoes', items: shoes ? themedItems(shoes, theme) : SHOES },
  ]

  const [answerInput, setAnswerInput] = useState(
    screen3.answer !== null ? String(screen3.answer) : '',
  )
  const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)
  const wrongAttempts = screen3.wrongAttempts
  const submitted = screen3.answer !== null

  const handleNewOutfit = useCallback(
    (outfit: OutfitTriple) => {
      void recordOutfitTriple(outfit)
    },
    [recordOutfitTriple],
  )

  const { selected, handleSelect, crownId, dressId, shoeId, resetSelected } =
    useOutfitTracker({
      mode: 'triple',
      discoveredOutfits: screen3.discoveredOutfits,
      onNewOutfit: handleNewOutfit,
    })

  async function handleReset() {
    resetSelected()
    await updateLesson({
      screen3: { ...screen3, discoveredOutfits: [] },
    })
  }

  async function handleSubmit() {
    const normalizedAnswer = answerInput.trim()
    const answer = Number(answerInput)
    const isCorrect = answer === content.answer
    const attemptedAnswers = screen3.attemptedAnswers.includes(normalizedAnswer)
      ? screen3.attemptedAnswers
      : [...screen3.attemptedAnswers, normalizedAnswer]
    await updateLesson({
      screen3: {
        ...screen3,
        answer,
        isCorrect,
        attemptedAnswers,
        wrongAttempts: isCorrect ? screen3.wrongAttempts : screen3.wrongAttempts + 1,
      },
    })
    setFeedbackVoiceToken((token) => token + 1)
  }

  return (
    <section className="lesson-screen lesson-screen--themed shoes-challenge" style={lesson1ThemeStyle(theme)}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{copy.screen3Heading}</h1>
      <LessonText
        text={`Let's make it tougher, ${princessName}. Now each look needs one choice from **${shoesLabel}** too!`}
      />
      <VoiceButton
        autoPlay={screen3.isCorrect !== true}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_1_ID}
        clipKey="lesson1.screen3.shoesIntro"
        themePreference={profile.themePreference}
        label="Listen to this part"
      />

      {content.visualization === 'outfit-triples' ? (
        <>
          <div className="lesson-screen__play-area">
            <Closet categories={closetCategories} selected={selected} onSelect={handleSelect} />
            <PrincessCanvas
              crownId={crownId}
              dressId={dressId}
              shoeId={shoeId}
              variant={visual.character}
              characterConfig={visual.characterConfig}
              itemStyles={itemMotifs}
            />
          </div>

          <OutfitLog
            outfits={screen3.discoveredOutfits}
            total={screen3.discoveredOutfits.length}
            mode="triple"
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
        attemptedAnswers={screen3.attemptedAnswers}
        submitted={submitted}
        allowRetry={submitted && screen3.isCorrect === false}
      />

      <HintButton
        prompt={challengePrompt}
        context={`The learner is extending earlier ${theme.learnerRole} looks by adding one choice from ${shoesLabel}.`}
        fallbackHint={`Start with one finished look, then ask how ${shoesLabel} changes each look.`}
        blockedAnswerTerms={[
          '6',
          'six',
          '12',
          'twelve',
          '2 × 3 × 2',
          '2 x 3 x 2',
          'two times three times two',
        ]}
        disabled={!submitted || screen3.isCorrect === true}
      />

      {submitted && screen3.isCorrect !== null && (
        <FeedbackBanner
          variant={screen3.isCorrect ? 'success' : 'error'}
          voiceCue={{
            correctClipKey: 'lesson1.feedback.correct',
            enabled: profile.voiceEnabled,
            lessonId: LESSON_1_ID,
            playToken: feedbackVoiceToken || null,
            themePreference: profile.themePreference,
            tryAgainClipKey: 'lesson1.feedback.tryAgain',
          }}
          message={
            screen3.isCorrect
              ? `${theme.feedback.correct} **12** is exactly right, ${princessName}!`
              : wrongAttempts >= 2
                ? detailedIncorrectMessage
                : `${theme.feedback.tryAgain} ${princessName}!`
          }
        />
      )}

      {submitted && screen3.isCorrect === false && wrongAttempts >= 3 && (
        <FeedbackBanner
          variant="info"
          message={`Solution reveal: ${theme.feedback.hint}\n\n${solutionMessage}`}
        />
      )}

      {submitted && screen3.isCorrect && (
        <LessonButton label="Continue" onClick={() => void updateScreen(4)} />
      )}
    </section>
  )
}
