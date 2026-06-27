import { useState, type CSSProperties } from 'react'
import '../screens/screens.css'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { KnowledgeGraphHub, type KnowledgeGraphLesson } from '../components/KnowledgeGraphHub'
import { useLesson } from '../hooks/useLesson'
import { useAuth } from '../hooks/useAuth'
import { LESSON_DEFINITIONS, type LessonDefinition } from '../lessons/registry'
import { updateUserProfile } from '../services/userProgress'
import { LESSON_1_ID } from '../types/lesson'
import { generateLesson1ThemePack, lesson1ThemeCacheKey } from '../services/themeGeneration'
import { DEFAULT_LESSON_1_THEMES } from '../themes/defaultThemes'
import type { ThemePreference } from '../themes/themeTypes'
import { lesson1ThemeStyle, resolveLesson1Theme } from '../themes/themeResolver'
import { deriveKnowledgeGraphState, getKnowledgeNodeById, getKnowledgeSchemaById, canEnterKnowledgeNode } from '../types/knowledgeGraph'
import { getLessonProgressStats, getStudentMemoryStats } from '../utils/studentMemory'
import { clearLessonVoiceAudioCache } from '../voice'
import { getThemedLessonDisplay } from './homeHubDisplay'

const LESSONS_PER_PAGE = 5
const HOME_HUB_PAGE_KEY = 'royal-academy-home-page'
const CUSTOM_THEME_VALUE = 'custom'
const CUSTOM_THEME_MAX_LENGTH = 24
type ThemeSelectValue = ThemePreference | typeof CUSTOM_THEME_VALUE
type HomeHubPage = 'board' | 'manage'
type HomeHubTab = 'lessons' | 'theme'
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

export function HomeHub({ princessName }: HomeHubProps) {
  const { profile, updateLesson, updateScreen } = useLesson()
  const { user, setProfile } = useAuth()
  const [resetLesson, setResetLesson] = useState<LessonDefinition | null>(null)
  const [generatingTheme, setGeneratingTheme] = useState(false)
  const [themeMessage, setThemeMessage] = useState<string | null>(null)
  const [themeSelection, setThemeSelection] = useState<ThemeSelectValue>(
    profile.customThemeIdea ? CUSTOM_THEME_VALUE : profile.themePreference,
  )
  const [customThemeIdea, setCustomThemeIdea] = useState(profile.customThemeIdea ?? '')
  const [activeHomeHubPage, setActiveHomeHubPage] = useState<HomeHubPage>('board')
  const [activeHomeHubTab, setActiveHomeHubTab] = useState<HomeHubTab>('theme')
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
  const rawMemoryStats = getStudentMemoryStats(studentMemory)
  const progressStats = getLessonProgressStats(profile.lessons)
  const memoryStats = progressStats.totalAttempts > 0
    ? {
        totalAttempts: Math.max(rawMemoryStats.totalAttempts, progressStats.totalAttempts),
        correctAttempts: progressStats.correctAttempts,
        incorrectAttempts: progressStats.incorrectAttempts,
        hintsRequested: rawMemoryStats.hintsRequested,
        accuracy: progressStats.accuracy,
      }
    : rawMemoryStats
  const graphState = deriveKnowledgeGraphState({
    lessons: profile.lessons,
    lessonDefinitions: LESSON_DEFINITIONS,
    activeThemeLabel: activeTheme.themeName,
    studentMemory,
  })

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

  function resetLessonById(lessonId: string) {
    const lesson = LESSON_DEFINITIONS.find((entry) => entry.id === lessonId)
    if (lesson && (lesson.available ?? true)) setResetLesson(lesson)
  }

  async function handleConfirmResetLesson() {
    if (!resetLesson) return
    const lesson = resetLesson
    setResetLesson(null)
    clearLessonVoiceAudioCache(lesson.id)
    await updateLesson(lesson.resetProgress(), lesson.id)
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
            : getThemeFallbackMessage(resolvedThemePack.themeName, debugError),
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
    ? getThemedLessonDisplay(resetLesson, activeTheme, profile.themePreference).title
    : ''
  const resetMessage = resetLesson
    ? `Reset all progress for ${resetLessonTitle}? This clears saved answers and lesson steps.`
    : ''
  const graphLessons: KnowledgeGraphLesson[] = LESSON_DEFINITIONS.map((lesson) => {
    const lessonDisplay = getThemedLessonDisplay(lesson, activeTheme, profile.themePreference)
    return {
      lessonId: lesson.id,
      graphNodeId: lesson.graphNodeId,
      title: lessonDisplay.title,
      emoji: lessonDisplay.emoji,
      available: lesson.available ?? true,
      state: graphState[lesson.graphNodeId],
    }
  })
  const masteredSubjects = graphLessons
    .filter((lesson) => lesson.state.status === 'mastered')
    .map((lesson) => getKnowledgeNodeById(lesson.graphNodeId).label)

  return (
    <section
      className="lesson-screen lesson-screen--themed home-hub"
      style={lesson1ThemeStyle(activeTheme)}
      aria-label={`${princessName}'s home hub`}
    >
      {activeHomeHubPage === 'board' ? (
        <>
          <KnowledgeGraphHub
            lessons={graphLessons}
            activeThemeLabel={activeTheme.themeName}
            onEnterLesson={enterLessonById}
            onResetLesson={resetLessonById}
          />
          <aside className="home-hub__memory-card" aria-label="Learning memory tracker">
            <p className="home-hub__memory-eyebrow">Progress tracker</p>
            <h2>Learning Notes</h2>
            <div className="home-hub__memory-stats">
              <span>
                <strong>{memoryStats.totalAttempts}</strong>
                attempts
              </span>
              <span>
                <strong>{memoryStats.hintsRequested}</strong>
                hints
              </span>
              <span>
                <strong>{memoryStats.accuracy === null ? 'New' : `${memoryStats.accuracy}%`}</strong>
                accuracy
              </span>
              <span>
                <strong>{studentMemory.currentStreak}</strong>
                streak
              </span>
            </div>
            <p>
              Strong spots:{' '}
              <strong>{masteredSubjects.length > 0 ? masteredSubjects.join(', ') : 'finish a glowing topic to show here'}</strong>
            </p>
            <p>
              Practice focus:{' '}
              <strong>{studentMemory.growthAreas.length > 0 ? studentMemory.growthAreas.join(', ') : 'try a hint when you feel stuck'}</strong>
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
          </div>
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
                            onClick={() => setResetLesson(lesson)}
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
                    disabled={generatingTheme}
                  >
                    {generatingTheme ? 'Creating...' : 'Create AI theme'}
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
