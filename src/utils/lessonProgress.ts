import {
  createDefaultLessonProgress,
  type LessonProgress,
  type OutfitPair,
  type OutfitTriple,
} from '../types/lesson'

/** Merge Firestore data with defaults so older/missing fields never break reads. */
export function normalizeLessonProgress(
  lesson: Partial<LessonProgress> | undefined,
): LessonProgress {
  const defaults = createDefaultLessonProgress()
  if (!lesson) return defaults

  return {
    ...defaults,
    ...lesson,
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

/** Deep-merge a lesson update onto the latest saved lesson state. */
export function mergeLessonProgress(
  current: LessonProgress,
  partial: Partial<LessonProgress>,
): LessonProgress {
  return normalizeLessonProgress({
    ...current,
    ...partial,
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

/** Reset Lesson 1 (Princess Outfits) to a fresh state while staying on the hub. */
export function resetLesson1Progress(): Partial<LessonProgress> {
  const defaults = createDefaultLessonProgress()
  return {
    completed: false,
    currentScreen: 0,
    lastLessonScreen: 1,
    screen1: defaults.screen1,
    screen2: defaults.screen2,
    screen3: defaults.screen3,
  }
}
