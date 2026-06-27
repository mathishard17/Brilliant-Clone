import type { ThemePreference } from '../themes/themeTypes'
import type { ThemeVoiceProfile } from './voiceTypes'

const CARTESIA_PROVIDER = 'cartesia' as const

const DEFAULT_VOICE_THEME: ThemePreference = 'royal'

const THEME_VOICE_PROFILES: Record<ThemePreference, ThemeVoiceProfile> = {
  royal: {
    themePreference: 'royal',
    provider: CARTESIA_PROVIDER,
    voiceKey: 'royal-storyteller',
    style: 'storyteller',
    pace: 'bright',
    pitch: 'medium',
  },
  space: {
    themePreference: 'space',
    provider: CARTESIA_PROVIDER,
    voiceKey: 'space-mission-guide',
    style: 'mission',
    pace: 'bright',
    pitch: 'medium',
  },
  dinosaurs: {
    themePreference: 'dinosaurs',
    provider: CARTESIA_PROVIDER,
    voiceKey: 'dinosaur-field-guide',
    style: 'fieldGuide',
    pace: 'medium',
    pitch: 'medium',
  },
  animals: {
    themePreference: 'animals',
    provider: CARTESIA_PROVIDER,
    voiceKey: 'animal-rescue-helper',
    style: 'helper',
    pace: 'calm',
    pitch: 'medium',
  },
  sports: {
    themePreference: 'sports',
    provider: CARTESIA_PROVIDER,
    voiceKey: 'sports-coach',
    style: 'coach',
    pace: 'bright',
    pitch: 'medium',
  },
  surprise: {
    themePreference: 'surprise',
    provider: CARTESIA_PROVIDER,
    voiceKey: 'surprise-studio-host',
    style: 'studio',
    pace: 'bright',
    pitch: 'high',
  },
}

export function getThemeVoiceProfile(themePreference: ThemePreference): ThemeVoiceProfile {
  return THEME_VOICE_PROFILES[themePreference] ?? THEME_VOICE_PROFILES[DEFAULT_VOICE_THEME]
}
