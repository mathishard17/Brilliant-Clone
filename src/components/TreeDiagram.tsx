import { memo } from 'react'
import { LessonButton } from './LessonButton'

interface TreeDiagramProps {
  content: string
  visibleLines?: number
  onRevealMore?: () => void
}

export const TreeDiagram = memo(function TreeDiagram({
  content,
  visibleLines,
  onRevealMore,
}: TreeDiagramProps) {
  const lines = content.split('\n')
  const showCount = visibleLines ?? lines.length
  const visible = lines.slice(0, showCount)
  const hasMore = showCount < lines.length

  return (
    <div className="tree-diagram-wrap">
      <pre className="tree-diagram" role="img" aria-label="Combination tree diagram">
        {visible.map((line, index) => (
          <span
            key={`${index}-${line}`}
            className="tree-diagram__line"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {line}
            {index < visible.length - 1 ? '\n' : ''}
          </span>
        ))}
      </pre>
      {hasMore && onRevealMore && (
        <LessonButton
          label="Show next branch →"
          variant="secondary"
          onClick={onRevealMore}
        />
      )}
    </div>
  )
})
