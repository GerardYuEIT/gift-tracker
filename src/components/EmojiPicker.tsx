import { useEffect, useRef, useState } from 'react'

const EMOJIS = [
  '🎁', '🎀', '🎉', '🎂', '💍', '💐', '🌹', '🍫', '☕', '📚',
  '🎮', '🎧', '💻', '📱', '👟', '👜', '🧣', '🕯️', '🧴', '🍷',
  '🎨', '🪅', '🧸', '⌚', '💎', '🎶', '✈️', '🏕️', '🪴', '🧦',
]

interface EmojiPickerProps {
  value: string | null
  onChange: (emoji: string | null) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Pick an icon"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-lg transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      >
        {value ?? '🎁'}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-56 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className="mb-1 w-full rounded px-2 py-1 text-left text-xs text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            No icon
          </button>
          <div className="grid grid-cols-6 gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji)
                  setOpen(false)
                }}
                className="flex h-8 w-8 items-center justify-center rounded text-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
