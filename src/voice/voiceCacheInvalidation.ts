const VOICE_CACHE_VERSION_PREFIX = 'lesson-voice-cache-version:'

function getStorageKey(lessonId: string) {
  return `${VOICE_CACHE_VERSION_PREFIX}${lessonId}`
}

export function getLessonVoiceCacheVersion(lessonId: string): string {
  if (typeof window === 'undefined') return '0'
  return window.localStorage.getItem(getStorageKey(lessonId)) ?? '0'
}

export function clearLessonVoiceAudioCache(lessonId: string): string {
  const nextVersion = String(Date.now())
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getStorageKey(lessonId), nextVersion)
  }
  return nextVersion
}
