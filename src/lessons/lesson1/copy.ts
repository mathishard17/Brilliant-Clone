import type { AnchorTree } from '../../components/AnchorTreeDiagram'
import type {
  ChallengeMiniLessonPage,
  ClickthroughMiniLesson,
  ExplanationMiniLessonPage,
  InteractiveChallengeContent,
} from '../../types/lesson'

/** Gentle nudge shown on the first wrong answer, before the detailed hint. */
function firstTryAgainFeedback(princessName: string) {
  return `Hmm... that's not it, ${princessName}, try again!`
}

export const screen1InteractiveChallenge: InteractiveChallengeContent = {
  id: 'princess-outfit-pairs',
  heading: '👑 Dress Up the Princess!',
  body: (princessName) =>
    `Welcome, ${princessName}! Tap different items in the princess closet to change the princess's outfit. See how many **unique outfits** you can design!`,
  visualization: 'outfit-pairs',
  prompt:
    'How many completely **unique princess outfits** can you make in total? (An outfit is 1 crown and 1 dress)',
  answer: 6,
  feedback: {
    correct: (princessName) =>
      `Magical, ${princessName}! **6 combinations** is exactly right. Let's look at the trick to see why that works.`,
    incorrect: (princessName) =>
      `Not quite, ${princessName}! Let's jump into a **secret palace trick** to see how to easily count them all without losing track.`,
    tryAgain: firstTryAgainFeedback,
    solution: () => 'Solution: **2 crowns × 3 dresses = 6 unique princess outfits**.',
  },
}

interface Screen2Step extends ExplanationMiniLessonPage {
  tree?: AnchorTree
}

const screen2Steps: Screen2Step[] = [
  {
    id: 'anchor-trick-intro',
    type: 'explanation',
    body:
      "When you were dressing up our princess, did you lose track of your **choices**? Let's start with a clean slate and use the **Anchor Trick**!",
  },
  {
    id: 'lock-gold-tiara',
    type: 'explanation',
    body:
      '**Step 1:** Place the Gold Tiara 👑 on the princess and **LOCK 🔒** it there! We won\'t touch it or change it yet.',
  },
  {
    id: 'gold-tiara-dresses',
    type: 'explanation',
    body:
      '**Step 2:** While keeping the Gold Tiara **locked**, try every single dress one by one.\n\n• Gold Tiara + Pink Ballgown\n• Gold Tiara + Purple Dress\n• Gold Tiara + Emerald Gown\n\nThat makes **3 beautiful outfits** just for the Gold Tiara!',
    tree: {
      variant: 'expanded',
      crownId: 'gold-tiara',
      dressIds: ['pink-gown', 'purple-dress', 'emerald-gown'],
    },
  },
  {
    id: 'diamond-crown-dresses',
    type: 'explanation',
    body:
      '**Step 3:** Now, swap the top to the Diamond Crown 💎 and **lock** it! Do the exact same thing with the dresses.\n\nThat\'s another **3 beautiful outfits**!',
    tree: {
      variant: 'expanded',
      crownId: 'diamond-crown',
      dressIds: ['pink-gown', 'purple-dress', 'emerald-gown'],
    },
  },
  {
    id: 'six-total-outfits',
    type: 'explanation',
    body:
      'Look at that! When we **add them together**, we get **6 total princess outfits**!',
  },
]

export const screen2MiniLesson: ClickthroughMiniLesson<Screen2Step> = {
  id: 'anchor-trick',
  title: '📖 The Anchor Trick',
  pages: screen2Steps,
}

export const screen3InteractiveChallenge: InteractiveChallengeContent = {
  id: 'princess-outfit-triples',
  heading: '🥿 Complete the Princess Look!',
  body: (princessName) =>
    `Let's make it tougher, ${princessName}. Before the princess goes to the ball, she needs a **pair of shoes**!`,
  visualization: 'outfit-triples',
  prompt:
    'How many **total variations** can you make now using 2 crowns, 3 dresses, and 2 pairs of shoes? (An outfit must include 1 crown, 1 dress, and 1 pair of shoes)',
  answer: 12,
  feedback: {
    correct: (princessName) =>
      `Spectacular, ${princessName}! **12 unique outfits** is exactly right! You're ready for the grand finale shortcut.`,
    incorrect: (princessName) =>
      `Close! Think about it, ${princessName}: start with one finished outfit, then check how the shoe choice can change it.`,
    tryAgain: firstTryAgainFeedback,
    solution: () => 'Solution: **2 crowns × 3 dresses × 2 pairs of shoes = 12 total variations**.',
  },
}

const SCREEN4_SHORTCUT_HEADING = '💥 The Ultimate Multiplication Shortcut'

const screen4ShortcutSteps: ExplanationMiniLessonPage[] = [
  {
    id: 'shortcut-count-choices',
    type: 'explanation',
    body: 'Here\'s the secret: count how many **choices** you have in each category, then **multiply** them!',
  },
  {
    id: 'shortcut-crowns',
    type: 'explanation',
    body: 'How many **crowns** can you pick from?',
  },
  {
    id: 'shortcut-dresses',
    type: 'explanation',
    body: 'How many **dresses**? **Multiply** by that!',
  },
  {
    id: 'shortcut-shoes',
    type: 'explanation',
    body: 'And how many pairs of **shoes**? **Multiply** again!',
  },
  {
    id: 'shortcut-total',
    type: 'explanation',
    body: 'That gives you the **total number of unique outfits**!',
    nextLabel: 'Got it! ✨',
  },
]

export type Screen4PracticePage = ChallengeMiniLessonPage<number>
export type Screen4MiniLessonPage = ExplanationMiniLessonPage | Screen4PracticePage

export function screen4MiniLesson(princessName: string): ClickthroughMiniLesson<Screen4MiniLessonPage> {
  return {
    id: 'multiplication-shortcut',
    title: SCREEN4_SHORTCUT_HEADING,
    pages: [
      ...screen4ShortcutSteps,
      {
        id: 'shortcut-practice',
        type: 'challenge',
        title: '🧮 Your Turn to Shine!',
        prompt:
          'Now you try — no closet needed! A princess has **4 crowns**, **5 gowns**, and **2 pairs of shoes**. Use the shortcut: how many unique outfits can she make?',
        answer: 40,
        feedback: {
          correct: `You're a multiplication master, ${princessName}! **4 × 5 × 2 = 40** unique outfits — no counting one-by-one needed!`,
          incorrect: `Not quite, ${princessName}! Remember the shortcut: **multiply** the choices in each category.`,
          tryAgain: firstTryAgainFeedback(princessName),
        },
        nextLabel: 'Continue →',
      },
      {
        id: 'lesson-1-complete',
        type: 'explanation',
        body: `**Multiplying your options** is the ultimate mathematical superpower shortcut for **counting choices**. You've completed Lesson 1, ${princessName}!`,
        nextLabel: 'Finish Lesson Complete! 🎉',
      },
    ],
  }
}
