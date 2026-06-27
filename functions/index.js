const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { logger } = require('firebase-functions')
const admin = require('firebase-admin')
const fs = require('node:fs')
const path = require('node:path')

admin.initializeApp()

function loadRootEnvForEmulator() {
  if (process.env.FUNCTIONS_EMULATOR !== 'true') return
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex <= 0) return
    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!process.env[key]) process.env[key] = value
  })
}

loadRootEnvForEmulator()

const CARTESIA_BYTES_URL = 'https://api.cartesia.ai/tts/bytes'
const CARTESIA_VERSION = process.env.CARTESIA_VERSION || '2024-11-13'
const CARTESIA_MODEL_ID = process.env.CARTESIA_MODEL_ID || 'sonic-3'
const DEFAULT_CARTESIA_VOICE_ID =
  process.env.CARTESIA_DEFAULT_VOICE_ID || 'e07c00bc-4134-4eae-9ea4-1a55fb45746b'
const SIGNED_URL_TTL_MS = 60 * 60 * 1000

const THEME_PREFERENCES = ['royal', 'space', 'dinosaurs', 'animals', 'sports', 'surprise']
const OPENAI_THEME_MODEL = process.env.OPENAI_THEME_MODEL || 'gpt-4.1-mini'
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'
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
const NUMBER_WORD_PATTERN =
  /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|forty)\b/i
const DIGIT_OR_EQUATION_PATTERN = /[\d=×*/+]/
const EARLY_REVEAL_PATTERN = /\b(answer|solution|equals|out of|total is|there are)\b/i
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

const FALLBACK_THEME_PACK = {
  themeName: 'Surprise Studio',
  learnerRole: 'look inventor',
  intro: 'Welcome to Surprise Studio! Tap toppers, outfits, and shoes to invent playful looks.',
  visual: {
    character: 'princess',
    characterConfig: {
      base: 'mascot',
      head: 'beret',
      torso: 'smock',
      feet: 'sneakers',
      stage: 'studio',
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
    screen1Heading: 'Invent New Looks!',
    screen2Title: 'The Anchor Trick in the Studio',
    screen2Button: 'Try the Studio Challenge!',
    screen3Heading: 'Complete the Studio Look!',
    screen4Heading: 'Look Inventor Confirmed!',
    lookNamePlural: 'studio looks',
    variationNamePlural: 'studio variations',
    logHeading: 'Unique Studio Looks Found:',
    logEmpty: 'Try tapping options in the studio closet!',
    logCounter: 'Total Unique Found',
    anchorIntro: 'When you were inventing studio looks, did you lose track of your choices? Try the Anchor Trick.',
    anchorLockFirst: 'First, lock one topper in place so it stays the same.',
    anchorFirstBranch: 'Next, keep that topper locked and try every outfit with it.',
    anchorSecondBranch: 'Then switch to the other topper and do the same outfit check.',
    anchorTotal: 'Each locked topper made its own group of looks. Put the groups together.',
    shortcutTitle: 'The Studio Shortcut',
    shortcutIntro: 'Instead of trying every studio look, count choices in each category and multiply the groups.',
    shortcutCountChoices: 'Count the choices in each category, then multiply them.',
    shortcutFirstCategory: 'How many topper choices are there?',
    shortcutSecondCategory: 'How many outfit choices are there? Multiply by that count.',
    shortcutThirdCategory: 'How many shoe choices are there? Multiply again.',
    shortcutTotal: 'That gives the total number of unique studio looks.',
    practicePrompt: 'Now try the shortcut with a new set of studio choices.',
    practiceCorrect: 'Great work! The shortcut counted every possible look.',
    practiceIncorrect: 'Not quite. Count each category first, then multiply.',
    practiceSolution: 'Use the counts from each category and multiply them in order.',
    completeBody: 'Multiplying your options is a powerful inventor shortcut for counting choices.',
  },
  categories: [
    { key: 'crowns', label: 'Toppers', items: ['Spark Topper', 'Glow Topper'] },
    { key: 'dresses', label: 'Outfits', items: ['Rainbow Fit', 'Cloud Fit', 'Comet Fit'] },
    { key: 'shoes', label: 'Shoes', items: ['Bounce Shoes', 'Glide Shoes'] },
  ],
  itemStyles: {
    'gold-tiara': { background: '#fef3c7', text: '#78350f', border: '#d97706', heartColor: '#f59e0b', motifShape: 'diamond' },
    'diamond-crown': { background: '#fae8ff', text: '#86198f', border: '#d946ef', heartColor: '#d946ef', motifShape: 'diamond' },
    'pink-gown': { background: '#fdf4ff', text: '#a21caf', border: '#d946ef', heartColor: '#c026d3', motifShape: 'diamond' },
    'purple-dress': { background: '#fef3c7', text: '#92400e', border: '#f59e0b', heartColor: '#f59e0b', motifShape: 'diamond' },
    'emerald-gown': { background: '#ecfdf5', text: '#047857', border: '#34d399', heartColor: '#10b981', motifShape: 'diamond' },
    'glass-slippers': { background: '#eff6ff', text: '#1e40af', border: '#60a5fa', heartColor: '#3b82f6', motifShape: 'circle' },
    'riding-boots': { background: '#f5f3ff', text: '#5b21b6', border: '#8b5cf6', heartColor: '#7c3aed', motifShape: 'circle' },
  },
  feedback: {
    correct: 'Brilliant! You counted every studio look.',
    tryAgain: 'Try another count, inventor.',
    hint: 'Pick one topper first, then count what can go with it.',
  },
  lesson4: {
    spinnerIcons: {
      crown: '✨',
      ruby: '🌈',
      gown: '🎲',
      dragon: '🪄',
      star: '🎨',
      sparkle: '💎',
    },
  },
}

function createVoiceScriptHash(text) {
  let hash = 5381
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index)
  }

  return (hash >>> 0).toString(36)
}

function createLessonVoiceClip({ lessonId, clipKey, text, revealPolicy, caption = text }) {
  return {
    lessonId,
    clipKey,
    text,
    revealPolicy,
    caption,
    scriptHash: createVoiceScriptHash(`${lessonId}:${clipKey}:${revealPolicy}:${text}`),
  }
}

function isVoiceScriptString(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_VOICE_SCRIPT_LENGTH
}

function validateLessonVoiceClip(clip) {
  if (!clip.lessonId || !clip.clipKey || !clip.text || !clip.caption || !clip.scriptHash) {
    return false
  }

  if (!['safeBeforeAnswer', 'postCorrect', 'solutionOnly'].includes(clip.revealPolicy)) {
    return false
  }

  if (clip.revealPolicy === 'safeBeforeAnswer') {
    const combinedText = `${clip.text} ${clip.caption}`
    if (DIGIT_OR_EQUATION_PATTERN.test(combinedText)) return false
    if (NUMBER_WORD_PATTERN.test(combinedText)) return false
    if (EARLY_REVEAL_PATTERN.test(combinedText)) return false
  }

  return true
}

function isString(value, maxLength = MAX_TEXT_LENGTH) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

function isCopyString(value) {
  if (!isString(value, MAX_COPY_LENGTH)) return false
  if (/\d/.test(value)) return false
  const normalized = value.toLowerCase()
  return !BLOCKED_HINT_TERMS.some((term) => normalized.includes(term))
}

function isSafeHint(value) {
  if (!isString(value)) return false
  const normalized = value.toLowerCase()
  return !BLOCKED_HINT_TERMS.some((term) => normalized.includes(term))
}

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}

function isOptionalHexColor(value) {
  return value === undefined || isHexColor(value)
}

function isValidVisual(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const characterConfig = value.characterConfig
  const characterValid =
    characterConfig === undefined ||
    Boolean(
      characterConfig &&
        typeof characterConfig === 'object' &&
        !Array.isArray(characterConfig) &&
        CHARACTER_BASES.includes(String(characterConfig.base)) &&
        CHARACTER_HEADS.includes(String(characterConfig.head)) &&
        CHARACTER_TORSOS.includes(String(characterConfig.torso)) &&
        CHARACTER_FEET.includes(String(characterConfig.feet)) &&
        CHARACTER_STAGES.includes(String(characterConfig.stage)),
    )

  return Boolean(
    (value.character === 'princess' || value.character === 'astronaut') &&
      characterValid &&
      isHexColor(value.screenBackground) &&
      isHexColor(value.panelBackground) &&
      isHexColor(value.borderColor) &&
      isHexColor(value.accentColor) &&
      isHexColor(value.stageBackground) &&
      isHexColor(value.buttonBackground) &&
      isHexColor(value.buttonText) &&
      isHexColor(value.buttonBorder) &&
      isOptionalHexColor(value.textColor) &&
      isOptionalHexColor(value.mutedTextColor) &&
      isHexColor(value.hintBackground) &&
      isHexColor(value.hintText) &&
      isHexColor(value.successBackground) &&
      isHexColor(value.successText) &&
      isOptionalHexColor(value.errorBackground) &&
      isOptionalHexColor(value.errorText) &&
      isOptionalHexColor(value.errorBorder) &&
      isOptionalHexColor(value.statusBackground) &&
      isOptionalHexColor(value.statusText) &&
      isOptionalHexColor(value.statusBorder) &&
      isOptionalHexColor(value.warningBackground) &&
      isOptionalHexColor(value.warningText) &&
      isOptionalHexColor(value.warningBorder) &&
      isOptionalHexColor(value.selectedBackground) &&
      isOptionalHexColor(value.selectedText) &&
      isOptionalHexColor(value.selectedBorder) &&
      isOptionalHexColor(value.selectedRing) &&
      isOptionalHexColor(value.disabledBackground) &&
      isOptionalHexColor(value.disabledText) &&
      isOptionalHexColor(value.disabledBorder) &&
      isOptionalHexColor(value.inputBackground) &&
      isOptionalHexColor(value.inputText) &&
      isOptionalHexColor(value.inputBorder) &&
      isOptionalHexColor(value.focusRing) &&
      isOptionalHexColor(value.overlayBackground) &&
      isOptionalHexColor(value.dialogBackground) &&
      isOptionalHexColor(value.diagramBackground) &&
      isOptionalHexColor(value.diagramText) &&
      isOptionalHexColor(value.diagramConnector) &&
      isOptionalHexColor(value.equationAccent) &&
      isOptionalHexColor(value.spinnerRim) &&
      isOptionalHexColor(value.spinnerPointer) &&
      isOptionalHexColor(value.spinnerHubBackground) &&
      isOptionalHexColor(value.spinnerHubText) &&
      isOptionalHexColor(value.spinnerSeparator) &&
      isOptionalHexColor(value.meterTrack) &&
      isOptionalHexColor(value.neutralBackground) &&
      isOptionalHexColor(value.neutralText) &&
      isOptionalHexColor(value.neutralBorder) &&
      THEME_MOTIF_SHAPES.includes(String(value.motifShape)) &&
      isHexColor(value.motifPrimary) &&
      isHexColor(value.motifSecondary),
  )
}

function isValidCopy(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return COPY_KEYS.every((key) => isCopyString(value[key]))
}

function isValidItemStyleMap(value) {
  if (value === undefined) return true
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  return Object.entries(value).every(([itemId, style]) => {
    if (!THEME_ITEM_STYLE_KEYS.includes(itemId)) return false
    if (!style || typeof style !== 'object' || Array.isArray(style)) return false
    return Boolean(
      isHexColor(style.background) &&
        isHexColor(style.text) &&
        isHexColor(style.border) &&
        isOptionalHexColor(style.heartColor) &&
        (style.motifShape === undefined || THEME_MOTIF_SHAPES.includes(String(style.motifShape))),
    )
  })
}

function sanitizeItemStyleMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const sanitized = {}
  for (const [itemId, style] of Object.entries(value)) {
    if (!THEME_ITEM_STYLE_KEYS.includes(itemId)) continue
    if (!style || typeof style !== 'object' || Array.isArray(style)) continue
    if (!isHexColor(style.background) || !isHexColor(style.text) || !isHexColor(style.border)) continue
    if (!isOptionalHexColor(style.heartColor)) continue
    if (style.motifShape !== undefined && !THEME_MOTIF_SHAPES.includes(String(style.motifShape))) continue

    sanitized[itemId] = {
      background: style.background,
      text: style.text,
      border: style.border,
      ...(style.heartColor === undefined ? {} : { heartColor: style.heartColor }),
      ...(style.motifShape === undefined ? {} : { motifShape: style.motifShape }),
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

function isValidVoiceScriptMap(value) {
  if (value === undefined) return true
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  return Object.entries(value).every(([clipKey, script]) => {
    const baseClip = VOICE_CLIPS[clipKey]
    if (!baseClip || !script || typeof script !== 'object' || Array.isArray(script)) return false
    if (!isVoiceScriptString(script.text)) return false
    if (script.caption !== undefined && !isVoiceScriptString(script.caption)) return false

    const themedClip = createThemedVoiceClip(baseClip, script)
    return validateLessonVoiceClip(themedClip)
  })
}

function isValidEmojiString(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 12 && !/[<>{}[\]]/.test(value)
}

function isValidLesson4Overrides(value) {
  if (value === undefined) return true
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  if (value.spinnerIcons === undefined) return true
  if (!value.spinnerIcons || typeof value.spinnerIcons !== 'object' || Array.isArray(value.spinnerIcons)) {
    return false
  }

  return Object.entries(value.spinnerIcons).every(([key, icon]) => (
    LESSON_4_SPINNER_ICON_KEYS.includes(key) && isValidEmojiString(icon)
  ))
}

function sanitizeLesson4Overrides(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const spinnerIcons = value.spinnerIcons
  if (!spinnerIcons || typeof spinnerIcons !== 'object' || Array.isArray(spinnerIcons)) return undefined

  const sanitized = {}
  for (const [key, icon] of Object.entries(spinnerIcons)) {
    if (LESSON_4_SPINNER_ICON_KEYS.includes(key) && isValidEmojiString(icon)) {
      sanitized[key] = icon
    }
  }

  return Object.keys(sanitized).length > 0 ? { spinnerIcons: sanitized } : undefined
}

function sanitizeVoiceScriptMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const sanitized = {}
  for (const [clipKey, script] of Object.entries(value)) {
    const baseClip = VOICE_CLIPS[clipKey]
    if (!baseClip || !script || typeof script !== 'object' || Array.isArray(script)) continue
    if (!isVoiceScriptString(script.text)) continue
    if (script.caption !== undefined && !isVoiceScriptString(script.caption)) continue

    const candidate = {
      text: script.text,
      ...(script.caption === undefined ? {} : { caption: script.caption }),
    }
    const themedClip = createThemedVoiceClip(baseClip, candidate)
    if (validateLessonVoiceClip(themedClip)) {
      sanitized[clipKey] = candidate
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

function sanitizeGeneratedThemePack(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const sanitizedVoice = sanitizeVoiceScriptMap(value.voice)
  const sanitizedLesson4 = sanitizeLesson4Overrides(value.lesson4)
  const sanitizedItemStyles = sanitizeItemStyleMap(value.itemStyles)
  const baseThemeWithLesson4 = sanitizedLesson4 ? { ...value, lesson4: sanitizedLesson4 } : (() => {
    const { lesson4: _lesson4, ...themeWithoutLesson4 } = value
    return themeWithoutLesson4
  })()
  const baseTheme = sanitizedItemStyles ? { ...baseThemeWithLesson4, itemStyles: sanitizedItemStyles } : (() => {
    const { itemStyles: _itemStyles, ...themeWithoutItemStyles } = baseThemeWithLesson4
    return themeWithoutItemStyles
  })()
  if (sanitizedVoice) return { ...baseTheme, voice: sanitizedVoice }
  const { voice: _voice, ...themeWithoutVoice } = baseTheme
  return themeWithoutVoice
}

function getThemeValidationIssues(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['theme_not_object']

  const issues = []
  if (!isString(value.themeName)) issues.push('themeName')
  if (!isString(value.learnerRole)) issues.push('learnerRole')
  if (!isString(value.intro)) issues.push('intro')
  if (!isValidVisual(value.visual)) issues.push('visual')
  if (!isValidCopy(value.copy)) issues.push('copy')
  if (!isValidItemStyleMap(value.itemStyles)) issues.push('itemStyles')
  if (!isValidLesson4Overrides(value.lesson4)) issues.push('lesson4')
  if (!isValidVoiceScriptMap(value.voice)) issues.push('voice')
  if (!Array.isArray(value.categories) || value.categories.length !== 3) {
    issues.push('categories')
  } else {
    const [first, second, third] = value.categories
    if (first?.key !== 'crowns' || second?.key !== 'dresses' || third?.key !== 'shoes') {
      issues.push('category_keys')
    }
    if (first?.items?.length !== 2 || second?.items?.length !== 3 || third?.items?.length !== 2) {
      issues.push('category_counts')
    }
  }
  if (!value.feedback || !isString(value.feedback.correct) || !isString(value.feedback.tryAgain) || !isSafeHint(value.feedback.hint)) {
    issues.push('feedback')
  }

  return issues
}

function isValidThemePack(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  if (!isString(value.themeName) || !isString(value.learnerRole) || !isString(value.intro)) {
    return false
  }
  if (
    !isValidVisual(value.visual) ||
    !isValidCopy(value.copy) ||
    !isValidItemStyleMap(value.itemStyles) ||
    !isValidLesson4Overrides(value.lesson4) ||
    !isValidVoiceScriptMap(value.voice)
  ) {
    return false
  }

  if (!Array.isArray(value.categories) || value.categories.length !== 3) return false
  const [first, second, third] = value.categories
  if (first?.key !== 'crowns' || second?.key !== 'dresses' || third?.key !== 'shoes') return false
  if (!isString(first.label) || !isString(second.label) || !isString(third.label)) return false
  if (first.items?.length !== 2 || second.items?.length !== 3 || third.items?.length !== 2) return false
  if (![...first.items, ...second.items, ...third.items].every((item) => isString(item))) return false

  return Boolean(
    value.feedback &&
      isString(value.feedback.correct) &&
      isString(value.feedback.tryAgain) &&
      isSafeHint(value.feedback.hint),
  )
}

function createThemedVoiceClip(baseClip, script) {
  const text = script.text.trim()
  const caption = typeof script.caption === 'string' && script.caption.trim() ? script.caption.trim() : text

  return {
    ...baseClip,
    text,
    caption,
    scriptHash: createVoiceScriptHash(`${baseClip.lessonId}:${baseClip.clipKey}:${baseClip.revealPolicy}:${text}`),
  }
}

const THEME_FEW_SHOT_EXAMPLES = [
  {
    themeName: 'Space Academy',
    learnerRole: 'astronaut stylist',
    visual: {
      character: 'astronaut',
      motifShape: 'star',
      motifPrimary: '#38bdf8',
      motifSecondary: '#8b5cf6',
    },
    copy: {
      screen1Heading: 'Style the Space Crew!',
      screen4Heading: 'Astronaut Stylist Confirmed!',
      shortcutTitle: 'The Space Gear Shortcut',
      completeBody: 'Multiplying your options is a powerful mission shortcut for counting choices.',
    },
    categories: [
      { key: 'crowns', label: 'Space Helmets', items: ['Silver Helmet', 'Star Helmet'] },
      { key: 'dresses', label: 'Space Suits', items: ['Blue Suit', 'Purple Suit', 'Comet Suit'] },
      { key: 'shoes', label: 'Rocket Boots', items: ['Moon Boots', 'Jet Boots'] },
    ],
  },
  {
    themeName: 'Animal Rescue',
    learnerRole: 'animal helper',
    visual: {
      character: 'princess',
      motifShape: 'paw',
      motifPrimary: '#f97316',
      motifSecondary: '#16a34a',
    },
    copy: {
      screen1Heading: 'Build Rescue Looks!',
      screen4Heading: 'Animal Helper Confirmed!',
      shortcutTitle: 'The Rescue Gear Shortcut',
      completeBody: 'Multiplying your options is a powerful helper shortcut for counting choices.',
    },
    categories: [
      { key: 'crowns', label: 'Helper Hats', items: ['Safari Hat', 'Rescue Cap'] },
      { key: 'dresses', label: 'Helper Outfits', items: ['Fox Vest', 'Panda Jacket', 'Tiger Tee'] },
      { key: 'shoes', label: 'Field Shoes', items: ['Trail Shoes', 'Creek Boots'] },
    ],
  },
  {
    themeName: 'Dinosaur Dig',
    learnerRole: 'dinosaur explorer',
    visual: {
      character: 'princess',
      motifShape: 'triangle',
      motifPrimary: '#65a30d',
      motifSecondary: '#ca8a04',
    },
    copy: {
      screen1Heading: 'Build Expedition Looks!',
      screen4Heading: 'Dinosaur Explorer Confirmed!',
      shortcutTitle: 'The Expedition Shortcut',
      completeBody: 'Multiplying your options is a powerful explorer shortcut for counting choices.',
    },
    categories: [
      { key: 'crowns', label: 'Explorer Hats', items: ['Ranger Hat', 'Fossil Cap'] },
      { key: 'dresses', label: 'Explorer Outfits', items: ['Leaf Vest', 'Amber Jacket', 'Camo Suit'] },
      { key: 'shoes', label: 'Trail Boots', items: ['Mud Boots', 'Climber Boots'] },
    ],
  },
  {
    themeName: 'Sports Squad',
    learnerRole: 'team stylist',
    visual: {
      character: 'princess',
      motifShape: 'circle',
      motifPrimary: '#0ea5e9',
      motifSecondary: '#f97316',
    },
    copy: {
      screen1Heading: 'Build Team Looks!',
      screen4Heading: 'Team Stylist Confirmed!',
      shortcutTitle: 'The Team Gear Shortcut',
      completeBody: 'Multiplying your options is a powerful team shortcut for counting choices.',
    },
    categories: [
      { key: 'crowns', label: 'Team Caps', items: ['Blue Cap', 'Gold Cap'] },
      { key: 'dresses', label: 'Jerseys', items: ['Striker Jersey', 'Goalie Jersey', 'Captain Jersey'] },
      { key: 'shoes', label: 'Sneakers', items: ['Sprint Sneakers', 'Court Sneakers'] },
    ],
  },
]

function buildThemeGenerationPrompt({ themeIdea, preference }) {
  const safeThemeIdea = themeIdea || preference
  return `Create one JSON theme pack for a 3rd-grade counting choices curriculum app.

Learner theme idea: ${safeThemeIdea}
Fallback style bucket: ${preference}

Use these few-shot examples for style, naming, item specificity, colors, motifs, emojis/icons, and lesson-safe wording:
${JSON.stringify(THEME_FEW_SHOT_EXAMPLES, null, 2)}

Return JSON only. Do not use Markdown.

Do not change the math. The category counts must remain exactly:
- crowns: two items
- dresses: three items
- shoes: two items

Generated text may use short emojis in headings, but no HTML and no code.
Avoid equations, digits, final answers, "answer is", "solution", "equals", "out of", and "total is" in copy and safe voice scripts.
For voice scripts, avoid number words such as one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, twenty, and forty unless the clip is a generic post-correct celebration.
Use theme words throughout lesson headings, category labels, item names, feedback, visual colors, motif, and voice scripts.
Choose clothing/item colors that match the theme and item labels. For example, an animal helper "Fox Vest" should use fox-like orange/brown colors, not pink princess colors.
Choose six Lesson Four spinner emojis that match the generated theme and the generated category items.
The visual object may include extra hex color fields for UI states: textColor, mutedTextColor, errorBackground, errorText, errorBorder, statusBackground, statusText, statusBorder, warningBackground, warningText, warningBorder, selectedBackground, selectedText, selectedBorder, selectedRing, disabledBackground, disabledText, disabledBorder, inputBackground, inputText, inputBorder, focusRing, diagramBackground, diagramText, diagramConnector, equationAccent, spinnerRim, spinnerPointer, spinnerHubBackground, spinnerHubText, spinnerSeparator, meterTrack, neutralBackground, neutralText, and neutralBorder.

Required JSON shape:
{
  "themeName": "short theme name",
  "learnerRole": "short learner role",
  "intro": "one short intro sentence",
  "visual": {
    "character": "princess or astronaut",
    "characterConfig": {
      "base": "human, astronaut, explorer, or mascot",
      "head": "hair, helmet, cap, dinoHood, animalEars, chefHat, sunHat, or beret",
      "torso": "dress, spaceSuit, jacketAndPants, jersey, apron, overalls, or smock",
      "feet": "slippers, boots, or sneakers",
      "stage": "royal, space, digSite, rescue, sports, studio, garden, or kitchen"
    },
    "screenBackground": "#ffffff",
    "panelBackground": "#faf5ff",
    "borderColor": "#e9d5ff",
    "accentColor": "#7c3aed",
    "stageBackground": "#fce7f3",
    "buttonBackground": "#ffffff",
    "buttonText": "#7c3aed",
    "buttonBorder": "#e9d5ff",
    "hintBackground": "#eff6ff",
    "hintText": "#1e40af",
    "successBackground": "#ecfdf5",
    "successText": "#065f46",
    "motifShape": "heart, circle, square, star, diamond, triangle, or paw",
    "motifPrimary": "#ec4899",
    "motifSecondary": "#a855f7"
  },
  "copy": {
    "screen1Heading": "short heading",
    "screen2Title": "short Anchor Trick title",
    "screen2Button": "short continue button label",
    "screen3Heading": "short heading",
    "screen4Heading": "short heading",
    "lookNamePlural": "short plural phrase",
    "variationNamePlural": "short plural phrase",
    "logHeading": "short found-items heading",
    "logEmpty": "short empty-log instruction",
    "logCounter": "short counter label",
    "anchorIntro": "short intro for locking one category",
    "anchorLockFirst": "short step text for locking the first top item",
    "anchorFirstBranch": "short step text for trying every middle item with the first top item",
    "anchorSecondBranch": "short step text for switching to the second top item",
    "anchorTotal": "short text about putting groups together",
    "shortcutTitle": "short shortcut title",
    "shortcutIntro": "short shortcut intro",
    "shortcutCountChoices": "short text about counting choices first",
    "shortcutFirstCategory": "short question about the first category",
    "shortcutSecondCategory": "short text about multiplying by the second category",
    "shortcutThirdCategory": "short text about multiplying by the third category",
    "shortcutTotal": "short text about unique looks",
    "practicePrompt": "short practice setup",
    "practiceCorrect": "short correct feedback",
    "practiceIncorrect": "short incorrect feedback",
    "practiceSolution": "short strategy text",
    "completeBody": "short completion text"
  },
  "categories": [
    { "key": "crowns", "label": "category display name", "items": ["item one", "item two"] },
    { "key": "dresses", "label": "category display name", "items": ["item one", "item two", "item three"] },
    { "key": "shoes", "label": "category display name", "items": ["item one", "item two"] }
  ],
  "itemStyles": {
    "gold-tiara": { "background": "#ffffff", "text": "#111827", "border": "#111827", "heartColor": "#111827", "motifShape": "star" },
    "diamond-crown": { "background": "#ffffff", "text": "#111827", "border": "#111827", "heartColor": "#111827", "motifShape": "star" },
    "pink-gown": { "background": "#ffffff", "text": "#111827", "border": "#111827", "heartColor": "#111827", "motifShape": "square" },
    "purple-dress": { "background": "#ffffff", "text": "#111827", "border": "#111827", "heartColor": "#111827", "motifShape": "square" },
    "emerald-gown": { "background": "#ffffff", "text": "#111827", "border": "#111827", "heartColor": "#111827", "motifShape": "square" },
    "glass-slippers": { "background": "#ffffff", "text": "#111827", "border": "#111827", "heartColor": "#111827", "motifShape": "circle" },
    "riding-boots": { "background": "#ffffff", "text": "#111827", "border": "#111827", "heartColor": "#111827", "motifShape": "circle" }
  },
  "feedback": {
    "correct": "short success message",
    "tryAgain": "short try-again message",
    "hint": "short hint that does not reveal the answer"
  },
  "lesson4": {
    "spinnerIcons": {
      "crown": "emoji for first top-category spinner outcome",
      "ruby": "emoji for second top-category spinner outcome",
      "gown": "emoji for first middle-category spinner outcome",
      "dragon": "emoji for second middle-category spinner outcome",
      "star": "emoji for first bottom-category spinner outcome",
      "sparkle": "emoji for second bottom-category spinner outcome"
    }
  },
  "voice": {
    "lesson1.screen1.welcome": { "text": "short themed welcome voice line" },
    "lesson1.screen2.anchorIntro": { "text": "short themed anchor trick voice line" },
    "lesson1.screen3.shoesIntro": { "text": "short themed last category voice line" },
    "lesson1.screen4.shortcutIntro": { "text": "short themed shortcut voice line" },
    "lesson1.screen3.tryAgain": { "text": "short themed safe try again voice line" },
    "lesson1.screen4.complete": { "text": "short themed completion voice line" },
    "lesson1.feedback.correct": { "text": "short themed generic correct cue" },
    "lesson1.feedback.tryAgain": { "text": "short themed generic try again cue" },
    "lesson2.screen1.arrangementsIntro": { "text": "short themed arrangements voice line" },
    "lesson2.screen2.restrictionIntro": { "text": "short themed rule voice line" },
    "lesson2.feedback.correct": { "text": "short themed generic correct cue" },
    "lesson2.feedback.tryAgain": { "text": "short themed generic try again cue" },
    "lesson3.screen1.combinationsIntro": { "text": "short themed combinations voice line" },
    "lesson3.screen2.duplicatesIntro": { "text": "short themed matching groups voice line" },
    "lesson3.feedback.correct": { "text": "short themed generic correct cue" },
    "lesson3.feedback.tryAgain": { "text": "short themed generic try again cue" },
    "lesson4.screen1.spinnerIntro": { "text": "short themed spinner voice line" },
    "lesson4.screen2.compareIntro": { "text": "short themed compare chances voice line" },
    "lesson4.feedback.correct": { "text": "short themed generic correct cue" },
    "lesson4.feedback.tryAgain": { "text": "short themed generic try again cue" },
    "lesson5.screen1.sampleSpaceIntro": { "text": "short themed sample space voice line" },
    "lesson5.screen2.outcomesIntro": { "text": "short themed outcomes voice line" },
    "lesson5.screen3.fairnessIntro": { "text": "short themed fairness voice line" },
    "lesson5.feedback.correct": { "text": "short themed generic correct cue" },
    "lesson5.feedback.tryAgain": { "text": "short themed generic try again cue" }
  }
}`
}

function extractOpenAIText(result) {
  if (typeof result.output_text === 'string') return result.output_text
  const output = Array.isArray(result.output) ? result.output : []
  for (const item of output) {
    const content = Array.isArray(item.content) ? item.content : []
    for (const contentItem of content) {
      if (typeof contentItem.text === 'string') return contentItem.text
    }
  }
  return ''
}

async function generateThemeWithOpenAI({ apiKey, themeIdea, preference }) {
  return requestOpenAITheme({
    apiKey,
    prompt: buildThemeGenerationPrompt({ themeIdea, preference }),
  })
}

function buildThemeRepairPrompt({ themeIdea, preference, invalidThemePack, validationIssues }) {
  return `${buildThemeGenerationPrompt({ themeIdea, preference })}

The previous JSON failed validation with these top-level issues:
${validationIssues.join(', ')}

Repair the JSON by returning a complete replacement theme pack. Do not explain the changes.

Previous invalid JSON:
${JSON.stringify(invalidThemePack, null, 2)}`
}

async function repairThemeWithOpenAI({ apiKey, themeIdea, preference, invalidThemePack, validationIssues }) {
  return requestOpenAITheme({
    apiKey,
    prompt: buildThemeRepairPrompt({
      themeIdea,
      preference,
      invalidThemePack,
      validationIssues,
    }),
  })
}

async function requestOpenAITheme({ apiKey, prompt }) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_THEME_MODEL,
      input: [
        {
          role: 'system',
          content:
            'You generate safe JSON-only theme packs for a children math app. The output must be valid JSON and match the requested schema. Please think creative, and try to be different from the provided examples. This is for a 3rd grader, but make it match the provided theme as much as possible. Make sure the color scheme is so that text is readable against the background.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      text: {
        format: {
          type: 'json_object',
        },
      },
      temperature: 0.7,
      max_output_tokens: 3500,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`OpenAI request failed (${response.status}): ${message}`)
  }

  const result = await response.json()
  return JSON.parse(extractOpenAIText(result))
}

const LESSON_1_ID = 'lesson-1-princess-outfits'
const LESSON_2_ID = 'lesson-2-coming-soon'
const LESSON_3_ID = 'lesson-3-royal-treasure-bags'
const LESSON_4_ID = 'lesson-4-magic-chance-spinners'
const LESSON_5_ID = 'lesson-5-fair-games'
const VOICE_CLIPS = {
  'lesson1.screen1.welcome': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen1.welcome',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Welcome! Tap the choices and build every unique look you can find.',
  }),
  'lesson1.screen2.anchorIntro': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen2.anchorIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Now try the Anchor Trick: lock a choice, then pair it with each matching choice.',
  }),
  'lesson1.screen3.shoesIntro': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen3.shoesIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Add the last category and watch how each finished look can change.',
  }),
  'lesson1.screen4.shortcutIntro': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen4.shortcutIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'The shortcut is to count the choices in each category, then multiply the groups.',
  }),
  'lesson1.screen3.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen3.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Try building the looks before answering, then count what changed.',
  }),
  'lesson1.screen4.complete': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen4.complete',
    revealPolicy: 'postCorrect',
    text: 'Great work! You used multiplication as a shortcut for counting choices.',
  }),
  'lesson1.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Great job! Keep going.',
  }),
  'lesson1.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Look back at what you built.',
  }),
  'lesson2.screen1.arrangementsIntro': createLessonVoiceClip({
    lessonId: LESSON_2_ID,
    clipKey: 'lesson2.screen1.arrangementsIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Arrange the cards and watch how order changes each result.',
  }),
  'lesson2.screen2.restrictionIntro': createLessonVoiceClip({
    lessonId: LESSON_2_ID,
    clipKey: 'lesson2.screen2.restrictionIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Now add a rule and look for choices that still fit.',
  }),
  'lesson2.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_2_ID,
    clipKey: 'lesson2.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Nice work! Your arrangement thinking is on track.',
  }),
  'lesson2.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_2_ID,
    clipKey: 'lesson2.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Check which choices are still allowed.',
  }),
  'lesson3.screen1.combinationsIntro': createLessonVoiceClip({
    lessonId: LESSON_3_ID,
    clipKey: 'lesson3.screen1.combinationsIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Build groups where order does not matter, then compare what stays the same.',
  }),
  'lesson3.screen2.duplicatesIntro': createLessonVoiceClip({
    lessonId: LESSON_3_ID,
    clipKey: 'lesson3.screen2.duplicatesIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'When repeated items appear, sort matching groups so repeats do not sneak in.',
  }),
  'lesson3.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_3_ID,
    clipKey: 'lesson3.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Great check! Your grouping strategy is clear.',
  }),
  'lesson3.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_3_ID,
    clipKey: 'lesson3.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Look for groups that match.',
  }),
  'lesson4.screen1.spinnerIntro': createLessonVoiceClip({
    lessonId: LESSON_4_ID,
    clipKey: 'lesson4.screen1.spinnerIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'A spinner is a set of possible landing spots. Count the spaces before you choose.',
  }),
  'lesson4.screen2.compareIntro': createLessonVoiceClip({
    lessonId: LESSON_4_ID,
    clipKey: 'lesson4.screen2.compareIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Compare the spinner sections before deciding which outcome is more likely.',
  }),
  'lesson4.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_4_ID,
    clipKey: 'lesson4.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Nice work! Your chance thinking is on track.',
  }),
  'lesson4.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_4_ID,
    clipKey: 'lesson4.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Count the matching spinner spaces.',
  }),
  'lesson5.screen1.sampleSpaceIntro': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.screen1.sampleSpaceIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Tap spinner spaces to build the sample space tray before you decide what is fair.',
  }),
  'lesson5.screen2.outcomesIntro': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.screen2.outcomesIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Build the outcome list before judging whether the game feels fair.',
  }),
  'lesson5.screen3.fairnessIntro': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.screen3.fairnessIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'A fair game gives each player matching chances. Compare the winning spaces before you decide.',
  }),
  'lesson5.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Great check! That game thinking is fair and clear.',
  }),
  'lesson5.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Compare the winning spaces.',
  }),
}

function sanitizeCacheSegment(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createVoiceCacheKey({ provider, themePreference, lessonId, clipKey, scriptHash }) {
  return [
    'voice',
    sanitizeCacheSegment(provider),
    sanitizeCacheSegment(themePreference),
    sanitizeCacheSegment(lessonId),
    sanitizeCacheSegment(clipKey),
    `${sanitizeCacheSegment(scriptHash)}.mp3`,
  ].join('/')
}

function createFallbackResponse(clip) {
  return {
    status: 'fallback',
    caption: clip.caption,
    scriptHash: clip.scriptHash,
  }
}

async function resolveUserVoiceClip({ uid, themePreference, baseClip }) {
  try {
    const snapshot = await admin.firestore().doc(`users/${uid}`).get()
    if (!snapshot.exists) return baseClip

    const profile = snapshot.data() || {}
    if (profile.themePreference !== themePreference) return baseClip

    const script = profile.themePacks?.[LESSON_1_ID]?.voice?.[baseClip.clipKey]
    if (!script || typeof script !== 'object' || Array.isArray(script)) return baseClip
    if (!isVoiceScriptString(script.text)) return baseClip
    if (script.caption !== undefined && !isVoiceScriptString(script.caption)) return baseClip

    const themedClip = createThemedVoiceClip(baseClip, script)
    return validateLessonVoiceClip(themedClip) ? themedClip : baseClip
  } catch (error) {
    logger.warn('Theme voice lookup failed; using static voice clip.', {
      clipKey: baseClip.clipKey,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })
    return baseClip
  }
}

function getCartesiaVoiceId(themePreference) {
  const envName = `CARTESIA_VOICE_ID_${themePreference.toUpperCase()}`
  return process.env[envName] || DEFAULT_CARTESIA_VOICE_ID
}

async function getSignedUrl(file) {
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: new Date(Date.now() + SIGNED_URL_TTL_MS),
  })
  return url
}

function createLocalAudioDataUrl(audio) {
  return `data:audio/mpeg;base64,${audio.toString('base64')}`
}

async function generateCartesiaMp3({ apiKey, text, voiceId }) {
  const response = await fetch(CARTESIA_BYTES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Cartesia-Version': CARTESIA_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_id: CARTESIA_MODEL_ID,
      transcript: text,
      voice: {
        mode: 'id',
        id: voiceId,
      },
      output_format: {
        container: 'mp3',
        sample_rate: 44100,
        bit_rate: 128000,
      },
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Cartesia request failed (${response.status}): ${message}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

exports.generateCustomTheme = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in before generating themes.')
    }

    const data = request.data || {}
    const preference = THEME_PREFERENCES.includes(data.preference) ? data.preference : 'surprise'
    const themeIdea = typeof data.themeIdea === 'string' ? data.themeIdea.trim().slice(0, 80) : ''
    const apiKey = process.env.OPENAI_API_KEY || process.env.openai_api_key

    if (!apiKey) {
      logger.warn('OPENAI_API_KEY is not configured; returning fallback theme.', { preference })
      return {
        source: 'fallback',
        themePack: FALLBACK_THEME_PACK,
      }
    }

    try {
      const rawThemePack = await generateThemeWithOpenAI({
        apiKey,
        themeIdea,
        preference,
      })
      let themePack = sanitizeGeneratedThemePack(rawThemePack)

      if (!isValidThemePack(themePack)) {
        const validationIssues = getThemeValidationIssues(themePack)
        logger.warn('OpenAI returned an invalid theme pack; retrying with repair prompt.', {
          preference,
          validationIssues,
        })

        const repairedThemePack = await repairThemeWithOpenAI({
          apiKey,
          themeIdea,
          preference,
          invalidThemePack: rawThemePack,
          validationIssues,
        })
        themePack = sanitizeGeneratedThemePack(repairedThemePack)

        if (!isValidThemePack(themePack)) {
          logger.warn('OpenAI repair returned an invalid theme pack; returning fallback theme.', {
            preference,
            validationIssues: getThemeValidationIssues(themePack),
          })
          return {
            source: 'fallback',
            themePack: FALLBACK_THEME_PACK,
          }
        }
      }

      return {
        source: 'generated',
        themePack,
      }
    } catch (error) {
      logger.error('OpenAI theme generation failed; returning fallback theme.', {
        preference,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      return {
        source: 'fallback',
        themePack: FALLBACK_THEME_PACK,
      }
    }
  },
)

exports.getVoiceClip = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in before requesting voice clips.')
    }

    const data = request.data || {}
    const lessonId = typeof data.lessonId === 'string' ? data.lessonId : ''
    const clipKey = typeof data.clipKey === 'string' ? data.clipKey : ''
    const themePreference = typeof data.themePreference === 'string' ? data.themePreference : ''
    const baseClip = VOICE_CLIPS[clipKey]

    if (!baseClip || baseClip.lessonId !== lessonId) {
      throw new HttpsError('invalid-argument', 'Unknown voice clip.')
    }

    if (!THEME_PREFERENCES.includes(themePreference)) {
      throw new HttpsError('invalid-argument', 'Unknown theme preference.')
    }

    const clip = await resolveUserVoiceClip({
      uid: request.auth.uid,
      themePreference,
      baseClip,
    })

    const cacheKey = createVoiceCacheKey({
      provider: 'cartesia',
      themePreference,
      lessonId: clip.lessonId,
      clipKey: clip.clipKey,
      scriptHash: clip.scriptHash,
    })
    const bucket = admin.storage().bucket()
    const file = bucket.file(cacheKey)
    const [exists] = await file.exists()

    if (exists) {
      return {
        status: 'ready',
        audioUrl: await getSignedUrl(file),
        caption: clip.caption,
        scriptHash: clip.scriptHash,
      }
    }

    const apiKey = process.env.CARTESIA_API
    if (!apiKey) {
      logger.warn('CARTESIA_API is not configured; returning voice fallback.', { clipKey })
      return createFallbackResponse(clip)
    }

    let audio
    try {
      audio = await generateCartesiaMp3({
        apiKey,
        text: clip.text,
        voiceId: getCartesiaVoiceId(themePreference),
      })
    } catch (error) {
      logger.error('Cartesia generation failed; returning caption fallback.', {
        clipKey,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      return createFallbackResponse(clip)
    }

    try {
      await file.save(audio, {
        contentType: 'audio/mpeg',
        metadata: {
          cacheControl: 'public, max-age=31536000, immutable',
          metadata: {
            provider: 'cartesia',
            themePreference,
            lessonId: clip.lessonId,
            clipKey: clip.clipKey,
            scriptHash: clip.scriptHash,
          },
        },
      })

      return {
        status: 'ready',
        audioUrl: await getSignedUrl(file),
        caption: clip.caption,
        scriptHash: clip.scriptHash,
      }
    } catch (error) {
      logger.error('Voice audio cache save failed.', {
        clipKey,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      if (process.env.FUNCTIONS_EMULATOR === 'true') {
        return {
          status: 'ready',
          audioUrl: createLocalAudioDataUrl(audio),
          caption: clip.caption,
          scriptHash: clip.scriptHash,
        }
      }
      return createFallbackResponse(clip)
    }
  },
)
