/** Fill colors for the dress triangle — everything else stays black. */
export const DRESS_COLORS: Record<string, string> = {
  'pink-gown': '#f472b6',
  'purple-dress': '#a855f7',
  'emerald-gown': '#34d399',
}

/** Plain white dress for anchor-trick steps before colors appear. */
export const WHITE_DRESS_ID = 'white'

export function getDressColor(dressId: string | null | undefined): string {
  if (!dressId) return '#ffffff'
  if (dressId === WHITE_DRESS_ID) return '#ffffff'
  return DRESS_COLORS[dressId] ?? '#e9d5ff'
}

export type CrownStyle = 'gold-tiara' | 'diamond-crown'

export function getCrownStyle(crownId: string | null | undefined): CrownStyle | null {
  if (crownId === 'gold-tiara' || crownId === 'diamond-crown') return crownId
  return null
}

export type ShoeStyle = 'glass-slippers' | 'riding-boots'

export function getShoeStyle(shoeId: string | null | undefined): ShoeStyle | null {
  if (shoeId === 'glass-slippers' || shoeId === 'riding-boots') return shoeId
  return null
}
