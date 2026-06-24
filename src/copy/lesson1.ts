export function screen0Heading() {
  return '🏰 Welcome to the Kingdom!'
}

export function screen0BodySignup() {
  return 'Create your secret princess keys to step into the castle dressing room!'
}

export function screen0BodyLogin() {
  return 'Enter your secret princess keys to step into the castle dressing room!'
}

export function screen1Heading() {
  return '👑 Dress Up the Princess!'
}

export function screen1Body(princessName: string) {
  return `Welcome, ${princessName}! Tap different items in the princess closet to change the princess's outfit. See how many **unique styles** you can design!`
}

export function screen1ChallengePrompt() {
  return 'How many completely **unique princess looks** can you make in total? (An outfit is 1 crown and 1 dress)'
}

export function screen1FeedbackCorrect(princessName: string) {
  return `Magical, ${princessName}! You found all **6 combinations** perfectly. Let's look at the trick to see why that works.`
}

export function screen1FeedbackIncorrect(princessName: string) {
  return `Not quite, ${princessName}! Let's jump into a **secret palace trick** to see how to easily count them all without losing track.`
}

/** Gentle nudge shown on the first wrong answer, before the detailed hint. */
export function firstTryAgainFeedback(princessName: string) {
  return `Hmm... that's not it, ${princessName}, try again!`
}

import type { AnchorTree } from '../components/AnchorTreeDiagram'

export interface Screen2Step {
  lessonText: string
  tree?: AnchorTree
}

export const screen2Steps: Screen2Step[] = [
  {
    lessonText:
      "When you were dressing up our princess, did you lose track of your **choices**? Let's start with a clean slate and use the **Anchor Trick**!",
  },
  {
    lessonText:
      '**Step 1:** Place the Gold Tiara 👑 on the princess and **LOCK 🔒** it there! We won\'t touch it or change it yet.',
  },
  {
    lessonText:
      '**Step 2:** While keeping the Gold Tiara **locked**, try every single dress one by one.\n\n• Gold Tiara + Pink Ballgown\n• Gold Tiara + Purple Dress\n• Gold Tiara + Emerald Gown\n\nThat makes **3 beautiful outfits** just for the Gold Tiara!',
    tree: {
      variant: 'expanded',
      crownId: 'gold-tiara',
      dressIds: ['pink-gown', 'purple-dress', 'emerald-gown'],
    },
  },
  {
    lessonText:
      '**Step 3:** Now, swap the top to the Diamond Crown 💎 and **lock** it! Do the exact same thing with the dresses.\n\nThat\'s another **3 beautiful outfits**!',
    tree: {
      variant: 'expanded',
      crownId: 'diamond-crown',
      dressIds: ['pink-gown', 'purple-dress', 'emerald-gown'],
    },
  },
  {
    lessonText:
      'Look at that! When we **add them together**, we get **6 total princess styles**!',
  },
]

export function screen2SummaryButton() {
  return 'Try the Princess Challenge! 🔥'
}

export function screen3Heading() {
  return '🥿 Complete the Princess Look!'
}

export function screen3Body(princessName: string) {
  return `Let's make it tougher, ${princessName}. Before the princess goes to the ball, she needs a **pair of shoes**!`
}

export function screen3ChallengePrompt() {
  return 'How many **total variations** can you make now using 2 crowns, 3 dresses, and 2 pairs of shoes? (An outfit must include 1 crown, 1 dress, and 1 pair of shoes)'
}

export function screen3FeedbackCorrect(princessName: string) {
  return `Spectacular, ${princessName}! **12 unique outfits** is exactly right! You're ready for the grand finale shortcut.`
}

export function screen3FeedbackIncorrect(princessName: string) {
  return `Close! Think about it, ${princessName}: Every one of your original **6 outfits** now gets **2 options of shoes** (Glass Slippers or Riding Boots).`
}

export function screen4Heading() {
  return '🏆 Princess Designer Confirmed!'
}

export function screen4Body(princessName: string) {
  return `Excellent work, ${princessName}! You successfully discovered how **choices stack up** without needing to count every single one by hand.`
}

export function screen4ShortcutHeading() {
  return '💥 The Ultimate Multiplication Shortcut'
}

export function screen4ShortcutBody() {
  return 'Instead of sketching tree diagrams or dragging items out of a digital closet every single time, you can just **multiply your total number of choices inside each category together**!'
}

export interface Screen4ShortcutStep {
  body: string
  equation?: string
}

export const screen4ShortcutSteps: Screen4ShortcutStep[] = [
  {
    body: 'Here\'s the secret: count how many **choices** you have in each category, then **multiply** them!',
  },
  {
    body: 'How many **crowns** can you pick from?',
    equation: '2 Crowns',
  },
  {
    body: 'How many **dresses**? **Multiply** by that!',
    equation: '2 Crowns × 3 Dresses',
  },
  {
    body: 'And how many pairs of **shoes**? **Multiply** again!',
    equation: '2 Crowns × 3 Dresses × 2 Shoes',
  },
  {
    body: 'That gives you the **total number of unique outfits**!',
    equation: '2 Crowns × 3 Dresses × 2 Shoes = 12 Total Outfits',
  },
]

export function screen4Equation() {
  return '2 Crowns × 3 Dresses × 2 Shoes = 12 Total Outfits'
}

export const SCREEN4_PRACTICE_ANSWER = 40

export function screen4PracticeHeading() {
  return '🧮 Your Turn to Shine!'
}

export function screen4PracticePrompt() {
  return 'Now you try — no closet needed! A princess has **4 crowns**, **5 gowns**, and **2 pairs of shoes**. Use the shortcut: how many unique outfits can she make?'
}

export function screen4PracticeEquation() {
  return '4 Crowns × 5 Gowns × 2 Shoes = 40 Total Outfits'
}

export function screen4PracticeCorrect(princessName: string) {
  return `You're a multiplication master, ${princessName}! **4 × 5 × 2 = 40** unique outfits — no counting one-by-one needed!`
}

export function screen4PracticeIncorrect(princessName: string) {
  return `Not quite, ${princessName}! Remember the shortcut: **multiply** the choices in each category.`
}

export function screen4Closing(princessName: string) {
  return `**Multiplying your options** is the ultimate mathematical superpower shortcut for **counting choices**. You've completed Lesson 1, ${princessName}!`
}
