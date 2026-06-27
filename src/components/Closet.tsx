import { memo, useState, type CSSProperties } from 'react'
import { ColoredHeart } from './ColoredHeart'
import { getClosetItemStyle, type ClosetItemStyle } from '../data/closetStyles'

export interface ClosetCategory {
  key: string
  title: string
  items: { id: string; label: string; style?: ClosetItemStyle }[]
}

interface ClosetProps {
  categories: ClosetCategory[]
  selected: Record<string, string | null>
  onSelect: (categoryKey: string, itemId: string) => void
}

function ColoredHeartIcon({
  color,
  shape,
}: {
  color: string
  shape?: NonNullable<ClosetItemStyle['motifShape']>
}) {
  return <ColoredHeart color={color} shape={shape} className="closet__heart" />
}

export const Closet = memo(function Closet({ categories, selected, onSelect }: ClosetProps) {
  const [tappedId, setTappedId] = useState<string | null>(null)

  function handleSelect(categoryKey: string, itemId: string) {
    setTappedId(itemId)
    onSelect(categoryKey, itemId)
    setTimeout(() => setTappedId(null), 200)
  }

  return (
    <div className="closet">
      {categories.map((category) => (
        <div key={category.key} className="closet__category">
          <h3 className="closet__title">{category.title}</h3>
          <div className="closet__items">
            {category.items.map((item) => {
              const isSelected = selected[category.key] === item.id
              const isTapped = tappedId === item.id
              const style = item.style ?? getClosetItemStyle(item.id)
              const itemStyle = {
                '--item-bg': style.background,
                '--item-text': style.text,
                '--item-border': style.border,
              } as CSSProperties

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`closet__item closet__item--themed${isSelected ? ' closet__item--selected' : ''}${isTapped ? ' closet__item--tapped' : ''}`}
                  style={itemStyle}
                  onClick={() => handleSelect(category.key, item.id)}
                  aria-label={`Select ${item.label}`}
                  aria-pressed={isSelected}
                >
                  {style.heartColor && (
                    <ColoredHeartIcon color={style.heartColor} shape={style.motifShape} />
                  )}
                  <span className="closet__item-label">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
})
