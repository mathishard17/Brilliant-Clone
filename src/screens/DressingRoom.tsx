import { useCallback, useState } from 'react'
import '../screens/screens.css'
import { Closet, type ClosetCategory } from '../components/Closet'
import { ChallengeQuestion } from '../components/ChallengeQuestion'
import { DefaultInteractiveVisualization } from '../components/DefaultInteractiveVisualization'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { LessonText } from '../components/LessonText'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { OutfitLog } from '../components/OutfitLog'
import { PrincessCanvas } from '../components/PrincessCanvas'
import { screen1InteractiveChallenge } from '../lessons/lesson1/copy'
import { useLesson } from '../hooks/useLesson'
import { CROWNS, DRESSES } from '../lessons/lesson1/data'
import { useOutfitTracker } from '../hooks/useOutfitTracker'
import type { OutfitPair } from '../types/lesson'

interface DressingRoomProps {
  princessName: string
}

const CLOSET_CATEGORIES: ClosetCategory[] = [
  { key: 'crowns', title: 'Sparkly Crowns', items: CROWNS },
  { key: 'dresses', title: 'Princess Gowns', items: DRESSES },
]

export function DressingRoom({ princessName }: DressingRoomProps) {
  const { profile, recordOutfitPair, updateLesson, updateScreen } = useLesson()
  const screen1 = profile.lesson.screen1
  const content = screen1InteractiveChallenge

  const [answerInput, setAnswerInput] = useState(
    screen1.answer !== null ? String(screen1.answer) : '',
  )
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
  }

  return (
    <section className="lesson-screen dressing-room">
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0)} />
      <h1>{content.heading}</h1>
      <LessonText text={content.body(princessName)} />

      {content.visualization === 'outfit-pairs' ? (
        <>
          <div className="lesson-screen__play-area">
            <Closet categories={CLOSET_CATEGORIES} selected={selected} onSelect={handleSelect} />
            <PrincessCanvas crownId={crownId} dressId={dressId} />
          </div>

          <OutfitLog
            outfits={screen1.discoveredOutfits}
            total={screen1.discoveredOutfits.length}
            mode="pair"
            onReset={() => void handleReset()}
          />
        </>
      ) : (
        <DefaultInteractiveVisualization />
      )}

      <ChallengeQuestion
        prompt={content.prompt}
        value={answerInput}
        onChange={setAnswerInput}
        onSubmit={handleSubmit}
        attemptedAnswers={screen1.attemptedAnswers}
        submitted={submitted}
        allowRetry={submitted && screen1.isCorrect === false}
      />

      {submitted && screen1.isCorrect !== null && (
        <FeedbackBanner
          variant={screen1.isCorrect ? 'success' : 'error'}
          message={
            screen1.isCorrect
              ? content.feedback.correct(princessName)
              : wrongAttempts >= 2
                ? content.feedback.incorrect(princessName)
                : content.feedback.tryAgain(princessName)
          }
        />
      )}

      {submitted && screen1.isCorrect === false && wrongAttempts >= 3 && (
        <FeedbackBanner variant="info" message={content.feedback.solution(princessName)} />
      )}

      {submitted && screen1.isCorrect && (
        <LessonButton label="Continue" onClick={() => void updateScreen(2)} />
      )}
    </section>
  )
}
