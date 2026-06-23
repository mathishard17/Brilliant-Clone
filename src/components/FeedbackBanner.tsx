import { renderLessonText } from './LessonText'

interface FeedbackBannerProps {
  message: string
  variant: 'success' | 'error' | 'info'
}

export function FeedbackBanner({ message, variant }: FeedbackBannerProps) {
  const icon = variant === 'success' ? '✨ ' : variant === 'error' ? '💜 ' : ''
  return (
    <div className={`feedback-banner feedback-banner--${variant}`} role="status" aria-live="polite">
      {icon}
      {renderLessonText(message)}
    </div>
  )
}
