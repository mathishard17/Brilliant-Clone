import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'
import { LESSON_1_ID } from '../types/lesson'
import { DEFAULT_LESSON_1_THEMES, ROYAL_LESSON_1_THEME } from '../themes/defaultThemes'
import type { Lesson1ThemePack, ThemePreference } from '../themes/themeTypes'
import { isValidLesson1ThemePack } from '../themes/themeValidation'

export interface Lesson1ThemeGenerationResult {
  themePack: Lesson1ThemePack
  source: 'generated' | 'fallback'
}

interface GenerateCustomThemeRequest {
  preference: ThemePreference
  themeIdea?: string
}

interface GenerateCustomThemeResponse {
  themePack: Lesson1ThemePack
  source: 'generated' | 'fallback'
}

const generateCustomThemeCallable = httpsCallable<
  GenerateCustomThemeRequest,
  GenerateCustomThemeResponse
>(functions, 'generateCustomTheme')

export async function generateLesson1ThemePack(
  preference: ThemePreference,
  customIdea = '',
): Promise<Lesson1ThemeGenerationResult> {
  const fallback = DEFAULT_LESSON_1_THEMES[preference] ?? ROYAL_LESSON_1_THEME

  try {
    const result = await generateCustomThemeCallable({
      preference,
      themeIdea: customIdea,
    })
    if (isValidLesson1ThemePack(result.data.themePack)) {
      return {
        themePack: result.data.themePack,
        source: result.data.source === 'generated' ? 'generated' : 'fallback',
      }
    }
  } catch {
    // AI personalization is optional; fall back silently so lessons never block.
  }

  return { themePack: fallback, source: 'fallback' }
}

export function lesson1ThemeCacheKey() {
  return LESSON_1_ID
}
