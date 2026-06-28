import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import '../screens/screens.css'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { KnowledgeGraphHub, type KnowledgeGraphLesson } from '../components/KnowledgeGraphHub'
import { useLesson } from '../hooks/useLesson'
import { useAuth } from '../hooks/useAuth'
import { LESSON_DEFINITIONS, type LessonDefinition } from '../lessons/registry'
import { updateUserProfile } from '../services/userProgress'
import {
  buildFallbackLearningNote,
  generateLearningNotes,
  type LearningNotesRequest,
} from '../services/learningNotesGeneration'
import { LESSON_1_ID, type LessonProgress } from '../types/lesson'
import type { StudentMemory, StudentMemoryConcept } from '../types/user'
import { generateLesson1ThemePack, lesson1ThemeCacheKey } from '../services/themeGeneration'
import { DEFAULT_LESSON_1_THEMES } from '../themes/defaultThemes'
import type { ThemePreference } from '../themes/themeTypes'
import { lesson1ThemeStyle, resolveLesson1Theme } from '../themes/themeResolver'
import {
  deriveKnowledgeGraphState,
  getKnowledgeNodeById,
  getKnowledgeSchemaById,
  canEnterKnowledgeNode,
  type KnowledgeNodeId,
} from '../types/knowledgeGraph'
import {
  getLessonProgressStats,
  getSingleLessonProgressStats,
  getStudentMemoryStats,
  type StudentMemoryStats,
} from '../utils/studentMemory'
import {
  AI_LEARNING_NOTES_CACHE_PREFIX,
  clearAiProgressCachesForLesson,
  createLearningProgressSignature,
  createStableHash,
  readAiCache,
  writeAiCache,
} from '../utils/aiProgressCache'
import { clearLessonVoiceAudioCache } from '../voice'
import { getThemedLessonDisplay } from './homeHubDisplay'
import { SchemaBuilder } from './SchemaBuilder'

const LESSONS_PER_PAGE = 5
const HOME_HUB_PAGE_KEY = 'royal-academy-home-page'
const CUSTOM_THEME_VALUE = 'custom'
const CUSTOM_THEME_MAX_LENGTH = 24
const MAX_RECOMMENDED_LESSONS = 3
const REVIEW_ACCURACY_THRESHOLD = 70
const ENDURANCE_CONCEPT_CAP = 7
const ENDURANCE_CONCEPT_FLOOR = -4
const ENDURANCE_EFFORT_ATTEMPT_CAP = 3
const ENDURANCE_LATE_WRONG_PENALTY = 3
const VISUAL_ENDURANCE_PER_LESSON_CAP = 4
const VISUAL_ENDURANCE_KEYS = new Set(['foundBags', 'selectedIndexes', 'uniqueOrders'])
type ThemeSelectValue = ThemePreference | typeof CUSTOM_THEME_VALUE
type HomeHubPage = 'board' | 'manage' | 'builder'
type HomeHubTab = 'lessons' | 'theme'
type RecommendedLessonAction = 'Start' | 'Continue' | 'Review'

interface RecommendedLessonItem {
  lesson: KnowledgeGraphLesson
  label: string
  action: RecommendedLessonAction
  accuracy: number | null
  showRestart: boolean
}

interface ResetLessonRequest {
  lesson: LessonDefinition
  enterAfterReset: boolean
}

const MANUAL_THEME_OPTIONS: { value: Exclude<ThemePreference, 'surprise'>; label: string }[] = [
  { value: 'royal', label: 'Royal / Princess' },
  { value: 'space', label: 'Space Academy' },
  { value: 'dinosaurs', label: 'Dinosaurs' },
  { value: 'animals', label: 'Animals' },
  { value: 'sports', label: 'Sports' },
]
const RANDOM_MANUAL_THEME_OPTIONS = MANUAL_THEME_OPTIONS.map((option) => option.value)
const THEME_OPTIONS: { value: ThemeSelectValue; label: string }[] = [
  ...MANUAL_THEME_OPTIONS,
  { value: 'surprise', label: 'Surprise me' },
  { value: CUSTOM_THEME_VALUE, label: 'Other...' },
]

function getThemeFallbackMessage(themeName: string, debugError?: string) {
  const debugCopy = import.meta.env.DEV && debugError ? ` Debug: ${debugError}` : ''
  return `AI theme unavailable right now, so I picked ${themeName}.${debugCopy}`
}

interface HomeHubProps {
  princessName: string
}

function getRandomManualThemePreference(): Exclude<ThemePreference, 'surprise'> {
  const randomIndex = Math.floor(Math.random() * RANDOM_MANUAL_THEME_OPTIONS.length)
  return RANDOM_MANUAL_THEME_OPTIONS[randomIndex] ?? 'royal'
}

function mergeLearningStats(
  memoryStats: StudentMemoryStats,
  progressStats: StudentMemoryStats,
): StudentMemoryStats {
  const progressGradedAttempts = progressStats.correctAttempts + progressStats.incorrectAttempts

  if (progressGradedAttempts > 0) {
    return {
      ...progressStats,
      totalAttempts: Math.max(memoryStats.totalAttempts, progressStats.totalAttempts),
      hintsRequested: Math.max(memoryStats.hintsRequested, progressStats.hintsRequested),
    }
  }

  return {
    ...memoryStats,
    totalAttempts: Math.max(memoryStats.totalAttempts, progressStats.totalAttempts),
    hintsRequested: Math.max(memoryStats.hintsRequested, progressStats.hintsRequested),
  }
}

function getLearningEnduranceScore(
  concepts: Record<string, StudentMemoryConcept>,
  fallbackStats: StudentMemoryStats,
): number {
  const conceptList = Object.values(concepts)
  if (conceptList.length === 0) {
    const firstTryCorrect =
      fallbackStats.correctAttempts > 0 &&
      fallbackStats.incorrectAttempts === 0 &&
      fallbackStats.hintsRequested === 0
    if (firstTryCorrect) return ENDURANCE_CONCEPT_CAP

    const effortScore = Math.min(
      fallbackStats.incorrectAttempts,
      ENDURANCE_EFFORT_ATTEMPT_CAP,
    ) * 2
    const recoveryScore = fallbackStats.correctAttempts > 0 || fallbackStats.hintsRequested > 0 ? 1 : 0
    const lateWrongPenalty =
      Math.max(0, fallbackStats.incorrectAttempts - ENDURANCE_EFFORT_ATTEMPT_CAP) *
      ENDURANCE_LATE_WRONG_PENALTY
    return Math.max(
      ENDURANCE_CONCEPT_FLOOR,
      Math.min(ENDURANCE_CONCEPT_CAP, effortScore + recoveryScore - lateWrongPenalty),
    )
  }

  return conceptList.reduce((enduranceScore, concept) => {
    const firstTryCorrect =
      concept.correct > 0 &&
      concept.incorrect === 0 &&
      concept.hintsRequested === 0
    if (firstTryCorrect) return enduranceScore + ENDURANCE_CONCEPT_CAP

    const effortScore = Math.min(concept.incorrect, ENDURANCE_EFFORT_ATTEMPT_CAP) * 2
    const recoveryScore = concept.correct > 0 || concept.hintsRequested > 0 ? 1 : 0
    const lateWrongPenalty =
      Math.max(0, concept.incorrect - ENDURANCE_EFFORT_ATTEMPT_CAP) *
      ENDURANCE_LATE_WRONG_PENALTY
    return enduranceScore + Math.max(
      ENDURANCE_CONCEPT_FLOOR,
      Math.min(ENDURANCE_CONCEPT_CAP, effortScore + recoveryScore - lateWrongPenalty),
    )
  }, 0)
}

function countVisualSectionInteractions(value: unknown): number {
  if (!value || typeof value !== 'object') return 0
  if (Array.isArray(value)) {
    return value.reduce((total, entry) => total + countVisualSectionInteractions(entry), 0)
  }

  return Object.entries(value as Record<string, unknown>).reduce((total, [key, entry]) => {
    if (VISUAL_ENDURANCE_KEYS.has(key) && Array.isArray(entry)) {
      return total + entry.length
    }
    return total + countVisualSectionInteractions(entry)
  }, 0)
}

function getVisualEnduranceScore(lessons: Record<string, LessonProgress>): number {
  return Object.values(lessons).reduce((score, lesson) => {
    const visualInteractions =
      lesson.screen1.discoveredOutfits.length +
      lesson.screen3.discoveredOutfits.length +
      countVisualSectionInteractions(lesson.sectionState)

    return score + Math.min(visualInteractions, VISUAL_ENDURANCE_PER_LESSON_CAP)
  }, 0)
}

function getLearningPowerScore(stats: StudentMemoryStats): number {
  return stats.correctAttempts * 10
}

function formatAttemptsPerProblem(stats: StudentMemoryStats, problemCount: number): string {
  if (problemCount <= 0 || stats.totalAttempts <= 0) return 'New'
  const attemptsPerProblem = stats.totalAttempts / problemCount
  return attemptsPerProblem % 1 === 0
    ? String(attemptsPerProblem)
    : attemptsPerProblem.toFixed(1)
}

function getLearningSparkScore(concepts: Record<string, StudentMemoryConcept>): number {
  return Object.values(concepts).reduce((sparkCount, concept) => {
    const firstTryCorrect =
      concept.correct > 0 &&
      concept.incorrect === 0 &&
      concept.hintsRequested === 0
    return firstTryCorrect ? sparkCount + concept.correct : sparkCount
  }, 0)
}

function getConceptStatsForLesson(
  memory: StudentMemory,
  lessonId: string,
): StudentMemoryStats {
  const falseNegativeCounts = memory.recentEvents.reduce<Record<string, number>>((counts, event) => {
    const learnerAnswer = event.learnerAnswer?.trim()
    const correctAnswer = event.correctAnswer?.trim()
    const normalizedLearnerAnswer = Number.isFinite(Number(learnerAnswer))
      ? String(Number(learnerAnswer))
      : learnerAnswer?.toLowerCase()
    const normalizedCorrectAnswer = Number.isFinite(Number(correctAnswer))
      ? String(Number(correctAnswer))
      : correctAnswer?.toLowerCase()

    if (
      event.lessonId === lessonId &&
      event.type === 'challengeAttempt' &&
      event.outcome === 'incorrect' &&
      normalizedLearnerAnswer &&
      normalizedLearnerAnswer === normalizedCorrectAnswer
    ) {
      counts[event.conceptKey] = (counts[event.conceptKey] ?? 0) + 1
    }

    return counts
  }, {})
  const totals = Object.values(memory.concepts).reduce(
    (stats, concept) => {
      if (concept.lessonId !== lessonId) return stats
      const falseNegatives = Math.min(concept.incorrect, falseNegativeCounts[concept.conceptKey] ?? 0)
      const correctAttempts = concept.correct + falseNegatives
      const incorrectAttempts = concept.incorrect - falseNegatives
      const questionCount = correctAttempts > 0 ? correctAttempts : incorrectAttempts > 0 ? 1 : 0
      const weightedScore = correctAttempts > 0
        ? Math.max(0, correctAttempts - 1) + 0.5 ** incorrectAttempts
        : 0
      return {
        totalAttempts: stats.totalAttempts + concept.attempts,
        correctAttempts: stats.correctAttempts + correctAttempts,
        incorrectAttempts: stats.incorrectAttempts + incorrectAttempts,
        hintsRequested: stats.hintsRequested + concept.hintsRequested,
        weightedScore: stats.weightedScore + weightedScore,
        questionCount: stats.questionCount + questionCount,
      }
    },
    {
      totalAttempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      hintsRequested: 0,
      weightedScore: 0,
      questionCount: 0,
    },
  )

  return {
    ...totals,
    accuracy: totals.questionCount > 0 ? Math.round((totals.weightedScore / totals.questionCount) * 100) : null,
  }
}

export function HomeHub({ princessName }: HomeHubProps) {
  const { profile, updateLesson, updateScreen } = useLesson()
  const { user, setProfile } = useAuth()
  const [resetLesson, setResetLesson] = useState<ResetLessonRequest | null>(null)
  const [generatingTheme, setGeneratingTheme] = useState(false)
  const [themeMessage, setThemeMessage] = useState<string | null>(null)
  const [themeSelection, setThemeSelection] = useState<ThemeSelectValue>(
    profile.customThemeIdea ? CUSTOM_THEME_VALUE : profile.themePreference,
  )
  const [customThemeIdea, setCustomThemeIdea] = useState(profile.customThemeIdea ?? '')
  const [activeHomeHubPage, setActiveHomeHubPage] = useState<HomeHubPage>('board')
  const [activeHomeHubTab, setActiveHomeHubTab] = useState<HomeHubTab>('theme')
  const [selectedBoardNodeId, setSelectedBoardNodeId] = useState<KnowledgeNodeId | undefined>()
  const [showLearningStats, setShowLearningStats] = useState(false)
  const aiCacheScope = user?.uid ?? profile.username
  const pageCount = Math.ceil(LESSON_DEFINITIONS.length / LESSONS_PER_PAGE)
  const [page, setPage] = useState(() => {
    const savedPage = Number(window.sessionStorage.getItem(HOME_HUB_PAGE_KEY) ?? 0)
    if (!Number.isFinite(savedPage)) return 0
    return Math.min(Math.max(savedPage, 0), Math.max(pageCount - 1, 0))
  })
  const pageStart = page * LESSONS_PER_PAGE
  const visibleLessons = LESSON_DEFINITIONS.slice(pageStart, pageStart + LESSONS_PER_PAGE)
  const activeTheme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const studentMemory = profile.studentMemory
  const rawMemoryStats = useMemo(() => getStudentMemoryStats(studentMemory), [studentMemory])
  const progressStats = useMemo(() => getLessonProgressStats(profile.lessons), [profile.lessons])
  const memoryStats = useMemo(
    () => mergeLearningStats(rawMemoryStats, progressStats),
    [progressStats, rawMemoryStats],
  )
  const learningEndurance = useMemo(
    () => getLearningEnduranceScore(studentMemory.concepts, memoryStats) + getVisualEnduranceScore(profile.lessons),
    [memoryStats, profile.lessons, studentMemory.concepts],
  )
  const learningPower = getLearningPowerScore(memoryStats)
  const learningSpark = useMemo(
    () => getLearningSparkScore(studentMemory.concepts),
    [studentMemory.concepts],
  )
  const attemptsPerProblem = useMemo(
    () => formatAttemptsPerProblem(memoryStats, Object.keys(studentMemory.concepts).length),
    [memoryStats, studentMemory.concepts],
  )
  const graphState = deriveKnowledgeGraphState({
    lessons: profile.lessons,
    lessonDefinitions: LESSON_DEFINITIONS,
    activeThemeLabel: activeTheme.themeName,
    studentMemory,
  })

  useEffect(() => {
    if (!profile.aiEnabled && activeHomeHubPage === 'builder') {
      setActiveHomeHubPage('board')
    }
  }, [activeHomeHubPage, profile.aiEnabled])

  function updatePage(nextPage: number) {
    const safePage = Math.min(Math.max(nextPage, 0), Math.max(pageCount - 1, 0))
    window.sessionStorage.setItem(HOME_HUB_PAGE_KEY, String(safePage))
    setPage(safePage)
  }

  function getLessonProgress(lesson: LessonDefinition) {
    return profile.lessons[lesson.id] ?? lesson.createDefaultProgress()
  }

  function enterLesson(lesson: LessonDefinition) {
    const progress = getLessonProgress(lesson)
    void updateScreen(lesson.getResumeScreen(progress), lesson.id)
  }

  function enterLessonById(lessonId: string) {
    const lesson = LESSON_DEFINITIONS.find((entry) => entry.id === lessonId)
    if (!lesson) return
    const nodeState = graphState[lesson.graphNodeId]
    if (canEnterKnowledgeNode(nodeState?.status, lesson.available ?? true)) {
      enterLesson(lesson)
    }
  }

  function resetLessonById(lessonId: string, enterAfterReset = false) {
    const lesson = LESSON_DEFINITIONS.find((entry) => entry.id === lessonId)
    if (lesson && (lesson.available ?? true)) setResetLesson({ lesson, enterAfterReset })
  }

  function selectRecommendedLessonOnBoard(lesson: KnowledgeGraphLesson) {
    setSelectedBoardNodeId(lesson.graphNodeId)
  }

  async function handleConfirmResetLesson() {
    if (!resetLesson) return
    const { lesson, enterAfterReset } = resetLesson
    setResetLesson(null)
    clearLessonVoiceAudioCache(lesson.id)
    clearAiProgressCachesForLesson(aiCacheScope, lesson.id)
    await updateLesson({
      ...lesson.resetProgress(),
      ...(enterAfterReset ? { currentScreen: 1, lastLessonScreen: 1 } : {}),
    }, lesson.id)
  }

  async function saveThemePreference(
    themePreference: ThemePreference,
    successMessage = 'Adventure theme updated.',
  ) {
    if (!user) return false
    const themePacks = {
      ...profile.themePacks,
      [LESSON_1_ID]: DEFAULT_LESSON_1_THEMES[themePreference],
    }
    const nextProfile = { ...profile, themePreference, customThemeIdea: '', themePacks }
    setProfile(nextProfile)
    try {
      await updateUserProfile(user.uid, { themePreference, customThemeIdea: '', themePacks })
      setThemeMessage(successMessage)
      return true
    } catch {
      setProfile(profile)
      setThemeMessage("Couldn't save theme preference. Please try again.")
      return false
    }
  }

  async function handleThemeSelectionChange(nextSelection: ThemeSelectValue) {
    setThemeSelection(nextSelection)
    setThemeMessage(null)
    if (nextSelection === CUSTOM_THEME_VALUE) return

    const saved = await saveThemePreference(nextSelection)
    if (!saved) setThemeSelection(profile.themePreference)
  }

  async function generateTheme() {
    if (!user) return
    if (!profile.aiEnabled) {
      setThemeMessage('Turn AI on to create a generated theme.')
      return
    }
    setGeneratingTheme(true)
    setThemeMessage('Creating your adventure...')
    try {
      if (themeSelection === CUSTOM_THEME_VALUE) {
        const customLabel = customThemeIdea.trim()
        if (!customLabel) {
          setThemeMessage('Type a theme idea first.')
          return
        }

        const requestedPreference: ThemePreference = 'surprise'
        const { themePack, source, debugError } = await generateLesson1ThemePack(requestedPreference, customLabel)
        const resolvedThemePack =
          source === 'fallback' ? DEFAULT_LESSON_1_THEMES[requestedPreference] : themePack
        const themePacks = {
          ...profile.themePacks,
          [lesson1ThemeCacheKey()]: resolvedThemePack,
        }
        const nextProfile = {
          ...profile,
          themePreference: requestedPreference,
          customThemeIdea: customLabel,
          themePacks,
        }
        setProfile(nextProfile)
        await updateUserProfile(user.uid, {
          themePreference: requestedPreference,
          customThemeIdea: customLabel,
          themePacks,
        })
        setThemeSelection(CUSTOM_THEME_VALUE)
        setThemeMessage(
          source === 'generated'
            ? `Using ${resolvedThemePack.themeName}.`
            : `${getThemeFallbackMessage(resolvedThemePack.themeName, debugError)} Your custom idea is saved so you can retry it later.`,
        )
        return
      }

      const requestedPreference =
        themeSelection === 'surprise' ? getRandomManualThemePreference() : themeSelection
      const { themePack, source, debugError } = await generateLesson1ThemePack(requestedPreference)
      const resolvedThemePack =
        source === 'fallback' ? DEFAULT_LESSON_1_THEMES[requestedPreference] : themePack
      if (source === 'fallback') {
        setThemeMessage(getThemeFallbackMessage(resolvedThemePack.themeName, debugError))
      }

      const themePacks = {
        ...profile.themePacks,
        [lesson1ThemeCacheKey()]: resolvedThemePack,
      }
      const nextProfile = { ...profile, themePreference: requestedPreference, customThemeIdea: '', themePacks }
      setProfile(nextProfile)
      await updateUserProfile(user.uid, { themePreference: requestedPreference, customThemeIdea: '', themePacks })
      setThemeSelection(requestedPreference)
      if (source === 'generated') {
        setThemeMessage(`Using ${resolvedThemePack.themeName}.`)
      }
    } catch {
      setProfile(profile)
      setThemeMessage('AI theme unavailable right now, so your current theme is still ready.')
    } finally {
      setGeneratingTheme(false)
    }
  }

  const resetLessonTitle = resetLesson
    ? getThemedLessonDisplay(resetLesson.lesson, activeTheme, profile.themePreference).title
    : ''
  const resetMessage = resetLesson
    ? `Reset all progress for ${resetLessonTitle}? This clears saved answers and lesson steps.`
    : ''

  function getLessonStats(definition: LessonDefinition): StudentMemoryStats {
    const progress = getLessonProgress(definition)
    const progressStats = progress
      ? getSingleLessonProgressStats(progress)
      : {
          totalAttempts: 0,
          correctAttempts: 0,
          incorrectAttempts: 0,
          hintsRequested: 0,
          accuracy: null,
          weightedScore: 0,
          questionCount: 0,
        }

    return mergeLearningStats(getConceptStatsForLesson(studentMemory, definition.id), progressStats)
  }

  const graphLessons: KnowledgeGraphLesson[] = LESSON_DEFINITIONS.map((lesson) => {
    const lessonDisplay = getThemedLessonDisplay(lesson, activeTheme, profile.themePreference)
    const lessonStats = getLessonStats(lesson)
    return {
      lessonId: lesson.id,
      graphNodeId: lesson.graphNodeId,
      title: lessonDisplay.title,
      emoji: lessonDisplay.emoji,
      available: lesson.available ?? true,
      state: graphState[lesson.graphNodeId],
      accuracy: lessonStats.accuracy,
    }
  })
  const masteredSubjects = graphLessons
    .filter((lesson) => lesson.state.status === 'mastered')
    .map((lesson) => getKnowledgeNodeById(lesson.graphNodeId).label)

  function getGraphLessonStats(lesson: KnowledgeGraphLesson) {
    return getLessonStats(LESSON_DEFINITIONS.find((entry) => entry.id === lesson.lessonId) ?? LESSON_DEFINITIONS[0])
  }

  function createRecommendation(
    lesson: KnowledgeGraphLesson,
    action: RecommendedLessonAction,
    showRestart = false,
  ): RecommendedLessonItem {
    return {
      lesson,
      label: getKnowledgeNodeById(lesson.graphNodeId).label,
      action,
      accuracy: action === 'Review' ? getGraphLessonStats(lesson).accuracy : null,
      showRestart,
    }
  }

  const inProgressRecommendations = graphLessons
    .filter((lesson) => lesson.available && lesson.state.status === 'inProgress')
    .map((lesson) => createRecommendation(lesson, 'Continue'))
  const nextAvailableRecommendation = graphLessons.find((lesson) =>
    lesson.available && lesson.state.status === 'available',
  )
  const reviewRecommendations = graphLessons
    .filter((lesson) => lesson.available && ['completed', 'mastered'].includes(lesson.state.status))
    .map((lesson) => ({ lesson, stats: getGraphLessonStats(lesson) }))
    .filter(({ stats }) =>
      stats.correctAttempts + stats.incorrectAttempts >= 2 &&
      stats.accuracy !== null &&
      stats.accuracy < REVIEW_ACCURACY_THRESHOLD,
    )
    .sort((first, second) => (first.stats.accuracy ?? 100) - (second.stats.accuracy ?? 100))
    .map(({ lesson }) => createRecommendation(lesson, 'Review', true))
  const recommendedLessonItems = [
    ...inProgressRecommendations,
    ...(nextAvailableRecommendation ? [createRecommendation(nextAvailableRecommendation, 'Start')] : []),
    ...reviewRecommendations,
  ].slice(0, MAX_RECOMMENDED_LESSONS)
  const learningProgressSignature = useMemo(
    () => createLearningProgressSignature(profile.lessons, studentMemory),
    [profile.lessons, studentMemory],
  )
  const recommendedNextLabels = recommendedLessonItems.map((item) => item.label).join(', ') || undefined
  const activeThemeName = activeTheme.themeName
  const learningNotesCacheKey = [
    AI_LEARNING_NOTES_CACHE_PREFIX,
    aiCacheScope,
    createStableHash(learningProgressSignature),
  ].join(':')
  const localLearningNoteRequest: LearningNotesRequest = {
    stats: memoryStats,
    strengths: studentMemory.strengths,
    growthAreas: studentMemory.growthAreas,
    recentEvents: studentMemory.recentEvents,
    activeThemeLabel: activeThemeName,
    recommendedNext: recommendedNextLabels,
  }
  const localLearningNote = {
    key: learningProgressSignature,
    note: buildFallbackLearningNote(localLearningNoteRequest),
    source: 'fallback' as const,
  }
  const learningNotesRequestKey = JSON.stringify({
    stats: memoryStats,
    strengths: studentMemory.strengths,
    growthAreas: studentMemory.growthAreas,
    recentEvents: studentMemory.recentEvents,
    activeThemeLabel: activeThemeName,
    recommendedNext: recommendedNextLabels,
  })
  const [learningNoteResult, setLearningNoteResult] = useState<{
    key: string
    note: string
    source: 'generated' | 'fallback'
  } | null>(null)
  const cachedLearningNote = useMemo(() => {
    const cachedNote = readAiCache<{ note: string; source: 'generated' | 'fallback' }>(learningNotesCacheKey)
    return cachedNote
      ? {
          key: learningProgressSignature,
          note: cachedNote.note,
          source: cachedNote.source,
        }
      : null
  }, [learningNotesCacheKey, learningProgressSignature])
  const activeLearningNote = !profile.aiEnabled
    ? localLearningNote
    : learningNoteResult?.key === learningProgressSignature
    ? learningNoteResult
    : cachedLearningNote

  useEffect(() => {
    if (!profile.aiEnabled) return
    if (cachedLearningNote) return

    let cancelled = false
    const learningNotesRequest = JSON.parse(learningNotesRequestKey) as LearningNotesRequest
    void generateLearningNotes(learningNotesRequest).then((result) => {
      if (cancelled) return
      writeAiCache(learningNotesCacheKey, {
        note: result.note,
        source: result.source,
      })
      setLearningNoteResult({
        key: learningProgressSignature,
        note: result.note,
        source: result.source,
      })
    })
    return () => {
      cancelled = true
    }
  }, [
    cachedLearningNote,
    learningNotesRequestKey,
    learningNotesCacheKey,
    learningProgressSignature,
    profile.aiEnabled,
  ])

  return (
    <section
      className="lesson-screen lesson-screen--themed home-hub"
      style={lesson1ThemeStyle(activeTheme)}
      aria-label={`${princessName}'s home hub`}
    >
      {activeHomeHubPage === 'builder' ? (
        <SchemaBuilder
          activeThemeLabel={activeTheme.themeName}
          aiEnabled={profile.aiEnabled}
          cacheScope={aiCacheScope}
          studentMemory={studentMemory}
          onBack={() => setActiveHomeHubPage('board')}
        />
      ) : activeHomeHubPage === 'board' ? (
        <>
          <KnowledgeGraphHub
            lessons={graphLessons}
            activeThemeLabel={activeTheme.themeName}
            aiEnabled={profile.aiEnabled}
            cacheScope={aiCacheScope}
            selectedNodeId={selectedBoardNodeId}
            onSelectNode={setSelectedBoardNodeId}
            onEnterLesson={enterLessonById}
            onResetLesson={resetLessonById}
          />
          <aside className="home-hub__memory-card" aria-label="Learning memory tracker">
            <p className="home-hub__memory-eyebrow">Progress tracker</p>
            <h2>Learning Notes</h2>
            <div className="home-hub__memory-stats">
              <span>
                <strong>{learningEndurance}</strong>
                endurance
              </span>
              <span>
                <strong>{learningPower}</strong>
                power
              </span>
              <span>
                <strong>{studentMemory.currentStreak}</strong>
                streak
              </span>
              <span>
                <strong>{learningSpark}</strong>
                spark
              </span>
            </div>
            <p>
              <strong>Strong spots:</strong>{' '}
              {masteredSubjects.length > 0 ? masteredSubjects.join(', ') : 'finish a glowing topic to show here'}
            </p>
            <p>
              <strong>Practice focus:</strong>{' '}
              {studentMemory.growthAreas.length > 0 ? studentMemory.growthAreas.join(', ') : 'try a hint when you feel stuck'}
            </p>
            <div className="home-hub__memory-recommendation">
              <strong>Recommended next:</strong>{' '}
              {recommendedLessonItems.length > 0 ? (
                <div className="home-hub__memory-recommendation-list">
                  {recommendedLessonItems.map((item) => (
                    <article className="home-hub__memory-recommendation-card" key={`${item.lesson.lessonId}-${item.action}`}>
                      <div className="home-hub__memory-recommendation-info">
                        <button
                          type="button"
                          className="home-hub__memory-recommendation-title"
                          onClick={() => selectRecommendedLessonOnBoard(item.lesson)}
                          aria-label={`Show ${item.label} on the schema board`}
                        >
                          {item.label}
                        </button>
                        {item.accuracy !== null && (
                          <span className="home-hub__memory-recommendation-meta">{item.accuracy}% accuracy</span>
                        )}
                      </div>
                      <div className="home-hub__memory-recommendation-actions">
                        {item.showRestart && (
                          <button
                            type="button"
                            className="home-hub__memory-recommendation-btn home-hub__memory-recommendation-btn--secondary"
                            onClick={() => resetLessonById(item.lesson.lessonId, true)}
                          >
                            Restart
                          </button>
                        )}
                        <button
                          type="button"
                          className="home-hub__memory-recommendation-btn"
                          onClick={() => enterLessonById(item.lesson.lessonId)}
                        >
                          {item.action} →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <span>You're caught up on the schema map.</span>
              )}
            </div>
            <p className="home-hub__memory-ai-note">
              <span>
                {activeLearningNote?.source === 'generated'
                  ? 'AI note'
                  : activeLearningNote?.source === 'fallback'
                    ? 'Learning note'
                    : 'Writing note...'}
              </span>
              {activeLearningNote?.note ?? 'Checking your latest progress...'}
            </p>
          </aside>
          <div className="home-hub__board-actions">
            <button
              type="button"
              className="home-hub__manage-link"
              onClick={() => {
                setActiveHomeHubTab('theme')
                setActiveHomeHubPage('manage')
              }}
            >
              Change my theme
            </button>
            <button
              type="button"
              className="home-hub__manage-link"
              onClick={() => {
                setActiveHomeHubTab('lessons')
                setActiveHomeHubPage('manage')
              }}
            >
              Open lesson list
            </button>
            <button
              type="button"
              className="home-hub__manage-link"
              onClick={() => setActiveHomeHubPage('builder')}
              disabled={!profile.aiEnabled}
              title={!profile.aiEnabled ? 'Turn AI on to make a new schema.' : undefined}
            >
              {profile.aiEnabled ? 'Make new schema' : 'AI off'}
            </button>
          </div>
          <button
            type="button"
            className="home-hub__stats-toggle"
            onClick={() => setShowLearningStats((isShowing) => !isShowing)}
            aria-expanded={showLearningStats}
          >
            {showLearningStats ? 'Hide stats' : 'Show stats'}
          </button>
          {showLearningStats && (
            <div className="home-hub__memory-detail-stats" aria-label="Detailed learning stats">
              <span>
                <strong>{memoryStats.totalAttempts}</strong>
                answers tried
              </span>
              <span>
                <strong>{memoryStats.correctAttempts}</strong>
                solved
              </span>
              <span>
                <strong>{memoryStats.incorrectAttempts}</strong>
                practice tries
              </span>
              <span>
                <strong>{memoryStats.hintsRequested}</strong>
                hints
              </span>
              <span>
                <strong>{attemptsPerProblem}</strong>
                attempts/problem
              </span>
              <span>
                <strong>{memoryStats.accuracy === null ? 'New' : `${memoryStats.accuracy}%`}</strong>
                hidden accuracy
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="home-hub__manage-page">
          <div className="home-hub__manage-header">
            <div>
              <p className="home-hub__manage-eyebrow">Hub controls</p>
              <h2>Choose a theme or lesson</h2>
            </div>
            <button
              type="button"
              className="home-hub__page-btn"
              onClick={() => setActiveHomeHubPage('board')}
            >
              Back to schemas
            </button>
          </div>

          <div className="home-hub__tab-region">
            <div className="home-hub__tabs" role="tablist" aria-label="Home hub options">
              <button
                type="button"
                id="home-hub-theme-tab"
                className={`home-hub__tab ${activeHomeHubTab === 'theme' ? 'home-hub__tab--active' : ''}`}
                role="tab"
                aria-selected={activeHomeHubTab === 'theme'}
                aria-controls="home-hub-theme-panel"
                onClick={() => setActiveHomeHubTab('theme')}
              >
                Change theme
              </button>
              <button
                type="button"
                id="home-hub-lessons-tab"
                className={`home-hub__tab ${activeHomeHubTab === 'lessons' ? 'home-hub__tab--active' : ''}`}
                role="tab"
                aria-selected={activeHomeHubTab === 'lessons'}
                aria-controls="home-hub-lessons-panel"
                onClick={() => setActiveHomeHubTab('lessons')}
              >
                Show lesson list
              </button>
            </div>

            {activeHomeHubTab === 'lessons' ? (
              <div
                id="home-hub-lessons-panel"
                className="home-hub__tab-content"
                role="tabpanel"
                aria-labelledby="home-hub-lessons-tab"
              >
                <div className="home-hub__lessons">
                  {visibleLessons.map((lesson) => {
                    const progress = getLessonProgress(lesson)
                    const lessonDisplay = getThemedLessonDisplay(lesson, activeTheme, profile.themePreference)
                    const lessonLabel = progress.completed ? `Review ${lessonDisplay.title}` : lessonDisplay.title
                    const available = lesson.available ?? true
                    const nodeState = graphState[lesson.graphNodeId]
                    const canOpen = canEnterKnowledgeNode(nodeState.status, available)
                    const knowledgeNode = getKnowledgeNodeById(lesson.graphNodeId)
                    const schema = getKnowledgeSchemaById(knowledgeNode.schemaId)

                    return (
                      <article className="home-hub__lesson-entry" key={lesson.id}>
                        <button
                          type="button"
                          className={`home-hub__lesson-card ${canOpen ? 'home-hub__lesson-card--active' : 'home-hub__lesson-card--disabled'}`}
                          style={{ '--node-neon': schema.neonColor } as CSSProperties}
                          onClick={() => canOpen && enterLesson(lesson)}
                          disabled={!canOpen}
                        >
                          <span className="home-hub__lesson-emoji">{lessonDisplay.emoji}</span>
                          <span className="home-hub__lesson-title">{lessonLabel}</span>
                          <span className="home-hub__lesson-desc">{lessonDisplay.description}</span>
                          {progress.completed && <span className="home-hub__lesson-badge">✓ Completed</span>}
                          {!canOpen && (
                            <span className="home-hub__lesson-badge home-hub__lesson-badge--locked">
                              {available ? 'Locked' : 'Coming soon'}
                            </span>
                          )}
                        </button>
                        {canOpen && ['inProgress', 'completed', 'mastered'].includes(nodeState.status) && (
                          <button
                            type="button"
                            className="home-hub__reset-btn"
                            onClick={() => setResetLesson({ lesson, enterAfterReset: false })}
                          >
                            Reset progress
                          </button>
                        )}
                      </article>
                    )
                  })}
                </div>

                {pageCount > 1 && (
                  <nav className="home-hub__pagination" aria-label="Lesson pages">
                    <button
                      type="button"
                      className="home-hub__page-btn"
                      onClick={() => updatePage(page - 1)}
                      disabled={page === 0}
                    >
                      ← Previous
                    </button>
                    <span>
                      Page {page + 1} of {pageCount}
                    </span>
                    <button
                      type="button"
                      className="home-hub__page-btn"
                      onClick={() => updatePage(page + 1)}
                      disabled={page === pageCount - 1}
                    >
                      Next →
                    </button>
                  </nav>
                )}
              </div>
            ) : (
              <div
                id="home-hub-theme-panel"
                className="home-hub__tab-content"
                role="tabpanel"
                aria-labelledby="home-hub-theme-tab"
              >
                <div className="home-hub__theme-panel home-hub__theme-panel--tabbed">
                  <p className="home-hub__theme-current">
                    Current theme: <strong>{activeTheme.themeName}</strong>
                  </p>
                  <label>
                    Theme name
                    <select
                      className="form-input"
                      value={themeSelection}
                      onChange={(event) => void handleThemeSelectionChange(event.target.value as ThemeSelectValue)}
                    >
                      {THEME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {themeSelection === CUSTOM_THEME_VALUE && (
                    <label>
                      AI theme idea
                      <input
                        className="form-input"
                        maxLength={CUSTOM_THEME_MAX_LENGTH}
                        onChange={(event) => setCustomThemeIdea(event.target.value)}
                        placeholder="e.g. ocean explorers"
                        type="text"
                        value={customThemeIdea}
                      />
                    </label>
                  )}
                  <button
                    type="button"
                    className="home-hub__page-btn"
                    onClick={() => void generateTheme()}
                    disabled={generatingTheme || !profile.aiEnabled}
                  >
                    {!profile.aiEnabled ? 'AI is off' : generatingTheme ? 'Creating...' : 'Create AI theme'}
                  </button>
                  {themeMessage && <p className="home-hub__theme-message">{themeMessage}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={resetLesson !== null}
        title="Are you sure?"
        message={resetMessage}
        onConfirm={() => void handleConfirmResetLesson()}
        onCancel={() => setResetLesson(null)}
      />
    </section>
  )
}
