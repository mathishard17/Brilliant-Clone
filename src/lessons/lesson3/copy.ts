import type {
  ChallengeMiniLessonPage,
  ClickthroughMiniLesson,
  ExplanationMiniLessonPage,
} from '../../types/lesson'
import type { ThemePreference } from '../../themes/themeTypes'

export const lesson3Treasures = [
  { id: 'ruby' },
  { id: 'sapphire' },
  { id: 'emerald' },
  { id: 'pearl' },
  { id: 'amethyst' },
] as const

export type Lesson3TreasureId = (typeof lesson3Treasures)[number]['id']

type Lesson3TreasureLabels = Record<Lesson3TreasureId, string>

export interface Lesson3ThemeCopy {
  treasureLabels: Lesson3TreasureLabels
  itemSingular: string
  itemPlural: string
  containerSingular: string
  containerPlural: string
  collectionName: string
  pickerHeading: string
  pickerIntro: (learnerName: string) => string
  choiceAreaLabel: string
  currentContainerAriaLabel: string
  compareNextLabel: string
  startNewContainerLabel: string
  initialStatus: string
  firstPickStatus: string
  nextContainerStatus: string
  duplicateStatus: (learnerName: string, pairLabel: string) => string
  newFoundStatus: (pairLabel: string) => string
  foundHeading: string
  foundEmpty: string
  foundCounter: string
  sameBagTitle: string
  sameBagAriaLabel: string
  sameBagLookBody: string
  sameBagMatchBody: string
  countingHeading: string
  countingBody: string
  orderedPicksHeading: string
  collapseRepeatsLabel: string
  showPickOrdersLabel: string
  repeatLabel: string
  uniqueLeftHeading: string
  shortcutHidden: string
  countingNextLabel: string
  smallerChallengeHeading: string
  smallerChallengeBody: string
  smallerCollectionAriaLabel: string
  smallerListHeading: string
  smallerListHidden: string
  finalNextLabel: string
  finalHeading: string
  finalIntro: string
}

const ROYAL_TREASURE_LABELS: Lesson3TreasureLabels = {
  ruby: 'Ruby',
  sapphire: 'Sapphire',
  emerald: 'Emerald',
  pearl: 'Pearl',
  amethyst: 'Amethyst',
}

const ROYAL_LESSON_3_THEME: Lesson3ThemeCopy = {
  treasureLabels: ROYAL_TREASURE_LABELS,
  itemSingular: 'treasure',
  itemPlural: 'treasures',
  containerSingular: 'gift bag',
  containerPlural: 'treasure bags',
  collectionName: 'royal vault',
  pickerHeading: '🎁 Open the Royal Vault',
  pickerIntro: (learnerName) =>
    `Hi, ${learnerName}! The royal vault is sparkling today. Choose **2 different treasures** for each royal gift bag. How many different treasure bags can you make?`,
  choiceAreaLabel: 'Royal vault treasures',
  currentContainerAriaLabel: 'Current royal gift bag',
  compareNextLabel: 'Compare Two Bags',
  startNewContainerLabel: 'Start a New Bag',
  initialStatus: 'Tap two different treasures to make your first royal bag.',
  firstPickStatus: 'Great first pick! Choose one more treasure for the bag.',
  nextContainerStatus: 'Choose two treasures for the next bag.',
  duplicateStatus: (learnerName, pairLabel) =>
    `Royal repeat, ${learnerName}! ${pairLabel} is already in the list.`,
  newFoundStatus: (pairLabel) => `New treasure bag found! ${pairLabel}.`,
  foundHeading: 'Unique treasure bags found',
  foundEmpty: 'No bags yet.',
  foundCounter: 'Unique treasure bags found',
  sameBagTitle: 'The Same Bag Test',
  sameBagAriaLabel: 'Two treasure bags with the same items in either order',
  sameBagLookBody: 'Look closely at these two royal treasure bags.',
  sameBagMatchBody: 'Both bags have the same treasures. **Same treasures, same bag.**',
  countingHeading: '✨ Count Without Repeats',
  countingBody:
    'The royal helper wrote down every first-pick and second-pick order. Let’s cross out the royal repeats.',
  orderedPicksHeading: 'Ordered picks from 3 treasures',
  collapseRepeatsLabel: 'Cross Out Royal Repeats',
  showPickOrdersLabel: 'Show Pick Orders',
  repeatLabel: 'repeat',
  uniqueLeftHeading: 'Unique bags left',
  shortcutHidden: 'Try the 5-treasure challenge below. The shortcut will appear after you answer.',
  countingNextLabel: 'Try a New Vault',
  smallerChallengeHeading: '👑 Royal Bag Challenge',
  smallerChallengeBody:
    'A smaller royal vault is ready. Use the same rule: count pick orders, then divide out the repeats.',
  smallerCollectionAriaLabel: 'Four treasures in the smaller vault',
  smallerListHeading: 'Unique bags in the smaller vault',
  smallerListHidden: 'The finished bag list will appear after you solve the challenge.',
  finalNextLabel: 'Final Order Check',
  finalHeading: 'Arrangement or Combination?',
  finalIntro:
    'Ask the royal counting question: **Does order matter?** Sort each story before finishing the lesson.',
}

// TODO(theme-pack): Replace these local presets with validated Lesson 3 theme packs
// once shared theme types support lesson-specific combination copy.
const LESSON_3_THEMES: Record<ThemePreference, Lesson3ThemeCopy> = {
  royal: ROYAL_LESSON_3_THEME,
  space: {
    ...ROYAL_LESSON_3_THEME,
    treasureLabels: {
      ruby: 'Moon Stone',
      sapphire: 'Star Badge',
      emerald: 'Comet Shard',
      pearl: 'Orbit Gem',
      amethyst: 'Rocket Charm',
    },
    itemSingular: 'space find',
    itemPlural: 'space finds',
    containerSingular: 'mission kit',
    containerPlural: 'mission kits',
    collectionName: 'space supply bay',
    pickerHeading: '🚀 Open the Space Supply Bay',
    pickerIntro: (learnerName) =>
      `Hi, ${learnerName}! The space supply bay is glowing today. Choose **2 different space finds** for each mission kit. How many different mission kits can you make?`,
    choiceAreaLabel: 'Space supply finds',
    currentContainerAriaLabel: 'Current mission kit',
    initialStatus: 'Tap two different space finds to make your first mission kit.',
    firstPickStatus: 'Great first pick! Choose one more space find for the kit.',
    nextContainerStatus: 'Choose two space finds for the next kit.',
    duplicateStatus: (learnerName, pairLabel) =>
      `Mission repeat, ${learnerName}! ${pairLabel} is already in the list.`,
    newFoundStatus: (pairLabel) => `New mission kit found! ${pairLabel}.`,
    foundHeading: 'Unique mission kits found',
    foundCounter: 'Unique mission kits found',
    sameBagTitle: 'The Same Kit Test',
    sameBagAriaLabel: 'Two mission kits with the same items in either order',
    sameBagLookBody: 'Look closely at these two mission kits.',
    sameBagMatchBody: 'Both kits have the same space finds. **Same finds, same kit.**',
    countingBody:
      'The mission helper wrote down every first-pick and second-pick order. Let’s cross out the repeated orders.',
    orderedPicksHeading: 'Ordered picks from 3 space finds',
    collapseRepeatsLabel: 'Cross Out Repeats',
    uniqueLeftHeading: 'Unique kits left',
    shortcutHidden:
      'Try the 5-space-find challenge below. The shortcut will appear after you answer.',
    countingNextLabel: 'Try a New Supply Bay',
    smallerChallengeHeading: '🚀 Mission Kit Challenge',
    smallerChallengeBody:
      'A smaller supply bay is ready. Use the same rule: count pick orders, then divide out the repeats.',
    smallerCollectionAriaLabel: 'Four space finds in the smaller supply bay',
    smallerListHeading: 'Unique kits in the smaller supply bay',
    finalHeading: 'Arrangement or Combination?',
    finalIntro:
      'Ask the counting question: **Does order matter?** Sort each space story before finishing the lesson.',
  },
  dinosaurs: {
    ...ROYAL_LESSON_3_THEME,
    treasureLabels: {
      ruby: 'Claw Fossil',
      sapphire: 'Leaf Fossil',
      emerald: 'Amber Stone',
      pearl: 'Shell Fossil',
      amethyst: 'Footprint Cast',
    },
    itemSingular: 'fossil find',
    itemPlural: 'fossil finds',
    containerSingular: 'field kit',
    containerPlural: 'field kits',
    collectionName: 'dig site',
    pickerHeading: '🦕 Open the Dig Site',
    pickerIntro: (learnerName) =>
      `Hi, ${learnerName}! The dig site has new finds today. Choose **2 different fossil finds** for each field kit. How many different field kits can you make?`,
    choiceAreaLabel: 'Dig site fossil finds',
    currentContainerAriaLabel: 'Current field kit',
    initialStatus: 'Tap two different fossil finds to make your first field kit.',
    firstPickStatus: 'Great first pick! Choose one more fossil find for the kit.',
    nextContainerStatus: 'Choose two fossil finds for the next kit.',
    duplicateStatus: (learnerName, pairLabel) =>
      `Dig repeat, ${learnerName}! ${pairLabel} is already in the list.`,
    newFoundStatus: (pairLabel) => `New field kit found! ${pairLabel}.`,
    foundHeading: 'Unique field kits found',
    foundCounter: 'Unique field kits found',
    sameBagTitle: 'The Same Kit Test',
    sameBagAriaLabel: 'Two field kits with the same finds in either order',
    sameBagLookBody: 'Look closely at these two field kits.',
    sameBagMatchBody: 'Both kits have the same fossil finds. **Same finds, same kit.**',
    countingBody:
      'The dig helper wrote down every first-pick and second-pick order. Let’s cross out the repeated orders.',
    orderedPicksHeading: 'Ordered picks from 3 fossil finds',
    collapseRepeatsLabel: 'Cross Out Repeats',
    uniqueLeftHeading: 'Unique kits left',
    shortcutHidden:
      'Try the 5-fossil-find challenge below. The shortcut will appear after you answer.',
    countingNextLabel: 'Try a New Dig Site',
    smallerChallengeHeading: '🦕 Field Kit Challenge',
    smallerChallengeBody:
      'A smaller dig site is ready. Use the same rule: count pick orders, then divide out the repeats.',
    smallerCollectionAriaLabel: 'Four fossil finds in the smaller dig site',
    smallerListHeading: 'Unique kits in the smaller dig site',
    finalIntro:
      'Ask the counting question: **Does order matter?** Sort each fossil story before finishing the lesson.',
  },
  animals: {
    ...ROYAL_LESSON_3_THEME,
    treasureLabels: {
      ruby: 'Fox Badge',
      sapphire: 'Panda Snack',
      emerald: 'Tiger Toy',
      pearl: 'Turtle Shell',
      amethyst: 'Bunny Brush',
    },
    itemSingular: 'rescue item',
    itemPlural: 'rescue items',
    containerSingular: 'care kit',
    containerPlural: 'care kits',
    collectionName: 'rescue shelf',
    pickerHeading: '🐾 Open the Rescue Shelf',
    pickerIntro: (learnerName) =>
      `Hi, ${learnerName}! The rescue shelf is ready today. Choose **2 different rescue items** for each care kit. How many different care kits can you make?`,
    choiceAreaLabel: 'Rescue shelf items',
    currentContainerAriaLabel: 'Current care kit',
    initialStatus: 'Tap two different rescue items to make your first care kit.',
    firstPickStatus: 'Great first pick! Choose one more rescue item for the kit.',
    nextContainerStatus: 'Choose two rescue items for the next kit.',
    duplicateStatus: (learnerName, pairLabel) =>
      `Rescue repeat, ${learnerName}! ${pairLabel} is already in the list.`,
    newFoundStatus: (pairLabel) => `New care kit found! ${pairLabel}.`,
    foundHeading: 'Unique care kits found',
    foundCounter: 'Unique care kits found',
    sameBagTitle: 'The Same Kit Test',
    sameBagAriaLabel: 'Two care kits with the same items in either order',
    sameBagLookBody: 'Look closely at these two care kits.',
    sameBagMatchBody: 'Both kits have the same rescue items. **Same items, same kit.**',
    countingBody:
      'The rescue helper wrote down every first-pick and second-pick order. Let’s cross out the repeated orders.',
    orderedPicksHeading: 'Ordered picks from 3 rescue items',
    collapseRepeatsLabel: 'Cross Out Repeats',
    uniqueLeftHeading: 'Unique kits left',
    shortcutHidden:
      'Try the 5-rescue-item challenge below. The shortcut will appear after you answer.',
    countingNextLabel: 'Try a New Shelf',
    smallerChallengeHeading: '🐾 Care Kit Challenge',
    smallerChallengeBody:
      'A smaller rescue shelf is ready. Use the same rule: count pick orders, then divide out the repeats.',
    smallerCollectionAriaLabel: 'Four rescue items on the smaller shelf',
    smallerListHeading: 'Unique kits on the smaller shelf',
    finalIntro:
      'Ask the counting question: **Does order matter?** Sort each rescue story before finishing the lesson.',
  },
  sports: {
    ...ROYAL_LESSON_3_THEME,
    treasureLabels: {
      ruby: 'Blue Cap',
      sapphire: 'Gold Medal',
      emerald: 'Green Jersey',
      pearl: 'White Sneaker',
      amethyst: 'Purple Pennant',
    },
    itemSingular: 'team item',
    itemPlural: 'team items',
    containerSingular: 'team kit',
    containerPlural: 'team kits',
    collectionName: 'gear locker',
    pickerHeading: '🏅 Open the Gear Locker',
    pickerIntro: (learnerName) =>
      `Hi, ${learnerName}! The gear locker is ready today. Choose **2 different team items** for each team kit. How many different team kits can you make?`,
    choiceAreaLabel: 'Gear locker team items',
    currentContainerAriaLabel: 'Current team kit',
    initialStatus: 'Tap two different team items to make your first team kit.',
    firstPickStatus: 'Great first pick! Choose one more team item for the kit.',
    nextContainerStatus: 'Choose two team items for the next kit.',
    duplicateStatus: (learnerName, pairLabel) =>
      `Team repeat, ${learnerName}! ${pairLabel} is already in the list.`,
    newFoundStatus: (pairLabel) => `New team kit found! ${pairLabel}.`,
    foundHeading: 'Unique team kits found',
    foundCounter: 'Unique team kits found',
    sameBagTitle: 'The Same Kit Test',
    sameBagAriaLabel: 'Two team kits with the same items in either order',
    sameBagLookBody: 'Look closely at these two team kits.',
    sameBagMatchBody: 'Both kits have the same team items. **Same items, same kit.**',
    countingBody:
      'The team helper wrote down every first-pick and second-pick order. Let’s cross out the repeated orders.',
    orderedPicksHeading: 'Ordered picks from 3 team items',
    collapseRepeatsLabel: 'Cross Out Repeats',
    uniqueLeftHeading: 'Unique kits left',
    shortcutHidden:
      'Try the 5-team-item challenge below. The shortcut will appear after you answer.',
    countingNextLabel: 'Try a New Locker',
    smallerChallengeHeading: '🏅 Team Kit Challenge',
    smallerChallengeBody:
      'A smaller gear locker is ready. Use the same rule: count pick orders, then divide out the repeats.',
    smallerCollectionAriaLabel: 'Four team items in the smaller locker',
    smallerListHeading: 'Unique kits in the smaller locker',
    finalIntro:
      'Ask the counting question: **Does order matter?** Sort each team story before finishing the lesson.',
  },
  surprise: {
    ...ROYAL_LESSON_3_THEME,
    treasureLabels: {
      ruby: 'Spark Charm',
      sapphire: 'Glow Card',
      emerald: 'Rainbow Token',
      pearl: 'Cloud Pin',
      amethyst: 'Wonder Gem',
    },
    itemSingular: 'studio item',
    itemPlural: 'studio items',
    containerSingular: 'surprise kit',
    containerPlural: 'surprise kits',
    collectionName: 'idea studio',
    pickerHeading: '✨ Open the Idea Studio',
    pickerIntro: (learnerName) =>
      `Hi, ${learnerName}! The idea studio is sparkling today. Choose **2 different studio items** for each surprise kit. How many different surprise kits can you make?`,
    choiceAreaLabel: 'Idea studio items',
    currentContainerAriaLabel: 'Current surprise kit',
    initialStatus: 'Tap two different studio items to make your first surprise kit.',
    firstPickStatus: 'Great first pick! Choose one more studio item for the kit.',
    nextContainerStatus: 'Choose two studio items for the next kit.',
    duplicateStatus: (learnerName, pairLabel) =>
      `Studio repeat, ${learnerName}! ${pairLabel} is already in the list.`,
    newFoundStatus: (pairLabel) => `New surprise kit found! ${pairLabel}.`,
    foundHeading: 'Unique surprise kits found',
    foundCounter: 'Unique surprise kits found',
    sameBagTitle: 'The Same Kit Test',
    sameBagAriaLabel: 'Two surprise kits with the same items in either order',
    sameBagLookBody: 'Look closely at these two surprise kits.',
    sameBagMatchBody: 'Both kits have the same studio items. **Same items, same kit.**',
    countingBody:
      'The studio helper wrote down every first-pick and second-pick order. Let’s cross out the repeated orders.',
    orderedPicksHeading: 'Ordered picks from 3 studio items',
    collapseRepeatsLabel: 'Cross Out Repeats',
    uniqueLeftHeading: 'Unique kits left',
    shortcutHidden:
      'Try the 5-studio-item challenge below. The shortcut will appear after you answer.',
    countingNextLabel: 'Try a New Studio Shelf',
    smallerChallengeHeading: '✨ Surprise Kit Challenge',
    smallerChallengeBody:
      'A smaller studio shelf is ready. Use the same rule: count pick orders, then divide out the repeats.',
    smallerCollectionAriaLabel: 'Four studio items on the smaller shelf',
    smallerListHeading: 'Unique kits on the smaller shelf',
    finalIntro:
      'Ask the counting question: **Does order matter?** Sort each studio story before finishing the lesson.',
  },
}

export function getLesson3ThemeCopy(themePreference: ThemePreference): Lesson3ThemeCopy {
  return LESSON_3_THEMES[themePreference] ?? ROYAL_LESSON_3_THEME
}

export function getLesson3TreasureLabel(
  theme: Lesson3ThemeCopy,
  treasureId: Lesson3TreasureId,
) {
  return theme.treasureLabels[treasureId] ?? ROYAL_TREASURE_LABELS[treasureId]
}

export function getLesson3TreasureAriaLabel(
  theme: Lesson3ThemeCopy,
  treasureId: Lesson3TreasureId,
) {
  return `${getLesson3TreasureLabel(theme, treasureId)} ${theme.itemSingular}`
}

export function getLesson3PairLabel(
  theme: Lesson3ThemeCopy,
  treasureIds: readonly Lesson3TreasureId[],
) {
  return treasureIds.map((treasureId) => getLesson3TreasureLabel(theme, treasureId)).join(' + ')
}

function sentenceCase(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

export function getLesson3ContainerLabel(theme: Lesson3ThemeCopy, suffix: 'A' | 'B') {
  return `${sentenceCase(theme.containerSingular)} ${suffix}`
}

export function getLesson3SameContainerStamp(theme: Lesson3ThemeCopy) {
  return `Same ${theme.containerSingular}`
}

function listTreasureLabels(theme: Lesson3ThemeCopy, treasureIds: readonly Lesson3TreasureId[]) {
  const labels = treasureIds.map((treasureId) => getLesson3TreasureLabel(theme, treasureId))
  if (labels.length <= 1) return labels[0] ?? ''
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}

interface Lesson3VisualizationSection {
  heading: string
  body: (princessName: string) => string
  nextLabel: string
}

export function lesson3TreasureBagSection(theme: Lesson3ThemeCopy): Lesson3VisualizationSection {
  return {
    heading: theme.pickerHeading,
    body: theme.pickerIntro,
    nextLabel: theme.compareNextLabel,
  }
}

type Lesson3SameBagPage = ExplanationMiniLessonPage

export function lesson3SameBagMiniLesson(
  theme: Lesson3ThemeCopy,
): ClickthroughMiniLesson<Lesson3SameBagPage> {
  const forwardPair = getLesson3PairLabel(theme, ['ruby', 'sapphire'])
  const reversePair = getLesson3PairLabel(theme, ['sapphire', 'ruby'])
  const firstContainer = getLesson3ContainerLabel(theme, 'A')
  const secondContainer = getLesson3ContainerLabel(theme, 'B')
  return {
    id: 'lesson-3-same-bag',
    title: theme.sameBagTitle,
    pages: [
      {
        id: 'same-bag-look',
        type: 'explanation',
        body: theme.sameBagLookBody,
      },
      {
        id: 'same-bag-a',
        type: 'explanation',
        body: `${firstContainer}: **${forwardPair}**.`,
      },
      {
        id: 'same-bag-b',
        type: 'explanation',
        body: `${secondContainer}: **${reversePair}**.`,
      },
      {
        id: 'same-bag-match',
        type: 'explanation',
        body: theme.sameBagMatchBody,
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
}

export function lesson3CountingSection(theme: Lesson3ThemeCopy): Lesson3VisualizationSection {
  return {
    heading: theme.countingHeading,
    body: () => theme.countingBody,
    nextLabel: theme.countingNextLabel,
  }
}

export function lesson3CountingChallenge(
  princessName: string,
  theme: Lesson3ThemeCopy,
): ChallengeMiniLessonPage<number> {
  const fullList = listTreasureLabels(theme, lesson3Treasures.map((treasure) => treasure.id))
  const forwardPair = getLesson3PairLabel(theme, ['ruby', 'sapphire'])
  const reversePair = getLesson3PairLabel(theme, ['sapphire', 'ruby'])
  return {
    id: 'lesson-3-first-treasure-bags',
    type: 'challenge',
    prompt: `The ${theme.collectionName} has **5 ${theme.itemPlural}**: ${fullList}. Each ${theme.containerSingular} gets **2 different ${theme.itemPlural}**. How many unique ${theme.containerPlural} can ${princessName} make?`,
    answer: 10,
    feedback: {
      correct: `Exactly, ${princessName}! There are **10 unique ${theme.containerPlural}**. ${forwardPair} and ${reversePair} are the same ${theme.containerSingular}, so we only count that pair once.`,
      tryAgain: `Try again, ${princessName}! Ask: does the ${theme.containerSingular} care which ${theme.itemSingular} was picked first?`,
      incorrect:
        'Not quite. If you counted pick orders, check whether some orders end with the same final pair.',
      solution: `There are **5 choices** for the first ${theme.itemSingular} and **4 choices** for the second ${theme.itemSingular}: **5 x 4 = 20** pick orders. Each pair has 2 orders, so **20 / 2 = 10** unique ${theme.containerPlural}.`,
    },
  }
}

export function lesson3RoyalBagChallenge(
  princessName: string,
  theme: Lesson3ThemeCopy,
): ChallengeMiniLessonPage<number> {
  const smallerList = listTreasureLabels(theme, ['ruby', 'sapphire', 'emerald', 'pearl'])
  return {
    id: 'lesson-3-smaller-royal-vault',
    type: 'challenge',
    prompt: `A smaller ${theme.collectionName} has **4 ${theme.itemPlural}**: ${smallerList}. Each ${theme.containerSingular} gets **2 different ${theme.itemPlural}**. How many unique ${theme.containerPlural} can ${princessName} make?`,
    answer: 6,
    feedback: {
      correct: `Beautiful counting, ${princessName}! **4 x 3 = 12** pick orders, and each pair is counted twice, so **12 / 2 = 6** unique ${theme.containerPlural}.`,
      tryAgain:
        'Try again! List the pick orders first, then look for orders that end with the same final pair.',
      incorrect:
        `Not quite. Some pick paths end with the same final ${theme.containerSingular}, so they should not all count as new.`,
      solution: `First count ordered picks: **4 choices first x 3 choices second = 12**. Then divide by 2 because each pair appears twice: **12 / 2 = 6** unique ${theme.containerPlural}.`,
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

export function lesson3FinalSortCards(theme: Lesson3ThemeCopy): Lesson3SortCard[] {
  const firstThree = listTreasureLabels(theme, ['ruby', 'sapphire', 'emerald'])
  return [
    {
      id: 'display-lineup',
      prompt: `A helper places ${firstThree} into 3 display spots.`,
      correctAnswer: 'order',
      correctFeedback:
        'Exactly! Display spots are a lineup, so switching items changes the display.',
      tryAgainFeedback:
        'Try again! Ask whether the items are being placed into specific spots or simply gathered together.',
    },
    {
      id: 'gift-bag-pair',
      prompt: `A helper chooses 2 ${theme.itemPlural} for one ${theme.containerSingular}.`,
      correctAnswer: 'group',
      correctFeedback: `Correct! A ${theme.containerSingular} only cares which ${theme.itemPlural} are inside, not which one was picked first.`,
      tryAgainFeedback: `Try again! Compare what changes and what stays the same when the two ${theme.itemPlural} are picked in the opposite order.`,
    },
    {
      id: 'race-places',
      prompt: 'A race gives 1st, 2nd, and 3rd place ribbons.',
      correctAnswer: 'order',
      correctFeedback: 'Yes! Race places are different spots, so order matters.',
      tryAgainFeedback:
        'Try again! Ask whether the ribbons name separate roles or just one shared group.',
    },
    {
      id: 'helper-group',
      prompt: `A helper chooses 3 teammates to receive ${theme.containerPlural}.`,
      correctAnswer: 'group',
      correctFeedback:
        'Correct! Choosing teammates is a combination because the same people are chosen in any order.',
      tryAgainFeedback:
        'Try again! Ask whether each teammate gets a different position, or whether only the chosen set matters.',
    },
  ]
}

export function lesson3CompletionMessage(princessName: string, theme: Lesson3ThemeCopy) {
  return `You completed the ${theme.containerPlural} lesson, ${princessName}! When the same group is still the same group, order does not matter. That is a **combination**.`
}
