const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'

export function readJsonBody(request) {
  if (request.body && typeof request.body === 'object') return request.body
  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body)
    } catch {
      return {}
    }
  }
  return {}
}

export function requirePost(request, response) {
  if (request.method === 'POST') return true
  response.status(405).json({ error: 'Method not allowed' })
  return false
}

export function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY || ''
}

function extractOutputText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text

  const chunks = []
  for (const output of payload.output ?? []) {
    for (const content of output.content ?? []) {
      if (typeof content.text === 'string') chunks.push(content.text)
    }
  }
  return chunks.join('\n').trim()
}

function parseJsonObject(text) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return undefined
    try {
      return JSON.parse(match[0])
    } catch {
      return undefined
    }
  }
}

export async function requestOpenAiJson({
  apiKey,
  model = process.env.OPENAI_THEME_MODEL || 'gpt-4.1-mini',
  system,
  user,
}) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      text: {
        format: {
          type: 'json_object',
        },
      },
      max_output_tokens: 3500,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI request failed with ${response.status}`)
  }

  const payload = await response.json()
  const text = extractOutputText(payload)
  return parseJsonObject(text)
}
