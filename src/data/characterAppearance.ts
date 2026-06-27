export interface CharacterAppearance {
  hairColor: string
  hairStyle: HairStyleId
  skinColor: string
}

export interface AppearanceOption {
  id: string
  label: string
  color: string
}

export type HairStyleId = 'long' | 'bob' | 'buns' | 'short' | 'bald'

export interface HairStyleOption {
  id: HairStyleId
  label: string
}

export const DEFAULT_CHARACTER_APPEARANCE: CharacterAppearance = {
  hairColor: '#fde047',
  hairStyle: 'long',
  skinColor: '#fde8d8',
}

export const HAIR_COLOR_OPTIONS: AppearanceOption[] = [
  { id: 'golden', label: 'Golden', color: '#fde047' },
  { id: 'brown', label: 'Brown', color: '#92400e' },
  { id: 'black', label: 'Black', color: '#1f2937' },
  { id: 'auburn', label: 'Auburn', color: '#ea580c' },
  { id: 'rose', label: 'Rose', color: '#f472b6' },
]

export const SKIN_COLOR_OPTIONS: AppearanceOption[] = [
  { id: 'peach', label: 'Peach', color: '#fde8d8' },
  { id: 'warm', label: 'Warm', color: '#f5d0b5' },
  { id: 'tan', label: 'Tan', color: '#d4a574' },
  { id: 'deep', label: 'Deep', color: '#8d5524' },
  { id: 'light', label: 'Light', color: '#fff1e6' },
]

export const HAIR_STYLE_OPTIONS: HairStyleOption[] = [
  { id: 'long', label: 'Long' },
  { id: 'bob', label: 'Bob' },
  { id: 'buns', label: 'Buns' },
  { id: 'short', label: 'Short' },
  { id: 'bald', label: 'Bald' },
]

function parseHairStyle(value: unknown): HairStyleId {
  return HAIR_STYLE_OPTIONS.some((option) => option.id === value)
    ? value as HairStyleId
    : DEFAULT_CHARACTER_APPEARANCE.hairStyle
}

export function resolveCharacterAppearance(
  appearance?: Partial<CharacterAppearance> | null,
): CharacterAppearance {
  return {
    hairColor: appearance?.hairColor ?? DEFAULT_CHARACTER_APPEARANCE.hairColor,
    hairStyle: parseHairStyle(appearance?.hairStyle),
    skinColor: appearance?.skinColor ?? DEFAULT_CHARACTER_APPEARANCE.skinColor,
  }
}

export function parseCharacterAppearance(value: unknown): CharacterAppearance {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return DEFAULT_CHARACTER_APPEARANCE
  }
  const record = value as Record<string, unknown>
  const hairColor = typeof record.hairColor === 'string' ? record.hairColor : DEFAULT_CHARACTER_APPEARANCE.hairColor
  const hairStyle = parseHairStyle(record.hairStyle)
  const skinColor = typeof record.skinColor === 'string' ? record.skinColor : DEFAULT_CHARACTER_APPEARANCE.skinColor
  return { hairColor, hairStyle, skinColor }
}
