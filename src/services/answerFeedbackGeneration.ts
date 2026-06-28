import { postAiEndpoint } from './aiBackend'

const MAX_FEEDBACK_LENGTH = 180

export interface AnswerFeedbackRequest {
  lessonId: string
  conceptKey: string
  conceptLabel: string
  outcome: 'correct' | 'incorrect'
  problem: string
  learnerAnswer: string
  correctAnswer: string
  attemptedAnswers?: string[]
  fallbackFeedback: string
  context?: string
  previousMistakePattern?: string
  conceptMemory?: {
    attempts: number
    correct: number
    incorrect: number
    hintsRequested: number
    lastOutcome?: 'correct' | 'incorrect'
    lastMisconception?: string
  }
  conversationContext?: Array<{
    type: 'challengeAttempt' | 'hintRequested'
    outcome?: 'correct' | 'incorrect'
    learnerAnswer?: string
    misconception?: string
  }>
}

export interface AnswerFeedbackResponse {
  feedback: string
  mistakePattern: string
  source: 'generated' | 'fallback'
  debugError?: string
}

function fallbackResponse(request: AnswerFeedbackRequest, debugError: string): AnswerFeedbackResponse {
  return {
    feedback: request.fallbackFeedback,
    mistakePattern: '',
    source: 'fallback',
    debugError: import.meta.env.DEV ? debugError : undefined,
  }
}

function validateFeedback(value: AnswerFeedbackResponse): string | null {
  if (!value || typeof value !== 'object') return 'Feedback API response was not an object.'
  if (typeof value.feedback !== 'string') return 'Feedback API response was missing feedback text.'
  if (value.source !== 'generated' && value.source !== 'fallback') {
    return 'Feedback API response had an invalid source.'
  }
  const feedback = value.feedback.trim()
  if (!feedback) return 'Feedback API response was empty.'
  if (feedback.length > MAX_FEEDBACK_LENGTH) return 'Feedback API response was too long.'
  return null
}

export async function generateAnswerFeedback(
  request: AnswerFeedbackRequest,
): Promise<AnswerFeedbackResponse> {
  try {
    const result = await postAiEndpoint<AnswerFeedbackRequest, AnswerFeedbackResponse>(
      '/api/generate-answer-feedback',
      request,
    )
    const validationIssue = validateFeedback(result)
    if (!validationIssue) {
      return {
        feedback: result.feedback.trim(),
        mistakePattern: typeof result.mistakePattern === 'string' ? result.mistakePattern.trim() : '',
        source: result.source,
        debugError: result.debugError,
      }
    }
    return fallbackResponse(request, validationIssue)
  } catch (error) {
    return fallbackResponse(
      request,
      error instanceof Error ? error.message : 'Unknown answer feedback request error.',
    )
  }
}
