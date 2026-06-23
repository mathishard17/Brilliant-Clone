interface LessonButtonProps {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function LessonButton({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
}: LessonButtonProps) {
  return (
    <button
      type={type}
      className={`lesson-btn lesson-btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
