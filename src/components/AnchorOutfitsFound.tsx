import { memo } from 'react'
import { getItemLabel } from '../lessons/lesson1/data'
import { OutfitLogPair } from './OutfitLogEntry'
import type { ThemeMotifShape } from '../themes/themeTypes'
import type { ClosetItemStyle } from '../data/closetStyles'

interface AnchorOutfitsFoundProps {
  crownId: string
  dressIds: string[]
  visibleCount?: number
  heading?: string
  itemLabels?: Record<string, string>
  itemMotifs?: Record<string, ClosetItemStyle | undefined>
  lookNamePlural?: string
  motifColor?: string
  motifShape?: ThemeMotifShape
}

export const AnchorOutfitsFound = memo(function AnchorOutfitsFound({
  crownId,
  dressIds,
  visibleCount,
  heading,
  itemLabels,
  itemMotifs,
  lookNamePlural = 'outfits',
  motifColor,
  motifShape,
}: AnchorOutfitsFoundProps) {
  const limit = visibleCount ?? dressIds.length
  const visibleDresses = dressIds.slice(0, limit)
  const total = dressIds.length

  if (limit === 0) return null

  const crownLabel = itemLabels?.[crownId] ?? getItemLabel('crowns', crownId)

  return (
    <div className="outfit-log anchor-outfits-found" role="status" aria-live="polite">
      <p className="outfit-log__heading">{heading ?? `${lookNamePlural} Found for ${crownLabel}:`}</p>
      <ul className="outfit-log__list">
        {visibleDresses.map((dressId) => (
          <li key={dressId}>
            <OutfitLogPair
              outfit={{ crownId, dressId }}
              itemLabels={itemLabels}
              itemMotifs={itemMotifs}
              motifColor={motifColor}
              motifShape={motifShape}
            />
          </li>
        ))}
      </ul>
      <p className="outfit-log__counter">
        Total Counted: <strong>{limit} / {total}</strong>
      </p>
    </div>
  )
})
