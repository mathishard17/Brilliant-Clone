import type {
  ChallengeMiniLessonPage,
  ClickthroughMiniLesson,
  ExplanationMiniLessonPage,
  InteractiveVisualizationKind,
} from '../../types/lesson'
import type { Lesson1ThemePack } from '../../themes/themeTypes'

export interface Lesson2ThemeText {
  themeName: string
  learnerRole: string
  collectionLabel: string
  itemNoun: string
  itemNounPlural: string
  arrangementNoun: string
  arrangementNounPlural: string
  firstItemLabel: string
  secondItemLabel: string
  thirdItemLabel: string
}

export function createLesson2ThemeText(theme: Lesson1ThemePack): Lesson2ThemeText {
  const collection = theme.categories.find((category) => category.key === 'dresses') ?? theme.categories[1]
  const [firstItemLabel = 'First token', secondItemLabel = 'Second token', thirdItemLabel = 'Third token'] =
    collection.items

  return {
    themeName: theme.themeName,
    learnerRole: theme.learnerRole,
    collectionLabel: collection.label,
    itemNoun: 'token',
    itemNounPlural: 'tokens',
    arrangementNoun: 'lineup',
    arrangementNounPlural: 'lineups',
    firstItemLabel,
    secondItemLabel,
    thirdItemLabel,
  }
}

interface Lesson2VisualizationSection {
  id: string
  heading: string
  body: (princessName: string) => string
  visualization: InteractiveVisualizationKind
  nextLabel: string
}

export function lesson2VisualizationSections(
  theme: Lesson2ThemeText,
): Record<1 | 3 | 4, Lesson2VisualizationSection> {
  return {
    1: {
      id: 'lesson-2-visualization-1',
      heading: `${theme.themeName} ${theme.arrangementNoun}`,
      body: (princessName) =>
        `Hi ${princessName}! In ${theme.themeName}, you have **3 ${theme.itemNounPlural}** from **${theme.collectionLabel}**: ${theme.firstItemLabel}, ${theme.secondItemLabel}, and ${theme.thirdItemLabel}. Tap them in different orders to place them on the display spots. Each different ${theme.arrangementNoun} is a new permutation. How many ways can you arrange all 3 ${theme.itemNounPlural}?`,
      visualization: 'marble-permutations',
      nextLabel: 'Continue',
    },
    3: {
      id: 'lesson-2-visualization-2',
      heading: `No ${theme.firstItemLabel} First`,
      body: (princessName) =>
        `${princessName}, this ${theme.arrangementNoun} has one rule: **${theme.firstItemLabel} cannot go in the first display spot**. Try making ${theme.arrangementNounPlural} and notice which ones are valid. How many display orders are allowed now?`,
      visualization: 'restricted-jewel-permutations',
      nextLabel: 'Continue',
    },
    4: {
      id: 'lesson-2-visualization-3',
      heading: `Matching ${theme.itemNounPlural}`,
      body: (princessName) =>
        `${princessName}, now the display has **2 matching ${theme.firstItemLabel} ${theme.itemNounPlural}** and **1 ${theme.secondItemLabel} ${theme.itemNoun}**. Since the two matching ${theme.itemNounPlural} look the same, swapping them does not make a new display. How many displays look different?`,
      visualization: 'identical-jewel-permutations',
      nextLabel: 'Continue',
    },
  }
}

export type Lesson2ClickthroughPage = ExplanationMiniLessonPage | ChallengeMiniLessonPage<number>

export function lesson2Clickthrough(
  theme: Lesson2ThemeText,
): ClickthroughMiniLesson<Lesson2ClickthroughPage> {
  return {
    id: 'lesson-2-clickthrough',
    title: `${theme.themeName} Factorials`,
    pages: [
      {
        id: 'lesson-2-clickthrough-page-1',
        type: 'explanation',
        body:
          `**Factorial** is a shortcut for counting how many ways you can put different things in order.\n\nWhen **order matters**, **switching the order** makes a **new arrangement**. A ${theme.firstItemLabel} → ${theme.secondItemLabel} → ${theme.thirdItemLabel} ${theme.arrangementNoun} is different from ${theme.secondItemLabel} → ${theme.firstItemLabel} → ${theme.thirdItemLabel}.`,
      },
      {
        id: 'lesson-2-clickthrough-page-2',
        type: 'explanation',
        body:
          `Start with the **first display spot**.\n\nThere are **3 ${theme.itemNounPlural}** available, so there are **3 choices** for the first spot.`,
      },
      {
        id: 'lesson-2-clickthrough-page-3',
        type: 'explanation',
        body:
          `Now fill the **second display spot**.\n\nOne ${theme.itemNoun} is already placed, so there are only **2 ${theme.itemNounPlural} left**.\n\nThat means there are **2 choices** for the second spot.`,
      },
      {
        id: 'lesson-2-clickthrough-page-4',
        type: 'explanation',
        body:
          `Now fill the **last display spot**.\n\nTwo ${theme.itemNounPlural} are already placed, so there is only **1 ${theme.itemNoun} left**.\n\nThat means there is **1 choice** for the last spot.`,
      },
      {
        id: 'lesson-2-clickthrough-page-5',
        type: 'explanation',
        body:
          `Now multiply the choices for each spot: **3 × 2 × 1 = 6**.\n\nMathematicians write this as **3!**, which means **3 factorial**.\n\nSo **3! = 6**, and that means 3 different ${theme.itemNounPlural} can make **6 unique display orders**.`,
      },
      {
        id: 'lesson-2-clickthrough-page-6',
        type: 'challenge',
        prompt: 'Concept check: what is **5!**?',
        answer: 120,
        body: `Try a bigger ${theme.themeName} display. **5!** means the number of ways to arrange 5 different ${theme.itemNounPlural}.`,
        feedback: {
          correct: 'Exactly! **5! = 5 × 4 × 3 × 2 × 1 = 120**.',
          incorrect: 'Not quite. Start at 5 and multiply one step at a time as the choices shrink.',
          tryAgain: 'Try again!',
          solution:
            'Solution: **5! = 5 × 4 × 3 × 2 × 1**. **5 × 4 = 20**, then **20 × 3 = 60**, then **60 × 2 = 120**.',
        },
        nextLabel: 'Continue',
      },
      {
        id: 'lesson-2-clickthrough-page-7',
        type: 'challenge',
        prompt: `${theme.themeName} shortcut: if **5! = 120**, what is **7!**?`,
        answer: 5040,
        body:
          'You do not have to start from scratch. Connect the known **5!** value to the two new larger choice steps.',
        feedback: {
          correct: 'Beautiful! **7! = 7 × 6 × 120 = 5,040**.',
          incorrect: 'Not quite. Use the known **5!** value, then account for the two new larger choice steps.',
          tryAgain: 'It’s okay, try again!',
          solution:
            'Solution: **7! = 7 × 6 × 5! = 7 × 6 × 120**. **7 × 6 = 42**, and **42 × 120 = 5,040**.',
        },
        nextLabel: 'Continue',
      },
    ],
  }
}

export type Lesson2FinalPage =
  | ExplanationMiniLessonPage
  | (ChallengeMiniLessonPage<number> & {
      successMessage: string
    })

export function lesson2FinalClickthrough(
  theme: Lesson2ThemeText,
): ClickthroughMiniLesson<Lesson2FinalPage> {
  return {
    id: 'lesson-2-final-clickthrough',
    title: 'Order Matters?',
    pages: [
      {
        id: 'lesson-2-final-intro',
        type: 'explanation',
        body:
          `The big counting question is: **Does order matter?**\n\nA **permutation** is when order matters. A ${theme.themeName} ${theme.arrangementNoun} matters: ${theme.firstItemLabel}, ${theme.secondItemLabel}, ${theme.thirdItemLabel} is different from ${theme.thirdItemLabel}, ${theme.secondItemLabel}, ${theme.firstItemLabel}.\n\nA **combination** is when order does not matter. Choosing ${theme.firstItemLabel} and ${theme.secondItemLabel} for a set is the same pair no matter which one you pick first.`,
      },
      {
        id: 'lesson-2-final-examples',
        type: 'explanation',
        body:
          `**Permutation:** passcodes, race winners, parade lineups, display orders.\n\n**Combination:** choosing two ${theme.itemNounPlural}, picking snacks for a picnic, choosing team members.\n\nIf switching the order changes the result, think permutation.`,
      },
      {
        id: 'lesson-2-final-question',
        type: 'challenge',
        prompt:
          `Final challenge: You choose **2 ${theme.itemNounPlural}** for a set from 5 options. Is that a permutation or combination? Type **1** for permutation or **2** for combination.`,
        answer: 2,
        feedback: {
          correct: `Correct! It is a **combination** because ${theme.firstItemLabel} + ${theme.secondItemLabel} is the same pair as ${theme.secondItemLabel} + ${theme.firstItemLabel}.`,
          incorrect: `Not quite. Ask: does the order of picking the ${theme.itemNounPlural} change the final set?`,
          tryAgain: 'Try again! Type **1** for permutation or **2** for combination.',
          solution: `The answer is **2**, combination. The set only cares which ${theme.itemNounPlural} are chosen, not the order you picked them.`,
        },
        successMessage: `You finished ${theme.themeName} ${theme.arrangementNounPlural}! You can now spot when order matters.`,
        nextLabel: 'Finish Lesson',
      },
    ],
  }
}
