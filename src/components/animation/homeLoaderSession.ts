'use client'

const SKIP_HOME_LOADER_KEY = 'skipHomeLoader'

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
