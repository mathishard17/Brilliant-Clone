import { useCallback, useEffect, useRef, useState } from 'react'
import type { LessonProgress, OutfitPair, OutfitTriple } from '../types/lesson'
import type { ScreenNumber, UserProfile } from '../types/user'
import { saveLessonProgress, updateCurrentScreen, updateLessonProgress } from '../services/userProgress'
import { appendOutfitPair, appendOutfitTriple, mergeLessonProgress } from '../utils/lessonProgress'
import { withRetry } from '../utils/retry'

const SAVE_RETRY_MESSAGE = "Couldn't save your progress — we'll try again"
const OUTFIT_DEBOUNCE_MS = 500

interface UseUserProgressOptions {
  uid: string
  profile: UserProfile
  onProfileChange: (profile: UserProfile) => void
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
  const pendingOutfitLesson = useRef<LessonProgress | null>(null)

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
    const lesson = pendingOutfitLesson.current
    if (!lesson) return
    pendingOutfitLesson.current = null
    await persistWithRetry(() => saveLessonProgress(uid, lesson))
  }, [uid, persistWithRetry])

  const scheduleOutfitSave = useCallback(
    (lesson: LessonProgress) => {
      pendingOutfitLesson.current = lesson
      if (outfitFlushTimer.current) clearTimeout(outfitFlushTimer.current)
      outfitFlushTimer.current = setTimeout(() => {
        void flushOutfitSave()
      }, OUTFIT_DEBOUNCE_MS)
    },
    [flushOutfitSave],
  )

  const dismissSaveError = useCallback(() => setSaveError(null), [])

  const updateScreen = useCallback(
    async (screen: ScreenNumber) => {
      const previous = profileRef.current
      const lesson = mergeLessonProgress(previous.lesson, {
        currentScreen: screen,
        ...(screen >= 1 && screen <= 4 ? { lastLessonScreen: screen } : {}),
      })
      const next: UserProfile = { ...previous, lesson }
      profileRef.current = next
      onProfileChange(next)

      try {
        await persistWithRetry(() => updateCurrentScreen(uid, screen, previous.lesson))
      } catch {
        profileRef.current = previous
        onProfileChange(previous)
        throw new Error(SAVE_RETRY_MESSAGE)
      }
    },
    [uid, onProfileChange, persistWithRetry],
  )

  const updateLesson = useCallback(
    async (partial: Partial<LessonProgress>) => {
      const previous = profileRef.current
      const lesson = mergeLessonProgress(previous.lesson, partial)
      const next: UserProfile = { ...previous, lesson }
      profileRef.current = next
      onProfileChange(next)

      try {
        await persistWithRetry(() => updateLessonProgress(uid, partial, previous.lesson))
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
      const lesson = appendOutfitPair(previous.lesson, outfit)
      if (lesson.screen1.discoveredOutfits.length === previous.lesson.screen1.discoveredOutfits.length) {
        return
      }
      const next: UserProfile = { ...previous, lesson }
      profileRef.current = next
      onProfileChange(next)
      scheduleOutfitSave(lesson)
    },
    [onProfileChange, scheduleOutfitSave],
  )

  const recordOutfitTriple = useCallback(
    (outfit: OutfitTriple) => {
      const previous = profileRef.current
      const lesson = appendOutfitTriple(previous.lesson, outfit)
      if (lesson.screen3.discoveredOutfits.length === previous.lesson.screen3.discoveredOutfits.length) {
        return
      }
      const next: UserProfile = { ...previous, lesson }
      profileRef.current = next
      onProfileChange(next)
      scheduleOutfitSave(lesson)
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
