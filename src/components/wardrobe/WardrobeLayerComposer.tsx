import { WARDROBE_ASSET_PACKS } from './layerAssets'
import type { WardrobeColors, WardrobeRenderContext, WardrobeSelection } from './types'
import type { CharacterAppearance } from '../../data/characterAppearance'
import type { ThemeCharacterConfig } from '../../themes/themeTypes'

interface WardrobeLayerComposerProps extends WardrobeSelection {
  ariaLabel: string
  config: ThemeCharacterConfig
  colors: WardrobeColors
  appearance: CharacterAppearance
  showLock?: boolean
}

const SLOT_ORDER = [
  'backdrop',
  'shadow',
  'hairBack',
  'legs',
  'arms',
  'torso',
  'body',
  'head',
  'headAccessory',
  'feet',
  'foreground',
] as const

function resolveAssetPackId(config: ThemeCharacterConfig) {
  return config.assetPack ?? config.stage
}

export function WardrobeLayerComposer({
  ariaLabel,
  crownId = null,
  dressId = null,
  shoeId = null,
  config,
  colors,
  appearance,
  showLock = false,
}: WardrobeLayerComposerProps) {
  const pack = WARDROBE_ASSET_PACKS[resolveAssetPackId(config)] ?? WARDROBE_ASSET_PACKS.royal
  const context: WardrobeRenderContext = {
    crownId,
    dressId,
    shoeId,
    config,
    colors,
    appearance,
    hasDress: Boolean(dressId),
  }

  const layers = [...pack.layers].sort((first, second) => (
    SLOT_ORDER.indexOf(first.slot) - SLOT_ORDER.indexOf(second.slot)
  ))

  return (
    <div
      className={`princess-canvas princess-canvas--layered princess-canvas--${config.stage} ${pack.className}`}
      aria-label={ariaLabel}
    >
      <div className="princess-canvas__stage">
        <svg className="princess-canvas__figure" viewBox="0 0 200 260" role="img" aria-label={ariaLabel}>
          {layers.map((layer) => (
            <g key={layer.key} data-wardrobe-slot={layer.slot}>
              {layer.render(context)}
            </g>
          ))}
        </svg>
        {showLock && (
          <span className="princess-canvas__lock" aria-hidden="true">
            🔒
          </span>
        )}
      </div>
    </div>
  )
}
