import { getOpenAiApiKey, readJsonBody, requestOpenAiJson, requirePost } from './_openai.js'

const IS_DEV = process.env.NODE_ENV !== 'production'
const TONES = new Set(['support', 'core', 'challenge'])

function fallbackMaterial(body) {
  const label = body?.node?.label || 'this idea'
  return {
    intro: `Let's explore ${label} one careful step at a time.`,
    workedExample: `Start with a small example of ${label}, then explain what stayed the same.`,
    interactiveIdea: 'Use a simple drawing, list, or movable objects to test the idea.',
    practicePrompt: `Try one new problem that uses ${label}.`,
    hint: 'Look for the important choices first, then check your work.',
    successCriteria: 'You can explain the idea in your own words and solve one example.',
    tone: 'core',
  }
}

function fallbackResponse(body, debugError) {
  return {
    material: fallbackMaterial(body),
    source: 'fallback',
    ...(IS_DEV && debugError ? { debugError } : {}),
  }
}

function safeString(value, maxLength) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) return trimmed
  const clipped = trimmed.slice(0, maxLength).replace(/\s+\S*$/, '').trim()
  return clipped || trimmed.slice(0, maxLength).trim()
}

function isMaterial(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.intro === 'string' &&
      typeof value.workedExample === 'string' &&
      typeof value.interactiveIdea === 'string' &&
      typeof value.practicePrompt === 'string' &&
      typeof value.hint === 'string' &&
      typeof value.successCriteria === 'string' &&
      TONES.has(value.tone),
  )
}

function normalizeMaterial(value) {
  return {
    intro: safeString(value.intro, 220),
    workedExample: safeString(value.workedExample, 260),
    interactiveIdea: safeString(value.interactiveIdea, 220),
    practicePrompt: safeString(value.practicePrompt, 220),
    hint: safeString(value.hint, 160),
    successCriteria: safeString(value.successCriteria, 180),
    tone: TONES.has(value.tone) ? value.tone : 'core',
  }
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  const body = readJsonBody(request)
  const apiKey = getOpenAiApiKey()
  const nodeLabel = safeString(body?.node?.label, 80)

  if (!nodeLabel) {
    response.status(400).json({ error: 'Node label is required.' })
    return
  }

  if (!apiKey) {
    response.status(200).json(fallbackResponse(body, 'OPENAI_API_KEY is missing in the API environment.'))
    return
  }

  try {
    const result = await requestOpenAiJson({
      apiKey,
      model: process.env.OPENAI_NODE_MATERIAL_MODEL || process.env.OPENAI_SCHEMA_MODEL || 'gpt-4.1-mini',
      system:
        'You write short adaptive learning material for a 3rd-grade Brilliant-style app. Return valid JSON only. Use the node, neighboring concepts, connection reasons, student memory, and theme to make the material fit this learner. Do not write a full lesson; make one compact node preview.',
      user: JSON.stringify({
        task:
          'Return JSON with intro, workedExample, interactiveIdea, practicePrompt, hint, successCriteria, and tone. tone must be support, core, or challenge. Keep every field short and kid-friendly.',
        request: body,
      }),
    })

    if (!isMaterial(result)) {
      response.status(200).json(fallbackResponse(body, 'OpenAI returned unusable node material.'))
      return
    }

    response.status(200).json({
      material: normalizeMaterial(result),
      source: 'generated',
    })
  } catch (error) {
    response.status(200).json(fallbackResponse(
      body,
      error instanceof Error ? error.message : 'Unknown OpenAI node material error.',
    ))
  }
}
