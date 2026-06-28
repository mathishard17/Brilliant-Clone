import type { StudentMemoryRecentEvent } from '../types/user'
import type { StudentMemoryStats } from '../utils/studentMemory'
import { postAiEndpoint } from './aiBackend'

const MAX_NOTE_LENGTH = 260

export interface LearningNotesRequest {
  stats: StudentMemoryStats
  strengths: readonly string[]
  growthAreas: readonly string[]
  recentEvents: readonly StudentMemoryRecentEvent[]
  activeThemeLabel: string
  recommendedNext?: string
}

export interface LearningNotesResponse {
  note: string
  source: 'generated' | 'fallback'
  debugError?: string
}

export function buildFallbackLearningNote(request: LearningNotesRequest) {
  if (request.stats.totalAttempts === 0) return 'Start a lesson to build your learning notes.'
  return 'You are building practice momentum. Keep following the glowing topic on the graph.'
}

function fallbackResponse(request: LearningNotesRequest, debugError: string): LearningNotesResponse {
  return {
    note: buildFallbackLearningNote(request),
    source: 'fallback',
    debugError: import.meta.env.DEV ? debugError : undefined,
  }
}

function validateNote(value: LearningNotesResponse): string | null {
  if (!value || typeof value !== 'object') return 'Learning Notes API response was not an object.'
  if (typeof value.note !== 'string') return 'Learning Notes API response was missing note text.'
  if (value.source !== 'generated' && value.source !== 'fallback') {
    return 'Learning Notes API response had an invalid source.'
  }
  const note = value.note.trim()
  if (!note) return 'Learning Notes API response was empty.'
  if (note.length > MAX_NOTE_LENGTH) return 'Learning Notes API response was too long.'
  if (/\b\d{1,3}\s*%|\b\d+\s*(?:\/|out of)\s*\d+\b/i.test(note)) {
    return 'Learning Notes API response revealed exact accuracy.'
  }
  return null
}

export async function generateLearningNotes(
  request: LearningNotesRequest,
): Promise<LearningNotesResponse> {
  try {
    const result = await postAiEndpoint<LearningNotesRequest, LearningNotesResponse>(
      '/api/generate-learning-notes',
      request,
    )
    const validationIssue = validateNote(result)
    if (!validationIssue) {
      return {
        note: result.note.trim(),
        source: result.source,
        debugError: result.debugError,
      }
    }
    return fallbackResponse(request, validationIssue)
  } catch (error) {
    return fallbackResponse(
      request,
      error instanceof Error ? error.message : 'Unknown learning notes request error.',
    )
  }
}
