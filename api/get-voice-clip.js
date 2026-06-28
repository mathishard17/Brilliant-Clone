import { requirePost } from './_openai.js'
import {
  createVoiceCacheKey,
  getFirebaseStorageBucket,
  getSignedVoiceUrl,
} from './firebase-admin.js'

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

function validateGeneratedFeedbackClip(clip, outcome) {
  const errors = validateVoiceClip({
    ...clip,
    // Feedback has its own safety check below. The generic safeBeforeAnswer
    // validator is intentionally stricter than short wrong-answer coaching.
    revealPolicy: outcome === 'tryAgain' ? 'postCorrect' : clip.revealPolicy,
  })

  if (outcome === 'tryAgain') {
    const combinedText = `${clip.text} ${clip.caption}`
    if (DIGIT_OR_EQUATION_PATTERN.test(combinedText)) {
      errors.push('tryAgain feedback includes a digit or equation symbol.')
    }
    if (/\b(the answer is|solution is|equals|total is|there are)\b/i.test(combinedText)) {
      errors.push('tryAgain feedback includes reveal-style wording.')
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

function getStorageCacheScope(body) {
  const requestedScope = body.storageCacheScope === 'user' ? 'user' : 'global'
  const userId = typeof body.storageCacheUserId === 'string'
    ? body.storageCacheUserId.trim().slice(0, 140)
    : ''

  if (requestedScope === 'user' && !userId) {
    return { enabled: false, scope: 'user', userId: '' }
  }

  return { enabled: true, scope: requestedScope, userId }
}

function applyCacheBustToClip(clip, cacheBust) {
  if (!cacheBust || !isFeedbackClip(clip)) return clip

  return {
    ...clip,
    scriptHash: createVoiceScriptHash(`${clip.scriptHash}:${cacheBust}`),
  }
}

function isFeedbackClip(clip) {
  return typeof clip?.clipKey === 'string' && /\.feedback\.(correct|tryAgain)$/.test(clip.clipKey)
}

function createFeedbackClipFromContext({ clip, feedbackContext }) {
  if (!isFeedbackClip(clip) || !feedbackContext) return clip

  const text = feedbackContext.message.trim().slice(0, MAX_VOICE_SCRIPT_LENGTH)
  if (!text) return clip

  const generatedClip = {
    ...clip,
    text,
    caption: text,
    scriptHash: createVoiceScriptHash(
      `${clip.lessonId}:${clip.clipKey}:${clip.revealPolicy}:${feedbackContext.nonce}:${text}`,
    ),
  }

  return validateGeneratedFeedbackClip(generatedClip, feedbackContext.outcome).length === 0
    ? generatedClip
    : clip
}

function createAudioDataUrl(audio) {
  return `data:audio/mpeg;base64,${Buffer.from(audio).toString('base64')}`
}

async function getCachedVoiceMetadata(file, fallbackClip) {
  try {
    const [metadata] = await file.getMetadata()
    const customMetadata = metadata?.metadata ?? {}
    const caption = typeof customMetadata.caption === 'string' && customMetadata.caption.trim()
      ? customMetadata.caption
      : fallbackClip.caption
    const scriptHash = typeof customMetadata.scriptHash === 'string' && customMetadata.scriptHash.trim()
      ? customMetadata.scriptHash
      : fallbackClip.scriptHash
    return { caption, scriptHash }
  } catch {
    return {
      caption: fallbackClip.caption,
      scriptHash: fallbackClip.scriptHash,
    }
  }
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
  const storageCache = getStorageCacheScope(body)
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
    const voiceClip = createFeedbackClipFromContext({
      clip: applyCacheBustToClip(clip, cacheBust),
      feedbackContext,
    })
    const shouldUseStorageCache = !isFeedbackClip(voiceClip)
    let bucket = shouldUseStorageCache && storageCache.enabled ? getFirebaseStorageBucket() : null
    const cacheKey = createVoiceCacheKey({
      lessonId: voiceClip.lessonId,
      themePreference,
      clipKey: voiceClip.clipKey,
      scriptHash: voiceClip.scriptHash,
      storageCacheScope: storageCache.scope,
      storageCacheUserId: storageCache.userId,
    })

    if (bucket) {
      try {
        const file = bucket.file(cacheKey)
        const [exists] = await file.exists()
        if (exists) {
          const cachedMetadata = await getCachedVoiceMetadata(file, voiceClip)
          response.status(200).json({
            status: 'ready',
            audioUrl: await getSignedVoiceUrl(file),
            caption: cachedMetadata.caption,
            scriptHash: cachedMetadata.scriptHash,
            cacheSource: 'firebase-storage',
          })
          return
        }
      } catch {
        bucket = null
      }
    }

    const audio = await generateCartesiaMp3({
      apiKey: cartesiaApiKey,
      text: voiceClip.text,
      voiceId: getCartesiaVoiceId(themePreference),
    })

    if (bucket) {
      try {
        const file = bucket.file(cacheKey)
        await file.save(Buffer.from(audio), {
          contentType: 'audio/mpeg',
          metadata: {
            cacheControl: 'public, max-age=31536000, immutable',
            metadata: {
              provider: 'cartesia',
              themePreference,
              lessonId: voiceClip.lessonId,
              clipKey: voiceClip.clipKey,
              scriptHash: voiceClip.scriptHash,
              caption: voiceClip.caption,
              text: voiceClip.text,
              storageCacheScope: storageCache.scope,
            },
          },
        })

        response.status(200).json({
          status: 'ready',
          audioUrl: await getSignedVoiceUrl(file),
          caption: voiceClip.caption,
          scriptHash: voiceClip.scriptHash,
          cacheSource: 'firebase-storage-new',
        })
        return
      } catch {
        // Storage caching is best-effort; the generated audio can still play as a data URL.
      }
    }

    response.status(200).json({
      status: 'ready',
      audioUrl: createAudioDataUrl(audio),
      caption: voiceClip.caption,
      scriptHash: voiceClip.scriptHash,
      cacheSource: 'data-url',
    })
  } catch (error) {
    response.status(200).json(
      fallbackResponse(clip, error instanceof Error ? error.message : 'Unknown Cartesia error.'),
    )
  }
}
