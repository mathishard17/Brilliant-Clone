import { Fragment, type ReactNode } from 'react'

const BOLD_PATTERN = /(\*\*[^*]+\*\*)/g

export function renderLessonText(text: string): ReactNode[] {
  return text.split(BOLD_PATTERN).filter(Boolean).map((segment, index) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      return <strong key={index}>{segment.slice(2, -2)}</strong>
    }
    return <Fragment key={index}>{segment}</Fragment>
  })
}
