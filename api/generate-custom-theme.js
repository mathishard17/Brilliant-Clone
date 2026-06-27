import { getOpenAiApiKey, readJsonBody, requestOpenAiJson, requirePost } from './_openai.js'

const THEME_PREFERENCES = ['royal', 'space', 'dinosaurs', 'animals', 'sports', 'surprise']
const IS_DEV = process.env.NODE_ENV !== 'production'
const MAX_TEXT_LENGTH = 220
const MAX_COPY_LENGTH = 360
const THEME_MOTIF_SHAPES = ['heart', 'circle', 'square', 'star', 'diamond', 'triangle', 'paw']
const CHARACTER_BASES = ['human', 'astronaut', 'explorer', 'mascot']
const CHARACTER_HEADS = ['hair', 'helmet', 'cap', 'dinoHood', 'animalEars', 'chefHat', 'sunHat', 'beret']
const CHARACTER_TORSOS = ['dress', 'spaceSuit', 'jacketAndPants', 'jersey', 'apron', 'overalls', 'smock']
const CHARACTER_FEET = ['slippers', 'boots', 'sneakers']
const CHARACTER_STAGES = ['royal', 'space', 'digSite', 'rescue', 'sports', 'studio', 'garden', 'kitchen']
const WARDROBE_ASSET_PACK_IDS = ['royal', 'space', 'digSite', 'rescue', 'sports', 'studio']
const LESSON_4_SPINNER_ICON_KEYS = ['crown', 'ruby', 'gown', 'dragon', 'star', 'sparkle']
const BLOCKED_HINT_TERMS = ['answer is', 'equals', 'solution', 'total is', '6', 'six', '12', 'twelve']
const COPY_KEYS = [
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
const REQUIRED_VISUAL_COLORS = [
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
const OPTIONAL_VISUAL_COLORS = [
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
const THEME_ITEM_STYLE_KEYS = [
  'gold-tiara',
  'diamond-crown',
  'pink-gown',
  'purple-dress',
  'emerald-gown',
  'glass-slippers',
  'riding-boots',
]
const SERVER_BASE_THEME_PACK = {
  themeName: 'Creative Closet',
  learnerRole: 'look designer',
  intro:
    'Welcome to the creative closet! Try different toppers, outfits, and shoes to discover unique looks.',
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
    screen1Heading: 'Design New Looks!',
    screen2Title: 'The Anchor Trick',
    screen2Button: 'Try the closet challenge',
    screen3Heading: 'Complete the look',
    screen4Heading: 'Designer confirmed',
    lookNamePlural: 'looks',
    variationNamePlural: 'total variations',
    logHeading: 'Unique looks found',
    logEmpty: 'Try tapping items in the closet.',
    logCounter: 'Total unique found',
    anchorIntro:
      'When choices feel hard to track, start fresh and use the Anchor Trick.',
    anchorLockFirst:
      'First, place one topper on the designer and keep it there.',
    anchorFirstBranch:
      'Next, keep that topper locked and try each outfit one by one.',
    anchorSecondBranch:
      'Then switch to the next topper and repeat the outfit check.',
    anchorTotal:
      'Each locked topper made its own group of looks. Now combine the groups.',
    shortcutTitle: 'The counting shortcut',
    shortcutIntro:
      'Instead of building every look, count the choices in each category and multiply those counts together.',
    shortcutCountChoices:
      'Count how many choices you have in each category, then multiply them.',
    shortcutFirstCategory: 'How many topper choices are there?',
    shortcutSecondCategory: 'How many outfit choices are there?',
    shortcutThirdCategory: 'How many shoe choices are there?',
    shortcutTotal: 'That gives the total number of unique looks.',
    practicePrompt:
      'Now try the shortcut with a fresh set of choices.',
    practiceCorrect:
      'Great work! The shortcut counted every possible look.',
    practiceIncorrect:
      'Not quite. Remember to multiply the choices in each category.',
    practiceSolution:
      'Use the counts from each category and multiply them in order.',
    completeBody:
      'Multiplying your options is a powerful shortcut for counting choices.',
  },
  categories: [
    { key: 'crowns', label: 'Toppers', items: ['Spark Topper', 'Glow Topper'] },
    { key: 'dresses', label: 'Outfits', items: ['Rainbow Outfit', 'Cloud Outfit', 'Comet Outfit'] },
    { key: 'shoes', label: 'Shoes', items: ['Bounce Shoes', 'Glide Shoes'] },
  ],
  feedback: {
    correct: 'Nice thinking! You counted every look.',
    tryAgain: 'Try another count, designer.',
    hint: 'Pick one topper first, then count what can go with it.',
  },
}

function fallbackResponse(debugError) {
  return {
    themePack: null,
    source: 'fallback',
    ...(IS_DEV && debugError ? { debugError } : {}),
  }
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}

function isText(value, maxLength = MAX_TEXT_LENGTH) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

function isCopyText(value) {
  if (!isText(value, MAX_COPY_LENGTH)) return false
  if (/\d/.test(value)) return false
  const normalized = value.toLowerCase()
  return !BLOCKED_HINT_TERMS.some((term) => normalized.includes(term))
}

function isSafeHint(value) {
  if (!isText(value)) return false
  const normalized = value.toLowerCase()
  return !BLOCKED_HINT_TERMS.some((term) => normalized.includes(term))
}

function isEmoji(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 12 && !/[<>{}[\]]/.test(value)
}

function chooseString(candidate, fallback, maxLength = MAX_TEXT_LENGTH) {
  return isText(candidate, maxLength) ? candidate.trim() : fallback
}

function chooseCopy(candidate, fallback) {
  return isCopyText(candidate) ? candidate.trim() : fallback
}

function chooseHex(candidate, fallback) {
  return isHexColor(candidate) ? candidate : fallback
}

function chooseAllowed(candidate, fallback, allowed) {
  return allowed.includes(candidate) ? candidate : fallback
}

function unwrapThemePack(value) {
  if (!isPlainObject(value)) return {}
  for (const key of ['themePack', 'theme', 'lesson1ThemePack', 'data']) {
    if (isPlainObject(value[key])) return value[key]
  }
  return value
}

function mergeObjects(base, candidate) {
  if (!isPlainObject(candidate)) return { ...base }
  const merged = { ...base }
  for (const [key, value] of Object.entries(candidate)) {
    if (Array.isArray(value)) {
      merged[key] = value
    } else if (isPlainObject(value) && isPlainObject(base[key])) {
      merged[key] = mergeObjects(base[key], value)
    } else if (value !== undefined) {
      merged[key] = value
    }
  }
  return merged
}

function normalizeCharacterConfig(candidate, fallback) {
  const source = isPlainObject(candidate) ? candidate : {}
  return {
    base: chooseAllowed(source.base, fallback.base, CHARACTER_BASES),
    head: chooseAllowed(source.head, fallback.head, CHARACTER_HEADS),
    torso: chooseAllowed(source.torso, fallback.torso, CHARACTER_TORSOS),
    feet: chooseAllowed(source.feet, fallback.feet, CHARACTER_FEET),
    stage: chooseAllowed(source.stage, fallback.stage, CHARACTER_STAGES),
    ...(source.assetPack === undefined && fallback.assetPack === undefined
      ? {}
      : { assetPack: chooseAllowed(source.assetPack, fallback.assetPack, WARDROBE_ASSET_PACK_IDS) }),
  }
}

function normalizeVisual(candidate, fallback) {
  const source = isPlainObject(candidate) ? candidate : {}
  const visual = {
    character: chooseAllowed(source.character, fallback.character, ['princess', 'astronaut']),
    characterConfig: normalizeCharacterConfig(source.characterConfig, fallback.characterConfig),
    ...(source.assetPack === undefined && fallback.assetPack === undefined
      ? {}
      : { assetPack: chooseAllowed(source.assetPack, fallback.assetPack, WARDROBE_ASSET_PACK_IDS) }),
    motifShape: chooseAllowed(source.motifShape, fallback.motifShape, THEME_MOTIF_SHAPES),
  }

  for (const key of REQUIRED_VISUAL_COLORS) {
    visual[key] = chooseHex(source[key], fallback[key])
  }
  for (const key of OPTIONAL_VISUAL_COLORS) {
    if (source[key] !== undefined || fallback[key] !== undefined) {
      visual[key] = chooseHex(source[key], fallback[key])
    }
  }

  return visual
}

function normalizeCopy(candidate, fallback) {
  const source = isPlainObject(candidate) ? candidate : {}
  return COPY_KEYS.reduce((copy, key) => ({
    ...copy,
    [key]: chooseCopy(source[key], fallback[key]),
  }), {})
}

function normalizeCategories(candidate, fallback) {
  const source = Array.isArray(candidate) ? candidate : []
  const required = [
    { key: 'crowns', count: 2 },
    { key: 'dresses', count: 3 },
    { key: 'shoes', count: 2 },
  ]

  return required.map(({ key, count }, index) => {
    const fallbackCategory = fallback[index]
    const generatedCategory = source.find((category) => category?.key === key) ?? source[index] ?? {}
    const generatedItems = Array.isArray(generatedCategory.items) ? generatedCategory.items : []
    const fallbackItems = fallbackCategory.items
    return {
      key,
      label: chooseString(generatedCategory.label, fallbackCategory.label),
      items: Array.from({ length: count }, (_, itemIndex) => (
        chooseString(generatedItems[itemIndex], fallbackItems[itemIndex])
      )),
    }
  })
}

function normalizeFeedback(candidate, fallback) {
  const source = isPlainObject(candidate) ? candidate : {}
  return {
    correct: chooseString(source.correct, fallback.correct),
    tryAgain: chooseString(source.tryAgain, fallback.tryAgain),
    hint: isSafeHint(source.hint) ? source.hint.trim() : fallback.hint,
  }
}

function normalizeItemStyles(candidate, fallback) {
  if (!isPlainObject(fallback)) return undefined
  const source = isPlainObject(candidate) ? candidate : {}
  return Object.entries(fallback).reduce((styles, [itemId, fallbackStyle]) => {
    if (!THEME_ITEM_STYLE_KEYS.includes(itemId) || !isPlainObject(fallbackStyle)) return styles
    const generatedStyle = isPlainObject(source[itemId]) ? source[itemId] : {}
    styles[itemId] = {
      background: chooseHex(generatedStyle.background, fallbackStyle.background),
      text: chooseHex(generatedStyle.text, fallbackStyle.text),
      border: chooseHex(generatedStyle.border, fallbackStyle.border),
      ...(generatedStyle.heartColor !== undefined || fallbackStyle.heartColor !== undefined
        ? { heartColor: chooseHex(generatedStyle.heartColor, fallbackStyle.heartColor) }
        : {}),
      ...(generatedStyle.motifShape !== undefined || fallbackStyle.motifShape !== undefined
        ? { motifShape: chooseAllowed(generatedStyle.motifShape, fallbackStyle.motifShape, THEME_MOTIF_SHAPES) }
        : {}),
      ...(generatedStyle.icon !== undefined || fallbackStyle.icon !== undefined
        ? { icon: isEmoji(generatedStyle.icon) ? generatedStyle.icon : fallbackStyle.icon }
        : {}),
    }
    return styles
  }, {})
}

function normalizeLesson4(candidate, fallback) {
  const sourceIcons = isPlainObject(candidate?.spinnerIcons) ? candidate.spinnerIcons : {}
  const fallbackIcons = isPlainObject(fallback?.spinnerIcons) ? fallback.spinnerIcons : {}
  const spinnerIcons = LESSON_4_SPINNER_ICON_KEYS.reduce((icons, key) => {
    const icon = isEmoji(sourceIcons[key]) ? sourceIcons[key] : fallbackIcons[key]
    if (isEmoji(icon)) icons[key] = icon
    return icons
  }, {})
  return Object.keys(spinnerIcons).length > 0 ? { spinnerIcons } : undefined
}

function normalizeThemePack(rawThemePack, baseThemePack) {
  if (!isPlainObject(baseThemePack)) return undefined
  const generatedThemePack = unwrapThemePack(rawThemePack)
  const merged = mergeObjects(baseThemePack, generatedThemePack)
  const lesson4 = normalizeLesson4(merged.lesson4, baseThemePack.lesson4)
  return {
    themeName: chooseString(merged.themeName, baseThemePack.themeName),
    learnerRole: chooseString(merged.learnerRole, baseThemePack.learnerRole),
    intro: chooseString(merged.intro, baseThemePack.intro),
    visual: normalizeVisual(merged.visual, baseThemePack.visual),
    copy: normalizeCopy(merged.copy, baseThemePack.copy),
    categories: normalizeCategories(merged.categories, baseThemePack.categories),
    feedback: normalizeFeedback(merged.feedback, baseThemePack.feedback),
    ...(baseThemePack.itemStyles || merged.itemStyles
      ? { itemStyles: normalizeItemStyles(merged.itemStyles, baseThemePack.itemStyles) }
      : {}),
    ...(lesson4 ? { lesson4 } : {}),
    ...(baseThemePack.voice ? { voice: baseThemePack.voice } : {}),
  }
}

function resolveBaseThemePack(candidate) {
  if (!isPlainObject(candidate)) return SERVER_BASE_THEME_PACK
  return normalizeThemePack(candidate, SERVER_BASE_THEME_PACK) ?? SERVER_BASE_THEME_PACK
}

function getServerThemeValidationIssues(value) {
  const issues = []
  if (!isPlainObject(value)) return ['theme pack must be an object']

  if (!isText(value.themeName)) issues.push('themeName is missing or too long')
  if (!isText(value.learnerRole)) issues.push('learnerRole is missing or too long')
  if (!isText(value.intro)) issues.push('intro is missing or too long')

  const visual = value.visual
  if (visual !== undefined) {
    if (!isPlainObject(visual)) {
      issues.push('visual must be an object when provided')
    } else {
      if (!['princess', 'astronaut'].includes(visual.character)) {
        issues.push('visual.character must be princess or astronaut')
      }
      for (const key of REQUIRED_VISUAL_COLORS) {
        if (!isHexColor(visual[key])) issues.push(`visual.${key} must be a #rrggbb color`)
      }
      if (!THEME_MOTIF_SHAPES.includes(visual.motifShape)) issues.push('visual.motifShape is invalid')
    }
  }

  const copy = value.copy
  if (copy !== undefined) {
    if (!isPlainObject(copy)) {
      issues.push('copy must be an object when provided')
    } else {
      for (const key of COPY_KEYS) {
        if (!isCopyText(copy[key])) issues.push(`copy.${key} is missing, too long, or answer-revealing`)
      }
    }
  }

  if (!Array.isArray(value.categories) || value.categories.length !== 3) {
    issues.push('categories must have exactly crowns, dresses, and shoes')
  } else {
    const required = [
      { key: 'crowns', count: 2 },
      { key: 'dresses', count: 3 },
      { key: 'shoes', count: 2 },
    ]
    value.categories.forEach((category, index) => {
      const expected = required[index]
      if (category?.key !== expected.key) issues.push(`categories[${index}].key must be ${expected.key}`)
      if (!isText(category?.label)) issues.push(`categories[${index}].label is invalid`)
      if (!Array.isArray(category?.items) || category.items.length !== expected.count) {
        issues.push(`categories[${index}].items must contain ${expected.count} items`)
      } else if (!category.items.every((item) => isText(item))) {
        issues.push('all category items must be non-empty short strings')
      }
    })
  }

  const feedback = value.feedback
  if (!isPlainObject(feedback)) {
    issues.push('feedback is missing')
  } else {
    if (!isText(feedback.correct)) issues.push('feedback.correct is invalid')
    if (!isText(feedback.tryAgain)) issues.push('feedback.tryAgain is invalid')
    if (!isSafeHint(feedback.hint)) issues.push('feedback.hint is missing, too long, or answer-revealing')
  }

  const lesson4 = value.lesson4
  if (lesson4 !== undefined) {
    if (!isPlainObject(lesson4) || (lesson4.spinnerIcons !== undefined && !isPlainObject(lesson4.spinnerIcons))) {
      issues.push('lesson4.spinnerIcons is invalid')
    } else if (lesson4.spinnerIcons !== undefined) {
      for (const [key, icon] of Object.entries(lesson4.spinnerIcons)) {
        if (!LESSON_4_SPINNER_ICON_KEYS.includes(key) || !isEmoji(icon)) {
          issues.push('lesson4.spinnerIcons is invalid')
          break
        }
      }
    }
  }

  return issues
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  const body = readJsonBody(request)
  const apiKey = getOpenAiApiKey()
  if (!apiKey) {
    response.status(200).json(fallbackResponse('OPENAI_API_KEY is missing in the API environment.'))
    return
  }

  const preference = THEME_PREFERENCES.includes(body.preference) ? body.preference : 'surprise'
  const themeIdea = typeof body.themeIdea === 'string' ? body.themeIdea.trim().slice(0, 80) : ''
  const baseThemePack = resolveBaseThemePack(body.baseThemePack)

  try {
    const rawThemePack = await requestOpenAiJson({
      apiKey,
      model: process.env.OPENAI_THEME_MODEL || 'gpt-4.1-mini',
      system:
        'You rewrite a valid theme JSON object for a 3rd-grade math app. Return only the theme object itself as valid JSON. Do not wrap it in themePack, theme, data, or any other parent key. Do not return markdown.',
      user: JSON.stringify({
        task:
          'Return a complete Lesson1ThemePack JSON object. The top-level object must directly contain themeName, learnerRole, intro, visual, copy, categories, feedback, itemStyles, lesson4, and voice when present in baseThemePack. Start from baseThemePack and change labels, copy, icons, and colors to match the requested theme. Preserve the exact object shape and required keys. categories must stay in this order: crowns with 2 items, dresses with 3 items, shoes with 2 items. visual.character must be princess or astronaut. Every visual color must be #rrggbb. Do not use digits or answer-revealing terms in copy/feedback hint fields. Do not add assetKey fields.',
        preference,
        themeIdea,
        baseThemePack,
      }),
    })
    const themePack = normalizeThemePack(rawThemePack, baseThemePack)

    if (!themePack || typeof themePack !== 'object') {
      response.status(200).json(fallbackResponse('OpenAI returned no parseable theme JSON object.'))
      return
    }
    const validationIssues = getServerThemeValidationIssues(themePack)
    if (validationIssues.length > 0) {
      response.status(200).json(
        fallbackResponse(`Normalized theme failed server validation: ${validationIssues.join('; ')}`),
      )
      return
    }

    response.status(200).json({
      themePack,
      source: 'generated',
    })
  } catch (error) {
    response.status(200).json(
      fallbackResponse(error instanceof Error ? error.message : 'Unknown theme generation API error.'),
    )
  }
}
