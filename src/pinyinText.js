import { pinyin } from 'pinyin-pro'
import { isHanzi, makePassage, buildUnits } from './data.js'

/**
 * Convert Chinese text into a passage with auto-generated pinyin.
 * @param {string} title
 * @param {string} text
 */
export function passageFromText(title, text) {
  const cleaned = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim()
  if (!cleaned) throw new Error('文本为空')

  const syllables = []
  for (const ch of cleaned) {
    if (!isHanzi(ch)) continue
    const py = pinyin(ch, { toneType: 'none', type: 'string' })
    syllables.push(String(py || '').toLowerCase().replace(/ü/g, 'v') || 'a')
  }
  if (!syllables.length) throw new Error('未识别到汉字')
  return makePassage(title || '未命名', cleaned, syllables)
}

export function countHanzi(text) {
  let n = 0
  for (const ch of text) if (isHanzi(ch)) n += 1
  return n
}

/**
 * Split units into pages by hanzi count.
 * @param {ReturnType<typeof buildUnits>} units
 * @param {number} charsPerPage
 * @returns {{ start: number, end: number }[]} unit index ranges [start, end)
 */
export function buildPages(units, charsPerPage = 80) {
  const size = Math.max(20, Math.min(300, Number(charsPerPage) || 80))
  if (!units.length) return [{ start: 0, end: 0 }]
  const pages = []
  for (let i = 0; i < units.length; i += size) {
    pages.push({ start: i, end: Math.min(units.length, i + size) })
  }
  return pages
}

export function pageIndexForUnit(pages, unitIndex) {
  for (let i = 0; i < pages.length; i++) {
    if (unitIndex >= pages[i].start && unitIndex < pages[i].end) return i
  }
  return Math.max(0, pages.length - 1)
}
