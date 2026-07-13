/**
 * Japanese practice settings — isolated from 双拼 / English.
 */

const STORAGE_KEY = 'japanese-settings'

/** @typedef {'auto' | 'manual'} TimerMode */

/**
 * @typedef {object} JapaneseSettings
 * @property {boolean} smartPractice
 * @property {TimerMode} timerMode
 * @property {boolean} keyboardCovered
 * @property {boolean} speakOnCorrect
 * @property {boolean} autoAdvancePerfect
 * @property {boolean} autoAdvanceWithMistakes
 * @property {number} durationMinutes
 * @property {number} minArticleChars
 * @property {number} charsPerPage
 */

/** @type {JapaneseSettings} */
export const DEFAULT_JAPANESE_SETTINGS = {
  smartPractice: false,
  timerMode: 'auto',
  keyboardCovered: true,
  speakOnCorrect: false,
  autoAdvancePerfect: true,
  autoAdvanceWithMistakes: true,
  durationMinutes: 5,
  minArticleChars: 20,
  charsPerPage: 40,
}

/** @returns {JapaneseSettings} */
export function loadJapaneseSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    /** @type {JapaneseSettings} */
    let base = { ...DEFAULT_JAPANESE_SETTINGS }
    if (raw) base = { ...DEFAULT_JAPANESE_SETTINGS, ...JSON.parse(raw) }
    base.minArticleChars = Math.max(1, Math.min(500, Number(base.minArticleChars) || 20))
    base.charsPerPage = Math.max(10, Math.min(120, Number(base.charsPerPage) || 40))
    base.durationMinutes = Math.max(1, Math.min(60, Number(base.durationMinutes) || 5))
    return base
  } catch {
    return { ...DEFAULT_JAPANESE_SETTINGS }
  }
}

/** @param {Partial<JapaneseSettings>} patch */
export function saveJapaneseSettings(patch) {
  const next = { ...loadJapaneseSettings(), ...patch }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
