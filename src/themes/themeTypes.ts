import type { ClosetCategory } from '../lessons/lesson1/data'

export const THEME_PREFERENCES = [
  'royal',
  'space',
  'dinosaurs',
  'animals',
  'sports',
  'surprise',
] as const

export type ThemePreference = (typeof THEME_PREFERENCES)[number]

export interface ThemeCategory<Key extends ClosetCategory = ClosetCategory> {
  key: Key
  label: string
  items: string[]
}

export interface Lesson1ThemePack {
  themeName: string
  learnerRole: string
  intro: string
  visual?: Lesson1ThemeVisual
  copy?: Lesson1ThemeCopy
  itemStyles?: ThemeItemStyleMap
  lesson4?: Lesson4ThemeOverrides
  voice?: ThemeVoiceScriptMap
  categories: [
    ThemeCategory<'crowns'> & { items: [string, string] },
    ThemeCategory<'dresses'> & { items: [string, string, string] },
    ThemeCategory<'shoes'> & { items: [string, string] },
  ]
  feedback: {
    correct: string
    tryAgain: string
    hint: string
  }
}

export interface ThemePackMap {
  [lessonId: string]: Lesson1ThemePack | undefined
}

export interface ThemeItemStyle {
  background: string
  text: string
  border: string
  heartColor?: string
  motifShape?: ThemeMotifShape
}

export interface ThemeItemStyleMap {
  [itemId: string]: ThemeItemStyle | undefined
}

export type Lesson4SpinnerIconKey = 'crown' | 'ruby' | 'gown' | 'dragon' | 'star' | 'sparkle'

export interface Lesson4ThemeOverrides {
  spinnerIcons?: Partial<Record<Lesson4SpinnerIconKey, string>>
}

export interface ThemeVoiceScript {
  text: string
  caption?: string
}

export interface ThemeVoiceScriptMap {
  [clipKey: string]: ThemeVoiceScript | undefined
}

export interface Lesson1ThemeVisual {
  character: 'princess' | 'astronaut'
  characterConfig?: ThemeCharacterConfig
  screenBackground: string
  panelBackground: string
  borderColor: string
  accentColor: string
  stageBackground: string
  buttonBackground: string
  buttonText: string
  buttonBorder: string
  textColor?: string
  mutedTextColor?: string
  hintBackground: string
  hintText: string
  successBackground: string
  successText: string
  errorBackground?: string
  errorText?: string
  errorBorder?: string
  statusBackground?: string
  statusText?: string
  statusBorder?: string
  warningBackground?: string
  warningText?: string
  warningBorder?: string
  selectedBackground?: string
  selectedText?: string
  selectedBorder?: string
  selectedRing?: string
  disabledBackground?: string
  disabledText?: string
  disabledBorder?: string
  inputBackground?: string
  inputText?: string
  inputBorder?: string
  focusRing?: string
  overlayBackground?: string
  dialogBackground?: string
  diagramBackground?: string
  diagramText?: string
  diagramConnector?: string
  equationAccent?: string
  spinnerRim?: string
  spinnerPointer?: string
  spinnerHubBackground?: string
  spinnerHubText?: string
  spinnerSeparator?: string
  meterTrack?: string
  neutralBackground?: string
  neutralText?: string
  neutralBorder?: string
  motifShape: ThemeMotifShape
  motifPrimary: string
  motifSecondary: string
}

export type ThemeMotifShape = 'heart' | 'circle' | 'square' | 'star' | 'diamond' | 'triangle' | 'paw'

export type ThemeCharacterBase = 'human' | 'astronaut' | 'explorer' | 'mascot'
export type ThemeCharacterHead = 'hair' | 'helmet' | 'cap' | 'dinoHood' | 'animalEars' | 'chefHat' | 'sunHat' | 'beret'
export type ThemeCharacterTorso = 'dress' | 'spaceSuit' | 'jacketAndPants' | 'jersey' | 'apron' | 'overalls' | 'smock'
export type ThemeCharacterFeet = 'slippers' | 'boots' | 'sneakers'
export type ThemeCharacterStage = 'royal' | 'space' | 'digSite' | 'rescue' | 'sports' | 'studio' | 'garden' | 'kitchen'

export interface ThemeCharacterConfig {
  base: ThemeCharacterBase
  head: ThemeCharacterHead
  torso: ThemeCharacterTorso
  feet: ThemeCharacterFeet
  stage: ThemeCharacterStage
}

export interface Lesson1ThemeCopy {
  screen1Heading: string
  screen2Title: string
  screen2Button: string
  screen3Heading: string
  screen4Heading: string
  lookNamePlural: string
  variationNamePlural: string
  logHeading: string
  logEmpty: string
  logCounter: string
  anchorIntro: string
  anchorLockFirst: string
  anchorFirstBranch: string
  anchorSecondBranch: string
  anchorTotal: string
  shortcutTitle: string
  shortcutIntro: string
  shortcutCountChoices: string
  shortcutFirstCategory: string
  shortcutSecondCategory: string
  shortcutThirdCategory: string
  shortcutTotal: string
  practicePrompt: string
  practiceCorrect: string
  practiceIncorrect: string
  practiceSolution: string
  completeBody: string
}
