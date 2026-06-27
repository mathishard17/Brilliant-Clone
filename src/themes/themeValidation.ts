import type { Lesson1ThemePack } from './themeTypes'
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

function isOptionalHexColor(value: unknown): boolean {
  return value === undefined || isHexColor(value)
}

function isValidVisual(value: unknown): boolean {
  if (value === undefined) return true
  if (!value || typeof value !== 'object') return false
  const visual = value as Partial<NonNullable<Lesson1ThemePack['visual']>>
  const characterConfig = visual.characterConfig as unknown as Record<string, unknown> | undefined
  const characterValid = characterConfig === undefined || Boolean(
    CHARACTER_BASES.includes(String(characterConfig.base)) &&
      CHARACTER_HEADS.includes(String(characterConfig.head)) &&
      CHARACTER_TORSOS.includes(String(characterConfig.torso)) &&
      CHARACTER_FEET.includes(String(characterConfig.feet)) &&
      CHARACTER_STAGES.includes(String(characterConfig.stage)),
  )
  return Boolean(
    (visual.character === 'princess' || visual.character === 'astronaut') &&
      characterValid &&
      isHexColor(visual.screenBackground) &&
      isHexColor(visual.panelBackground) &&
      isHexColor(visual.borderColor) &&
      isHexColor(visual.accentColor) &&
      isHexColor(visual.stageBackground) &&
      isHexColor(visual.buttonBackground) &&
      isHexColor(visual.buttonText) &&
      isHexColor(visual.buttonBorder) &&
      isOptionalHexColor(visual.textColor) &&
      isOptionalHexColor(visual.mutedTextColor) &&
      isHexColor(visual.hintBackground) &&
      isHexColor(visual.hintText) &&
      isHexColor(visual.successBackground) &&
      isHexColor(visual.successText) &&
      isOptionalHexColor(visual.errorBackground) &&
      isOptionalHexColor(visual.errorText) &&
      isOptionalHexColor(visual.errorBorder) &&
      isOptionalHexColor(visual.statusBackground) &&
      isOptionalHexColor(visual.statusText) &&
      isOptionalHexColor(visual.statusBorder) &&
      isOptionalHexColor(visual.warningBackground) &&
      isOptionalHexColor(visual.warningText) &&
      isOptionalHexColor(visual.warningBorder) &&
      isOptionalHexColor(visual.selectedBackground) &&
      isOptionalHexColor(visual.selectedText) &&
      isOptionalHexColor(visual.selectedBorder) &&
      isOptionalHexColor(visual.selectedRing) &&
      isOptionalHexColor(visual.disabledBackground) &&
      isOptionalHexColor(visual.disabledText) &&
      isOptionalHexColor(visual.disabledBorder) &&
      isOptionalHexColor(visual.inputBackground) &&
      isOptionalHexColor(visual.inputText) &&
      isOptionalHexColor(visual.inputBorder) &&
      isOptionalHexColor(visual.focusRing) &&
      isOptionalHexColor(visual.overlayBackground) &&
      isOptionalHexColor(visual.dialogBackground) &&
      isOptionalHexColor(visual.diagramBackground) &&
      isOptionalHexColor(visual.diagramText) &&
      isOptionalHexColor(visual.diagramConnector) &&
      isOptionalHexColor(visual.equationAccent) &&
      isOptionalHexColor(visual.spinnerRim) &&
      isOptionalHexColor(visual.spinnerPointer) &&
      isOptionalHexColor(visual.spinnerHubBackground) &&
      isOptionalHexColor(visual.spinnerHubText) &&
      isOptionalHexColor(visual.spinnerSeparator) &&
      isOptionalHexColor(visual.meterTrack) &&
      isOptionalHexColor(visual.neutralBackground) &&
      isOptionalHexColor(visual.neutralText) &&
      isOptionalHexColor(visual.neutralBorder) &&
      THEME_MOTIF_SHAPES.includes(String(visual.motifShape)) &&
      isHexColor(visual.motifPrimary) &&
      isHexColor(visual.motifSecondary),
  )
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

function isValidCopy(value: unknown): boolean {
  if (value === undefined) return true
  if (!value || typeof value !== 'object') return false
  const copy = value as Partial<NonNullable<Lesson1ThemePack['copy']>>
  return COPY_KEYS.every((key) => isCopyString(copy[key]))
}

function isValidItemStyleMap(value: unknown): boolean {
  if (value === undefined) return true
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  return Object.entries(value).every(([itemId, style]) => {
    if (!THEME_ITEM_STYLE_KEYS.includes(itemId)) return false
    if (!style || typeof style !== 'object' || Array.isArray(style)) return false
    const itemStyle = style as Record<string, unknown>
    return Boolean(
      isHexColor(itemStyle.background) &&
        isHexColor(itemStyle.text) &&
        isHexColor(itemStyle.border) &&
        isOptionalHexColor(itemStyle.heartColor) &&
        (itemStyle.motifShape === undefined || THEME_MOTIF_SHAPES.includes(String(itemStyle.motifShape))),
    )
  })
}

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

export function isValidLesson1ThemePack(value: unknown): value is Lesson1ThemePack {
  if (!value || typeof value !== 'object') return false
  const theme = value as Partial<Lesson1ThemePack>

  if (!isString(theme.themeName) || !isString(theme.learnerRole) || !isString(theme.intro)) {
    return false
  }
  if (
    !isValidVisual(theme.visual) ||
    !isValidCopy(theme.copy) ||
    !isValidItemStyleMap(theme.itemStyles) ||
    !isValidLesson4Overrides(theme.lesson4) ||
    !isValidVoiceScriptMap(theme.voice)
  ) {
    return false
  }

  if (!Array.isArray(theme.categories) || theme.categories.length !== 3) return false

  const [first, second, third] = theme.categories
  if (first?.key !== 'crowns' || second?.key !== 'dresses' || third?.key !== 'shoes') return false
  if (!isString(first.label) || !isString(second.label) || !isString(third.label)) return false
  if (first.items?.length !== 2 || second.items?.length !== 3 || third.items?.length !== 2) {
    return false
  }
  if (![...first.items, ...second.items, ...third.items].every(isString)) return false

  const feedback = theme.feedback
  return Boolean(
    feedback &&
      isString(feedback.correct) &&
      isString(feedback.tryAgain) &&
      isSafeHint(feedback.hint),
  )
}

export function assertValidLesson1ThemePack(theme: Lesson1ThemePack): Lesson1ThemePack {
  if (!isValidLesson1ThemePack(theme)) {
    throw new Error('Invalid Lesson 1 theme pack')
  }
  return theme
}
