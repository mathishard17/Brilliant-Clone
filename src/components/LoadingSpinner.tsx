interface LoadingSpinnerProps {
  label?: string
}

export function LoadingSpinner({ label = 'Loading your learning map…' }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner__node" aria-hidden="true">
        <span />
      </div>
      <p className="loading-spinner__label">{label}</p>
    </div>
  )
}
