import { useState } from 'react'
import '../screens/screens.css'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useLesson } from '../hooks/useLesson'
import { LESSON_DEFINITIONS, type LessonDefinition } from '../lessons/registry'

const LESSONS_PER_PAGE = 5
const HOME_HUB_PAGE_KEY = 'royal-academy-home-page'

interface HomeHubProps {
  princessName: string
}

export function HomeHub({ princessName }: HomeHubProps) {
  const { profile, updateLesson, updateScreen } = useLesson()
  const [resetLesson, setResetLesson] = useState<LessonDefinition | null>(null)
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

  const resetMessage = resetLesson
    ? `Reset all progress for ${resetLesson.title}? This clears saved answers and lesson steps.`
    : ''

  return (
    <section className="lesson-screen home-hub">
      <h1>🏰 The Royal Academy</h1>
      <p className="home-hub__welcome">
        Welcome back, <strong>{princessName}</strong>! Choose a lesson to begin your adventure.
      </p>

      <div className="home-hub__lessons">
        {visibleLessons.map((lesson) => {
          const progress = getLessonProgress(lesson)
          const lessonLabel = progress.completed ? `Review ${lesson.title}` : lesson.title
          const available = lesson.available ?? true

          return (
            <article className="home-hub__lesson-entry" key={lesson.id}>
              <button
                type="button"
                className={`home-hub__lesson-card ${available ? 'home-hub__lesson-card--active' : 'home-hub__lesson-card--disabled'}`}
                onClick={() => enterLesson(lesson)}
                disabled={!available}
              >
                <span className="home-hub__lesson-emoji">{lesson.emoji}</span>
                <span className="home-hub__lesson-title">{lessonLabel}</span>
                <span className="home-hub__lesson-desc">{lesson.description}</span>
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
