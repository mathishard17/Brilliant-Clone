export interface OutfitPair {
  crownId: string
  dressId: string
}

export interface OutfitTriple {
  crownId: string
  dressId: string
  shoeId: string
}

export interface Screen1Progress {
  discoveredOutfits: OutfitPair[]
  answer: number | null
  isCorrect: boolean | null
}

export interface Screen2Progress {
  currentStep: number
}

export interface Screen3Progress {
  discoveredOutfits: OutfitTriple[]
  answer: number | null
  isCorrect: boolean | null
}

export interface LessonProgress {
  lessonId: string
  currentScreen: number
  /** Last in-lesson screen (1–4); used to resume after visiting the hub (0). */
  lastLessonScreen?: number
  completed: boolean
  screen1: Screen1Progress
  screen2: Screen2Progress
  screen3: Screen3Progress
}

export const LESSON_ID = 'lesson-1-princess-outfits'

export function createDefaultLessonProgress(): LessonProgress {
  return {
    lessonId: LESSON_ID,
    currentScreen: 0,
    lastLessonScreen: 1,
    completed: false,
    screen1: {
      discoveredOutfits: [],
      answer: null,
      isCorrect: null,
    },
    screen2: {
      currentStep: 1,
    },
    screen3: {
      discoveredOutfits: [],
      answer: null,
      isCorrect: null,
    },
  }
}
