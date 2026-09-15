// localStorage-backed QR history. Everything stays on the user's device.
const KEY = 'qrforge:history:v1'
const LIMIT = 12

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter((it) => it && it.id && it.payload !== undefined)
  } catch {
    return []
  }
}

function persist(list) {
  try {
    // keep under quota; store compact entries
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, LIMIT)))
  } catch {
    // quota exceeded: drop oldest until it fits
    let copy = list.slice(0, LIMIT)
    while (copy.length > 0) {
      try {
        localStorage.setItem(KEY, JSON.stringify(copy))
        break
      } catch {
        copy = copy.slice(1)
      }
    }
  }
}

export function saveHistoryEntry(entry) {
  const list = loadHistory()
  list.unshift({
    id: entry.id || String(Date.now()),
    type: entry.type,
    title: entry.title || '',
    payload: entry.payload,
    fields: entry.fields || null,
    preview: entry.preview || null,
    createdAt: entry.createdAt || new Date().toISOString()
  })
  persist(list)
  return list
}

export function removeHistoryEntry(id) {
  const list = loadHistory().filter((it) => it.id !== id)
  persist(list)
  return list
}

export function clearHistory() {
  persist([])
  return []
}