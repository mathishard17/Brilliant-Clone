import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai'
import { app } from '../lib/firebase'

const DEFAULT_MODEL = 'gemini-2.5-flash'
const MAX_HINT_LENGTH = 180

export interface HintRequest {
  prompt: string
  context: string
  fallbackHint: string
  blockedAnswerTerms?: readonly string[]
}

interface HintResponse {
  hint: string
  shouldRevealAnswer: false
}

function buildPrompt({ prompt, context, blockedAnswerTerms = [] }: HintRequest): string {
  const blocked = blockedAnswerTerms.length > 0 ? blockedAnswerTerms.join(', ') : 'the final answer'

  return `Create one short hint for a 3rd-grade math learner.

Problem prompt:
${prompt}

Context:
${context}

Rules:
- Do not reveal the final answer.
- Do not include any of these answer terms: ${blocked}.
- Do not include equations or numeric digits.
- Keep the hint under 25 words.
- Return JSON only. Do not use Markdown.

Use this exact JSON shape:
{
  "hint": "one short hint",
  "shouldRevealAnswer": false
}`
}

function isSafeHintResponse(
  value: unknown,
  blockedAnswerTerms: readonly string[] = [],
): value is HintResponse {
  if (!value || typeof value !== 'object') return false

  const response = value as Partial<HintResponse>
  if (response.shouldRevealAnswer !== false) return false
  if (typeof response.hint !== 'string') return false

  const hint = response.hint.trim()
  if (hint.length === 0 || hint.length > MAX_HINT_LENGTH) return false
  if (/\d/.test(hint)) return false

  const normalizedHint = hint.toLowerCase()
  return !blockedAnswerTerms.some((term) => {
    const normalizedTerm = term.trim().toLowerCase()
    return normalizedTerm.length > 0 && normalizedHint.includes(normalizedTerm)
  })
}

export async function generateSafeHint(request: HintRequest): Promise<string> {
  try {
    const ai = getAI(app, { backend: new GoogleAIBackend() })
    const model = getGenerativeModel(ai, {
      model: import.meta.env.VITE_FIREBASE_AI_MODEL || DEFAULT_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    })
    const result = await model.generateContent(buildPrompt(request))
    const parsed = JSON.parse(result.response.text()) as unknown
    if (isSafeHintResponse(parsed, request.blockedAnswerTerms)) {
      return parsed.hint.trim()
    }
  } catch {
    // Hints are optional; fallback copy keeps the lesson usable without AI.
  }

  return request.fallbackHint
}
