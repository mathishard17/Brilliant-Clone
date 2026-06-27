/** Visual styling for closet option bubbles — text has no emojis. */
export interface ClosetItemStyle {
  label: string
  background: string
  text: string
  border: string
  /** Colored heart for dress options */
  heartColor?: string
  motifShape?: 'heart' | 'circle' | 'square' | 'star' | 'diamond' | 'triangle' | 'paw'
  /** Optional approved local visual asset key. Never a URL. */
  assetKey?: string
  icon?: string
}

export const CLOSET_ITEM_STYLES: Record<string, ClosetItemStyle> = {
  'gold-tiara': {
    label: 'Gold Tiara',
    background: '#fef9c3',
    text: '#854d0e',
    border: '#facc15',
    heartColor: '#eab308',
    motifShape: 'star',
  },
  'diamond-crown': {
    label: 'Diamond Crown',
    background: '#e0f2fe',
    text: '#0369a1',
    border: '#38bdf8',
    heartColor: '#0ea5e9',
    motifShape: 'star',
  },
  'pink-gown': {
    label: 'Pink Ballgown',
    background: '#fce7f3',
    text: '#be185d',
    border: '#f472b6',
    heartColor: '#ec4899',
    motifShape: 'heart',
  },
  'purple-dress': {
    label: 'Purple Dress',
    background: '#f3e8ff',
    text: '#6b21a8',
    border: '#a855f7',
    heartColor: '#9333ea',
    motifShape: 'heart',
  },
  'emerald-gown': {
    label: 'Emerald Gown',
    background: '#d1fae5',
    text: '#065f46',
    border: '#34d399',
    heartColor: '#10b981',
    motifShape: 'heart',
  },
  'glass-slippers': {
    label: 'Glass Slippers',
    background: '#f0f9ff',
    text: '#0c4a6e',
    border: '#7dd3fc',
    heartColor: '#38bdf8',
    motifShape: 'circle',
  },
  'riding-boots': {
    label: 'Riding Boots',
    background: '#fef3c7',
    text: '#78350f',
    border: '#d97706',
    heartColor: '#b45309',
    motifShape: 'circle',
  },
}

export function getClosetItemStyle(id: string): ClosetItemStyle {
  return (
    CLOSET_ITEM_STYLES[id] ?? {
      label: id,
      background: '#faf5ff',
      text: '#4c1d95',
      border: '#e9d5ff',
    }
  )
}

export const CROWN_FILL_COLORS: Record<string, string> = {
  'gold-tiara': '#fde047',
  'diamond-crown': '#bae6fd',
}

export interface ShoeFillColors {
  main: string
  accent: string
  highlight: string
}

export const SHOE_FILL_COLORS: Record<string, ShoeFillColors> = {
  'glass-slippers': {
    main: '#bae6fd',
    accent: '#38bdf8',
    highlight: '#ffffff',
  },
  'riding-boots': {
    main: '#b45309',
    accent: '#78350f',
    highlight: '#fde68a',
  },
}

/** Emojis shown in the outfit log (crowns & shoes). Dresses use colored hearts. */
export const OUTFIT_LOG_EMOJI: Record<string, string> = {
  'gold-tiara': '👑',
  'diamond-crown': '💎',
  'glass-slippers': '🥿',
  'riding-boots': '🥾',
}

export function getOutfitLogEmoji(id: string): string | null {
  return OUTFIT_LOG_EMOJI[id] ?? null
}

export function getDressHeartColor(dressId: string): string | null {
  return CLOSET_ITEM_STYLES[dressId]?.heartColor ?? null
}
