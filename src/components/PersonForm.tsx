import { useState } from 'react'
import type { FormEvent } from 'react'
import { OCCASIONS, type NewPerson, type Occasion, type Person } from '../types'
import { occasionLabel } from '../ui'

interface PersonFormProps {
  initial?: Person
  onSubmit: (data: NewPerson) => void | Promise<void>
  onCancel: () => void
}

const inputClass =
  'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-400'
const labelClass = 'text-sm text-zinc-600 dark:text-zinc-400'

export function PersonForm({ initial, onSubmit, onCancel }: PersonFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [occasion, setOccasion] = useState<Occasion>(initial?.occasion ?? 'BIRTHDAY')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), occasion, notes: notes.trim() || null })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Name</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="e.g. Mom"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Occasion</span>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value as Occasion)}
          className={inputClass}
        >
          {OCCASIONS.map((o) => (
            <option key={o} value={o}>
              {occasionLabel(o)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Notes</span>
        <textarea
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Optional"
        />
      </label>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {submitting ? (initial ? 'Saving…' : 'Adding…') : initial ? 'Save' : 'Add person'}
        </button>
      </div>
    </form>
  )
}
