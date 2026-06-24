import { createContext } from 'react'
import type { LessonProgress, OutfitPair, OutfitTriple } from '../types/lesson'
import type { ScreenNumber, UserProfile } from '../types/user'

export interface LessonContextValue {
  profile: UserProfile
  updateScreen: (screen: ScreenNumber, lessonId?: string) => Promise<void>
  updateLesson: (partial: Partial<LessonProgress>, lessonId?: string) => Promise<void>
  recordOutfitPair: (outfit: OutfitPair) => void
  recordOutfitTriple: (outfit: OutfitTriple) => void
  saving: boolean
  saveError: string | null
  dismissSaveError: () => void
}

export const LessonContext = createContext<LessonContextValue | null>(null)
