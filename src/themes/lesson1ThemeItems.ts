import { getClosetItemStyle, type ClosetItemStyle } from '../data/closetStyles'
import type { Lesson1ThemePack, Lesson1ThemeVisual, ThemeCategory, ThemeItemStyle } from './themeTypes'

const STABLE_ITEM_IDS = {
  crowns: ['gold-tiara', 'diamond-crown'],
  dresses: ['pink-gown', 'purple-dress', 'emerald-gown'],
  shoes: ['glass-slippers', 'riding-boots'],
} as const

const SPACE_ITEM_STYLES: Record<string, ClosetItemStyle> = {
  'gold-tiara': {
    label: 'Silver Helmet',
    background: '#e5e7eb',
    text: '#1f2937',
    border: '#94a3b8',
    heartColor: '#cbd5e1',
    motifShape: 'star',
  },
  'diamond-crown': {
    label: 'Star Helmet',
    background: '#e0f2fe',
    text: '#075985',
    border: '#38bdf8',
    heartColor: '#38bdf8',
    motifShape: 'star',
  },
  'pink-gown': {
    label: 'Blue Suit',
    background: '#eff6ff',
    text: '#1d4ed8',
    border: '#93c5fd',
    heartColor: '#3b82f6',
    motifShape: 'square',
  },
  'purple-dress': {
    label: 'Purple Suit',
    background: '#ede9fe',
    text: '#5b21b6',
    border: '#8b5cf6',
    heartColor: '#7c3aed',
    motifShape: 'square',
  },
  'emerald-gown': {
    label: 'Comet Suit',
    background: '#ccfbf1',
    text: '#0f766e',
    border: '#2dd4bf',
    heartColor: '#14b8a6',
    motifShape: 'square',
  },
  'glass-slippers': {
    label: 'Moon Boots',
    background: '#f8fafc',
    text: '#334155',
    border: '#94a3b8',
    heartColor: '#94a3b8',
    motifShape: 'circle',
  },
  'riding-boots': {
    label: 'Jet Boots',
    background: '#dbeafe',
    text: '#1e40af',
    border: '#2563eb',
    heartColor: '#2563eb',
    motifShape: 'circle',
  },
}

function getCategoryMotifShape(id: string, visual: Lesson1ThemeVisual): ClosetItemStyle['motifShape'] {
  if (id === 'gold-tiara' || id === 'diamond-crown') return 'star'
  if (id === 'pink-gown' || id === 'purple-dress' || id === 'emerald-gown') return 'square'
  if (id === 'glass-slippers' || id === 'riding-boots') return 'circle'
  return visual.motifShape
}

function createStyle(
  background: string,
  text: string,
  border: string,
  heartColor: string,
  motifShape: NonNullable<ClosetItemStyle['motifShape']>,
): ThemeItemStyle {
  return { background, text, border, heartColor, motifShape }
}

function deriveItemStyleFromLabel(
  label: string | undefined,
  id: string,
  visual: Lesson1ThemeVisual,
): ThemeItemStyle | undefined {
  const normalized = `${label ?? ''} ${id}`.toLowerCase()
  const motifShape = getCategoryMotifShape(id, visual) ?? visual.motifShape

  if (normalized.includes('fox')) {
    return createStyle('#ffedd5', '#9a3412', '#f97316', '#ea580c', 'paw')
  }
  if (normalized.includes('panda')) {
    return createStyle('#f8fafc', '#111827', '#64748b', '#111827', 'paw')
  }
  if (normalized.includes('tiger')) {
    return createStyle('#fef3c7', '#9a3412', '#f59e0b', '#f97316', 'paw')
  }
  if (normalized.includes('lion')) {
    return createStyle('#fef3c7', '#92400e', '#f59e0b', '#d97706', 'paw')
  }
  if (normalized.includes('safari') || normalized.includes('khaki')) {
    return createStyle('#fef3c7', '#78350f', '#d97706', '#92400e', 'circle')
  }
  if (normalized.includes('rescue')) {
    return createStyle('#dcfce7', '#166534', '#22c55e', '#16a34a', 'circle')
  }
  if (normalized.includes('trail') || normalized.includes('field')) {
    return createStyle('#ecfccb', '#365314', '#84cc16', '#4d7c0f', 'circle')
  }
  if (normalized.includes('creek') || normalized.includes('river') || normalized.includes('pond')) {
    return createStyle('#ccfbf1', '#0f766e', '#14b8a6', '#0d9488', 'circle')
  }
  if (normalized.includes('brown') || normalized.includes('boot')) {
    return createStyle('#fef3c7', '#78350f', '#d97706', '#92400e', 'circle')
  }
  if (normalized.includes('orange')) {
    return createStyle('#ffedd5', '#9a3412', '#fb923c', '#f97316', motifShape)
  }
  if (normalized.includes('black')) {
    return createStyle('#f8fafc', '#111827', '#64748b', '#111827', motifShape)
  }
  if (normalized.includes('red')) {
    return createStyle('#fee2e2', '#991b1b', '#ef4444', '#dc2626', motifShape)
  }
  if (normalized.includes('gold') || normalized.includes('yellow')) {
    return createStyle('#fef9c3', '#854d0e', '#facc15', '#eab308', motifShape)
  }
  if (normalized.includes('blue')) {
    return createStyle('#dbeafe', '#1e40af', '#60a5fa', '#2563eb', motifShape)
  }
  if (normalized.includes('purple')) {
    return createStyle('#f3e8ff', '#6b21a8', '#a855f7', '#9333ea', motifShape)
  }
  if (normalized.includes('green') || normalized.includes('emerald')) {
    return createStyle('#d1fae5', '#065f46', '#34d399', '#10b981', motifShape)
  }
  if (normalized.includes('pink') || normalized.includes('rose')) {
    return createStyle('#fce7f3', '#be185d', '#f472b6', '#ec4899', motifShape)
  }

  return undefined
}

function getLesson1ThemeItemStyle(
  visual: Lesson1ThemeVisual,
  id: string,
  override?: ThemeItemStyle,
  label?: string,
): ClosetItemStyle {
  const baseStyle = getClosetItemStyle(id)
  const labelStyle = override ?? (
    visual.character === 'astronaut'
      ? SPACE_ITEM_STYLES[id]
      : deriveItemStyleFromLabel(label, id, visual)
  )

  return {
    ...baseStyle,
    ...labelStyle,
    label: label ?? baseStyle.label,
    heartColor: labelStyle?.heartColor ?? baseStyle.heartColor ?? labelStyle?.border ?? baseStyle.border ?? visual.motifPrimary,
    motifShape: labelStyle?.motifShape ?? baseStyle.motifShape ?? getCategoryMotifShape(id, visual),
  }
}

export function themedLesson1Items(category: ThemeCategory, visual: Lesson1ThemeVisual, theme?: Lesson1ThemePack) {
  const ids = STABLE_ITEM_IDS[category.key]
  return ids.map((id, index) => ({
    id,
    label: category.items[index] ?? id,
    style: getLesson1ThemeItemStyle(visual, id, theme?.itemStyles?.[id], category.items[index]),
  }))
}

function getLesson1ThemeItemLabel(
  theme: Lesson1ThemePack,
  categoryKey: ThemeCategory['key'],
  id: string,
) {
  const category = theme.categories.find((entry) => entry.key === categoryKey)
  const index = STABLE_ITEM_IDS[categoryKey].findIndex((stableId) => stableId === id)
  return index >= 0 ? category?.items[index] ?? id : id
}

export function getLesson1ThemeItemLabels(theme: Lesson1ThemePack): Record<string, string> {
  return {
    'gold-tiara': getLesson1ThemeItemLabel(theme, 'crowns', 'gold-tiara'),
    'diamond-crown': getLesson1ThemeItemLabel(theme, 'crowns', 'diamond-crown'),
    'pink-gown': getLesson1ThemeItemLabel(theme, 'dresses', 'pink-gown'),
    'purple-dress': getLesson1ThemeItemLabel(theme, 'dresses', 'purple-dress'),
    'emerald-gown': getLesson1ThemeItemLabel(theme, 'dresses', 'emerald-gown'),
    'glass-slippers': getLesson1ThemeItemLabel(theme, 'shoes', 'glass-slippers'),
    'riding-boots': getLesson1ThemeItemLabel(theme, 'shoes', 'riding-boots'),
  }
}

export function getLesson1ThemeItemMotifs(
  visual: Lesson1ThemeVisual,
  itemStyles?: Lesson1ThemePack['itemStyles'],
  itemLabels?: Record<string, string>,
) {
  return {
    'gold-tiara': getLesson1ThemeItemStyle(visual, 'gold-tiara', itemStyles?.['gold-tiara'], itemLabels?.['gold-tiara']),
    'diamond-crown': getLesson1ThemeItemStyle(visual, 'diamond-crown', itemStyles?.['diamond-crown'], itemLabels?.['diamond-crown']),
    'pink-gown': getLesson1ThemeItemStyle(visual, 'pink-gown', itemStyles?.['pink-gown'], itemLabels?.['pink-gown']),
    'purple-dress': getLesson1ThemeItemStyle(visual, 'purple-dress', itemStyles?.['purple-dress'], itemLabels?.['purple-dress']),
    'emerald-gown': getLesson1ThemeItemStyle(visual, 'emerald-gown', itemStyles?.['emerald-gown'], itemLabels?.['emerald-gown']),
    'glass-slippers': getLesson1ThemeItemStyle(visual, 'glass-slippers', itemStyles?.['glass-slippers'], itemLabels?.['glass-slippers']),
    'riding-boots': getLesson1ThemeItemStyle(visual, 'riding-boots', itemStyles?.['riding-boots'], itemLabels?.['riding-boots']),
  }
}
