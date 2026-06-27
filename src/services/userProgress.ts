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
  LESSON_1_ID,
  createDefaultLessonProgress,
  type LessonProgress,
} from '../types/lesson'
import type { ScreenNumber, UserProfile, UsernameRecord } from '../types/user'
import {
  getProfileLessonProgress,
  mergeLessonProgress,
  normalizeLessonMap,
  normalizeLessonProgress,
} from '../utils/lessonProgress'
import { normalizeUsername } from '../utils/outfitKeys'
import {
  DEFAULT_CHARACTER_APPEARANCE,
  parseCharacterAppearance,
} from '../data/characterAppearance'
import { normalizeThemePreference } from '../themes/themeResolver'
import { isValidLesson1ThemePack } from '../themes/themeValidation'
import { createDefaultStudentMemory, parseStudentMemory } from '../utils/studentMemory'

function usersRef(uid: string) {
  return doc(db, 'users', uid)
}

function usernamesRef(username: string) {
  return doc(db, 'usernames', normalizeUsername(username))
}

function stripUndefinedForFirestore(value: unknown): unknown {
  if (value === undefined) return undefined
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((entry) => stripUndefinedForFirestore(entry) ?? null)
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) {
      return value
    }
    const cleaned: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const cleanedEntry = stripUndefinedForFirestore(entry)
      if (cleanedEntry !== undefined) cleaned[key] = cleanedEntry
    }
    return cleaned
  }
  return undefined
}

function cleanObjectForFirestore<T extends Record<string, unknown>>(value: T): T {
  return stripUndefinedForFirestore(value) as T
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const snapshot = await getDoc(usernamesRef(username))
  return !snapshot.exists()
}

export async function createUserProfile(
  uid: string,
  username: string,
  princessName: string,
  themePreference: UserProfile['themePreference'] = 'royal',
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
    themePreference,
    customThemeIdea: '',
    themePacks: {},
    voiceEnabled: false,
    appearance: DEFAULT_CHARACTER_APPEARANCE,
    studentMemory: createDefaultStudentMemory(),
    createdAt: now,
    updatedAt: now,
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
  const lessons = normalizeLessonMap(
    data.lessons as Record<string, Partial<LessonProgress>> | undefined,
  )
  const activeLessonId = String(data.activeLessonId ?? DEFAULT_LESSON_ID)
  const lesson = lessons[activeLessonId] ?? createDefaultLessonProgress(activeLessonId)
  lessons[activeLessonId] = lesson
  const rawThemePacks = data.themePacks as UserProfile['themePacks'] | undefined
  const themePacks: UserProfile['themePacks'] = {}
  if (isValidLesson1ThemePack(rawThemePacks?.[LESSON_1_ID])) {
    themePacks[LESSON_1_ID] = rawThemePacks[LESSON_1_ID]
  }

  return {
    activeLessonId,
    username: String(data.username ?? ''),
    princessName: String(data.princessName ?? ''),
    themePreference: normalizeThemePreference(data.themePreference),
    customThemeIdea: typeof data.customThemeIdea === 'string' ? data.customThemeIdea : '',
    themePacks,
    voiceEnabled: data.voiceEnabled === true,
    appearance: parseCharacterAppearance(data.appearance),
    studentMemory: parseStudentMemory(data.studentMemory),
    createdAt: data.createdAt as UserProfile['createdAt'],
    updatedAt: data.updatedAt as UserProfile['updatedAt'],
    lessons,
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
  partial: Partial<UserProfile>,
): Promise<void> {
  await updateDoc(usersRef(uid), cleanObjectForFirestore({
    ...partial,
    updatedAt: serverTimestamp(),
  }))
}

/** Persist the full lesson object to avoid partial overwrites wiping nested fields. */
export async function saveLessonProgress(
  uid: string,
  lesson: LessonProgress,
  lessonId = lesson.lessonId || DEFAULT_LESSON_ID,
): Promise<void> {
  const normalized = normalizeLessonProgress(lesson, lessonId)
  await updateDoc(usersRef(uid), cleanObjectForFirestore({
    activeLessonId: lessonId,
    [`lessons.${lessonId}`]: normalized,
    updatedAt: serverTimestamp(),
  }))
}

export async function updateLessonProgress(
  uid: string,
  lesson: Partial<LessonProgress>,
  currentLesson: LessonProgress,
  lessonId = currentLesson.lessonId || DEFAULT_LESSON_ID,
): Promise<void> {
  const merged = mergeLessonProgress(currentLesson, { ...lesson, lessonId })
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
  const lessonId = profile.activeLessonId || DEFAULT_LESSON_ID
  let lesson = normalizeLessonProgress(getProfileLessonProgress(profile, lessonId), lessonId)
  const wasInLesson = lesson.currentScreen >= 1

  if (wasInLesson) {
    lesson = {
      ...lesson,
      lastLessonScreen: lesson.lastLessonScreen ?? lesson.currentScreen,
      currentScreen: 0,
    }
  }

  const hydrated = {
    ...profile,
    activeLessonId: lessonId,
    lessons: {
      ...profile.lessons,
      [lessonId]: lesson,
    },
  }
  if (wasInLesson) {
    await saveLessonProgress(uid, lesson, lessonId)
  }
  return hydrated
}

export async function loadProfileForSession(uid: string): Promise<UserProfile | null> {
  const data = await getUserProfileFromServer(uid)
  if (!data) return null
  return hydrateProfileAfterLogin(uid, data)
}
