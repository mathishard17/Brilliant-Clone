interface DefaultInteractiveVisualizationProps {
  label?: string
}

export function DefaultInteractiveVisualization({
  label = 'To be updated',
}: DefaultInteractiveVisualizationProps) {
  return (
    <div className="default-visualization" aria-label={label}>
      <span>{label}</span>
    </div>
  )
}
