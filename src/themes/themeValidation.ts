import type { Lesson1ThemePack, ThemeMotifShape } from './themeTypes'
import { VOICE_CLIPS } from '../voice/voiceClips'

const MAX_TEXT_LENGTH = 220
const MAX_COPY_LENGTH = 360
const MAX_VOICE_SCRIPT_LENGTH = 180
const THEME_MOTIF_SHAPES = ['heart', 'circle', 'square', 'star', 'diamond', 'triangle', 'paw']
const LESSON_4_SPINNER_ICON_KEYS = ['crown', 'ruby', 'gown', 'dragon', 'star', 'sparkle']
const THEME_ITEM_STYLE_KEYS = [
  'gold-tiara',
  'diamond-crown',
  'pink-gown',
  'purple-dress',
  'emerald-gown',
  'glass-slippers',
  'riding-boots',
]
const CHARACTER_BASES = ['human', 'astronaut', 'explorer', 'mascot']
const CHARACTER_HEADS = ['hair', 'helmet', 'cap', 'dinoHood', 'animalEars', 'chefHat', 'sunHat', 'beret']
const CHARACTER_TORSOS = ['dress', 'spaceSuit', 'jacketAndPants', 'jersey', 'apron', 'overalls', 'smock']
const CHARACTER_FEET = ['slippers', 'boots', 'sneakers']
const CHARACTER_STAGES = ['royal', 'space', 'digSite', 'rescue', 'sports', 'studio', 'garden', 'kitchen']
const WARDROBE_ASSET_PACK_IDS = ['royal', 'space', 'digSite', 'rescue', 'sports', 'studio']
const REQUIRED_VISUAL_COLOR_KEYS: Array<keyof NonNullable<Lesson1ThemePack['visual']>> = [
  'screenBackground',
  'panelBackground',
  'borderColor',
  'accentColor',
  'stageBackground',
  'buttonBackground',
  'buttonText',
  'buttonBorder',
  'hintBackground',
  'hintText',
  'successBackground',
  'successText',
  'motifPrimary',
  'motifSecondary',
]
const OPTIONAL_VISUAL_COLOR_KEYS: Array<keyof NonNullable<Lesson1ThemePack['visual']>> = [
  'textColor',
  'mutedTextColor',
  'errorBackground',
  'errorText',
  'errorBorder',
  'statusBackground',
  'statusText',
  'statusBorder',
  'warningBackground',
  'warningText',
  'warningBorder',
  'selectedBackground',
  'selectedText',
  'selectedBorder',
  'selectedRing',
  'disabledBackground',
  'disabledText',
  'disabledBorder',
  'inputBackground',
  'inputText',
  'inputBorder',
  'focusRing',
  'overlayBackground',
  'dialogBackground',
  'diagramBackground',
  'diagramText',
  'diagramConnector',
  'equationAccent',
  'spinnerRim',
  'spinnerPointer',
  'spinnerHubBackground',
  'spinnerHubText',
  'spinnerSeparator',
  'meterTrack',
  'neutralBackground',
  'neutralText',
  'neutralBorder',
]
const BLOCKED_HINT_TERMS = [
  'answer is',
  'equals',
  'solution',
  'total is',
  '6',
  'six',
  '12',
  'twelve',
]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_TEXT_LENGTH
}

function isCopyString(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > MAX_COPY_LENGTH) {
    return false
  }
  if (/\d/.test(value)) return false
  const normalized = value.toLowerCase()
  return !BLOCKED_HINT_TERMS.some((term) => normalized.includes(term))
}

function isSafeHint(value: unknown): value is string {
  if (!isString(value)) return false
  const normalized = value.toLowerCase()
  return !BLOCKED_HINT_TERMS.some((term) => normalized.includes(term))
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}

function chooseString(candidate: unknown, fallback: string, maxLength = MAX_TEXT_LENGTH) {
  return typeof candidate === 'string' && candidate.trim().length > 0 && candidate.length <= maxLength
    ? candidate.trim()
    : fallback
}

function chooseCopy(candidate: unknown, fallback: string) {
  return isCopyString(candidate) ? candidate.trim() : fallback
}

function chooseHex(candidate: unknown, fallback: string) {
  return isHexColor(candidate) ? candidate : fallback
}

function chooseAllowed<T extends string>(candidate: unknown, fallback: T, allowed: readonly T[]): T {
  return allowed.includes(candidate as T) ? candidate as T : fallback
}

function unwrapThemePack(value: unknown): Record<string, unknown> {
  let current = value
  for (let depth = 0; depth < 4; depth += 1) {
    if (!isPlainObject(current)) return {}
    let wrapped: Record<string, unknown> | undefined
    for (const key of ['themePack', 'theme', 'lesson1ThemePack', 'data']) {
      const candidate = current[key]
      if (isPlainObject(candidate)) {
        wrapped = candidate
        break
      }
    }
    if (!wrapped) return current
    current = wrapped
  }
  return isPlainObject(current) ? current : {}
}

function mergeObjects(base: unknown, candidate: unknown): Record<string, unknown> {
  const baseObject = isPlainObject(base) ? base : {}
  if (!isPlainObject(candidate)) return { ...baseObject }
  const merged: Record<string, unknown> = { ...baseObject }
  Object.entries(candidate).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      merged[key] = value
    } else if (isPlainObject(value) && isPlainObject(baseObject[key])) {
      merged[key] = mergeObjects(baseObject[key], value)
    } else if (value !== undefined) {
      merged[key] = value
    }
  })
  return merged
}

const COPY_KEYS: Array<keyof NonNullable<Lesson1ThemePack['copy']>> = [
  'screen1Heading',
  'screen2Title',
  'screen2Button',
  'screen3Heading',
  'screen4Heading',
  'lookNamePlural',
  'variationNamePlural',
  'logHeading',
  'logEmpty',
  'logCounter',
  'anchorIntro',
  'anchorLockFirst',
  'anchorFirstBranch',
  'anchorSecondBranch',
  'anchorTotal',
  'shortcutTitle',
  'shortcutIntro',
  'shortcutCountChoices',
  'shortcutFirstCategory',
  'shortcutSecondCategory',
  'shortcutThirdCategory',
  'shortcutTotal',
  'practicePrompt',
  'practiceCorrect',
  'practiceIncorrect',
  'practiceSolution',
  'completeBody',
]

function isVoiceScriptString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_VOICE_SCRIPT_LENGTH
}

function isValidVoiceScriptMap(value: unknown): boolean {
  if (value === undefined) return true
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  return Object.entries(value).every(([clipKey, script]) => {
    const baseClip = VOICE_CLIPS[clipKey as keyof typeof VOICE_CLIPS]
    if (!baseClip || !script || typeof script !== 'object' || Array.isArray(script)) return false

    const candidate = script as Record<string, unknown>
    if (!isVoiceScriptString(candidate.text)) return false
    if (candidate.caption !== undefined && !isVoiceScriptString(candidate.caption)) return false

    return true
  })
}

function isValidEmojiString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 12 && !/[<>{}[\]]/.test(value)
}

function normalizeCharacterConfig(
  candidate: unknown,
  fallback: NonNullable<NonNullable<Lesson1ThemePack['visual']>['characterConfig']>,
) {
  const source = isPlainObject(candidate) ? candidate : {}
  return {
    base: chooseAllowed(source.base, fallback.base, CHARACTER_BASES),
    head: chooseAllowed(source.head, fallback.head, CHARACTER_HEADS),
    torso: chooseAllowed(source.torso, fallback.torso, CHARACTER_TORSOS),
    feet: chooseAllowed(source.feet, fallback.feet, CHARACTER_FEET),
    stage: chooseAllowed(source.stage, fallback.stage, CHARACTER_STAGES),
    ...(source.assetPack === undefined && fallback.assetPack === undefined
      ? {}
      : { assetPack: chooseAllowed(source.assetPack, fallback.assetPack ?? 'royal', WARDROBE_ASSET_PACK_IDS) }),
  }
}

function normalizeVisual(
  candidate: unknown,
  fallback: NonNullable<Lesson1ThemePack['visual']>,
): NonNullable<Lesson1ThemePack['visual']> {
  const source = isPlainObject(candidate) ? candidate : {}
  const visual: Record<string, unknown> = {
    character: chooseAllowed(source.character, fallback.character, ['princess', 'astronaut']),
    ...(fallback.characterConfig
      ? { characterConfig: normalizeCharacterConfig(source.characterConfig, fallback.characterConfig) }
      : {}),
    ...(source.assetPack === undefined && fallback.assetPack === undefined
      ? {}
      : { assetPack: chooseAllowed(source.assetPack, fallback.assetPack ?? 'royal', WARDROBE_ASSET_PACK_IDS) }),
    motifShape: chooseAllowed(source.motifShape, fallback.motifShape, THEME_MOTIF_SHAPES),
  }

  REQUIRED_VISUAL_COLOR_KEYS.forEach((key) => {
    visual[key] = chooseHex(source[key], fallback[key] as string)
  })
  OPTIONAL_VISUAL_COLOR_KEYS.forEach((key) => {
    if (source[key] !== undefined || fallback[key] !== undefined) {
      visual[key] = chooseHex(source[key], fallback[key] as string)
    }
  })

  return visual as unknown as NonNullable<Lesson1ThemePack['visual']>
}

function normalizeCopy(
  candidate: unknown,
  fallback: NonNullable<Lesson1ThemePack['copy']>,
): NonNullable<Lesson1ThemePack['copy']> {
  const source = isPlainObject(candidate) ? candidate : {}
  return COPY_KEYS.reduce((copy, key) => ({
    ...copy,
    [key]: chooseCopy(source[key], fallback[key]),
  }), {} as NonNullable<Lesson1ThemePack['copy']>)
}

function normalizeCategories(candidate: unknown, fallback: Lesson1ThemePack['categories']): Lesson1ThemePack['categories'] {
  const source = Array.isArray(candidate) ? candidate : []
  const required = [
    { key: 'crowns', count: 2 },
    { key: 'dresses', count: 3 },
    { key: 'shoes', count: 2 },
  ] as const

  return required.map(({ key, count }, index) => {
    const fallbackCategory = fallback[index]
    const generatedCategory = source.find((category) => isPlainObject(category) && category.key === key)
    const sourceCategory = isPlainObject(generatedCategory) ? generatedCategory : isPlainObject(source[index]) ? source[index] : {}
    const generatedItems = Array.isArray(sourceCategory.items) ? sourceCategory.items : []
    return {
      key,
      label: chooseString(sourceCategory.label, fallbackCategory.label),
      items: Array.from({ length: count }, (_, itemIndex) => (
        chooseString(generatedItems[itemIndex], fallbackCategory.items[itemIndex])
      )),
    }
  }) as Lesson1ThemePack['categories']
}

function normalizeFeedback(candidate: unknown, fallback: Lesson1ThemePack['feedback']): Lesson1ThemePack['feedback'] {
  const source = isPlainObject(candidate) ? candidate : {}
  return {
    correct: chooseString(source.correct, fallback.correct),
    tryAgain: chooseString(source.tryAgain, fallback.tryAgain),
    hint: isSafeHint(source.hint) ? source.hint.trim() : fallback.hint,
  }
}

function normalizeItemStyles(candidate: unknown, fallback: Lesson1ThemePack['itemStyles']) {
  if (!isPlainObject(fallback)) return undefined
  const source = isPlainObject(candidate) ? candidate : {}
  const styles: NonNullable<Lesson1ThemePack['itemStyles']> = {}

  THEME_ITEM_STYLE_KEYS.forEach((itemId) => {
    const fallbackStyle = fallback[itemId]
    if (!isPlainObject(fallbackStyle)) return
    const generatedStyle = isPlainObject(source[itemId]) ? source[itemId] : {}
    const fallbackMotifShape = THEME_MOTIF_SHAPES.includes(fallbackStyle.motifShape as ThemeMotifShape)
      ? fallbackStyle.motifShape as ThemeMotifShape
      : 'heart'
    const motifShape = chooseAllowed(generatedStyle.motifShape, fallbackMotifShape, THEME_MOTIF_SHAPES) as ThemeMotifShape
    const icon = isValidEmojiString(generatedStyle.icon) ? generatedStyle.icon : fallbackStyle.icon
    styles[itemId] = {
      background: chooseHex(generatedStyle.background, fallbackStyle.background as string),
      text: chooseHex(generatedStyle.text, fallbackStyle.text as string),
      border: chooseHex(generatedStyle.border, fallbackStyle.border as string),
      ...(generatedStyle.heartColor !== undefined || fallbackStyle.heartColor !== undefined
        ? { heartColor: chooseHex(generatedStyle.heartColor, fallbackStyle.heartColor as string) }
        : {}),
      ...(generatedStyle.motifShape !== undefined || fallbackStyle.motifShape !== undefined
        ? { motifShape }
        : {}),
      ...(isValidEmojiString(icon)
        ? { icon }
        : {}),
    }
  })

  return Object.keys(styles).length > 0 ? styles : undefined
}

function normalizeLesson4(candidate: unknown, fallback: Lesson1ThemePack['lesson4']) {
  const source = isPlainObject(candidate) && isPlainObject(candidate.spinnerIcons) ? candidate.spinnerIcons : {}
  const fallbackIcons = isPlainObject(fallback?.spinnerIcons) ? fallback.spinnerIcons : {}
  const fallbackIconMap = fallbackIcons as Record<string, unknown>
  const spinnerIcons = LESSON_4_SPINNER_ICON_KEYS.reduce<Record<string, string>>((icons, key) => {
    const icon = isValidEmojiString(source[key]) ? source[key] : fallbackIconMap[key]
    if (isValidEmojiString(icon)) icons[key] = icon
    return icons
  }, {})

  return Object.keys(spinnerIcons).length > 0 ? { spinnerIcons } : undefined
}

export function normalizeLesson1ThemePack(value: unknown, fallback: Lesson1ThemePack): Lesson1ThemePack {
  const rawThemePack = unwrapThemePack(value)
  const merged = mergeObjects(fallback, rawThemePack)
  const visual = fallback.visual ? normalizeVisual(merged.visual, fallback.visual) : undefined
  const copy = fallback.copy ? normalizeCopy(merged.copy, fallback.copy) : undefined
  const itemStyles = normalizeItemStyles(merged.itemStyles, fallback.itemStyles)
  const lesson4 = normalizeLesson4(merged.lesson4, fallback.lesson4)

  return {
    themeName: chooseString(merged.themeName, fallback.themeName),
    learnerRole: chooseString(merged.learnerRole, fallback.learnerRole),
    intro: chooseString(merged.intro, fallback.intro),
    ...(visual ? { visual } : {}),
    ...(copy ? { copy } : {}),
    categories: normalizeCategories(merged.categories, fallback.categories),
    feedback: normalizeFeedback(merged.feedback, fallback.feedback),
    ...(itemStyles ? { itemStyles } : {}),
    ...(lesson4 ? { lesson4 } : {}),
    ...(fallback.voice ? { voice: fallback.voice } : {}),
  }
}

function isValidLesson4Overrides(value: unknown): boolean {
  if (value === undefined) return true
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const overrides = value as { spinnerIcons?: unknown }
  if (overrides.spinnerIcons === undefined) return true
  if (!overrides.spinnerIcons || typeof overrides.spinnerIcons !== 'object' || Array.isArray(overrides.spinnerIcons)) {
    return false
  }

  return Object.entries(overrides.spinnerIcons).every(([key, icon]) => (
    LESSON_4_SPINNER_ICON_KEYS.includes(key) && isValidEmojiString(icon)
  ))
}

function addVisualIssues(value: unknown, issues: string[]) {
  if (value === undefined) return
  if (!value || typeof value !== 'object') {
    issues.push('visual must be an object when provided')
    return
  }

  const visual = value as Partial<NonNullable<Lesson1ThemePack['visual']>>
  if (visual.character !== 'princess' && visual.character !== 'astronaut') {
    issues.push('visual.character must be princess or astronaut')
  }

  const characterConfig = visual.characterConfig as unknown as Record<string, unknown> | undefined
  if (characterConfig !== undefined) {
    if (!CHARACTER_BASES.includes(String(characterConfig.base))) issues.push('visual.characterConfig.base is invalid')
    if (!CHARACTER_HEADS.includes(String(characterConfig.head))) issues.push('visual.characterConfig.head is invalid')
    if (!CHARACTER_TORSOS.includes(String(characterConfig.torso))) issues.push('visual.characterConfig.torso is invalid')
    if (!CHARACTER_FEET.includes(String(characterConfig.feet))) issues.push('visual.characterConfig.feet is invalid')
    if (!CHARACTER_STAGES.includes(String(characterConfig.stage))) issues.push('visual.characterConfig.stage is invalid')
    if (characterConfig.assetPack !== undefined && !WARDROBE_ASSET_PACK_IDS.includes(String(characterConfig.assetPack))) {
      issues.push('visual.characterConfig.assetPack is invalid')
    }
  }

  if (visual.assetPack !== undefined && !WARDROBE_ASSET_PACK_IDS.includes(String(visual.assetPack))) {
    issues.push('visual.assetPack is invalid')
  }

  REQUIRED_VISUAL_COLOR_KEYS.forEach((key) => {
    if (!isHexColor(visual[key])) issues.push(`visual.${key} must be a #rrggbb color`)
  })

  if (!THEME_MOTIF_SHAPES.includes(String(visual.motifShape))) {
    issues.push('visual.motifShape is invalid')
  }
}

function addCopyIssues(value: unknown, issues: string[]) {
  if (value === undefined) return
  if (!value || typeof value !== 'object') {
    issues.push('copy must be an object when provided')
    return
  }
  const copy = value as Partial<NonNullable<Lesson1ThemePack['copy']>>
  COPY_KEYS.forEach((key) => {
    if (!isCopyString(copy[key])) issues.push(`copy.${key} is missing, too long, or answer-revealing`)
  })
}

function addItemStyleIssues(value: unknown, issues: string[]) {
  if (value === undefined) return
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    issues.push('itemStyles must be an object when provided')
    return
  }

  Object.entries(value).forEach(([itemId, style]) => {
    if (!THEME_ITEM_STYLE_KEYS.includes(itemId)) issues.push(`itemStyles.${itemId} is not a known item id`)
    if (!style || typeof style !== 'object' || Array.isArray(style)) {
      issues.push(`itemStyles.${itemId} must be an object`)
      return
    }
    const itemStyle = style as Record<string, unknown>
    if (!isHexColor(itemStyle.background)) issues.push(`itemStyles.${itemId}.background must be a #rrggbb color`)
    if (!isHexColor(itemStyle.text)) issues.push(`itemStyles.${itemId}.text must be a #rrggbb color`)
    if (!isHexColor(itemStyle.border)) issues.push(`itemStyles.${itemId}.border must be a #rrggbb color`)
    if (itemStyle.heartColor !== undefined && !isHexColor(itemStyle.heartColor)) {
      issues.push(`itemStyles.${itemId}.heartColor must be a #rrggbb color`)
    }
    if (itemStyle.motifShape !== undefined && !THEME_MOTIF_SHAPES.includes(String(itemStyle.motifShape))) {
      issues.push(`itemStyles.${itemId}.motifShape is invalid`)
    }
    if (itemStyle.icon !== undefined && !isValidEmojiString(itemStyle.icon)) {
      issues.push(`itemStyles.${itemId}.icon is invalid`)
    }
  })
}

export function getLesson1ThemeValidationIssues(value: unknown): string[] {
  const issues: string[] = []
  if (!value || typeof value !== 'object') return ['theme pack must be an object']

  const theme = value as Partial<Lesson1ThemePack>
  if (!isString(theme.themeName)) issues.push('themeName is missing or too long')
  if (!isString(theme.learnerRole)) issues.push('learnerRole is missing or too long')
  if (!isString(theme.intro)) issues.push('intro is missing or too long')

  addVisualIssues(theme.visual, issues)
  addCopyIssues(theme.copy, issues)
  addItemStyleIssues(theme.itemStyles, issues)
  if (!isValidLesson4Overrides(theme.lesson4)) issues.push('lesson4.spinnerIcons is invalid')
  if (!isValidVoiceScriptMap(theme.voice)) issues.push('voice map is invalid')

  if (!Array.isArray(theme.categories) || theme.categories.length !== 3) {
    issues.push('categories must have exactly crowns, dresses, and shoes')
  } else {
    const [first, second, third] = theme.categories
    if (first?.key !== 'crowns') issues.push('categories[0].key must be crowns')
    if (second?.key !== 'dresses') issues.push('categories[1].key must be dresses')
    if (third?.key !== 'shoes') issues.push('categories[2].key must be shoes')
    if (!isString(first?.label)) issues.push('categories[0].label is invalid')
    if (!isString(second?.label)) issues.push('categories[1].label is invalid')
    if (!isString(third?.label)) issues.push('categories[2].label is invalid')
    if (first?.items?.length !== 2) issues.push('categories[0].items must contain 2 items')
    if (second?.items?.length !== 3) issues.push('categories[1].items must contain 3 items')
    if (third?.items?.length !== 2) issues.push('categories[2].items must contain 2 items')
    if (![...(first?.items ?? []), ...(second?.items ?? []), ...(third?.items ?? [])].every(isString)) {
      issues.push('all category items must be non-empty short strings')
    }
  }

  const feedback = theme.feedback
  if (!feedback) {
    issues.push('feedback is missing')
  } else {
    if (!isString(feedback.correct)) issues.push('feedback.correct is invalid')
    if (!isString(feedback.tryAgain)) issues.push('feedback.tryAgain is invalid')
    if (!isSafeHint(feedback.hint)) issues.push('feedback.hint is missing, too long, or answer-revealing')
  }

  return issues
}

export function isValidLesson1ThemePack(value: unknown): value is Lesson1ThemePack {
  return getLesson1ThemeValidationIssues(value).length === 0
}

export function assertValidLesson1ThemePack(theme: Lesson1ThemePack): Lesson1ThemePack {
  if (!isValidLesson1ThemePack(theme)) {
    throw new Error('Invalid Lesson 1 theme pack')
  }
  return theme
}
