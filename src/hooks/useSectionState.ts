import { useCallback } from 'react'
import { useLesson } from './useLesson'

type SectionState = Record<string, unknown>

export function useSectionState<TState extends SectionState>(
  sectionId: string,
  defaults: TState,
) {
  const { profile, updateLesson } = useLesson()
  const saved = profile.lesson.sectionState[sectionId] as Partial<TState> | undefined
  const state = { ...defaults, ...saved } as TState

  const setSectionState = useCallback(
    (partial: Partial<TState>) => {
      const latest = (profile.lesson.sectionState[sectionId] as Partial<TState> | undefined) ?? {}
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
    [defaults, profile.lesson.sectionState, sectionId, updateLesson],
  )

  return [state, setSectionState] as const
}
