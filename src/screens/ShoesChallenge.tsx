import { useCallback, useState } from 'react'
import '../screens/screens.css'
import { Closet, type ClosetCategory } from '../components/Closet'
import { ChallengeQuestion } from '../components/ChallengeQuestion'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { LessonText } from '../components/LessonText'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { OutfitLog } from '../components/OutfitLog'
import { PrincessCanvas } from '../components/PrincessCanvas'
import {
  firstTryAgainFeedback,
  screen3Body,
  screen3ChallengePrompt,
  screen3FeedbackCorrect,
  screen3FeedbackIncorrect,
  screen3Heading,
} from '../copy/lesson1'
import { useLesson } from '../hooks/useLesson'
import { CORRECT_ANSWERS, CROWNS, DRESSES, SHOES } from '../data/lesson1'
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

  const [answerInput, setAnswerInput] = useState(
    screen3.answer !== null ? String(screen3.answer) : '',
  )
  const [wrongAttempts, setWrongAttempts] = useState(screen3.isCorrect === false ? 1 : 0)
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
    const answer = Number(answerInput)
    const isCorrect = answer === CORRECT_ANSWERS.screen3
    if (!isCorrect) setWrongAttempts((n) => n + 1)
    await updateLesson({
      screen3: { ...screen3, answer, isCorrect },
    })
  }

  return (
    <section className="lesson-screen shoes-challenge">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(2)} />
      <h1>{screen3Heading()}</h1>
      <LessonText text={screen3Body(princessName)} />

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

      <ChallengeQuestion
        prompt={screen3ChallengePrompt()}
        value={answerInput}
        onChange={setAnswerInput}
        onSubmit={handleSubmit}
        submitted={submitted}
        allowRetry={submitted && screen3.isCorrect === false}
      />

      {submitted && screen3.isCorrect !== null && (
        <FeedbackBanner
          variant={screen3.isCorrect ? 'success' : 'error'}
          message={
            screen3.isCorrect
              ? screen3FeedbackCorrect(princessName)
              : wrongAttempts >= 2
                ? screen3FeedbackIncorrect(princessName)
                : firstTryAgainFeedback(princessName)
          }
        />
      )}

      {submitted && (
        <LessonButton label="Continue" onClick={() => void updateScreen(4)} />
      )}
    </section>
  )
}
