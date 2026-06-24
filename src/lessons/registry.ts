import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import {
  createDefaultLessonProgress,
  LESSON_1_ID,
  LESSON_2_ID,
  LESSON_3_ID,
  LESSON_4_ID,
  LESSON_5_ID,
  LESSON_6_ID,
  LESSON_7_ID,
  LESSON_8_ID,
  LESSON_9_ID,
  LESSON_10_ID,
  type LessonProgress,
} from '../types/lesson'
import type { ScreenNumber } from '../types/user'
import { resetLessonProgress } from '../utils/lessonProgress'
import { getResumeScreen } from '../utils/lessonResume'

export interface LessonScreenProps {
  princessName: string
}

export type LessonScreenComponent = LazyExoticComponent<ComponentType<LessonScreenProps>>

export interface LessonDefinition {
  id: string
  title: string
  emoji: string
  description: string
  progressSteps: readonly string[]
  createDefaultProgress: () => LessonProgress
  getResumeScreen: (progress: LessonProgress) => ScreenNumber
  resetProgress: () => Partial<LessonProgress>
  screens: Record<number, LessonScreenComponent>
  available?: boolean
}

const Lesson1DressingRoom = lazy(() =>
  import('./lesson1/screens').then((m) => ({ default: m.DressingRoom })),
)
const Lesson1AnchorTrick = lazy(() =>
  import('./lesson1/screens').then((m) => ({ default: m.AnchorTrickLesson })),
)
const Lesson1ShoesChallenge = lazy(() =>
  import('./lesson1/screens').then((m) => ({ default: m.ShoesChallenge })),
)
const Lesson1Summary = lazy(() =>
  import('./lesson1/screens').then((m) => ({ default: m.LessonSummary })),
)
const Lesson2VisualizationOne = lazy(() =>
  import('./lesson2/screens').then((m) => ({ default: m.Lesson2VisualizationOne })),
)
const Lesson2Clickthrough = lazy(() =>
  import('./lesson2/screens').then((m) => ({ default: m.Lesson2Clickthrough })),
)
const Lesson2VisualizationTwo = lazy(() =>
  import('./lesson2/screens').then((m) => ({ default: m.Lesson2VisualizationTwo })),
)
const Lesson2VisualizationThree = lazy(() =>
  import('./lesson2/screens').then((m) => ({ default: m.Lesson2VisualizationThree })),
)
const Lesson2FinalClickthrough = lazy(() =>
  import('./lesson2/screens').then((m) => ({ default: m.Lesson2FinalClickthrough })),
)
const Lesson3TreasureBagPicker = lazy(() =>
  import('./lesson3/screens').then((m) => ({ default: m.Lesson3TreasureBagPicker })),
)
const Lesson3SameBagLesson = lazy(() =>
  import('./lesson3/screens').then((m) => ({ default: m.Lesson3SameBagLesson })),
)
const Lesson3CountingShortcut = lazy(() =>
  import('./lesson3/screens').then((m) => ({ default: m.Lesson3CountingShortcut })),
)
const Lesson3RoyalBagChallenge = lazy(() =>
  import('./lesson3/screens').then((m) => ({ default: m.Lesson3RoyalBagChallenge })),
)
const Lesson3FinalSort = lazy(() =>
  import('./lesson3/screens').then((m) => ({ default: m.Lesson3FinalSort })),
)
const Lesson4OneSpin = lazy(() =>
  import('./lesson4/screens').then((m) => ({ default: m.Lesson4OneSpin })),
)
const Lesson4WinningSpaces = lazy(() =>
  import('./lesson4/screens').then((m) => ({ default: m.Lesson4WinningSpaces })),
)
const Lesson4MoreLikely = lazy(() =>
  import('./lesson4/screens').then((m) => ({ default: m.Lesson4MoreLikely })),
)
const Lesson4ImpossibleCertain = lazy(() =>
  import('./lesson4/screens').then((m) => ({ default: m.Lesson4ImpossibleCertain })),
)
const Lesson4Finale = lazy(() =>
  import('./lesson4/screens').then((m) => ({ default: m.Lesson4Finale })),
)
const Lesson5SampleSpaceIntro = lazy(() =>
  import('./lesson5/screens').then((m) => ({ default: m.Lesson5SampleSpaceIntro })),
)
const Lesson5SpinnerInspector = lazy(() =>
  import('./lesson5/screens').then((m) => ({ default: m.Lesson5SpinnerInspector })),
)
const Lesson5FairnessCheck = lazy(() =>
  import('./lesson5/screens').then((m) => ({ default: m.Lesson5FairnessCheck })),
)
const Lesson5FairSpinnerBuilder = lazy(() =>
  import('./lesson5/screens').then((m) => ({ default: m.Lesson5FairSpinnerBuilder })),
)
const Lesson5RoyalReview = lazy(() =>
  import('./lesson5/screens').then((m) => ({ default: m.Lesson5RoyalReview })),
)
const ComingSoonLesson = lazy(() =>
  import('./ComingSoonLesson').then((m) => ({ default: m.ComingSoonLesson })),
)

function createComingSoonLesson(
  id: string,
  title: string,
  emoji: string,
  description = 'To be updated',
): LessonDefinition {
  return {
    id,
    title,
    emoji,
    description,
    progressSteps: ['Preview'],
    createDefaultProgress: () => createDefaultLessonProgress(id),
    getResumeScreen: () => 1,
    resetProgress: () => resetLessonProgress(id),
    screens: {
      1: ComingSoonLesson,
    },
    available: false,
  }
}

export const LESSON_DEFINITIONS: LessonDefinition[] = [
  {
    id: LESSON_1_ID,
    title: 'Lesson 1: Princess Outfits',
    emoji: '👑',
    description: 'Count combinations with crowns, gowns, & shoes',
    progressSteps: ['Dress Up', 'The Trick', 'Add Shoes', 'Finish'],
    createDefaultProgress: () => createDefaultLessonProgress(LESSON_1_ID),
    getResumeScreen: (progress) => getResumeScreen(progress, 4),
    resetProgress: () => resetLessonProgress(LESSON_1_ID),
    screens: {
      1: Lesson1DressingRoom,
      2: Lesson1AnchorTrick,
      3: Lesson1ShoesChallenge,
      4: Lesson1Summary,
    },
  },
  {
    id: LESSON_2_ID,
    title: 'Lesson 2: Royal Arrangements',
    emoji: '💎',
    description: 'Arrange royal jewels and discover factorials',
    progressSteps: ['Jewel Lineup', 'Factorials', 'No Ruby First', 'Matching Rubies', 'Order Matters'],
    createDefaultProgress: () => createDefaultLessonProgress(LESSON_2_ID),
    getResumeScreen: (progress) => getResumeScreen(progress, 5),
    resetProgress: () => resetLessonProgress(LESSON_2_ID),
    screens: {
      1: Lesson2VisualizationOne,
      2: Lesson2Clickthrough,
      3: Lesson2VisualizationTwo,
      4: Lesson2VisualizationThree,
      5: Lesson2FinalClickthrough,
    },
  },
  {
    id: LESSON_3_ID,
    title: 'Lesson 3: Royal Treasure Bags',
    emoji: '🎁',
    description: 'Choose royal treasures when order does not matter',
    progressSteps: ['Treasure Bags', 'Same Bag', 'No Repeats', 'Bag Challenge', 'Order Check'],
    createDefaultProgress: () => createDefaultLessonProgress(LESSON_3_ID),
    getResumeScreen: (progress) => getResumeScreen(progress, 5),
    resetProgress: () => resetLessonProgress(LESSON_3_ID),
    screens: {
      1: Lesson3TreasureBagPicker,
      2: Lesson3SameBagLesson,
      3: Lesson3CountingShortcut,
      4: Lesson3RoyalBagChallenge,
      5: Lesson3FinalSort,
    },
  },
  {
    id: LESSON_4_ID,
    title: 'Lesson 4: Magic Chance Spinners',
    emoji: '⭐',
    description: 'Count winning spaces to discover chance',
    progressSteps: ['Outcomes', 'Winning Spaces', 'More Likely', 'Impossible/Certain', 'Final Wheel'],
    createDefaultProgress: () => createDefaultLessonProgress(LESSON_4_ID),
    getResumeScreen: (progress) => getResumeScreen(progress, 5),
    resetProgress: () => resetLessonProgress(LESSON_4_ID),
    screens: {
      1: Lesson4OneSpin,
      2: Lesson4WinningSpaces,
      3: Lesson4MoreLikely,
      4: Lesson4ImpossibleCertain,
      5: Lesson4Finale,
    },
  },
  {
    id: LESSON_5_ID,
    title: 'Lesson 5: Fair Games',
    emoji: '🎪',
    description: 'List sample spaces and check fair carnival games',
    progressSteps: ['Sample Space', 'Count Chances', 'Fair or Unfair', 'Fix the Game', 'Royal Review'],
    createDefaultProgress: () => createDefaultLessonProgress(LESSON_5_ID),
    getResumeScreen: (progress) => getResumeScreen(progress, 5),
    resetProgress: () => resetLessonProgress(LESSON_5_ID),
    screens: {
      1: Lesson5SampleSpaceIntro,
      2: Lesson5SpinnerInspector,
      3: Lesson5FairnessCheck,
      4: Lesson5FairSpinnerBuilder,
      5: Lesson5RoyalReview,
    },
  },
  createComingSoonLesson(LESSON_6_ID, 'Lesson 6: To Be Updated', '✨'),
  createComingSoonLesson(LESSON_7_ID, 'Lesson 7: To Be Updated', '🌙'),
  createComingSoonLesson(LESSON_8_ID, 'Lesson 8: To Be Updated', '🦄'),
  createComingSoonLesson(LESSON_9_ID, 'Lesson 9: To Be Updated', '🏰'),
  createComingSoonLesson(LESSON_10_ID, 'Lesson 10: To Be Updated', '🎇'),
]

export function getLessonDefinition(lessonId: string): LessonDefinition {
  return LESSON_DEFINITIONS.find((lesson) => lesson.id === lessonId) ?? LESSON_DEFINITIONS[0]
}
