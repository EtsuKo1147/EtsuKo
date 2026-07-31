'use client'

const SKIP_HOME_LOADER_KEY = 'skipHomeLoader'
const HOME_HISTORY_SCROLL_Y_KEY = '__etsuHomeScrollY'

declare global {
  interface Window {
    __etsuHomeLoaderPlayed?: boolean
  }
}

export function hasHomeLoaderPlayed() {
  return typeof window !== 'undefined' && window.__etsuHomeLoaderPlayed === true
}

export function markHomeLoaderPlayed() {
  if (typeof window === 'undefined') return
  window.__etsuHomeLoaderPlayed = true
}

export function requestHomeLoaderSkip() {
  if (typeof window === 'undefined') return
  markHomeLoaderPlayed()
  sessionStorage.setItem(SKIP_HOME_LOADER_KEY, '1')
}

export function clearHomeLoaderSkipRequest() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SKIP_HOME_LOADER_KEY)
}

export function shouldSkipHomeLoader() {
  return (
    typeof window !== 'undefined' &&
    (hasHomeLoaderPlayed() || sessionStorage.getItem(SKIP_HOME_LOADER_KEY) === '1')
  )
}

export function rememberHomeHistoryPosition() {
  if (typeof window === 'undefined') return

  requestHomeLoaderSkip()
  const currentState = window.history.state
  const nextState = currentState && typeof currentState === 'object'
    ? { ...currentState }
    : {}

  window.history.replaceState(
    {
      ...nextState,
      [HOME_HISTORY_SCROLL_Y_KEY]: window.scrollY,
    },
    '',
    window.location.href,
  )
}

export function getHomeHistoryScrollPosition() {
  if (typeof window === 'undefined') return null

  const savedPosition = window.history.state?.[HOME_HISTORY_SCROLL_Y_KEY]
  return typeof savedPosition === 'number' && Number.isFinite(savedPosition)
    ? Math.max(0, savedPosition)
    : null
}
