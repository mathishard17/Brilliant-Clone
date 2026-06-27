import { ColoredHeart } from './ColoredHeart'
import { getClosetItemStyle, getDressHeartColor, getOutfitLogEmoji, type ClosetItemStyle } from '../data/closetStyles'
import type { OutfitPair, OutfitTriple } from '../types/lesson'
import type { ThemeMotifShape } from '../themes/themeTypes'

type ItemMotifMap = Record<string, ClosetItemStyle | undefined>

function ItemSymbol({
  itemId,
  fallbackEmoji,
  fallbackColor,
  fallbackShape,
  itemMotifs,
}: {
  itemId: string
  fallbackEmoji?: string | null
  fallbackColor?: string | null
  fallbackShape?: ClosetItemStyle['motifShape']
  itemMotifs?: ItemMotifMap
}) {
  const motif = itemMotifs?.[itemId]
  const color = motif?.heartColor ?? motif?.border ?? fallbackColor
  const shape = motif?.motifShape ?? fallbackShape
  if (color) {
    return <ColoredHeart color={color} shape={shape} className="outfit-log__heart" />
  }
  if (fallbackEmoji) return <span aria-hidden="true">{fallbackEmoji}</span>
  return null
}

function DressSymbol({ dressId, itemMotifs }: { dressId: string; itemMotifs?: ItemMotifMap }) {
  const base = getClosetItemStyle(dressId)
  return (
    <ItemSymbol
      itemId={dressId}
      fallbackColor={getDressHeartColor(dressId)}
      fallbackShape={base.motifShape ?? 'heart'}
      itemMotifs={itemMotifs}
    />
  )
}

function CrownSymbol({ crownId, itemMotifs }: { crownId: string; itemMotifs?: ItemMotifMap }) {
  const base = getClosetItemStyle(crownId)
  return (
    <ItemSymbol
      itemId={crownId}
      fallbackEmoji={getOutfitLogEmoji(crownId)}
      fallbackColor={base.heartColor ?? base.border}
      fallbackShape={base.motifShape ?? 'star'}
      itemMotifs={itemMotifs}
    />
  )
}

function ShoeSymbol({ shoeId, itemMotifs }: { shoeId: string; itemMotifs?: ItemMotifMap }) {
  const base = getClosetItemStyle(shoeId)
  return (
    <ItemSymbol
      itemId={shoeId}
      fallbackEmoji={getOutfitLogEmoji(shoeId)}
      fallbackColor={base.heartColor ?? base.border}
      fallbackShape={base.motifShape ?? 'circle'}
      itemMotifs={itemMotifs}
    />
  )
}

function LegacyDressHeart({
  dressId,
  motifColor,
  motifShape,
}: {
  dressId: string
  motifColor?: string
  motifShape?: ThemeMotifShape
}) {
  const color = motifColor ?? getDressHeartColor(dressId)
  if (!color) return null
  return <ColoredHeart color={color} shape={motifShape} className="outfit-log__heart" />
}

interface OutfitLogEntryProps<T> {
  outfit: T
  itemLabels?: Record<string, string>
  itemMotifs?: ItemMotifMap
  motifColor?: string
  motifShape?: ThemeMotifShape
}

export function OutfitLogPair({
  outfit,
  itemLabels,
  itemMotifs,
  motifColor,
  motifShape,
}: OutfitLogEntryProps<OutfitPair>) {
  return (
    <span className="outfit-log__combo">
      <CrownSymbol crownId={outfit.crownId} itemMotifs={itemMotifs} />
      <span className="sr-only">{itemLabels?.[outfit.crownId] ?? outfit.crownId}</span>
      <span className="outfit-log__plus" aria-hidden="true">
        +
      </span>
      {itemMotifs ? (
        <DressSymbol dressId={outfit.dressId} itemMotifs={itemMotifs} />
      ) : (
        <LegacyDressHeart dressId={outfit.dressId} motifColor={motifColor} motifShape={motifShape} />
      )}
      <span className="sr-only">{itemLabels?.[outfit.dressId] ?? outfit.dressId}</span>
    </span>
  )
}

export function OutfitLogTriple({
  outfit,
  itemLabels,
  itemMotifs,
  motifColor,
  motifShape,
}: OutfitLogEntryProps<OutfitTriple>) {
  return (
    <span className="outfit-log__combo">
      <CrownSymbol crownId={outfit.crownId} itemMotifs={itemMotifs} />
      <span className="sr-only">{itemLabels?.[outfit.crownId] ?? outfit.crownId}</span>
      <span className="outfit-log__plus" aria-hidden="true">
        +
      </span>
      {itemMotifs ? (
        <DressSymbol dressId={outfit.dressId} itemMotifs={itemMotifs} />
      ) : (
        <LegacyDressHeart dressId={outfit.dressId} motifColor={motifColor} motifShape={motifShape} />
      )}
      <span className="sr-only">{itemLabels?.[outfit.dressId] ?? outfit.dressId}</span>
      <span className="outfit-log__plus" aria-hidden="true">
        +
      </span>
      <ShoeSymbol shoeId={outfit.shoeId} itemMotifs={itemMotifs} />
      <span className="sr-only">{itemLabels?.[outfit.shoeId] ?? outfit.shoeId}</span>
    </span>
  )
}
