import { useMemo, useRef, useState, type CSSProperties, type PointerEvent, type WheelEvent } from 'react'
import { generateConceptMap } from '../services/conceptMapGeneration'
import { generateNodeMaterial } from '../services/nodeMaterialGeneration'
import type {
  GeneratedNodeMaterial,
  GeneratedSchemaDraft,
  GeneratedSchemaNode,
} from '../types/generatedSchema'
import type { StudentMemory } from '../types/user'
import {
  AI_GENERATED_NODE_MATERIAL_CACHE_PREFIX,
  createStableHash,
  readAiCache,
  writeAiCache,
} from '../utils/aiProgressCache'
import { buildSchemaFromConceptMap } from '../utils/buildSchemaFromConceptMap'

interface SchemaBuilderProps {
  activeThemeLabel: string
  aiEnabled: boolean
  cacheScope: string
  studentMemory: StudentMemory
  onBack: () => void
}

interface MaterialEntry {
  material: GeneratedNodeMaterial
  source: 'generated' | 'fallback'
}

const GENERATED_SCHEMA_GREEN = '#4ade80'
const DEFAULT_GENERATED_GRAPH_VIEW = {
  rotateX: 18,
  rotateY: 0,
  rotateZ: -2,
  zoom: 1,
}
const GENERATED_DRAG_ROTATION_SPEED = 0.18
const GENERATED_WHEEL_ZOOM_SPEED = 0.0015
const GENERATED_CAMERA_DISTANCE = 180

interface ProjectedGeneratedPoint {
  x: number
  y: number
  z: number
  scale: number
}

function getDebugMessage(debugError?: string) {
  return import.meta.env.DEV && debugError ? ` Debug: ${debugError}` : ''
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}

function getGeneratedNodeDepth(node: GeneratedSchemaNode) {
  return (node.difficulty - 3) * 10 + Math.sin(node.mapPosition.x * 0.21 + node.mapPosition.y * 0.13) * 18
}

function projectGeneratedPoint({
  x,
  y,
  z,
  view,
}: {
  x: number
  y: number
  z: number
  view: typeof DEFAULT_GENERATED_GRAPH_VIEW
}): ProjectedGeneratedPoint {
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
  const perspectiveScale = GENERATED_CAMERA_DISTANCE / (GENERATED_CAMERA_DISTANCE - xRotZ)
  const scale = clamp(view.zoom * perspectiveScale, 0.48, 2.3)

  return {
    x: 50 + zRotX * scale,
    y: 50 + zRotY * scale,
    z: xRotZ,
    scale,
  }
}

function calculateGeneratedFrameVisibility(x: number, y: number) {
  const overflow = Math.max(0, -x, x - 100, -y, y - 100)
  return Math.max(0.16, 1 - overflow / 24)
}

function getDisplayText(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  const lastToken = normalized.split(' ').at(-1) ?? ''
  const hasDanglingLetter = /^[A-Za-z]$/.test(lastToken) && !/[.!?)]$/.test(normalized)
  return hasDanglingLetter ? normalized.slice(0, -lastToken.length).trim() : normalized
}

function getTitleText(value: string) {
  return getDisplayText(value)
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
}

function getStudentMemorySummary(memory: StudentMemory) {
  return {
    totalAttempts: memory.totalAttempts,
    correctAttempts: memory.correctAttempts,
    incorrectAttempts: memory.incorrectAttempts,
    hintsRequested: memory.hintsRequested,
    currentStreak: memory.currentStreak,
    strengths: memory.strengths,
    growthAreas: memory.growthAreas,
  }
}

function getMaterialCacheKey({
  cacheScope,
  draft,
  node,
  studentMemory,
  activeThemeLabel,
}: {
  cacheScope: string
  draft: GeneratedSchemaDraft
  node: GeneratedSchemaNode
  studentMemory: StudentMemory
  activeThemeLabel: string
}) {
  const signature = createStableHash(JSON.stringify({
    draftId: draft.id,
    nodeId: node.id,
    activeThemeLabel,
    studentMemory: getStudentMemorySummary(studentMemory),
  }))
  return `${AI_GENERATED_NODE_MATERIAL_CACHE_PREFIX}:${cacheScope}:${draft.id}:${node.id}:${signature}`
}

function getMaterialContext(draft: GeneratedSchemaDraft, node: GeneratedSchemaNode) {
  const incomingEdges = draft.edges.filter((edge) => edge.to === node.id)
  const outgoingEdges = draft.edges.filter((edge) => edge.from === node.id)
  return {
    incomingReasons: incomingEdges.map((edge) => `${edge.relationship}: ${edge.reason}`),
    outgoingReasons: outgoingEdges.map((edge) => `${edge.relationship}: ${edge.reason}`),
    prerequisiteNodes: node.unlockedBy
      .map((nodeId) => draft.nodes.find((candidate) => candidate.id === nodeId))
      .filter((candidate): candidate is GeneratedSchemaNode => candidate !== undefined)
      .map((candidate) => ({
        id: candidate.id,
        label: candidate.label,
        skill: candidate.skill,
      })),
  }
}

export function SchemaBuilder({
  activeThemeLabel,
  aiEnabled,
  cacheScope,
  studentMemory,
  onBack,
}: SchemaBuilderProps) {
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('3rd grade')
  const [goal, setGoal] = useState('')
  const [draft, setDraft] = useState<GeneratedSchemaDraft | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [materialByNodeId, setMaterialByNodeId] = useState<Record<string, MaterialEntry>>({})
  const [loadingMap, setLoadingMap] = useState(false)
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [sidebarMode, setSidebarMode] = useState<'generator' | 'nodes'>('generator')
  const [graphView, setGraphView] = useState(DEFAULT_GENERATED_GRAPH_VIEW)
  const [draggingGraph, setDraggingGraph] = useState(false)
  const dragStartRef = useRef<{
    pointerId: number
    x: number
    y: number
    rotateX: number
    rotateY: number
  } | null>(null)

  const selectedNode = useMemo(
    () => draft?.nodes.find((node) => node.id === selectedNodeId) ?? draft?.nodes[0] ?? null,
    [draft, selectedNodeId],
  )
  const selectedMaterial = selectedNode ? materialByNodeId[selectedNode.id] : undefined
  const selectedPrerequisites = useMemo(() => {
    if (!draft || !selectedNode) return []
    return selectedNode.unlockedBy
      .map((nodeId) => draft.nodes.find((node) => node.id === nodeId))
      .filter((node): node is GeneratedSchemaNode => node !== undefined)
  }, [draft, selectedNode])
  const selectedUnlocks = useMemo(() => {
    if (!draft || !selectedNode) return []
    return draft.nodes.filter((node) => node.unlockedBy.includes(selectedNode.id))
  }, [draft, selectedNode])
  const selectedConnections = useMemo(() => {
    if (!draft || !selectedNode) return []
    return draft.edges.filter((edge) => edge.from === selectedNode.id || edge.to === selectedNode.id)
  }, [draft, selectedNode])
  const projectedGeneratedNodes = useMemo(() => {
    if (!draft) return new Map<string, ProjectedGeneratedPoint>()
    const entries = draft.nodes.map((node) => [
      node.id,
      projectGeneratedPoint({
        x: node.mapPosition.x,
        y: node.mapPosition.y,
        z: getGeneratedNodeDepth(node),
        view: graphView,
      }),
    ] as const)
    return new Map(entries)
  }, [draft, graphView])

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
  }

  function handleGraphPointerMove(event: PointerEvent<HTMLDivElement>) {
    const dragStart = dragStartRef.current
    if (!dragStart || dragStart.pointerId !== event.pointerId) return
    const deltaX = event.clientX - dragStart.x
    const deltaY = event.clientY - dragStart.y
    setGraphView((view) => ({
      ...view,
      rotateX: clamp(dragStart.rotateX - deltaY * GENERATED_DRAG_ROTATION_SPEED, 0, 64),
      rotateY: clamp(dragStart.rotateY + deltaX * GENERATED_DRAG_ROTATION_SPEED, -48, 48),
    }))
  }

  function stopGraphDrag(event: PointerEvent<HTMLDivElement>) {
    const dragStart = dragStartRef.current
    if (dragStart?.pointerId === event.pointerId) {
      dragStartRef.current = null
      setDraggingGraph(false)
    }
  }

  function zoomGeneratedGraph(nextZoom: number) {
    setGraphView((view) => ({
      ...view,
      zoom: clamp(nextZoom, 0.68, 1.7),
    }))
  }

  function handleGraphWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    zoomGeneratedGraph(graphView.zoom - event.deltaY * GENERATED_WHEEL_ZOOM_SPEED)
  }

  async function handleGenerateConceptMap() {
    if (!aiEnabled) {
      setStatusMessage('Turn AI on to generate a schema outline.')
      return
    }
    const trimmedTopic = topic.trim()
    if (!trimmedTopic) {
      setStatusMessage('Add a topic first, like fractions or multiplication arrays.')
      return
    }

    setLoadingMap(true)
    setStatusMessage(null)
    try {
      const result = await generateConceptMap({
        topic: trimmedTopic,
        audience: audience.trim() || '3rd grade',
        goal: goal.trim() || undefined,
      })

      if (!result.conceptMap) {
        setDraft(null)
        setSelectedNodeId(null)
        setStatusMessage(`I could not generate a usable schema outline yet.${getDebugMessage(result.debugError)}`)
        return
      }

      const nextDraft = buildSchemaFromConceptMap(result.conceptMap)
      setDraft(nextDraft)
      setSelectedNodeId(nextDraft.nodes[0]?.id ?? null)
      setMaterialByNodeId({})
      setSidebarMode('nodes')
      setGraphView(DEFAULT_GENERATED_GRAPH_VIEW)
      setStatusMessage(
        result.source === 'generated'
          ? 'Schema outline generated. Choose a node, then generate material when you are ready.'
          : `Using fallback schema data.${getDebugMessage(result.debugError)}`,
      )
    } finally {
      setLoadingMap(false)
    }
  }

  async function handleSelectNode(node: GeneratedSchemaNode) {
    setSelectedNodeId(node.id)
    if (!aiEnabled) {
      setStatusMessage('Turn AI on to generate node material.')
      return
    }
    if (!draft || materialByNodeId[node.id] || loadingNodeId === node.id) return

    const cacheKey = getMaterialCacheKey({
      cacheScope,
      draft,
      node,
      studentMemory,
      activeThemeLabel,
    })
    const cachedMaterial = readAiCache<MaterialEntry>(cacheKey)
    if (cachedMaterial?.material) {
      setMaterialByNodeId((current) => ({ ...current, [node.id]: cachedMaterial }))
      return
    }

    setLoadingNodeId(node.id)
    const materialContext = getMaterialContext(draft, node)
    try {
      const result = await generateNodeMaterial({
        schemaDraftId: draft.id,
        schemaTopic: draft.sourceConceptMap.topic,
        schemaBigIdea: draft.sourceConceptMap.bigIdea,
        activeThemeLabel,
        node: {
          id: node.id,
          label: node.label,
          topic: node.topic,
          skill: node.skill,
          description: node.description,
          difficulty: node.difficulty,
          unlockedBy: node.unlockedBy,
        },
        ...materialContext,
        studentMemory: getStudentMemorySummary(studentMemory),
      })

      if (!result.material) {
        setStatusMessage(`I could not generate material for ${node.label}.${getDebugMessage(result.debugError)}`)
        return
      }

      const entry = { material: result.material, source: result.source }
      writeAiCache(cacheKey, entry)
      setMaterialByNodeId((current) => ({ ...current, [node.id]: entry }))
    } finally {
      setLoadingNodeId(null)
    }
  }

  function handleClear() {
    setDraft(null)
    setSelectedNodeId(null)
    setMaterialByNodeId({})
    setSidebarMode('generator')
    setGraphView(DEFAULT_GENERATED_GRAPH_VIEW)
    setStatusMessage(null)
  }

  return (
    <div className="schema-builder">
      <div className="home-hub__manage-header schema-builder__header">
        <div>
          <p className="home-hub__manage-eyebrow">Schema lab</p>
          <h2>Make a New Schema</h2>
          <p>
            Create a custom schema map from any topic, then open each node to inspect what
            it teaches and generate lesson material.
          </p>
        </div>
        <button type="button" className="home-hub__page-btn" onClick={onBack}>
          Back to schemas
        </button>
      </div>

      {!draft || sidebarMode === 'generator' ? (
        <form
          className="schema-builder__form schema-builder__form--horizontal"
          onSubmit={(event) => {
            event.preventDefault()
            void handleGenerateConceptMap()
          }}
        >
          {draft && (
            <button type="button" className="home-hub__page-btn" onClick={() => setSidebarMode('nodes')}>
              Back to nodes
            </button>
          )}
          <div className="schema-builder__short-fields">
            <label>
              Topic
              <input
                className="form-input"
                onChange={(event) => setTopic(event.target.value)}
                placeholder="e.g. fractions"
                type="text"
                value={topic}
              />
            </label>
            <label>
              Audience
              <input
                className="form-input"
                onChange={(event) => setAudience(event.target.value)}
                type="text"
                value={audience}
              />
            </label>
          </div>
          <label className="schema-builder__goal-field">
            Goal or notes
            <textarea
              className="form-input schema-builder__textarea"
              onChange={(event) => setGoal(event.target.value)}
              placeholder="Optional: what should this schema help the learner understand?"
              value={goal}
            />
          </label>
          <div className="schema-builder__actions schema-builder__actions--top">
            <button type="submit" className="home-hub__page-btn" disabled={loadingMap || !aiEnabled}>
              {!aiEnabled ? 'AI is off' : loadingMap ? 'Generating...' : draft ? 'Regenerate map' : 'Generate map'}
            </button>
            <button type="button" className="home-hub__reset-btn" onClick={handleClear} disabled={!draft && !statusMessage}>
              Clear
            </button>
          </div>
          {statusMessage && <p className="schema-builder__status schema-builder__status--top">{statusMessage}</p>}
        </form>
      ) : (
        <aside className="schema-builder__node-sidebar" aria-label="Generated schema nodes">
          <div className="schema-builder__node-sidebar-head">
            <button
              type="button"
              className="schema-builder__quiet-back"
              onClick={() => setSidebarMode('generator')}
            >
              ← Back to generator
            </button>
            <div>
              <p className="home-hub__manage-eyebrow">Generated nodes</p>
              <h3>Choose a node</h3>
            </div>
          </div>
          <div className="schema-builder__node-list">
            {draft.nodes.map((node) => (
              <button
                type="button"
                className={`schema-builder__node-card ${selectedNode?.id === node.id ? 'schema-builder__node-card--active' : ''}`}
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
              >
                <span>{node.isStarter ? 'Starter' : `Difficulty ${node.difficulty}`}</span>
                <strong>{node.label}</strong>
              </button>
            ))}
          </div>
        </aside>
      )}

      <section className="schema-builder__preview" aria-label="Generated schema preview">
          {!draft ? (
            <div className="schema-builder__empty">
              <h3>Draft preview</h3>
              <p>
                Your generated concept map will show here as node cards, edge reasons,
                warnings, and lazy node material.
              </p>
            </div>
          ) : (
            <>
              <section className="schema-builder__graph-panel" aria-label="Interactive 3D generated schema graph">
                <div className="schema-builder__graph-header">
                  <div>
                    <p className="home-hub__manage-eyebrow">Generated graph</p>
                    <h3>{getTitleText(draft.sourceConceptMap.topic)}</h3>
                  </div>
                  <p>Drag to rotate. Pick a node to inspect it.</p>
                </div>
                <div
                  className={`schema-builder__graph-map${draggingGraph ? ' schema-builder__graph-map--dragging' : ''}`}
                  onPointerDown={handleGraphPointerDown}
                  onPointerMove={handleGraphPointerMove}
                  onPointerUp={stopGraphDrag}
                  onPointerCancel={stopGraphDrag}
                  onWheel={handleGraphWheel}
                  aria-label="Interactive generated schema graph. Drag empty space to rotate."
                  style={{ '--generated-schema-green': GENERATED_SCHEMA_GREEN } as CSSProperties}
                >
                  <div className="schema-builder__graph-controls">
                    <span>Drag graph - Scroll to zoom</span>
                    <button type="button" onClick={() => zoomGeneratedGraph(graphView.zoom - 0.12)} aria-label="Zoom out generated graph">
                      -
                    </button>
                    <button type="button" onClick={() => zoomGeneratedGraph(graphView.zoom + 0.12)} aria-label="Zoom in generated graph">
                      +
                    </button>
                    <button type="button" onClick={() => setGraphView(DEFAULT_GENERATED_GRAPH_VIEW)}>
                      Reset view
                    </button>
                  </div>
                  <div className="schema-builder__graph-space">
                    <svg className="schema-builder__graph-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      {draft.edges.map((edge) => {
                        const from = projectedGeneratedNodes.get(edge.from)
                        const to = projectedGeneratedNodes.get(edge.to)
                        if (!from || !to) return null
                        const edgeVisibility = Math.min(
                          calculateGeneratedFrameVisibility(from.x, from.y),
                          calculateGeneratedFrameVisibility(to.x, to.y),
                        )
                        return (
                          <line
                            className={`schema-builder__graph-edge schema-builder__graph-edge--${edge.relationship}`}
                            key={edge.id}
                            style={{ '--generated-edge-visibility': edgeVisibility } as CSSProperties}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                          />
                        )
                      })}
                    </svg>
                    {draft.nodes.map((node) => {
                      const projectedNode = projectedGeneratedNodes.get(node.id)
                      if (!projectedNode) return null
                      const frameVisibility = calculateGeneratedFrameVisibility(projectedNode.x, projectedNode.y)
                      const nodeScale = projectedNode.scale
                      return (
                        <button
                          type="button"
                          className={`schema-builder__graph-node ${node.isStarter ? 'schema-builder__graph-node--starter' : 'schema-builder__graph-node--locked'}${selectedNode?.id === node.id ? ' schema-builder__graph-node--selected' : ''}`}
                          key={node.id}
                          style={{
                            '--generated-node-x': `${projectedNode.x}%`,
                            '--generated-node-y': `${projectedNode.y}%`,
                            '--generated-node-scale': nodeScale,
                            '--generated-node-frame-visibility': frameVisibility,
                            '--generated-node-tooltip-rest-scale': (1 / nodeScale) * 0.96,
                            '--generated-node-tooltip-active-scale': 1 / nodeScale,
                            '--generated-node-z-index': Math.round(40 + projectedNode.z),
                          } as CSSProperties}
                          onClick={() => setSelectedNodeId(node.id)}
                          onFocus={() => setSelectedNodeId(node.id)}
                          aria-pressed={selectedNode?.id === node.id}
                          aria-label={`${node.label}. Difficulty ${node.difficulty}. ${node.skill}`}
                        >
                          <span className="schema-builder__graph-orb" aria-hidden="true" />
                          <span className="schema-builder__graph-tooltip" aria-hidden="true">
                            <strong>{node.label}</strong>
                            <span>{node.isStarter ? 'Starter node' : `Difficulty ${node.difficulty}`}</span>
                            <small>{node.skill}</small>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              {selectedNode && (
                <div className="schema-builder__selected-stack">
                    <section className="schema-builder__selected-node" aria-label="Selected generated node">
                      <div className="schema-builder__selected-head">
                        <div>
                          <p className="home-hub__manage-eyebrow">Current node</p>
                          <h3>{selectedNode.label}</h3>
                        </div>
                        <span>{selectedNode.isStarter ? 'Starter' : `Difficulty ${selectedNode.difficulty}`}</span>
                      </div>
                      <p>{getDisplayText(selectedNode.description)}</p>
                      <dl className="schema-builder__node-meta">
                        <div>
                          <dt>Topic</dt>
                          <dd>{selectedNode.topic}</dd>
                        </div>
                        <div>
                          <dt>Learning goal</dt>
                          <dd>{getDisplayText(selectedNode.skill)}</dd>
                        </div>
                        <div>
                          <dt>Difficulty</dt>
                          <dd>{selectedNode.difficulty} / 5</dd>
                        </div>
                      </dl>

                      <div className="schema-builder__dependency-grid">
                        <div>
                          <h4>Prerequisites</h4>
                          {selectedPrerequisites.length === 0 ? (
                            <p className="schema-builder__muted">This node can start the schema.</p>
                          ) : (
                            <ul>
                              {selectedPrerequisites.map((node) => (
                                <li key={node.id}>
                                  <strong>{node.label}</strong>
                                  <span>{getDisplayText(node.skill)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <h4>Unlocks next</h4>
                          {selectedUnlocks.length === 0 ? (
                            <p className="schema-builder__muted">This is an end or transfer node.</p>
                          ) : (
                            <ul>
                              {selectedUnlocks.map((node) => (
                                <li key={node.id}>
                                  <strong>{node.label}</strong>
                                  <span>{getDisplayText(node.skill)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="schema-builder__material" aria-label="Generated node material">
                      <div className="schema-builder__material-head">
                        <div>
                          <p className="home-hub__manage-eyebrow">Generated material</p>
                          <h3>{selectedNode.label}</h3>
                        </div>
                        {!selectedMaterial?.material && loadingNodeId !== selectedNode.id && (
                          <button
                            type="button"
                            className="home-hub__page-btn"
                            onClick={() => void handleSelectNode(selectedNode)}
                          >
                            Generate material
                          </button>
                        )}
                      </div>
                      {loadingNodeId === selectedNode.id ? (
                        <p className="schema-builder__status">Generating material for this node...</p>
                      ) : selectedMaterial?.material ? (
                        <div className="schema-builder__material-grid">
                          <article>
                            <span>{selectedMaterial.source === 'generated' ? 'AI material' : 'Fallback material'}</span>
                            <h4>Intro</h4>
                            <p>{getDisplayText(selectedMaterial.material.intro)}</p>
                          </article>
                          <article>
                            <h4>Worked example</h4>
                            <p>{getDisplayText(selectedMaterial.material.workedExample)}</p>
                          </article>
                          <article>
                            <h4>Interactive idea</h4>
                            <p>{getDisplayText(selectedMaterial.material.interactiveIdea)}</p>
                          </article>
                          <article>
                            <h4>Practice</h4>
                            <p>{getDisplayText(selectedMaterial.material.practicePrompt)}</p>
                          </article>
                          <article>
                            <h4>Hint</h4>
                            <p>{getDisplayText(selectedMaterial.material.hint)}</p>
                          </article>
                          <article>
                            <h4>Success</h4>
                            <p>{getDisplayText(selectedMaterial.material.successCriteria)}</p>
                          </article>
                        </div>
                      ) : (
                        <p className="schema-builder__muted">
                          Generate this after choosing a node so material can use prerequisites and connection reasons.
                        </p>
                      )}
                    </section>
                </div>
              )}

              {draft.sourceConceptMap.assumedPrerequisites && draft.sourceConceptMap.assumedPrerequisites.length > 0 && (
                <section className="schema-builder__assumptions" aria-label="Assumed prerequisites">
                  <div>
                    <p className="home-hub__manage-eyebrow">Assumed prerequisites</p>
                    <h3>What this schema assumes the learner already knows</h3>
                  </div>
                  <div className="schema-builder__assumption-list">
                    {draft.sourceConceptMap.assumedPrerequisites.map((prerequisite) => (
                      <span key={prerequisite}>{getDisplayText(prerequisite)}</span>
                    ))}
                  </div>
                </section>
              )}

              {draft.warnings.length > 0 && (
                <div className="schema-builder__warnings" role="status">
                  <strong>Draft warnings</strong>
                  <ul>
                    {draft.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              )}

              <section className="schema-builder__connection-strip" aria-label="Connections for selected node">
                <h3>{selectedNode ? `${selectedNode.label} connections` : 'Connections'}</h3>
                <div className="schema-builder__edge-list">
                  {(selectedConnections.length > 0 ? selectedConnections : draft.edges).map((edge) => {
                    const from = draft.nodes.find((node) => node.id === edge.from)?.label ?? edge.from
                    const to = draft.nodes.find((node) => node.id === edge.to)?.label ?? edge.to
                    return (
                      <article className="schema-builder__edge-card" key={edge.id}>
                        <span>{edge.relationship}</span>
                        <strong>{from} → {to}</strong>
                        <p>{getDisplayText(edge.reason)}</p>
                      </article>
                    )
                  })}
                </div>
              </section>
            </>
          )}
      </section>
    </div>
  )
}
