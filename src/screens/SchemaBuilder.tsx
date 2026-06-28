import { useMemo, useState } from 'react'
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

function getDebugMessage(debugError?: string) {
  return import.meta.env.DEV && debugError ? ` Debug: ${debugError}` : ''
}

function getDisplayText(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  const lastToken = normalized.split(' ').at(-1) ?? ''
  const hasDanglingLetter = /^[A-Za-z]$/.test(lastToken) && !/[.!?)]$/.test(normalized)
  return hasDanglingLetter ? normalized.slice(0, -lastToken.length).trim() : normalized
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
    setStatusMessage(null)
  }

  return (
    <div className="schema-builder">
      <div className="home-hub__manage-header schema-builder__header">
        <div>
          <p className="home-hub__manage-eyebrow">Schema lab</p>
          <h2>Make a New Schema</h2>
          <p>
            Generate node topics and connection reasoning first. Node material is created later
            when you open a draft node.
          </p>
        </div>
        <button type="button" className="home-hub__page-btn" onClick={onBack}>
          Back to schemas
        </button>
      </div>

      <form
        className="schema-builder__form schema-builder__form--horizontal"
        onSubmit={(event) => {
          event.preventDefault()
          void handleGenerateConceptMap()
        }}
      >
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
              <div className="schema-builder__summary">
                <span className="schema-builder__color-dot" style={{ background: draft.schema.neonColor }} />
                <div>
                  <h3>{draft.schema.label}</h3>
                  <p>{getDisplayText(draft.schema.description)}</p>
                  {draft.sourceConceptMap.generationNotes && (
                    <p className="schema-builder__muted">{getDisplayText(draft.sourceConceptMap.generationNotes)}</p>
                  )}
                </div>
              </div>

              {draft.warnings.length > 0 && (
                <div className="schema-builder__warnings" role="status">
                  <strong>Draft warnings</strong>
                  <ul>
                    {draft.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              )}

              <div className="schema-builder__workspace">
                <div className="schema-builder__node-rail">
                  <h3>Nodes</h3>
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
                        <small>{node.skill}</small>
                      </button>
                    ))}
                  </div>
                </div>

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
              </div>

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
