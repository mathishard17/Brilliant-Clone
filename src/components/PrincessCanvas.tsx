import { memo } from 'react'
import { CROWN_FILL_COLORS, HAIR_COLOR, SHOE_FILL_COLORS } from '../data/closetStyles'
import { getCrownStyle, getDressColor, getShoeStyle } from '../data/dressColors'

interface PrincessCanvasProps {
  crownId?: string | null
  dressId?: string | null
  shoeId?: string | null
  showLock?: boolean
}

const STROKE = '#000'
const STROKE_W = 3
const STROKE_CAP = 'round' as const
const STROKE_JOIN = 'round' as const

function Crown({ style }: { style: 'gold-tiara' | 'diamond-crown' }) {
  const fill = CROWN_FILL_COLORS[style] ?? '#fff'

  if (style === 'gold-tiara') {
    return (
      <g className="princess-canvas__crown" aria-hidden="true">
        <path
          d="M 72 28 L 80 14 L 88 24 L 100 10 L 112 24 L 120 14 L 128 28 Z"
          fill={fill}
          stroke={STROKE}
          strokeWidth={STROKE_W}
          strokeLinecap={STROKE_CAP}
          strokeLinejoin={STROKE_JOIN}
        />
        <line x1="72" y1="28" x2="128" y2="28" stroke={STROKE} strokeWidth={STROKE_W} />
      </g>
    )
  }

  return (
    <g className="princess-canvas__crown" aria-hidden="true">
      <path
        d="M 68 30 L 76 8 L 88 26 L 100 4 L 112 26 L 124 8 L 132 30 Z"
        fill={fill}
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinecap={STROKE_CAP}
        strokeLinejoin={STROKE_JOIN}
      />
      <line x1="68" y1="30" x2="132" y2="30" stroke={STROKE} strokeWidth={STROKE_W} />
      <circle cx="100" cy="18" r="3" fill={STROKE} />
    </g>
  )
}

function GlassSlipper({ cx, mirrored = false }: { cx: number; mirrored?: boolean }) {
  const colors = SHOE_FILL_COLORS['glass-slippers']
  const dir = mirrored ? -1 : 1
  const toe = cx + dir * 10
  const heel = cx - dir * 12

  return (
    <g>
      {/* Sole & upper */}
      <path
        d={`M ${heel} 248
            Q ${heel} 236 ${cx - dir * 2} 234
            Q ${cx + dir * 8} 232 ${toe} 238
            Q ${toe + dir * 4} 244 ${toe} 250
            Q ${cx + dir * 6} 256 ${cx - dir * 4} 256
            Q ${heel + dir * 2} 254 ${heel} 248 Z`}
        fill={colors.main}
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin={STROKE_JOIN}
      />
      {/* Glass heel */}
      <path
        d={`M ${heel + dir * 2} 248 L ${heel + dir * 6} 254 L ${heel + dir * 10} 248 Z`}
        fill={colors.accent}
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin={STROKE_JOIN}
      />
      {/* Shine */}
      <ellipse cx={cx + dir * 4} cy="242" rx="3" ry="2" fill={colors.highlight} opacity="0.85" />
    </g>
  )
}

function RidingBoot({ cx, mirrored = false }: { cx: number; mirrored?: boolean }) {
  const colors = SHOE_FILL_COLORS['riding-boots']
  const dir = mirrored ? -1 : 1
  const shaftLeft = cx - 8
  const shaftRight = cx + 8
  const toe = cx + dir * 14

  return (
    <g>
      {/* Shaft — wraps lower leg */}
      <path
        d={`M ${shaftLeft} 216 L ${shaftLeft} 250 L ${shaftRight} 250 L ${shaftRight} 216 Z`}
        fill={colors.main}
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin={STROKE_JOIN}
      />
      {/* Cuff */}
      <path
        d={`M ${shaftLeft} 216 L ${shaftLeft} 222 L ${shaftRight} 222 L ${shaftRight} 216 Z`}
        fill={colors.highlight}
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin={STROKE_JOIN}
      />
      {/* Toe box */}
      <path
        d={
          mirrored
            ? `M ${shaftRight} 246 L ${shaftRight} 254 L ${toe} 252 L ${toe} 244 Z`
            : `M ${shaftLeft} 246 L ${shaftLeft} 254 L ${toe} 252 L ${toe} 244 Z`
        }
        fill={colors.accent}
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin={STROKE_JOIN}
      />
      {/* Block heel */}
      <rect
        x={mirrored ? shaftRight - 7 : shaftLeft}
        y="246"
        width="7"
        height="8"
        rx="1"
        fill={colors.accent}
        stroke={STROKE}
        strokeWidth="2"
      />
      {/* Sole line */}
      <line
        x1={mirrored ? shaftRight : shaftLeft}
        y1="254"
        x2={toe}
        y2="252"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap={STROKE_CAP}
      />
    </g>
  )
}

function Shoes({ style }: { style: 'glass-slippers' | 'riding-boots' }) {
  const BootOrSlipper = style === 'riding-boots' ? RidingBoot : GlassSlipper

  return (
    <g className="princess-canvas__shoes" aria-hidden="true">
      <BootOrSlipper cx={82} />
      <BootOrSlipper cx={118} mirrored />
    </g>
  )
}

export const PrincessCanvas = memo(function PrincessCanvas({
  crownId = null,
  dressId = null,
  shoeId = null,
  showLock = false,
}: PrincessCanvasProps) {
  const dressColor = getDressColor(dressId)
  const crownStyle = getCrownStyle(crownId)
  const shoeStyle = getShoeStyle(shoeId)
  const hasDress = Boolean(dressId)

  return (
    <div className="princess-canvas" aria-label="Princess character">
      <div className="princess-canvas__stage">
        <svg
          className="princess-canvas__figure"
          viewBox="0 0 200 260"
          role="img"
          aria-label="Stick figure princess"
        >
          {/* Long yellow hair — behind head, flows to shoulders */}
          <path
            d="M 100 10
               Q 136 14 134 48
               Q 138 78 132 108
               Q 100 118 68 108
               Q 62 78 66 48
               Q 64 14 100 10 Z"
            fill={HAIR_COLOR}
            stroke={STROKE}
            strokeWidth={STROKE_W}
            strokeLinejoin={STROKE_JOIN}
          />

          {/* Head */}
          <circle
            cx="100"
            cy="48"
            r="24"
            fill="#fff"
            stroke={STROKE}
            strokeWidth={STROKE_W}
          />

          {/* Face */}
          <circle cx="91" cy="44" r="2.5" fill={STROKE} />
          <circle cx="109" cy="44" r="2.5" fill={STROKE} />
          <path
            d="M 92 54 Q 100 60 108 54"
            fill="none"
            stroke={STROKE}
            strokeWidth="2"
            strokeLinecap={STROKE_CAP}
          />

          {crownStyle && <Crown style={crownStyle} />}

          {/* Arms — from dress top (no neck) */}
          <line x1="100" y1="88" x2="58" y2="118" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />
          <line x1="100" y1="88" x2="142" y2="118" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />

          {/* Dress triangle (point up, wide hem) — only part that changes color */}
          <polygon
            key={dressId ?? 'bare'}
            className={`princess-canvas__dress${hasDress ? ' princess-canvas__dress--colored' : ''}`}
            points="100,76 56,172 144,172"
            fill={dressColor}
            stroke={STROKE}
            strokeWidth={STROKE_W}
            strokeLinejoin={STROKE_JOIN}
          />

          {/* Legs — below the dress hem */}
          <line x1="86" y1="172" x2="82" y2="238" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />
          <line x1="114" y1="172" x2="118" y2="238" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />

          {shoeStyle && <Shoes style={shoeStyle} />}
        </svg>

        {showLock && (
          <span className="princess-canvas__lock" aria-hidden="true">
            🔒
          </span>
        )}
      </div>
    </div>
  )
})
