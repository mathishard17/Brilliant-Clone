import type {
  ChallengeMiniLessonPage,
  ClickthroughMiniLesson,
  ExplanationMiniLessonPage,
  InteractiveVisualizationKind,
} from '../../types/lesson'

export interface Lesson2VisualizationSection {
  id: string
  heading: string
  body: (princessName: string) => string
  visualization: InteractiveVisualizationKind
  nextLabel: string
}

export const lesson2VisualizationSections: Record<1 | 3 | 4, Lesson2VisualizationSection> = {
  1: {
    id: 'lesson-2-visualization-1',
    heading: '💎 Royal Jewel Lineup',
    body: (princessName) =>
      `Hi ${princessName}! The royal jeweler has **3 magical jewel marbles** for the crown room. Tap them in different orders to place them on the display pillow. Each different lineup is a new permutation. How many ways can you arrange all 3 jewels?`,
    visualization: 'marble-permutations',
    nextLabel: 'Continue',
  },
  3: {
    id: 'lesson-2-visualization-2',
    heading: '🚫 No Ruby First',
    body: (princessName) =>
      `${princessName}, the royal jeweler has one rule: the **Ruby jewel cannot go in the first display spot**. Try making lineups and notice which ones are valid. How many royal display orders are allowed now?`,
    visualization: 'restricted-jewel-permutations',
    nextLabel: 'Continue',
  },
  4: {
    id: 'lesson-2-visualization-3',
    heading: '❤️ Matching Rubies',
    body: (princessName) =>
      `${princessName}, now the crown room has **2 matching Ruby jewels** and **1 Sapphire jewel**. Since the two Rubies look the same, swapping them does not make a new display. How many displays look different?`,
    visualization: 'identical-jewel-permutations',
    nextLabel: 'Continue',
  },
}

export type Lesson2ClickthroughPage = ExplanationMiniLessonPage | ChallengeMiniLessonPage<number>

export const lesson2Clickthrough: ClickthroughMiniLesson<Lesson2ClickthroughPage> = {
  id: 'lesson-2-clickthrough',
  title: 'Royal Factorials',
  pages: [
    {
      id: 'lesson-2-clickthrough-page-1',
      type: 'explanation',
      body:
        '**Factorial** is a shortcut for counting how many ways you can put different things in order.\n\nWhen **order matters**, **switching the order** makes a **new arrangement**. A Ruby → Sapphire → Gold lineup is different from Sapphire → Ruby → Gold.',
    },
    {
      id: 'lesson-2-clickthrough-page-2',
      type: 'explanation',
      body:
        'Start with the **first royal display spot**.\n\nThere are **3 jewel marbles** available, so there are **3 choices** for the first spot.',
    },
    {
      id: 'lesson-2-clickthrough-page-3',
      type: 'explanation',
      body:
        'Now fill the **second display spot**.\n\nOne jewel is already placed, so there are only **2 jewels left**.\n\nThat means there are **2 choices** for the second spot.',
    },
    {
      id: 'lesson-2-clickthrough-page-4',
      type: 'explanation',
      body:
        'Now fill the **last display spot**.\n\nTwo jewels are already placed, so there is only **1 jewel left**.\n\nThat means there is **1 choice** for the last spot.',
    },
    {
      id: 'lesson-2-clickthrough-page-5',
      type: 'explanation',
      body:
        'Now multiply the choices for each spot: **3 × 2 × 1 = 6**.\n\nMathematicians write this as **3!**, which means **3 factorial**.\n\nSo **3! = 6**, and that means 3 different royal jewels can make **6 unique display orders**.',
    },
    {
      id: 'lesson-2-clickthrough-page-6',
      type: 'challenge',
      prompt: 'Concept check: what is **5!**?',
      answer: 120,
      body: 'Try a bigger royal display. **5!** means the number of ways to arrange 5 different royal jewels.',
      feedback: {
        correct: 'Exactly! **5! = 5 × 4 × 3 × 2 × 1 = 120**.',
        incorrect: 'Not quite. Try multiplying **5 × 4 × 3 × 2 × 1** carefully.',
        tryAgain: 'Try again!',
        solution: '**5 × 4 = 20**, then **20 × 3 = 60**, then **60 × 2 = 120**.',
      },
      nextLabel: 'Continue',
    },
    {
      id: 'lesson-2-clickthrough-page-7',
      type: 'challenge',
      prompt: 'Royal shortcut: if **5! = 120**, what is **7!**?',
      answer: 5040,
      body: 'You do not have to start from scratch. **7! = 7 × 6 × 5!**.',
      feedback: {
        correct: 'Beautiful! **7! = 7 × 6 × 120 = 5,040**.',
        incorrect: 'Not quite. Use the shortcut **7 × 6 × 120**.',
        tryAgain: 'It’s okay, try again!',
        solution: '**7 × 6 = 42**, and **42 × 120 = 5,040**.',
      },
      nextLabel: 'Continue',
    },
  ],
}

export type Lesson2FinalPage =
  | ExplanationMiniLessonPage
  | (ChallengeMiniLessonPage<number> & {
      successMessage: string
    })

export const lesson2FinalClickthrough: ClickthroughMiniLesson<Lesson2FinalPage> = {
  id: 'lesson-2-final-clickthrough',
  title: 'Order Matters?',
  pages: [
    {
      id: 'lesson-2-final-intro',
      type: 'explanation',
      body:
        'The big counting question is: **Does order matter?**\n\nA **permutation** is when order matters. A royal parade order matters: Princess, Knight, Dragon is different from Dragon, Knight, Princess.\n\nA **combination** is when order does not matter. Choosing Ruby and Sapphire for a crown is the same pair no matter which one you pick first.',
    },
    {
      id: 'lesson-2-final-examples',
      type: 'explanation',
      body:
        '**Permutation:** castle passcodes, race winners, parade lineups, jewel display orders.\n\n**Combination:** choosing crown jewels, picking snacks for a picnic, choosing team members.\n\nIf switching the order changes the result, think permutation.',
    },
    {
      id: 'lesson-2-final-question',
      type: 'challenge',
      prompt:
        'Final challenge: You choose **2 jewels** for a crown from 5 jewel options. Is that a permutation or combination? Type **1** for permutation or **2** for combination.',
      answer: 2,
      feedback: {
        correct: 'Correct! It is a **combination** because Ruby + Sapphire is the same crown pair as Sapphire + Ruby.',
        incorrect: 'Not quite. Ask: does the order of picking the jewels change the final crown?',
        tryAgain: 'Try again! Type **1** for permutation or **2** for combination.',
        solution: 'The answer is **2**, combination. The crown only cares which jewels are chosen, not the order you picked them.',
      },
      successMessage: 'You finished Royal Arrangements! You can now spot when order matters.',
      nextLabel: 'Finish Lesson',
    },
  ],
}
