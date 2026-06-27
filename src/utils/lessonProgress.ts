import {
  DEFAULT_LESSON_ID,
  createDefaultLessonProgress,
  type LessonProgress,
  type OutfitPair,
  type OutfitTriple,
} from '../types/lesson'

/** Merge Firestore data with defaults so older/missing fields never break reads. */
export function normalizeLessonProgress(
  lesson: Partial<LessonProgress> | undefined,
  lessonId = lesson?.lessonId ?? DEFAULT_LESSON_ID,
): LessonProgress {
  const defaults = createDefaultLessonProgress(lessonId)
  if (!lesson) return defaults

  return {
    ...defaults,
    ...lesson,
    sectionState: lesson.sectionState ?? defaults.sectionState,
    screen1: {
      ...defaults.screen1,
      ...lesson.screen1,
      discoveredOutfits: lesson.screen1?.discoveredOutfits ?? defaults.screen1.discoveredOutfits,
    },
    screen2: {
      ...defaults.screen2,
      ...lesson.screen2,
    },
    screen3: {
      ...defaults.screen3,
      ...lesson.screen3,
      discoveredOutfits: lesson.screen3?.discoveredOutfits ?? defaults.screen3.discoveredOutfits,
    },
  }
}

export function normalizeLessonMap(
  lessons: Record<string, Partial<LessonProgress>> | undefined,
): Record<string, LessonProgress> {
  const normalized: Record<string, LessonProgress> = {}

  if (lessons) {
    for (const [lessonId, lesson] of Object.entries(lessons)) {
      normalized[lessonId] = normalizeLessonProgress(lesson, lessonId)
    }
  }

  if (!normalized[DEFAULT_LESSON_ID]) {
    normalized[DEFAULT_LESSON_ID] = createDefaultLessonProgress(DEFAULT_LESSON_ID)
  }

  return normalized
}

export function getProfileLessonProgress(
  profile: {
    activeLessonId?: string
    lessons: Record<string, LessonProgress>
  },
  lessonId = profile.activeLessonId ?? DEFAULT_LESSON_ID,
): LessonProgress {
  return profile.lessons[lessonId] ?? createDefaultLessonProgress(lessonId)
}

/** Deep-merge a lesson update onto the latest saved lesson state. */
export function mergeLessonProgress(
  current: LessonProgress,
  partial: Partial<LessonProgress>,
): LessonProgress {
  return normalizeLessonProgress({
    ...current,
    ...partial,
    sectionState:
      partial.sectionState !== undefined
        ? Object.keys(partial.sectionState).length === 0
          ? {}
          : { ...current.sectionState, ...partial.sectionState }
        : current.sectionState,
    screen1: partial.screen1 ? { ...current.screen1, ...partial.screen1 } : current.screen1,
    screen2: partial.screen2 ? { ...current.screen2, ...partial.screen2 } : current.screen2,
    screen3: partial.screen3 ? { ...current.screen3, ...partial.screen3 } : current.screen3,
  })
}

export function appendOutfitPair(
  lesson: LessonProgress,
  outfit: OutfitPair,
): LessonProgress {
  const exists = lesson.screen1.discoveredOutfits.some(
    (o) => o.crownId === outfit.crownId && o.dressId === outfit.dressId,
  )
  if (exists) return lesson
  return mergeLessonProgress(lesson, {
    screen1: {
      ...lesson.screen1,
      discoveredOutfits: [...lesson.screen1.discoveredOutfits, outfit],
    },
  })
}

export function appendOutfitTriple(
  lesson: LessonProgress,
  outfit: OutfitTriple,
): LessonProgress {
  const exists = lesson.screen3.discoveredOutfits.some(
    (o) =>
      o.crownId === outfit.crownId &&
      o.dressId === outfit.dressId &&
      o.shoeId === outfit.shoeId,
  )
  if (exists) return lesson
  return mergeLessonProgress(lesson, {
    screen3: {
      ...lesson.screen3,
      discoveredOutfits: [...lesson.screen3.discoveredOutfits, outfit],
    },
  })
}

/** Reset a lesson to a fresh state while staying on the hub. */
export function resetLessonProgress(lessonId = DEFAULT_LESSON_ID): Partial<LessonProgress> {
  const defaults = createDefaultLessonProgress(lessonId)
  return {
    lessonId,
    completed: false,
    currentScreen: 0,
    lastLessonScreen: 1,
    sectionState: {},
    screen1: defaults.screen1,
    screen2: defaults.screen2,
    screen3: defaults.screen3,
  }
}
