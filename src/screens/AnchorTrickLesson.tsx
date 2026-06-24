import { useCallback, useEffect, useRef, useState } from 'react'
import '../screens/screens.css'
import { ClickthroughMiniLesson } from '../components/ClickthroughMiniLesson'
import { LessonText } from '../components/LessonText'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { PrincessCanvas } from '../components/PrincessCanvas'
import { AnchorOutfitSum } from '../components/AnchorOutfitSum'
import { AnchorOutfitsFound } from '../components/AnchorOutfitsFound'
import { AnchorTreeDiagram } from '../components/AnchorTreeDiagram'
import { screen2MiniLesson, screen2SummaryButton } from '../lessons/lesson1/copy'
import { WHITE_DRESS_ID } from '../data/dressColors'
import { DRESSES } from '../lessons/lesson1/data'
import { useLesson } from '../hooks/useLesson'

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

export function AnchorTrickLesson() {
  const { profile, updateLesson, updateScreen } = useLesson()
  const [currentStep, setCurrentStep] = useState(() =>
    Math.min(Math.max(profile.lesson.screen2.currentStep, 1), screen2MiniLesson.pages.length),
  )
  const currentPageIndex = Math.min(
    Math.max(currentStep, 1),
    screen2MiniLesson.pages.length,
  ) - 1
  const [cycleDressId, setCycleDressId] = useState(WHITE_DRESS_ID)
  const [isCycling, setIsCycling] = useState(false)
  const cycleToken = useRef(0)
  const autoPlayedRef = useRef(false)

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
    if (currentPageIndex !== 2) {
      cycleToken.current += 1
      autoPlayedRef.current = false
      return
    }

    if (!autoPlayedRef.current) {
      autoPlayedRef.current = true
      const timer = setTimeout(() => void runDressCycle(), 800)
      return () => clearTimeout(timer)
    }
  }, [currentPageIndex, runDressCycle])

  const updatePage = useCallback(
    async (nextPageIndex: number) => {
      const nextStep = nextPageIndex + 1
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

  return (
    <section className="lesson-screen anchor-lesson">
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1)} />
      <h1>{screen2MiniLesson.title}</h1>
      <ClickthroughMiniLesson
        miniLesson={screen2MiniLesson}
        currentPageIndex={currentPageIndex}
        onPageChange={updatePage}
        onComplete={() => void updateScreen(3)}
        completeLabel={screen2SummaryButton()}
        contentClassName="anchor-lesson__content"
        navClassName="anchor-lesson__nav"
        getPageLabel={(_, pageIndex, totalPages) => (
          <p className="anchor-lesson__step-label">
            Step {pageIndex + 1} of {totalPages}
          </p>
        )}
        renderPage={(page, pageIndex) => {
          const cyclingDressId = pageIndex === 2 ? cycleDressId : null
          const canvas = getCanvasForStep(pageIndex + 1, cyclingDressId)
          const dressOutfitCount =
            pageIndex === 2 && cyclingDressId !== WHITE_DRESS_ID
              ? DRESSES.findIndex((dress) => dress.id === cyclingDressId) + 1
              : 0
          const expandedTree = page.tree?.variant === 'expanded' ? page.tree : null

          return (
            <>
              <LessonText
                key={page.id}
                text={page.body}
                className="anchor-lesson__text anchor-lesson__text--enter"
              />

              <div className="lesson-screen__play-area lesson-screen__play-area--centered">
                <div className="anchor-lesson__figure-col">
                  <PrincessCanvas
                    crownId={canvas.crownId}
                    dressId={canvas.dressId}
                    showLock={canvas.showLock}
                  />
                  {pageIndex === 3 && expandedTree && (
                    <AnchorOutfitsFound
                      crownId={expandedTree.crownId}
                      dressIds={expandedTree.dressIds}
                    />
                  )}
                </div>
                {pageIndex === 2 && (
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
                        <span className="anchor-lesson__outfit-count-number">
                          {dressOutfitCount}
                        </span>
                        {' outfit'}
                        {dressOutfitCount !== 1 ? 's' : ''} for Gold Tiara
                      </p>
                    )}
                  </div>
                )}
              </div>

              {pageIndex === 2 && expandedTree && (
                <div className="tree-diagram-wrap">
                  <AnchorTreeDiagram tree={expandedTree} visibleDressCount={dressOutfitCount} />
                </div>
              )}

              {pageIndex === 4 && <AnchorOutfitSum />}
            </>
          )
        }}
      />
    </section>
  )
}
