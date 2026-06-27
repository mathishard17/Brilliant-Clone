import { memo } from 'react'
import { ColoredHeart } from './ColoredHeart'
import { AnchorOutfitsFound } from './AnchorOutfitsFound'
import {
  getClosetItemStyle,
  getDressHeartColor,
  getOutfitLogEmoji,
  type ClosetItemStyle,
} from '../data/closetStyles'
import { getItemLabel } from '../lessons/lesson1/data'
import type { ThemeMotifShape } from '../themes/themeTypes'

export type AnchorTree =
  | {
      variant: 'expanded'
      crownId: string
      dressIds: string[]
    }
  | {
      variant: 'summary'
      branches: Array<{ crownId: string; dressIds: string[] }>
    }

interface AnchorTreeDiagramProps {
  tree: AnchorTree
  visibleBranches?: number
  /** Expanded tree only — how many dress branches to show (syncs with dress cycle). */
  visibleDressCount?: number
  itemLabels?: Record<string, string>
  itemMotifs?: Record<string, ClosetItemStyle | undefined>
  lookNamePlural?: string
  motifColor?: string
  motifShape?: ThemeMotifShape
}

function CrownLabel({
  crownId,
  itemLabels,
  itemMotifs,
}: {
  crownId: string
  itemLabels?: Record<string, string>
  itemMotifs?: Record<string, ClosetItemStyle | undefined>
}) {
  const itemMotif = itemMotifs?.[crownId]
  const emoji = getOutfitLogEmoji(crownId)
  const label = itemLabels?.[crownId] ?? getItemLabel('crowns', crownId)
  return (
    <span className="anchor-tree__crown">
      {emoji ? (
        <span aria-hidden="true">{emoji} </span>
      ) : itemMotif?.heartColor ? (
        <ColoredHeart
          color={itemMotif.heartColor}
          shape={itemMotif.motifShape}
          className="anchor-tree__heart"
        />
      ) : (
        null
      )}
      {label}
    </span>
  )
}

function DressLabel({
  dressId,
  short = false,
  itemLabels,
  itemMotifs,
  motifColor,
  motifShape,
}: {
  dressId: string
  short?: boolean
  itemLabels?: Record<string, string>
  itemMotifs?: Record<string, ClosetItemStyle | undefined>
  motifColor?: string
  motifShape?: ThemeMotifShape
}) {
  const itemMotif = itemMotifs?.[dressId]
  const color = itemMotif?.heartColor ?? motifColor ?? getDressHeartColor(dressId)
  const shape = itemMotif?.motifShape ?? motifShape
  const label = itemLabels?.[dressId] ?? getClosetItemStyle(dressId).label
  const text = short ? label.replace(/ (Ballgown|Dress|Gown)$/, '') : label

  return (
    <span className="anchor-tree__dress">
      {color && <ColoredHeart color={color} shape={shape} className="anchor-tree__heart" />}
      {text}
    </span>
  )
}

function DressList({
  dressIds,
  short = false,
  itemLabels,
  itemMotifs,
  motifColor,
  motifShape,
}: {
  dressIds: string[]
  short?: boolean
  itemLabels?: Record<string, string>
  itemMotifs?: Record<string, ClosetItemStyle | undefined>
  motifColor?: string
  motifShape?: ThemeMotifShape
}) {
  return (
    <span className="anchor-tree__dress-list">
      {dressIds.map((dressId, index) => (
        <span key={dressId}>
          {index > 0 && ', '}
          <DressLabel
            dressId={dressId}
            short={short}
            itemLabels={itemLabels}
            itemMotifs={itemMotifs}
            motifColor={motifColor}
            motifShape={motifShape}
          />
        </span>
      ))}
    </span>
  )
}

export const AnchorTreeDiagram = memo(function AnchorTreeDiagram({
  tree,
  visibleBranches,
  visibleDressCount,
  itemLabels,
  itemMotifs,
  lookNamePlural,
  motifColor,
  motifShape,
}: AnchorTreeDiagramProps) {
  if (tree.variant === 'expanded') {
    return (
      <AnchorOutfitsFound
        crownId={tree.crownId}
        dressIds={tree.dressIds}
        visibleCount={visibleDressCount}
        itemLabels={itemLabels}
        itemMotifs={itemMotifs}
        lookNamePlural={lookNamePlural}
        motifColor={motifColor}
        motifShape={motifShape}
      />
    )
  }

  const branches = tree.branches.slice(0, visibleBranches ?? tree.branches.length)

  return (
    <div className="anchor-tree" role="img" aria-label="Combination tree diagram">
      {branches.map((branch) => (
        <div key={branch.crownId} className="anchor-tree__line">
          <CrownLabel
            crownId={branch.crownId}
            itemLabels={itemLabels}
            itemMotifs={itemMotifs}
          />
          <span className="anchor-tree__connector" aria-hidden="true">
            {' '}
            ───{' '}
          </span>
          <DressList
            dressIds={branch.dressIds}
            short
            itemLabels={itemLabels}
            itemMotifs={itemMotifs}
            motifColor={motifColor}
            motifShape={motifShape}
          />
          <span className="anchor-tree__count"> ({branch.dressIds.length})</span>
        </div>
      ))}
    </div>
  )
})
