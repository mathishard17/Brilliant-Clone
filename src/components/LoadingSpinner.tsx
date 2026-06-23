interface LoadingSpinnerProps {
  label?: string
}

export function LoadingSpinner({ label = 'Loading the kingdom…' }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner__crown" aria-hidden="true">
        👑
      </div>
      <p className="loading-spinner__label">{label}</p>
    </div>
  )
}
