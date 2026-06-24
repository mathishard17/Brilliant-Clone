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
import { screen3InteractiveChallenge } from '../lessons/lesson1/copy'
import { useLesson } from '../hooks/useLesson'
import { CROWNS, DRESSES, SHOES } from '../lessons/lesson1/data'
import { useOutfitTracker } from '../hooks/useOutfitTracker'
import type { OutfitTriple } from '../types/lesson'

interface ShoesChallengeProps {
  princessName: string
}

const CLOSET_CATEGORIES: ClosetCategory[] = [
  { key: 'crowns', title: 'Crowns', items: CROWNS },
  { key: 'dresses', title: 'Dresses', items: DRESSES },
  { key: 'shoes', title: 'Shoes', items: SHOES },
]

export function ShoesChallenge({ princessName }: ShoesChallengeProps) {
  const { profile, recordOutfitTriple, updateLesson, updateScreen } = useLesson()
  const screen3 = profile.lesson.screen3
  const content = screen3InteractiveChallenge

  const [answerInput, setAnswerInput] = useState(
    screen3.answer !== null ? String(screen3.answer) : '',
  )
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
  }

  return (
    <section className="lesson-screen shoes-challenge">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{content.heading}</h1>
      <LessonText text={content.body(princessName)} />

      {content.visualization === 'outfit-triples' ? (
        <>
          <div className="lesson-screen__play-area">
            <Closet categories={CLOSET_CATEGORIES} selected={selected} onSelect={handleSelect} />
            <PrincessCanvas crownId={crownId} dressId={dressId} shoeId={shoeId} />
          </div>

          <OutfitLog
            outfits={screen3.discoveredOutfits}
            total={screen3.discoveredOutfits.length}
            mode="triple"
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
        attemptedAnswers={screen3.attemptedAnswers}
        submitted={submitted}
        allowRetry={submitted && screen3.isCorrect === false}
      />

      {submitted && screen3.isCorrect !== null && (
        <FeedbackBanner
          variant={screen3.isCorrect ? 'success' : 'error'}
          message={
            screen3.isCorrect
              ? content.feedback.correct(princessName)
              : wrongAttempts >= 2
                ? content.feedback.incorrect(princessName)
                : content.feedback.tryAgain(princessName)
          }
        />
      )}

      {submitted && screen3.isCorrect === false && wrongAttempts >= 3 && (
        <FeedbackBanner variant="info" message={content.feedback.solution(princessName)} />
      )}

      {submitted && screen3.isCorrect && (
        <LessonButton label="Continue" onClick={() => void updateScreen(4)} />
      )}
    </section>
  )
}
