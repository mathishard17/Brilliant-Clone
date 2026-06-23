import { memo } from 'react'
import type { OutfitPair, OutfitTriple } from '../types/lesson'
import { makeOutfitPairKey, makeOutfitTripleKey } from '../utils/outfitKeys'
import { LessonButton } from './LessonButton'
import { OutfitLogPair, OutfitLogTriple } from './OutfitLogEntry'

type OutfitLogOutfit = OutfitPair | OutfitTriple

interface OutfitLogProps {
  outfits: OutfitLogOutfit[]
  total: number
  mode: 'pair' | 'triple'
  onReset?: () => void
}

export const OutfitLog = memo(function OutfitLog({ outfits, total, mode, onReset }: OutfitLogProps) {
  return (
    <div className="outfit-log" role="status" aria-live="polite">
      <div className="outfit-log__header">
        <p className="outfit-log__heading">Unique Princess Looks Found:</p>
        {onReset && (
          <LessonButton label="Reset" variant="secondary" onClick={onReset} />
        )}
      </div>
      {outfits.length === 0 ? (
        <p className="outfit-log__empty">Try tapping items in the closet!</p>
      ) : (
        <ul className="outfit-log__list">
          {outfits.map((outfit) => (
            <li key={mode === 'pair' ? makeOutfitPairKey((outfit as OutfitPair).crownId, (outfit as OutfitPair).dressId) : makeOutfitTripleKey((outfit as OutfitTriple).crownId, (outfit as OutfitTriple).dressId, (outfit as OutfitTriple).shoeId)}>
              {mode === 'pair' ? (
                <OutfitLogPair outfit={outfit as OutfitPair} />
              ) : (
                <OutfitLogTriple outfit={outfit as OutfitTriple} />
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="outfit-log__counter">
        Total Unique Found: <strong>{total}</strong>
      </p>
    </div>
  )
})
