import type { CSSProperties } from 'react'
import { LESSON_1_ID } from '../types/lesson'
import { DEFAULT_LESSON_1_THEMES, ROYAL_LESSON_1_THEME } from './defaultThemes'
import {
  getLesson1ThemeItemLabel,
  getLesson1ThemeItemLabels,
  getLesson1ThemeItemMotifs,
  themedLesson1Items,
} from './lesson1ThemeItems'
import {
  THEME_PREFERENCES,
  type Lesson1ThemePack,
  type Lesson1ThemeCopy,
  type Lesson1ThemeVisual,
  type ThemeCategory,
  type ThemePackMap,
  type ThemePreference,
} from './themeTypes'
import { isValidLesson1ThemePack } from './themeValidation'

export function normalizeThemePreference(value: unknown): ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference) ? (value as ThemePreference) : 'royal'
}

export function resolveLesson1Theme(
  preference: ThemePreference,
  themePacks: ThemePackMap | undefined,
): Lesson1ThemePack {
  const cached = themePacks?.[LESSON_1_ID]
  if (isValidLesson1ThemePack(cached)) return cached
  return DEFAULT_LESSON_1_THEMES[preference] ?? ROYAL_LESSON_1_THEME
}

export function themedItems(category: ThemeCategory, theme?: Lesson1ThemePack) {
  const visual = theme ? getLesson1ThemeVisual(theme) : ROYAL_LESSON_1_THEME.visual!
  return themedLesson1Items(category, visual, theme)
}

export function getThemeCategory(theme: Lesson1ThemePack, key: ThemeCategory['key']) {
  return theme.categories.find((category) => category.key === key)
}

export function getLesson1ThemeVisual(theme: Lesson1ThemePack): Lesson1ThemeVisual {
  return theme.visual ?? ROYAL_LESSON_1_THEME.visual!
}

export function getLesson1ThemeCopy(theme: Lesson1ThemePack): Lesson1ThemeCopy {
  return theme.copy ?? ROYAL_LESSON_1_THEME.copy!
}

export function getThemeItemLabel(theme: Lesson1ThemePack, categoryKey: ThemeCategory['key'], id: string) {
  return getLesson1ThemeItemLabel(theme, categoryKey, id)
}

export function getThemeItemLabels(theme: Lesson1ThemePack): Record<string, string> {
  return getLesson1ThemeItemLabels(theme)
}

export function getThemeItemMotifs(theme: Lesson1ThemePack) {
  return getLesson1ThemeItemMotifs(getLesson1ThemeVisual(theme), theme.itemStyles, getLesson1ThemeItemLabels(theme))
}


export function lesson1ThemeStyle(theme: Lesson1ThemePack): CSSProperties {
  const visual = getLesson1ThemeVisual(theme)
  return {
    '--theme-screen-bg': visual.screenBackground,
    '--theme-panel-bg': visual.panelBackground,
    '--theme-border': visual.borderColor,
    '--theme-accent': visual.accentColor,
    '--theme-stage-bg': visual.stageBackground,
    '--theme-button-bg': visual.buttonBackground,
    '--theme-button-text': visual.buttonText,
    '--theme-button-border': visual.buttonBorder,
    '--theme-text': visual.textColor ?? visual.buttonText,
    '--theme-muted-text': visual.mutedTextColor ?? visual.hintText,
    '--theme-hint-bg': visual.hintBackground,
    '--theme-hint-text': visual.hintText,
    '--theme-success-bg': visual.successBackground,
    '--theme-success-text': visual.successText,
    '--theme-success-border': visual.successText,
    '--theme-error-bg': visual.errorBackground ?? '#fee2e2',
    '--theme-error-text': visual.errorText ?? '#991b1b',
    '--theme-error-border': visual.errorBorder ?? '#ef4444',
    '--theme-status-bg': visual.statusBackground ?? visual.hintBackground,
    '--theme-status-text': visual.statusText ?? visual.hintText,
    '--theme-status-border': visual.statusBorder ?? visual.buttonBorder,
    '--theme-warning-bg': visual.warningBackground ?? visual.hintBackground,
    '--theme-warning-text': visual.warningText ?? visual.hintText,
    '--theme-warning-border': visual.warningBorder ?? visual.buttonBorder,
    '--theme-selected-bg': visual.selectedBackground ?? visual.hintBackground,
    '--theme-selected-text': visual.selectedText ?? visual.accentColor,
    '--theme-selected-border': visual.selectedBorder ?? visual.accentColor,
    '--theme-selected-ring': visual.selectedRing ?? visual.motifSecondary,
    '--theme-disabled-bg': visual.disabledBackground ?? visual.panelBackground,
    '--theme-disabled-text': visual.disabledText ?? visual.hintText,
    '--theme-disabled-border': visual.disabledBorder ?? visual.borderColor,
    '--theme-input-bg': visual.inputBackground ?? visual.buttonBackground,
    '--theme-input-text': visual.inputText ?? visual.buttonText,
    '--theme-input-border': visual.inputBorder ?? visual.buttonBorder,
    '--theme-focus-ring': visual.focusRing ?? visual.motifSecondary,
    '--theme-overlay-bg': visual.overlayBackground ?? visual.stageBackground,
    '--theme-dialog-bg': visual.dialogBackground ?? visual.panelBackground,
    '--theme-diagram-bg': visual.diagramBackground ?? visual.panelBackground,
    '--theme-diagram-text': visual.diagramText ?? visual.buttonText,
    '--theme-diagram-connector': visual.diagramConnector ?? visual.accentColor,
    '--theme-equation-accent': visual.equationAccent ?? visual.accentColor,
    '--theme-spinner-rim': visual.spinnerRim ?? visual.accentColor,
    '--theme-spinner-pointer': visual.spinnerPointer ?? visual.motifSecondary,
    '--theme-spinner-hub-bg': visual.spinnerHubBackground ?? visual.buttonBackground,
    '--theme-spinner-hub-text': visual.spinnerHubText ?? visual.buttonText,
    '--theme-spinner-separator': visual.spinnerSeparator ?? visual.buttonBackground,
    '--theme-meter-track': visual.meterTrack ?? visual.borderColor,
    '--theme-neutral-bg': visual.neutralBackground ?? visual.buttonBackground,
    '--theme-neutral-text': visual.neutralText ?? visual.buttonText,
    '--theme-neutral-border': visual.neutralBorder ?? visual.borderColor,
  } as CSSProperties
}

export function getThemeMotif(theme: Lesson1ThemePack) {
  const visual = getLesson1ThemeVisual(theme)
  return {
    shape: visual.motifShape,
    primary: visual.motifPrimary,
    secondary: visual.motifSecondary,
  }
}
