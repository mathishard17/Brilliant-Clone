import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_LESSON_ID,
  createDefaultLessonProgress,
  type LessonProgress,
  type OutfitPair,
  type OutfitTriple,
} from '../types/lesson'
import type { ScreenNumber, UserProfile } from '../types/user'
import { saveLessonProgress, updateCurrentScreen, updateLessonProgress } from '../services/userProgress'
import { appendOutfitPair, appendOutfitTriple, mergeLessonProgress } from '../utils/lessonProgress'
import { withRetry } from '../utils/retry'

const SAVE_RETRY_MESSAGE = "Couldn't save your progress — we'll try again"
const OUTFIT_DEBOUNCE_MS = 500

interface PendingOutfitSave {
  lessonId: string
  lesson: LessonProgress
}

interface UseUserProgressOptions {
  uid: string
  profile: UserProfile
  onProfileChange: (profile: UserProfile) => void
}

function getProfileLesson(profile: UserProfile, lessonId?: string) {
  const activeLessonId = lessonId ?? profile.activeLessonId ?? DEFAULT_LESSON_ID
  return {
    lessonId: activeLessonId,
    lesson: profile.lessons[activeLessonId] ?? createDefaultLessonProgress(activeLessonId),
  }
}

function mergeProfileLesson(
  profile: UserProfile,
  lessonId: string,
  lesson: LessonProgress,
): UserProfile {
  return {
    ...profile,
    activeLessonId: lessonId,
    lesson,
    lessons: {
      ...profile.lessons,
      [lessonId]: lesson,
    },
  }
}

export function useUserProgress({
  uid,
  profile,
  onProfileChange,
}: UseUserProgressOptions) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const profileRef = useRef(profile)
  const outfitFlushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingOutfitLesson = useRef<PendingOutfitSave | null>(null)

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  useEffect(() => {
    return () => {
      if (outfitFlushTimer.current) clearTimeout(outfitFlushTimer.current)
    }
  }, [])

  const persistWithRetry = useCallback(
    async (saveFn: () => Promise<void>) => {
      setSaving(true)
      setSaveError(null)
      try {
        await withRetry(saveFn, 2)
      } catch {
        setSaveError(SAVE_RETRY_MESSAGE)
        throw new Error(SAVE_RETRY_MESSAGE)
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  const flushOutfitSave = useCallback(async () => {
    const pending = pendingOutfitLesson.current
    if (!pending) return
    pendingOutfitLesson.current = null
    await persistWithRetry(() => saveLessonProgress(uid, pending.lesson, pending.lessonId))
  }, [uid, persistWithRetry])

  const scheduleOutfitSave = useCallback(
    (lessonId: string, lesson: LessonProgress) => {
      pendingOutfitLesson.current = { lessonId, lesson }
      if (outfitFlushTimer.current) clearTimeout(outfitFlushTimer.current)
      outfitFlushTimer.current = setTimeout(() => {
        void flushOutfitSave()
      }, OUTFIT_DEBOUNCE_MS)
    },
    [flushOutfitSave],
  )

  const dismissSaveError = useCallback(() => setSaveError(null), [])

  function cancelPendingOutfitSave(lessonId: string) {
    if (pendingOutfitLesson.current?.lessonId === lessonId) {
      pendingOutfitLesson.current = null
      if (outfitFlushTimer.current) {
        clearTimeout(outfitFlushTimer.current)
        outfitFlushTimer.current = null
      }
    }
  }

  const updateScreen = useCallback(
    async (screen: ScreenNumber, lessonId?: string) => {
      const previous = profileRef.current
      const target = getProfileLesson(previous, lessonId)
      const lesson = mergeLessonProgress(target.lesson, {
        lessonId: target.lessonId,
        currentScreen: screen,
        ...(screen >= 1 ? { lastLessonScreen: screen } : {}),
      })
      const next = mergeProfileLesson(previous, target.lessonId, lesson)
      profileRef.current = next
      onProfileChange(next)

      try {
        await persistWithRetry(() =>
          updateCurrentScreen(uid, screen, target.lesson, target.lessonId),
        )
      } catch {
        profileRef.current = previous
        onProfileChange(previous)
        throw new Error(SAVE_RETRY_MESSAGE)
      }
    },
    [uid, onProfileChange, persistWithRetry],
  )

  const updateLesson = useCallback(
    async (partial: Partial<LessonProgress>, lessonId?: string) => {
      const previous = profileRef.current
      const target = getProfileLesson(previous, lessonId)
      cancelPendingOutfitSave(target.lessonId)
      const lesson = mergeLessonProgress(target.lesson, {
        ...partial,
        lessonId: target.lessonId,
      })
      const next = mergeProfileLesson(previous, target.lessonId, lesson)
      profileRef.current = next
      onProfileChange(next)

      try {
        await persistWithRetry(() =>
          updateLessonProgress(uid, partial, target.lesson, target.lessonId),
        )
      } catch {
        profileRef.current = previous
        onProfileChange(previous)
        throw new Error(SAVE_RETRY_MESSAGE)
      }
    },
    [uid, onProfileChange, persistWithRetry],
  )

  const recordOutfitPair = useCallback(
    (outfit: OutfitPair) => {
      const previous = profileRef.current
      const target = getProfileLesson(previous)
      const lesson = appendOutfitPair(target.lesson, outfit)
      if (lesson.screen1.discoveredOutfits.length === target.lesson.screen1.discoveredOutfits.length) {
        return
      }
      const next = mergeProfileLesson(previous, target.lessonId, lesson)
      profileRef.current = next
      onProfileChange(next)
      scheduleOutfitSave(target.lessonId, lesson)
    },
    [onProfileChange, scheduleOutfitSave],
  )

  const recordOutfitTriple = useCallback(
    (outfit: OutfitTriple) => {
      const previous = profileRef.current
      const target = getProfileLesson(previous)
      const lesson = appendOutfitTriple(target.lesson, outfit)
      if (lesson.screen3.discoveredOutfits.length === target.lesson.screen3.discoveredOutfits.length) {
        return
      }
      const next = mergeProfileLesson(previous, target.lessonId, lesson)
      profileRef.current = next
      onProfileChange(next)
      scheduleOutfitSave(target.lessonId, lesson)
    },
    [onProfileChange, scheduleOutfitSave],
  )

  return {
    profile,
    updateScreen,
    updateLesson,
    recordOutfitPair,
    recordOutfitTriple,
    saving,
    saveError,
    dismissSaveError,
  }
}
