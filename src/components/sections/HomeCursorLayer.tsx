'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from 'react'
import type { HomeCharacter } from './homeCharacterData'
import styles from './HomeCursorLayer.module.css'

type HomeCursorLayerProps = {
  character: HomeCharacter
  enabled: boolean
}

export default function HomeCursorLayer({
  character,
  enabled,
}: HomeCursorLayerProps) {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor || !enabled) return

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')

    const syncCursorMode = () => {
      const shouldUseCustomCursor = mediaQuery.matches
      cursor.hidden = !shouldUseCustomCursor
      document.documentElement.classList.toggle(
        'homeCustomCursorActive',
        shouldUseCustomCursor,
      )
    }

    const moveCursor = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      cursor.hidden = false
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
    }

    syncCursorMode()
    window.addEventListener('pointermove', moveCursor, { passive: true })
    mediaQuery.addEventListener('change', syncCursorMode)

    return () => {
      window.removeEventListener('pointermove', moveCursor)
      mediaQuery.removeEventListener('change', syncCursorMode)
      document.documentElement.classList.remove('homeCustomCursorActive')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={cursorRef} className={styles.cursorLayer} hidden aria-hidden="true">
      <img
        key={character.cursor}
        src={character.cursor}
        alt=""
        className={styles.cursorImage}
        draggable={false}
      />
    </div>
  )
}
