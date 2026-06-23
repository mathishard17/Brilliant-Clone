import type { ReactNode } from 'react'
import { LessonContext, type LessonContextValue } from './lesson-context'

export function LessonProvider({
  value,
  children,
}: {
  value: LessonContextValue
  children: ReactNode
}) {
  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>
}
