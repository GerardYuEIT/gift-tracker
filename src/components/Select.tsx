import { useEffect, useRef, useState } from 'react'

interface Option {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClass = {
  sm: 'py-1 text-sm',
  md: 'py-1.5 text-sm',
  lg: 'py-2 text-sm',
}

export function Select({ value, onChange, options, size = 'lg', className = '' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) { setFocused(null); return }
    setFocused(value)
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open, value])

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = options.findIndex((o) => o.value === (focused ?? value))
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setFocused(options[Math.min(idx + 1, options.length - 1)]?.value ?? value) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocused(options[Math.max(idx - 1, 0)]?.value ?? value) }
    else if (e.key === 'Enter' && open) { e.preventDefault(); if (focused) { onChange(focused); setOpen(false) } }
    else if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o) }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onKeyDown={handleKeyDown}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500 dark:focus:border-indigo-400 ${sizeClass[size]}`}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="dropdown-scroll absolute left-0 z-40 mt-1 max-h-52 w-full min-w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onMouseEnter={() => setFocused(opt.value)}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`flex cursor-pointer items-center justify-between px-3 py-1.5 text-sm transition-colors ${
                opt.value === focused
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                  : opt.value === value
                  ? 'font-medium text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {opt.label}
              {opt.value === value && (
                <svg viewBox="0 0 20 20" fill="currentColor" className="ml-2 h-3.5 w-3.5 shrink-0 text-indigo-500">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
