export type GeneratedRelationshipType = 'prerequisite' | 'related' | 'deepening' | 'transfer'

export type GeneratedMaterialTone = 'support' | 'core' | 'challenge'

export interface GeneratedConcept {
  id: string
  label: string
  shortLabel: string
  topic: string
  learningGoal: string
  kidDescription: string
  difficulty: 1 | 2 | 3 | 4 | 5
}

export interface GeneratedConceptRelationship {
  from: string
  to: string
  type: GeneratedRelationshipType
  reason: string
}

export interface GeneratedConceptMap {
  topic: string
  bigIdea: string
  audience: string
  assumedPrerequisites?: string[]
  concepts: GeneratedConcept[]
  relationships: GeneratedConceptRelationship[]
  generationNotes?: string
}

export interface GeneratedSchema {
  id: string
  label: string
  shortLabel: string
  description: string
  neonColor: string
}

export interface GeneratedSchemaNode {
  id: string
  schemaId: string
  label: string
  shortLabel: string
  topic: string
  skill: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  isStarter: boolean
  unlockedBy: string[]
  mapPosition: {
    x: number
    y: number
  }
}

export interface GeneratedSchemaEdge {
  id: string
  from: string
  to: string
  relationship: GeneratedRelationshipType
  reason: string
}

export interface GeneratedSchemaDraft {
  id: string
  sourceConceptMap: GeneratedConceptMap
  schema: GeneratedSchema
  nodes: GeneratedSchemaNode[]
  edges: GeneratedSchemaEdge[]
  warnings: string[]
}

export interface GenerateConceptMapRequest {
  topic: string
  audience: string
  goal?: string
}

export interface GenerateConceptMapResponse {
  conceptMap: GeneratedConceptMap | null
  source: 'generated' | 'fallback'
  debugError?: string
}

export interface GeneratedNodeMaterial {
  intro: string
  workedExample: string
  interactiveIdea: string
  practicePrompt: string
  hint: string
  successCriteria: string
  tone: GeneratedMaterialTone
}

export interface GenerateNodeMaterialRequest {
  schemaDraftId: string
  schemaTopic: string
  schemaBigIdea: string
  activeThemeLabel?: string
  node: Pick<
    GeneratedSchemaNode,
    'id' | 'label' | 'topic' | 'skill' | 'description' | 'difficulty' | 'unlockedBy'
  >
  incomingReasons: string[]
  outgoingReasons: string[]
  prerequisiteNodes: Array<Pick<GeneratedSchemaNode, 'id' | 'label' | 'skill'>>
  studentMemory?: {
    totalAttempts: number
    correctAttempts: number
    incorrectAttempts: number
    hintsRequested: number
    currentStreak: number
    strengths: string[]
    growthAreas: string[]
  }
}

export interface GenerateNodeMaterialResponse {
  material: GeneratedNodeMaterial | null
  source: 'generated' | 'fallback'
  debugError?: string
}
