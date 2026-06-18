'use client'

import { useLayoutEffect } from 'react'

export default function HomeEntryScrollController() {
  // Temporary diagnostic: disable entry scroll reset.
  return null

  useLayoutEffect(() => {
    const originalScrollRestoration = history.scrollRestoration
    const hasHashTarget = window.location.hash.length > 1

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    if (!hasHashTarget) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

      const frame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      })

      return () => {
        window.cancelAnimationFrame(frame)
        if ('scrollRestoration' in history) {
          history.scrollRestoration = originalScrollRestoration
        }
      }
    }

    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = originalScrollRestoration
      }
    }
  }, [])

  return null
}
