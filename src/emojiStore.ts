const STORAGE_KEY = 'gift-tracker:gift-emojis'

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

export function loadGiftEmojis(): Record<string, string> {
  return load()
}

export function setGiftEmoji(giftId: string, emoji: string | null): Record<string, string> {
  const map = load()
  if (emoji) {
    map[giftId] = emoji
  } else {
    delete map[giftId]
  }
  save(map)
  return map
}
