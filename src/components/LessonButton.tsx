interface LessonButtonProps {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  pressed?: boolean
  type?: 'button' | 'submit'
}

export function LessonButton({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  pressed,
  type = 'button',
}: LessonButtonProps) {
  return (
    <button
      type={type}
      className={`lesson-btn lesson-btn--${variant}${pressed ? ' lesson-btn--pressed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
    >
      {label}
    </button>
  )
}
