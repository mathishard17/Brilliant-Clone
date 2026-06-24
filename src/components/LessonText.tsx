import type { ElementType } from 'react'
import { renderLessonText } from '../utils/renderLessonText'

interface LessonTextProps {
  text: string
  className?: string
  as?: ElementType
}

export function LessonText({ text, className, as: Tag = 'p' }: LessonTextProps) {
  return <Tag className={className}>{renderLessonText(text)}</Tag>
}
