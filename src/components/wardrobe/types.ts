import type { ReactNode } from 'react'
import type { CharacterAppearance } from '../../data/characterAppearance'
import type { ThemeCharacterConfig, WardrobeAssetPackId } from '../../themes/themeTypes'

export type WardrobeSlot =
  | 'backdrop'
  | 'shadow'
  | 'hairBack'
  | 'legs'
  | 'body'
  | 'arms'
  | 'torso'
  | 'head'
  | 'headAccessory'
  | 'feet'
  | 'foreground'

export interface WardrobeColors {
  crown: string
  dress: string
  shoe: string
  accent: string
  skin: string
  hair: string
  outline: string
}

export interface WardrobeSelection {
  crownId?: string | null
  dressId?: string | null
  shoeId?: string | null
}

export interface WardrobeRenderContext extends WardrobeSelection {
  config: ThemeCharacterConfig
  colors: WardrobeColors
  appearance: CharacterAppearance
  hasDress: boolean
}

export interface WardrobeLayer {
  slot: WardrobeSlot
  key: string
  render: (context: WardrobeRenderContext) => ReactNode
}

export interface WardrobeAssetPack {
  id: WardrobeAssetPackId
  label: string
  className: string
  layers: WardrobeLayer[]
}
