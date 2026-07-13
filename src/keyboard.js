/**
 * Full ANSI (US) keyboard layout for typing practice UIs.
 * Non-applicable keys stay visible but appear disabled.
 */

/** Characters that require Shift on a US QWERTY keyboard → unshifted physical key. */
export const SHIFT_BASE = {
  '~': '`',
  '!': '1',
  '@': '2',
  '#': '3',
  $: '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  _: '-',
  '+': '=',
  '{': '[',
  '}': ']',
  '|': '\\',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '?': '/',
}

const MODIFIER_IDS = new Set([
  'Backspace',
  'Tab',
  'CapsLock',
  'Enter',
  'Shift',
  'Control',
  'Alt',
  'Meta',
])

/**
 * Resolve which physical keys to highlight for an expected character.
 * @param {string} want
 * @returns {{ keys: string[], needShift: boolean }}
 */
export function resolveHintKeys(want) {
  if (!want) return { keys: [], needShift: false }
  if (want === ' ') return { keys: [' '], needShift: false }
  const base = SHIFT_BASE[want]
  if (base) return { keys: [base], needShift: true }
  return { keys: [want], needShift: false }
}

/**
 * @param {'en' | 'zh' | 'ja'} lang
 * @returns {Set<string>}
 */
export function applicableKeyIds(lang) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const sharedPunct = [',', '.', '/', '-', ';', "'"]
  const set = new Set([...letters, ' ', ...sharedPunct])
  if (lang === 'en') {
    for (const d of '0123456789') set.add(d)
    set.add('[')
    set.add(']')
    set.add('\\')
    set.add('`')
    set.add('=')
  } else if (lang === 'ja') {
    set.add('[')
    set.add(']')
  }
  return set
}

/**
 * @param {string} id
 * @param {Set<string>} applicable
 */
export function isKeyEnabled(id, applicable) {
  if (MODIFIER_IDS.has(id)) return false
  return applicable.has(id)
}

/**
 * @typedef {{
 *   id: string
 *   label: string
 *   size?: 'std' | 'backspace' | 'tab' | 'caps' | 'enter' | 'shift' | 'mod' | 'space' | 'backslash'
 * }} AnsiKey
 */

/** @type {AnsiKey[][]} */
export const ANSI_ROWS = [
  [
    { id: '`', label: '`' },
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '3', label: '3' },
    { id: '4', label: '4' },
    { id: '5', label: '5' },
    { id: '6', label: '6' },
    { id: '7', label: '7' },
    { id: '8', label: '8' },
    { id: '9', label: '9' },
    { id: '0', label: '0' },
    { id: '-', label: '-' },
    { id: '=', label: '=' },
    { id: 'Backspace', label: 'delete', size: 'backspace' },
  ],
  [
    { id: 'Tab', label: 'tab', size: 'tab' },
    { id: 'q', label: 'Q' },
    { id: 'w', label: 'W' },
    { id: 'e', label: 'E' },
    { id: 'r', label: 'R' },
    { id: 't', label: 'T' },
    { id: 'y', label: 'Y' },
    { id: 'u', label: 'U' },
    { id: 'i', label: 'I' },
    { id: 'o', label: 'O' },
    { id: 'p', label: 'P' },
    { id: '[', label: '[' },
    { id: ']', label: ']' },
    { id: '\\', label: '\\', size: 'backslash' },
  ],
  [
    { id: 'CapsLock', label: 'caps', size: 'caps' },
    { id: 'a', label: 'A' },
    { id: 's', label: 'S' },
    { id: 'd', label: 'D' },
    { id: 'f', label: 'F' },
    { id: 'g', label: 'G' },
    { id: 'h', label: 'H' },
    { id: 'j', label: 'J' },
    { id: 'k', label: 'K' },
    { id: 'l', label: 'L' },
    { id: ';', label: ';' },
    { id: "'", label: "'" },
    { id: 'Enter', label: 'return', size: 'enter' },
  ],
  [
    { id: 'Shift', label: 'shift', size: 'shift' },
    { id: 'z', label: 'Z' },
    { id: 'x', label: 'X' },
    { id: 'c', label: 'C' },
    { id: 'v', label: 'V' },
    { id: 'b', label: 'B' },
    { id: 'n', label: 'N' },
    { id: 'm', label: 'M' },
    { id: ',', label: ',' },
    { id: '.', label: '.' },
    { id: '/', label: '/' },
    { id: 'Shift', label: 'shift', size: 'shift' },
  ],
  [
    { id: 'Control', label: 'ctrl', size: 'mod' },
    { id: 'Alt', label: 'opt', size: 'mod' },
    { id: 'Meta', label: 'cmd', size: 'mod' },
    { id: ' ', label: 'space', size: 'space' },
    { id: 'Meta', label: 'cmd', size: 'mod' },
    { id: 'Alt', label: 'opt', size: 'mod' },
    { id: 'Control', label: 'ctrl', size: 'mod' },
  ],
]

/**
 * @param {string} s
 */
function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

/**
 * @param {object} opts
 * @param {'en' | 'zh' | 'ja'} opts.lang
 * @param {'button' | 'div'} [opts.tag]
 * @param {string} [opts.extraKeyClass]
 * @param {(key: AnsiKey, enabled: boolean) => string} [opts.renderInner] — HTML inside each key
 * @param {(key: AnsiKey, enabled: boolean) => string} [opts.extraClasses]
 */
export function renderAnsiKeyboardRows(opts) {
  const applicable = applicableKeyIds(opts.lang)
  const tag = opts.tag || 'div'
  const typeAttr = tag === 'button' ? ' type="button" tabindex="-1"' : ''

  return ANSI_ROWS.map(
    (row) => `
    <div class="kb-row">
      ${row
        .map((key) => {
          const enabled = isKeyEnabled(key.id, applicable)
          const size = key.size && key.size !== 'std' ? ` key-size-${key.size}` : ''
          const disabled = enabled ? '' : ' key-disabled'
          const extra = opts.extraClasses ? ` ${opts.extraClasses(key, enabled).trim()}` : ''
          const extraClass = opts.extraKeyClass ? ` ${opts.extraKeyClass}` : ''
          const inner = opts.renderInner
            ? opts.renderInner(key, enabled)
            : key.id === ' '
              ? 'space'
              : escapeAttr(key.label)
          const open =
            tag === 'button'
              ? `<button${typeAttr} class="key${size}${disabled}${extraClass}${extra}" data-key="${escapeAttr(key.id)}"${enabled ? '' : ' disabled aria-disabled="true"'}>`
              : `<div class="key${size}${disabled}${extraClass}${extra}" data-key="${escapeAttr(key.id)}"${enabled ? '' : ' aria-disabled="true"'}>`
          const close = tag === 'button' ? '</button>' : '</div>'
          return `${open}${inner}${close}`
        })
        .join('')}
    </div>`,
  ).join('')
}
