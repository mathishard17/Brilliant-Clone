import type { CSSProperties } from 'react'
import { getKnowledgeSchemaById, type KnowledgeNode, type NodeMasteryState } from '../types/knowledgeGraph'

interface KnowledgeNodeCardProps {
  node: KnowledgeNode
  state: NodeMasteryState
  title: string
  emoji: string
  isSelected: boolean
  isRecommended?: boolean
  projectedPosition?: { x: number; y: number; scale: number; z: number }
  onSelect: () => void
}

const STATUS_LABELS: Record<NodeMasteryState['status'], string> = {
  locked: 'Locked',
  available: 'Available',
  inProgress: 'In progress',
  completed: 'Completed',
  mastered: 'Mastered',
}

function calculateFrameVisibility(x: number, y: number) {
  const overflow = Math.max(0, -x, x - 100, -y, y - 100)
  return Math.max(0.16, 1 - overflow / 24)
}

export function KnowledgeNodeCard({
  node,
  state,
  title,
  emoji,
  isSelected,
  isRecommended = false,
  projectedPosition,
  onSelect,
}: KnowledgeNodeCardProps) {
  const nodeScale = projectedPosition?.scale ?? 1
  const tooltipScale = 1 / nodeScale
  const frameVisibility = projectedPosition
    ? calculateFrameVisibility(projectedPosition.x, projectedPosition.y)
    : 1
  const cardStyle = {
    '--node-x': `${projectedPosition?.x ?? node.mapPosition.x}%`,
    '--node-y': `${projectedPosition?.y ?? node.mapPosition.y}%`,
    '--node-progress': `${Math.round(state.progressRatio * 100)}%`,
    '--node-neon': getKnowledgeSchemaById(node.schemaId).neonColor,
    '--node-scale': nodeScale,
    '--node-tooltip-rest-scale': tooltipScale * 0.96,
    '--node-tooltip-active-scale': tooltipScale,
    '--node-frame-visibility': frameVisibility,
    '--node-z-index': Math.round(40 + (projectedPosition?.z ?? 0)),
  } as CSSProperties
  const statusLabel = STATUS_LABELS[state.status]

  return (
    <button
      type="button"
      className={`knowledge-node knowledge-node--${state.status}${isSelected ? ' knowledge-node--selected' : ''}${isRecommended ? ' knowledge-node--recommended' : ''}`}
      style={cardStyle}
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`${node.label}. ${statusLabel}. ${node.description}`}
    >
      <span className="knowledge-node__orb" aria-hidden="true">
        {emoji}
      </span>
      <span className="knowledge-node__tooltip" aria-hidden="true">
        <span className="knowledge-node__tooltip-title">{node.label}</span>
        <span className="knowledge-node__tooltip-status">{statusLabel}</span>
        <span className="knowledge-node__tooltip-copy">{node.skill}</span>
        <span className="knowledge-node__tooltip-lesson">{title}</span>
      </span>
      {state.contextsTried.length > 0 && (
        <span className="knowledge-node__badges" aria-label={`Context tried: ${state.contextsTried.join(', ')}`}>
          <span className="knowledge-node__badge" aria-hidden="true">
            {emoji}
          </span>
        </span>
      )}
      <span className="sr-only">{title}</span>
    </button>
  )
}
