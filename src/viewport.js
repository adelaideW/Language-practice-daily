/**
 * Viewport helpers for responsive practice defaults.
 *
 * Tiers:
 * - Desktop ≥769px
 * - Tablet 394–768px
 * - Phone ≤393px
 */

/**
 * Hide the on-screen keyboard by default on tablet + phone (≤768px),
 * or when the window is very short. Users can still show it; that choice
 * is stored as an explicit preference.
 */
export function shouldHideKeyboardByDefault() {
  if (typeof window === 'undefined') return false
  try {
    if (window.matchMedia('(max-width: 768px)').matches) return true
    // Short laptop / browser chrome windows still benefit from a hidden keyboard.
    if (window.matchMedia('(max-height: 720px)').matches) return true
  } catch {
    /* ignore */
  }
  return false
}

/**
 * Resolve whether the keyboard should start covered.
 * Explicit user toggles always win; otherwise compact viewports hide by default.
 * @param {boolean} saved
 * @param {string} explicitStorageKey localStorage key set when the user toggles the keyboard
 */
export function resolveKeyboardCovered(saved, explicitStorageKey) {
  try {
    if (localStorage.getItem(explicitStorageKey) === '1') return Boolean(saved)
  } catch {
    /* ignore */
  }
  if (shouldHideKeyboardByDefault()) return true
  return Boolean(saved)
}

/** @param {string} explicitStorageKey */
export function markKeyboardPreferenceExplicit(explicitStorageKey) {
  try {
    localStorage.setItem(explicitStorageKey, '1')
  } catch {
    /* ignore */
  }
}

/**
 * Keep keyboard covered in sync when crossing tablet/desktop breakpoints,
 * unless the user has explicitly toggled the keyboard.
 * @param {string} explicitStorageKey
 * @param {() => boolean} getCovered
 * @param {(covered: boolean) => void} setCoveredSilent must not mark preference explicit
 */
export function installViewportKeyboardSync(explicitStorageKey, getCovered, setCoveredSilent) {
  if (typeof window === 'undefined') return () => {}
  const sync = () => {
    try {
      if (localStorage.getItem(explicitStorageKey) === '1') return
    } catch {
      /* ignore */
    }
    const want = shouldHideKeyboardByDefault()
    if (want === getCovered()) return
    setCoveredSilent(want)
  }
  const mqW = window.matchMedia('(max-width: 768px)')
  const mqH = window.matchMedia('(max-height: 720px)')
  mqW.addEventListener('change', sync)
  mqH.addEventListener('change', sync)
  return () => {
    mqW.removeEventListener('change', sync)
    mqH.removeEventListener('change', sync)
  }
}
