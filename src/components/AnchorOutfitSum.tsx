import { memo } from 'react'
import { getOutfitLogEmoji } from '../data/closetStyles'
import { getItemLabel } from '../lessons/lesson1/data'

const GOLD_TIARA_OUTFITS = 3
const DIAMOND_CROWN_OUTFITS = 3

interface AnchorOutfitSumProps {
  goldTiaraCount?: number
  diamondCrownCount?: number
  itemLabels?: Record<string, string>
  itemIcons?: Record<string, string | null>
  lookNamePlural?: string
}

export const AnchorOutfitSum = memo(function AnchorOutfitSum({
  goldTiaraCount = GOLD_TIARA_OUTFITS,
  diamondCrownCount = DIAMOND_CROWN_OUTFITS,
  itemLabels,
  itemIcons,
  lookNamePlural = 'princess styles',
}: AnchorOutfitSumProps) {
  const total = goldTiaraCount + diamondCrownCount
  const goldEmoji = itemIcons?.['gold-tiara'] ?? getOutfitLogEmoji('gold-tiara')
  const diamondEmoji = itemIcons?.['diamond-crown'] ?? getOutfitLogEmoji('diamond-crown')
  const goldLabel = itemLabels?.['gold-tiara'] ?? getItemLabel('crowns', 'gold-tiara')
  const diamondLabel = itemLabels?.['diamond-crown'] ?? getItemLabel('crowns', 'diamond-crown')

  return (
    <div className="outfit-log anchor-outfit-sum" role="img" aria-label={`${goldTiaraCount} plus ${diamondCrownCount} equals ${total} total ${lookNamePlural}`}>
      <p className="outfit-log__heading">Add them together:</p>

      <div className="anchor-outfit-sum__row">
        <div className="anchor-outfit-sum__group">
          <span className="anchor-outfit-sum__label">
            {goldEmoji && <span aria-hidden="true">{goldEmoji} </span>}
            {goldLabel}
          </span>
          <span className="anchor-outfit-sum__count">{goldTiaraCount} {lookNamePlural}</span>
        </div>

        <span className="anchor-outfit-sum__operator" aria-hidden="true">
          +
        </span>

        <div className="anchor-outfit-sum__group">
          <span className="anchor-outfit-sum__label">
            {diamondEmoji && <span aria-hidden="true">{diamondEmoji} </span>}
            {diamondLabel}
          </span>
          <span className="anchor-outfit-sum__count">{diamondCrownCount} {lookNamePlural}</span>
        </div>
      </div>

      <div className="anchor-outfit-sum__equation" aria-hidden="true">
        <span className="anchor-outfit-sum__number">{goldTiaraCount}</span>
        <span className="anchor-outfit-sum__operator">+</span>
        <span className="anchor-outfit-sum__number">{diamondCrownCount}</span>
        <span className="anchor-outfit-sum__operator">=</span>
        <span className="anchor-outfit-sum__total">{total}</span>
      </div>

      <p className="outfit-log__counter">
        <strong>{total} total {lookNamePlural}</strong>
      </p>
    </div>
  )
})
