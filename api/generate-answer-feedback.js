import { getOpenAiApiKey, readJsonBody, requestOpenAiJson, requirePost } from './_openai.js'

const MAX_FEEDBACK_LENGTH = 180
const MAX_PATTERN_LENGTH = 80
const IS_DEV = process.env.NODE_ENV !== 'production'
const DIGIT_OR_EQUATION_PATTERN = /[\d=×*/+]/
const REVEAL_PATTERN = /\b(the answer is|solution is|equals|total is|there are)\b/i

function fallbackResponse(request, debugError) {
  return {
    feedback: typeof request.fallbackFeedback === 'string'
      ? request.fallbackFeedback
      : 'Try checking your strategy, then give it another go.',
    mistakePattern: '',
    source: 'fallback',
    ...(IS_DEV && debugError ? { debugError } : {}),
  }
}

function isUsableFeedback(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.feedback === 'string' &&
      value.feedback.trim().length > 0 &&
      value.feedback.trim().length <= MAX_FEEDBACK_LENGTH,
  )
}

function includesCorrectAnswer(feedback, correctAnswer) {
  if (typeof correctAnswer !== 'string' && typeof correctAnswer !== 'number') return false
  const normalizedAnswer = String(correctAnswer).trim().toLowerCase()
  if (!normalizedAnswer) return false
  return feedback.toLowerCase().includes(normalizedAnswer)
}

function getFeedbackSafetyIssue(feedback, body) {
  if (body.outcome !== 'incorrect') return ''
  if (DIGIT_OR_EQUATION_PATTERN.test(feedback)) {
    return 'Incorrect feedback included digits or equation symbols.'
  }
  if (REVEAL_PATTERN.test(feedback)) {
    return 'Incorrect feedback included reveal-style wording.'
  }
  if (includesCorrectAnswer(feedback, body.correctAnswer)) {
    return 'Incorrect feedback included the correct answer.'
  }
  return ''
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  const body = readJsonBody(request)
  const apiKey = getOpenAiApiKey()
  if (!apiKey) {
    response.status(200).json(fallbackResponse(body, 'OPENAI_API_KEY is missing in the API environment.'))
    return
  }

  try {
    const result = await requestOpenAiJson({
      apiKey,
      model: process.env.OPENAI_FEEDBACK_MODEL || process.env.OPENAI_HINT_MODEL || 'gpt-4.1-mini',
      system:
        'You write short personalized answer feedback for a 3rd-grade math learner. Return valid JSON only. Be kind, specific, and actionable. Treat the provided attempt history and concept memory like the same tutoring conversation: notice repeated tries, hint use, recovery, and prior mistake patterns. For incorrect answers, use the problem, learner answer, correct answer, and history to infer the likely mistake, but do not reveal the correct answer, use digits, equations, exact counts, or long solution steps.',
      user: JSON.stringify({
        task:
          'Return JSON with keys feedback and mistakePattern. feedback must be under 180 characters. mistakePattern must be a short label under 80 characters, or empty for correct answers.',
        outcome: body.outcome,
        lessonId: body.lessonId,
        conceptLabel: body.conceptLabel,
        problem: body.problem,
        learnerAnswer: body.learnerAnswer,
        correctAnswer: body.correctAnswer,
        attemptedAnswers: Array.isArray(body.attemptedAnswers)
          ? body.attemptedAnswers.slice(-6)
          : undefined,
        context: body.context,
        previousMistakePattern: body.previousMistakePattern,
        conceptMemory: body.conceptMemory,
        conversationContext: Array.isArray(body.conversationContext)
          ? body.conversationContext.slice(-5)
          : undefined,
      }),
    })

    if (!isUsableFeedback(result)) {
      response.status(200).json(fallbackResponse(body, 'OpenAI returned an unusable feedback response.'))
      return
    }

    const feedback = result.feedback.trim()
    const safetyIssue = getFeedbackSafetyIssue(feedback, body)
    if (safetyIssue) {
      response.status(200).json(fallbackResponse(body, safetyIssue))
      return
    }

    const mistakePattern = typeof result.mistakePattern === 'string'
      ? result.mistakePattern.trim().slice(0, MAX_PATTERN_LENGTH)
      : ''

    response.status(200).json({
      feedback,
      mistakePattern,
      source: 'generated',
    })
  } catch (error) {
    response.status(200).json(fallbackResponse(
      body,
      error instanceof Error ? error.message : 'Unknown OpenAI feedback request error.',
    ))
  }
}
