import type { LessonProgress } from '../types/lesson'
import type { StudentMemory } from '../types/user'
import { normalizeLessonProgress } from './lessonProgress'

export const AI_ANSWER_FEEDBACK_CACHE_PREFIX = 'schemas.answer-feedback.v2'
export const AI_LEARNING_NOTES_CACHE_PREFIX = 'schemas.learning-notes.v2'
export const AI_NODE_FEEDBACK_CACHE_PREFIX = 'schemas.node-feedback.v2'
export const AI_GENERATED_NODE_MATERIAL_CACHE_PREFIX = 'schemas.generated-node-material.v1'

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([first], [second]) => first.localeCompare(second))

  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(',')}}`
}

export function createStableHash(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export function createLessonProgressSignature(
  lesson: LessonProgress | undefined,
  lessonId: string,
): string {
  return stableStringify(normalizeLessonProgress(lesson, lessonId))
}

export function createLearningProgressSignature(
  lessons: Record<string, LessonProgress>,
  studentMemory: StudentMemory,
): string {
  return stableStringify({
    lessons,
    studentMemory: {
      totalAttempts: studentMemory.totalAttempts,
      correctAttempts: studentMemory.correctAttempts,
      incorrectAttempts: studentMemory.incorrectAttempts,
      hintsRequested: studentMemory.hintsRequested,
      currentStreak: studentMemory.currentStreak,
      strengths: studentMemory.strengths,
      growthAreas: studentMemory.growthAreas,
      concepts: studentMemory.concepts,
      recentEvents: studentMemory.recentEvents,
      updatedAt: studentMemory.updatedAt,
    },
  })
}

export function readAiCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? (JSON.parse(rawValue) as T) : null
  } catch {
    return null
  }
}

export function writeAiCache<T>(key: string, value: T) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Cache writes are best-effort; AI features still work without localStorage.
  }
}

export function removeAiCacheEntriesByPrefix(prefix: string) {
  if (typeof window === 'undefined') return

  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index)
      if (key?.startsWith(prefix)) window.localStorage.removeItem(key)
    }
  } catch {
    // Cache cleanup should never block progress resets.
  }
}

export function clearAiProgressCachesForLesson(scope: string, lessonId: string) {
  removeAiCacheEntriesByPrefix(`${AI_LEARNING_NOTES_CACHE_PREFIX}:${scope}:`)
  removeAiCacheEntriesByPrefix(`${AI_NODE_FEEDBACK_CACHE_PREFIX}:${scope}:`)
  removeAiCacheEntriesByPrefix(`${AI_ANSWER_FEEDBACK_CACHE_PREFIX}:${scope}:${lessonId}:`)
}
