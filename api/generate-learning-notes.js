import { getOpenAiApiKey, readJsonBody, requestOpenAiJson, requirePost } from './_openai.js'

const MAX_NOTE_LENGTH = 260
const IS_DEV = process.env.NODE_ENV !== 'production'

function getProgressSummary(stats) {
  const attempts = typeof stats.totalAttempts === 'number' ? stats.totalAttempts : 0
  const accuracy = typeof stats.accuracy === 'number' ? stats.accuracy : null

  return {
    effortLevel: attempts === 0 ? 'new' : attempts < 4 ? 'getting started' : attempts < 10 ? 'building momentum' : 'active',
    accuracyTrend: accuracy === null
      ? 'new progress'
      : accuracy >= 85
        ? 'strong'
        : accuracy >= 70
          ? 'steady'
          : 'needs more practice',
    hintUse: typeof stats.hintsRequested === 'number' && stats.hintsRequested > 0 ? 'uses hints' : 'not many hints yet',
  }
}

function fallbackNote(body) {
  const stats = body.stats && typeof body.stats === 'object' ? body.stats : {}
  const attempts = typeof stats.totalAttempts === 'number' ? stats.totalAttempts : 0
  if (attempts === 0) return 'Start a lesson to build your learning notes.'
  return 'You are building practice momentum. Keep using the graph to find the next glowing topic.'
}

function fallbackResponse(body, debugError) {
  return {
    note: fallbackNote(body),
    source: 'fallback',
    ...(IS_DEV && debugError ? { debugError } : {}),
  }
}

function isUsableNote(value) {
  const note = typeof value?.note === 'string' ? value.note.trim() : ''
  return Boolean(
    value &&
      typeof value === 'object' &&
      note.length > 0 &&
      note.length <= MAX_NOTE_LENGTH &&
      !revealsExactAccuracy(note),
  )
}

function revealsExactAccuracy(note) {
  return /\b\d{1,3}\s*%|\b\d+\s*(?:\/|out of)\s*\d+\b/i.test(note)
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
      model: process.env.OPENAI_LEARNING_NOTES_MODEL || process.env.OPENAI_NODE_SUMMARY_MODEL || 'gpt-4.1-mini',
      system:
        'You write one short personalized learning note for a 3rd-grade math learner. Return valid JSON only. Be warm, specific, and concise. Mention strengths and one next focus when useful. Never reveal exact accuracy, percentages, correct counts, incorrect counts, or ratios.',
      user: JSON.stringify({
        task: 'Return JSON with key note only. Keep note under 260 characters. Do not include percentages, exact accuracy, correct/incorrect counts, attempt counts, or ratios like "3 out of 4". Use qualitative wording only.',
        progressSummary: getProgressSummary(body.stats && typeof body.stats === 'object' ? body.stats : {}),
        strengths: body.strengths,
        growthAreas: body.growthAreas,
        recentEvents: body.recentEvents,
        activeThemeLabel: body.activeThemeLabel,
        recommendedNext: body.recommendedNext,
      }),
    })

    if (!isUsableNote(result)) {
      response.status(200).json(fallbackResponse(body, 'OpenAI returned an unusable learning note.'))
      return
    }

    response.status(200).json({
      note: result.note.trim(),
      source: 'generated',
    })
  } catch (error) {
    response.status(200).json(fallbackResponse(
      body,
      error instanceof Error ? error.message : 'Unknown OpenAI learning notes request error.',
    ))
  }
}
