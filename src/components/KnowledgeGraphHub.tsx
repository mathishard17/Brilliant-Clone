import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type WheelEvent } from 'react'
import { KnowledgeEdgePath } from './KnowledgeEdgePath'
import { KnowledgeNodeCard } from './KnowledgeNodeCard'
import {
  buildFallbackKnowledgeNodeSummary,
  generateKnowledgeNodeSummary,
  type GenerateKnowledgeNodeSummaryRequest,
  type KnowledgeNodeSummary,
} from '../services/nodeSummaryGeneration'
import {
  KNOWLEDGE_EDGES,
  KNOWLEDGE_NODES,
  KNOWLEDGE_SCHEMAS,
  canEnterKnowledgeNode,
  getKnowledgeNodeById,
  getKnowledgeSchemaById,
  type KnowledgeNode,
  type KnowledgeNodeId,
  type KnowledgeSchemaId,
  type NodeMasteryState,
} from '../types/knowledgeGraph'

export interface KnowledgeGraphLesson {
  lessonId: string
  graphNodeId: KnowledgeNodeId
  title: string
  emoji: string
  available: boolean
  state: NodeMasteryState
}

interface KnowledgeGraphHubProps {
  lessons: KnowledgeGraphLesson[]
  onEnterLesson: (lessonId: string) => void
  onResetLesson: (lessonId: string) => void
  activeThemeLabel?: string
}

const MAP_HINT_STORAGE_KEY = 'schema-board-map-hint-dismissed'

const STATUS_LABELS: Record<NodeMasteryState['status'], string> = {
  locked: 'Locked',
  available: 'Available',
  inProgress: 'In progress',
  completed: 'Completed',
  mastered: 'Mastered',
}

const LOCKED_NODE_DETAIL_COPY = 'Finish the glowing topic before this one to unlock it.'
const COMING_SOON_NODE_DETAIL_COPY = 'This topic is coming soon.'

function countDownstreamDependents(nodeId: KnowledgeNodeId): number {
  const visited = new Set<KnowledgeNodeId>()
  const queue: KnowledgeNodeId[] = [nodeId]
  let count = 0

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) continue
    for (const node of KNOWLEDGE_NODES) {
      if (!node.unlockedBy.includes(current) || visited.has(node.id)) continue
      visited.add(node.id)
      count += 1
      queue.push(node.id)
    }
  }

  return count
}

function getFocusNodeId(lessons: KnowledgeGraphLesson[]): KnowledgeNodeId | undefined {
  const inProgressLessons = lessons.filter(
    (lesson) => lesson.state.status === 'inProgress' && lesson.available,
  )
  if (inProgressLessons.length > 0) {
    return inProgressLessons.reduce((best, lesson) =>
      countDownstreamDependents(lesson.graphNodeId) > countDownstreamDependents(best.graphNodeId)
        ? lesson
        : best,
    ).graphNodeId
  }

  const available = lessons.find((lesson) => lesson.state.status === 'available' && lesson.available)
  return available?.graphNodeId
}

const DEFAULT_GRAPH_VIEW = {
  rotateX: 18,
  rotateY: 0,
  rotateZ: -2,
  zoom: 1,
}

const DRAG_ROTATION_SPEED = 0.18
const WHEEL_ZOOM_SPEED = 0.0015
const CAMERA_DISTANCE = 180

type NodeSummaryStatus = 'loading' | 'ready' | 'error'

interface NodeSummaryEntry {
  status: NodeSummaryStatus
  summary?: KnowledgeNodeSummary
  source?: 'generated' | 'fallback'
  message?: string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}

function getSchemaDepth(schemaId: KnowledgeSchemaId) {
  if (schemaId === 'counting_probability') return -12
  if (schemaId === 'number_structure') return 18
  return 36
}

function getPointDepth(x: number, y: number, schemaId: KnowledgeSchemaId) {
  return getSchemaDepth(schemaId) + Math.sin(x * 0.21 + y * 0.13) * 20
}

function projectPoint({
  x,
  y,
  z,
  view,
}: {
  x: number
  y: number
  z: number
  view: typeof DEFAULT_GRAPH_VIEW
}) {
  const centeredX = x - 50
  const centeredY = y - 50
  const rotateX = degreesToRadians(view.rotateX)
  const rotateY = degreesToRadians(view.rotateY)
  const rotateZ = degreesToRadians(view.rotateZ)

  const yRotX = centeredX * Math.cos(rotateY) + z * Math.sin(rotateY)
  const yRotZ = -centeredX * Math.sin(rotateY) + z * Math.cos(rotateY)
  const xRotY = centeredY * Math.cos(rotateX) - yRotZ * Math.sin(rotateX)
  const xRotZ = centeredY * Math.sin(rotateX) + yRotZ * Math.cos(rotateX)
  const zRotX = yRotX * Math.cos(rotateZ) - xRotY * Math.sin(rotateZ)
  const zRotY = yRotX * Math.sin(rotateZ) + xRotY * Math.cos(rotateZ)
  const perspectiveScale = CAMERA_DISTANCE / (CAMERA_DISTANCE - xRotZ)
  const scale = clamp(view.zoom * perspectiveScale, 0.45, 2.4)

  return {
    x: 50 + zRotX * scale,
    y: 50 + zRotY * scale,
    z: xRotZ,
    scale,
  }
}

function calculateFrameVisibility(x: number, y: number) {
  const overflow = Math.max(0, -x, x - 100, -y, y - 100)
  return Math.max(0.14, 1 - overflow / 24)
}

interface AmbientDot {
  id: string
  schemaId: KnowledgeSchemaId
  x: number
  y: number
  threshold: number
}

interface AmbientEdge {
  id: string
  from: string
  to: string
  schemaId: KnowledgeSchemaId
}

/** Decorative schema dots — not tappable lessons, just atmosphere on the board. */
const AMBIENT_DOTS: AmbientDot[] = [
  { id: 'cp-a', schemaId: 'counting_probability', x: 24, y: 28, threshold: 13 },
  { id: 'cp-b', schemaId: 'counting_probability', x: 38, y: 23, threshold: 13 },
  { id: 'cp-c', schemaId: 'counting_probability', x: 54, y: 23, threshold: 25 },
  { id: 'cp-d', schemaId: 'counting_probability', x: 68, y: 30, threshold: 25 },
  { id: 'cp-e', schemaId: 'counting_probability', x: 76, y: 41, threshold: 38 },
  { id: 'cp-f', schemaId: 'counting_probability', x: 75, y: 56, threshold: 50 },
  { id: 'cp-g', schemaId: 'counting_probability', x: 65, y: 70, threshold: 63 },
  { id: 'cp-h', schemaId: 'counting_probability', x: 50, y: 76, threshold: 75 },
  { id: 'cp-i', schemaId: 'counting_probability', x: 35, y: 72, threshold: 88 },
  { id: 'cp-j', schemaId: 'counting_probability', x: 23, y: 61, threshold: 88 },
  { id: 'ns-a', schemaId: 'number_structure', x: 29, y: 70, threshold: 25 },
  { id: 'ns-b', schemaId: 'number_structure', x: 38, y: 64, threshold: 25 },
  { id: 'ns-c', schemaId: 'number_structure', x: 51, y: 64, threshold: 50 },
  { id: 'ns-d', schemaId: 'number_structure', x: 62, y: 71, threshold: 50 },
  { id: 'ns-e', schemaId: 'number_structure', x: 62, y: 83, threshold: 75 },
  { id: 'ns-f', schemaId: 'number_structure', x: 51, y: 90, threshold: 75 },
]

/** Faint future-path hints between ambient dots — always dim, never lesson unlock lines. */
const AMBIENT_EDGES: AmbientEdge[] = [
  { id: 'cp-ab', from: 'cp-a', to: 'cp-b', schemaId: 'counting_probability' },
  { id: 'cp-bc', from: 'cp-b', to: 'cp-c', schemaId: 'counting_probability' },
  { id: 'cp-cd', from: 'cp-c', to: 'cp-d', schemaId: 'counting_probability' },
  { id: 'cp-de', from: 'cp-d', to: 'cp-e', schemaId: 'counting_probability' },
  { id: 'cp-ef', from: 'cp-e', to: 'cp-f', schemaId: 'counting_probability' },
  { id: 'cp-fg', from: 'cp-f', to: 'cp-g', schemaId: 'counting_probability' },
  { id: 'cp-gh', from: 'cp-g', to: 'cp-h', schemaId: 'counting_probability' },
  { id: 'cp-hi', from: 'cp-h', to: 'cp-i', schemaId: 'counting_probability' },
  { id: 'cp-ij', from: 'cp-i', to: 'cp-j', schemaId: 'counting_probability' },
  { id: 'ns-ab', from: 'ns-a', to: 'ns-b', schemaId: 'number_structure' },
  { id: 'ns-bc', from: 'ns-b', to: 'ns-c', schemaId: 'number_structure' },
  { id: 'ns-cd', from: 'ns-c', to: 'ns-d', schemaId: 'number_structure' },
  { id: 'ns-de', from: 'ns-d', to: 'ns-e', schemaId: 'number_structure' },
  { id: 'ns-ef', from: 'ns-e', to: 'ns-f', schemaId: 'number_structure' },
  { id: 'bridge-cp-ns', from: 'cp-j', to: 'ns-a', schemaId: 'counting_probability' },
  { id: 'bridge-h-nsb', from: 'cp-h', to: 'ns-b', schemaId: 'transfer_schema' },
  { id: 'bridge-f-nsd', from: 'cp-f', to: 'ns-d', schemaId: 'transfer_schema' },
  { id: 'bridge-nsc-g', from: 'ns-c', to: 'cp-g', schemaId: 'transfer_schema' },
]

function createNodeSummaryCacheKey(request: GenerateKnowledgeNodeSummaryRequest) {
  return [
    request.node.id,
    request.status,
    request.available ? 'open' : 'closed',
    Math.round(request.progressRatio * 100),
    request.contextsTried.join(','),
    request.lessonTitle,
    request.activeThemeLabel ?? '',
  ].join('|')
}

function getOpenNodeLabel(lesson: KnowledgeGraphLesson) {
  if (!lesson.available) return 'Coming soon'
  if (lesson.state.status === 'locked') return 'Locked'
  if (lesson.state.status === 'inProgress') return 'Keep going'
  if (lesson.state.status === 'completed' || lesson.state.status === 'mastered') return 'Review lesson'
  return 'Start lesson'
}

export function KnowledgeGraphHub({
  lessons,
  onEnterLesson,
  onResetLesson,
  activeThemeLabel,
}: KnowledgeGraphHubProps) {
  const [userSelectedNodeId, setUserSelectedNodeId] = useState<KnowledgeNodeId | undefined>()
  const [graphView, setGraphView] = useState(DEFAULT_GRAPH_VIEW)
  const [draggingGraph, setDraggingGraph] = useState(false)
  const [showMapHint, setShowMapHint] = useState(
    () => typeof window !== 'undefined' && window.sessionStorage.getItem(MAP_HINT_STORAGE_KEY) !== '1',
  )
  const [aiSummaryExpandedNodeId, setAiSummaryExpandedNodeId] = useState<KnowledgeNodeId | undefined>()
  const [nodeSummaryByKey, setNodeSummaryByKey] = useState<Record<string, NodeSummaryEntry>>({})
  const dragStartRef = useRef<{
    pointerId: number
    x: number
    y: number
    rotateX: number
    rotateY: number
  } | null>(null)
  const lessonByNodeId = useMemo(() => {
    const entries = lessons.map((lesson) => [lesson.graphNodeId, lesson] as const)
    return new Map<KnowledgeNodeId, KnowledgeGraphLesson>(entries)
  }, [lessons])
  const nodeById = useMemo(() => {
    const entries = KNOWLEDGE_NODES.map((node) => [node.id, node] as const)
    return new Map<KnowledgeNodeId, KnowledgeNode>(entries)
  }, [])
  const focusNodeId = useMemo(() => getFocusNodeId(lessons), [lessons])
  const selectedNodeId = userSelectedNodeId ?? focusNodeId
  const aiSummaryExpanded = aiSummaryExpandedNodeId === selectedNodeId
  const selectedLesson = selectedNodeId ? lessonByNodeId.get(selectedNodeId) : undefined
  const selectedNode = selectedNodeId ? nodeById.get(selectedNodeId) : undefined
  const selectedSchema = selectedNode ? getKnowledgeSchemaById(selectedNode.schemaId) : undefined
  const brightnessBySchema = useMemo(() => {
    const entries = KNOWLEDGE_SCHEMAS.map((schema) => {
      const schemaLessons = schema.nodeIds
        .map((nodeId) => lessonByNodeId.get(nodeId))
        .filter((lesson): lesson is KnowledgeGraphLesson => Boolean(lesson))
      const mastered = schemaLessons.filter((lesson) => lesson.state.status === 'mastered').length
      const brightness = schemaLessons.length > 0 ? Math.round((mastered / schemaLessons.length) * 100) : 0
      return [schema.id, brightness] as const
    })
    return new Map<KnowledgeSchemaId, number>(entries)
  }, [lessonByNodeId])
  const projectedAmbientDots = useMemo(() => {
    const entries = AMBIENT_DOTS.map((dot) => {
      const projected = projectPoint({
        x: dot.x,
        y: dot.y,
        z: getPointDepth(dot.x, dot.y, dot.schemaId),
        view: graphView,
      })
      return [dot.id, { dot, ...projected }] as const
    })
    return new Map(entries)
  }, [graphView])
  const projectedNodes = useMemo(() => {
    const entries = KNOWLEDGE_NODES.map((node) => {
      const projected = projectPoint({
        x: node.mapPosition.x,
        y: node.mapPosition.y,
        z: getPointDepth(node.mapPosition.x, node.mapPosition.y, node.schemaId),
        view: graphView,
      })
      return [node.id, projected] as const
    })
    return new Map(entries)
  }, [graphView])
  const graphViewStyle = {
    '--graph-rotate-x': `${graphView.rotateX}deg`,
    '--graph-rotate-y': `${graphView.rotateY}deg`,
    '--graph-rotate-z': `${graphView.rotateZ}deg`,
    '--graph-zoom': graphView.zoom,
  } as CSSProperties
  const selectedSummaryRequest = useMemo(() =>
    selectedLesson && selectedNode && selectedSchema
      ? {
          node: {
            id: selectedNode.id,
            label: selectedNode.label,
            skill: selectedNode.skill,
            description: selectedNode.description,
          },
          status: selectedLesson.state.status,
          progressRatio: selectedLesson.state.progressRatio,
          contextsTried: selectedLesson.state.contextsTried,
          lessonTitle: selectedLesson.title,
          available: selectedLesson.available,
          activeThemeLabel,
          schemaLabel: selectedSchema.label,
        }
      : undefined,
  [activeThemeLabel, selectedLesson, selectedNode, selectedSchema])
  const selectedSummaryKey = selectedSummaryRequest
    ? createNodeSummaryCacheKey(selectedSummaryRequest)
    : undefined
  const selectedSummaryEntry = selectedSummaryKey ? nodeSummaryByKey[selectedSummaryKey] : undefined

  const generateNodeSummary = useCallback(async (
    request: GenerateKnowledgeNodeSummaryRequest,
    summaryKey: string,
  ) => {
    setNodeSummaryByKey((entries) => {
      if (entries[summaryKey]?.status === 'loading') return entries

      return {
        ...entries,
        [summaryKey]: {
          ...entries[summaryKey],
          status: 'loading',
          message: undefined,
        },
      }
    })

    try {
      const result = await generateKnowledgeNodeSummary(request)
      setNodeSummaryByKey((entries) => ({
        ...entries,
        [summaryKey]: {
          status: 'ready',
          summary: result.summary,
          source: result.source,
          message:
            result.source === 'fallback'
              ? 'Feedback unavailable right now, so this uses local progress instead.'
              : undefined,
        },
      }))
    } catch {
      setNodeSummaryByKey((entries) => ({
        ...entries,
        [summaryKey]: {
          status: 'error',
          summary: buildFallbackKnowledgeNodeSummary(request),
          source: 'fallback',
          message: 'Feedback unavailable right now, so this uses local progress instead.',
        },
      }))
    }
  }, [])

  useEffect(() => {
    if (!aiSummaryExpanded || !selectedSummaryRequest || !selectedSummaryKey || selectedSummaryEntry) {
      return
    }

    void generateNodeSummary(selectedSummaryRequest, selectedSummaryKey)
  }, [aiSummaryExpanded, generateNodeSummary, selectedSummaryEntry, selectedSummaryKey, selectedSummaryRequest])

  function dismissMapHint() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(MAP_HINT_STORAGE_KEY, '1')
    }
    setShowMapHint(false)
  }

  function handleGraphPointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target
    if (target instanceof Element && target.closest('button')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rotateX: graphView.rotateX,
      rotateY: graphView.rotateY,
    }
    setDraggingGraph(true)
    if (showMapHint) dismissMapHint()
  }

  function handleGraphPointerMove(event: PointerEvent<HTMLDivElement>) {
    const dragStart = dragStartRef.current
    if (!dragStart || dragStart.pointerId !== event.pointerId) return
    const deltaX = event.clientX - dragStart.x
    const deltaY = event.clientY - dragStart.y
    setGraphView({
      ...graphView,
      rotateX: clamp(dragStart.rotateX - deltaY * DRAG_ROTATION_SPEED, 0, 64),
      rotateY: clamp(dragStart.rotateY + deltaX * DRAG_ROTATION_SPEED, -42, 42),
    })
  }

  function zoomGraph(nextZoom: number) {
    setGraphView((view) => ({
      ...view,
      zoom: clamp(nextZoom, 0.68, 1.7),
    }))
  }

  function handleGraphWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    if (showMapHint) dismissMapHint()
    zoomGraph(graphView.zoom - event.deltaY * WHEEL_ZOOM_SPEED)
  }

  function stopGraphDrag(event: PointerEvent<HTMLDivElement>) {
    const dragStart = dragStartRef.current
    if (dragStart?.pointerId === event.pointerId) {
      dragStartRef.current = null
      setDraggingGraph(false)
    }
  }

  function requestFeedbackIfNeeded() {
    if (!selectedSummaryRequest || !selectedSummaryKey || selectedSummaryEntry) return

    void generateNodeSummary(selectedSummaryRequest, selectedSummaryKey)
  }

  function toggleFeedback() {
    if (aiSummaryExpanded) {
      setAiSummaryExpandedNodeId(undefined)
      return
    }

    requestFeedbackIfNeeded()
    setAiSummaryExpandedNodeId(selectedNodeId)
  }

  return (
    <section className="knowledge-graph" aria-labelledby="knowledge-graph-title">
      <div className="knowledge-graph__intro knowledge-graph__intro--compact">
        <h2 id="knowledge-graph-title">SCHEMAS</h2>
        <p className="knowledge-graph__hint">Tap a glowing dot to keep learning.</p>
      </div>

      <div
        className={`knowledge-graph__map${draggingGraph ? ' knowledge-graph__map--dragging' : ''}`}
        style={graphViewStyle}
        onPointerDown={handleGraphPointerDown}
        onPointerMove={handleGraphPointerMove}
        onPointerUp={stopGraphDrag}
        onPointerCancel={stopGraphDrag}
        onWheel={handleGraphWheel}
        aria-label="Interactive 3D schemas. Drag empty space to rotate the schemas."
      >
        <div className="knowledge-graph__map-controls">
          {showMapHint && <span className="knowledge-graph__map-hint">Drag schemas · Scroll to zoom</span>}
          <button type="button" onClick={() => zoomGraph(graphView.zoom - 0.12)} aria-label="Zoom out">
            -
          </button>
          <button type="button" onClick={() => zoomGraph(graphView.zoom + 0.12)} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={() => setGraphView(DEFAULT_GRAPH_VIEW)}>
            Reset view
          </button>
        </div>
        <div className="knowledge-graph__space">
          <svg className="knowledge-graph__edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {AMBIENT_EDGES.map((edge) => {
              const from = projectedAmbientDots.get(edge.from)
              const to = projectedAmbientDots.get(edge.to)
              if (!from || !to) return null
              const edgeVisibility = Math.min(
                calculateFrameVisibility(from.x, from.y),
                calculateFrameVisibility(to.x, to.y),
              )
              return (
                <line
                  key={edge.id}
                  className="knowledge-ambient-edge"
                  style={{
                    '--edge-neon': getKnowledgeSchemaById(edge.schemaId).neonColor,
                    '--edge-frame-visibility': edgeVisibility,
                  } as CSSProperties}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                />
              )
            })}
            {KNOWLEDGE_EDGES.map((edge) => {
              const from = nodeById.get(edge.from) ?? getKnowledgeNodeById(edge.from)
              const to = nodeById.get(edge.to) ?? getKnowledgeNodeById(edge.to)
              const fromState = lessonByNodeId.get(edge.from)?.state
              const toState = lessonByNodeId.get(edge.to)?.state
              if (!fromState || !toState) return null
              return (
                <KnowledgeEdgePath
                  key={edge.id}
                  edge={edge}
                  from={from}
                  to={to}
                  fromState={fromState}
                  toState={toState}
                  fromPosition={projectedNodes.get(edge.from)}
                  toPosition={projectedNodes.get(edge.to)}
                />
              )
            })}
          </svg>
          {AMBIENT_DOTS.map((dot) => {
            const brightness = brightnessBySchema.get(dot.schemaId) ?? 0
            const isLit = brightness >= dot.threshold
            const projectedDot = projectedAmbientDots.get(dot.id)
            if (!projectedDot) return null
            const frameVisibility = calculateFrameVisibility(projectedDot.x, projectedDot.y)
            return (
              <span
                key={dot.id}
                className={`knowledge-ambient-dot${isLit ? ' knowledge-ambient-dot--lit' : ''}`}
                style={{
                  '--dot-x': `${projectedDot.x}%`,
                  '--dot-y': `${projectedDot.y}%`,
                  '--dot-neon': getKnowledgeSchemaById(dot.schemaId).neonColor,
                  '--dot-scale': projectedDot.scale,
                  '--dot-frame-visibility': frameVisibility,
                  '--dot-z-index': Math.round(20 + projectedDot.z),
                } as CSSProperties}
                aria-hidden="true"
              />
            )
          })}
          {KNOWLEDGE_NODES.map((node) => {
            const lesson = lessonByNodeId.get(node.id)
            if (!lesson) return null
            return (
              <KnowledgeNodeCard
                key={node.id}
                node={node}
                state={lesson.state}
                title={lesson.title}
                emoji={lesson.emoji}
                isSelected={selectedNodeId === node.id}
                isRecommended={focusNodeId === node.id && selectedNodeId !== node.id}
                projectedPosition={projectedNodes.get(node.id)}
                onSelect={() => {
                  setUserSelectedNodeId(node.id)
                }}
                onPreview={() => {
                  setUserSelectedNodeId(node.id)
                }}
              />
            )
          })}
        </div>
      </div>

      {selectedLesson && selectedNode && (
        <div
          className={`knowledge-graph__detail knowledge-graph__detail--compact knowledge-graph__detail--${selectedLesson.state.status}`}
          style={{ '--node-neon': getKnowledgeSchemaById(selectedNode.schemaId).neonColor } as CSSProperties}
        >
          <div className="knowledge-graph__detail-main">
            <span className="knowledge-graph__detail-emoji" aria-hidden="true">
              {selectedLesson.emoji}
            </span>
            <div className="knowledge-graph__detail-copy">
              <h3 className="knowledge-graph__detail-title">
                <span>{selectedNode.label}</span>
                <span className="knowledge-graph__detail-badge">
                  {STATUS_LABELS[selectedLesson.state.status]}
                  {selectedLesson.state.status === 'mastered' ? ' ✓' : ''}
                </span>
              </h3>
              {!selectedLesson.available ? (
                <p className="knowledge-graph__detail-status">{COMING_SOON_NODE_DETAIL_COPY}</p>
              ) : selectedLesson.state.status === 'locked' ? (
                <p className="knowledge-graph__detail-status">{LOCKED_NODE_DETAIL_COPY}</p>
              ) : (
                <p className="knowledge-graph__detail-desc">{selectedNode.description}</p>
              )}
            </div>
          </div>
          <div className="knowledge-graph__detail-actions">
            <button
              type="button"
              className="home-hub__page-btn knowledge-graph__open-btn"
              onClick={() => onEnterLesson(selectedLesson.lessonId)}
              disabled={!canEnterKnowledgeNode(selectedLesson.state.status, selectedLesson.available)}
            >
              {getOpenNodeLabel(selectedLesson)}
            </button>
            {['inProgress', 'completed', 'mastered'].includes(selectedLesson.state.status) && (
              <button
                type="button"
                className="home-hub__page-btn knowledge-graph__reset-btn"
                onClick={() => onResetLesson(selectedLesson.lessonId)}
                disabled={!canEnterKnowledgeNode(selectedLesson.state.status, selectedLesson.available)}
              >
                Reset progress
              </button>
            )}
          </div>
          {['inProgress', 'completed', 'mastered'].includes(selectedLesson.state.status) && (
            <div className="knowledge-graph__ai-collapsible">
              <button
                type="button"
                className="knowledge-graph__ai-toggle"
                onClick={toggleFeedback}
                aria-expanded={aiSummaryExpanded}
              >
                {aiSummaryExpanded ? 'Hide feedback' : 'Get feedback'}
              </button>
              {aiSummaryExpanded && (
                <section className="knowledge-graph__ai-summary" aria-live="polite">
                  <div className="knowledge-graph__ai-summary-head">
                    <div>
                      <p className="knowledge-graph__ai-eyebrow">Feedback</p>
                      <h4>{selectedSummaryEntry?.summary?.title ?? 'Personalized feedback'}</h4>
                    </div>
                  </div>
                  {selectedSummaryEntry?.status === 'loading' ? (
                    <p className="knowledge-graph__ai-loading">Reading this topic, your progress, and your theme...</p>
                  ) : selectedSummaryEntry?.summary ? (
                    <div className="knowledge-graph__ai-copy">
                      <p>{selectedSummaryEntry.summary.currentUnderstanding}</p>
                      <p>
                        <strong>Next practice:</strong> {selectedSummaryEntry.summary.nextPractice}
                      </p>
                      <p>{selectedSummaryEntry.summary.encouragement}</p>
                      {selectedSummaryEntry.message && (
                        <p className="knowledge-graph__ai-message">{selectedSummaryEntry.message}</p>
                      )}
                    </div>
                  ) : (
                    <p className="knowledge-graph__ai-empty">
                      Getting your feedback ready...
                    </p>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      )}

    </section>
  )
}
