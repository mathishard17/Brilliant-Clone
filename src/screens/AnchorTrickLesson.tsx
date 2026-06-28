import { useCallback, useEffect, useRef, useState } from 'react'
import '../screens/screens.css'
import { ClickthroughMiniLesson } from '../components/ClickthroughMiniLesson'
import { LessonText } from '../components/LessonText'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { VoiceButton } from '../components/VoiceButton'
import { PrincessCanvas } from '../components/PrincessCanvas'
import { AnchorOutfitSum } from '../components/AnchorOutfitSum'
import { AnchorOutfitsFound } from '../components/AnchorOutfitsFound'
import { AnchorTreeDiagram } from '../components/AnchorTreeDiagram'
import { screen2MiniLesson } from '../lessons/lesson1/copy'
import { WHITE_DRESS_ID } from '../data/dressColors'
import { DRESSES } from '../lessons/lesson1/data'
import { LESSON_1_ID } from '../types/lesson'
import { useLesson } from '../hooks/useLesson'
import { getProfileLessonProgress } from '../utils/lessonProgress'
import {
  getLesson1ThemeCopy,
  getLesson1ThemeVisual,
  getThemeCategory,
  getThemeItemLabels,
  getThemeItemMotifs,
  getThemeMotif,
  lesson1ThemeStyle,
  resolveLesson1Theme,
} from '../themes/themeResolver'

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

function getAnchorItemIcon(label: string) {
  const normalized = label.toLowerCase()
  if (normalized.includes('fossil')) return '🦴'
  if (normalized.includes('ranger') || normalized.includes('cap') || normalized.includes('hat')) return '🧢'
  if (normalized.includes('helmet')) return normalized.includes('star') ? '⭐' : '🪖'
  if (normalized.includes('safari')) return '🧭'
  if (normalized.includes('rescue')) return '⛑️'
  if (normalized.includes('blue cap')) return '🔵'
  if (normalized.includes('gold cap')) return '🟡'
  if (normalized.includes('topper')) return normalized.includes('glow') ? '💡' : '✨'
  if (normalized.includes('tiara')) return '👑'
  if (normalized.includes('crown')) return '💎'
  return null
}

export function AnchorTrickLesson() {
  const { profile, updateLesson, updateScreen } = useLesson()
  const activeLesson = getProfileLessonProgress(profile, LESSON_1_ID)
  const theme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const copy = getLesson1ThemeCopy(theme)
  const visual = getLesson1ThemeVisual(theme)
  const itemLabels = getThemeItemLabels(theme)
  const itemMotifs = getThemeItemMotifs(theme)
  const motif = getThemeMotif(theme)
  const dressesLabel = getThemeCategory(theme, 'dresses')?.label ?? 'middle choices'
  const firstCrownLabel = itemLabels['gold-tiara']
  const secondCrownLabel = itemLabels['diamond-crown']
  const anchorItemIcons = {
    'gold-tiara': getAnchorItemIcon(firstCrownLabel),
    'diamond-crown': getAnchorItemIcon(secondCrownLabel),
  }
  const dressLabels = DRESSES.map((dress) => itemLabels[dress.id] ?? dress.label)
  const [currentStep, setCurrentStep] = useState(() =>
    Math.min(Math.max(activeLesson.screen2.currentStep, 1), screen2MiniLesson.pages.length),
  )
  const currentPageIndex = Math.min(
    Math.max(currentStep, 1),
    screen2MiniLesson.pages.length,
  ) - 1
  const [cycleDressId, setCycleDressId] = useState(WHITE_DRESS_ID)
  const [isCycling, setIsCycling] = useState(false)
  const cycleToken = useRef(0)
  const autoPlayedRef = useRef(false)
  const pageSaveInFlightRef = useRef<number | null>(null)

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
      if (nextStep === currentStep || pageSaveInFlightRef.current === nextStep) return
      pageSaveInFlightRef.current = nextStep
      cycleToken.current += 1
      setIsCycling(false)
      if (nextStep === 3) {
        setCycleDressId(WHITE_DRESS_ID)
        autoPlayedRef.current = false
      }
      setCurrentStep(nextStep)
      try {
        await updateLesson({
          screen2: { currentStep: nextStep },
        }, LESSON_1_ID)
      } finally {
        if (pageSaveInFlightRef.current === nextStep) {
          pageSaveInFlightRef.current = null
        }
      }
    },
    [currentStep, updateLesson],
  )

  function getStepBody(pageId: string) {
    switch (pageId) {
      case 'anchor-trick-intro':
        return copy.anchorIntro
      case 'lock-gold-tiara':
        return copy.anchorLockFirst.replace('first crown', firstCrownLabel)
      case 'gold-tiara-dresses':
        return `${copy.anchorFirstBranch.replace('first crown', firstCrownLabel).replace('every gown', `every option from ${dressesLabel}`)}

• ${firstCrownLabel} + ${dressLabels[0]}
• ${firstCrownLabel} + ${dressLabels[1]}
• ${firstCrownLabel} + ${dressLabels[2]}`
      case 'diamond-crown-dresses':
        return copy.anchorSecondBranch.replace('second crown', secondCrownLabel)
      case 'six-total-outfits':
        return copy.anchorTotal
      default:
        return screen2MiniLesson.pages.find((page) => page.id === pageId)?.body ?? ''
    }
  }

  return (
    <section className="lesson-screen lesson-screen--themed anchor-lesson" style={lesson1ThemeStyle(theme)}>
      <ScreenBackButton label="← Back" onClick={() => void updateScreen(1, LESSON_1_ID)} />
      <h1>{copy.screen2Title}</h1>
      <VoiceButton
        autoPlay={currentStep === 1}
        enabled={profile.voiceEnabled}
        lessonId={LESSON_1_ID}
        clipKey="lesson1.screen2.anchorIntro"
        themePreference={profile.themePreference}
        label="Listen to the trick"
      />

      <ClickthroughMiniLesson
        miniLesson={screen2MiniLesson}
        currentPageIndex={currentPageIndex}
        onPageChange={updatePage}
        onComplete={() => void updateScreen(3, LESSON_1_ID)}
        completeLabel={copy.screen2Button}
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
                text={getStepBody(page.id)}
                className="anchor-lesson__text anchor-lesson__text--enter"
              />

              <div className="lesson-screen__play-area lesson-screen__play-area--centered">
                <div className="anchor-lesson__figure-col">
                  <PrincessCanvas
                    crownId={canvas.crownId}
                    dressId={canvas.dressId}
                    showLock={canvas.showLock}
                    variant={visual.character}
                    characterConfig={visual.characterConfig}
                    itemStyles={itemMotifs}
                    appearance={profile.appearance}
                  />
                  {pageIndex === 3 && expandedTree && (
                    <AnchorOutfitsFound
                      crownId={expandedTree.crownId}
                      dressIds={expandedTree.dressIds}
                      itemLabels={itemLabels}
                      itemMotifs={itemMotifs}
                      lookNamePlural={copy.lookNamePlural}
                      motifColor={motif.primary}
                      motifShape={motif.shape}
                    />
                  )}
                </div>
                {pageIndex === 2 && (
                  <div className="anchor-lesson__watch-area">
                    <div className="anchor-lesson__watch-btn">
                      <LessonButton
                        label={isCycling ? `Changing ${dressesLabel}...` : `▶ Watch ${dressesLabel} change`}
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
                        {' '}
                        {copy.lookNamePlural} for {firstCrownLabel}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {pageIndex === 2 && expandedTree && (
                <div className="tree-diagram-wrap">
                  <AnchorTreeDiagram
                    tree={expandedTree}
                    visibleDressCount={dressOutfitCount}
                    itemLabels={itemLabels}
                    itemMotifs={itemMotifs}
                    lookNamePlural={copy.lookNamePlural}
                    motifColor={motif.primary}
                    motifShape={motif.shape}
                  />
                </div>
              )}

              {pageIndex === 4 && (
                <AnchorOutfitSum
                  itemLabels={itemLabels}
                  itemIcons={anchorItemIcons}
                  lookNamePlural={copy.lookNamePlural}
                />
              )}
            </>
          )
        }}
      />
    </section>
  )
}
