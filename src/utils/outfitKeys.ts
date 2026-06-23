import type { OutfitPair, OutfitTriple } from '../types/lesson'

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

export function makeOutfitPairKey(crownId: string, dressId: string): string {
  return `${crownId}_${dressId}`
}

export function makeOutfitTripleKey(
  crownId: string,
  dressId: string,
  shoeId: string,
): string {
  return `${crownId}_${dressId}_${shoeId}`
}

export function isDuplicatePair(
  outfits: OutfitPair[],
  crownId: string,
  dressId: string,
): boolean {
  const key = makeOutfitPairKey(crownId, dressId)
  return outfits.some((outfit) => makeOutfitPairKey(outfit.crownId, outfit.dressId) === key)
}

export function isDuplicateTriple(
  outfits: OutfitTriple[],
  crownId: string,
  dressId: string,
  shoeId: string,
): boolean {
  const key = makeOutfitTripleKey(crownId, dressId, shoeId)
  return outfits.some(
    (outfit) =>
      makeOutfitTripleKey(outfit.crownId, outfit.dressId, outfit.shoeId) === key,
  )
}
