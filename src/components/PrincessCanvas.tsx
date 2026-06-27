import { memo } from 'react'
import {
  CROWN_FILL_COLORS,
  SHOE_FILL_COLORS,
  type ClosetItemStyle,
} from '../data/closetStyles'
import { resolveCharacterAppearance, type CharacterAppearance } from '../data/characterAppearance'
import { getCrownStyle, getDressColor, getShoeStyle } from '../data/dressColors'
import type { ThemeCharacterConfig } from '../themes/themeTypes'
import { WardrobeLayerComposer } from './wardrobe/WardrobeLayerComposer'

interface PrincessCanvasProps {
  crownId?: string | null
  dressId?: string | null
  shoeId?: string | null
  showLock?: boolean
  variant?: 'princess' | 'astronaut'
  characterConfig?: ThemeCharacterConfig
  itemStyles?: Record<string, ClosetItemStyle | undefined>
  appearance?: Partial<CharacterAppearance> | null
}

const OUTLINE = '#334155'

function defaultCharacterConfig(variant: 'princess' | 'astronaut'): ThemeCharacterConfig {
  if (variant === 'astronaut') {
    return {
      base: 'astronaut',
      head: 'helmet',
      torso: 'spaceSuit',
      feet: 'boots',
      stage: 'space',
      assetPack: 'space',
    }
  }

  return {
    base: 'human',
    head: 'hair',
    torso: 'dress',
    feet: 'slippers',
    stage: 'royal',
    assetPack: 'royal',
  }
}

export const PrincessCanvas = memo(function PrincessCanvas({
  crownId = null,
  dressId = null,
  shoeId = null,
  showLock = false,
  variant = 'princess',
  characterConfig,
  itemStyles,
  appearance,
}: PrincessCanvasProps) {
  const config = characterConfig ?? defaultCharacterConfig(variant)
  const resolvedAppearance = resolveCharacterAppearance(appearance)
  const crownStyle = getCrownStyle(crownId)
  const shoeStyle = getShoeStyle(shoeId)
  const dressStyle = itemStyles?.[dressId ?? '']
  const crownStyleTokens = itemStyles?.[crownId ?? '']
  const shoeStyleTokens = itemStyles?.[shoeId ?? '']
  const dressColor = dressStyle?.heartColor ?? getDressColor(dressId)
  const crownColor = crownStyleTokens?.heartColor ?? (crownStyle ? CROWN_FILL_COLORS[crownStyle] : '#facc15')
  const shoeColor = shoeStyleTokens?.heartColor ?? (shoeStyle ? SHOE_FILL_COLORS[shoeStyle].main : '#ffffff')
  const ariaLabel = `${config.base === 'mascot' ? 'mascot' : config.base} character`

  return (
    <WardrobeLayerComposer
      ariaLabel={ariaLabel}
      crownId={crownId}
      dressId={dressId}
      shoeId={shoeId}
      showLock={showLock}
      config={config}
      appearance={resolvedAppearance}
      colors={{
        crown: crownColor,
        dress: dressColor,
        shoe: shoeColor,
        accent: crownStyleTokens?.border ?? dressStyle?.border ?? crownColor,
        skin: resolvedAppearance.skinColor,
        hair: resolvedAppearance.hairColor,
        outline: OUTLINE,
      }}
    />
  )
})
