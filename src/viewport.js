/**
 * Viewport helpers for responsive practice defaults.
 *
 * Tiers:
 * - Desktop ≥769px
 * - Tablet 574–768px
 * - Phone / mobile chrome <574px (max-width: 573px)
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

/**
 * Track visual viewport while typing on phone. Focus-window rendering owns the
 * article slice; this only tucks the bottom nav when the system keyboard opens
 * so chrome doesn’t jump dramatically.
 */
export function installMobileTypingViewportSync() {
  if (typeof window === 'undefined') return () => {}
  const vv = window.visualViewport
  const root = document.documentElement
  const mobileMq = window.matchMedia('(max-width: 573px)')

  const sync = () => {
    const mirror = document.querySelector('#key-mirror')
    const focused = document.activeElement === mirror
    const viewportHeight = vv?.height || window.innerHeight
    const offsetTop = vv?.offsetTop || 0
    const keyboardInset = Math.max(0, window.innerHeight - viewportHeight - offsetTop)
    const keyboardOpen = mobileMq.matches && focused && keyboardInset > 80

    root.style.setProperty('--mobile-vvh', `${Math.round(viewportHeight)}px`)
    root.style.setProperty('--mobile-vv-top', `${Math.round(offsetTop)}px`)
    root.style.setProperty('--mobile-keyboard-inset', `${Math.round(keyboardInset)}px`)
    document.body.classList.toggle('mobile-typing-keyboard-open', keyboardOpen)
  }

  const rafSync = () => requestAnimationFrame(sync)
  vv?.addEventListener('resize', rafSync)
  vv?.addEventListener('scroll', rafSync)
  window.addEventListener('resize', rafSync)
  window.addEventListener('focusin', rafSync)
  window.addEventListener('focusout', rafSync)
  sync()

  return () => {
    vv?.removeEventListener('resize', rafSync)
    vv?.removeEventListener('scroll', rafSync)
    window.removeEventListener('resize', rafSync)
    window.removeEventListener('focusin', rafSync)
    window.removeEventListener('focusout', rafSync)
    document.body.classList.remove('mobile-typing-keyboard-open')
  }
}
