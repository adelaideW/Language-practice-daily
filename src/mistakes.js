/**
 * Mistake log + weak-pattern aggregation + smart practice helpers.
 */

import { CHARACTERS, ARTICLES, SENTENCES, makePassage, isHanzi } from './data.js'

const STORAGE_KEY = 'xiaohe-mistakes'
const MAX_EVENTS = 500

/**
 * @typedef {object} MistakeEvent
 * @property {string} char
 * @property {string} pinyin
 * @property {string} expectedCode
 * @property {string} typed
 * @property {string} scheme
 * @property {string} mode
 * @property {number} at
 */

/** @returns {MistakeEvent[]} */
export function loadMistakes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/** @param {MistakeEvent[]} list */
function saveMistakes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_EVENTS)))
}

/**
 * @param {Omit<MistakeEvent, 'at'>} event
 */
export function recordMistake(event) {
  const list = loadMistakes()
  list.push({ ...event, at: Date.now() })
  saveMistakes(list)
  return list
}

export function clearMistakes() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * @param {MistakeEvent[]} [list]
 */
export function summarizeMistakes(list = loadMistakes()) {
  /** @type {Map<string, { char: string, pinyin: string, count: number, expectedCode: string }>} */
  const byChar = new Map()
  /** @type {Map<string, number>} */
  const byExpectedKey = new Map()
  /** @type {Map<string, number>} */
  const byTypedWrong = new Map()

  for (const m of list) {
    const ck = `${m.char}|${m.pinyin}`
    const prev = byChar.get(ck) || {
      char: m.char,
      pinyin: m.pinyin,
      count: 0,
      expectedCode: m.expectedCode,
    }
    prev.count += 1
    prev.expectedCode = m.expectedCode
    byChar.set(ck, prev)

    if (m.expectedCode) {
      byExpectedKey.set(m.expectedCode, (byExpectedKey.get(m.expectedCode) || 0) + 1)
    }
    if (m.typed) {
      byTypedWrong.set(m.typed, (byTypedWrong.get(m.typed) || 0) + 1)
    }
  }

  const topChars = [...byChar.values()].sort((a, b) => b.count - a.count).slice(0, 12)
  const topCodes = [...byExpectedKey.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
  const topTyped = [...byTypedWrong.entries()]
    .map(([typed, count]) => ({ typed, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return { total: list.length, topChars, topCodes, topTyped, recent: [...list].reverse().slice(0, 40) }
}

/**
 * Weighted character pool from mistakes (fallback to CHARACTERS).
 * @param {MistakeEvent[]} [list]
 */
export function smartCharacterPool(list = loadMistakes()) {
  const { topChars } = summarizeMistakes(list)
  if (!topChars.length) return CHARACTERS

  const weighted = []
  for (const item of topChars) {
    const times = Math.min(8, 1 + item.count)
    for (let i = 0; i < times; i++) {
      weighted.push({ char: item.char, pinyin: item.pinyin })
    }
  }
  // Mix in a little variety
  for (let i = 0; i < Math.min(20, CHARACTERS.length); i++) {
    weighted.push(CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)])
  }
  return weighted
}

/**
 * Prefer passages that contain many weak characters; else synthesize a drill line.
 * @param {'sentence' | 'article'} mode
 * @param {MistakeEvent[]} [list]
 */
export function smartPassagePool(mode, list = loadMistakes()) {
  const { topChars } = summarizeMistakes(list)
  const base = mode === 'article' ? ARTICLES : SENTENCES
  if (!topChars.length) return base

  const weakSet = new Set(topChars.map((c) => c.char))
  const scored = base
    .map((p) => {
      let score = 0
      for (const ch of p.text) {
        if (weakSet.has(ch)) score += 1
      }
      return { p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length) {
    return scored.map((x) => x.p)
  }

  // Synthesize a short drill from mistake chars
  const chars = topChars.slice(0, 16)
  const text = chars.map((c) => c.char).join('') + '。'
  const syllables = chars.map((c) => c.pinyin)
  return [makePassage('错字专练', text, syllables)]
}

/**
 * Score how relevant a passage is to current mistakes.
 * @param {{ text: string }} passage
 * @param {MistakeEvent[]} [list]
 */
export function passageMistakeScore(passage, list = loadMistakes()) {
  const { topChars } = summarizeMistakes(list)
  if (!topChars.length) return 0
  const weak = new Set(topChars.map((c) => c.char))
  let score = 0
  for (const ch of passage.text) {
    if (isHanzi(ch) && weak.has(ch)) score += 1
  }
  return score
}
