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
  screen1Body,
  screen1ChallengePrompt,
  screen1FeedbackCorrect,
  screen1FeedbackIncorrect,
  screen1Heading,
} from '../copy/lesson1'
import { useLesson } from '../hooks/useLesson'
import { CORRECT_ANSWERS, CROWNS, DRESSES } from '../data/lesson1'
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

  const [answerInput, setAnswerInput] = useState(
    screen1.answer !== null ? String(screen1.answer) : '',
  )
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
    const answer = Number(answerInput)
    const isCorrect = answer === CORRECT_ANSWERS.screen1
    await updateLesson({
      screen1: { ...screen1, answer, isCorrect },
    })
  }

  return (
    <section className="lesson-screen dressing-room">
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0)} />
      <h1>{screen1Heading()}</h1>
      <LessonText text={screen1Body(princessName)} />

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

      <ChallengeQuestion
        prompt={screen1ChallengePrompt()}
        value={answerInput}
        onChange={setAnswerInput}
        onSubmit={handleSubmit}
        submitted={submitted}
        allowRetry={submitted && screen1.isCorrect === false}
      />

      {submitted && screen1.isCorrect !== null && (
        <FeedbackBanner
          variant={screen1.isCorrect ? 'success' : 'error'}
          message={
            screen1.isCorrect
              ? screen1FeedbackCorrect(princessName)
              : screen1FeedbackIncorrect(princessName)
          }
        />
      )}

      {submitted && (
        <LessonButton label="Continue" onClick={() => void updateScreen(2)} />
      )}
    </section>
  )
}
