interface ColoredHeartProps {
  color: string
  className?: string
}

export function ColoredHeart({ color, className = '' }: ColoredHeartProps) {
  return (
    <svg
      className={`colored-heart ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill={color}
        stroke="#1a1a1a"
        strokeWidth="1.5"
        d="M12 20.5s-6.5-4.5-6.5-9a4.5 4.5 0 0 1 8-2.7 4.5 4.5 0 0 1 8 2.7c0 4.5-6.5 9-6.5 9z"
      />
    </svg>
  )
}
