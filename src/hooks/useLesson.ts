import { useContext } from 'react'
import { LessonContext } from '../context/lesson-context'

export function useLesson() {
  const context = useContext(LessonContext)
  if (!context) {
    throw new Error('useLesson must be used within LessonProvider')
  }
  return context
}
