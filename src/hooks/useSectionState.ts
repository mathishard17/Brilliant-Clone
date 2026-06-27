import { useCallback } from 'react'
import { useLesson } from './useLesson'
import { getProfileLessonProgress } from '../utils/lessonProgress'

type SectionState = Record<string, unknown>

export function useSectionState<TState extends SectionState>(
  sectionId: string,
  defaults: TState,
) {
  const { profile, updateLesson } = useLesson()
  const activeLesson = getProfileLessonProgress(profile)
  const saved = activeLesson.sectionState[sectionId] as Partial<TState> | undefined
  const state = { ...defaults, ...saved } as TState

  const setSectionState = useCallback(
    (partial: Partial<TState>) => {
      const latest = (activeLesson.sectionState[sectionId] as Partial<TState> | undefined) ?? {}
      void updateLesson({
        sectionState: {
          [sectionId]: {
            ...defaults,
            ...latest,
            ...partial,
          },
        },
      })
    },
    [activeLesson.sectionState, defaults, sectionId, updateLesson],
  )

  return [state, setSectionState] as const
}
