const STORAGE_KEY = 'japanese-user-library'

/** @typedef {{ id: string, title: string, text: string, addedAt: number }} JpDoc */

/** @returns {JpDoc[]} */
export function loadJapaneseLibrary() {
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-40)))
}

/** @param {{ title: string, text: string }} doc */
export function addJapaneseDoc(doc) {
  const list = loadJapaneseLibrary()
  const entry = {
    id: `j_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: doc.title,
    text: doc.text,
    addedAt: Date.now(),
  }
  list.push(entry)
  save(list)
  return entry
}

/** @param {string} id */
export function removeJapaneseDoc(id) {
  save(loadJapaneseLibrary().filter((d) => d.id !== id))
}
