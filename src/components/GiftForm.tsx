import { useState } from 'react'
import type { FormEvent } from 'react'
import { GIFT_STATUSES, type Gift, type GiftStatus, type NewGift } from '../types'
import { statusLabel } from '../ui'

interface GiftFormProps {
  initial?: Gift
  onSubmit: (data: NewGift) => void | Promise<void>
  onCancel: () => void
}

const inputClass =
  'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-400'
const labelClass = 'text-sm text-zinc-600 dark:text-zinc-400'

export function GiftForm({ initial, onSubmit, onCancel }: GiftFormProps) {
  const [idea, setIdea] = useState(initial?.idea ?? '')
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : '')
  const [link, setLink] = useState(initial?.link ?? '')
  const [status, setStatus] = useState<GiftStatus>(initial?.status ?? 'PLANNED')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!idea.trim() || submitting) return
    const parsedPrice = price.trim() === '' ? null : Number(price)
    setSubmitting(true)
    try {
      await onSubmit({
        idea: idea.trim(),
        price: parsedPrice != null && !Number.isNaN(parsedPrice) ? parsedPrice : null,
        link: link.trim() || null,
        status,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Idea</span>
        <input
          autoFocus
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className={inputClass}
          placeholder="e.g. Wool scarf"
        />
      </label>

      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1">
          <span className={labelClass}>Price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className={labelClass}>Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as GiftStatus)}
            className={inputClass}
          >
            {GIFT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Link</span>
        <input
          value={link ?? ''}
          onChange={(e) => setLink(e.target.value)}
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
          {submitting ? (initial ? 'Saving…' : 'Adding…') : initial ? 'Save' : 'Add gift'}
        </button>
      </div>
    </form>
  )
}
