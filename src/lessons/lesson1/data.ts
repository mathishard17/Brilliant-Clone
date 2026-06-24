export type ClosetCategory = 'crowns' | 'dresses' | 'shoes'

export interface ClosetItem {
  id: string
  label: string
}

export const CROWNS: ClosetItem[] = [
  { id: 'gold-tiara', label: 'Gold Tiara' },
  { id: 'diamond-crown', label: 'Diamond Crown' },
]

export const DRESSES: ClosetItem[] = [
  { id: 'pink-gown', label: 'Pink Ballgown' },
  { id: 'purple-dress', label: 'Purple Dress' },
  { id: 'emerald-gown', label: 'Emerald Gown' },
]

export const SHOES: ClosetItem[] = [
  { id: 'glass-slippers', label: 'Glass Slippers' },
  { id: 'riding-boots', label: 'Riding Boots' },
]

const CATALOG: Record<ClosetCategory, ClosetItem[]> = {
  crowns: CROWNS,
  dresses: DRESSES,
  shoes: SHOES,
}

export function getItemLabel(category: ClosetCategory, id: string): string {
  const item = CATALOG[category].find((entry) => entry.id === id)
  return item?.label ?? id
}
