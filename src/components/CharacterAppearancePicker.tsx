import type { CSSProperties } from 'react'
import {
  HAIR_COLOR_OPTIONS,
  HAIR_STYLE_OPTIONS,
  SKIN_COLOR_OPTIONS,
  type CharacterAppearance,
  type HairStyleId,
} from '../data/characterAppearance'

interface CharacterAppearancePickerProps {
  appearance: CharacterAppearance
  showHair?: boolean
  compact?: boolean
  onChange: (appearance: CharacterAppearance) => void
}

function SwatchRow({
  label,
  options,
  value,
  onSelect,
}: {
  label: string
  options: typeof HAIR_COLOR_OPTIONS
  value: string
  onSelect: (color: string) => void
}) {
  return (
    <div className="character-appearance__row">
      <span className="character-appearance__label">{label}</span>
      <div className="character-appearance__swatches" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = value === option.color
          return (
            <button
              key={option.id}
              type="button"
              className={`character-appearance__swatch${selected ? ' character-appearance__swatch--selected' : ''}`}
              style={{ '--swatch-color': option.color } as CSSProperties}
              aria-label={option.label}
              aria-pressed={selected}
              onClick={() => onSelect(option.color)}
            />
          )
        })}
      </div>
    </div>
  )
}

function HairStyleRow({
  value,
  onSelect,
}: {
  value: HairStyleId
  onSelect: (style: HairStyleId) => void
}) {
  return (
    <div className="character-appearance__row">
      <span className="character-appearance__label">Style</span>
      <div className="character-appearance__style-options" role="group" aria-label="Hair style">
        {HAIR_STYLE_OPTIONS.map((option) => {
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              className={`character-appearance__style${selected ? ' character-appearance__style--selected' : ''}`}
              aria-pressed={selected}
              onClick={() => onSelect(option.id)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CharacterAppearancePicker({
  appearance,
  showHair = true,
  compact = false,
  onChange,
}: CharacterAppearancePickerProps) {
  return (
    <section
      className={`character-appearance${compact ? ' character-appearance--compact' : ''}`}
      aria-label="Choose your character colors"
    >
      {!compact && <h2 className="character-appearance__heading">Choose your character</h2>}
      {compact && (
        <p className="character-appearance__heading character-appearance__heading--compact">
          Your character
        </p>
      )}
      <SwatchRow
        label="Skin"
        options={SKIN_COLOR_OPTIONS}
        value={appearance.skinColor}
        onSelect={(skinColor) => onChange({ ...appearance, skinColor })}
      />
      {showHair && (
        <div className="character-appearance__hair-group">
          <SwatchRow
            label="Hair"
            options={HAIR_COLOR_OPTIONS}
            value={appearance.hairColor}
            onSelect={(hairColor) => onChange({ ...appearance, hairColor })}
          />
          <HairStyleRow
            value={appearance.hairStyle}
            onSelect={(hairStyle) => onChange({ ...appearance, hairStyle })}
          />
        </div>
      )}
    </section>
  )
}
