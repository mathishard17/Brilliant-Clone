import { postAiEndpoint } from './aiBackend'
import type {
  GeneratedConcept,
  GeneratedConceptMap,
  GeneratedConceptRelationship,
  GenerateConceptMapRequest,
  GenerateConceptMapResponse,
  GeneratedRelationshipType,
} from '../types/generatedSchema'

const VALID_RELATIONSHIP_TYPES = new Set<GeneratedRelationshipType>([
  'prerequisite',
  'related',
  'deepening',
  'transfer',
])

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength
}

function isDifficulty(value: unknown): value is GeneratedConcept['difficulty'] {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
}

function isGeneratedConcept(value: unknown): value is GeneratedConcept {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const concept = value as Partial<GeneratedConcept>
  return (
    isNonEmptyString(concept.id, 80) &&
    isNonEmptyString(concept.label, 64) &&
    isNonEmptyString(concept.shortLabel, 24) &&
    isNonEmptyString(concept.topic, 90) &&
    isNonEmptyString(concept.learningGoal, 180) &&
    isNonEmptyString(concept.kidDescription, 180) &&
    isDifficulty(concept.difficulty)
  )
}

function isGeneratedRelationship(value: unknown): value is GeneratedConceptRelationship {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const relationship = value as Partial<GeneratedConceptRelationship>
  return (
    isNonEmptyString(relationship.from, 80) &&
    isNonEmptyString(relationship.to, 80) &&
    relationship.from !== relationship.to &&
    typeof relationship.type === 'string' &&
    VALID_RELATIONSHIP_TYPES.has(relationship.type as GeneratedRelationshipType) &&
    isNonEmptyString(relationship.reason, 180)
  )
}

export function isGeneratedConceptMap(value: unknown): value is GeneratedConceptMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const conceptMap = value as Partial<GeneratedConceptMap>
  if (
    !isNonEmptyString(conceptMap.topic, 80) ||
    !isNonEmptyString(conceptMap.bigIdea, 220) ||
    !isNonEmptyString(conceptMap.audience, 60) ||
    !Array.isArray(conceptMap.concepts) ||
    conceptMap.concepts.length < 4 ||
    conceptMap.concepts.length > 10 ||
    !Array.isArray(conceptMap.relationships)
  ) {
    return false
  }

  if (!conceptMap.concepts.every(isGeneratedConcept)) return false
  const conceptIds = new Set(conceptMap.concepts.map((concept) => concept.id))
  if (conceptIds.size !== conceptMap.concepts.length) return false

  return conceptMap.relationships.every((relationship) => (
    isGeneratedRelationship(relationship) &&
    conceptIds.has(relationship.from) &&
    conceptIds.has(relationship.to)
  ))
}

function fallbackResponse(debugError: string): GenerateConceptMapResponse {
  return {
    conceptMap: null,
    source: 'fallback',
    debugError: import.meta.env.DEV ? debugError : undefined,
  }
}

export async function generateConceptMap(
  request: GenerateConceptMapRequest,
): Promise<GenerateConceptMapResponse> {
  try {
    const result = await postAiEndpoint<GenerateConceptMapRequest, GenerateConceptMapResponse>(
      '/api/generate-concept-map',
      request,
    )

    if (result.conceptMap === null || isGeneratedConceptMap(result.conceptMap)) {
      return {
        conceptMap: result.conceptMap,
        source: result.source === 'generated' ? 'generated' : 'fallback',
        debugError: result.debugError,
      }
    }

    return fallbackResponse('Concept map response failed client validation.')
  } catch (error) {
    return fallbackResponse(
      error instanceof Error ? error.message : 'Unknown concept map generation error.',
    )
  }
}
