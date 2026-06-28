import admin from 'firebase-admin'

const SIGNED_URL_TTL_MS = 60 * 60 * 1000

function safePathPart(value) {
  return String(value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 140)
}

function parseServiceAccount() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (rawJson) {
    const source = rawJson.trim().startsWith('{')
      ? rawJson
      : Buffer.from(rawJson, 'base64').toString('utf8')
    const serviceAccount = JSON.parse(source)
    if (typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
    }
    return serviceAccount
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (projectId && clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
    }
  }

  return null
}

export function getFirebaseStorageBucket() {
  try {
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET
    const serviceAccount = parseServiceAccount()
    if (!storageBucket || !serviceAccount) return null

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket,
      })
    }

    return admin.storage().bucket(storageBucket)
  } catch {
    return null
  }
}

export function createVoiceCacheKey({
  lessonId,
  themePreference,
  clipKey,
  scriptHash,
  storageCacheScope = 'global',
  storageCacheUserId = '',
}) {
  const scopeParts = storageCacheScope === 'user' && storageCacheUserId
    ? ['users', safePathPart(storageCacheUserId)]
    : ['global']

  return [
    'voice-cache',
    ...scopeParts,
    safePathPart(lessonId),
    safePathPart(themePreference),
    safePathPart(clipKey),
    `${safePathPart(scriptHash)}.mp3`,
  ].join('/')
}

export async function getSignedVoiceUrl(file) {
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: new Date(Date.now() + SIGNED_URL_TTL_MS),
  })
  return url
}
