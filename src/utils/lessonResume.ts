import type { LessonProgress } from '../types/lesson'
import type { ScreenNumber } from '../types/user'

/** Pick the lesson screen to resume (1–4), separate from hub screen 0. */
export function getResumeScreen(lesson: LessonProgress): ScreenNumber {
  // A finished lesson always reopens on the summary ("Review") rather than
  // wherever the student last browsed.
  if (lesson.completed) {
    return 4
  }

  if (
    lesson.lastLessonScreen !== undefined &&
    lesson.lastLessonScreen >= 1 &&
    lesson.lastLessonScreen <= 4
  ) {
    return lesson.lastLessonScreen as ScreenNumber
  }

  // Legacy profiles without lastLessonScreen — infer from saved progress
  if (lesson.currentScreen >= 1 && lesson.currentScreen <= 4) {
    return lesson.currentScreen as ScreenNumber
  }
  if (lesson.completed) {
    return 4
  }
  if (lesson.screen3.discoveredOutfits.length > 0 || lesson.screen3.answer !== null) {
    return 3
  }
  if (lesson.screen2.currentStep > 1 || lesson.screen1.answer !== null) {
    return 2
  }
  if (lesson.screen1.discoveredOutfits.length > 0) {
    return 1
  }
  return 1
}
