import { memo } from 'react'
import type { OutfitPair, OutfitTriple } from '../types/lesson'
import { makeOutfitPairKey, makeOutfitTripleKey } from '../utils/outfitKeys'
import { LessonButton } from './LessonButton'
import { OutfitLogPair, OutfitLogTriple } from './OutfitLogEntry'
import type { ThemeMotifShape } from '../themes/themeTypes'
import type { ClosetItemStyle } from '../data/closetStyles'

type OutfitLogOutfit = OutfitPair | OutfitTriple

interface OutfitLogProps {
  outfits: OutfitLogOutfit[]
  total: number
  mode: 'pair' | 'triple'
  onReset?: () => void
  heading?: string
  emptyMessage?: string
  counterLabel?: string
  itemLabels?: Record<string, string>
  itemMotifs?: Record<string, ClosetItemStyle | undefined>
  motifColor?: string
  motifShape?: ThemeMotifShape
}

export const OutfitLog = memo(function OutfitLog({
  outfits,
  total,
  mode,
  onReset,
  heading = 'Unique Princess Looks Found:',
  emptyMessage = 'Try tapping items in the closet!',
  counterLabel = 'Total Unique Found',
  itemLabels,
  itemMotifs,
  motifColor,
  motifShape,
}: OutfitLogProps) {
  return (
    <div className="outfit-log" role="status" aria-live="polite">
      <div className="outfit-log__header">
        <p className="outfit-log__heading">{heading}</p>
        {onReset && (
          <LessonButton label="Reset" variant="secondary" onClick={onReset} />
        )}
      </div>
      {outfits.length === 0 ? (
        <p className="outfit-log__empty">{emptyMessage}</p>
      ) : (
        <ul className="outfit-log__list">
          {outfits.map((outfit) => (
            <li key={mode === 'pair' ? makeOutfitPairKey((outfit as OutfitPair).crownId, (outfit as OutfitPair).dressId) : makeOutfitTripleKey((outfit as OutfitTriple).crownId, (outfit as OutfitTriple).dressId, (outfit as OutfitTriple).shoeId)}>
              {mode === 'pair' ? (
                <OutfitLogPair
                  outfit={outfit as OutfitPair}
                  itemLabels={itemLabels}
                  itemMotifs={itemMotifs}
                  motifColor={motifColor}
                  motifShape={motifShape}
                />
              ) : (
                <OutfitLogTriple
                  outfit={outfit as OutfitTriple}
                  itemLabels={itemLabels}
                  itemMotifs={itemMotifs}
                  motifColor={motifColor}
                  motifShape={motifShape}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="outfit-log__counter">
        {counterLabel}: <strong>{total}</strong>
      </p>
    </div>
  )
})
