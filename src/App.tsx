import React, { useEffect, useState } from 'react'
import {
  createGift,
  createPerson,
  deleteGift,
  deletePerson,
  getPeople,
  getPerson,
  updateGift,
  updatePerson,
} from './api/client'
import { ConfirmDialog } from './components/ConfirmDialog'
import { EmojiPicker } from './components/EmojiPicker'
import { GiftForm } from './components/GiftForm'
import { Modal } from './components/Modal'
import { PersonForm } from './components/PersonForm'
import { Toast } from './components/Toast'
import {
  GIFT_PRIORITIES,
  GIFT_STATUSES,
  OCCASIONS,
  type Gift,
  type GiftPriority,
  type GiftStatus,
  type NewGift,
  type NewPerson,
  type Occasion,
  type Person,
} from './types'
import { occasionLabel, PriorityBadge, priorityLabel, relationshipLabel, statusLabel, StatusBadge, ThemeToggle } from './ui'
import { useTheme } from './useTheme'
import { loadGiftEmojis, setGiftEmoji } from './emojiStore'
import { loadGiftColors, setGiftColor } from './colorStore'
import { loadPersonAvatars, setPersonAvatar } from './personStore'
import { ColorPicker } from './components/ColorPicker'
import { Select } from './components/Select'
import { CURRENCIES, formatPrice, loadCurrency, saveCurrency, type CurrencyCode } from './currencyStore'

type Dialog =
  | { kind: 'addPerson' }
  | { kind: 'editPerson'; person: Person }
  | { kind: 'addGift'; personId: string | number }
  | { kind: 'editGift'; personId: string | number; gift: Gift }
  | { kind: 'deletePerson'; person: Person }
  | { kind: 'deleteGift'; personId: string | number; gift: Gift }
  | { kind: 'viewGift'; personId: string | number; gift: Gift }
  | null

type View = 'people' | 'allGifts'

type GiftWithPerson = Gift & { personName: string; personId: string | number }

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}


function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/40">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
    </div>
  )
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const [people, setPeople] = useState<Person[]>([])
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [loading, setLoading] = useState(true)
  const [giftEmojis, setGiftEmojis] = useState<Record<string, string>>(() => loadGiftEmojis())
  const [giftColors, setGiftColors] = useState<Record<string, string>>(() => loadGiftColors())
  const [search, setSearch] = useState('')
  const [occasionFilter, setOccasionFilter] = useState<Occasion | 'ALL'>('ALL')
  const [toast, setToast] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [view, setView] = useState<View>('people')
  const [giftSearch, setGiftSearch] = useState('')
  const [giftStatusFilter, setGiftStatusFilter] = useState<GiftStatus | 'ALL'>('ALL')
  const [giftMinPrice, setGiftMinPrice] = useState('')
  const [giftMaxPrice, setGiftMaxPrice] = useState('')
  const [giftPriorityFilter, setGiftPriorityFilter] = useState<GiftPriority | 'ALL'>('ALL')
  const [personAvatars, setPersonAvatars] = useState<Record<string, { emoji: string | null; color: string | null }>>(() => loadPersonAvatars())
  const [customizingPerson, setCustomizingPerson] = useState(false)
  const [currency, setCurrency] = useState<CurrencyCode>(() => loadCurrency())

  useEffect(() => {
    getPeople().then((data) => {
      setPeople(data)
      setLoading(false)
    })
  }, [])

  const selected = people.find((p) => p.id === selectedId) ?? null

  useEffect(() => {
    setEditingNotes(false)
    setNotesValue(selected?.notes ?? '')
    setGiftSearch('')
    setGiftStatusFilter('ALL')
    setGiftMinPrice('')
    setGiftMaxPrice('')
    setGiftPriorityFilter('ALL')
    setCustomizingPerson(false)
  }, [selectedId])

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (occasionFilter === 'ALL' || p.occasion === occasionFilter),
  )

  function applyGiftFilters<T extends Gift>(gifts: T[]): T[] {
    return gifts.filter((g) => {
      if (giftSearch && !g.idea.toLowerCase().includes(giftSearch.trim().toLowerCase())) return false
      if (giftStatusFilter !== 'ALL' && g.status !== giftStatusFilter) return false
      if (giftPriorityFilter !== 'ALL' && g.priority !== giftPriorityFilter) return false
      const min = giftMinPrice === '' ? null : Number(giftMinPrice)
      const max = giftMaxPrice === '' ? null : Number(giftMaxPrice)
      if (min !== null && (g.price == null || g.price < min)) return false
      if (max !== null && (g.price == null || g.price > max)) return false
      return true
    })
  }

  const allGiftsFlat: GiftWithPerson[] = people.flatMap((p) =>
    p.gifts.map((g) => ({ ...g, personName: p.name, personId: p.id })),
  )
  const filteredAllGifts = applyGiftFilters(allGiftsFlat)

  const allGifts = people.flatMap((p) => p.gifts)
  const totalBudget = allGifts.reduce((sum, g) => sum + (g.price ?? 0), 0)
  const boughtCount = allGifts.filter((g) => g.status === 'BOUGHT').length
  const givenCount = allGifts.filter((g) => g.status === 'GIVEN').length
  const plannedCount = allGifts.filter((g) => g.status === 'PLANNED').length

  function handleSetGiftEmoji(giftId: string, emoji: string | null) {
    setGiftEmojis(setGiftEmoji(giftId, emoji))
  }

  function handleSetGiftColor(giftId: string, color: string | null) {
    setGiftColors(setGiftColor(giftId, color))
  }

  function handleCurrencyChange(code: CurrencyCode) {
    saveCurrency(code)
    setCurrency(code)
  }

  function handleSetPersonAvatar(personId: string | number, update: { emoji?: string | null; color?: string | null }) {
    setPersonAvatars(setPersonAvatar(String(personId), update))
  }

  function personAvatarStyle(personId: string | number, isSelected: boolean): React.CSSProperties {
    const color = personAvatars[String(personId)]?.color
    if (!color) return {}
    return isSelected ? { backgroundColor: color } : { backgroundColor: color + '26', color }
  }

  function personAvatarClass(personId: string | number, isSelected: boolean): string {
    const hasColor = !!personAvatars[String(personId)]?.color
    if (hasColor) return isSelected ? 'text-white' : ''
    return isSelected
      ? 'bg-indigo-600 text-white'
      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
  }

  function personAvatarContent(personId: string | number, name: string): string {
    return personAvatars[String(personId)]?.emoji ?? initials(name)
  }

  function personAccent(personId: string | number): string | null {
    return personAvatars[String(personId)]?.color ?? null
  }

  async function handleAddPerson(data: NewPerson) {
    const person = await createPerson(data)
    setPeople((prev) => [...prev, person])
    setSelectedId(person.id)
    setDialog(null)
  }

  async function handleEditPerson(id: string | number, data: NewPerson) {
    const updated = await updatePerson(String(id), data)
    setPeople((prev) => prev.map((p) => (p.id === id ? updated : p)))
    setDialog(null)
  }

  async function handleSaveNotes() {
    if (!selected) return
    setSavingNotes(true)
    try {
      const updated = await updatePerson(String(selected.id), {
        name: selected.name,
        occasion: selected.occasion,
        relationship: selected.relationship,
        eventDate: selected.eventDate,
        notes: notesValue.trim() || null,
      })
      setPeople((prev) => prev.map((p) => (p.id === selected.id ? updated : p)))
      setEditingNotes(false)
      setToast('Description saved')
    } catch {
      setToast('Failed to save — please try again')
    } finally {
      setSavingNotes(false)
    }
  }

  async function handleDeletePerson(id: string | number) {
    const name = people.find((p) => p.id === id)?.name ?? 'Person'
    await deletePerson(String(id))
    setPeople((prev) => prev.filter((p) => p.id !== id))
    if (selectedId === id) setSelectedId(null)
    setDialog(null)
    setToast(`${name} deleted`)
  }

  async function handleAddGift(personId: string | number, data: NewGift, emoji: string | null, color: string | null) {
    const prevIds = new Set((people.find((p) => p.id === personId)?.gifts ?? []).map((g) => String(g.id)))
    await createGift(String(personId), data)
    const updated = await getPerson(String(personId))
    setPeople((prev) => prev.map((p) => (p.id === personId ? updated : p)))
    const newGift = updated.gifts.find((g) => !prevIds.has(String(g.id)))
    if (newGift) {
      if (emoji) handleSetGiftEmoji(String(newGift.id), emoji)
      if (color) handleSetGiftColor(String(newGift.id), color)
    }
    setDialog(null)
  }

  async function handleEditGift(personId: string | number, giftId: string | number, data: NewGift, emoji: string | null, color: string | null) {
    await updateGift(String(personId), String(giftId), data)
    const updated = await getPerson(String(personId))
    setPeople((prev) => prev.map((p) => (p.id === personId ? updated : p)))
    handleSetGiftEmoji(String(giftId), emoji)
    handleSetGiftColor(String(giftId), color)
    setDialog(null)
  }

  async function handleDeleteGift(personId: string | number, giftId: string | number) {
    const idea =
      people.find((p) => p.id === personId)?.gifts.find((g) => g.id === giftId)?.idea ?? 'Gift'
    await deleteGift(String(personId), String(giftId))
    setPeople((prev) =>
      prev.map((p) =>
        p.id === personId ? { ...p, gifts: p.gifts.filter((g) => g.id !== giftId) } : p,
      ),
    )
    setDialog(null)
    setToast(`${idea} deleted`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
        Loading…
      </div>
    )
  }

  function GiftFilters() {
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={giftSearch}
          onChange={(e) => setGiftSearch(e.target.value)}
          placeholder="Search gifts…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-400"
        />
        <Select
          value={giftStatusFilter}
          onChange={(val) => setGiftStatusFilter(val as GiftStatus | 'ALL')}
          options={[{ value: 'ALL', label: 'All statuses' }, ...GIFT_STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))]}
          size="md"
        />
        <Select
          value={giftPriorityFilter}
          onChange={(val) => setGiftPriorityFilter(val as GiftPriority | 'ALL')}
          options={[{ value: 'ALL', label: 'All priorities' }, ...GIFT_PRIORITIES.map((p) => ({ value: p, label: priorityLabel(p) }))]}
          size="md"
        />
        <div className="flex items-center gap-1">
          <span className="text-xs text-zinc-400">$</span>
          <input
            type="number"
            min="0"
            value={giftMinPrice}
            onChange={(e) => setGiftMinPrice(e.target.value)}
            placeholder="Min"
            className="w-20 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <span className="text-xs text-zinc-400">–</span>
          <input
            type="number"
            min="0"
            value={giftMaxPrice}
            onChange={(e) => setGiftMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-20 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>
    )
  }

  function GiftCard({ g, personId, personName }: { g: Gift; personId: string | number; personName?: string }) {
    const color = giftColors[String(g.id)] ?? null
    return (
      <li
        className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-150 active:scale-[0.99] hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/40"
        style={color ? { borderLeftColor: color, borderLeftWidth: '4px' } : undefined}
      >
        <button
          type="button"
          onClick={() => setDialog({ kind: 'viewGift', personId, gift: g })}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-base dark:bg-zinc-800">
            {giftEmojis[String(g.id)] ?? '🎁'}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{g.idea}</span>
              <StatusBadge status={g.status} />
              {personName && <span className="text-xs text-zinc-400">· {personName}</span>}
            </div>
            {(g.price != null || g.priority || g.link) && (
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                {g.price != null && <span>{formatPrice(g.price, currency)}</span>}
                {g.priority && <PriorityBadge priority={g.priority} />}
                {g.link && <span className="text-indigo-400">Has link</span>}
              </div>
            )}
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </li>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Full-page accent tint — always rendered for smooth transition */}
      <div
        className="pointer-events-none fixed inset-0 transition-colors duration-700"
        style={{ backgroundColor: selected && view === 'people' && personAccent(selected.id) ? personAccent(selected.id)! + '0e' : 'transparent' }}
      />
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold sm:text-xl">🎁 Gift Tracker</h1>
          <div className="flex rounded-lg border border-zinc-200 p-0.5 text-sm dark:border-zinc-700">
            <button
              type="button"
              onClick={() => { setView('people'); setSelectedId(null) }}
              className={`rounded-md px-3 py-1 font-medium transition ${view === 'people' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
            >
              People
            </button>
            <button
              type="button"
              onClick={() => setView('allGifts')}
              className={`rounded-md px-3 py-1 font-medium transition ${view === 'allGifts' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
            >
              All Gifts
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={currency}
            onChange={(val) => handleCurrencyChange(val as CurrencyCode)}
            options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
            size="sm"
            className="w-24"
          />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        </div>
      </header>

      <div className="relative z-[1] flex w-full flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`w-full shrink-0 border-zinc-200 bg-white p-4 md:block md:w-72 md:border-r dark:border-zinc-800 dark:bg-zinc-900/50 ${
            selected && view === 'people' ? 'hidden' : 'block'
          }`}
        >
          <button
            type="button"
            onClick={() => setDialog({ kind: 'addPerson' })}
            className="mb-4 w-full rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
          >
            + Add person
          </button>

          {people.length > 0 && (
            <div className="mb-4 flex flex-col gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <Select
                value={occasionFilter}
                onChange={(val) => setOccasionFilter(val as Occasion | 'ALL')}
                options={[{ value: 'ALL', label: 'All occasions' }, ...OCCASIONS.map((o) => ({ value: o, label: occasionLabel(o) }))]}
                size="lg"
              />
            </div>
          )}

          {people.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
              <p className="text-2xl">🎁</p>
              <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">No one yet</p>
              <p className="mt-1 text-xs text-zinc-400">Add a person to start tracking gifts</p>
            </div>
          )}

          {people.length > 0 && filteredPeople.length === 0 && (
            <p className="px-1 text-sm text-zinc-400">No matches.</p>
          )}

          <ul className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-1">
            {filteredPeople.map((p) => {
              const isSelected = p.id === selectedId && view === 'people'
              return (
                <li key={p.id} className="contents">
                  <button
                    type="button"
                    onClick={() => { setView('people'); setSelectedId(p.id) }}
                    className={`flex w-full flex-col items-center gap-2 rounded-xl p-3 text-center text-sm transition-all duration-150 md:flex-row md:gap-3 md:rounded-lg md:p-2 md:text-left ${
                      isSelected
                        ? personAccent(p.id)
                          ? 'ring-1 text-zinc-900 dark:text-zinc-100'
                          : 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-300 dark:bg-indigo-500/10 dark:text-zinc-100 dark:ring-indigo-500/40'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                    style={isSelected && personAccent(p.id) ? {
                      backgroundColor: personAccent(p.id)! + '18',
                      boxShadow: `0 0 0 1px ${personAccent(p.id)}55`,
                    } : undefined}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-transform md:h-8 md:w-8 md:text-xs ${personAvatarClass(p.id, isSelected)}`}
                      style={personAvatarStyle(p.id, isSelected)}
                    >
                      {personAvatarContent(p.id, p.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="text-xs text-zinc-400">{occasionLabel(p.occasion)}</div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Main */}
        <main
          key={view}
          className={`animate-fade-in min-h-[calc(100vh-53px)] flex-1 p-4 sm:p-6 ${selected && view === 'people' ? 'block' : 'hidden md:block'}`}
        >

          {/* All Gifts view */}
          {view === 'allGifts' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">All Gifts</h2>
              </div>
              <GiftFilters />
              {filteredAllGifts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
                  <p className="text-3xl">🔍</p>
                  <p className="mt-2 text-sm text-zinc-500">No gifts match your filters</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {filteredAllGifts.map((g) => (
                    <GiftCard key={g.id} g={g} personId={g.personId} personName={g.personName} />
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* People view — no selection: stats dashboard */}
          {view === 'people' && !selected && (
            <div>
              {people.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-5xl">🎁</p>
                  <h2 className="mt-4 text-xl font-semibold">No people yet</h2>
                  <p className="mt-2 text-sm text-zinc-500">Add someone to start tracking their gifts.</p>
                </div>
              ) : (
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Overview</h2>
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard label="People" value={people.length} />
                    <StatCard label="Total Gifts" value={allGifts.length} />
                    <StatCard
                      label="Budget"
                      value={formatPrice(totalBudget, currency)}
                      sub="combined price"
                    />
                    <StatCard
                      label="Completed"
                      value={`${boughtCount + givenCount}/${allGifts.length}`}
                      sub={`${plannedCount} still planned`}
                    />
                  </div>
                  <h3 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Status breakdown</h3>
                  <div className="mb-6 flex gap-3">
                    {([['PLANNED', plannedCount, 'bg-zinc-400'], ['BOUGHT', boughtCount, 'bg-amber-400'], ['GIVEN', givenCount, 'bg-emerald-500']] as const).map(([status, count, color]) => (
                      <div key={status} className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{statusLabel(status)} <span className="font-semibold text-zinc-900 dark:text-zinc-100">{count}</span></span>
                      </div>
                    ))}
                  </div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">People</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {people.map((p) => {
                      const total = p.gifts.length
                      const spent = p.gifts.reduce((s, g) => s + (g.price ?? 0), 0)
                      const pPlanned = p.gifts.filter((g) => g.status === 'PLANNED').length
                      const pBought = p.gifts.filter((g) => g.status === 'BOUGHT').length
                      const pGiven = p.gifts.filter((g) => g.status === 'GIVEN').length
                      const accent = personAccent(p.id)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setView('people'); setSelectedId(p.id) }}
                          className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:shadow-md active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/40"
                          style={accent ? { borderLeftColor: accent, borderLeftWidth: '3px' } : undefined}
                        >
                          <div className="mb-3 flex items-center gap-2.5">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${personAvatarClass(p.id, false)}`}
                              style={personAvatarStyle(p.id, false)}
                            >
                              {personAvatarContent(p.id, p.name)}
                            </span>
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</div>
                              <div className="text-xs text-zinc-400">{occasionLabel(p.occasion)}</div>
                            </div>
                          </div>
                          {total === 0 ? (
                            <p className="text-xs text-zinc-400">No gifts yet</p>
                          ) : (
                            <>
                              <div className="mb-1.5 flex items-baseline gap-1.5">
                                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{total}</span>
                                <span className="text-xs text-zinc-400">gift{total !== 1 ? 's' : ''}</span>
                                {spent > 0 && (
                                  <span className="ml-auto text-sm font-medium text-zinc-600 dark:text-zinc-300">{formatPrice(spent, currency)}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {pPlanned > 0 && <span className="text-zinc-400">{pPlanned} planned</span>}
                                {pBought > 0 && <span className="text-amber-500 dark:text-amber-400">{pBought} bought</span>}
                                {pGiven > 0 && <span className="text-emerald-500 dark:text-emerald-400">{pGiven} given</span>}
                              </div>
                            </>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* People view — person selected */}
          {view === 'people' && selected && (
            <div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 md:hidden dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                ← Back
              </button>

              {/* Person header */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomizingPerson((v) => !v)}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ring-2 ring-transparent transition hover:opacity-80 hover:ring-indigo-400 active:scale-95 ${!personAvatars[String(selected.id)]?.color ? 'bg-indigo-600' : ''}`}
                    style={personAvatars[String(selected.id)]?.color ? { backgroundColor: personAvatars[String(selected.id)].color! } : undefined}
                    title="Customize avatar"
                  >
                    {personAvatarContent(selected.id, selected.name)}
                  </button>
                  <div>
                    <h2 className="text-xl font-bold sm:text-2xl">{selected.name}</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {[
                        selected.relationship ? relationshipLabel(selected.relationship) : null,
                        occasionLabel(selected.occasion),
                        selected.eventDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(selected.eventDate)) : null,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setDialog({ kind: 'editPerson', person: selected })}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialog({ kind: 'deletePerson', person: selected })}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Avatar customizer */}
              {customizingPerson && (
                <div className="animate-fade-in mb-5 max-w-lg rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Emoji</p>
                  <div className="mb-4">
                    <EmojiPicker
                      value={personAvatars[String(selected.id)]?.emoji ?? null}
                      onChange={(emoji) => handleSetPersonAvatar(selected.id, { emoji })}
                    />
                  </div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Color</p>
                  <ColorPicker
                    value={personAvatars[String(selected.id)]?.color ?? null}
                    onChange={(color) => handleSetPersonAvatar(selected.id, { color })}
                  />
                </div>
              )}

              {/* Inline notes */}
              <div className="mb-5 max-w-lg">
                {editingNotes ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      autoFocus
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      rows={3}
                      placeholder="Add a description…"
                      className="w-full rounded-xl border bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-1 dark:bg-zinc-800 dark:text-zinc-100"
                      style={{ borderColor: personAccent(selected.id) ?? '#818cf8', ['--tw-ring-color' as string]: (personAccent(selected.id) ?? '#818cf8') + '80' }}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold text-white transition disabled:opacity-60 ${personAccent(selected.id) ? 'hover:opacity-90' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                        style={personAccent(selected.id) ? { backgroundColor: personAccent(selected.id)! } : undefined}
                      >
                        {savingNotes ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingNotes(false); setNotesValue(selected.notes ?? '') }}
                        disabled={savingNotes}
                        className="rounded-lg border border-zinc-300 px-3 py-1 text-xs text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setNotesValue(selected.notes ?? ''); setEditingNotes(true) }}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-left text-sm transition hover:border-indigo-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-indigo-500 dark:hover:bg-zinc-800/50"
                  >
                    {selected.notes
                      ? <span className="text-zinc-600 dark:text-zinc-400">{selected.notes}</span>
                      : <span className="text-zinc-400 dark:text-zinc-600">No description — click to add one</span>
                    }
                  </button>
                )}
              </div>

              {/* Gift stats for this person */}
              {selected.gifts.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-zinc-500">{selected.gifts.length} gift{selected.gifts.length !== 1 ? 's' : ''}</span>
                  {selected.gifts.some((g) => g.price != null) && (
                    <span className="text-zinc-500">
                      Total: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(selected.gifts.reduce((s, g) => s + (g.price ?? 0), 0), currency)}</span>
                    </span>
                  )}
                  {boughtCount + givenCount > 0 && (
                    <span
                      className={personAccent(selected.id) ? 'font-semibold' : 'text-emerald-600 dark:text-emerald-400'}
                      style={personAccent(selected.id) ? { color: personAccent(selected.id)! } : undefined}
                    >
                      {selected.gifts.filter((g) => g.status === 'BOUGHT' || g.status === 'GIVEN').length} done
                    </span>
                  )}
                </div>
              )}

              {/* Gift list header + filters */}
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide dark:text-zinc-400">Gifts</h3>
                <button
                  type="button"
                  onClick={() => setDialog({ kind: 'addGift', personId: selected.id })}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition active:scale-95 ${personAccent(selected.id) ? 'hover:opacity-90' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                  style={personAccent(selected.id) ? { backgroundColor: personAccent(selected.id)! } : undefined}
                >
                  + Add gift
                </button>
              </div>

              {selected.gifts.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 py-10 text-center dark:border-zinc-700">
                  <p className="text-3xl">🎀</p>
                  <p className="mt-2 text-sm text-zinc-500">No gifts yet — add one above</p>
                </div>
              )}

              <ul className="flex flex-col gap-2">
                {selected.gifts.map((g) => (
                  <GiftCard key={g.id} g={g} personId={selected.id} />
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>

      {dialog?.kind === 'addPerson' && (
        <Modal title="Add person" onClose={() => setDialog(null)}>
          <PersonForm onSubmit={handleAddPerson} onCancel={() => setDialog(null)} />
        </Modal>
      )}

      {dialog?.kind === 'editPerson' && (
        <Modal title="Edit person" onClose={() => setDialog(null)}>
          <PersonForm
            initial={dialog.person}
            onSubmit={(data) => handleEditPerson(dialog.person.id, data)}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {dialog?.kind === 'addGift' && (
        <Modal title="Add gift" onClose={() => setDialog(null)}>
          <GiftForm
            onSubmit={(data, emoji, color) => handleAddGift(dialog.personId, data, emoji, color)}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {dialog?.kind === 'editGift' && (
        <Modal title="Edit gift" onClose={() => setDialog(null)}>
          <GiftForm
            initial={dialog.gift}
            initialEmoji={giftEmojis[String(dialog.gift.id)] ?? null}
            initialColor={giftColors[String(dialog.gift.id)] ?? null}
            onSubmit={(data, emoji, color) => handleEditGift(dialog.personId, dialog.gift.id, data, emoji, color)}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {dialog?.kind === 'viewGift' && (
        <Modal title={dialog.gift.idea} onClose={() => setDialog(null)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <EmojiPicker
                value={giftEmojis[String(dialog.gift.id)] ?? null}
                onChange={(emoji) => handleSetGiftEmoji(String(dialog.gift.id), emoji)}
              />
              <StatusBadge status={dialog.gift.status} />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Color</p>
              <ColorPicker
                value={giftColors[String(dialog.gift.id)] ?? null}
                onChange={(color) => handleSetGiftColor(String(dialog.gift.id), color)}
              />
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              {([
                ['Price', dialog.gift.price != null ? formatPrice(dialog.gift.price, currency) : null],
                ['Budget', dialog.gift.budget != null ? formatPrice(dialog.gift.budget, currency) : null],
                ['Quantity', dialog.gift.quantity != null ? String(dialog.gift.quantity) : null],
              ] as [string, string | null][]).map(([label, val]) => val != null && (
                <div key={label}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{val}</span>
                  </div>
                  <div className="mt-2 h-px bg-zinc-200 dark:bg-zinc-700" />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">Priority</span>
                {dialog.gift.priority ? (
                  <PriorityBadge priority={dialog.gift.priority} />
                ) : (
                  <span className="text-sm text-zinc-400">—</span>
                )}
              </div>
              <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">Link</span>
                {dialog.gift.link ? (
                  <a
                    href={dialog.gift.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Open link
                  </a>
                ) : (
                  <span className="text-sm text-zinc-400">—</span>
                )}
              </div>
              {dialog.gift.notes && (
                <>
                  <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">Notes</span>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">{dialog.gift.notes}</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDialog({ kind: 'editGift', personId: dialog.personId, gift: dialog.gift })}
                className="flex-1 rounded-xl border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDialog({ kind: 'deleteGift', personId: dialog.personId, gift: dialog.gift })}
                className="flex-1 rounded-xl border border-red-200 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {dialog?.kind === 'deletePerson' && (
        <ConfirmDialog
          title="Delete person"
          message={`Delete ${dialog.person.name} and all their gifts? This can't be undone.`}
          seconds={3}
          onConfirm={() => handleDeletePerson(dialog.person.id)}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'deleteGift' && (
        <ConfirmDialog
          title="Delete gift"
          message={`Delete "${dialog.gift.idea}"? This can't be undone.`}
          seconds={3}
          onConfirm={() => handleDeleteGift(dialog.personId, dialog.gift.id)}
          onCancel={() => setDialog(null)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

export default App
