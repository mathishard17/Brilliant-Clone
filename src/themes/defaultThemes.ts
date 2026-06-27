import type { Lesson1ThemePack, ThemePreference } from './themeTypes'
import { assertValidLesson1ThemePack } from './themeValidation'
import { DEFAULT_THEME_ITEM_STYLES } from './defaultThemeItemStyles'

export const ROYAL_LESSON_1_THEME: Lesson1ThemePack = assertValidLesson1ThemePack({
  themeName: 'Royal Academy',
  learnerRole: 'princess designer',
  intro:
    "Welcome! Tap different items in the princess closet to change the princess's outfit. See how many **unique outfits** you can design!",
  visual: {
    character: 'princess',
    characterConfig: {
      base: 'human',
      head: 'hair',
      torso: 'dress',
      feet: 'slippers',
      stage: 'royal',
      assetPack: 'royal',
    },
    screenBackground: '#ffffff',
    panelBackground: '#faf5ff',
    borderColor: '#e9d5ff',
    accentColor: '#7c3aed',
    stageBackground: '#fce7f3',
    buttonBackground: '#ffffff',
    buttonText: '#7c3aed',
    buttonBorder: '#e9d5ff',
    hintBackground: '#eff6ff',
    hintText: '#1e40af',
    successBackground: '#ecfdf5',
    successText: '#065f46',
    motifShape: 'heart',
    motifPrimary: '#ec4899',
    motifSecondary: '#a855f7',
  },
  copy: {
    screen1Heading: '🩷 Design Outfits!',
    screen2Title: '🔒 The Anchor Trick',
    screen2Button: 'Try the Royal Challenge! 🔥',
    screen3Heading: '🔵 Complete the Look!',
    screen4Heading: '✅ Royal Designer Confirmed!',
    lookNamePlural: 'outfits',
    variationNamePlural: 'total variations',
    logHeading: 'Unique Outfits Found:',
    logEmpty: 'Try tapping items in the closet!',
    logCounter: 'Total Unique Found',
    anchorIntro:
      "When you were dressing up our royal designer, did you lose track of your **choices**? Let's start with a clean slate and use the **Anchor Trick**!",
    anchorLockFirst:
      '**First:** Place the first crown on the designer and **lock** it there. We will not change it yet.',
    anchorFirstBranch:
      '**Next:** While keeping that first crown **locked**, try every gown one by one.\n\nEach gown makes a new royal outfit for that crown.',
    anchorSecondBranch:
      '**Then:** Now switch to the second crown and **lock** it. Do the same gown check again.',
    anchorTotal: 'Look at that! Each locked crown made its own group of outfits. Now add the groups together.',
    shortcutTitle: '💥 The Ultimate Multiplication Shortcut',
    shortcutIntro:
      'Instead of drawing every outfit every time, count the choices in each category and multiply those counts together.',
    shortcutCountChoices: "Here's the secret: count how many **choices** you have in each category, then **multiply** them.",
    shortcutFirstCategory: 'How many crown choices are there?',
    shortcutSecondCategory: 'How many gown choices are there? Multiply by that count.',
    shortcutThirdCategory: 'How many shoe choices are there? Multiply again.',
    shortcutTotal: 'That gives you the total number of unique outfits.',
    practicePrompt:
      'Now you try — no closet needed! Use the shortcut with a new set of choices.',
    practiceCorrect: "You're a multiplication master! The shortcut counted every possible outfit.",
    practiceIncorrect: 'Not quite! Remember the shortcut: multiply the choices in each category.',
    practiceSolution: 'Use the counts from each category and multiply them in order.',
    completeBody:
      '**Multiplying your options** is the ultimate mathematical shortcut for **counting choices**.',
  },
  categories: [
    { key: 'crowns', label: 'Sparkly Crowns', items: ['Gold Tiara', 'Diamond Crown'] },
    { key: 'dresses', label: 'Princess Gowns', items: ['Pink Ballgown', 'Purple Dress', 'Emerald Gown'] },
    { key: 'shoes', label: 'Shoes', items: ['Glass Slippers', 'Riding Boots'] },
  ],
  feedback: {
    correct: 'Magical! You counted every outfit.',
    tryAgain: "Hmm... that's not it, try again!",
    hint: 'Try locking one item first, then count what can go with it.',
  },
  itemStyles: DEFAULT_THEME_ITEM_STYLES.royal,
})

export const SPACE_LESSON_1_THEME: Lesson1ThemePack = assertValidLesson1ThemePack({
  themeName: 'Space Academy',
  learnerRole: 'astronaut stylist',
  intro:
    'Welcome to Space Academy! Tap helmets, space suits, and boots to build astronaut outfits for the moon parade. See how many **unique space outfits** you can design!',
  visual: {
    character: 'astronaut',
    characterConfig: {
      base: 'astronaut',
      head: 'helmet',
      torso: 'spaceSuit',
      feet: 'boots',
      stage: 'space',
      assetPack: 'space',
    },
    screenBackground: '#eff6ff',
    panelBackground: '#eef2ff',
    borderColor: '#93c5fd',
    accentColor: '#2563eb',
    stageBackground: '#dbeafe',
    buttonBackground: '#ffffff',
    buttonText: '#1d4ed8',
    buttonBorder: '#93c5fd',
    hintBackground: '#dbeafe',
    hintText: '#1e3a8a',
    successBackground: '#ecfeff',
    successText: '#155e75',
    motifShape: 'star',
    motifPrimary: '#38bdf8',
    motifSecondary: '#8b5cf6',
  },
  copy: {
    screen1Heading: '⭐ Build Space Outfits!',
    screen2Title: '🔒 The Anchor Trick in Space',
    screen2Button: 'Try the Space Challenge! 🔥',
    screen3Heading: '🔵 Complete the Astronaut Look!',
    screen4Heading: '✅ Astronaut Stylist Confirmed!',
    lookNamePlural: 'space outfits',
    variationNamePlural: 'total space variations',
    logHeading: 'Unique Space Outfits Found:',
    logEmpty: 'Try tapping gear in the space closet!',
    logCounter: 'Total Unique Found',
    anchorIntro:
      "When you were styling the space crew, did you lose track of your **choices**? Let's start with a clean slate and use the **Anchor Trick**!",
    anchorLockFirst:
      '**First:** Place the first helmet on the astronaut and **lock** it there. We will not change it yet.',
    anchorFirstBranch:
      '**Next:** While keeping that first helmet **locked**, try every space suit one by one.\n\nEach suit makes a new space outfit for that helmet.',
    anchorSecondBranch:
      '**Then:** Now switch to the second helmet and **lock** it. Do the same space-suit check again.',
    anchorTotal: 'Mission check! Each locked helmet made its own group of outfits. Now add the groups together.',
    shortcutTitle: '💥 The Space Gear Shortcut',
    shortcutIntro:
      'Instead of launching every possible outfit one at a time, count the choices in each gear category and multiply those counts together.',
    shortcutCountChoices: "Here's the mission plan: count how many **choices** are in each gear category, then **multiply** them.",
    shortcutFirstCategory: 'How many helmet choices are there?',
    shortcutSecondCategory: 'How many suit choices are there? Multiply by that count.',
    shortcutThirdCategory: 'How many boot choices are there? Multiply again.',
    shortcutTotal: 'That gives you the total number of unique astronaut outfits.',
    practicePrompt:
      'Now you try — no launch pad needed! Use the shortcut with a new set of space gear.',
    practiceCorrect: 'Mission complete! The shortcut counted every possible space outfit.',
    practiceIncorrect: 'Not quite, explorer. Multiply the choices in each gear category.',
    practiceSolution: 'Use the counts from each gear category and multiply them in order.',
    completeBody:
      '**Multiplying your options** is a powerful mission shortcut for **counting choices**.',
  },
  categories: [
    { key: 'crowns', label: 'Space Helmets', items: ['Silver Helmet', 'Star Helmet'] },
    { key: 'dresses', label: 'Space Suits', items: ['Blue Suit', 'Purple Suit', 'Comet Suit'] },
    { key: 'shoes', label: 'Rocket Boots', items: ['Moon Boots', 'Jet Boots'] },
  ],
  feedback: {
    correct: 'Stellar! You counted every astronaut outfit.',
    tryAgain: 'No worries, explorer. Try a different count!',
    hint: 'Pick one helmet first, then count what can go with it.',
  },
  itemStyles: DEFAULT_THEME_ITEM_STYLES.space,
})

export const DINOSAUR_LESSON_1_THEME: Lesson1ThemePack = assertValidLesson1ThemePack({
  ...SPACE_LESSON_1_THEME,
  themeName: 'Dinosaur Dig',
  learnerRole: 'dinosaur explorer',
  intro:
    'Welcome to the dinosaur dig! Tap helmets, explorer outfits, and trail boots to build expedition outfits. See how many **unique outfits** you can discover!',
  visual: {
    character: 'princess',
    characterConfig: {
      base: 'explorer',
      head: 'cap',
      torso: 'jacketAndPants',
      feet: 'boots',
      stage: 'digSite',
      assetPack: 'digSite',
    },
    screenBackground: '#f0fdf4',
    panelBackground: '#ecfccb',
    borderColor: '#84cc16',
    accentColor: '#15803d',
    stageBackground: '#dcfce7',
    buttonBackground: '#ffffff',
    buttonText: '#166534',
    buttonBorder: '#86efac',
    hintBackground: '#fef9c3',
    hintText: '#854d0e',
    successBackground: '#dcfce7',
    successText: '#166534',
    motifShape: 'triangle',
    motifPrimary: '#65a30d',
    motifSecondary: '#ca8a04',
  },
  copy: {
    ...SPACE_LESSON_1_THEME.copy!,
    screen1Heading: '🔺 Build Expedition Outfits!',
    screen2Title: '🔒 The Anchor Trick at the Dig',
    screen2Button: 'Try the Dig Challenge! 🔥',
    screen3Heading: '🟢 Complete the Explorer Look!',
    screen4Heading: '✅ Dinosaur Explorer Confirmed!',
    lookNamePlural: 'expedition outfits',
    variationNamePlural: 'total expedition variations',
    logHeading: 'Unique Expedition Outfits Found:',
    logEmpty: 'Try tapping gear in the dig closet!',
    anchorIntro:
      "When you were packing for the dinosaur dig, did you lose track of your **choices**? Let's start fresh with the **Anchor Trick**!",
    shortcutTitle: '💥 The Expedition Shortcut',
    shortcutIntro:
      'Instead of packing every possible outfit one at a time, count the choices in each gear category and multiply those counts together.',
    completeBody:
      '**Multiplying your options** is a powerful explorer shortcut for **counting choices**.',
  },
  categories: [
    { key: 'crowns', label: 'Explorer Hats', items: ['Ranger Hat', 'Fossil Cap'] },
    { key: 'dresses', label: 'Explorer Outfits', items: ['Leaf Vest', 'Amber Jacket', 'Camo Suit'] },
    { key: 'shoes', label: 'Trail Boots', items: ['Mud Boots', 'Climber Boots'] },
  ],
  feedback: {
    correct: 'Roarsome! You counted every expedition outfit.',
    tryAgain: 'Keep digging, explorer. Try a different count!',
    hint: 'Pick one hat first, then count what can go with it.',
  },
  itemStyles: DEFAULT_THEME_ITEM_STYLES.dinosaurs,
})

export const ANIMALS_LESSON_1_THEME: Lesson1ThemePack = assertValidLesson1ThemePack({
  ...SPACE_LESSON_1_THEME,
  themeName: 'Animal Rescue',
  learnerRole: 'animal helper',
  intro:
    'Welcome to Animal Rescue! Tap hats, helper outfits, and field shoes to build rescue outfits. See how many **unique outfits** you can make!',
  visual: {
    character: 'princess',
    characterConfig: {
      base: 'human',
      head: 'cap',
      torso: 'jacketAndPants',
      feet: 'sneakers',
      stage: 'rescue',
      assetPack: 'rescue',
    },
    screenBackground: '#fff7ed',
    panelBackground: '#ffedd5',
    borderColor: '#fdba74',
    accentColor: '#ea580c',
    stageBackground: '#fed7aa',
    buttonBackground: '#ffffff',
    buttonText: '#c2410c',
    buttonBorder: '#fdba74',
    hintBackground: '#fef3c7',
    hintText: '#92400e',
    successBackground: '#ecfdf5',
    successText: '#047857',
    motifShape: 'paw',
    motifPrimary: '#f97316',
    motifSecondary: '#16a34a',
  },
  copy: {
    ...SPACE_LESSON_1_THEME.copy!,
    screen1Heading: '🐾 Build Rescue Outfits!',
    screen2Title: '🔒 The Anchor Trick at Rescue Camp',
    screen2Button: 'Try the Rescue Challenge! 🔥',
    screen3Heading: '🟠 Complete the Helper Look!',
    screen4Heading: '✅ Animal Helper Confirmed!',
    lookNamePlural: 'rescue outfits',
    variationNamePlural: 'total rescue variations',
    logHeading: 'Unique Rescue Outfits Found:',
    logEmpty: 'Try tapping gear in the rescue closet!',
    anchorIntro:
      "When you were helping the animals, did you lose track of your **choices**? Let's start fresh with the **Anchor Trick**!",
    shortcutTitle: '💥 The Rescue Gear Shortcut',
    shortcutIntro:
      'Instead of trying every rescue outfit one at a time, count the choices in each gear category and multiply those counts together.',
    completeBody:
      '**Multiplying your options** is a powerful helper shortcut for **counting choices**.',
  },
  categories: [
    { key: 'crowns', label: 'Helper Hats', items: ['Safari Hat', 'Rescue Cap'] },
    { key: 'dresses', label: 'Helper Outfits', items: ['Fox Vest', 'Panda Jacket', 'Tiger Tee'] },
    { key: 'shoes', label: 'Field Shoes', items: ['Trail Shoes', 'Creek Boots'] },
  ],
  itemStyles: DEFAULT_THEME_ITEM_STYLES.animals,
  feedback: {
    correct: 'Pawsome! You counted every rescue outfit.',
    tryAgain: 'No worries, helper. Try a different count!',
    hint: 'Pick one hat first, then count what can go with it.',
  },
  lesson4: {
    spinnerIcons: {
      crown: '🧢',
      ruby: '🦊',
      gown: '🐼',
      dragon: '🐯',
      star: '🦁',
      sparkle: '🐾',
    },
  },
  voice: {
    'lesson1.screen4.shortcutIntro': {
      text: 'Multiplying your options helps you count!',
    },
  },
})

export const SPORTS_LESSON_1_THEME: Lesson1ThemePack = assertValidLesson1ThemePack({
  ...SPACE_LESSON_1_THEME,
  themeName: 'Sports Squad',
  learnerRole: 'team stylist',
  intro:
    'Welcome to Sports Squad! Tap caps, jerseys, and sneakers to build team outfits. See how many **unique outfits** you can make!',
  visual: {
    character: 'princess',
    characterConfig: {
      base: 'human',
      head: 'cap',
      torso: 'jersey',
      feet: 'sneakers',
      stage: 'sports',
      assetPack: 'sports',
    },
    screenBackground: '#f0f9ff',
    panelBackground: '#e0f2fe',
    borderColor: '#7dd3fc',
    accentColor: '#0284c7',
    stageBackground: '#bae6fd',
    buttonBackground: '#ffffff',
    buttonText: '#0369a1',
    buttonBorder: '#7dd3fc',
    hintBackground: '#ecfeff',
    hintText: '#155e75',
    successBackground: '#f0fdf4',
    successText: '#166534',
    motifShape: 'circle',
    motifPrimary: '#0ea5e9',
    motifSecondary: '#f97316',
  },
  copy: {
    ...SPACE_LESSON_1_THEME.copy!,
    screen1Heading: '🔵 Build Team Outfits!',
    screen2Title: '🔒 The Anchor Trick at Practice',
    screen2Button: 'Try the Team Challenge! 🔥',
    screen3Heading: '🟠 Complete the Team Look!',
    screen4Heading: '✅ Team Stylist Confirmed!',
    lookNamePlural: 'team outfits',
    variationNamePlural: 'total team variations',
    logHeading: 'Unique Team Outfits Found:',
    logEmpty: 'Try tapping gear in the team closet!',
    anchorIntro:
      "When you were getting the team ready, did you lose track of your **choices**? Let's start fresh with the **Anchor Trick**!",
    shortcutTitle: '💥 The Team Gear Shortcut',
    shortcutIntro:
      'Instead of trying every team outfit one at a time, count the choices in each gear category and multiply those counts together.',
    completeBody:
      '**Multiplying your options** is a powerful team shortcut for **counting choices**.',
  },
  categories: [
    { key: 'crowns', label: 'Team Caps', items: ['Blue Cap', 'Gold Cap'] },
    { key: 'dresses', label: 'Jerseys', items: ['Striker Jersey', 'Goalie Jersey', 'Captain Jersey'] },
    { key: 'shoes', label: 'Sneakers', items: ['Sprint Sneakers', 'Court Sneakers'] },
  ],
  feedback: {
    correct: 'Score! You counted every team outfit.',
    tryAgain: 'Good hustle. Try a different count!',
    hint: 'Pick one cap first, then count what can go with it.',
  },
  itemStyles: DEFAULT_THEME_ITEM_STYLES.sports,
})

export const SURPRISE_LESSON_1_THEME: Lesson1ThemePack = assertValidLesson1ThemePack({
  ...SPACE_LESSON_1_THEME,
  themeName: 'Surprise Studio',
  learnerRole: 'outfit inventor',
  intro:
    'Welcome to Surprise Studio! Tap toppers, outfits, and shoes to invent playful outfits. See how many **unique outfits** you can make!',
  visual: {
    character: 'princess',
    characterConfig: {
      base: 'mascot',
      head: 'beret',
      torso: 'smock',
      feet: 'sneakers',
      stage: 'studio',
      assetPack: 'studio',
    },
    screenBackground: '#fdf4ff',
    panelBackground: '#fae8ff',
    borderColor: '#f0abfc',
    accentColor: '#c026d3',
    stageBackground: '#f5d0fe',
    buttonBackground: '#ffffff',
    buttonText: '#a21caf',
    buttonBorder: '#f0abfc',
    hintBackground: '#fef3c7',
    hintText: '#92400e',
    successBackground: '#ecfdf5',
    successText: '#047857',
    motifShape: 'diamond',
    motifPrimary: '#d946ef',
    motifSecondary: '#f59e0b',
  },
  copy: {
    ...SPACE_LESSON_1_THEME.copy!,
    screen1Heading: '💎 Invent New Outfits!',
    screen2Title: '🔒 The Anchor Trick in the Studio',
    screen2Button: 'Try the Studio Challenge! 🔥',
    screen3Heading: '🟡 Complete the Studio Outfit!',
    screen4Heading: '✅ Outfit Inventor Confirmed!',
    lookNamePlural: 'studio outfits',
    variationNamePlural: 'total studio variations',
    logHeading: 'Unique Studio Outfits Found:',
    logEmpty: 'Try tapping options in the studio closet!',
    anchorIntro:
      "When you were inventing studio outfits, did you lose track of your **choices**? Let's start fresh with the **Anchor Trick**!",
    shortcutTitle: '💥 The Studio Shortcut',
    shortcutIntro:
      'Instead of trying every studio outfit one at a time, count the choices in each category and multiply those counts together.',
    completeBody:
      '**Multiplying your options** is a powerful inventor shortcut for **counting choices**.',
  },
  categories: [
    { key: 'crowns', label: 'Toppers', items: ['Spark Topper', 'Glow Topper'] },
    { key: 'dresses', label: 'Outfits', items: ['Rainbow Fit', 'Cloud Fit', 'Comet Fit'] },
    { key: 'shoes', label: 'Shoes', items: ['Bounce Shoes', 'Glide Shoes'] },
  ],
  feedback: {
    correct: 'Brilliant! You counted every studio outfit.',
    tryAgain: 'Try another count, inventor.',
    hint: 'Pick one topper first, then count what can go with it.',
  },
  itemStyles: DEFAULT_THEME_ITEM_STYLES.surprise,
})

export const DEFAULT_LESSON_1_THEMES: Record<ThemePreference, Lesson1ThemePack> = {
  royal: ROYAL_LESSON_1_THEME,
  space: SPACE_LESSON_1_THEME,
  dinosaurs: DINOSAUR_LESSON_1_THEME,
  animals: ANIMALS_LESSON_1_THEME,
  sports: SPORTS_LESSON_1_THEME,
  surprise: SURPRISE_LESSON_1_THEME,
}
