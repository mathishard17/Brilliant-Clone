/* eslint-disable react-refresh/only-export-components */
import type { WardrobeAssetPack, WardrobeRenderContext } from './types'

const STROKE = 2
const CAP = 'round' as const
const JOIN = 'round' as const

/** Shared anchor grid — all clothing snaps to these points. */
const BODY = {
  cx: 100,
  shoulderY: 92,
  torsoTop: 90,
  waistY: 158,
  dressHemY: 188,
  ankleY: 228,
  footBottom: 250,
  legW: 14,
  leftLegX: 83,
  rightLegX: 103,
  leftFootCx: 90,
  rightFootCx: 110,
  leftShoulderX: 74,
  rightShoulderX: 126,
} as const

/** Shared princess dress anchors — bodice stays consistent; skirts vary. */
const DRESS = {
  neckY: 80,
  shoulderY: 93,
  shoulderL: 73,
  shoulderR: 127,
  waistY: 118,
  bodiceL: 86,
  bodiceR: 114,
  hemY: BODY.dressHemY,
} as const

function shade(color: string, fallback: string) {
  return color || fallback
}

function Backdrop({ config, colors }: WardrobeRenderContext) {
  if (config.stage === 'space') {
    return (
      <g className="wardrobe-layer wardrobe-layer--backdrop" aria-hidden="true">
        <circle cx="42" cy="43" r="1.6" fill="#ffffff" opacity="0.7" />
        <circle cx="158" cy="58" r="1.2" fill="#ffffff" opacity="0.6" />
        <circle cx="153" cy="187" r="1.4" fill="#ffffff" opacity="0.55" />
        <path d="M 27 198 Q 74 182 119 198 T 184 199 L 184 260 L 27 260 Z" fill="#172554" opacity="0.22" />
      </g>
    )
  }

  if (config.stage === 'digSite') {
    return (
      <g className="wardrobe-layer wardrobe-layer--backdrop" aria-hidden="true">
        <path d="M 15 212 Q 76 190 139 210 T 196 214 L 196 260 L 15 260 Z" fill="#d9a441" opacity="0.28" />
        <path d="M 155 192 l 10 6 l -11 6 l -11 -6 Z" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" opacity="0.8" />
      </g>
    )
  }

  if (config.stage === 'rescue') {
    return (
      <g className="wardrobe-layer wardrobe-layer--backdrop" aria-hidden="true">
        <path d="M 20 212 Q 76 198 129 210 T 187 211 L 187 260 L 20 260 Z" fill="#bbf7d0" opacity="0.24" />
        <path d="M 37 186 h 30 v 22 h -30 Z" fill="#fff7ed" stroke={colors.accent} strokeWidth="1.5" opacity="0.85" />
      </g>
    )
  }

  if (config.stage === 'sports') {
    return (
      <g className="wardrobe-layer wardrobe-layer--backdrop" aria-hidden="true">
        <path d="M 14 215 H 186 V 260 H 14 Z" fill="#bbf7d0" opacity="0.3" />
        <path d="M 24 228 H 176 M 100 215 V 260" stroke="#ffffff" strokeWidth="2" opacity="0.45" />
      </g>
    )
  }

  if (config.stage === 'studio') {
    return (
      <g className="wardrobe-layer wardrobe-layer--backdrop" aria-hidden="true">
        <path d="M 20 218 Q 80 196 128 216 T 185 216 L 185 260 L 20 260 Z" fill="#f5d0fe" opacity="0.28" />
        <circle cx="38" cy="49" r="7" fill={colors.accent} opacity="0.18" />
      </g>
    )
  }

  return (
    <g className="wardrobe-layer wardrobe-layer--backdrop" aria-hidden="true">
      <path d="M 18 220 Q 69 200 118 218 T 188 220 L 188 260 L 18 260 Z" fill="#fbcfe8" opacity="0.24" />
      <path d="M 35 194 Q 63 178 91 194" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap={CAP} opacity="0.28" />
    </g>
  )
}

function GroundShadow() {
  return <ellipse className="wardrobe-layer wardrobe-layer--shadow" cx={BODY.cx} cy="248" rx="38" ry="5.5" fill="#0f172a" opacity="0.1" />
}

function HairBack({ config, colors, appearance }: WardrobeRenderContext) {
  if (config.head === 'helmet') return null
  const hairStyle = appearance.hairStyle
  if (hairStyle === 'bald' || hairStyle === 'short') return null

  if (hairStyle === 'buns') {
    return (
      <g className="wardrobe-layer wardrobe-layer--hair" aria-hidden="true">
        <circle cx="76" cy="60" r="9" fill={colors.hair} stroke={colors.outline} strokeWidth={STROKE} />
        <circle cx="124" cy="60" r="9" fill={colors.hair} stroke={colors.outline} strokeWidth={STROKE} />
      </g>
    )
  }

  if (hairStyle === 'bob') {
    return (
      <path
        className="wardrobe-layer wardrobe-layer--hair"
        d="M 78 44 Q 73 63 80 78 Q 100 87 120 78 Q 127 63 122 44 Q 113 53 100 53 Q 87 53 78 44 Z"
        fill={colors.hair}
        stroke={colors.outline}
        strokeWidth={STROKE}
        strokeLinejoin={JOIN}
        aria-hidden="true"
      />
    )
  }

  return (
    <path
      className="wardrobe-layer wardrobe-layer--hair"
      d="M 78 44 Q 72 67 78 92 Q 100 103 122 92 Q 128 67 122 44 Q 114 53 100 53 Q 86 53 78 44 Z"
      fill={colors.hair}
      stroke={colors.outline}
      strokeWidth={STROKE}
      strokeLinejoin={JOIN}
      aria-hidden="true"
    />
  )
}

function Legs({ hasDress, colors, config }: WardrobeRenderContext) {
  const pants = config.torso === 'dress' && !hasDress ? '#f8fafc' : '#475569'
  const legH = BODY.ankleY - BODY.waistY

  if (config.torso !== 'dress') {
    return (
      <g className="wardrobe-layer wardrobe-layer--legs" aria-hidden="true">
        <rect x={BODY.leftLegX} y={BODY.waistY} width={BODY.legW} height={legH} rx={6} fill={pants} stroke={colors.outline} strokeWidth={STROKE} />
        <rect x={BODY.rightLegX} y={BODY.waistY} width={BODY.legW} height={legH} rx={6} fill={pants} stroke={colors.outline} strokeWidth={STROKE} />
      </g>
    )
  }

  const hemY = BODY.dressHemY
  const peekH = BODY.ankleY - hemY
  return (
    <g className="wardrobe-layer wardrobe-layer--legs" aria-hidden="true">
      <rect x={BODY.leftLegX + 1} y={hemY} width={BODY.legW - 2} height={peekH} rx={4} fill={colors.skin} stroke={colors.outline} strokeWidth="1.5" />
      <rect x={BODY.rightLegX + 1} y={hemY} width={BODY.legW - 2} height={peekH} rx={4} fill={colors.skin} stroke={colors.outline} strokeWidth="1.5" />
    </g>
  )
}

function Arms({ colors, config, hasDress }: WardrobeRenderContext) {
  const sleeve = hasDress ? colors.dress : '#f8fafc'
  const { leftShoulderX, rightShoulderX, shoulderY } = BODY
  const leftWristX = leftShoulderX - 17
  const rightWristX = rightShoulderX + 17
  const wristY = 134
  const isPrincessDress = config.torso === 'dress'

  if (config.torso === 'spaceSuit') {
    return (
      <g className="wardrobe-layer wardrobe-layer--arms" aria-hidden="true">
        <path d={`M ${leftShoulderX} ${shoulderY} Q ${leftShoulderX - 12} ${shoulderY + 20} ${leftWristX} ${wristY}`} fill="none" stroke={colors.outline} strokeWidth="6" strokeLinecap={CAP} />
        <path d={`M ${rightShoulderX} ${shoulderY} Q ${rightShoulderX + 12} ${shoulderY + 20} ${rightWristX} ${wristY}`} fill="none" stroke={colors.outline} strokeWidth="6" strokeLinecap={CAP} />
        <path d={`M ${leftShoulderX} ${shoulderY} Q ${leftShoulderX - 12} ${shoulderY + 20} ${leftWristX} ${wristY}`} fill="none" stroke={sleeve} strokeWidth="3.5" strokeLinecap={CAP} />
        <path d={`M ${rightShoulderX} ${shoulderY} Q ${rightShoulderX + 12} ${shoulderY + 20} ${rightWristX} ${wristY}`} fill="none" stroke={sleeve} strokeWidth="3.5" strokeLinecap={CAP} />
      </g>
    )
  }

  if (isPrincessDress && hasDress) {
    const leftArmStartX = DRESS.shoulderL - 5
    const rightArmStartX = DRESS.shoulderR + 5
    const armStartY = DRESS.shoulderY + 10
    return (
      <g className="wardrobe-layer wardrobe-layer--arms" aria-hidden="true">
        <path d={`M ${leftArmStartX} ${armStartY} Q ${leftShoulderX - 15} ${shoulderY + 29} ${leftWristX} ${wristY}`} fill="none" stroke={colors.outline} strokeWidth="6" strokeLinecap={CAP} />
        <path d={`M ${rightArmStartX} ${armStartY} Q ${rightShoulderX + 15} ${shoulderY + 29} ${rightWristX} ${wristY}`} fill="none" stroke={colors.outline} strokeWidth="6" strokeLinecap={CAP} />
        <path d={`M ${leftArmStartX} ${armStartY} Q ${leftShoulderX - 15} ${shoulderY + 29} ${leftWristX} ${wristY}`} fill="none" stroke={colors.skin} strokeWidth="3.5" strokeLinecap={CAP} />
        <path d={`M ${rightArmStartX} ${armStartY} Q ${rightShoulderX + 15} ${shoulderY + 29} ${rightWristX} ${wristY}`} fill="none" stroke={colors.skin} strokeWidth="3.5" strokeLinecap={CAP} />
        <ellipse cx={leftArmStartX + 2} cy={armStartY + 2} rx="5" ry="4" fill={sleeve} stroke={colors.outline} strokeWidth="1.2" />
        <ellipse cx={rightArmStartX - 2} cy={armStartY + 2} rx="5" ry="4" fill={sleeve} stroke={colors.outline} strokeWidth="1.2" />
      </g>
    )
  }

  return (
    <g className="wardrobe-layer wardrobe-layer--arms" aria-hidden="true">
      <path d={`M ${leftShoulderX} ${shoulderY + 2} Q ${leftShoulderX - 12} ${shoulderY + 22} ${leftWristX} ${wristY}`} fill="none" stroke={colors.outline} strokeWidth="6" strokeLinecap={CAP} />
      <path d={`M ${rightShoulderX} ${shoulderY + 2} Q ${rightShoulderX + 12} ${shoulderY + 22} ${rightWristX} ${wristY}`} fill="none" stroke={colors.outline} strokeWidth="6" strokeLinecap={CAP} />
      <path d={`M ${leftShoulderX} ${shoulderY + 2} Q ${leftShoulderX - 12} ${shoulderY + 22} ${leftWristX} ${wristY}`} fill="none" stroke={colors.skin} strokeWidth="3.5" strokeLinecap={CAP} />
      <path d={`M ${rightShoulderX} ${shoulderY + 2} Q ${rightShoulderX + 12} ${shoulderY + 22} ${rightWristX} ${wristY}`} fill="none" stroke={colors.skin} strokeWidth="3.5" strokeLinecap={CAP} />
      <path d={`M ${leftShoulderX - 2} ${BODY.torsoTop - 2} L ${leftShoulderX - 14} ${shoulderY + 16} L ${leftShoulderX - 2} ${shoulderY + 24} L ${leftShoulderX + 10} ${shoulderY + 4} Z`} fill={sleeve} stroke={colors.outline} strokeWidth="1.5" strokeLinejoin={JOIN} />
      <path d={`M ${rightShoulderX + 2} ${BODY.torsoTop - 2} L ${rightShoulderX + 14} ${shoulderY + 16} L ${rightShoulderX + 2} ${shoulderY + 24} L ${rightShoulderX - 10} ${shoulderY + 4} Z`} fill={sleeve} stroke={colors.outline} strokeWidth="1.5" strokeLinejoin={JOIN} />
    </g>
  )
}

function DressCapSleeves({ fill, outline }: { fill: string; outline: string }) {
  const { shoulderL, shoulderR, shoulderY } = DRESS
  return (
    <>
      <path
        d={`M ${shoulderL + 2} ${shoulderY} Q ${shoulderL - 9} ${shoulderY + 5} ${shoulderL - 10} ${shoulderY + 17} Q ${shoulderL + 2} ${shoulderY + 19} ${shoulderL + 12} ${shoulderY + 7} Z`}
        fill={fill}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin={JOIN}
      />
      <path
        d={`M ${shoulderR - 2} ${shoulderY} Q ${shoulderR + 9} ${shoulderY + 5} ${shoulderR + 10} ${shoulderY + 17} Q ${shoulderR - 2} ${shoulderY + 19} ${shoulderR - 12} ${shoulderY + 7} Z`}
        fill={fill}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin={JOIN}
      />
    </>
  )
}

function DressBodice({ fill, outline }: { fill: string; outline: string }) {
  const { neckY, shoulderL, shoulderR, shoulderY, waistY, bodiceL, bodiceR } = DRESS
  const cx = BODY.cx
  return (
    <path
      d={`M ${cx} ${neckY}
        C ${cx + 11} ${neckY + 2} ${shoulderR - 3} ${shoulderY - 1} ${shoulderR} ${shoulderY + 4}
        L ${bodiceR} ${waistY}
        Q ${cx} ${waistY + 8} ${bodiceL} ${waistY}
        L ${shoulderL} ${shoulderY + 4}
        C ${shoulderL + 3} ${shoulderY - 1} ${cx - 11} ${neckY + 2} ${cx} ${neckY} Z`}
      fill={fill}
      stroke={outline}
      strokeWidth={STROKE}
      strokeLinejoin={JOIN}
    />
  )
}

function DressWaist({ accent }: { accent: string }) {
  return (
    <path
      d={`M 84 ${DRESS.waistY} Q ${BODY.cx} ${DRESS.waistY + 6} 116 ${DRESS.waistY}`}
      fill="none"
      stroke={accent}
      strokeWidth="3"
      strokeLinecap={CAP}
      opacity="0.72"
    />
  )
}

function DressTorso({ dressId, colors, hasDress }: WardrobeRenderContext) {
  const fill = hasDress ? colors.dress : '#f8fafc'
  const accent = shade(colors.accent, '#f9a8d4')
  const layerClass = 'wardrobe-layer wardrobe-layer--torso'
  const { hemY, cx } = { ...DRESS, cx: BODY.cx }

  if (!hasDress) {
    return (
      <g key="bare" className={layerClass} aria-hidden="true">
        <path
          d={`M 86 ${DRESS.waistY}
            Q ${cx} ${DRESS.waistY + 5} 114 ${DRESS.waistY}
            L 122 ${hemY + 1}
            Q ${cx} ${hemY + 7} 78 ${hemY + 1} Z`}
          fill={fill}
          stroke={colors.outline}
          strokeWidth={STROKE}
          strokeLinejoin={JOIN}
        />
        <DressBodice fill={fill} outline={colors.outline} />
        <DressWaist accent="#e2e8f0" />
      </g>
    )
  }

  if (dressId === 'purple-dress') {
    const hem = hemY + 4
    return (
      <g key={dressId} className={layerClass} aria-hidden="true">
        <path
          d={`M 88 ${DRESS.waistY}
            Q ${cx} ${DRESS.waistY + 5} 112 ${DRESS.waistY}
            C 119 ${DRESS.waistY + 22} 126 ${DRESS.waistY + 48} 129 ${hem}
            Q ${cx} ${hem + 7} 71 ${hem}
            C 74 ${DRESS.waistY + 48} 81 ${DRESS.waistY + 22} 88 ${DRESS.waistY} Z`}
          fill={fill}
          stroke={colors.outline}
          strokeWidth={STROKE}
          strokeLinejoin={JOIN}
        />
        <DressBodice fill={fill} outline={colors.outline} />
        <DressWaist accent={accent} />
        <path d={`M ${cx} ${DRESS.neckY + 9} Q 92 136 82 ${hem - 7}`} fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap={CAP} opacity="0.34" />
        <path d={`M ${cx} ${DRESS.neckY + 9} Q 108 136 118 ${hem - 7}`} fill="none" stroke={accent} strokeWidth="2" strokeLinecap={CAP} opacity="0.3" />
        <DressCapSleeves fill={fill} outline={colors.outline} />
      </g>
    )
  }

  if (dressId === 'emerald-gown') {
    return (
      <g key={dressId} className={layerClass} aria-hidden="true">
        <path
          d={`M 84 ${DRESS.waistY}
            Q ${cx} ${DRESS.waistY + 8} 116 ${DRESS.waistY}
            L 126 ${hemY + 3}
            Q ${cx} ${hemY + 10} 74 ${hemY + 3} Z`}
          fill={fill}
          stroke={colors.outline}
          strokeWidth={STROKE}
          strokeLinejoin={JOIN}
        />
        <DressBodice fill={fill} outline={colors.outline} />
        <DressWaist accent={accent} />
        <path d="M 88 101 Q 100 111 112 101" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap={CAP} opacity="0.5" />
        <path d={`M 88 ${DRESS.waistY + 11} Q 96 150 89 ${hemY - 5}`} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap={CAP} opacity="0.22" />
        <path d={`M 112 ${DRESS.waistY + 11} Q 104 150 111 ${hemY - 5}`} fill="none" stroke={accent} strokeWidth="2" strokeLinecap={CAP} opacity="0.28" />
        <DressCapSleeves fill={fill} outline={colors.outline} />
      </g>
    )
  }

  return (
    <g key={dressId ?? 'pink-gown'} className={layerClass} aria-hidden="true">
      <path
        d={`M 84 ${DRESS.waistY}
          Q ${cx} ${DRESS.waistY + 9} 116 ${DRESS.waistY}
          C 124 138 132 166 128 ${hemY + 4}
          Q ${cx} ${hemY + 16} 72 ${hemY + 4}
          C 68 166 76 138 84 ${DRESS.waistY} Z`}
        fill={fill}
        stroke={colors.outline}
        strokeWidth={STROKE}
        strokeLinejoin={JOIN}
      />
      <DressBodice fill={fill} outline={colors.outline} />
      <DressWaist accent={accent} />
      <path d="M 88 101 Q 100 113 112 101" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap={CAP} opacity="0.5" />
      <path d={`M 82 ${DRESS.waistY + 12} Q 91 153 80 ${hemY - 2}`} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap={CAP} opacity="0.2" />
      <path d={`M 118 ${DRESS.waistY + 12} Q 109 153 120 ${hemY - 2}`} fill="none" stroke={accent} strokeWidth="2" strokeLinecap={CAP} opacity="0.26" />
      <ellipse cx={cx} cy="151" rx="15" ry="5" fill="#ffffff" opacity="0.1" />
      <DressCapSleeves fill={fill} outline={colors.outline} />
    </g>
  )
}

function AdventureTorso({ config, colors, hasDress, dressId }: WardrobeRenderContext) {
  const fill = hasDress ? colors.dress : '#f8fafc'
  const trim = colors.accent
  const layerClass = 'wardrobe-layer wardrobe-layer--torso'
  const top = BODY.torsoTop
  const bottom = BODY.waistY
  const sideL = 72
  const sideR = 128

  if (config.torso === 'spaceSuit') {
    return (
      <g key={dressId ?? 'space-suit'} className={layerClass} aria-hidden="true">
        <rect x={sideL} y={top} width={sideR - sideL} height={bottom - top} rx="16" fill={fill} stroke={colors.outline} strokeWidth={STROKE} />
        <circle cx={BODY.cx} cy="124" r="12" fill="#ffffff" stroke={colors.outline} strokeWidth="1.5" />
        <path d="M 86 104 H 114 M 100 138 V 154" stroke="#ffffff" strokeWidth="3.5" strokeLinecap={CAP} opacity="0.55" />
        <path d={`M 80 ${bottom - 8} Q ${BODY.cx} ${bottom + 2} 120 ${bottom - 8}`} fill="none" stroke={trim} strokeWidth="3" strokeLinecap={CAP} opacity="0.6" />
      </g>
    )
  }

  if (config.torso === 'jersey') {
    return (
      <g key={dressId ?? 'jersey'} className={layerClass} aria-hidden="true">
        <path d={`M ${sideL} ${top} H ${sideR} L 125 ${bottom} Q ${BODY.cx} ${bottom + 8} 75 ${bottom} Z`} fill={fill} stroke={colors.outline} strokeWidth={STROKE} strokeLinejoin={JOIN} />
        <path d="M 82 92 L 94 106 H 106 L 118 92" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap={CAP} opacity="0.7" />
        <text x={BODY.cx} y="134" textAnchor="middle" fontSize="22" fontWeight="700" fill="#ffffff" opacity="0.9">1</text>
      </g>
    )
  }

  if (config.torso === 'smock' || config.torso === 'apron') {
    return (
      <g key={dressId ?? 'smock'} className={layerClass} aria-hidden="true">
        <rect x={sideL + 1} y={top} width={sideR - sideL - 2} height={bottom - top} rx="16" fill="#fef3c7" stroke={colors.outline} strokeWidth={STROKE} />
        <path d={`M 82 106 H 118 L 122 ${bottom} Q ${BODY.cx} ${bottom + 8} 78 ${bottom} Z`} fill={fill} stroke={colors.outline} strokeWidth="1.5" strokeLinejoin={JOIN} />
      </g>
    )
  }

  return (
    <g key={dressId ?? 't-shirt'} className={layerClass} aria-hidden="true">
      <path
        d={`M ${sideL + 8} ${top + 3}
          H ${sideR - 8}
          L ${sideR - 14} ${bottom}
          H ${sideL + 14}
          Z`}
        fill={fill}
        stroke={colors.outline}
        strokeWidth={STROKE}
        strokeLinejoin={JOIN}
      />
    </g>
  )
}

function Torso(context: WardrobeRenderContext) {
  if (context.config.torso === 'dress') return <DressTorso {...context} />
  return <AdventureTorso {...context} />
}

function Neck({ config, colors }: WardrobeRenderContext) {
  if (config.head === 'helmet') return null
  return (
    <path
      className="wardrobe-layer wardrobe-layer--neck"
      d="M 94 80 Q 100 76 106 80 L 104 94 Q 100 97 96 94 Z"
      fill={colors.skin}
      stroke={colors.outline}
      strokeWidth={STROKE}
      strokeLinejoin={JOIN}
      aria-hidden="true"
    />
  )
}

function Hands({ colors, config, hasDress }: WardrobeRenderContext) {
  const glove = config.torso === 'spaceSuit' ? (hasDress ? colors.dress : '#dbeafe') : colors.skin
  const leftX = BODY.leftShoulderX - 17
  const rightX = BODY.rightShoulderX + 17
  const y = 134
  return (
    <g className="wardrobe-layer wardrobe-layer--hands" aria-hidden="true">
      <ellipse cx={leftX} cy={y} rx="6" ry="5.5" fill={glove} stroke={colors.outline} strokeWidth={STROKE} />
      <ellipse cx={rightX} cy={y} rx="6" ry="5.5" fill={glove} stroke={colors.outline} strokeWidth={STROKE} />
    </g>
  )
}

function HairFront({ appearance, colors, config }: WardrobeRenderContext) {
  if (appearance.hairStyle === 'bald') return null
  if (config.head === 'helmet') return null

  return (
    <path
      d="M 78 56 A 22 22 0 0 1 122 56 Q 111 51 100 51 Q 89 51 78 56 Z"
      fill={colors.hair}
      stroke={colors.outline}
      strokeWidth="1.5"
      strokeLinejoin={JOIN}
    />
  )
}

function Head(context: WardrobeRenderContext) {
  const { config, colors } = context
  const accessory = colors.crown
  if (config.head === 'helmet') {
    return (
      <g className="wardrobe-layer wardrobe-layer--head" aria-hidden="true">
        <circle cx="100" cy="54" r="30" fill="#eff6ff" stroke={colors.outline} strokeWidth={STROKE} />
        <path d="M 76 54 Q 100 36 124 54 Q 120 70 100 74 Q 80 70 76 54 Z" fill="#bfdbfe" stroke={colors.outline} strokeWidth="1.5" strokeLinejoin={JOIN} />
        <path d="M 78 28 Q 100 16 122 28" fill="none" stroke={accessory} strokeWidth="5" strokeLinecap={CAP} />
        <circle cx="92" cy="56" r="2" fill={colors.outline} />
        <circle cx="108" cy="56" r="2" fill={colors.outline} />
        <path d="M 94 64 Q 100 67 106 64" fill="none" stroke={colors.outline} strokeWidth="1.5" strokeLinecap={CAP} />
      </g>
    )
  }

  return (
    <g className="wardrobe-layer wardrobe-layer--head" aria-hidden="true">
      {config.head === 'dinoHood' && (
        <path d="M 70 52 Q 76 24 100 20 Q 124 24 130 52 Q 114 42 100 42 Q 86 42 70 52 Z" fill={accessory} stroke={colors.outline} strokeWidth={STROKE} strokeLinejoin={JOIN} />
      )}
      {config.head === 'animalEars' && (
        <>
          <path d="M 80 38 L 72 20 L 94 34 Z" fill={accessory} stroke={colors.outline} strokeWidth={STROKE} strokeLinejoin={JOIN} />
          <path d="M 120 38 L 128 20 L 106 34 Z" fill={accessory} stroke={colors.outline} strokeWidth={STROKE} strokeLinejoin={JOIN} />
        </>
      )}
      <ellipse cx="100" cy="58" rx="22" ry="24" fill={colors.skin} stroke={colors.outline} strokeWidth={STROKE} />
      <HairFront {...context} />
      <circle cx="92" cy="56" r="2" fill={colors.outline} />
      <circle cx="108" cy="56" r="2" fill={colors.outline} />
      <path d="M 94 66 Q 100 69 106 66" fill="none" stroke={colors.outline} strokeWidth="1.5" strokeLinecap={CAP} />
      {config.head === 'cap' && (
        <>
          <path d="M 76 45 Q 84 30 100 28 Q 116 30 124 45 Q 110 42 100 42 Q 90 42 76 45 Z" fill={accessory} stroke={colors.outline} strokeWidth={STROKE} strokeLinejoin={JOIN} />
          <path d="M 110 44 Q 130 43 146 48 Q 128 50 110 46 Z" fill={accessory} stroke={colors.outline} strokeWidth="2" strokeLinecap={CAP} strokeLinejoin={JOIN} />
        </>
      )}
      {config.head === 'chefHat' && (
        <>
          <circle cx="84" cy="34" r="9" fill="#fff" stroke={colors.outline} strokeWidth="1.5" />
          <circle cx="100" cy="28" r="11" fill="#fff" stroke={colors.outline} strokeWidth="1.5" />
          <circle cx="116" cy="34" r="9" fill="#fff" stroke={colors.outline} strokeWidth="1.5" />
          <rect x="78" y="36" width="44" height="14" rx="5" fill="#fff" stroke={colors.outline} strokeWidth="1.5" />
        </>
      )}
      {config.head === 'sunHat' && (
        <>
          <ellipse cx="100" cy="44" rx="38" ry="7" fill={accessory} stroke={colors.outline} strokeWidth={STROKE} />
          <path d="M 82 43 Q 100 24 118 43 Z" fill={accessory} stroke={colors.outline} strokeWidth={STROKE} strokeLinejoin={JOIN} />
        </>
      )}
      {config.head === 'beret' && (
        <>
          <ellipse cx="98" cy="37" rx="28" ry="11" fill={accessory} stroke={colors.outline} strokeWidth={STROKE} />
          <line x1="108" y1="27" x2="116" y2="20" stroke={colors.outline} strokeWidth="1.5" strokeLinecap={CAP} />
        </>
      )}
    </g>
  )
}

function HeadAccessory({ crownId, colors, config }: WardrobeRenderContext) {
  if (!crownId || config.head !== 'hair') return null
  if (crownId === 'diamond-crown') {
    return (
      <g key={crownId} className="wardrobe-layer wardrobe-layer--head-accessory" aria-hidden="true">
        <path d="M 72 46 L 78 28 L 88 42 L 100 24 L 112 42 L 122 28 L 128 46 Z" fill={colors.crown} stroke={colors.outline} strokeWidth={STROKE} strokeLinecap={CAP} strokeLinejoin={JOIN} />
        <line x1="72" y1="46" x2="128" y2="46" stroke={colors.outline} strokeWidth={STROKE} />
        <circle cx="100" cy="34" r="2.5" fill="#ffffff" opacity="0.75" />
      </g>
    )
  }

  return (
    <g key={crownId} className="wardrobe-layer wardrobe-layer--head-accessory" aria-hidden="true">
      <path d="M 76 44 L 82 32 L 90 40 L 100 28 L 110 40 L 118 32 L 124 44 Z" fill={colors.crown} stroke={colors.outline} strokeWidth={STROKE} strokeLinecap={CAP} strokeLinejoin={JOIN} />
      <line x1="76" y1="44" x2="124" y2="44" stroke={colors.outline} strokeWidth={STROKE} />
    </g>
  )
}

function RidingBoot({ cx, colors }: { cx: number; colors: WardrobeRenderContext['colors'] }) {
  const top = BODY.ankleY - 8
  const bottom = BODY.footBottom - 1
  const halfW = 8

  return (
    <g aria-hidden="true">
      <path
        d={`M ${cx - halfW} ${top + 6}
           L ${cx - halfW - 1} ${bottom - 5}
           Q ${cx - halfW + 2} ${bottom} ${cx + halfW + 2} ${bottom - 1}
           L ${cx + halfW + 1} ${top + 8}
           Q ${cx} ${top} ${cx - halfW} ${top + 6} Z`}
        fill={colors.shoe}
        stroke={colors.outline}
        strokeWidth={STROKE}
        strokeLinejoin={JOIN}
      />
      <line
        x1={cx - halfW + 3}
        y1={top + 10}
        x2={cx + halfW - 2}
        y2={top + 10}
        stroke="#fde68a"
        strokeWidth="2"
        strokeLinecap={CAP}
        opacity="0.75"
      />
    </g>
  )
}

function GlassSlipper({ cx, colors, toeDirection }: { cx: number; colors: WardrobeRenderContext['colors']; toeDirection: 'left' | 'right' }) {
  const top = BODY.ankleY + 2
  const bottom = BODY.footBottom - 2
  const dir = toeDirection === 'left' ? -1 : 1

  return (
    <g aria-hidden="true">
      <path
        d={`M ${cx - dir * 6} ${top + 5}
           Q ${cx} ${top - 2} ${cx + dir * 5} ${top}
           L ${cx + dir * 14} ${bottom - 5}
           Q ${cx + dir * 7} ${bottom} ${cx - dir * 7} ${bottom - 2}
           Q ${cx - dir * 5} ${top + 7} ${cx - dir * 6} ${top + 5} Z`}
        fill={colors.shoe}
        stroke={colors.outline}
        strokeWidth={STROKE}
        strokeLinejoin={JOIN}
      />
      <ellipse cx={cx + dir * 5} cy={bottom - 7} rx="3" ry="1.5" fill="#ffffff" opacity="0.55" />
    </g>
  )
}

function Feet({ shoeId, colors }: WardrobeRenderContext) {
  const { leftFootCx, rightFootCx, ankleY, footBottom } = BODY

  if (shoeId === 'riding-boots') {
    return (
      <g key={shoeId} className="wardrobe-layer wardrobe-layer--feet" aria-hidden="true">
        <RidingBoot cx={leftFootCx} colors={colors} />
        <RidingBoot cx={rightFootCx} colors={colors} />
      </g>
    )
  }

  if (shoeId === 'glass-slippers') {
    return (
      <g key={shoeId} className="wardrobe-layer wardrobe-layer--feet" aria-hidden="true">
        <GlassSlipper cx={leftFootCx} colors={colors} toeDirection="left" />
        <GlassSlipper cx={rightFootCx} colors={colors} toeDirection="right" />
      </g>
    )
  }

  const sockTop = ankleY - 4
  return (
    <g className="wardrobe-layer wardrobe-layer--feet" aria-hidden="true">
      <path d={`M ${leftFootCx - 10} ${sockTop} Q ${leftFootCx - 2} ${sockTop - 6} ${leftFootCx + 8} ${sockTop} L ${leftFootCx + 8} ${footBottom - 6} Q ${leftFootCx} ${footBottom - 2} ${leftFootCx - 10} ${footBottom - 6} Z`} fill="#f8fafc" stroke={colors.outline} strokeWidth={STROKE} strokeLinejoin={JOIN} />
      <path d={`M ${rightFootCx + 10} ${sockTop} Q ${rightFootCx + 2} ${sockTop - 6} ${rightFootCx - 8} ${sockTop} L ${rightFootCx - 8} ${footBottom - 6} Q ${rightFootCx} ${footBottom - 2} ${rightFootCx + 10} ${footBottom - 6} Z`} fill="#f8fafc" stroke={colors.outline} strokeWidth={STROKE} strokeLinejoin={JOIN} />
    </g>
  )
}

const LAYERS: WardrobeAssetPack['layers'] = [
  { slot: 'backdrop', key: 'backdrop', render: (context) => <Backdrop {...context} /> },
  { slot: 'shadow', key: 'shadow', render: () => <GroundShadow /> },
  { slot: 'hairBack', key: 'hair-back', render: (context) => <HairBack {...context} /> },
  { slot: 'legs', key: 'legs', render: (context) => <Legs {...context} /> },
  { slot: 'arms', key: 'arms', render: (context) => <Arms {...context} /> },
  { slot: 'torso', key: 'torso', render: (context) => <Torso {...context} /> },
  { slot: 'body', key: 'neck', render: (context) => <Neck {...context} /> },
  { slot: 'head', key: 'head', render: (context) => <Head {...context} /> },
  { slot: 'headAccessory', key: 'head-accessory', render: (context) => <HeadAccessory {...context} /> },
  { slot: 'feet', key: 'feet', render: (context) => <Feet {...context} /> },
  { slot: 'foreground', key: 'hands', render: (context) => <Hands {...context} /> },
]

export const WARDROBE_ASSET_PACKS: Record<string, WardrobeAssetPack> = {
  royal: { id: 'royal', label: 'Royal Academy', className: 'princess-canvas--royal', layers: LAYERS },
  space: { id: 'space', label: 'Space Academy', className: 'princess-canvas--space', layers: LAYERS },
  digSite: { id: 'digSite', label: 'Dinosaur Dig', className: 'princess-canvas--dig-site', layers: LAYERS },
  rescue: { id: 'rescue', label: 'Animal Rescue', className: 'princess-canvas--rescue', layers: LAYERS },
  sports: { id: 'sports', label: 'Sports Squad', className: 'princess-canvas--sports', layers: LAYERS },
  studio: { id: 'studio', label: 'Surprise Studio', className: 'princess-canvas--studio', layers: LAYERS },
}
