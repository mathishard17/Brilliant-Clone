import { getOpenAiApiKey, readJsonBody, requestOpenAiJson, requirePost } from './_openai.js'

const MAX_HINT_LENGTH = 180
const IS_DEV = process.env.NODE_ENV !== 'production'

function fallbackResponse(request, debugError) {
  return {
    hint: typeof request.fallbackHint === 'string' ? request.fallbackHint : 'Try one smaller step first.',
    source: 'fallback',
    ...(IS_DEV && debugError ? { debugError } : {}),
  }
}

function isUsableHint(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.hint === 'string' &&
      value.hint.trim().length > 0 &&
      value.hint.trim().length <= MAX_HINT_LENGTH,
  )
}

function normalizeBlockedTerms(value) {
  return Array.isArray(value)
    ? value
        .filter((term) => typeof term === 'string' && term.trim().length > 0)
        .map((term) => term.trim())
    : []
}

function includesBlockedAnswerTerm(hint, blockedAnswerTerms) {
  const normalizedHint = hint.toLowerCase()
  return blockedAnswerTerms.some((term) => normalizedHint.includes(term.toLowerCase()))
}

function isSafeReview(value) {
  return Boolean(value && typeof value === 'object' && value.safe === true)
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
    const model = process.env.OPENAI_HINT_MODEL || process.env.OPENAI_THEME_MODEL || 'gpt-4.1-mini'
    const result = await requestOpenAiJson({
      apiKey,
      model,
      system:
        'You write safe, short math hints for a 3rd-grade learner. You may use small numbers if they help explain a strategy, but do not reveal the final answer, exact solution, or a full equation that solves the problem.',
      user: JSON.stringify({
        task: 'Return only JSON with keys hint and misconception.',
        lessonId: body.lessonId,
        conceptLabel: body.conceptLabel,
        prompt: body.prompt,
        context: body.context,
        learnerAnswer: body.learnerAnswer,
        attemptedAnswers: body.attemptedAnswers,
        wrongAttempts: body.wrongAttempts,
        blockedAnswerTerms: body.blockedAnswerTerms,
        studentMemory: body.studentMemory,
      }),
    })

    const hint = typeof result?.hint === 'string' ? result.hint.trim() : ''
    if (!isUsableHint(result)) {
      response.status(200).json(fallbackResponse(body, 'OpenAI returned an unusable hint response.'))
      return
    }

    const blockedAnswerTerms = normalizeBlockedTerms(body.blockedAnswerTerms)
    if (includesBlockedAnswerTerm(hint, blockedAnswerTerms)) {
      response.status(200).json(fallbackResponse(body, 'OpenAI hint included a blocked answer term.'))
      return
    }

    const safetyReview = await requestOpenAiJson({
      apiKey,
      model,
      system:
        'You are a strict safety reviewer for 3rd-grade math hints. Return JSON only. Mark safe false if the hint directly reveals the final answer, gives a full solving equation, states an exact answer term, or removes the need for the learner to reason. Small non-answer numbers are allowed.',
      user: JSON.stringify({
        task: 'Return JSON with keys safe and reason.',
        hint,
        prompt: body.prompt,
        context: body.context,
        blockedAnswerTerms,
      }),
    })

    if (!isSafeReview(safetyReview)) {
      const reason = typeof safetyReview?.reason === 'string'
        ? safetyReview.reason
        : 'Second-pass safety check rejected the hint.'
      response.status(200).json(fallbackResponse(body, reason))
      return
    }

    response.status(200).json({
      hint,
      misconception: typeof result.misconception === 'string' ? result.misconception : '',
      source: 'generated',
    })
  } catch (error) {
    response.status(200).json(fallbackResponse(
      body,
      error instanceof Error ? error.message : 'Unknown OpenAI hint request error.',
    ))
  }
}
