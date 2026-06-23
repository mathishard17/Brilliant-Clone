import { memo } from 'react'
import { ColoredHeart } from './ColoredHeart'
import { AnchorOutfitsFound } from './AnchorOutfitsFound'
import { getClosetItemStyle, getDressHeartColor, getOutfitLogEmoji } from '../data/closetStyles'
import { getItemLabel } from '../data/lesson1'

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
}

function CrownLabel({ crownId }: { crownId: string }) {
  const emoji = getOutfitLogEmoji(crownId)
  const label = getItemLabel('crowns', crownId)
  return (
    <span className="anchor-tree__crown">
      {emoji && <span aria-hidden="true">{emoji} </span>}
      {label}
    </span>
  )
}

function DressLabel({ dressId, short = false }: { dressId: string; short?: boolean }) {
  const color = getDressHeartColor(dressId)
  const label = getClosetItemStyle(dressId).label
  const text = short ? label.replace(/ (Ballgown|Dress|Gown)$/, '') : label

  return (
    <span className="anchor-tree__dress">
      {color && <ColoredHeart color={color} className="anchor-tree__heart" />}
      {text}
    </span>
  )
}

function DressList({ dressIds, short = false }: { dressIds: string[]; short?: boolean }) {
  return (
    <span className="anchor-tree__dress-list">
      {dressIds.map((dressId, index) => (
        <span key={dressId}>
          {index > 0 && ', '}
          <DressLabel dressId={dressId} short={short} />
        </span>
      ))}
    </span>
  )
}

export const AnchorTreeDiagram = memo(function AnchorTreeDiagram({
  tree,
  visibleBranches,
  visibleDressCount,
}: AnchorTreeDiagramProps) {
  if (tree.variant === 'expanded') {
    return (
      <AnchorOutfitsFound
        crownId={tree.crownId}
        dressIds={tree.dressIds}
        visibleCount={visibleDressCount}
      />
    )
  }

  const branches = tree.branches.slice(0, visibleBranches ?? tree.branches.length)

  return (
    <div className="anchor-tree" role="img" aria-label="Combination tree diagram">
      {branches.map((branch) => (
        <div key={branch.crownId} className="anchor-tree__line">
          <CrownLabel crownId={branch.crownId} />
          <span className="anchor-tree__connector" aria-hidden="true">
            {' '}
            ───{' '}
          </span>
          <DressList dressIds={branch.dressIds} short />
          <span className="anchor-tree__count"> ({branch.dressIds.length})</span>
        </div>
      ))}
    </div>
  )
})
