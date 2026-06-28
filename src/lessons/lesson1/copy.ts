import type { AnchorTree } from '../../components/AnchorTreeDiagram'
import type {
  ChallengeMiniLessonPage,
  ClickthroughMiniLesson,
  ExplanationMiniLessonPage,
  InteractiveChallengeContent,
} from '../../types/lesson'

type Lesson1InteractiveChallengeContent = Pick<
  InteractiveChallengeContent,
  'answer' | 'id' | 'visualization'
>

/** Gentle nudge shown on the first wrong answer, before the detailed hint. */
function firstTryAgainFeedback(princessName: string) {
  return `Hmm... that's not it, ${princessName}, try again!`
}

export const screen1InteractiveChallenge: Lesson1InteractiveChallengeContent = {
  id: 'princess-outfit-pairs',
  visualization: 'outfit-pairs',
  answer: 6,
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

export const screen3InteractiveChallenge: Lesson1InteractiveChallengeContent = {
  id: 'princess-outfit-triples',
  visualization: 'outfit-triples',
  answer: 12,
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
        nextLabel: 'Continue to practice →',
      },
    ],
  }
}
