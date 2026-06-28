import type {
  GeneratedConceptMap,
  GeneratedSchemaDraft,
  GeneratedSchemaEdge,
  GeneratedSchemaNode,
} from '../types/generatedSchema'

const SCHEMA_COLORS = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#f59e0b', '#60a5fa']

function slugify(value: string, fallback: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return slug || fallback
}

function hashString(value: string): number {
  return [...value].reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
}

function getSchemaColor(topic: string): string {
  const index = Math.abs(hashString(topic)) % SCHEMA_COLORS.length
  return SCHEMA_COLORS[index] ?? SCHEMA_COLORS[0]
}

function getSchemaShortLabel(topic: string): string {
  const words = topic.trim().split(/\s+/).filter(Boolean)
  return words.length <= 2
    ? topic.trim().slice(0, 28)
    : words.slice(0, 2).join(' ').slice(0, 28)
}

function getLayeredPosition(index: number, total: number, difficulty: number): { x: number; y: number } {
  const safeTotal = Math.max(total, 1)
  const angle = (index / safeTotal) * Math.PI * 2 - Math.PI / 2
  const radius = 16 + difficulty * 5
  const x = 50 + Math.cos(angle) * radius
  const y = 50 + Math.sin(angle) * radius
  return {
    x: Math.round(Math.min(Math.max(x, 12), 88)),
    y: Math.round(Math.min(Math.max(y, 12), 88)),
  }
}

function detectPrerequisiteCycle(nodes: GeneratedSchemaNode[]): boolean {
  const nodeIds = new Set(nodes.map((node) => node.id))
  const visiting = new Set<string>()
  const visited = new Set<string>()

  function visit(nodeId: string): boolean {
    if (visiting.has(nodeId)) return true
    if (visited.has(nodeId)) return false

    visiting.add(nodeId)
    const node = nodes.find((entry) => entry.id === nodeId)
    const hasCycle = node?.unlockedBy
      .filter((prerequisiteId) => nodeIds.has(prerequisiteId))
      .some(visit) ?? false
    visiting.delete(nodeId)
    visited.add(nodeId)
    return hasCycle
  }

  return nodes.some((node) => visit(node.id))
}

function getWarnings(nodes: GeneratedSchemaNode[], edges: GeneratedSchemaEdge[]): string[] {
  const warnings: string[] = []
  const starterCount = nodes.filter((node) => node.isStarter).length
  const connectedNodeIds = new Set(edges.flatMap((edge) => [edge.from, edge.to]))
  const orphanNodes = nodes.filter((node) => !connectedNodeIds.has(node.id))
  const labels = nodes.map((node) => node.label.toLowerCase())
  const duplicateLabels = labels.filter((label, index) => labels.indexOf(label) !== index)

  if (starterCount === 0) warnings.push('No starter node was found; at least one node should open the schema.')
  if (starterCount > 2) warnings.push('Several starter nodes were found; the schema may feel unfocused.')
  if (orphanNodes.length > 0) warnings.push(`Orphan nodes: ${orphanNodes.map((node) => node.label).join(', ')}.`)
  if (duplicateLabels.length > 0) warnings.push('Some node labels are duplicated.')
  if (detectPrerequisiteCycle(nodes)) warnings.push('A prerequisite cycle was detected.')
  if (!edges.some((edge) => edge.relationship === 'prerequisite')) {
    warnings.push('No prerequisite edges were found, so unlock order may be unclear.')
  }

  return warnings
}

export function buildSchemaFromConceptMap(conceptMap: GeneratedConceptMap): GeneratedSchemaDraft {
  const schemaId = `generated_${slugify(conceptMap.topic, 'schema')}`
  const prerequisiteTargets = new Set(
    conceptMap.relationships
      .filter((relationship) => relationship.type === 'prerequisite')
      .map((relationship) => relationship.to),
  )
  const nodeBySourceId = new Map(conceptMap.concepts.map((concept) => [concept.id, concept]))

  const nodes = conceptMap.concepts.map<GeneratedSchemaNode>((concept, index) => {
    const unlockedBy = conceptMap.relationships
      .filter((relationship) => relationship.type === 'prerequisite' && relationship.to === concept.id)
      .map((relationship) => relationship.from)
      .filter((sourceId) => nodeBySourceId.has(sourceId))

    return {
      id: `${schemaId}_${slugify(concept.id, `node_${index + 1}`)}`,
      schemaId,
      label: concept.label,
      shortLabel: concept.shortLabel,
      topic: concept.topic,
      skill: concept.learningGoal,
      description: concept.kidDescription,
      difficulty: concept.difficulty,
      isStarter: !prerequisiteTargets.has(concept.id),
      unlockedBy: unlockedBy.map((sourceId) => `${schemaId}_${slugify(sourceId, sourceId)}`),
      mapPosition: getLayeredPosition(index, conceptMap.concepts.length, concept.difficulty),
    }
  })

  const nodeIdByConceptId = new Map(
    conceptMap.concepts.map((concept, index) => [
      concept.id,
      `${schemaId}_${slugify(concept.id, `node_${index + 1}`)}`,
    ]),
  )

  const edges = conceptMap.relationships
    .map<GeneratedSchemaEdge | null>((relationship, index) => {
      const from = nodeIdByConceptId.get(relationship.from)
      const to = nodeIdByConceptId.get(relationship.to)
      if (!from || !to) return null

      return {
        id: `${schemaId}_edge_${index + 1}_${relationship.type}`,
        from,
        to,
        relationship: relationship.type,
        reason: relationship.reason,
      }
    })
    .filter((edge): edge is GeneratedSchemaEdge => edge !== null)

  return {
    id: `${schemaId}_${Math.abs(hashString(JSON.stringify(conceptMap))).toString(36)}`,
    sourceConceptMap: conceptMap,
    schema: {
      id: schemaId,
      label: `${conceptMap.topic} Schema`,
      shortLabel: getSchemaShortLabel(conceptMap.topic) || 'Generated',
      description: conceptMap.bigIdea,
      neonColor: getSchemaColor(conceptMap.topic),
    },
    nodes,
    edges,
    warnings: getWarnings(nodes, edges),
  }
}
