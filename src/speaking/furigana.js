/**
 * Japanese furigana (hiragana over kanji) via Kuroshiro + Kuromoji.
 * Dict served from public/kuromoji/dict.
 */

let readyPromise = null
let kuroshiro = null

function dictPath() {
  const base = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : '/'
  return `${String(base).replace(/\/?$/, '/') }kuromoji/dict`
}

async function getKuroshiro() {
  if (kuroshiro) return kuroshiro
  if (!readyPromise) {
    readyPromise = (async () => {
      const KuroshiroMod = await import('kuroshiro')
      const AnalyzerMod = await import('kuroshiro-analyzer-kuromoji')
      const Kuroshiro = KuroshiroMod.default?.default || KuroshiroMod.default || KuroshiroMod
      const KuromojiAnalyzer =
        AnalyzerMod.default?.default || AnalyzerMod.default || AnalyzerMod
      const instance = new Kuroshiro()
      await instance.init(
        new KuromojiAnalyzer({
          dictPath: dictPath(),
        }),
      )
      kuroshiro = instance
      return instance
    })().catch((err) => {
      readyPromise = null
      throw err
    })
  }
  return readyPromise
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Kuroshiro okurigana form: 漢字[かんじ] → ruby HTML
 * @param {string} okurigana
 */
function okuriganaToRubyHtml(okurigana) {
  const raw = String(okurigana || '')
  if (!raw) return ''
  let out = ''
  let i = 0
  while (i < raw.length) {
    const open = raw.indexOf('[', i)
    if (open < 0) {
      out += escapeHtml(raw.slice(i))
      break
    }
    // Find start of kanji run before [
    let start = open
    while (start > i && /[\u4E00-\u9FFF々〆ヵヶ]/.test(raw[start - 1])) start -= 1
    out += escapeHtml(raw.slice(i, start))
    const close = raw.indexOf(']', open + 1)
    if (close < 0) {
      out += escapeHtml(raw.slice(start))
      break
    }
    const kanji = raw.slice(start, open)
    const reading = raw.slice(open + 1, close)
    if (kanji && reading) {
      out += `<ruby>${escapeHtml(kanji)}<rt>${escapeHtml(reading)}</rt></ruby>`
    } else {
      out += escapeHtml(raw.slice(start, close + 1))
    }
    i = close + 1
  }
  return out
}

/**
 * Convert Japanese text to HTML with <ruby> furigana.
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function toFuriganaHtml(text) {
  const raw = String(text || '')
  if (!raw.trim()) return ''
  try {
    const k = await getKuroshiro()
    const furigana = await k.convert(raw, { mode: 'furigana', to: 'hiragana' })
    if (furigana && /<ruby[\s>]/i.test(furigana)) return furigana

    const okurigana = await k.convert(raw, { mode: 'okurigana', to: 'hiragana' })
    if (okurigana && okurigana.includes('[')) {
      return okuriganaToRubyHtml(okurigana)
    }
    return escapeHtml(raw)
  } catch (err) {
    console.warn('Furigana convert failed', err)
    return escapeHtml(raw)
  }
}
