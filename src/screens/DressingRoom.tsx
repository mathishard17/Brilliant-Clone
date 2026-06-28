import { useCallback, useRef, useState } from 'react'
import '../screens/screens.css'
import { Closet, type ClosetCategory } from '../components/Closet'
import { ChallengeQuestion } from '../components/ChallengeQuestion'
import { FeedbackBanner } from '../components/FeedbackBanner'
import { HintButton } from '../components/HintButton'
import { LessonText } from '../components/LessonText'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { VoiceButton } from '../components/VoiceButton'
import { OutfitLog } from '../components/OutfitLog'
import { Lesson1CharacterSetup } from '../components/Lesson1CharacterSetup'
import { PrincessCanvas } from '../components/PrincessCanvas'
import { screen1InteractiveChallenge } from '../lessons/lesson1/copy'
import { useLesson } from '../hooks/useLesson'
import { CROWNS, DRESSES } from '../lessons/lesson1/data'
import { LESSON_1_ID } from '../types/lesson'
import { useOutfitTracker } from '../hooks/useOutfitTracker'
import type { OutfitPair } from '../types/lesson'
import { getProfileLessonProgress } from '../utils/lessonProgress'
import { canRevealSolution } from '../utils/solutionReveal'
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
  const { profile, recordOutfitPair, recordStudentMemoryEvent, updateLesson, updateScreen } = useLesson()
  const activeLesson = getProfileLessonProgress(profile, LESSON_1_ID)
  const screen1 = activeLesson.screen1
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
  const challengePrompt = `How many completely **unique ${lookName}** can you make in total? (An outfit is one choice from the ${crownsLabel} category and one choice from the ${dressesLabel} category.)`
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
  const submitInFlightRef = useRef(false)
  const wrongAttempts = screen1.wrongAttempts
  const submitted = screen1.answer !== null
  const foundOutfitCount = screen1.discoveredOutfits.length
  const hasFoundAllOutfits = foundOutfitCount >= content.answer
  const isAnswerCorrect = submitted && screen1.answer === content.answer
  const isSolved = screen1.isCorrect === true || isAnswerCorrect
  const canShowSolution = canRevealSolution({
    memory: profile.studentMemory,
    conceptKey: 'counting-choice-pairs',
    wrongAttempts,
  })
  const correctFeedbackMessage = hasFoundAllOutfits
    ? `${theme.feedback.correct} **6** is exactly right, ${princessName}! You also filled the closet log with all **${content.answer} ${lookName}**.`
    : `${theme.feedback.correct} **6** is exactly right, ${princessName}! The closet log can help you explore more ${lookName}, but you're ready to continue.`
  const submittedAnswer = screen1.attemptedAnswers[screen1.attemptedAnswers.length - 1] ?? answerInput
  const feedbackSubmissionKey = [
    screen1.attemptedAnswers.join(','),
    screen1.wrongAttempts,
    String(screen1.isCorrect),
  ].join('|')

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
    }, LESSON_1_ID)
  }

  async function handleSubmit() {
    if (submitInFlightRef.current) return
    submitInFlightRef.current = true
    const normalizedAnswer = answerInput.trim()
    const answer = Number(answerInput)
    const isCorrect = answer === content.answer
    const attemptedAnswers = screen1.attemptedAnswers.includes(normalizedAnswer)
      ? screen1.attemptedAnswers
      : [...screen1.attemptedAnswers, normalizedAnswer]
    try {
      await updateLesson({
        screen1: {
          ...screen1,
          answer,
          isCorrect,
          attemptedAnswers,
          wrongAttempts: isCorrect ? screen1.wrongAttempts : screen1.wrongAttempts + 1,
        },
      }, LESSON_1_ID)
      void recordStudentMemoryEvent({
        type: 'challengeAttempt',
        lessonId: LESSON_1_ID,
        conceptKey: 'counting-choice-pairs',
        label: 'Counting choice pairs',
        outcome: isCorrect ? 'correct' : 'incorrect',
        learnerAnswer: normalizedAnswer,
        correctAnswer: String(content.answer),
      }).catch(() => undefined)
      setFeedbackVoiceToken((token) => token + 1)
    } finally {
      submitInFlightRef.current = false
    }
  }

  return (
    <section className="lesson-screen lesson-screen--themed dressing-room" style={lesson1ThemeStyle(theme)}>
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0, LESSON_1_ID)} />
      <h1>{copy.screen1Heading}</h1>
      <LessonText text={`${princessName}, ${theme.intro}`} />
      <VoiceButton
        autoPlay={!isSolved}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_1_ID}
        clipKey="lesson1.screen1.welcome"
        themePreference={profile.themePreference}
        label="Listen to this part"
      />

      <Lesson1CharacterSetup />
      <p className="endurance-tip">
        Endurance boost: try different closet combinations. New looks you discover can add Endurance points.
      </p>

      <div className="lesson-screen__play-area">
        <Closet categories={closetCategories} selected={selected} onSelect={handleSelect} />
        <PrincessCanvas
          crownId={crownId}
          dressId={dressId}
          variant={visual.character}
          characterConfig={visual.characterConfig}
          itemStyles={itemMotifs}
          appearance={profile.appearance}
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

      <ChallengeQuestion
        prompt={challengePrompt}
        value={answerInput}
        onChange={setAnswerInput}
        onSubmit={handleSubmit}
        attemptedAnswers={screen1.attemptedAnswers}
        submitted={submitted}
        allowRetry={submitted && !isSolved}
      />

      <HintButton
        lessonId={LESSON_1_ID}
        conceptKey="counting-choice-pairs"
        conceptLabel="Counting choice pairs"
        prompt={challengePrompt}
        context={`The learner is counting possible ${lookName} from one choice in ${crownsLabel} and one choice in ${dressesLabel}.`}
        fallbackHint={`Try holding one ${crownsLabel} choice still, then list what can pair with it from ${dressesLabel}.`}
        blockedAnswerTerms={['6', 'six', '2 × 3', '2 x 3', 'two times three']}
        learnerAnswer={answerInput}
        attemptedAnswers={screen1.attemptedAnswers}
        wrongAttempts={screen1.wrongAttempts}
        disabled={!submitted || isSolved}
      />

      {submitted && (
        <FeedbackBanner
          variant={isSolved ? 'success' : 'error'}
          submissionKey={feedbackSubmissionKey}
          aiFeedback={{
            lessonId: LESSON_1_ID,
            conceptKey: 'counting-choice-pairs',
            conceptLabel: 'Counting choice pairs',
            problem: challengePrompt,
            learnerAnswer: submittedAnswer,
            correctAnswer: String(content.answer),
            attemptedAnswers: screen1.attemptedAnswers,
            context: `The learner is counting possible ${lookName} from one choice in ${crownsLabel} and one choice in ${dressesLabel}.`,
          }}
          voiceCue={{
            correctClipKey: 'lesson1.feedback.correct',
            enabled: profile.voiceEnabled,
            lessonId: LESSON_1_ID,
            playToken: feedbackVoiceToken || null,
            themePreference: profile.themePreference,
            tryAgainClipKey: 'lesson1.feedback.tryAgain',
          }}
          message={
            isSolved
              ? correctFeedbackMessage
              : wrongAttempts >= 2
                ? detailedIncorrectMessage
                : `${theme.feedback.tryAgain} ${princessName}!`
          }
          solution={isSolved ? solutionMessage : undefined}
        />
      )}

      {submitted && !isSolved && screen1.isCorrect === false && canShowSolution && (
        <FeedbackBanner
          variant="info"
          message={`Solution reveal: ${theme.feedback.hint}\n\n${solutionMessage}`}
        />
      )}

      {submitted && isSolved && (
        <LessonButton label="Continue" onClick={() => void updateScreen(2, LESSON_1_ID)} />
      )}
    </section>
  )
}
