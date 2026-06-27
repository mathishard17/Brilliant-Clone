import type { LessonDefinition } from '../lessons/registry'
import { LESSON_1_ID, LESSON_2_ID, LESSON_3_ID, LESSON_4_ID, LESSON_5_ID } from '../types/lesson'
import type { Lesson1ThemePack, ThemePreference } from '../themes/themeTypes'
import { getLesson1ThemeCopy } from '../themes/themeResolver'

interface HubLessonDisplay {
  title: string
  emoji: string
  description: string
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function singularize(value: string) {
  return value.replace(/\s+/g, ' ').trim().replace(/ies$/i, 'y').replace(/s$/i, '')
}

function formatCategoryList(theme: Lesson1ThemePack) {
  const labels = theme.categories.map((category) => category.label)
  if (labels.length <= 1) return labels.join('')
  return `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`
}

function getLesson1HubEmoji(theme: Lesson1ThemePack) {
  const themeName = theme.themeName.toLowerCase()
  if (theme.visual?.character === 'astronaut' || themeName.includes('space')) return '🚀'
  if (themeName.includes('dinosaur')) return '🦕'
  if (themeName.includes('animal')) return '🐾'
  if (themeName.includes('sport')) return '🏅'
  if (themeName.includes('surprise') || themeName.includes('studio')) return '✨'

  const motifEmoji: Record<string, string> = {
    heart: '👑',
    circle: '🔵',
    square: '🟦',
    star: '⭐',
    diamond: '💎',
    triangle: '🔺',
    paw: '🐾',
  }
  return motifEmoji[theme.visual?.motifShape ?? 'heart'] ?? '👑'
}

function getThemeHubEmojis(theme: Lesson1ThemePack, preference: ThemePreference) {
  const themeName = theme.themeName.toLowerCase()

  if (theme.visual?.character === 'astronaut' || themeName.includes('space')) {
    return ['🚀', '🛰️', '🪐', '🌌', '👾'] as const
  }
  if (preference === 'dinosaurs' || themeName.includes('dinosaur')) {
    return ['🦕', '🦖', '🦴', '🌋', '🥚'] as const
  }
  if (preference === 'animals' || themeName.includes('animal')) {
    return ['🐾', '🦊', '🐼', '🐯', '🦁'] as const
  }
  if (preference === 'sports' || themeName.includes('sport')) {
    return ['🏅', '⚽', '🏀', '🎾', '🏆'] as const
  }
  if (themeName.includes('surprise') || themeName.includes('studio')) {
    return ['✨', '🌈', '🎲', '🪄', '🎨'] as const
  }

  return ['👑', '💎', '🎁', '⭐', '🎪'] as const
}

function getLesson1HubDisplay(theme: Lesson1ThemePack) {
  const themeName = theme.themeName.toLowerCase()
  const copy = getLesson1ThemeCopy(theme)
  const outfitTitle =
    theme.visual?.character === 'astronaut' || themeName.includes('space')
      ? 'Astronaut Outfits'
      : themeName.includes('royal')
        ? 'Princess Outfits'
        : toTitleCase(copy.lookNamePlural)

  return {
    title: outfitTitle,
    emoji: getLesson1HubEmoji(theme),
    description: `Count combinations with ${formatCategoryList(theme)}`,
  }
}

function getThemeHubWords(theme: Lesson1ThemePack, preference: ThemePreference) {
  const themeName = theme.themeName.toLowerCase()
  const categories = theme.categories.map((category) => category.label)
  const copy = getLesson1ThemeCopy(theme)
  const themeLabel = toTitleCase(theme.themeName)
  const lookLabel = toTitleCase(copy.lookNamePlural)
  const itemLabel = singularize(categories[1] ?? copy.lookNamePlural)
  const chooseLabel = singularize(categories[0] ?? copy.lookNamePlural)
  const gameWorld = `${theme.learnerRole || singularize(theme.themeName)} games`

  if (theme.visual?.character === 'astronaut' || themeName.includes('space')) {
    return {
      emoji: '🚀',
      hubTitle: '🚀 Space Academy',
      lineup: 'Space Gear Lineups',
      choose: 'Mission Gear Kits',
      chance: 'Space Chance Spinners',
      fair: 'Fair Space Games',
      orderItems: categories[1] ?? 'space gear',
      chooseItems: 'mission gear',
      gameWorld: 'mission games',
    }
  }

  if (preference === 'dinosaurs' || themeName.includes('dinosaur')) {
    return {
      emoji: '🦕',
      hubTitle: '🦕 Dinosaur Dig',
      lineup: 'Expedition Gear Lineups',
      choose: 'Fossil Field Kits',
      chance: 'Dinosaur Chance Spinners',
      fair: 'Fair Dig Games',
      orderItems: 'explorer gear',
      chooseItems: 'field supplies',
      gameWorld: 'dig-site games',
    }
  }

  if (preference === 'animals' || themeName.includes('animal')) {
    return {
      emoji: '🐾',
      hubTitle: '🐾 Animal Rescue Academy',
      lineup: 'Rescue Gear Lineups',
      choose: 'Rescue Supply Kits',
      chance: 'Animal Chance Spinners',
      fair: 'Fair Rescue Games',
      orderItems: 'helper gear',
      chooseItems: 'rescue supplies',
      gameWorld: 'rescue games',
    }
  }

  if (preference === 'sports' || themeName.includes('sport')) {
    return {
      emoji: '🏅',
      hubTitle: '🏅 Sports Squad',
      lineup: 'Team Gear Lineups',
      choose: 'Team Gear Kits',
      chance: 'Sports Chance Spinners',
      fair: 'Fair Team Games',
      orderItems: 'team gear',
      chooseItems: 'team gear',
      gameWorld: 'team games',
    }
  }

  if (themeName.includes('surprise') || themeName.includes('studio')) {
    return {
      emoji: '✨',
      hubTitle: '✨ Surprise Studio',
      lineup: 'Studio Lineups',
      choose: 'Studio Choice Kits',
      chance: 'Studio Chance Spinners',
      fair: 'Fair Studio Games',
      orderItems: 'studio choices',
      chooseItems: 'studio picks',
      gameWorld: 'studio games',
    }
  }

  if (preference === 'surprise') {
    const emoji = getLesson1HubEmoji(theme)
    return {
      emoji,
      hubTitle: `${emoji} ${themeLabel}`,
      lineup: `${lookLabel} Lineups`,
      choose: `${themeLabel} Choice Kits`,
      chance: `${themeLabel} Chance Spinners`,
      fair: `Fair ${themeLabel} Games`,
      orderItems: itemLabel,
      chooseItems: chooseLabel,
      gameWorld,
    }
  }

  return {
    emoji: '👑',
    hubTitle: '👑 Royal Academy',
    lineup: 'Royal Arrangements',
    choose: 'Royal Treasure Bags',
    chance: 'Magic Chance Spinners',
    fair: 'Fair Games',
    orderItems: 'royal jewels',
    chooseItems: 'royal treasures',
    gameWorld: 'carnival games',
  }
}

export function getThemedLessonDisplay(
  lesson: LessonDefinition,
  theme: Lesson1ThemePack,
  preference: ThemePreference,
): HubLessonDisplay {
  const emojis = getThemeHubEmojis(theme, preference)
  if (lesson.id === LESSON_1_ID) {
    return { ...getLesson1HubDisplay(theme), emoji: emojis[0] ?? getLesson1HubEmoji(theme) }
  }

  const words = getThemeHubWords(theme, preference)

  if (lesson.id === LESSON_2_ID) {
    return {
      title: words.lineup,
      emoji: emojis[1] ?? words.emoji,
      description: `Arrange ${words.orderItems} and discover factorials`,
    }
  }

  if (lesson.id === LESSON_3_ID) {
    return {
      title: words.choose,
      emoji: emojis[2] ?? words.emoji,
      description: `Choose ${words.chooseItems} when order does not matter`,
    }
  }

  if (lesson.id === LESSON_4_ID) {
    return {
      title: words.chance,
      emoji: emojis[3] ?? words.emoji,
      description: `Count winning spaces to discover chance`,
    }
  }

  if (lesson.id === LESSON_5_ID) {
    return {
      title: words.fair,
      emoji: emojis[4] ?? words.emoji,
      description: `List sample spaces and check fair ${words.gameWorld}`,
    }
  }

  return lesson
}
