import { memo } from 'react'
import type { ReactNode } from 'react'
import {
  CROWN_FILL_COLORS,
  HAIR_COLOR,
  SHOE_FILL_COLORS,
  type ClosetItemStyle,
} from '../data/closetStyles'
import { getCrownStyle, getDressColor, getShoeStyle } from '../data/dressColors'
import type { ThemeCharacterConfig } from '../themes/themeTypes'

interface PrincessCanvasProps {
  crownId?: string | null
  dressId?: string | null
  shoeId?: string | null
  showLock?: boolean
  variant?: 'princess' | 'astronaut'
  characterConfig?: ThemeCharacterConfig
  itemStyles?: Record<string, ClosetItemStyle | undefined>
}

const STROKE = '#000'
const STROKE_W = 3
const STROKE_CAP = 'round' as const
const STROKE_JOIN = 'round' as const

function Crown({ style, fillOverride }: { style: 'gold-tiara' | 'diamond-crown'; fillOverride?: string }) {
  const fill = fillOverride ?? CROWN_FILL_COLORS[style] ?? '#fff'

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

function GlassSlipper({
  cx,
  mirrored = false,
  colorOverride,
}: {
  cx: number
  mirrored?: boolean
  colorOverride?: string
}) {
  const colors = SHOE_FILL_COLORS['glass-slippers']
  const main = colorOverride ?? colors.main
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
        fill={main}
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

function RidingBoot({
  cx,
  mirrored = false,
  colorOverride,
}: {
  cx: number
  mirrored?: boolean
  colorOverride?: string
}) {
  const colors = SHOE_FILL_COLORS['riding-boots']
  const main = colorOverride ?? colors.main
  const dir = mirrored ? -1 : 1
  const shaftLeft = cx - 8
  const shaftRight = cx + 8
  const toe = cx + dir * 14

  return (
    <g>
      {/* Shaft — wraps lower leg */}
      <path
        d={`M ${shaftLeft} 216 L ${shaftLeft} 250 L ${shaftRight} 250 L ${shaftRight} 216 Z`}
        fill={main}
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

function Shoes({ style, colorOverride }: { style: 'glass-slippers' | 'riding-boots'; colorOverride?: string }) {
  const BootOrSlipper = style === 'riding-boots' ? RidingBoot : GlassSlipper

  return (
    <g className="princess-canvas__shoes" aria-hidden="true">
      <BootOrSlipper cx={82} colorOverride={colorOverride} />
      <BootOrSlipper cx={118} mirrored colorOverride={colorOverride} />
    </g>
  )
}

function defaultCharacterConfig(variant: 'princess' | 'astronaut'): ThemeCharacterConfig {
  if (variant === 'astronaut') {
    return {
      base: 'astronaut',
      head: 'helmet',
      torso: 'spaceSuit',
      feet: 'boots',
      stage: 'space',
    }
  }

  return {
    base: 'human',
    head: 'hair',
    torso: 'dress',
    feet: 'slippers',
    stage: 'royal',
  }
}

const SKIN = '#fff7ed'
const DEFAULT_OUTFIT = '#ffffff'
const DEFAULT_PANTS = '#334155'

function CharacterHead({
  config,
  accentColor,
}: {
  config: ThemeCharacterConfig
  accentColor?: string
}) {
  const accent = accentColor ?? '#facc15'

  return (
    <g aria-hidden="true">
      {config.head === 'hair' && (
        <path
          d="M 76 48 Q 82 22 100 20 Q 118 22 124 48 L 122 75 Q 100 92 78 75 Z"
          fill={HAIR_COLOR}
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin={STROKE_JOIN}
        />
      )}
      {config.head === 'dinoHood' && (
        <>
          <path
            d="M 66 50 Q 72 18 100 14 Q 128 18 134 50 Q 118 38 100 38 Q 82 38 66 50 Z"
            fill={accent}
            stroke={STROKE}
            strokeWidth={STROKE_W}
            strokeLinejoin={STROKE_JOIN}
          />
          <path d="M 88 19 L 94 7 L 100 20" fill="#fff" stroke={STROKE} strokeWidth="2" />
          <path d="M 102 20 L 108 7 L 114 19" fill="#fff" stroke={STROKE} strokeWidth="2" />
        </>
      )}
      {config.head === 'animalEars' && (
        <>
          <path d="M 78 36 L 68 14 L 94 30 Z" fill={accent} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin={STROKE_JOIN} />
          <path d="M 122 36 L 132 14 L 106 30 Z" fill={accent} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin={STROKE_JOIN} />
        </>
      )}

      <circle cx="100" cy="55" r="26" fill={SKIN} stroke={STROKE} strokeWidth={STROKE_W} />
      <circle cx="91" cy="53" r="2.5" fill={STROKE} />
      <circle cx="109" cy="53" r="2.5" fill={STROKE} />
      <path d="M 92 63 Q 100 69 108 63" fill="none" stroke={STROKE} strokeWidth="2" strokeLinecap={STROKE_CAP} />

      {config.head === 'cap' && (
        <>
          <path
            d="M 72 43 Q 80 25 100 23 Q 120 25 128 43 Q 112 39 100 39 Q 88 39 72 43 Z"
            fill={accent}
            stroke={STROKE}
            strokeWidth={STROKE_W}
            strokeLinejoin={STROKE_JOIN}
          />
          <path
            d="M 112 42 Q 134 41 150 48 Q 130 52 111 47 Z"
            fill={accent}
            stroke={STROKE}
            strokeWidth="3"
            strokeLinecap={STROKE_CAP}
            strokeLinejoin={STROKE_JOIN}
          />
        </>
      )}
      {config.head === 'chefHat' && (
        <>
          <circle cx="82" cy="31" r="11" fill="#fff" stroke={STROKE} strokeWidth="2" />
          <circle cx="100" cy="25" r="14" fill="#fff" stroke={STROKE} strokeWidth="2" />
          <circle cx="118" cy="31" r="11" fill="#fff" stroke={STROKE} strokeWidth="2" />
          <rect x="76" y="34" width="48" height="16" rx="6" fill="#fff" stroke={STROKE} strokeWidth="2" />
        </>
      )}
      {config.head === 'sunHat' && (
        <>
          <ellipse cx="100" cy="42" rx="43" ry="9" fill={accent} stroke={STROKE} strokeWidth={STROKE_W} />
          <path d="M 78 41 Q 100 18 122 41 Z" fill={accent} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin={STROKE_JOIN} />
        </>
      )}
      {config.head === 'beret' && (
        <>
          <ellipse cx="98" cy="35" rx="32" ry="13" fill={accent} stroke={STROKE} strokeWidth={STROKE_W} />
          <line x1="110" y1="23" x2="120" y2="14" stroke={STROKE} strokeWidth="2" strokeLinecap={STROKE_CAP} />
        </>
      )}
    </g>
  )
}

function CasualShoes({ color }: { color?: string }) {
  const fill = color ?? '#ffffff'

  return (
    <g aria-hidden="true">
      <path d="M 72 230 Q 82 224 94 232 L 94 244 L 66 244 Q 65 236 72 230 Z" fill={fill} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin={STROKE_JOIN} />
      <path d="M 128 230 Q 118 224 106 232 L 106 244 L 134 244 Q 135 236 128 230 Z" fill={fill} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin={STROKE_JOIN} />
      <line x1="72" y1="238" x2="90" y2="238" stroke={STROKE} strokeWidth="2" strokeLinecap={STROKE_CAP} />
      <line x1="110" y1="238" x2="128" y2="238" stroke={STROKE} strokeWidth="2" strokeLinecap={STROKE_CAP} />
    </g>
  )
}

function CharacterLegs({
  hasOutfit,
  pantsColor,
}: {
  hasOutfit: boolean
  pantsColor: string
}) {
  return (
    <g aria-hidden="true">
      {hasOutfit ? (
        <>
          <rect x="80" y="158" width="17" height="70" rx="8" fill={pantsColor} stroke={STROKE} strokeWidth={STROKE_W} />
          <rect x="103" y="158" width="17" height="70" rx="8" fill={pantsColor} stroke={STROKE} strokeWidth={STROKE_W} />
        </>
      ) : (
        <>
          <line x1="88" y1="162" x2="84" y2="228" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />
          <line x1="112" y1="162" x2="116" y2="228" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />
        </>
      )}
    </g>
  )
}

function CharacterArms({
  sleeveColor,
}: {
  sleeveColor: string
}) {
  return (
    <g aria-hidden="true">
      <path d="M 72 103 Q 62 122 56 142" fill="none" stroke={SKIN} strokeWidth="7" strokeLinecap={STROKE_CAP} />
      <path d="M 128 103 Q 138 122 144 142" fill="none" stroke={SKIN} strokeWidth="7" strokeLinecap={STROKE_CAP} />
      <path d="M 72 103 Q 62 122 56 142" fill="none" stroke={STROKE} strokeWidth="2" strokeLinecap={STROKE_CAP} />
      <path d="M 128 103 Q 138 122 144 142" fill="none" stroke={STROKE} strokeWidth="2" strokeLinecap={STROKE_CAP} />
      <path d="M 70 91 L 56 114 L 68 123 L 82 102 Z" fill={sleeveColor} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin={STROKE_JOIN} />
      <path d="M 130 91 L 144 114 L 132 123 L 118 102 Z" fill={sleeveColor} stroke={STROKE} strokeWidth={STROKE_W} strokeLinejoin={STROKE_JOIN} />
      <circle cx="55" cy="143" r="5" fill={SKIN} stroke={STROKE} strokeWidth="2" />
      <circle cx="145" cy="143" r="5" fill={SKIN} stroke={STROKE} strokeWidth="2" />
    </g>
  )
}

function TorsoShell({
  fill,
  children,
}: {
  fill: string
  children?: ReactNode
}) {
  return (
    <g>
      <rect x="70" y="86" width="60" height="84" rx="17" fill={fill} stroke={STROKE} strokeWidth={STROKE_W} />
      {children}
    </g>
  )
}

function ThemedBody({
  config,
  bodyColor,
  accentColor,
  hasOutfit,
}: {
  config: ThemeCharacterConfig
  bodyColor: string
  accentColor?: string
  hasOutfit: boolean
}) {
  const accent = accentColor ?? '#1f2937'
  const outfitFill = hasOutfit ? bodyColor : '#ffffff'
  const pantsFill = config.torso === 'overalls' && hasOutfit ? outfitFill : DEFAULT_PANTS
  const shirtFill = config.torso === 'overalls' || config.torso === 'apron' ? '#fef3c7' : outfitFill
  const showPants = true

  if (config.torso === 'jersey') {
    return (
      <g>
        <CharacterLegs pantsColor={pantsFill} hasOutfit={showPants} />
        <CharacterArms sleeveColor={outfitFill} />
        <TorsoShell fill={outfitFill}>
          <path d="M 80 88 L 94 104 L 106 104 L 120 88" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap={STROKE_CAP} />
          <path d="M 76 151 Q 100 160 124 151" fill="none" stroke="rgb(0 0 0 / 0.15)" strokeWidth="3" strokeLinecap={STROKE_CAP} />
          <text x="100" y="134" textAnchor="middle" fontSize="24" fontWeight="800" fill="#fff">1</text>
        </TorsoShell>
      </g>
    )
  }

  if (config.torso === 'apron') {
    return (
      <g>
        <CharacterLegs pantsColor={pantsFill} hasOutfit={showPants} />
        <CharacterArms sleeveColor={shirtFill} />
        <TorsoShell fill={shirtFill}>
          <path
            d="M 84 100 L 116 100 L 121 165 Q 100 174 79 165 Z"
            fill={outfitFill}
            stroke={STROKE}
            strokeWidth="2"
            strokeLinejoin={STROKE_JOIN}
          />
          <rect x="87" y="128" width="26" height="18" rx="5" fill="#fff" stroke={STROKE} strokeWidth="2" />
        </TorsoShell>
      </g>
    )
  }

  if (config.torso === 'overalls') {
    return (
      <g>
        <CharacterLegs pantsColor={pantsFill} hasOutfit={showPants} />
        <CharacterArms sleeveColor={shirtFill} />
        <TorsoShell fill={shirtFill}>
          <path
            d="M 78 106 L 122 106 L 122 170 Q 100 178 78 170 Z"
            fill={outfitFill}
            stroke={STROKE}
            strokeWidth="2"
            strokeLinejoin={STROKE_JOIN}
          />
          <line x1="88" y1="106" x2="86" y2="88" stroke={STROKE} strokeWidth="3" strokeLinecap={STROKE_CAP} />
          <line x1="112" y1="106" x2="114" y2="88" stroke={STROKE} strokeWidth="3" strokeLinecap={STROKE_CAP} />
          <rect x="90" y="130" width="20" height="18" rx="4" fill="#fff" stroke={STROKE} strokeWidth="2" />
        </TorsoShell>
      </g>
    )
  }

  if (config.torso === 'smock') {
    return (
      <g>
        <CharacterLegs pantsColor={pantsFill} hasOutfit={showPants} />
        <CharacterArms sleeveColor={outfitFill} />
        <TorsoShell fill={outfitFill}>
          <circle cx="88" cy="116" r="5" fill="#fef3c7" />
          <circle cx="108" cy="132" r="5" fill="#38bdf8" />
          <circle cx="98" cy="150" r="5" fill="#f472b6" />
        </TorsoShell>
      </g>
    )
  }

  if (config.torso === 'jacketAndPants') {
    return (
      <g>
        <CharacterLegs pantsColor={pantsFill} hasOutfit={showPants} />
        <CharacterArms sleeveColor={outfitFill} />
        <TorsoShell fill="#fff">
          <path d="M 70 88 Q 82 86 96 109 L 88 166 L 70 166 Z" fill={outfitFill} stroke={STROKE} strokeWidth="2" strokeLinejoin={STROKE_JOIN} />
          <path d="M 130 88 Q 118 86 104 109 L 112 166 L 130 166 Z" fill={outfitFill} stroke={STROKE} strokeWidth="2" strokeLinejoin={STROKE_JOIN} />
          <path d="M 88 92 L 100 111 L 112 92" fill="none" stroke={accent} strokeWidth="3" strokeLinecap={STROKE_CAP} strokeLinejoin={STROKE_JOIN} />
          <circle cx="92" cy="130" r="3" fill={accent} />
          <circle cx="108" cy="130" r="3" fill={accent} />
        </TorsoShell>
      </g>
    )
  }

  return (
    <g>
      <CharacterLegs pantsColor={pantsFill} hasOutfit={showPants} />
      <CharacterArms sleeveColor={outfitFill} />
      <TorsoShell fill={outfitFill}>
        <path d="M 82 95 Q 100 108 118 95" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap={STROKE_CAP} opacity="0.8" />
      </TorsoShell>
    </g>
  )
}

export const PrincessCanvas = memo(function PrincessCanvas({
  crownId = null,
  dressId = null,
  shoeId = null,
  showLock = false,
  variant = 'princess',
  characterConfig,
  itemStyles,
}: PrincessCanvasProps) {
  const dressColor = itemStyles?.[dressId ?? '']?.heartColor ?? getDressColor(dressId)
  const crownStyle = getCrownStyle(crownId)
  const shoeStyle = getShoeStyle(shoeId)
  const crownColor = itemStyles?.[crownId ?? '']?.heartColor
  const shoeColor = itemStyles?.[shoeId ?? '']?.heartColor
  const hasDress = Boolean(dressId)
  const isAstronaut = variant === 'astronaut'
  const config = characterConfig ?? defaultCharacterConfig(variant)

  if (config.torso !== 'dress' && config.torso !== 'spaceSuit') {
    return (
      <div className={`princess-canvas princess-canvas--${config.stage}`} aria-label={`${config.base} character`}>
        <div className="princess-canvas__stage">
          <svg
            className="princess-canvas__figure"
            viewBox="0 0 200 260"
            role="img"
            aria-label={`${config.base} character`}
          >
            <CharacterHead config={config} accentColor={crownColor} />
            <ThemedBody config={config} bodyColor={dressColor} accentColor={crownColor} hasOutfit={hasDress} />
            {shoeStyle ? (
              <Shoes style={shoeStyle} colorOverride={shoeColor} />
            ) : (
              <CasualShoes color={shoeId ? shoeColor : DEFAULT_OUTFIT} />
            )}
          </svg>
          {showLock && (
            <span className="princess-canvas__lock" aria-hidden="true">
              🔒
            </span>
          )}
        </div>
      </div>
    )
  }

  if (isAstronaut || config.torso === 'spaceSuit') {
    const helmetAccent = crownColor ?? (crownStyle ? CROWN_FILL_COLORS[crownStyle] : '#93c5fd')

    return (
      <div className="princess-canvas princess-canvas--astronaut" aria-label="Astronaut character">
        <div className="princess-canvas__stage">
          <svg
            className="princess-canvas__figure"
            viewBox="0 0 200 260"
            role="img"
            aria-label="Stick figure astronaut"
          >
            <circle
              cx="100"
              cy="52"
              r="35"
              fill="#eff6ff"
              stroke={STROKE}
              strokeWidth={STROKE_W}
            />
            <path
              d="M 72 52 Q 100 32 128 52 Q 124 72 100 76 Q 76 72 72 52 Z"
              fill="#bfdbfe"
              stroke={STROKE}
              strokeWidth="2"
              strokeLinejoin={STROKE_JOIN}
            />
            <path
              d="M 76 26 Q 100 12 124 26"
              fill="none"
              stroke={helmetAccent}
              strokeWidth="8"
              strokeLinecap={STROKE_CAP}
            />
            <circle cx="91" cy="54" r="2.5" fill={STROKE} />
            <circle cx="109" cy="54" r="2.5" fill={STROKE} />
            <path d="M 93 62 Q 100 66 107 62" fill="none" stroke={STROKE} strokeWidth="2" />

            <line x1="78" y1="108" x2="52" y2="136" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />
            <line x1="122" y1="108" x2="148" y2="136" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />

            <rect
              key={dressId ?? 'space-suit'}
              className={`princess-canvas__dress${hasDress ? ' princess-canvas__dress--colored' : ''}`}
              x="70"
              y="86"
              width="60"
              height="86"
              rx="16"
              fill={dressColor}
              stroke={STROKE}
              strokeWidth={STROKE_W}
            />
            <circle cx="100" cy="124" r="13" fill="#fff" stroke={STROKE} strokeWidth="2" />
            <line x1="100" y1="137" x2="100" y2="164" stroke="#fff" strokeWidth="5" strokeLinecap={STROKE_CAP} />

            <line x1="86" y1="172" x2="82" y2="238" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />
            <line x1="114" y1="172" x2="118" y2="238" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap={STROKE_CAP} />

            {shoeStyle && <Shoes style={shoeStyle} colorOverride={shoeColor} />}
          </svg>

          {showLock && (
            <span className="princess-canvas__lock" aria-hidden="true">
              🔒
            </span>
          )}
        </div>
      </div>
    )
  }

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

          {crownStyle && <Crown style={crownStyle} fillOverride={crownColor} />}

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

          {shoeStyle && <Shoes style={shoeStyle} colorOverride={shoeColor} />}
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
