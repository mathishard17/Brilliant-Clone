import type {
  ChallengeMiniLessonPage,
  ClickthroughMiniLesson,
  ExplanationMiniLessonPage,
  InteractiveVisualizationKind,
} from '../../types/lesson'

export const lesson3Treasures = [
  { id: 'ruby', label: 'Ruby', ariaLabel: 'Ruby treasure' },
  { id: 'sapphire', label: 'Sapphire', ariaLabel: 'Sapphire treasure' },
  { id: 'emerald', label: 'Emerald', ariaLabel: 'Emerald treasure' },
  { id: 'pearl', label: 'Pearl', ariaLabel: 'Pearl treasure' },
  { id: 'amethyst', label: 'Amethyst', ariaLabel: 'Amethyst treasure' },
] as const

export type Lesson3TreasureId = (typeof lesson3Treasures)[number]['id']

export interface Lesson3VisualizationSection {
  id: string
  heading: string
  body: (princessName: string) => string
  visualization: InteractiveVisualizationKind
  nextLabel: string
}

export const lesson3TreasureBagSection: Lesson3VisualizationSection = {
  id: 'lesson-3-treasure-bag-picker',
  heading: '🎁 Open the Royal Vault',
  body: (princessName) =>
    `Hi, ${princessName}! The royal vault is sparkling today. Choose **2 different treasures** for each royal gift bag. How many different treasure bags can you make?`,
  visualization: 'treasure-bag-combinations',
  nextLabel: 'Compare Two Bags',
}

export type Lesson3SameBagPage = ExplanationMiniLessonPage

export const lesson3SameBagMiniLesson: ClickthroughMiniLesson<Lesson3SameBagPage> = {
  id: 'lesson-3-same-bag',
  title: 'The Same Bag Test',
  pages: [
    {
      id: 'same-bag-look',
      type: 'explanation',
      body: 'Look closely at these two royal treasure bags.',
    },
    {
      id: 'same-bag-a',
      type: 'explanation',
      body: 'Bag A: **Ruby**, then **Sapphire**.',
    },
    {
      id: 'same-bag-b',
      type: 'explanation',
      body: 'Bag B: **Sapphire**, then **Ruby**.',
    },
    {
      id: 'same-bag-match',
      type: 'explanation',
      body: 'Both bags have Ruby and Sapphire. **Same treasures, same bag.**',
    },
    {
      id: 'same-bag-combination',
      type: 'explanation',
      body:
        'When order does **not** matter, mathematicians call the group a **combination**.',
      nextLabel: 'Count Without Repeats',
    },
  ],
}

export const lesson3CountingSection: Lesson3VisualizationSection = {
  id: 'lesson-3-counting-shortcut',
  heading: '✨ Count Without Repeats',
  body: () =>
    'The royal helper wrote down every first-pick and second-pick order. Let’s cross out the royal repeats.',
  visualization: 'combination-shortcut',
  nextLabel: 'Try a New Vault',
}

export function lesson3CountingChallenge(
  princessName: string,
): ChallengeMiniLessonPage<number> {
  return {
    id: 'lesson-3-first-treasure-bags',
    type: 'challenge',
    prompt:
      'The royal vault has **5 treasures**: Ruby, Sapphire, Emerald, Pearl, and Amethyst. Each gift bag gets **2 different treasures**. How many unique treasure bags can the princess make?',
    answer: 10,
    feedback: {
      correct: `Exactly, ${princessName}! There are **10 unique treasure bags**. Ruby + Sapphire and Sapphire + Ruby are the same bag, so we only count that pair once.`,
      tryAgain: `Try again, ${princessName}! Ask: does the bag care which treasure was picked first?`,
      incorrect: 'Not quite. If you counted pick orders, you may have counted each pair twice.',
      solution:
        'There are **5 choices** for the first treasure and **4 choices** for the second treasure: **5 x 4 = 20** pick orders. Each pair has 2 orders, so **20 / 2 = 10** unique bags.',
    },
  }
}

export function lesson3RoyalBagChallenge(
  princessName: string,
): ChallengeMiniLessonPage<number> {
  return {
    id: 'lesson-3-smaller-royal-vault',
    type: 'challenge',
    prompt:
      'A smaller vault has **4 treasures**: Ruby, Sapphire, Emerald, and Pearl. Each bag gets **2 different treasures**. How many unique treasure bags can the princess make?',
    answer: 6,
    feedback: {
      correct: `Beautiful counting, ${princessName}! **4 x 3 = 12** pick orders, and each pair is counted twice, so **12 / 2 = 6** unique bags.`,
      tryAgain:
        'Try again! Count the pick orders first, then remember to divide out the repeats.',
      incorrect:
        'Not quite. Every pair can be picked in 2 orders, but it still makes the same bag.',
      solution:
        'First count ordered picks: **4 choices first x 3 choices second = 12**. Then divide by 2 because each pair appears twice: **12 / 2 = 6**.',
    },
  }
}

export type Lesson3SortAnswer = 'order' | 'group'

export interface Lesson3SortCard {
  id: string
  prompt: string
  correctAnswer: Lesson3SortAnswer
  correctFeedback: string
  tryAgainFeedback: string
}

export const lesson3FinalSortCards: Lesson3SortCard[] = [
  {
    id: 'display-lineup',
    prompt: 'The royal jeweler places Ruby, Sapphire, and Emerald into 3 display spots.',
    correctAnswer: 'order',
    correctFeedback:
      'Exactly! Display spots are a lineup, so switching jewels changes the display.',
    tryAgainFeedback: 'Try again! Think about whether switching the jewels changes the display.',
  },
  {
    id: 'gift-bag-pair',
    prompt: 'The princess chooses 2 jewels for one royal gift bag.',
    correctAnswer: 'group',
    correctFeedback:
      'Correct! A gift bag only cares which jewels are inside, not which one was picked first.',
    tryAgainFeedback: 'Try again! Look only at what ends up inside the bag.',
  },
  {
    id: 'dragon-race',
    prompt: 'The dragon race gives 1st, 2nd, and 3rd place ribbons.',
    correctAnswer: 'order',
    correctFeedback: 'Yes! Race places are different spots, so order matters.',
    tryAgainFeedback: 'Try again! Ask whether first place and second place are different.',
  },
  {
    id: 'guest-group',
    prompt: 'The princess chooses 3 guests to receive treasure bags.',
    correctAnswer: 'group',
    correctFeedback:
      'Correct! Choosing guests is a combination because the same guests are chosen in any order.',
    tryAgainFeedback:
      'Try again! The princess is choosing a group of guests, not lining them up.',
  },
]

export function lesson3CompletionMessage(princessName: string) {
  return `You completed Royal Treasure Bags, ${princessName}! When the same group is still the same group, order does not matter. That is a **combination**.`
}
