const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]

interface ColorPickerProps {
  value: string | null
  onChange: (color: string | null) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* "No color" swatch — always visible, resets to default */}
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`relative h-7 w-7 overflow-hidden rounded-full border-2 bg-white transition-transform hover:scale-110 active:scale-95 dark:bg-zinc-800 ${!value ? 'border-zinc-500 dark:border-zinc-300' : 'border-zinc-300 dark:border-zinc-600'}`}
        aria-label="No color"
        title="Default (no color)"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[2px] w-[130%] rotate-45 bg-zinc-400 dark:bg-zinc-500" />
        </div>
      </button>

      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(value === c ? null : c)}
          className="h-7 w-7 rounded-full transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: c, outline: value === c ? `3px solid ${c}` : '3px solid transparent', outlineOffset: '2px' }}
          aria-label={c}
        />
      ))}
    </div>
  )
}
