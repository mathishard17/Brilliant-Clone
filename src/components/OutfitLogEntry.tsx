import { ColoredHeart } from './ColoredHeart'
import { getDressHeartColor, getOutfitLogEmoji } from '../data/closetStyles'
import type { OutfitPair, OutfitTriple } from '../types/lesson'

function DressHeart({ dressId }: { dressId: string }) {
  const color = getDressHeartColor(dressId)
  if (!color) return null
  return <ColoredHeart color={color} className="outfit-log__heart" />
}

function CrownIcon({ crownId }: { crownId: string }) {
  const emoji = getOutfitLogEmoji(crownId)
  return emoji ? <span aria-hidden="true">{emoji}</span> : null
}

function ShoeIcon({ shoeId }: { shoeId: string }) {
  const emoji = getOutfitLogEmoji(shoeId)
  return emoji ? <span aria-hidden="true">{emoji}</span> : null
}

export function OutfitLogPair({ outfit }: { outfit: OutfitPair }) {
  return (
    <span className="outfit-log__combo">
      <CrownIcon crownId={outfit.crownId} />
      <span className="outfit-log__plus" aria-hidden="true">
        +
      </span>
      <DressHeart dressId={outfit.dressId} />
    </span>
  )
}

export function OutfitLogTriple({ outfit }: { outfit: OutfitTriple }) {
  return (
    <span className="outfit-log__combo">
      <CrownIcon crownId={outfit.crownId} />
      <span className="outfit-log__plus" aria-hidden="true">
        +
      </span>
      <DressHeart dressId={outfit.dressId} />
      <span className="outfit-log__plus" aria-hidden="true">
        +
      </span>
      <ShoeIcon shoeId={outfit.shoeId} />
    </span>
  )
}
