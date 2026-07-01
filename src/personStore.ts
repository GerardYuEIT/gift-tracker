const STORAGE_KEY = 'gift-tracker:person-avatars'

interface PersonAvatar {
  emoji: string | null
  color: string | null
}

function load(): Record<string, PersonAvatar> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function save(map: Record<string, PersonAvatar>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function loadPersonAvatars(): Record<string, PersonAvatar> {
  return load()
}

export function setPersonAvatar(
  personId: string,
  update: Partial<PersonAvatar>,
): Record<string, PersonAvatar> {
  const map = load()
  const current = map[personId] ?? { emoji: null, color: null }
  const next = { ...current, ...update }
  if (next.emoji === null && next.color === null) {
    delete map[personId]
  } else {
    map[personId] = next
  }
  save(map)
  return map
}
