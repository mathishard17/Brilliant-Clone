import {
  doc,
  getDoc,
  getDocFromServer,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import {
  DEFAULT_LESSON_ID,
  createDefaultLessonProgress,
  type LessonProgress,
} from '../types/lesson'
import type { ScreenNumber, UserProfile, UsernameRecord } from '../types/user'
import { normalizeLessonMap, normalizeLessonProgress } from '../utils/lessonProgress'
import { normalizeUsername } from '../utils/outfitKeys'

function usersRef(uid: string) {
  return doc(db, 'users', uid)
}

function usernamesRef(username: string) {
  return doc(db, 'usernames', normalizeUsername(username))
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const snapshot = await getDoc(usernamesRef(username))
  return !snapshot.exists()
}

export async function createUserProfile(
  uid: string,
  username: string,
  princessName: string,
): Promise<void> {
  const normalized = normalizeUsername(username)
  const batch = writeBatch(db)
  const now = serverTimestamp()

  const profile: Omit<UserProfile, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>
    updatedAt: ReturnType<typeof serverTimestamp>
  } = {
    activeLessonId: DEFAULT_LESSON_ID,
    username: normalized,
    princessName: princessName.trim(),
    createdAt: now,
    updatedAt: now,
    lesson: createDefaultLessonProgress(DEFAULT_LESSON_ID),
    lessons: {
      [DEFAULT_LESSON_ID]: createDefaultLessonProgress(DEFAULT_LESSON_ID),
    },
  }

  const usernameRecord: Omit<UsernameRecord, 'createdAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>
  } = {
    uid,
    createdAt: now,
  }

  batch.set(usersRef(uid), profile)
  batch.set(usernamesRef(normalized), usernameRecord)
  await batch.commit()
}

function parseUserProfile(data: Record<string, unknown>): UserProfile {
  const legacyLesson = data.lesson as Partial<LessonProgress> | undefined
  const lessons = normalizeLessonMap(
    data.lessons as Record<string, Partial<LessonProgress>> | undefined,
    legacyLesson,
  )
  const activeLessonId = String(data.activeLessonId ?? DEFAULT_LESSON_ID)
  const lesson = lessons[activeLessonId] ?? createDefaultLessonProgress(activeLessonId)
  lessons[activeLessonId] = lesson

  return {
    activeLessonId,
    username: String(data.username ?? ''),
    princessName: String(data.princessName ?? ''),
    createdAt: data.createdAt as UserProfile['createdAt'],
    updatedAt: data.updatedAt as UserProfile['updatedAt'],
    lessons,
    lesson,
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(usersRef(uid))
  if (!snapshot.exists()) {
    return null
  }
  return parseUserProfile(snapshot.data())
}

/** Always fetch latest progress from server (use after login). */
export async function getUserProfileFromServer(uid: string): Promise<UserProfile | null> {
  try {
    const snapshot = await getDocFromServer(usersRef(uid))
    if (!snapshot.exists()) {
      return null
    }
    return parseUserProfile(snapshot.data())
  } catch {
    return getUserProfile(uid)
  }
}

export async function updateUserProfile(
  uid: string,
  partial: Partial<Omit<UserProfile, 'lesson'>>,
): Promise<void> {
  await updateDoc(usersRef(uid), {
    ...partial,
    updatedAt: serverTimestamp(),
  })
}

/** Persist the full lesson object to avoid partial overwrites wiping nested fields. */
export async function saveLessonProgress(
  uid: string,
  lesson: LessonProgress,
  lessonId = lesson.lessonId || DEFAULT_LESSON_ID,
): Promise<void> {
  const normalized = normalizeLessonProgress(lesson, lessonId)
  await updateDoc(usersRef(uid), {
    activeLessonId: lessonId,
    lesson: normalized,
    [`lessons.${lessonId}`]: normalized,
    updatedAt: serverTimestamp(),
  })
}

export async function updateLessonProgress(
  uid: string,
  lesson: Partial<LessonProgress>,
  currentLesson: LessonProgress,
  lessonId = currentLesson.lessonId || DEFAULT_LESSON_ID,
): Promise<void> {
  const merged = normalizeLessonProgress({
    ...currentLesson,
    ...lesson,
    screen1: lesson.screen1 ? { ...currentLesson.screen1, ...lesson.screen1 } : currentLesson.screen1,
    screen2: lesson.screen2 ? { ...currentLesson.screen2, ...lesson.screen2 } : currentLesson.screen2,
    screen3: lesson.screen3 ? { ...currentLesson.screen3, ...lesson.screen3 } : currentLesson.screen3,
  }, lessonId)
  await saveLessonProgress(uid, merged, lessonId)
}

export async function updateCurrentScreen(
  uid: string,
  screen: ScreenNumber,
  currentLesson: LessonProgress,
  lessonId = currentLesson.lessonId || DEFAULT_LESSON_ID,
): Promise<void> {
  const lesson = normalizeLessonProgress({
    ...currentLesson,
    currentScreen: screen,
    ...(screen >= 1 ? { lastLessonScreen: screen } : {}),
  }, lessonId)
  await saveLessonProgress(uid, lesson, lessonId)
}

/** After login: normalize fields and land on hub while keeping resume screen. */
export async function hydrateProfileAfterLogin(
  uid: string,
  profile: UserProfile,
): Promise<UserProfile> {
  let lesson = normalizeLessonProgress(profile.lesson)
  const wasInLesson = lesson.currentScreen >= 1

  if (wasInLesson) {
    lesson = {
      ...lesson,
      lastLessonScreen: lesson.lastLessonScreen ?? lesson.currentScreen,
      currentScreen: 0,
    }
  }

  const hydrated = { ...profile, lesson }
  if (wasInLesson) {
    await saveLessonProgress(uid, lesson)
  }
  return hydrated
}

export async function loadProfileForSession(uid: string): Promise<UserProfile | null> {
  const data = await getUserProfileFromServer(uid)
  if (!data) return null
  return hydrateProfileAfterLogin(uid, data)
}
