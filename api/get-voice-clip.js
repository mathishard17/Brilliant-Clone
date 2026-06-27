import { getOpenAiApiKey, requirePost, requestOpenAiJson } from './_openai.js'

const CARTESIA_BYTES_URL = 'https://api.cartesia.ai/tts/bytes'
const CARTESIA_VERSION = process.env.CARTESIA_VERSION || '2024-11-13'
const CARTESIA_MODEL_ID = process.env.CARTESIA_MODEL_ID || 'sonic-3'
const DEFAULT_CARTESIA_VOICE_ID =
  process.env.CARTESIA_DEFAULT_VOICE_ID || 'e07c00bc-4134-4eae-9ea4-1a55fb45746b'
const IS_DEV = process.env.NODE_ENV !== 'production'
const THEME_PREFERENCES = ['royal', 'space', 'dinosaurs', 'animals', 'sports', 'surprise']
const MAX_VOICE_SCRIPT_LENGTH = 180
const NUMBER_WORD_PATTERN =
  /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|forty)\b/i
const DIGIT_OR_EQUATION_PATTERN = /[\d=×*/+]/
const EARLY_REVEAL_PATTERN = /\b(answer|solution|equals|out of|total is|there are)\b/i
const FEEDBACK_VARIATION_STYLES = [
  'Start by naming the strategy the learner used.',
  'Start with a playful image from the theme.',
  'Start by noticing the learner checked carefully.',
  'Start with a short coach-style celebration that is not generic.',
  'Start by connecting the success to the next step.',
]
const BANNED_FEEDBACK_OPENERS = [
  'great job',
  'great work',
  'nice work',
  'awesome job',
  'good job',
  'well done',
  'hmm',
  'try again',
]

function createVoiceScriptHash(text) {
  let hash = 5381
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index)
  }

  return (hash >>> 0).toString(36)
}

function fallbackResponse(clip, debugError) {
  return {
    status: 'fallback',
    caption: typeof clip?.caption === 'string' ? clip.caption : '',
    scriptHash: typeof clip?.scriptHash === 'string' ? clip.scriptHash : '',
    ...(IS_DEV && debugError ? { debugError } : {}),
  }
}

function validateVoiceClip(clip) {
  const errors = []
  if (!clip || typeof clip !== 'object') return ['Voice clip payload is missing.']
  if (typeof clip.lessonId !== 'string' || clip.lessonId.trim().length === 0) {
    errors.push('Voice clip is missing a lessonId.')
  }
  if (typeof clip.clipKey !== 'string' || clip.clipKey.trim().length === 0) {
    errors.push('Voice clip is missing a clipKey.')
  }
  if (typeof clip.text !== 'string' || clip.text.trim().length === 0) {
    errors.push('Voice clip text is missing.')
  } else if (clip.text.length > MAX_VOICE_SCRIPT_LENGTH) {
    errors.push('Voice clip text is too long.')
  }
  if (typeof clip.caption !== 'string' || clip.caption.trim().length === 0) {
    errors.push('Voice clip caption is missing.')
  } else if (clip.caption.length > MAX_VOICE_SCRIPT_LENGTH) {
    errors.push('Voice clip caption is too long.')
  }
  if (typeof clip.scriptHash !== 'string' || clip.scriptHash.trim().length === 0) {
    errors.push('Voice clip is missing a scriptHash.')
  }
  if (!['safeBeforeAnswer', 'postCorrect', 'solutionOnly'].includes(clip.revealPolicy)) {
    errors.push('Voice clip has an unknown revealPolicy.')
  }

  if (clip.revealPolicy === 'safeBeforeAnswer') {
    const combinedText = `${clip.text} ${clip.caption}`
    if (DIGIT_OR_EQUATION_PATTERN.test(combinedText)) {
      errors.push('safeBeforeAnswer clip includes a digit or equation symbol.')
    }
    if (NUMBER_WORD_PATTERN.test(combinedText)) {
      errors.push('safeBeforeAnswer clip includes a number word.')
    }
    if (EARLY_REVEAL_PATTERN.test(combinedText)) {
      errors.push('safeBeforeAnswer clip includes reveal-style wording.')
    }
  }

  return errors
}

function getCartesiaVoiceId(themePreference) {
  const safePreference = THEME_PREFERENCES.includes(themePreference) ? themePreference : 'royal'
  const envName = `CARTESIA_VOICE_ID_${safePreference.toUpperCase()}`
  return process.env[envName] || DEFAULT_CARTESIA_VOICE_ID
}

function getFeedbackContext(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const outcome = value.outcome === 'correct' || value.outcome === 'tryAgain'
    ? value.outcome
    : null
  const message = typeof value.message === 'string' ? value.message.trim().slice(0, 220) : ''
  const nonce = typeof value.nonce === 'string' ? value.nonce.trim().slice(0, 80) : ''
  if (!outcome || !message || !nonce) return null

  return { outcome, message, nonce }
}

function getFallbackFeedbackContext(clip) {
  if (!isFeedbackClip(clip)) return null

  return {
    outcome: clip.clipKey.endsWith('.correct') ? 'correct' : 'tryAgain',
    message: typeof clip.caption === 'string' && clip.caption.trim()
      ? clip.caption.trim()
      : clip.text,
    nonce: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  }
}

function getCacheBust(value) {
  return typeof value === 'string' ? value.trim().slice(0, 80) : ''
}

function applyCacheBustToClip(clip, cacheBust) {
  if (!cacheBust) return clip

  return {
    ...clip,
    scriptHash: createVoiceScriptHash(`${clip.scriptHash}:${cacheBust}`),
  }
}

function isFeedbackClip(clip) {
  return typeof clip?.clipKey === 'string' && /\.feedback\.(correct|tryAgain)$/.test(clip.clipKey)
}

function isGeneratedVoiceScript(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.text === 'string' &&
      value.text.trim().length > 0 &&
      value.text.trim().length <= MAX_VOICE_SCRIPT_LENGTH,
  )
}

function getVariationStyle(nonce) {
  const characters = typeof nonce === 'string' ? nonce : ''
  const total = Array.from(characters).reduce((sum, character) => sum + character.charCodeAt(0), 0)
  return FEEDBACK_VARIATION_STYLES[total % FEEDBACK_VARIATION_STYLES.length]
}

function hasBannedFeedbackOpener(text) {
  const normalized = text.trim().toLowerCase().replace(/^[^\w]+/, '')
  return BANNED_FEEDBACK_OPENERS.some((opener) => normalized.startsWith(opener))
}

function removeBannedFeedbackOpener(text) {
  if (!hasBannedFeedbackOpener(text)) return text
  const trimmed = text.trim()
  const withoutOpener = trimmed.replace(
    /^(great job|great work|nice work|awesome job|good job|well done|hmm|try again)[,!.\s-]*(.*)$/i,
    '$2',
  ).trim()
  return withoutOpener.length > 0 ? withoutOpener : trimmed
}

async function createAiFeedbackClip({ clip, feedbackContext, themePreference }) {
  if (!isFeedbackClip(clip) || !feedbackContext) return clip

  const openAiApiKey = getOpenAiApiKey()
  if (!openAiApiKey) return clip

  try {
    const result = await requestOpenAiJson({
      apiKey: openAiApiKey,
      model: process.env.OPENAI_VOICE_MODEL || process.env.OPENAI_HINT_MODEL || 'gpt-4.1-mini',
      system:
        'You write one short spoken feedback line for a 3rd-grade math learner. Return valid JSON only. Keep it encouraging, natural, specific, and under 140 characters. Do not start with generic phrases like Great job, Great work, Nice work, Awesome job, Good job, Well done, Hmm, or Try again. For tryAgain, do not reveal answers, digits, equations, exact counts, or solution steps.',
      user: JSON.stringify({
        task: 'Return JSON with key text only.',
        outcome: feedbackContext.outcome,
        displayedFeedback: feedbackContext.message,
        lessonId: clip.lessonId,
        themePreference,
        variationStyle: getVariationStyle(feedbackContext.nonce),
        variationNonce: feedbackContext.nonce,
      }),
    })

    if (!isGeneratedVoiceScript(result)) return clip

    const text = removeBannedFeedbackOpener(result.text.trim())

    const generatedClip = {
      ...clip,
      text,
      caption: text,
      scriptHash: createVoiceScriptHash(
        `${clip.lessonId}:${clip.clipKey}:${clip.revealPolicy}:${feedbackContext.nonce}:${text}`,
      ),
    }

    return validateVoiceClip(generatedClip).length === 0 ? generatedClip : clip
  } catch {
    return clip
  }
}

function createAudioDataUrl(audio) {
  return `data:audio/mpeg;base64,${Buffer.from(audio).toString('base64')}`
}

async function generateCartesiaMp3({ apiKey, text, voiceId }) {
  const response = await fetch(CARTESIA_BYTES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Cartesia-Version': CARTESIA_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_id: CARTESIA_MODEL_ID,
      transcript: text,
      voice: {
        mode: 'id',
        id: voiceId,
      },
      output_format: {
        container: 'mp3',
        sample_rate: 44100,
        bit_rate: 128000,
      },
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Cartesia request failed (${response.status}): ${message}`)
  }

  return response.arrayBuffer()
}

export default async function handler(request, response) {
  if (!requirePost(request, response)) return

  const body = request.body && typeof request.body === 'object' ? request.body : {}
  const clip = body.clip
  const themePreference = typeof body.themePreference === 'string' ? body.themePreference : 'royal'
  const cacheBust = getCacheBust(body.cacheBust)
  const feedbackContext = getFeedbackContext(body.feedbackContext) ?? getFallbackFeedbackContext(clip)

  const validationErrors = validateVoiceClip(clip)
  if (clip?.lessonId !== body.lessonId) {
    validationErrors.push('Voice clip lessonId does not match the request.')
  }
  if (clip?.clipKey !== body.clipKey) {
    validationErrors.push('Voice clip clipKey does not match the request.')
  }
  if (validationErrors.length > 0) {
    response
      .status(200)
      .json(fallbackResponse(clip, `Voice clip request failed server validation: ${validationErrors.join(' ')}`))
    return
  }

  const cartesiaApiKey = process.env.CARTESIA_API
  if (!cartesiaApiKey) {
    response.status(200).json(fallbackResponse(clip, 'CARTESIA_API is missing in the API environment.'))
    return
  }

  try {
    const voiceClip = await createAiFeedbackClip({
      clip: applyCacheBustToClip(clip, cacheBust),
      feedbackContext,
      themePreference,
    })
    const audio = await generateCartesiaMp3({
      apiKey: cartesiaApiKey,
      text: voiceClip.text,
      voiceId: getCartesiaVoiceId(themePreference),
    })

    response.status(200).json({
      status: 'ready',
      audioUrl: createAudioDataUrl(audio),
      caption: voiceClip.caption,
      scriptHash: voiceClip.scriptHash,
    })
  } catch (error) {
    response.status(200).json(
      fallbackResponse(clip, error instanceof Error ? error.message : 'Unknown Cartesia error.'),
    )
  }
}
