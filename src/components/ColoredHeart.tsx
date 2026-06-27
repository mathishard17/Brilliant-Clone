interface ColoredHeartProps {
  color: string
  className?: string
  shape?: 'heart' | 'circle' | 'square' | 'star' | 'diamond' | 'triangle' | 'paw'
}

function ShapePath({ color, shape }: { color: string; shape: NonNullable<ColoredHeartProps['shape']> }) {
  if (shape === 'circle') {
    return <circle cx="12" cy="12" r="8" fill={color} stroke="#1a1a1a" strokeWidth="1.5" />
  }
  if (shape === 'square') {
    return <rect x="5" y="5" width="14" height="14" rx="2" fill={color} stroke="#1a1a1a" strokeWidth="1.5" />
  }
  if (shape === 'star') {
    return (
      <path
        fill={color}
        stroke="#1a1a1a"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="M12 3.5 14.4 8.4 19.8 9.2 15.9 13 16.8 18.4 12 15.8 7.2 18.4 8.1 13 4.2 9.2 9.6 8.4 12 3.5Z"
      />
    )
  }
  if (shape === 'diamond') {
    return <path fill={color} stroke="#1a1a1a" strokeWidth="1.5" d="M12 3 21 12 12 21 3 12Z" />
  }
  if (shape === 'triangle') {
    return <path fill={color} stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round" d="M12 4 21 20H3Z" />
  }
  if (shape === 'paw') {
    return (
      <g fill={color} stroke="#1a1a1a" strokeWidth="1.2">
        <circle cx="7.5" cy="8" r="2.2" />
        <circle cx="12" cy="6.5" r="2.2" />
        <circle cx="16.5" cy="8" r="2.2" />
        <path d="M6.5 17.5c0-3.2 2.4-5.8 5.5-5.8s5.5 2.6 5.5 5.8c0 2.2-2.2 3.2-5.5 3.2s-5.5-1-5.5-3.2Z" />
      </g>
    )
  }
  return (
    <path
      fill={color}
      stroke="#1a1a1a"
      strokeWidth="1.5"
      d="M12 20.5s-6.5-4.5-6.5-9a4.5 4.5 0 0 1 8-2.7 4.5 4.5 0 0 1 8 2.7c0 4.5-6.5 9-6.5 9z"
    />
  )
}

export function ColoredHeart({ color, className = '', shape = 'heart' }: ColoredHeartProps) {
  return (
    <svg
      className={`colored-heart ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <ShapePath color={color} shape={shape} />
    </svg>
  )
}
