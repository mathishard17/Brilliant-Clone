import type {
  ChallengeMiniLessonPage,
  ClickthroughMiniLesson,
  ExplanationMiniLessonPage,
  InteractiveVisualizationKind,
} from '../../types/lesson'

export type Lesson5Player = 'princess' | 'dragon' | 'knight' | 'none'
export type Lesson5OutcomeKind = 'crown' | 'dragon' | 'jewel' | 'star' | 'shield'

export interface Lesson5SpinnerSpace {
  id: string
  kind: Lesson5OutcomeKind
  label: string
  winner: Lesson5Player
}

export interface Lesson5VisualizationSection {
  id: string
  heading: string
  body: (princessName: string) => string
  visualization: InteractiveVisualizationKind
}

export type Lesson5ChallengePage = ChallengeMiniLessonPage<number>
export type Lesson5MiniLessonPage = ExplanationMiniLessonPage | Lesson5ChallengePage

export const spinnerInspectorSpaces: Lesson5SpinnerSpace[] = [
  { id: 'crown-1', kind: 'crown', label: 'Crown 1', winner: 'princess' },
  { id: 'crown-2', kind: 'crown', label: 'Crown 2', winner: 'princess' },
  { id: 'dragon', kind: 'dragon', label: 'Dragon', winner: 'dragon' },
  { id: 'jewel', kind: 'jewel', label: 'Jewel', winner: 'none' },
]

export const unfairSpinnerSpaces: Lesson5SpinnerSpace[] = spinnerInspectorSpaces

export const builderStartingSpaces: Lesson5SpinnerSpace[] = [
  { id: 'builder-1', kind: 'crown', label: 'Crown', winner: 'princess' },
  { id: 'builder-2', kind: 'crown', label: 'Crown', winner: 'princess' },
  { id: 'builder-3', kind: 'crown', label: 'Crown', winner: 'princess' },
  { id: 'builder-4', kind: 'dragon', label: 'Dragon', winner: 'dragon' },
]

export const sixSpaceFairSpinnerSpaces: Lesson5SpinnerSpace[] = [
  { id: 'star-1', kind: 'star', label: 'Star', winner: 'princess' },
  { id: 'star-2', kind: 'star', label: 'Star', winner: 'princess' },
  { id: 'star-3', kind: 'star', label: 'Star', winner: 'princess' },
  { id: 'shield-1', kind: 'shield', label: 'Shield', winner: 'knight' },
  { id: 'shield-2', kind: 'shield', label: 'Shield', winner: 'knight' },
  { id: 'shield-3', kind: 'shield', label: 'Shield', winner: 'knight' },
]

export const lesson5Sections = {
  sampleSpaceIntro: {
    id: 'lesson-5-sample-space-intro',
    heading: '🎪 Royal Carnival Spinner',
    body: (princessName) =>
      `Welcome to the Royal Carnival, ${princessName}! The princess made a spinner game, but the dragon says, "Wait! Does everyone have the same chance to win?" Tap each equal spinner space to collect every possible landing spot.`,
    visualization: 'carnival-spinner',
  },
  fairnessCheck: {
    id: 'lesson-5-fairness-check',
    heading: '⚖️ Fair or Unfair?',
    body: (_princessName) => {
      void _princessName
      return 'Now the rules are clear: **Princess wins on Crown**, **Dragon wins on Dragon**, and **Jewel means no one wins**. Compare the winning spaces to decide if the game is fair.'
    },
    visualization: 'carnival-spinner',
  },
  fairSpinnerBuilder: {
    id: 'lesson-5-fair-spinner-builder',
    heading: '🎨 Fix the Carnival Game',
    body: (princessName) =>
      `${princessName}, this booth starts with **Crown, Crown, Crown, Dragon**. Tap spaces to repaint them. Can you make Princess and Dragon have the same chance to win?`,
    visualization: 'fair-spinner-builder',
  },
  royalReview: {
    id: 'lesson-5-royal-review',
    heading: '🏰 Royal Review',
    body: (_princessName) => {
      void _princessName
      return 'A sample space can come from more than one spinner. Two tiny royal spinners make a little grid of everything that could happen.'
    },
    visualization: 'two-spinner-sample-space',
  },
} satisfies Record<string, Lesson5VisualizationSection>

export function challenge1(princessName: string): Lesson5ChallengePage {
  return {
    id: 'lesson-5-count-sample-space',
    type: 'challenge',
    prompt:
      'The Royal Carnival spinner has 4 equal spaces: Crown, Crown, Dragon, and Jewel. How many total possible landing spaces are in the sample space?',
    answer: 4,
    feedback: {
      correct: `Royal work, ${princessName}! The sample space has **4 outcomes** because the spinner has **4 equal spaces**.`,
      incorrect: 'Not quite. Count the spinner spaces one by one, even when two spaces have the same picture.',
      tryAgain: 'Try again! How many equal spaces can the spinner land on?',
      solution: 'Solution: **Crown, Crown, Dragon, Jewel** makes **4 possible outcomes**.',
    },
  }
}

export function challenge2(princessName: string): Lesson5ChallengePage {
  return {
    id: 'lesson-5-count-favorable-outcomes',
    type: 'challenge',
    prompt:
      'The princess wins when the spinner lands on Crown. The sample space is Crown, Crown, Dragon, Jewel. How many favorable outcomes does the princess have?',
    answer: 2,
    feedback: {
      correct: `Exactly, ${princessName}! Crown appears on **2 spinner spaces**, so the princess has **2 favorable outcomes**.`,
      incorrect:
        'Not quite. Look for the winning picture and count each separate space that shows it, even if the picture repeats.',
      tryAgain: 'Try again! Mark only the spaces that make the princess win, then count your marks.',
      solution: 'Solution: there are **2 Crown spaces**, so the princess has **2 out of 4** chances to win.',
    },
  }
}

export function challenge3(princessName: string): Lesson5ChallengePage {
  return {
    id: 'lesson-5-decide-fair-or-unfair',
    type: 'challenge',
    prompt:
      'Princess wins on Crown. Dragon wins on Dragon. The spinner is Crown, Crown, Dragon, Jewel. Is the game fair? Type **1** for fair or **2** for unfair.',
    answer: 2,
    feedback: {
      correct: `Correct, ${princessName}! This game is **unfair** because Princess has **2 winning spaces** and Dragon has only **1**.`,
      incorrect: 'Not quite. A fair game gives each player the same number of winning outcomes.',
      tryAgain: 'Try again! Compare Princess winning spaces to Dragon winning spaces.',
      solution:
        'Solution: Princess has **2/4**, Dragon has **1/4**, and Jewel is no winner. The chances are not the same, so the game is unfair.',
    },
  }
}

export function challenge4(princessName: string): Lesson5ChallengePage {
  return {
    id: 'lesson-5-fix-spinner',
    type: 'challenge',
    prompt:
      'A spinner has Crown, Crown, Crown, Dragon. Princess wins on Crown, and Dragon wins on Dragon. How many Crown spaces should change to Dragon spaces to make the game fair?',
    answer: 1,
    feedback: {
      correct: `Perfect fix, ${princessName}! Changing **1 Crown** into Dragon gives **Crown, Crown, Dragon, Dragon**.`,
      incorrect: 'Not quite. The goal is for Princess and Dragon to have the same number of winning spaces.',
      tryAgain: 'Try again! Recount winners after one repaint at a time; fair means the two player counts match.',
      solution:
        'Solution: repaint 1 Crown as Dragon. Then Princess has **2/4** and Dragon has **2/4**, so the game is fair.',
    },
  }
}

export function challenge5(): Lesson5ChallengePage {
  return {
    id: 'lesson-5-check-built-game',
    type: 'challenge',
    prompt:
      'Your carnival builder has 6 equal spaces. You made 3 Star spaces for Princess and 3 Shield spaces for Knight. Is the game fair? Type **1** for fair or **2** for unfair.',
    answer: 1,
    feedback: {
      correct: 'Yes! Princess has **3 winning spaces** and Knight has **3 winning spaces**, so they have the same chance.',
      incorrect: "Not quite. Count each player's winning spaces and compare them.",
      tryAgain: "Try again! Put each player's winning-space count side by side, then compare.",
      solution: 'Solution: Princess has **3/6**, Knight has **3/6**, and those chances are equal. The game is **fair**.',
    },
    nextLabel: 'Check the two spinners',
  }
}

export function challenge6(princessName: string): Lesson5ChallengePage {
  return {
    id: 'lesson-5-two-spinner-fairness',
    type: 'challenge',
    prompt:
      'Two tiny royal spinners each have Crown and Dragon. Princess wins if the two pictures match: Crown + Crown or Dragon + Dragon. Knight wins if they do not match: Crown + Dragon or Dragon + Crown. Is the game fair? Type **1** for fair or **2** for unfair.',
    answer: 1,
    feedback: {
      correct: `Brilliant checking, ${princessName}! There are **2 matching outcomes** and **2 not-matching outcomes**, so the game is **fair**.`,
      incorrect: 'Not quite. Write out the full sample space before deciding.',
      tryAgain: 'Try again! Build the pair list first, then separate matches from not-matches.',
      solution:
        'Solution: the sample space is **Crown+Crown**, **Crown+Dragon**, **Dragon+Crown**, **Dragon+Dragon**. Princess wins **2 outcomes** and Knight wins **2 outcomes**, so the game is **fair**.',
    },
    nextLabel: 'Finish Lesson',
  }
}

export function sampleSpaceMiniLesson(princessName: string): ClickthroughMiniLesson<Lesson5MiniLessonPage> {
  return {
    id: 'lesson-5-sample-space-mini-lesson',
    title: '📜 Build the Sample Space',
    pages: [
      {
        id: 'sample-space-word',
        type: 'explanation',
        body:
          'The **sample space** is the list of everything that could happen. For the carnival spinner, we write every equal landing space.',
      },
      {
        id: 'duplicates-count',
        type: 'explanation',
        body:
          'The spinner says **Crown, Crown, Dragon, Jewel**. Crown appears twice, and both Crown spaces count because the spinner can land on either one.',
        equation: 'Crown 1 + Crown 2 + Dragon + Jewel = 4 outcomes',
      },
      challenge2(princessName),
    ],
  }
}

export function royalReviewMiniLesson(princessName: string): ClickthroughMiniLesson<Lesson5MiniLessonPage> {
  return {
    id: 'lesson-5-royal-review-mini-lesson',
    title: '🏰 Royal Review',
    pages: [
      {
        id: 'two-spinner-grid-intro',
        type: 'explanation',
        body:
          'Two tiny royal spinners can make a sample space too. One spinner chooses the first picture, and the other spinner chooses the second picture.',
      },
      challenge5(),
      {
        id: 'two-spinner-grid',
        type: 'explanation',
        body:
          'Spin the two tiny royal spinners to see possible pairs. Each spinner can land on **Crown** or **Dragon**, so together they make **4 total outcomes**.',
      },
      challenge6(princessName),
    ],
  }
}
