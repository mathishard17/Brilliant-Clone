import type {
  ChallengeMiniLessonPage,
  ClickthroughMiniLesson,
  ExplanationMiniLessonPage,
} from '../../types/lesson'
import type { Lesson1ThemePack } from '../../themes/themeTypes'
import { iconForThemeLabel } from '../../utils/themeEmoji'

export type PrizeKind = 'crown' | 'ruby' | 'gown' | 'dragon' | 'star' | 'sparkle'

export interface SpinnerSpace {
  id: string
  prize: PrizeKind
}

interface PrizeDefinition {
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
    tryAgain: string
    solution: string
  }
}

interface Lesson4ChoiceChallengePage extends ChallengeMiniLessonPage<string> {
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

export interface Lesson4ThemeFlavor {
  settingName: string
  learnerRole: string
  prizeDefinitions: Record<PrizeKind, PrizeDefinition>
  visual: {
    panelBackground: string
    borderColor: string
    accentColor: string
    buttonBackground: string
    buttonText: string
    buttonBorder: string
    hintBackground: string
    hintText: string
    spinnerColors: Record<PrizeKind, string>
  }
}

export function getLesson4ThemeFlavor(
  activeTheme: Pick<Lesson1ThemePack, 'themeName' | 'learnerRole' | 'categories' | 'visual' | 'lesson4'>,
): Lesson4ThemeFlavor {
  // TODO: Replace this bridge with a dedicated Lesson 4 theme pack once shared theme types support it.
  const [topCategory, middleCategory, bottomCategory] = activeTheme.categories
  const themeName = activeTheme.themeName.toLowerCase()
  const visual = activeTheme.visual
  const spinnerIcons = activeTheme.lesson4?.spinnerIcons
  const defaultIcons: Record<PrizeKind, string> =
    activeTheme.visual?.character === 'astronaut' || themeName.includes('space')
      ? {
          crown: '🪐',
          ruby: '🛰️',
          gown: '🚀',
          dragon: '☄️',
          star: '⭐',
          sparkle: '✨',
        }
      : themeName.includes('dinosaur')
        ? {
            crown: '🦕',
            ruby: '🦴',
            gown: '🌿',
            dragon: '🦖',
            star: '🌋',
            sparkle: '🥚',
          }
        : themeName.includes('animal')
          ? {
              crown: '🐾',
              ruby: '🦊',
              gown: '🐼',
              dragon: '🐼',
              star: '🦁',
              sparkle: '✨',
            }
          : themeName.includes('sport')
            ? {
                crown: '🏅',
                ruby: '⚽',
                gown: '🏀',
                dragon: '🏈',
                star: '🎾',
                sparkle: '🏆',
              }
            : {
                crown: '👑',
                ruby: '💎',
                gown: '👗',
                dragon: '🐉',
                star: '⭐',
                sparkle: '✨',
              }

  return {
    settingName: activeTheme.themeName.trim() || 'Chance Lab',
    learnerRole: activeTheme.learnerRole.trim() || 'learner',
    visual: {
      panelBackground: 'var(--theme-panel-bg, rgb(15 23 42 / 0.78))',
      borderColor: 'var(--theme-border, rgb(148 163 184 / 0.24))',
      accentColor: 'var(--theme-accent, #22d3ee)',
      buttonBackground: 'var(--theme-neutral-bg, rgb(15 23 42 / 0.84))',
      buttonText: 'var(--theme-neutral-text, #e2e8f0)',
      buttonBorder: 'var(--theme-neutral-border, rgb(148 163 184 / 0.42))',
      hintBackground: 'var(--theme-hint-bg, rgb(8 47 73 / 0.48))',
      hintText: 'var(--theme-hint-text, #bae6fd)',
      spinnerColors: {
        crown: visual?.motifPrimary ?? '#facc15',
        ruby: visual?.accentColor ?? '#fb7185',
        gown: visual?.motifSecondary ?? '#c084fc',
        dragon: visual?.buttonBorder ?? '#86efac',
        star: visual?.stageBackground ?? '#fde68a',
        sparkle: visual?.hintBackground ?? '#93c5fd',
      },
    },
    prizeDefinitions: {
      crown: {
        prize: 'crown',
        label: topCategory?.items[0] ?? prizeDefinitions.crown.label,
        icon: spinnerIcons?.crown ?? iconForThemeLabel(topCategory?.items[0], defaultIcons.crown),
      },
      ruby: {
        prize: 'ruby',
        label: topCategory?.items[1] ?? prizeDefinitions.ruby.label,
        icon: spinnerIcons?.ruby ?? iconForThemeLabel(topCategory?.items[1], defaultIcons.ruby),
      },
      gown: {
        prize: 'gown',
        label: middleCategory?.items[0] ?? prizeDefinitions.gown.label,
        icon: spinnerIcons?.gown ?? iconForThemeLabel(middleCategory?.items[0], defaultIcons.gown),
      },
      dragon: {
        prize: 'dragon',
        label: middleCategory?.items[1] ?? prizeDefinitions.dragon.label,
        icon: spinnerIcons?.dragon ?? iconForThemeLabel(middleCategory?.items[1], defaultIcons.dragon),
      },
      star: {
        prize: 'star',
        label: bottomCategory?.items[0] ?? prizeDefinitions.star.label,
        icon: spinnerIcons?.star ?? iconForThemeLabel(bottomCategory?.items[0], defaultIcons.star),
      },
      sparkle: {
        prize: 'sparkle',
        label: bottomCategory?.items[1] ?? prizeDefinitions.sparkle.label,
        icon: spinnerIcons?.sparkle ?? iconForThemeLabel(bottomCategory?.items[1], defaultIcons.sparkle),
      },
    },
  }
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
  title: 'Chance Spinner',
  targetPrize: 'crown',
  helperText:
    'Tap spaces to inspect them, or press Spin once to see one outcome before answering.',
  spaces: [
    { id: 'crown-1', prize: 'crown' },
    { id: 'ruby-1', prize: 'ruby' },
    { id: 'gown-1', prize: 'gown' },
    { id: 'dragon-1', prize: 'dragon' },
  ],
}

const screen1Copy = {
  heading: 'Chance Spinners',
  body: (princessName: string) =>
    `Welcome, ${princessName}! When this spinner spins, the arrow lands on exactly one space. Each space is one possible **outcome**.`,
  challenge: {
    id: 'total-outcomes',
    prompt:
      'A friend wants Crown to win, so they only write **Crown** as the outcome. Which list correctly shows the spinner\'s total outcomes?',
    answer: 'Crown, Ruby, Gown, Dragon',
    options: ['Crown only', 'Crown and Ruby', 'Crown, Ruby, Gown, Dragon', '4 Crowns'],
    feedback: {
      correct: 'Great thinking! Total outcomes means **everything the arrow could land on**, not just the prize someone wants.',
      tryAgain: 'Try again! Total outcomes include every spinner space the arrow could land on.',
      solution: 'The total outcomes are **Crown, Ruby, Gown, and Dragon**.',
    },
  } satisfies ChoiceChallenge,
  keyLine: 'The **total outcomes** are all the things that could happen.',
}

export const rubySpinnerVisual: SpinnerVisual = {
  id: 'ruby-winning-spaces',
  title: 'Ruby Prize Spinner',
  targetPrize: 'ruby',
  helperText: 'Look for the target prize, then count the matching spaces.',
  spaces: [
    { id: 'ruby-1', prize: 'ruby' },
    { id: 'ruby-2', prize: 'ruby' },
    { id: 'crown-1', prize: 'crown' },
    { id: 'gown-1', prize: 'gown' },
    { id: 'dragon-1', prize: 'dragon' },
    { id: 'star-1', prize: 'star' },
  ],
}

const screen2MiniLesson: ClickthroughMiniLesson<Lesson4MiniLessonPage> = {
  id: 'winning-spaces',
  title: 'Winning Spaces',
  description:
    'A spinner may feel surprising, but chance is still countable. Count the winning spaces, count all the spaces, and you can tell how likely the prize is.',
  pages: [
    {
      id: 'ruby-total-spaces',
      type: 'explanation',
      body:
        'The target prize is a **Ruby**. This spinner has Ruby spaces and other prize spaces.\n\nThe Ruby spaces are the **favorable outcomes**. They are the outcomes we are hoping for.',
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
        tryAgain: 'Try again! Put the winning Ruby spaces on top and all spinner spaces on bottom.',
        solution:
          'The target is Ruby. There are **2 Ruby spaces** and **6 total spaces**, so the chance is **2/6**.',
      },
      visual: rubySpinnerVisual,
      nextLabel: 'Continue',
    },
  ],
}

export const screen2KeyLine =
  'Chance is a counting fraction: **favorable outcomes over total outcomes**.'

export const compareSpinnerVisual: SpinnerVisual = {
  id: 'more-likely-less-likely',
  title: 'Star and Dragon Spinner',
  targetPrize: 'star',
  helperText: 'Tap Star, Crown, or Dragon spaces to compare winning spaces before answering.',
  spaces: [
    { id: 'star-1', prize: 'star' },
    { id: 'star-2', prize: 'star' },
    { id: 'star-3', prize: 'star' },
    { id: 'crown-1', prize: 'crown' },
    { id: 'crown-2', prize: 'crown' },
    { id: 'dragon-1', prize: 'dragon' },
  ],
}

const screen3Copy = {
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
      correct: 'Great work! There are **2 Crown spaces** out of **6 total spaces**, so the chance is **2/6**.',
      tryAgain: 'Count only the Crown spaces first, then count all the spaces.',
      solution: 'There are **2 Crown spaces** and **6 total spaces**, so the chance is **2/6**.',
    },
  } satisfies ChoiceChallenge,
}

export const impossibleVisual: SpinnerVisual = {
  id: 'no-dragon-spinner',
  title: 'No Dragon Spinner',
  targetPrize: 'dragon',
  helperText: 'Look for the target prize before choosing its chance.',
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
  helperText: 'Check whether any space is not the target prize.',
  spaces: [
    { id: 'sparkle-1', prize: 'sparkle' },
    { id: 'sparkle-2', prize: 'sparkle' },
    { id: 'sparkle-3', prize: 'sparkle' },
    { id: 'sparkle-4', prize: 'sparkle' },
  ],
}

const screen4MiniLesson: ClickthroughMiniLesson<Lesson4MiniLessonPage> = {
  id: 'impossible-and-certain',
  title: 'Impossible and Certain Outcomes',
  pages: [
    {
      id: 'impossible-explanation',
      type: 'explanation',
      body:
        'The target prize is **Dragon**. Look carefully for any Dragon spaces before you answer.\n\nAsk: how many spaces would make Dragon win, and how many spaces could happen at all?',
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
        tryAgain: 'Try again! How many Dragon spaces do you see?',
        solution:
          'There are no Dragon spaces. That means **0 favorable outcomes** out of **5 total outcomes**, or **0/5**.',
      },
      visual: impossibleVisual,
      nextLabel: 'Next check',
    },
    {
      id: 'certain-explanation',
      type: 'explanation',
      body:
        'Now the target prize is **Sparkle**. Check whether every space matches the target.\n\nAsk: do any possible outcomes miss the target, or does every landing space win?',
    },
    {
      id: 'sparkle-certain',
      type: 'challenge',
      prompt: 'What is the chance of spinning Sparkle?',
      answer: '4/4',
      options: ['0/4', '1/4', '3/4', '4/4'],
      feedback: {
        correct: 'Perfect! All **4 spaces** are Sparkle, so Sparkle is certain: **4/4**.',
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
  title: 'Prize Wheel',
  targetPrize: 'crown',
  helperText: 'The final wheel has 8 equal spaces. Count the winning spaces before the first spin.',
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

const screen5Copy = {
  heading: 'Prize Wheel Finale',
  body:
    'The final wheel is ready! Count the prize spaces before the first spin.',
  crownChallenge: {
    id: 'final-crown-chance',
    prompt: 'What is the chance of spinning a Crown?',
    answer: '3/8',
    options: ['1/8', '2/8', '3/8', '8/3'],
    feedback: {
      correct: 'Nice work! There are **3 Crown spaces** out of **8 total spaces**, so the chance is **3/8**.',
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
      tryAgain: 'Try again! Count Ruby spaces and Dragon spaces separately.',
      solution:
        'Ruby has **2 favorable spaces**. Dragon has **1 favorable space**. Since **2/8** is more than **1/8**, **Ruby** is more likely.',
    },
  } satisfies ChoiceChallenge,
  finalMessage:
    'You did it! Chance is not just a surprise. It is a counting fraction: **favorable outcomes over total outcomes**.',
}

export function getThemedSpinnerVisual(
  visual: SpinnerVisual,
  flavor: Lesson4ThemeFlavor,
): SpinnerVisual {
  if (visual.id === screen1Visual.id) {
    return {
      ...visual,
      title: `${flavor.settingName} Spinner`,
    }
  }

  if (visual.id === finaleVisual.id) {
    return {
      ...visual,
      title: `${flavor.settingName} Prize Wheel`,
      helperText: `The final wheel has 8 equal spaces. Count the winning spaces before your ${flavor.learnerRole} spins.`,
    }
  }

  return visual
}

export function getThemedScreen1Copy(flavor: Lesson4ThemeFlavor): typeof screen1Copy {
  return {
    ...screen1Copy,
    heading: `${flavor.settingName} Chance Spinners`,
    body: (princessName: string) =>
      `Welcome to ${flavor.settingName}, ${princessName}! When your ${flavor.learnerRole} spins, the arrow lands on exactly one space. Each space is one possible **outcome**.`,
  }
}

export function getThemedScreen2MiniLesson(
  flavor: Lesson4ThemeFlavor,
): ClickthroughMiniLesson<Lesson4MiniLessonPage> {
  return {
    ...screen2MiniLesson,
    description: `A spinner in ${flavor.settingName} may feel surprising, but chance is still countable. Count the winning spaces, count all the spaces, and you can tell how likely the prize is.`,
  }
}

export function getThemedScreen3Copy(flavor: Lesson4ThemeFlavor): typeof screen3Copy {
  return {
    ...screen3Copy,
    heading: `${flavor.settingName}: More Likely, Less Likely`,
  }
}

export function getThemedScreen4MiniLesson(
  flavor: Lesson4ThemeFlavor,
): ClickthroughMiniLesson<Lesson4MiniLessonPage> {
  return {
    ...screen4MiniLesson,
    title: `${flavor.settingName}: Impossible and Certain`,
  }
}

export function getThemedScreen5Copy(flavor: Lesson4ThemeFlavor): typeof screen5Copy {
  return {
    ...screen5Copy,
    heading: `${flavor.settingName} Prize Wheel Finale`,
    body: `The final wheel is ready! Count the prize spaces before your ${flavor.learnerRole} takes a spin.`,
  }
}
