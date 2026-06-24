import '../screens/screens.css'
import { LessonButton } from '../components/LessonButton'
import { ScreenBackButton } from '../components/ScreenBackButton'
import { useLesson } from '../hooks/useLesson'

interface ComingSoonLessonProps {
  princessName: string
}

export function ComingSoonLesson({ princessName }: ComingSoonLessonProps) {
  const { updateScreen } = useLesson()

  return (
    <section className="lesson-screen lesson-placeholder">
      <ScreenBackButton label="← Back to Academy" onClick={() => void updateScreen(0)} />
      <h1>Coming Soon</h1>
      <p>
        This royal lesson is still being prepared, {princessName}. Check back after the next
        academy update!
      </p>
      <LessonButton label="Back to Academy" onClick={() => void updateScreen(0)} />
    </section>
  )
}
