import type { Timestamp } from 'firebase/firestore'
import type { LessonProgress } from './lesson'

export type ScreenNumber = 0 | 1 | 2 | 3 | 4

export interface UserProfile {
  username: string
  princessName: string
  createdAt: Timestamp
  updatedAt: Timestamp
  lesson: LessonProgress
}

export interface UsernameRecord {
  uid: string
  createdAt: Timestamp
}
