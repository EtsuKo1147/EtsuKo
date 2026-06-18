'use client'

import { useEffect, useRef, useState } from 'react'

type EventName = 'scroll' | 'touchstart' | 'touchmove' | 'touchend' | 'wheel'

type DebugState = {
  now: number
  scrollY: number
  docScrollTop: number
  bodyScrollTop: number
  docScrollHeight: number
  bodyScrollHeight: number
  docClientHeight: number
  innerHeight: number
  visualHeight: number | null
  visualOffsetTop: number | null
  atTop: boolean
  atBottom: boolean
  times: Record<EventName, number | null>
  lastEvent: EventName | 'resize' | 'init'
  touchStartY: number | null
  touchCurrentY: number | null
  touchDeltaY: number | null
  wheelDeltaY: number | null
  hitTarget: string
  touchMovedScroll: boolean | null
  wheelMovedScroll: boolean | null
  stuck: boolean
}

const initialTimes: Record<EventName, number | null> = {
  scroll: null,
  touchstart: null,
  touchmove: null,
  touchend: null,
  wheel: null,
}

const initialState: DebugState = {
  now: 0,
  scrollY: 0,
  docScrollTop: 0,
  bodyScrollTop: 0,
  docScrollHeight: 0,
  bodyScrollHeight: 0,
  docClientHeight: 0,
  innerHeight: 0,
  visualHeight: null,
  visualOffsetTop: null,
  atTop: true,
  atBottom: false,
  times: initialTimes,
  lastEvent: 'init',
  touchStartY: null,
  touchCurrentY: null,
  touchDeltaY: null,
  wheelDeltaY: null,
  hitTarget: '',
  touchMovedScroll: null,
  wheelMovedScroll: null,
  stuck: false,
}

function formatElement(element: Element | null) {
  if (!element) return 'none'
  const tag = element.tagName.toLowerCase()
  const id = element.id ? `#${element.id}` : ''
  const className = typeof element.className === 'string'
    ? element.className.trim().replace(/\s+/g, '.')
    : ''
  return `${tag}${id}${className ? `.${className}` : ''}`
}

function formatTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return 'none'
  const chain = [target]
  let parent = target.parentElement

  while (parent && chain.length < 4) {
    chain.push(parent)
    parent = parent.parentElement
  }

  return chain.map(formatElement).join(' < ')
}

function collectScrollMetrics() {
  const doc = document.documentElement
  const body = document.body
  const scrollY = window.scrollY
  const docClientHeight = doc.clientHeight
  const docScrollHeight = doc.scrollHeight
  const atTop = scrollY <= 1
  const atBottom = scrollY + window.innerHeight >= docScrollHeight - 2

  return {
    scrollY,
    docScrollTop: doc.scrollTop,
    bodyScrollTop: body.scrollTop,
    docScrollHeight,
    bodyScrollHeight: body.scrollHeight,
    docClientHeight,
    innerHeight: window.innerHeight,
    visualHeight: window.visualViewport?.height ?? null,
    visualOffsetTop: window.visualViewport?.offsetTop ?? null,
    atTop,
    atBottom,
  }
}

function msAgo(time: number | null, now: number) {
  return time === null ? 'never' : `${Math.round(now - time)}ms`
}

export default function ScrollDebugOverlay() {
  const [state, setState] = useState<DebugState>(initialState)
  const touchStartYRef = useRef<number | null>(null)
  const previousScrollYRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const update = (
      eventName: DebugState['lastEvent'],
      patch: Partial<DebugState> = {}
    ) => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        const now = performance.now()
        const metrics = collectScrollMetrics()

        setState((current) => {
          const times = { ...current.times }
          if (
            eventName === 'scroll' ||
            eventName === 'touchstart' ||
            eventName === 'touchmove' ||
            eventName === 'touchend' ||
            eventName === 'wheel'
          ) {
            times[eventName] = now
          }

          const inputWithoutScroll =
            (eventName === 'touchmove' && patch.touchMovedScroll === false) ||
            (eventName === 'wheel' && patch.wheelMovedScroll === false)
          const stuck = Boolean(inputWithoutScroll && !metrics.atTop && !metrics.atBottom)

          return {
            ...current,
            now,
            ...metrics,
            ...patch,
            times,
            lastEvent: eventName,
            stuck,
          }
        })

        previousScrollYRef.current = metrics.scrollY
      })
    }

    const onScroll = () => update('scroll')

    const onTouchStart = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? null
      touchStartYRef.current = y
      previousScrollYRef.current = window.scrollY

      update('touchstart', {
        touchStartY: y,
        touchCurrentY: y,
        touchDeltaY: 0,
        hitTarget: formatTarget(event.target),
        touchMovedScroll: null,
      })
    }

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? null
      const startY = touchStartYRef.current
      const deltaY = y !== null && startY !== null ? y - startY : null
      const movedScroll = Math.abs(window.scrollY - previousScrollYRef.current) > 0.5

      update('touchmove', {
        touchCurrentY: y,
        touchDeltaY: deltaY,
        touchMovedScroll: movedScroll,
      })
    }

    const onTouchEnd = () => update('touchend')

    const onWheel = (event: WheelEvent) => {
      const movedScroll = Math.abs(window.scrollY - previousScrollYRef.current) > 0.5
      update('wheel', {
        wheelDeltaY: event.deltaY,
        wheelMovedScroll: movedScroll,
      })
    }

    const onResize = () => update('resize')

    update('init')
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    window.visualViewport?.addEventListener('resize', onResize, { passive: true })

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [])

  const rows = [
    `event ${state.lastEvent} stuck ${state.stuck ? 'YES' : 'no'}`,
    `y ${Math.round(state.scrollY)} docTop ${Math.round(state.docScrollTop)} bodyTop ${Math.round(state.bodyScrollTop)}`,
    `docH ${state.docScrollHeight} bodyH ${state.bodyScrollHeight} clientH ${state.docClientHeight}`,
    `innerH ${state.innerHeight} vvH ${state.visualHeight?.toFixed(1) ?? 'n/a'} vvTop ${state.visualOffsetTop?.toFixed(1) ?? 'n/a'}`,
    `top ${state.atTop ? 'YES' : 'no'} bottom ${state.atBottom ? 'YES' : 'no'}`,
    `touch y0 ${state.touchStartY ?? 'n/a'} y ${state.touchCurrentY ?? 'n/a'} dY ${state.touchDeltaY ?? 'n/a'}`,
    `wheel dY ${state.wheelDeltaY?.toFixed(1) ?? 'n/a'}`,
    `moved touch ${state.touchMovedScroll === null ? 'n/a' : state.touchMovedScroll ? 'yes' : 'NO'} wheel ${state.wheelMovedScroll === null ? 'n/a' : state.wheelMovedScroll ? 'yes' : 'NO'}`,
    `age s:${msAgo(state.times.scroll, state.now)} ts:${msAgo(state.times.touchstart, state.now)} tm:${msAgo(state.times.touchmove, state.now)} te:${msAgo(state.times.touchend, state.now)} w:${msAgo(state.times.wheel, state.now)}`,
    `hit ${state.hitTarget || 'n/a'}`,
  ]

  return (
    <aside
      aria-label="Temporary scroll debug overlay"
      style={{
        position: 'fixed',
        left: 8,
        bottom: 8,
        zIndex: 2147483647,
        maxWidth: 'min(94vw, 430px)',
        padding: '8px 10px',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 6,
        background: 'rgba(0,0,0,0.78)',
        color: '#00ff90',
        fontFamily: 'Menlo, Monaco, Consolas, monospace',
        fontSize: 10,
        lineHeight: 1.35,
        whiteSpace: 'pre-wrap',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Temporary diagnostic: scroll/touch event observer. */}
      {rows.join('\n')}
    </aside>
  )
}
