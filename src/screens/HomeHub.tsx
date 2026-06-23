import { useState } from 'react'
import '../screens/screens.css'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useLesson } from '../hooks/useLesson'
import { resetLesson1Progress } from '../utils/lessonProgress'
import { getResumeScreen } from '../utils/lessonResume'

interface HomeHubProps {
  princessName: string
}

export function HomeHub({ princessName }: HomeHubProps) {
  const { profile, updateLesson, updateScreen } = useLesson()
  const lessonCompleted = profile.lesson.completed
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  function enterLesson1() {
    void updateScreen(getResumeScreen(profile.lesson))
  }

  async function handleConfirmResetLesson1() {
    setResetConfirmOpen(false)
    await updateLesson(resetLesson1Progress())
  }

  const lessonLabel = lessonCompleted ? 'Review Lesson 1' : 'Lesson 1: Princess Outfits'

  return (
    <section className="lesson-screen home-hub">
      <h1>🏰 The Royal Academy</h1>
      <p className="home-hub__welcome">
        Welcome back, <strong>{princessName}</strong>! Choose a lesson to begin your adventure.
      </p>

      <div className="home-hub__lessons">
        <article className="home-hub__lesson-entry">
          <button
            type="button"
            className="home-hub__lesson-card home-hub__lesson-card--active"
            onClick={enterLesson1}
          >
            <span className="home-hub__lesson-emoji">👑</span>
            <span className="home-hub__lesson-title">{lessonLabel}</span>
            <span className="home-hub__lesson-desc">Count combinations with crowns, gowns, &amp; shoes</span>
            {lessonCompleted && (
              <span className="home-hub__lesson-badge">✓ Completed</span>
            )}
          </button>
          <button
            type="button"
            className="home-hub__reset-btn"
            onClick={() => setResetConfirmOpen(true)}
          >
            Reset Lesson 1 progress
          </button>
        </article>

        <article className="home-hub__lesson-entry">
          <div className="home-hub__lesson-card home-hub__lesson-card--disabled">
            <span className="home-hub__lesson-emoji">🔮</span>
            <span className="home-hub__lesson-title">Lesson 2</span>
            <span className="home-hub__lesson-desc">To be updated</span>
          </div>
          <button type="button" className="home-hub__reset-btn" disabled>
            Reset Lesson 2 progress
          </button>
        </article>

        <article className="home-hub__lesson-entry">
          <div className="home-hub__lesson-card home-hub__lesson-card--disabled">
            <span className="home-hub__lesson-emoji">🌟</span>
            <span className="home-hub__lesson-title">Lesson 3</span>
            <span className="home-hub__lesson-desc">To be updated</span>
          </div>
          <button type="button" className="home-hub__reset-btn" disabled>
            Reset Lesson 3 progress
          </button>
        </article>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Are you sure?"
        message="Reset all progress for Lesson 1? This clears your outfits, answers, and lesson steps."
        onConfirm={() => void handleConfirmResetLesson1()}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </section>
  )
}
