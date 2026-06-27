import { CharacterAppearancePicker } from './CharacterAppearancePicker'
import { resolveCharacterAppearance } from '../data/characterAppearance'
import { useLesson } from '../hooks/useLesson'
import { getLesson1ThemeVisual, resolveLesson1Theme } from '../themes/themeResolver'

interface Lesson1CharacterSetupProps {
  compact?: boolean
}

export function Lesson1CharacterSetup({ compact = false }: Lesson1CharacterSetupProps) {
  const { profile, updateAppearance } = useLesson()
  const theme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const visual = getLesson1ThemeVisual(theme)
  const appearance = resolveCharacterAppearance(profile.appearance)
  const showHair = visual.characterConfig?.head !== 'helmet'

  return (
    <CharacterAppearancePicker
      appearance={appearance}
      showHair={showHair}
      compact={compact}
      onChange={(next) => void updateAppearance(next)}
    />
  )
}
