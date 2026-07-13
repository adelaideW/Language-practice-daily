/**
 * User-uploaded article library (localStorage).
 */

const STORAGE_KEY = 'xiaohe-user-library'

/**
 * @typedef {{ id: string, title: string, text: string, addedAt: number }} UserDoc
 */

/** @returns {UserDoc[]} */
export function loadUserLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/** @param {UserDoc[]} list */
function save(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-40)))
}

/**
 * @param {{ title: string, text: string }} doc
 */
export function addUserDoc(doc) {
  const list = loadUserLibrary()
  const entry = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: doc.title,
    text: doc.text,
    addedAt: Date.now(),
  }
  list.push(entry)
  save(list)
  return entry
}

/** @param {string} id */
export function removeUserDoc(id) {
  save(loadUserLibrary().filter((d) => d.id !== id))
}
