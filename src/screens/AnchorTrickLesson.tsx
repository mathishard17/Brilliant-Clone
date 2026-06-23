import { useCallback, useEffect, useRef, useState } from 'react'
import '../screens/screens.css'
import { LessonText } from '../components/LessonText'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { PrincessCanvas } from '../components/PrincessCanvas'
import { AnchorOutfitSum } from '../components/AnchorOutfitSum'
import { AnchorOutfitsFound } from '../components/AnchorOutfitsFound'
import { AnchorTreeDiagram } from '../components/AnchorTreeDiagram'
import { screen2Steps, screen2SummaryButton } from '../copy/lesson1'
import { WHITE_DRESS_ID } from '../data/dressColors'
import { DRESSES } from '../data/lesson1'
import { useLesson } from '../hooks/useLesson'

interface AnchorTrickLessonProps {
  princessName: string
}

const DRESS_HOLD_MS = 1300
const FADE_MS = 420

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getCanvasForStep(step: number, cyclingDressId?: string | null) {
  switch (step) {
    case 1:
      return { crownId: null, dressId: WHITE_DRESS_ID, showLock: false }
    case 2:
      return { crownId: 'gold-tiara', dressId: WHITE_DRESS_ID, showLock: true }
    case 3:
      return {
        crownId: 'gold-tiara',
        dressId: cyclingDressId ?? WHITE_DRESS_ID,
        showLock: true,
      }
    case 4:
      return { crownId: 'diamond-crown', dressId: 'pink-gown', showLock: true }
    case 5:
      return { crownId: 'diamond-crown', dressId: 'emerald-gown', showLock: false }
    default:
      return { crownId: null, dressId: WHITE_DRESS_ID, showLock: false }
  }
}

export function AnchorTrickLesson({ princessName }: AnchorTrickLessonProps) {
  const { updateLesson, updateScreen } = useLesson()
  const [currentStep, setCurrentStep] = useState(1)
  const stepIndex = Math.min(Math.max(currentStep, 1), 5) - 1
  const step = screen2Steps[stepIndex]
  const [cycleDressId, setCycleDressId] = useState(WHITE_DRESS_ID)
  const [isCycling, setIsCycling] = useState(false)
  const cycleToken = useRef(0)
  const autoPlayedRef = useRef(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    void updateLesson({ screen2: { currentStep: 1 } })
  }, [updateLesson])

  const runDressCycle = useCallback(async () => {
    const token = ++cycleToken.current
    setIsCycling(true)
    setCycleDressId(WHITE_DRESS_ID)
    await sleep(DRESS_HOLD_MS + FADE_MS)
    for (const dress of DRESSES) {
      if (cycleToken.current !== token) return
      setCycleDressId(dress.id)
      await sleep(DRESS_HOLD_MS + FADE_MS)
    }
    if (cycleToken.current === token) {
      setIsCycling(false)
    }
  }, [])

  useEffect(() => {
    if (stepIndex !== 2) {
      cycleToken.current += 1
      autoPlayedRef.current = false
      return
    }

    if (!autoPlayedRef.current) {
      autoPlayedRef.current = true
      const timer = setTimeout(() => void runDressCycle(), 800)
      return () => clearTimeout(timer)
    }
  }, [stepIndex, runDressCycle])

  const cyclingDressId = stepIndex === 2 ? cycleDressId : null
  const canvas = getCanvasForStep(stepIndex + 1, cyclingDressId)

  const dressOutfitCount =
    stepIndex === 2 && cyclingDressId !== WHITE_DRESS_ID
      ? DRESSES.findIndex((dress) => dress.id === cyclingDressId) + 1
      : 0

  const updateStep = useCallback(
    async (nextStep: number) => {
      cycleToken.current += 1
      setIsCycling(false)
      if (nextStep === 3) {
        setCycleDressId(WHITE_DRESS_ID)
        autoPlayedRef.current = false
      }
      setCurrentStep(nextStep)
      await updateLesson({
        screen2: { currentStep: nextStep },
      })
    },
    [updateLesson],
  )

  const expandedTree = step.tree?.variant === 'expanded' ? step.tree : null

  return (
    <section className="lesson-screen anchor-lesson">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>📖 The Anchor Trick</h1>
      <p className="anchor-lesson__step-label">
        Step {stepIndex + 1} of 5 — {princessName}
      </p>

      <div className="anchor-lesson__content">
        <LessonText
          key={stepIndex}
          text={step.lessonText}
          className="anchor-lesson__text anchor-lesson__text--enter"
        />

        <div className="lesson-screen__play-area lesson-screen__play-area--centered">
          <div className="anchor-lesson__figure-col">
            <PrincessCanvas
              crownId={canvas.crownId}
              dressId={canvas.dressId}
              showLock={canvas.showLock}
            />
            {stepIndex === 3 && expandedTree && (
              <AnchorOutfitsFound
                crownId={expandedTree.crownId}
                dressIds={expandedTree.dressIds}
              />
            )}
          </div>
          {stepIndex === 2 && (
            <div className="anchor-lesson__watch-area">
              <div className="anchor-lesson__watch-btn">
                <LessonButton
                  label={isCycling ? 'Changing dresses…' : '▶ Watch dresses change'}
                  variant="secondary"
                  onClick={() => void runDressCycle()}
                  disabled={isCycling}
                />
              </div>
              {dressOutfitCount > 0 && (
                <p className="anchor-lesson__outfit-count" aria-live="polite">
                  <span className="anchor-lesson__outfit-count-number">{dressOutfitCount}</span>
                  {' outfit'}
                  {dressOutfitCount !== 1 ? 's' : ''} for Gold Tiara
                </p>
              )}
            </div>
          )}
        </div>

        {stepIndex === 2 && expandedTree && (
          <div className="tree-diagram-wrap">
            <AnchorTreeDiagram tree={expandedTree} visibleDressCount={dressOutfitCount} />
          </div>
        )}

        {stepIndex === 4 && <AnchorOutfitSum />}
      </div>

      <div className="anchor-lesson__nav">
        {stepIndex > 0 && (
          <LessonButton
            label="Back"
            variant="secondary"
            onClick={() => void updateStep(stepIndex)}
          />
        )}
        {stepIndex < 4 ? (
          <LessonButton label="Next" onClick={() => void updateStep(stepIndex + 2)} />
        ) : (
          <LessonButton
            label={screen2SummaryButton()}
            onClick={() => void updateScreen(3)}
          />
        )}
      </div>
    </section>
  )
}
