/**
 * Focus-window helpers for mobile passage typing.
 * Show a few soft lines around the current character so the UI stays stable
 * whether the system keyboard is open or closed.
 */

/**
 * @param {string} text
 * @param {number} currentIndex
 * @param {{ start: number, end: number }} page
 * @param {{ linesBefore?: number, linesAfter?: number, charsPerLine?: number }} [opts]
 */
export function focusWindowCharBounds(text, currentIndex, page, opts = {}) {
  const linesBefore = opts.linesBefore ?? 2
  const linesAfter = opts.linesAfter ?? 2
  const charsPerLine = opts.charsPerLine ?? 36
  const pageStart = Math.max(0, page.start)
  const pageEnd = Math.min(Math.max(0, text.length - 1), page.end)
  const cur = Number.isFinite(currentIndex) ? currentIndex : pageStart

  if (cur < 0) {
    return { start: pageStart, end: pageEnd, clippedBefore: false, clippedAfter: false }
  }

  let start = Math.max(pageStart, cur - linesBefore * charsPerLine)
  let end = Math.min(pageEnd, cur + linesAfter * charsPerLine)

  // Prefer breaking on whitespace so the window doesn’t start mid-word.
  if (start > pageStart) {
    const lookBack = Math.max(pageStart, start - 16)
    const sp = text.lastIndexOf(' ', start)
    const nl = text.lastIndexOf('\n', start)
    const br = Math.max(sp, nl)
    if (br >= lookBack) start = br + 1
  }
  if (end < pageEnd) {
    const lookAhead = Math.min(pageEnd, end + 16)
    const sp = text.indexOf(' ', end)
    const nl = text.indexOf('\n', end)
    const candidates = [sp, nl].filter((i) => i >= 0 && i <= lookAhead)
    if (candidates.length) end = Math.min(...candidates)
  }

  return {
    start,
    end,
    clippedBefore: start > pageStart,
    clippedAfter: end < pageEnd,
  }
}

/**
 * Segment-index window for Japanese (and similar unit streams).
 * @param {number} currentSeg
 * @param {{ start: number, end: number }} pageSegRange inclusive start, inclusive end
 * @param {{ before?: number, after?: number }} [opts]
 */
export function focusWindowSegBounds(currentSeg, pageSegRange, opts = {}) {
  const before = opts.before ?? 8
  const after = opts.after ?? 10
  const pageStart = pageSegRange.start
  const pageEnd = pageSegRange.end
  const cur = Number.isFinite(currentSeg) ? currentSeg : pageStart
  const start = Math.max(pageStart, cur - before)
  const end = Math.min(pageEnd, cur + after)
  return {
    start,
    end,
    clippedBefore: start > pageStart,
    clippedAfter: end < pageEnd,
  }
}

export function focusFadeBeforeHtml() {
  return `<span class="focus-fade focus-fade-before" aria-hidden="true">…</span>`
}

export function focusFadeAfterHtml() {
  return `<span class="focus-fade focus-fade-after" aria-hidden="true">…</span>`
}
