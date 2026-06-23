import { memo, useState, type CSSProperties } from 'react'
import { ColoredHeart } from './ColoredHeart'
import { getClosetItemStyle } from '../data/closetStyles'

export interface ClosetCategory {
  key: string
  title: string
  items: { id: string; label: string }[]
}

interface ClosetProps {
  categories: ClosetCategory[]
  selected: Record<string, string | null>
  onSelect: (categoryKey: string, itemId: string) => void
}

function ColoredHeartIcon({ color }: { color: string }) {
  return <ColoredHeart color={color} className="closet__heart" />
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
              const style = getClosetItemStyle(item.id)
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
                  aria-label={`Select ${style.label}`}
                  aria-pressed={isSelected}
                >
                  {style.heartColor && <ColoredHeartIcon color={style.heartColor} />}
                  <span className="closet__item-label">{style.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
})
