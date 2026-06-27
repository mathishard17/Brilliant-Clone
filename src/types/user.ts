import type { Timestamp } from 'firebase/firestore'
import type { LessonProgress } from './lesson'
import type { ThemePackMap, ThemePreference } from '../themes/themeTypes'

/** 0 is the hub; positive numbers are lesson sections defined by each lesson. */
export type ScreenNumber = number

export interface UserProfile {
  username: string
  princessName: string
  createdAt: Timestamp
  updatedAt: Timestamp
  activeLessonId: string
  lessons: Record<string, LessonProgress>
  themePreference: ThemePreference
  customThemeIdea?: string
  themePacks: ThemePackMap
  voiceEnabled: boolean
  /** Active lesson progress. Kept for compatibility with the original one-lesson screens. */
  lesson: LessonProgress
}

export interface UsernameRecord {
  uid: string
  createdAt: Timestamp
}
