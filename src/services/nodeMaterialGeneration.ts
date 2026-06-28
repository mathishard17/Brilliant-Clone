import { postAiEndpoint } from './aiBackend'
import type {
  GeneratedNodeMaterial,
  GenerateNodeMaterialRequest,
  GenerateNodeMaterialResponse,
  GeneratedMaterialTone,
} from '../types/generatedSchema'

const VALID_TONES = new Set<GeneratedMaterialTone>(['support', 'core', 'challenge'])

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength
}

function isGeneratedNodeMaterial(value: unknown): value is GeneratedNodeMaterial {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const material = value as Partial<GeneratedNodeMaterial>
  return (
    isNonEmptyString(material.intro, 220) &&
    isNonEmptyString(material.workedExample, 260) &&
    isNonEmptyString(material.interactiveIdea, 220) &&
    isNonEmptyString(material.practicePrompt, 220) &&
    isNonEmptyString(material.hint, 160) &&
    isNonEmptyString(material.successCriteria, 180) &&
    typeof material.tone === 'string' &&
    VALID_TONES.has(material.tone as GeneratedMaterialTone)
  )
}

function buildFallbackMaterial(request: GenerateNodeMaterialRequest): GeneratedNodeMaterial {
  return {
    intro: `Let's explore ${request.node.label} one careful step at a time.`,
    workedExample: `Start with a small example of ${request.node.label}, then explain what stayed the same.`,
    interactiveIdea: 'Use a simple drawing, list, or movable objects to test the idea.',
    practicePrompt: `Try one new problem that uses ${request.node.label}.`,
    hint: 'Look for the important choices first, then check your work.',
    successCriteria: 'You can explain the idea in your own words and solve one example.',
    tone: 'core',
  }
}

function fallbackResponse(
  request: GenerateNodeMaterialRequest,
  debugError: string,
): GenerateNodeMaterialResponse {
  return {
    material: buildFallbackMaterial(request),
    source: 'fallback',
    debugError: import.meta.env.DEV ? debugError : undefined,
  }
}

export async function generateNodeMaterial(
  request: GenerateNodeMaterialRequest,
): Promise<GenerateNodeMaterialResponse> {
  try {
    const result = await postAiEndpoint<GenerateNodeMaterialRequest, GenerateNodeMaterialResponse>(
      '/api/generate-node-material',
      request,
    )

    if (result.material === null || isGeneratedNodeMaterial(result.material)) {
      return {
        material: result.material,
        source: result.source === 'generated' ? 'generated' : 'fallback',
        debugError: result.debugError,
      }
    }

    return fallbackResponse(request, 'Node material response failed client validation.')
  } catch (error) {
    return fallbackResponse(
      request,
      error instanceof Error ? error.message : 'Unknown node material generation error.',
    )
  }
}
