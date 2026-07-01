const STORAGE_KEY = 'gift-tracker:gift-colors'

function load(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function save(map: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function loadGiftColors(): Record<string, string> {
  return load()
}

export function setGiftColor(giftId: string, color: string | null): Record<string, string> {
  const map = load()
  if (color) {
    map[giftId] = color
  } else {
    delete map[giftId]
  }
  save(map)
  return map
}
