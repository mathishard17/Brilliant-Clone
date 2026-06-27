import { LESSON_1_ID } from '../types/lesson'
import { DEFAULT_LESSON_1_THEMES, ROYAL_LESSON_1_THEME } from '../themes/defaultThemes'
import type { Lesson1ThemePack, ThemePreference } from '../themes/themeTypes'
import {
  getLesson1ThemeValidationIssues,
  isValidLesson1ThemePack,
  normalizeLesson1ThemePack,
} from '../themes/themeValidation'
import { postAiEndpoint } from './aiBackend'

export interface Lesson1ThemeGenerationResult {
  themePack: Lesson1ThemePack
  source: 'generated' | 'fallback'
  debugError?: string
}

interface GenerateCustomThemeRequest {
  preference: ThemePreference
  themeIdea?: string
  baseThemePack: Lesson1ThemePack
}

interface GenerateCustomThemeResponse {
  themePack: unknown
  source: 'generated' | 'fallback'
  debugError?: string
}

export async function generateLesson1ThemePack(
  preference: ThemePreference,
  customIdea = '',
): Promise<Lesson1ThemeGenerationResult> {
  const fallback = DEFAULT_LESSON_1_THEMES[preference] ?? ROYAL_LESSON_1_THEME

  try {
    const result = await postAiEndpoint<GenerateCustomThemeRequest, GenerateCustomThemeResponse>('/api/generate-custom-theme', {
      preference,
      themeIdea: customIdea,
      baseThemePack: fallback,
    })
    const themePack = normalizeLesson1ThemePack(result.themePack, fallback)
    if (isValidLesson1ThemePack(themePack)) {
      return {
        themePack,
        source: result.source === 'generated' ? 'generated' : 'fallback',
        debugError: result.debugError,
      }
    }
    return {
      themePack: fallback,
      source: 'fallback',
      debugError: result.debugError ?? `Theme API response failed client validation: ${getLesson1ThemeValidationIssues(themePack).join('; ')}`,
    }
  } catch (error) {
    return {
      themePack: fallback,
      source: 'fallback',
      debugError: error instanceof Error ? error.message : 'Unknown theme request error.',
    }
  }
}

export function lesson1ThemeCacheKey() {
  return LESSON_1_ID
}
