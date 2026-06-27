import { useState } from 'react'
import '../screens/screens.css'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useLesson } from '../hooks/useLesson'
import { useAuth } from '../hooks/useAuth'
import { LESSON_DEFINITIONS, type LessonDefinition } from '../lessons/registry'
import { updateUserProfile } from '../services/userProgress'
import { LESSON_1_ID } from '../types/lesson'
import { generateLesson1ThemePack, lesson1ThemeCacheKey } from '../services/themeGeneration'
import { DEFAULT_LESSON_1_THEMES } from '../themes/defaultThemes'
import type { ThemePreference } from '../themes/themeTypes'
import { lesson1ThemeStyle, resolveLesson1Theme } from '../themes/themeResolver'
import { getThemedLessonDisplay, getThemeHubWords } from './homeHubDisplay'

const LESSONS_PER_PAGE = 5
const HOME_HUB_PAGE_KEY = 'royal-academy-home-page'
const CUSTOM_THEME_VALUE = 'custom'
const CUSTOM_THEME_MAX_LENGTH = 24
type ThemeSelectValue = ThemePreference | typeof CUSTOM_THEME_VALUE
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
  const activeTheme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const hubWords = getThemeHubWords(activeTheme, profile.themePreference)
  const pageCount = Math.ceil(LESSON_DEFINITIONS.length / LESSONS_PER_PAGE)
  const [page, setPage] = useState(() => {
    const savedPage = Number(window.sessionStorage.getItem(HOME_HUB_PAGE_KEY) ?? 0)
    if (!Number.isFinite(savedPage)) return 0
    return Math.min(Math.max(savedPage, 0), Math.max(pageCount - 1, 0))
  })
  const pageStart = page * LESSONS_PER_PAGE
  const visibleLessons = LESSON_DEFINITIONS.slice(pageStart, pageStart + LESSONS_PER_PAGE)

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

  async function handleConfirmResetLesson() {
    if (!resetLesson) return
    const lesson = resetLesson
    setResetLesson(null)
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
        const { themePack, source } = await generateLesson1ThemePack(requestedPreference, customLabel)
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
            : `AI theme unavailable right now, so I picked ${resolvedThemePack.themeName}.`,
        )
        return
      }

      const requestedPreference =
        themeSelection === 'surprise' ? getRandomManualThemePreference() : themeSelection
      const { themePack, source } = await generateLesson1ThemePack(requestedPreference)
      const resolvedThemePack =
        source === 'fallback' ? DEFAULT_LESSON_1_THEMES[requestedPreference] : themePack
      if (source === 'fallback') {
        setThemeMessage(`AI theme unavailable right now, so I picked ${resolvedThemePack.themeName}.`)
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

  const resetMessage = resetLesson
    ? `Reset all progress for ${resetLesson.title}? This clears saved answers and lesson steps.`
    : ''

  return (
    <section className="lesson-screen lesson-screen--themed home-hub" style={lesson1ThemeStyle(activeTheme)}>
      <h1>{hubWords.hubTitle}</h1>
      <p className="home-hub__welcome">
        Welcome back, <strong>{princessName}</strong>! Choose a lesson to begin your adventure.
      </p>

      <div className="home-hub__theme-panel">
        <label>
          Adventure theme
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
            Theme idea
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
          {generatingTheme ? 'Creating...' : 'AI-generate theme'}
        </button>
        {themeMessage && <p className="home-hub__theme-message">{themeMessage}</p>}
      </div>

      <div className="home-hub__lessons">
        {visibleLessons.map((lesson) => {
          const progress = getLessonProgress(lesson)
          const lessonDisplay = getThemedLessonDisplay(lesson, activeTheme, profile.themePreference)
          const lessonLabel = progress.completed ? `Review ${lessonDisplay.title}` : lessonDisplay.title
          const available = lesson.available ?? true

          return (
            <article className="home-hub__lesson-entry" key={lesson.id}>
              <button
                type="button"
                className={`home-hub__lesson-card ${available ? 'home-hub__lesson-card--active' : 'home-hub__lesson-card--disabled'}`}
                onClick={() => enterLesson(lesson)}
                disabled={!available}
              >
                <span className="home-hub__lesson-emoji">{lessonDisplay.emoji}</span>
                <span className="home-hub__lesson-title">{lessonLabel}</span>
                <span className="home-hub__lesson-desc">{lessonDisplay.description}</span>
                {progress.completed && (
                  <span className="home-hub__lesson-badge">✓ Completed</span>
                )}
              </button>
              {available && (
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
