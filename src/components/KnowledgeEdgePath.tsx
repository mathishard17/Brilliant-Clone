import type { CSSProperties } from 'react'
import type { KnowledgeEdge, KnowledgeNode, NodeMasteryState } from '../types/knowledgeGraph'
import { getKnowledgeSchemaById } from '../types/knowledgeGraph'

interface KnowledgeEdgePathProps {
  edge: KnowledgeEdge
  from: KnowledgeNode
  to: KnowledgeNode
  fromState: NodeMasteryState
  toState: NodeMasteryState
  fromPosition?: { x: number; y: number }
  toPosition?: { x: number; y: number }
}

function calculateFrameVisibility(x: number, y: number) {
  const overflow = Math.max(0, -x, x - 100, -y, y - 100)
  return Math.max(0.14, 1 - overflow / 24)
}

export function KnowledgeEdgePath({
  edge,
  from,
  to,
  fromState,
  toState,
  fromPosition,
  toPosition,
}: KnowledgeEdgePathProps) {
  const bothMastered = fromState.status === 'mastered' && toState.status === 'mastered'
  const eitherInProgress = fromState.status === 'inProgress' || toState.status === 'inProgress'
  const isLit =
    edge.relationship === 'related' || edge.relationship === 'transfer'
      ? bothMastered || eitherInProgress
      : bothMastered
  const isComplete = bothMastered
  const edgeColor = from.schemaId === to.schemaId
    ? getKnowledgeSchemaById(from.schemaId).neonColor
    : '#f472b6'
  const edgeStyle = {
    '--edge-neon': edgeColor,
    '--edge-frame-visibility': Math.min(
      calculateFrameVisibility(fromPosition?.x ?? from.mapPosition.x, fromPosition?.y ?? from.mapPosition.y),
      calculateFrameVisibility(toPosition?.x ?? to.mapPosition.x, toPosition?.y ?? to.mapPosition.y),
    ),
  } as CSSProperties

  return (
    <line
      className={`knowledge-graph__edge knowledge-graph__edge--${edge.relationship}${isLit ? ' knowledge-graph__edge--lit' : ''}${isComplete ? ' knowledge-graph__edge--complete' : ''}`}
      style={edgeStyle}
      x1={fromPosition?.x ?? from.mapPosition.x}
      y1={fromPosition?.y ?? from.mapPosition.y}
      x2={toPosition?.x ?? to.mapPosition.x}
      y2={toPosition?.y ?? to.mapPosition.y}
      aria-hidden="true"
    />
  )
}
