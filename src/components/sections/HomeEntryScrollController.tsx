'use client'

import { useLayoutEffect } from 'react'
import { getHomeHistoryScrollPosition } from '@/components/animation/homeLoaderSession'

export default function HomeEntryScrollController() {
  useLayoutEffect(() => {
    const originalScrollRestoration = history.scrollRestoration
    const hasHashTarget = window.location.hash.length > 1
    const savedScrollPosition = hasHashTarget ? null : getHomeHistoryScrollPosition()
    const targetScrollTop = savedScrollPosition ?? 0
    let firstFrame: number | null = null
    let secondFrame: number | null = null

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    if (!hasHashTarget) {
      const restoreScrollPosition = () => {
        window.scrollTo({ top: targetScrollTop, left: 0, behavior: 'auto' })
      }

      restoreScrollPosition()
      firstFrame = window.requestAnimationFrame(() => {
        restoreScrollPosition()
        secondFrame = window.requestAnimationFrame(restoreScrollPosition)
      })
    }

    return () => {
      if (firstFrame !== null) {
        window.cancelAnimationFrame(firstFrame)
      }
      if (secondFrame !== null) {
        window.cancelAnimationFrame(secondFrame)
      }
      if ('scrollRestoration' in history) {
        history.scrollRestoration = originalScrollRestoration
      }
    }
  }, [])

  return null
}
