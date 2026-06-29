import { useEffect, useState } from 'react'
import {
  createGift,
  createPerson,
  deleteGift,
  deletePerson,
  getPeople,
  updateGift,
  updatePerson,
} from './api/client'
import { ConfirmDialog } from './components/ConfirmDialog'
import { EmojiPicker } from './components/EmojiPicker'
import { GiftForm } from './components/GiftForm'
import { Modal } from './components/Modal'
import { PersonForm } from './components/PersonForm'
import { Toast } from './components/Toast'
import { OCCASIONS, type Gift, type NewGift, type NewPerson, type Occasion, type Person } from './types'
import { occasionLabel, StatusBadge, ThemeToggle } from './ui'
import { useTheme } from './useTheme'
import { loadGiftEmojis, setGiftEmoji } from './emojiStore'

type Dialog =
  | { kind: 'addPerson' }
  | { kind: 'editPerson'; person: Person }
  | { kind: 'addGift'; personId: string }
  | { kind: 'editGift'; personId: string; gift: Gift }
  | { kind: 'deletePerson'; person: Person }
  | { kind: 'deleteGift'; personId: string; gift: Gift }
  | null

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const [people, setPeople] = useState<Person[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [loading, setLoading] = useState(true)
  const [giftEmojis, setGiftEmojis] = useState<Record<string, string>>(() => loadGiftEmojis())
  const [search, setSearch] = useState('')
  const [occasionFilter, setOccasionFilter] = useState<Occasion | 'ALL'>('ALL')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    getPeople().then((data) => {
      setPeople(data)
      setLoading(false)
    })
  }, [])

  const selected = people.find((p) => p.id === selectedId) ?? null

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (occasionFilter === 'ALL' || p.occasion === occasionFilter),
  )

  function handleSetGiftEmoji(giftId: string, emoji: string | null) {
    setGiftEmojis(setGiftEmoji(giftId, emoji))
  }

  async function handleAddPerson(data: NewPerson) {
    const person = await createPerson(data)
    setPeople((prev) => [...prev, person])
    setSelectedId(person.id)
    setDialog(null)
  }

  async function handleEditPerson(id: string, data: NewPerson) {
    const updated = await updatePerson(id, data)
    setPeople((prev) => prev.map((p) => (p.id === id ? updated : p)))
    setDialog(null)
  }

  async function handleDeletePerson(id: string) {
    const name = people.find((p) => p.id === id)?.name ?? 'Person'
    await deletePerson(id)
    setPeople((prev) => prev.filter((p) => p.id !== id))
    if (selectedId === id) setSelectedId(null)
    setDialog(null)
    setToast(`${name} deleted`)
  }

  async function handleAddGift(personId: string, data: NewGift) {
    const gift = await createGift(personId, data)
    setPeople((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, gifts: [...p.gifts, gift] } : p)),
    )
    setDialog(null)
  }

  async function handleEditGift(personId: string, giftId: string, data: NewGift) {
    const updated = await updateGift(personId, giftId, data)
    setPeople((prev) =>
      prev.map((p) =>
        p.id === personId
          ? { ...p, gifts: p.gifts.map((g) => (g.id === giftId ? updated : g)) }
          : p,
      ),
    )
    setDialog(null)
  }

  async function handleDeleteGift(personId: string, giftId: string) {
    const idea = people.find((p) => p.id === personId)?.gifts.find((g) => g.id === giftId)?.idea ?? 'Gift'
    await deleteGift(personId, giftId)
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

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h1 className="text-lg font-semibold sm:text-xl">Gift Tracker</h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <div className="flex flex-col md:flex-row">
        <aside
          className={`w-full shrink-0 border-zinc-200 p-4 md:block md:w-72 md:border-r dark:border-zinc-800 ${
            selected ? 'hidden' : 'block'
          }`}
        >
          <button
            type="button"
            onClick={() => setDialog({ kind: 'addPerson' })}
            className="mb-4 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
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
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-400"
              />
              <select
                value={occasionFilter}
                onChange={(e) => setOccasionFilter(e.target.value as Occasion | 'ALL')}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-400"
              >
                <option value="ALL">All occasions</option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {occasionLabel(o)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {people.length === 0 && (
            <p className="px-1 text-sm text-zinc-500 dark:text-zinc-400">
              No one yet — add a person to get started.
            </p>
          )}

          {people.length > 0 && filteredPeople.length === 0 && (
            <p className="px-1 text-sm text-zinc-500 dark:text-zinc-400">
              No matches — try a different name or occasion.
            </p>
          )}

          <ul className="grid grid-cols-2 items-start gap-3 md:flex md:flex-col md:gap-1">
            {filteredPeople.map((p) => (
              <li key={p.id} className="contents">
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`flex w-full flex-col items-center gap-2 rounded-xl border p-4 text-center text-sm transition md:flex-row md:gap-3 md:rounded-lg md:border-0 md:p-0 md:px-3 md:py-2 md:text-left ${
                    p.id === selectedId
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-500/40 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 md:border-0 md:bg-transparent md:text-zinc-600 md:hover:bg-zinc-100 dark:md:text-zinc-400 dark:md:hover:bg-zinc-900'
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 md:h-9 md:w-9 md:text-xs">
                    {initials(p.name)}
                  </span>
                  <span>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {occasionLabel(p.occasion)}
                    </div>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className={`flex-1 p-4 sm:p-6 ${selected ? 'block' : 'hidden md:block'}`}>
          {!selected && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Select someone from the list to see their gifts.
            </p>
          )}

          {selected && (
            <div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 md:hidden dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                ← Back to people
              </button>

              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold sm:text-2xl">{selected.name}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {occasionLabel(selected.occasion)}
                  </p>
                  {selected.notes && (
                    <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                      {selected.notes}
                    </p>
                  )}
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

              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Gifts</h3>
                <button
                  type="button"
                  onClick={() => setDialog({ kind: 'addGift', personId: selected.id })}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  + Add gift
                </button>
              </div>

              {selected.gifts.length === 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No gifts planned yet.</p>
              )}

              <ul className="flex flex-col gap-2">
                {selected.gifts.map((g) => (
                  <li
                    key={g.id}
                    className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start gap-3">
                      <EmojiPicker
                        value={giftEmojis[g.id] ?? null}
                        onChange={(emoji) => handleSetGiftEmoji(g.id, emoji)}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{g.idea}</span>
                          <StatusBadge status={g.status} />
                        </div>
                        <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                          {g.price != null && <span>${g.price.toFixed(2)}</span>}
                          {g.link && (
                            <a
                              href={g.link}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-2 text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setDialog({ kind: 'editGift', personId: selected.id, gift: g })}
                        className="rounded px-2 py-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDialog({ kind: 'deleteGift', personId: selected.id, gift: g })}
                        className="rounded px-2 py-1 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
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
            onSubmit={(data) => handleAddGift(dialog.personId, data)}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {dialog?.kind === 'editGift' && (
        <Modal title="Edit gift" onClose={() => setDialog(null)}>
          <GiftForm
            initial={dialog.gift}
            onSubmit={(data) => handleEditGift(dialog.personId, dialog.gift.id, data)}
            onCancel={() => setDialog(null)}
          />
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
