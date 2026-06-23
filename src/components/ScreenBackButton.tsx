interface ScreenBackButtonProps {
  label?: string
  onClick: () => void
}

export function ScreenBackButton({ label = '← Back', onClick }: ScreenBackButtonProps) {
  return (
    <button type="button" className="screen-back" onClick={onClick}>
      {label}
    </button>
  )
}
