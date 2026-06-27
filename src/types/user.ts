import type { Timestamp } from 'firebase/firestore'
import type { LessonProgress } from './lesson'
import type { ThemePackMap, ThemePreference } from '../themes/themeTypes'
import type { CharacterAppearance } from '../data/characterAppearance'

/** 0 is the hub; positive numbers are lesson sections defined by each lesson. */
export type ScreenNumber = number

export type StudentMemoryEventType = 'challengeAttempt' | 'hintRequested'
export type StudentMemoryOutcome = 'correct' | 'incorrect'

export interface StudentMemoryConcept {
  conceptKey: string
  label: string
  lessonId: string
  attempts: number
  correct: number
  incorrect: number
  hintsRequested: number
  lastOutcome?: StudentMemoryOutcome
  lastMisconception?: string
  lastSeenAt?: string
}

export interface StudentMemoryRecentEvent {
  type: StudentMemoryEventType
  lessonId: string
  conceptKey: string
  label: string
  outcome?: StudentMemoryOutcome
  misconception?: string
  createdAt: string
}

export interface StudentMemory {
  version: 1
  totalAttempts: number
  correctAttempts: number
  incorrectAttempts: number
  hintsRequested: number
  currentStreak: number
  strengths: string[]
  growthAreas: string[]
  concepts: Record<string, StudentMemoryConcept>
  recentEvents: StudentMemoryRecentEvent[]
  updatedAt?: string
}

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
  appearance?: CharacterAppearance
  studentMemory: StudentMemory
}

export interface UsernameRecord {
  uid: string
  createdAt: Timestamp
}
