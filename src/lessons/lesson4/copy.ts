import type {
  ChallengeMiniLessonPage,
  ClickthroughMiniLesson,
  ExplanationMiniLessonPage,
} from '../../types/lesson'

export type PrizeKind = 'crown' | 'ruby' | 'gown' | 'dragon' | 'star' | 'sparkle'

export interface SpinnerSpace {
  id: string
  prize: PrizeKind
}

export interface PrizeDefinition {
  prize: PrizeKind
  label: string
  icon: string
}

export interface ChoiceChallenge {
  id: string
  prompt: string
  answer: string
  options: readonly string[]
  feedback: {
    correct: string
    incorrect: string
    tryAgain: string
    solution: string
  }
}

export interface Lesson4ChoiceChallengePage extends ChallengeMiniLessonPage<string> {
  type: 'challenge'
  visual: SpinnerVisual
  options: readonly string[]
  feedback: ChoiceChallenge['feedback']
}

export type Lesson4MiniLessonPage = ExplanationMiniLessonPage | Lesson4ChoiceChallengePage

export interface SpinnerVisual {
  id: string
  title: string
  spaces: readonly SpinnerSpace[]
  targetPrize?: PrizeKind
  helperText: string
}

export const prizeDefinitions: Record<PrizeKind, PrizeDefinition> = {
  crown: { prize: 'crown', label: 'Crown', icon: '👑' },
  ruby: { prize: 'ruby', label: 'Ruby', icon: '💎' },
  gown: { prize: 'gown', label: 'Gown', icon: '👗' },
  dragon: { prize: 'dragon', label: 'Dragon', icon: '🐉' },
  star: { prize: 'star', label: 'Star', icon: '⭐' },
  sparkle: { prize: 'sparkle', label: 'Sparkle', icon: '✨' },
}

export const screen1Visual: SpinnerVisual = {
  id: 'one-spin-one-prize',
  title: 'Castle Spinner',
  targetPrize: 'crown',
  helperText:
    'Tap spaces to inspect them, or press Spin once for a little carnival sparkle. The question is answered by counting the spaces.',
  spaces: [
    { id: 'crown-1', prize: 'crown' },
    { id: 'ruby-1', prize: 'ruby' },
    { id: 'gown-1', prize: 'gown' },
    { id: 'dragon-1', prize: 'dragon' },
  ],
}

export const screen1Copy = {
  heading: 'Magic Chance Spinners',
  body: (princessName: string) =>
    `Welcome to the Royal Moonlight Carnival, ${princessName}! This magic spinner has **4 spaces**. When the princess spins, the arrow lands on exactly one space. Each space is one possible **outcome**.`,
  challenge: {
    id: 'total-outcomes',
    prompt: 'How many total outcomes are on this spinner?',
    answer: '4',
    options: ['2', '3', '4', '5'],
    feedback: {
      correct: 'Sparkly counting! There are **4** spaces, so there are **4 total outcomes**.',
      incorrect: 'There are **4 possible outcomes**: Crown, Ruby, Gown, and Dragon.',
      tryAgain: 'Try again! Count every space the arrow could land on.',
      solution: 'There are **4 possible outcomes**: Crown, Ruby, Gown, and Dragon.',
    },
  } satisfies ChoiceChallenge,
  keyLine: 'The **total outcomes** are all the things that could happen.',
}

export const rubySpinnerVisual: SpinnerVisual = {
  id: 'ruby-winning-spaces',
  title: 'Ruby Prize Spinner',
  targetPrize: 'ruby',
  helperText: 'Ruby is the prize the princess hopes to win, so Ruby spaces are the winning spaces.',
  spaces: [
    { id: 'ruby-1', prize: 'ruby' },
    { id: 'ruby-2', prize: 'ruby' },
    { id: 'crown-1', prize: 'crown' },
    { id: 'gown-1', prize: 'gown' },
    { id: 'dragon-1', prize: 'dragon' },
    { id: 'star-1', prize: 'star' },
  ],
}

export const screen2MiniLesson: ClickthroughMiniLesson<Lesson4MiniLessonPage> = {
  id: 'winning-spaces',
  title: 'Winning Spaces',
  description:
    'A magic spinner may feel surprising, but chance is not a secret spell. Count the winning spaces, count all the spaces, and you can tell how likely the prize is.',
  pages: [
    {
      id: 'ruby-total-spaces',
      type: 'explanation',
      body:
        'The princess hopes to win a **Ruby**. This spinner has **6 total spaces**, but only **2 Ruby spaces**.\n\nThe Ruby spaces are the **favorable outcomes**. They are the outcomes we are hoping for.',
    },
    {
      id: 'ruby-equation',
      type: 'explanation',
      body:
        'Chance is written as a counting fraction. Put the winning spaces on top and all possible spaces on the bottom.',
      equation: 'chance of Ruby = Ruby spaces / total spaces',
    },
    {
      id: 'ruby-chance',
      type: 'challenge',
      prompt: 'What is the chance of spinning a Ruby?',
      answer: '2/6',
      options: ['1/6', '2/6', '4/6', '6/2'],
      feedback: {
        correct: 'Yes! There are **2 Ruby spaces** out of **6 total spaces**, so the chance is **2/6**.',
        incorrect:
          'The princess wants Ruby. There are **2 Ruby spaces** and **6 total spaces**, so the chance is **2/6**.',
        tryAgain: 'Try again! Put the winning Ruby spaces on top and all spinner spaces on bottom.',
        solution:
          'The princess wants Ruby. There are **2 Ruby spaces** and **6 total spaces**, so the chance is **2/6**.',
      },
      visual: rubySpinnerVisual,
      nextLabel: 'Continue',
    },
  ],
}

export const screen2KeyLine =
  'Probability is a counting fraction: **favorable outcomes over total outcomes**.'

export const compareSpinnerVisual: SpinnerVisual = {
  id: 'more-likely-less-likely',
  title: 'Star and Dragon Spinner',
  targetPrize: 'star',
  helperText: 'Tap Star, Crown, or Dragon spaces to compare how many winning spaces each prize has.',
  spaces: [
    { id: 'star-1', prize: 'star' },
    { id: 'star-2', prize: 'star' },
    { id: 'star-3', prize: 'star' },
    { id: 'crown-1', prize: 'crown' },
    { id: 'crown-2', prize: 'crown' },
    { id: 'dragon-1', prize: 'dragon' },
  ],
}

export const screen3Copy = {
  heading: 'More Likely, Less Likely',
  body:
    'Some prizes have more winning spaces than others. More winning spaces means a prize is **more likely**.',
  compareChallenge: {
    id: 'star-or-dragon',
    prompt: 'Which prize is more likely: Star or Dragon?',
    answer: 'Star',
    options: ['Star', 'Dragon', 'Same chance'],
    feedback: {
      correct:
        'Exactly! Star has **3 winning spaces out of 6**. Dragon has only **1 winning space out of 6**. **Star** is more likely.',
      incorrect:
        '**Star** is more likely because Star has **3 spaces** and Dragon has **1 space**. That means Star has a chance of **3/6**, while Dragon has a chance of **1/6**.',
      tryAgain: 'Try again! Count how many spaces show each prize.',
      solution:
        '**Star** is more likely because Star has **3 spaces** and Dragon has **1 space**. That means Star has a chance of **3/6**, while Dragon has a chance of **1/6**.',
    },
  } satisfies ChoiceChallenge,
  crownChallenge: {
    id: 'crown-chance',
    prompt: 'What is the chance of spinning a Crown?',
    answer: '2/6',
    options: ['1/6', '2/6', '3/6', '6/2'],
    feedback: {
      correct: 'Royal work! There are **2 Crown spaces** out of **6 total spaces**, so the chance is **2/6**.',
      incorrect: 'There are **2 Crown spaces** and **6 total spaces**, so the chance is **2/6**.',
      tryAgain: 'Count only the Crown spaces first, then count all the spaces.',
      solution: 'There are **2 Crown spaces** and **6 total spaces**, so the chance is **2/6**.',
    },
  } satisfies ChoiceChallenge,
}

export const impossibleVisual: SpinnerVisual = {
  id: 'no-dragon-spinner',
  title: 'No Dragon Spinner',
  targetPrize: 'dragon',
  helperText: 'Dragon has no spaces on this spinner, so there are 0 winning spaces.',
  spaces: [
    { id: 'crown-1', prize: 'crown' },
    { id: 'crown-2', prize: 'crown' },
    { id: 'ruby-1', prize: 'ruby' },
    { id: 'ruby-2', prize: 'ruby' },
    { id: 'star-1', prize: 'star' },
  ],
}

export const certainVisual: SpinnerVisual = {
  id: 'all-sparkle-spinner',
  title: 'All Sparkle Spinner',
  targetPrize: 'sparkle',
  helperText: 'Every space is Sparkle, so every possible outcome wins.',
  spaces: [
    { id: 'sparkle-1', prize: 'sparkle' },
    { id: 'sparkle-2', prize: 'sparkle' },
    { id: 'sparkle-3', prize: 'sparkle' },
    { id: 'sparkle-4', prize: 'sparkle' },
  ],
}

export const screen4MiniLesson: ClickthroughMiniLesson<Lesson4MiniLessonPage> = {
  id: 'impossible-and-certain',
  title: 'Impossible and Certain Magic',
  pages: [
    {
      id: 'impossible-explanation',
      type: 'explanation',
      body:
        'The princess asks for a **Dragon** prize, but look carefully: there are no Dragon spaces.\n\nIf there are **0 winning spaces**, the chance has 0 on top. That means impossible on this spinner.',
    },
    {
      id: 'dragon-impossible',
      type: 'challenge',
      prompt: 'What is the chance of getting a Dragon from this spinner?',
      answer: '0/5',
      options: ['0/5', '1/5', '2/5', '5/5'],
      feedback: {
        correct:
          'Correct! There are **0 Dragon spaces** out of **5 total spaces**, so Dragon is impossible here.',
        incorrect:
          'There are no Dragon spaces. That means **0 favorable outcomes** out of **5 total outcomes**, or **0/5**.',
        tryAgain: 'Try again! How many Dragon spaces do you see?',
        solution:
          'There are no Dragon spaces. That means **0 favorable outcomes** out of **5 total outcomes**, or **0/5**.',
      },
      visual: impossibleVisual,
      nextLabel: 'Next magic check',
    },
    {
      id: 'certain-explanation',
      type: 'explanation',
      body:
        'Now every space is **Sparkle**. If every possible outcome wins, the winning count and total count are the same. That means certain.',
    },
    {
      id: 'sparkle-certain',
      type: 'challenge',
      prompt: 'What is the chance of spinning Sparkle?',
      answer: '4/4',
      options: ['0/4', '1/4', '3/4', '4/4'],
      feedback: {
        correct: 'Perfect! All **4 spaces** are Sparkle, so Sparkle is certain: **4/4**.',
        incorrect: 'There are **4 Sparkle spaces** out of **4 total spaces**, so the chance is **4/4**.',
        tryAgain: 'Try again! Count the Sparkle spaces, then count all spaces.',
        solution: 'There are **4 Sparkle spaces** out of **4 total spaces**, so the chance is **4/4**.',
      },
      visual: certainVisual,
      nextLabel: 'Continue',
    },
  ],
}

export const finaleVisual: SpinnerVisual = {
  id: 'royal-prize-wheel',
  title: 'Royal Prize Wheel',
  targetPrize: 'crown',
  helperText: 'The final wheel has 8 equal spaces. Count the winning spaces before the carnival opens.',
  spaces: [
    { id: 'crown-1', prize: 'crown' },
    { id: 'crown-2', prize: 'crown' },
    { id: 'crown-3', prize: 'crown' },
    { id: 'ruby-1', prize: 'ruby' },
    { id: 'ruby-2', prize: 'ruby' },
    { id: 'dragon-1', prize: 'dragon' },
    { id: 'gown-1', prize: 'gown' },
    { id: 'star-1', prize: 'star' },
  ],
}

export const screen5Copy = {
  heading: 'Royal Prize Wheel Finale',
  body:
    'The final carnival wheel is ready! The princess wants to know the chance before the first guest spins. Count the prize spaces like a royal mathematician.',
  crownChallenge: {
    id: 'final-crown-chance',
    prompt: 'What is the chance of spinning a Crown?',
    answer: '3/8',
    options: ['1/8', '2/8', '3/8', '8/3'],
    feedback: {
      correct: 'Beautiful! There are **3 Crown spaces** out of **8 total spaces**, so the chance is **3/8**.',
      incorrect: 'There are **3 favorable Crown spaces** and **8 total spaces**. The chance is **3/8**.',
      tryAgain: 'Try again! Count the Crown spaces first, then count every space on the wheel.',
      solution: 'There are **3 favorable Crown spaces** and **8 total spaces**. The chance is **3/8**.',
    },
  } satisfies ChoiceChallenge,
  rubyDragonChallenge: {
    id: 'ruby-or-dragon',
    prompt: 'Which is more likely: Ruby or Dragon?',
    answer: 'Ruby',
    options: ['Ruby', 'Dragon', 'Same chance'],
    feedback: {
      correct: 'Yes! Ruby has **2 spaces out of 8**, while Dragon has **1 space out of 8**. **Ruby** is more likely.',
      incorrect:
        'Ruby has **2 favorable spaces**. Dragon has **1 favorable space**. Since **2/8** is more than **1/8**, **Ruby** is more likely.',
      tryAgain: 'Try again! Count Ruby spaces and Dragon spaces separately.',
      solution:
        'Ruby has **2 favorable spaces**. Dragon has **1 favorable space**. Since **2/8** is more than **1/8**, **Ruby** is more likely.',
    },
  } satisfies ChoiceChallenge,
  finalMessage:
    'You did it! Chance is not just a mystery spell. It is a counting fraction: **favorable outcomes over total outcomes**.',
}
