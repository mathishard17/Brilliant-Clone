import { useEffect, useState } from 'react'
import type { OutfitPair, OutfitTriple } from '../types/lesson'
import { isDuplicatePair, isDuplicateTriple } from '../utils/outfitKeys'

const EMPTY_SELECTED: Record<string, string | null> = {
  crowns: null,
  dresses: null,
  shoes: null,
}

interface PairTrackerOptions {
  mode: 'pair'
  discoveredOutfits: OutfitPair[]
  onNewOutfit: (outfit: OutfitPair) => void
}

interface TripleTrackerOptions {
  mode: 'triple'
  discoveredOutfits: OutfitTriple[]
  onNewOutfit: (outfit: OutfitTriple) => void
}

type UseOutfitTrackerOptions = PairTrackerOptions | TripleTrackerOptions

export function useOutfitTracker(options: UseOutfitTrackerOptions) {
  const { mode, discoveredOutfits, onNewOutfit } = options

  const [selected, setSelected] = useState<Record<string, string | null>>(EMPTY_SELECTED)

  const crownId = selected.crowns
  const dressId = selected.dresses
  const shoeId = selected.shoes

  useEffect(() => {
    if (!crownId || !dressId) return

    if (mode === 'pair') {
      if (isDuplicatePair(discoveredOutfits, crownId, dressId)) return
      onNewOutfit({ crownId, dressId })
      return
    }

    if (!shoeId) return
    if (isDuplicateTriple(discoveredOutfits, crownId, dressId, shoeId)) return
    onNewOutfit({ crownId, dressId, shoeId })
  }, [crownId, dressId, shoeId, mode, discoveredOutfits, onNewOutfit])

  function handleSelect(categoryKey: string, itemId: string) {
    setSelected((prev) => ({ ...prev, [categoryKey]: itemId }))
  }

  function resetSelected() {
    setSelected(EMPTY_SELECTED)
  }

  return {
    selected,
    setSelected,
    handleSelect,
    resetSelected,
    crownId,
    dressId,
    shoeId,
  }
}
