import type { GiftStatus, Occasion, Relationship } from './types'

const OCCASION_LABELS: Record<Occasion, string> = {
  BIRTHDAY: 'Birthday',
  CHRISTMAS: 'Christmas',
  ANNIVERSARY: 'Anniversary',
  VALENTINES_DAY: "Valentine's Day",
  GRADUATION: 'Graduation',
  WEDDING: 'Wedding',
  OTHER: 'Other',
}

export function occasionLabel(occasion: Occasion): string {
  return OCCASION_LABELS[occasion]
}

const STATUS_LABELS: Record<GiftStatus, string> = {
  PLANNED: 'Planned',
  BOUGHT: 'Bought',
  GIVEN: 'Given',
}

export function statusLabel(status: GiftStatus): string {
  return STATUS_LABELS[status]
}

const STATUS_STYLES: Record<GiftStatus, string> = {
  PLANNED: 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-700/60 dark:text-zinc-300 dark:border-zinc-600',
  BOUGHT: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40',
  GIVEN: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40',
}

export function StatusBadge({ status }: { status: GiftStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {statusLabel(status)}
    </span>
  )
}

const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  FRIEND: 'Friend',
  FAMILY: 'Family',
  SPOUSE: 'Spouse',
  PARTNER: 'Partner',
  RELATIVE: 'Relative',
  COWORKER: 'Coworker',
  CLASSMATE: 'Classmate',
  TEACHER: 'Teacher',
  OTHER: 'Other',
}

export function relationshipLabel(r: Relationship): string {
  return RELATIONSHIP_LABELS[r]
}

const PRIORITY_LABELS: Record<GiftPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export function priorityLabel(priority: GiftPriority): string {
  return PRIORITY_LABELS[priority]
}

const PRIORITY_STYLES: Record<GiftPriority, string> = {
  HIGH: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
  MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  LOW: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-400 dark:border-zinc-600',
}

export function PriorityBadge({ priority }: { priority: GiftPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}
    >
      {priorityLabel(priority)}
    </span>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  )
}

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle color theme"
      className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
