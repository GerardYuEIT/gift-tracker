import { useState } from 'react'
import type { FormEvent } from 'react'
import { GIFT_PRIORITIES, GIFT_STATUSES, type Gift, type GiftPriority, type GiftStatus, type NewGift } from '../types'
import { priorityLabel, statusLabel } from '../ui'
import { EmojiPicker } from './EmojiPicker'
import { ColorPicker } from './ColorPicker'
import { Select } from './Select'

interface GiftFormProps {
  initial?: Gift
  initialEmoji?: string | null
  initialColor?: string | null
  onSubmit: (data: NewGift, emoji: string | null, color: string | null) => void | Promise<void>
  onCancel: () => void
}

const inputClass =
  'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-400'
const labelClass = 'text-sm text-zinc-600 dark:text-zinc-400'

export function GiftForm({ initial, initialEmoji, initialColor, onSubmit, onCancel }: GiftFormProps) {
  const [idea, setIdea] = useState(initial?.idea ?? '')
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : '')
  const [budget, setBudget] = useState(initial?.budget != null ? String(initial.budget) : '')
  const [quantity, setQuantity] = useState(initial?.quantity != null ? String(initial.quantity) : '')
  const [priority, setPriority] = useState<GiftPriority | ''>(initial?.priority ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [link, setLink] = useState(initial?.link ?? '')
  const [status, setStatus] = useState<GiftStatus>(initial?.status ?? 'PLANNED')
  const [emoji, setEmoji] = useState<string | null>(initialEmoji ?? null)
  const [color, setColor] = useState<string | null>(initialColor ?? null)
  const [showMore, setShowMore] = useState(
    !!(initial?.budget || initial?.priority || initial?.quantity || initial?.notes)
  )
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!idea.trim() || submitting) return
    const parsedPrice = price.trim() === '' ? null : Number(price)
    const parsedBudget = budget.trim() === '' ? null : Number(budget)
    const parsedQty = quantity.trim() === '' ? null : Number(quantity)
    setSubmitting(true)
    try {
      await onSubmit(
        {
          idea: idea.trim(),
          price: parsedPrice != null && !Number.isNaN(parsedPrice) ? parsedPrice : null,
          budget: parsedBudget != null && !Number.isNaN(parsedBudget) ? parsedBudget : null,
          quantity: parsedQty != null && !Number.isNaN(parsedQty) ? parsedQty : null,
          priority: priority || null,
          notes: notes.trim() || null,
          link: link.trim() || null,
          status,
        },
        emoji,
        color,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {/* Idea */}
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

      {/* Price + Status — most important secondary fields */}
      <div className="flex gap-3">
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
          <Select
            value={status}
            onChange={(val) => setStatus(val as GiftStatus)}
            options={GIFT_STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
            size="lg"
          />
        </label>
      </div>

      {/* Icon & color */}
      <div className="flex flex-col gap-1">
        <span className={labelClass}>Icon & color</span>
        <div className="flex items-center gap-3">
          <EmojiPicker value={emoji} onChange={setEmoji} />
          <ColorPicker value={color} onChange={setColor} />
        </div>
      </div>

      {/* Link */}
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Link</span>
        <input
          value={link ?? ''}
          onChange={(e) => setLink(e.target.value)}
          className={inputClass}
          placeholder="Optional"
        />
      </label>

      {/* More options toggle */}
      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3.5 w-3.5 transition-transform duration-150 ${showMore ? 'rotate-90' : ''}`}
        >
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
        {showMore ? 'Fewer options' : 'More options'}
      </button>

      {/* Collapsible: Budget, Priority, Quantity, Notes */}
      {showMore && (
        <div className="flex flex-col gap-3.5 border-t border-zinc-100 pt-3.5 dark:border-zinc-800">
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1">
              <span className={labelClass}>Budget</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className={labelClass}>Priority</span>
              <Select
                value={priority}
                onChange={(val) => setPriority(val as GiftPriority | '')}
                options={[{ value: '', label: 'None' }, ...GIFT_PRIORITIES.map((p) => ({ value: p, label: priorityLabel(p) }))]}
                size="lg"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Quantity</span>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`${inputClass} w-1/2`}
              placeholder="Optional"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputClass}
              placeholder="Optional"
            />
          </label>
        </div>
      )}

      <div className="mt-1 flex justify-end gap-2">
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
