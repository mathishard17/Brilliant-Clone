export interface OutfitPair {
  crownId: string
  dressId: string
}

export interface OutfitTriple {
  crownId: string
  dressId: string
  shoeId: string
}

export type MiniLessonPageType = 'explanation' | 'challenge'

export interface MiniLessonPageBase {
  id: string
  type: MiniLessonPageType
  title?: string
  nextLabel?: string
  backLabel?: string
}

export interface ExplanationMiniLessonPage extends MiniLessonPageBase {
  type: 'explanation'
  body: string
  equation?: string
}

export interface ChallengeMiniLessonPage<Answer = number> extends MiniLessonPageBase {
  type: 'challenge'
  prompt: string
  answer: Answer
  body?: string
  inputMode?: 'numeric' | 'text'
  feedback?: {
    correct: string
    incorrect: string
    tryAgain?: string
    solution?: string
  }
}

export type ClickthroughMiniLessonPage<Answer = unknown> =
  | ExplanationMiniLessonPage
  | ChallengeMiniLessonPage<Answer>

export interface ClickthroughMiniLesson<
  Page extends ClickthroughMiniLessonPage = ClickthroughMiniLessonPage,
> {
  id: string
  title: string
  description?: string
  pages: readonly Page[]
}

export type InteractiveVisualizationKind =
  | 'outfit-pairs'
  | 'outfit-triples'
  | 'marble-permutations'
  | 'restricted-jewel-permutations'
  | 'identical-jewel-permutations'
  | 'treasure-bag-combinations'
  | 'duplicate-treasure-bags'
  | 'combination-shortcut'
  | 'combination-sort'
  | 'carnival-spinner'
  | 'fair-spinner-builder'
  | 'two-spinner-sample-space'
  | 'default'

export interface InteractiveChallengeContent<Answer = number> {
  id: string
  heading: string
  body: (princessName: string) => string
  visualization: InteractiveVisualizationKind
  prompt: string
  answer: Answer
  feedback: {
    correct: (princessName: string) => string
    incorrect: (princessName: string) => string
    tryAgain: (princessName: string) => string
    solution: (princessName: string) => string
  }
}

export interface Screen1Progress {
  discoveredOutfits: OutfitPair[]
  answer: number | null
  isCorrect: boolean | null
  wrongAttempts: number
  attemptedAnswers: string[]
}

export interface Screen2Progress {
  currentStep: number
}

export interface Screen3Progress {
  discoveredOutfits: OutfitTriple[]
  answer: number | null
  isCorrect: boolean | null
  wrongAttempts: number
  attemptedAnswers: string[]
}

export interface LessonProgress {
  lessonId: string
  currentScreen: number
  /** Last in-lesson section; used to resume after visiting the hub (0). */
  lastLessonScreen?: number
  completed: boolean
  /** Flexible per-section state for newer lessons (answers, page indices, visual discoveries). */
  sectionState: Record<string, Record<string, unknown>>
  screen1: Screen1Progress
  screen2: Screen2Progress
  screen3: Screen3Progress
}

export const LESSON_1_ID = 'lesson-1-princess-outfits'
export const LESSON_2_ID = 'lesson-2-coming-soon'
export const LESSON_3_ID = 'lesson-3-royal-treasure-bags'
export const LESSON_4_ID = 'lesson-4-magic-chance-spinners'
export const LESSON_5_ID = 'lesson-5-fair-games'
export const LESSON_6_ID = 'lesson-6-to-be-updated'
export const LESSON_7_ID = 'lesson-7-to-be-updated'
export const LESSON_8_ID = 'lesson-8-to-be-updated'
export const LESSON_9_ID = 'lesson-9-to-be-updated'
export const LESSON_10_ID = 'lesson-10-to-be-updated'
export const LESSON_11_ID = 'lesson-11-to-be-updated'
export const LESSON_12_ID = 'lesson-12-to-be-updated'
export const LESSON_13_ID = 'lesson-13-to-be-updated'
export const DEFAULT_LESSON_ID = LESSON_1_ID

export function createDefaultLessonProgress(lessonId = DEFAULT_LESSON_ID): LessonProgress {
  return {
    lessonId,
    currentScreen: 0,
    lastLessonScreen: 1,
    completed: false,
    sectionState: {},
    screen1: {
      discoveredOutfits: [],
      answer: null,
      isCorrect: null,
      wrongAttempts: 0,
      attemptedAnswers: [],
    },
    screen2: {
      currentStep: 1,
    },
    screen3: {
      discoveredOutfits: [],
      answer: null,
      isCorrect: null,
      wrongAttempts: 0,
      attemptedAnswers: [],
    },
  }
}
