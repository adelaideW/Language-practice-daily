const STORAGE_KEY = 'japanese-mistakes'
const MAX_EVENTS = 500

/** @typedef {{ surface: string, kana: string, expected: string, typed: string, mode: string, at: number }} JpMistake */

/** @returns {JpMistake[]} */
export function loadJapaneseMistakes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_EVENTS)))
}

/** @param {Omit<JpMistake, 'at'>} event */
export function recordJapaneseMistake(event) {
  const list = loadJapaneseMistakes()
  list.push({ ...event, at: Date.now() })
  save(list)
  return list
}

export function clearJapaneseMistakes() {
  localStorage.removeItem(STORAGE_KEY)
}

export function summarizeJapaneseMistakes() {
  const list = loadJapaneseMistakes()
  /** @type {Map<string, { kana: string, count: number }>} */
  const byKana = new Map()
  for (const m of list) {
    const key = m.kana || m.surface || '?'
    const prev = byKana.get(key) || { kana: key, count: 0 }
    prev.count += 1
    byKana.set(key, prev)
  }
  const top = [...byKana.values()].sort((a, b) => b.count - a.count).slice(0, 12)
  return { total: list.length, top, recent: [...list].reverse().slice(0, 20) }
}
