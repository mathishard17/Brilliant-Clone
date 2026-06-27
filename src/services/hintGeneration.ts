import type { StudentMemoryHintSummary } from '../utils/studentMemory'
import { postAiEndpoint } from './aiBackend'

const MAX_HINT_LENGTH = 180

export interface HintRequest {
  lessonId: string
  conceptKey: string
  conceptLabel: string
  prompt: string
  context: string
  fallbackHint: string
  blockedAnswerTerms?: readonly string[]
  learnerAnswer?: string
  attemptedAnswers?: readonly string[]
  wrongAttempts?: number
  studentMemory?: StudentMemoryHintSummary
}

interface HintResponse {
  hint: string
  misconception?: string
  source: 'generated' | 'fallback'
  debugError?: string
}

function getHintValidationIssue(
  value: unknown,
  blockedAnswerTerms: readonly string[] = [],
): string | null {
  if (!value || typeof value !== 'object') return 'Hint API response was not an object.'

  const response = value as Partial<HintResponse>
  if (typeof response.hint !== 'string') return 'Hint API response was missing hint text.'
  if (response.source !== 'generated' && response.source !== 'fallback') return 'Hint API response had an invalid source.'

  const hint = response.hint.trim()
  if (hint.length === 0) return 'Hint API response was empty.'
  if (hint.length > MAX_HINT_LENGTH) return 'Hint API response was too long.'

  const normalizedHint = hint.toLowerCase()
  const blockedTerm = blockedAnswerTerms.find((term) => {
    const normalizedTerm = term.trim().toLowerCase()
    return normalizedTerm.length > 0 && normalizedHint.includes(normalizedTerm)
  })
  if (blockedTerm) return `Hint API response included blocked answer term: ${blockedTerm}.`

  return null
}

export async function generateSafeHint(request: HintRequest): Promise<HintResponse> {
  try {
    const result = await postAiEndpoint<HintRequest, HintResponse>('/api/generate-ai-hint', request)
    const validationIssue = getHintValidationIssue(result, request.blockedAnswerTerms)
    if (!validationIssue) {
      return {
        hint: result.hint.trim(),
        misconception: result.misconception,
        source: result.source,
        debugError: result.debugError,
      }
    }
    return {
      hint: request.fallbackHint,
      source: 'fallback',
      debugError: validationIssue,
    }
  } catch (error) {
    // Hints are optional; fallback copy keeps the lesson usable without AI.
    return {
      hint: request.fallbackHint,
      source: 'fallback',
      debugError: error instanceof Error ? error.message : 'Unknown hint request error.',
    }
  }
}
