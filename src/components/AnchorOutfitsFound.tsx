import { memo } from 'react'
import { getItemLabel } from '../lessons/lesson1/data'
import { OutfitLogPair } from './OutfitLogEntry'

interface AnchorOutfitsFoundProps {
  crownId: string
  dressIds: string[]
  visibleCount?: number
  heading?: string
}

export const AnchorOutfitsFound = memo(function AnchorOutfitsFound({
  crownId,
  dressIds,
  visibleCount,
  heading,
}: AnchorOutfitsFoundProps) {
  const limit = visibleCount ?? dressIds.length
  const visibleDresses = dressIds.slice(0, limit)
  const total = dressIds.length

  if (limit === 0) return null

  const crownLabel = getItemLabel('crowns', crownId)

  return (
    <div className="outfit-log anchor-outfits-found" role="status" aria-live="polite">
      <p className="outfit-log__heading">{heading ?? `Outfits Found for ${crownLabel}:`}</p>
      <ul className="outfit-log__list">
        {visibleDresses.map((dressId) => (
          <li key={dressId}>
            <OutfitLogPair outfit={{ crownId, dressId }} />
          </li>
        ))}
      </ul>
      <p className="outfit-log__counter">
        Total Counted: <strong>{limit} / {total}</strong>
      </p>
    </div>
  )
})
