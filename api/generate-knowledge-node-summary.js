import { getOpenAiApiKey, readJsonBody, requestOpenAiJson, requirePost } from './_openai.js'

function fallbackResponse() {
  return {
    summary: null,
    source: 'fallback',
  }
}

function isSummary(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.title === 'string' &&
      typeof value.currentUnderstanding === 'string' &&
      typeof value.nextPractice === 'string' &&
      typeof value.encouragement === 'string',
  )
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  const body = readJsonBody(request)
  const apiKey = getOpenAiApiKey()
  if (!apiKey) {
    response.status(200).json(fallbackResponse())
    return
  }

  try {
    const result = await requestOpenAiJson({
      apiKey,
      model: process.env.OPENAI_NODE_SUMMARY_MODEL || process.env.OPENAI_THEME_MODEL || 'gpt-4.1-mini',
      system:
        'You write concise, encouraging math progress summaries for a 3rd-grade learner. Return valid JSON only.',
      user: JSON.stringify({
        task:
          'Return JSON with keys title, currentUnderstanding, nextPractice, and encouragement. Keep it kid-friendly and short.',
        request: body,
      }),
    })

    if (!isSummary(result)) {
      response.status(200).json(fallbackResponse())
      return
    }

    response.status(200).json({
      summary: {
        title: result.title.trim(),
        currentUnderstanding: result.currentUnderstanding.trim(),
        nextPractice: result.nextPractice.trim(),
        encouragement: result.encouragement.trim(),
      },
      source: 'generated',
    })
  } catch {
    response.status(200).json(fallbackResponse())
  }
}
