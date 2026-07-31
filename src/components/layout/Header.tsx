'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import gsap from 'gsap'
import {
  requestHomeLoaderSkip,
  shouldSkipHomeLoader,
} from '@/components/animation/homeLoaderSession'
import styles from './RoadSign.module.css'
import RoadSignClock from './RoadSignClock'

type RoadSignState = 'collapsed' | 'expanding' | 'expanded' | 'collapsing'
type CompactNavState = 'closed' | 'arriving' | 'opening' | 'open' | 'closing'
type CompactNavHideOptions = {
  restoreHeroBunny?: boolean
  syncState?: boolean
}

const ROAD_SIGN_DESIGN_HEIGHT = 750
const ROAD_SIGN_DESIGN_WIDTH = 760
const ROAD_SIGN_BASE_WIDTH = 1920
const ROAD_SIGN_BASE_SCALE = 1.45
const ROAD_SIGN_MAX_SCALE = 1.45
const ROAD_SIGN_MOBILE_SCALE = 0.55
const ROAD_SIGN_SAFE_LEFT_MARGIN = 24
const COMPACT_NAV_DESIGN_WIDTH = 590
const COMPACT_NAV_CIRCLE_SIZE = 88
const COMPACT_NAV_CONTACT_WIDTH = 182
const COMPACT_NAV_TRIANGLE_ROTATION = -35
const COMPACT_NAV_STATE_STORAGE_KEY = 'etsu-compact-nav-expanded'
const SIMPLE_NAV_ITEMS = [
  { label: 'HOME', href: '/' },
  { label: 'WORKS', href: '/works' },
  { label: 'PROFILE', href: '/profile' },
  { label: 'CONTACT', href: '/contact' },
] as const

function getRoadSignRightMargin(viewportWidth: number) {
  return Math.min(48, Math.max(16, viewportWidth * 0.022))
}

function getRoadSignScale(viewportWidth: number, viewportHeight: number) {
  if (viewportWidth <= 768) {
    return ROAD_SIGN_MOBILE_SCALE
  }

  const rightMargin = getRoadSignRightMargin(viewportWidth)
  const widthRatioScale = (viewportWidth / ROAD_SIGN_BASE_WIDTH) * ROAD_SIGN_BASE_SCALE
  const widthLimitScale = (viewportWidth - rightMargin - ROAD_SIGN_SAFE_LEFT_MARGIN) / ROAD_SIGN_DESIGN_WIDTH
  const heightLimitScale = viewportHeight / ROAD_SIGN_DESIGN_HEIGHT
  return Math.min(ROAD_SIGN_MAX_SCALE, widthRatioScale, widthLimitScale, heightLimitScale)
}

function getCompactNavScale(viewportWidth: number) {
  const safeViewportWidth = viewportWidth - 32
  const widthLimitScale = safeViewportWidth / COMPACT_NAV_DESIGN_WIDTH

  if (viewportWidth <= 768) {
    return Math.min(0.72, Math.max(0.56, widthLimitScale))
  }

  return Math.min(1, Math.max(0.72, viewportWidth / ROAD_SIGN_BASE_WIDTH))
}

export default function Header() {
  const pathname = usePathname()
  const isWorkDetailPage = pathname.startsWith('/works/')
  const usesSimpleNav = pathname === '/works'
    || pathname.startsWith('/works/')
    || pathname === '/profile'
    || pathname === '/contact'
  const asideRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const clockRef = useRef<HTMLDivElement>(null)
  const bunnyRef = useRef<HTMLDivElement>(null)
  const roadSignSlideRef = useRef<HTMLDivElement>(null)
  const bunnyTlRef = useRef<gsap.core.Timeline | null>(null)
  const bunnyLoopTlRef = useRef<gsap.core.Timeline | null>(null)
  const bunnyReadyRef = useRef(false)
  const roadSignReadyRef = useRef(false)
  const startBunnyLoopRef = useRef<() => void>(() => {})
  const roadSignCollapsedRef = useRef(false)
  const pastHeroRef = useRef(false)
  const scrollRafRef = useRef<number | null>(null)
  const roadSignItemsTlRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null)
  const roadSignStateRef = useRef<RoadSignState>('expanded')
  const handleRoadSignScrollRef = useRef<() => void>(() => {})
  const forceHideCompactNavRef = useRef<(options?: CompactNavHideOptions) => void>(() => {})
  const compactNavRef = useRef<HTMLElement>(null)
  const compactNavTravelRef = useRef<HTMLDivElement>(null)
  const compactNavStageRef = useRef<HTMLDivElement>(null)
  const compactNavCircleRef = useRef<HTMLDivElement>(null)
  const compactNavTriangleRef = useRef<HTMLSpanElement>(null)
  const compactNavRabbitRef = useRef<HTMLImageElement>(null)
  const compactNavTransitionRabbitRef = useRef<HTMLImageElement>(null)
  const compactNavLinksRef = useRef<HTMLElement>(null)
  const compactNavTlRef = useRef<gsap.core.Timeline | null>(null)
  const compactNavRabbitHoverTlRef = useRef<gsap.core.Timeline | null>(null)
  const compactNavStateRef = useRef<CompactNavState>('closed')
  const compactNavActiveIndexRef = useRef<number | null>(null)
  const compactNavUserExpandedRef = useRef(false)
  const [isRoadSignCollapsed, setIsRoadSignCollapsed] = useState(false)
  const [isCompactNavVisible, setIsCompactNavVisible] = useState(false)
  const [isCompactNavExpanded, setIsCompactNavExpanded] = useState(false)

  const canUseHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const killRoadSignItemsTimeline = () => {
    roadSignItemsTlRef.current?.kill()
    roadSignItemsTlRef.current = null
  }

  const addBunnySquash = (tl: gsap.core.Timeline, bunny: HTMLElement, isMobile: boolean) => {
    tl.to(bunny, { scaleX: 1.08, scaleY: 0.9, y: isMobile ? 3 : 5, duration: 0.08, ease: 'power1.out' })
      .to(bunny, { scaleX: 0.96, scaleY: 1.08, y: isMobile ? -2 : -4, duration: 0.12, ease: 'power1.out' })
      .to(bunny, { scaleX: 1, scaleY: 1, y: 0, rotate: 0, duration: 0.22, ease: 'elastic.out(1, 0.45)' })
  }

  const playBunnySquash = () => {
    const bunny = bunnyRef.current
    if (!bunny) return
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    bunnyLoopTlRef.current?.kill()
    bunnyLoopTlRef.current = null
    gsap.killTweensOf(bunny)
    const tl = gsap.timeline()
    addBunnySquash(tl, bunny, isMobile)
  }

  const playCompactNavRabbitBounce = () => {
    const rabbit = compactNavRabbitRef.current
    const state = compactNavStateRef.current
    if (!rabbit || !canUseHover()) return
    if (state !== 'closed' && state !== 'open') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    compactNavRabbitHoverTlRef.current?.kill()
    gsap.killTweensOf(rabbit)
    gsap.set(rabbit, {
      x: state === 'open' ? 6 : 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotate: 0,
    })

    const tl = gsap.timeline({
      onComplete: () => {
        compactNavRabbitHoverTlRef.current = null
      },
    })
    compactNavRabbitHoverTlRef.current = tl
    addBunnySquash(tl, rabbit, true)
    addBunnySquash(tl, rabbit, true)
  }

  const setRoadSignCollapsedState = (next: boolean) => {
    roadSignCollapsedRef.current = next
    setIsRoadSignCollapsed(next)
  }

  const rememberCompactNavExpanded = (expanded: boolean) => {
    compactNavUserExpandedRef.current = expanded
    try {
      window.sessionStorage.setItem(COMPACT_NAV_STATE_STORAGE_KEY, String(expanded))
    } catch {
      // Keep the in-memory preference when session storage is unavailable.
    }
  }

  const getCompactNavLinks = () => compactNavLinksRef.current
    ? Array.from(compactNavLinksRef.current.querySelectorAll('a'))
    : []

  const getCompactNavPills = () => compactNavLinksRef.current
    ? Array.from(compactNavLinksRef.current.querySelectorAll(`.${styles.compactNavPill}`))
    : []

  const getCompactNavMagnetShapes = () => {
    const pills = getCompactNavPills()
    const circle = compactNavCircleRef.current
    if (!circle || !pills.length) return pills
    return pills.map((pill, index) => index === pills.length - 1 ? circle : pill)
  }

  const getCompactNavTethers = () => compactNavLinksRef.current
    ? Array.from(compactNavLinksRef.current.querySelectorAll(`.${styles.compactNavTether}`))
    : []

  const killCompactNavTimeline = () => {
    compactNavRabbitHoverTlRef.current?.kill()
    compactNavRabbitHoverTlRef.current = null
    compactNavTlRef.current?.kill()
    compactNavTlRef.current = null
  }

  const resetCompactNavMagnet = (immediate = false) => {
    const shapes = getCompactNavMagnetShapes()
    const tethers = getCompactNavTethers()
    compactNavActiveIndexRef.current = null
    gsap.killTweensOf([...shapes, ...tethers])

    if (immediate) {
      gsap.set(shapes, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        transformOrigin: 'center center',
      })
      gsap.set(tethers, {
        autoAlpha: 0,
        scaleX: 0,
      })
      return
    }

    gsap.to(shapes, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.3,
      ease: 'elastic.out(1, 0.55)',
      overwrite: true,
    })
    gsap.to(tethers, {
      autoAlpha: 0,
      scaleX: 0,
      duration: 0.14,
      ease: 'power2.in',
      overwrite: true,
    })
  }

  const playCompactNavMagnet = (activeIndex: number) => {
    if (!canUseHover()) return
    if (compactNavStateRef.current !== 'open') return

    const previousIndex = compactNavActiveIndexRef.current
    if (previousIndex === activeIndex) return

    const shapes = getCompactNavMagnetShapes()
    const tethers = getCompactNavTethers()
    const activePill = shapes[activeIndex]
    if (!activePill) return

    compactNavActiveIndexRef.current = activeIndex
    gsap.killTweensOf([...shapes, ...tethers])
    gsap.to(tethers, { autoAlpha: 0, scaleX: 0, duration: 0.08, overwrite: true })

    shapes.forEach((pill, index) => {
      if (index === activeIndex || index === previousIndex) return
      gsap.to(pill, {
        x: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: true,
      })
    })

    if (previousIndex === null || !shapes[previousIndex]) {
      gsap.to(activePill, {
        scaleX: 1.025,
        scaleY: 1.02,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: true,
      })
      return
    }

    const direction = activeIndex > previousIndex ? 1 : -1
    const previousPill = shapes[previousIndex]
    const tetherIndex = direction > 0 ? activeIndex - 1 : activeIndex
    const tether = tethers[tetherIndex]
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      gsap.set(previousPill, { x: 0, scaleX: 1, scaleY: 1 })
      gsap.set(activePill, { x: 0, scaleX: 1.025, scaleY: 1.02 })
      return
    }

    gsap.timeline({ defaults: { overwrite: true } })
      .to(previousPill, {
        x: direction * 3,
        scaleX: 1.055,
        scaleY: 0.985,
        transformOrigin: direction > 0 ? 'left center' : 'right center',
        duration: 0.1,
        ease: 'power2.out',
      }, 0)
      .to(previousPill, {
        x: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.24,
        ease: 'elastic.out(1, 0.6)',
      }, 0.1)
      .fromTo(activePill, {
        x: -direction * 3,
        scaleX: 1.06,
        scaleY: 0.985,
        transformOrigin: direction > 0 ? 'right center' : 'left center',
      }, {
        x: 0,
        scaleX: 1.025,
        scaleY: 1.02,
        duration: 0.28,
        ease: 'elastic.out(1, 0.55)',
      }, 0.04)

    if (tether) {
      gsap.timeline({ defaults: { overwrite: true } })
        .set(tether, {
          autoAlpha: 1,
          scaleX: 0,
          transformOrigin: direction > 0 ? 'right center' : 'left center',
        })
        .to(tether, { scaleX: 1, duration: 0.1, ease: 'power2.out' })
        .to(tether, {
          scaleX: 0,
          autoAlpha: 0,
          duration: 0.18,
          ease: 'power3.in',
        })
    }
  }

  const releaseCompactNavMagnet = (event: ReactPointerEvent<HTMLElement>) => {
    if (!canUseHover()) return
    const activeIndex = compactNavActiveIndexRef.current
    const shapes = getCompactNavMagnetShapes()
    const tethers = getCompactNavTethers()
    const activePill = activeIndex === null ? null : shapes[activeIndex]
    const activeLink = activeIndex === null ? null : getCompactNavLinks()[activeIndex]
    compactNavActiveIndexRef.current = null

    gsap.killTweensOf([...shapes, ...tethers])
    gsap.to(tethers, {
      autoAlpha: 0,
      scaleX: 0,
      duration: 0.12,
      ease: 'power2.in',
      overwrite: true,
    })
    shapes.forEach((pill, index) => {
      if (index === activeIndex) return
      gsap.to(pill, {
        x: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: true,
      })
    })

    if (!activePill || !activeLink) return
    const rect = activeLink.getBoundingClientRect()
    const direction = event.clientX >= rect.left + rect.width / 2 ? 1 : -1
    gsap.timeline({ defaults: { overwrite: true } })
      .to(activePill, {
        x: direction * 4,
        scaleX: 1.075,
        scaleY: 0.98,
        transformOrigin: direction > 0 ? 'left center' : 'right center',
        duration: 0.09,
        ease: 'power2.out',
      })
      .to(activePill, {
        x: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.34,
        ease: 'elastic.out(1, 0.5)',
      })
  }

  const resetCompactNavVisuals = () => {
    const compact = compactNavRef.current
    const travel = compactNavTravelRef.current
    const circle = compactNavCircleRef.current
    const triangle = compactNavTriangleRef.current
    const rabbit = compactNavRabbitRef.current
    const transitionRabbit = compactNavTransitionRabbitRef.current
    const links = getCompactNavLinks()
    const pills = getCompactNavPills()
    const tethers = getCompactNavTethers()

    if (compact) {
      gsap.set(compact, {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
      })
    }
    if (travel) {
      gsap.set(travel, {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
      })
    }
    if (circle) {
      gsap.set(circle, {
        width: COMPACT_NAV_CIRCLE_SIZE,
        height: COMPACT_NAV_CIRCLE_SIZE,
        borderRadius: '999px',
        scaleX: 1,
        scaleY: 1,
        autoAlpha: 1,
      })
    }
    if (triangle) {
      gsap.set(triangle, {
        x: 0,
        y: 0,
        rotate: COMPACT_NAV_TRIANGLE_ROTATION,
        scale: 1,
        autoAlpha: 1,
      })
    }
    if (rabbit) {
      gsap.set(rabbit, { x: 0, y: 0, rotate: 0, scale: 1, autoAlpha: 1 })
    }
    if (transitionRabbit) {
      gsap.set(transitionRabbit, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        autoAlpha: 0,
        visibility: 'hidden',
      })
    }
    gsap.set(links, {
      x: 24,
      y: 0,
      autoAlpha: 0,
    })
    gsap.set(pills, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: 'center center',
    })
    gsap.set(tethers, {
      scaleX: 0,
      autoAlpha: 0,
    })
    compactNavActiveIndexRef.current = null
    if (compactNavLinksRef.current) {
      gsap.set(compactNavLinksRef.current, { pointerEvents: 'none' })
    }
  }

  const forceHideCompactNav = ({
    restoreHeroBunny = true,
    syncState = true,
  }: CompactNavHideOptions = {}) => {
    const compact = compactNavRef.current
    killCompactNavTimeline()
    resetCompactNavVisuals()
    compactNavStateRef.current = 'closed'

    if (compact) {
      gsap.set(compact, {
        autoAlpha: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
      })
    }
    if (restoreHeroBunny && bunnyRef.current) {
      gsap.set(bunnyRef.current, { autoAlpha: 1, pointerEvents: 'auto' })
    }
    if (syncState) {
      setIsCompactNavVisible(false)
      setIsCompactNavExpanded(false)
    }
  }

  const showCompactNav = () => {
    const compact = compactNavRef.current
    const travel = compactNavTravelRef.current
    const circle = compactNavCircleRef.current
    const triangle = compactNavTriangleRef.current
    const rabbit = compactNavRabbitRef.current
    const transitionRabbit = compactNavTransitionRabbitRef.current
    if (!compact || !travel || !circle || !triangle || !rabbit || !transitionRabbit) return
    if (roadSignStateRef.current !== 'collapsed') {
      forceHideCompactNav()
      return
    }

    killCompactNavTimeline()
    resetCompactNavVisuals()
    compactNavStateRef.current = 'arriving'
    setIsCompactNavVisible(true)
    setIsCompactNavExpanded(false)

    const sourceRect = bunnyRef.current?.getBoundingClientRect()
    const targetRect = rabbit.getBoundingClientRect()
    const hasValidTransitionRects = Boolean(
      sourceRect
      && sourceRect.width > 0
      && sourceRect.height > 0
      && targetRect.width > 0
      && targetRect.height > 0
    )
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.set(compact, {
      x: 0,
      y: 0,
      autoAlpha: 1,
      visibility: 'visible',
      pointerEvents: 'none',
    })
    gsap.set(travel, { x: 0, y: 0 })
    gsap.set(circle, { autoAlpha: 0, scale: 0.42 })
    gsap.set(triangle, {
      autoAlpha: 0,
      scale: 0.42,
      rotate: COMPACT_NAV_TRIANGLE_ROTATION - 16,
    })
    gsap.set(rabbit, {
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: hasValidTransitionRects ? 0 : 1,
      visibility: 'visible',
    })

    if (hasValidTransitionRects && sourceRect) {
      gsap.set(transitionRabbit, {
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        autoAlpha: 1,
        visibility: 'visible',
        transformOrigin: 'top left',
        force3D: true,
      })
      gsap.set(bunnyRef.current, { autoAlpha: 0, pointerEvents: 'none' })
    }

    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        compactNavTlRef.current = null
        compactNavStateRef.current = 'closed'
      },
    })
    compactNavTlRef.current = tl

    if (reducedMotion) {
      tl.set(travel, { x: 0, y: 0 })
        .set(compact, { autoAlpha: 1, pointerEvents: 'auto' })
        .set(circle, { autoAlpha: 1, scale: 1 })
        .set(triangle, {
          autoAlpha: 1,
          scale: 1,
          rotate: COMPACT_NAV_TRIANGLE_ROTATION,
        })
        .set(rabbit, { autoAlpha: 1, visibility: 'visible', scale: 1 })
        .set(transitionRabbit, { autoAlpha: 0, visibility: 'hidden' })
        .set(bunnyRef.current, { autoAlpha: 0, pointerEvents: 'none' })
      return
    }

    if (hasValidTransitionRects && sourceRect) {
      tl.to(transitionRabbit, {
        x: targetRect.left - sourceRect.left,
        y: targetRect.top - sourceRect.top,
        scaleX: targetRect.width / sourceRect.width,
        scaleY: targetRect.height / sourceRect.height,
        duration: 0.38,
        ease: 'power2.out',
        force3D: true,
      }, 0)
        .set(rabbit, { autoAlpha: 1 }, 0.38)
        .set(transitionRabbit, { autoAlpha: 0, visibility: 'hidden' }, 0.38)
    } else {
      tl.set(rabbit, { autoAlpha: 1 }, 0)
        .set(bunnyRef.current, { autoAlpha: 0, pointerEvents: 'none' }, 0)
    }

    tl.to(circle, { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'back.out(1.8)' }, 0.2)
      .to(triangle, {
        autoAlpha: 1,
        scale: 1,
        rotate: COMPACT_NAV_TRIANGLE_ROTATION,
        duration: 0.13,
        ease: 'back.out(2)',
      }, 0.25)
      .set(compact, { pointerEvents: 'auto' }, 0.38)
      .to(rabbit, { y: -4, duration: 0.06, ease: 'power2.out' }, 0.39)
      .to(rabbit, { y: 0, duration: 0.12, ease: 'back.out(1.8)' }, 0.45)
  }

  const hideCompactNavForHero = () => {
    const compact = compactNavRef.current
    const rabbit = compactNavRabbitRef.current
    if (!compact) {
      forceHideCompactNav()
      return
    }

    killCompactNavTimeline()
    resetCompactNavMagnet()
    compactNavStateRef.current = 'closed'
    setIsCompactNavVisible(false)
    setIsCompactNavExpanded(false)
    if (compactNavLinksRef.current) {
      gsap.set(compactNavLinksRef.current, { pointerEvents: 'none' })
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      forceHideCompactNav()
      return
    }

    const tl = gsap.timeline({
      defaults: { overwrite: true },
      onComplete: () => {
        compactNavTlRef.current = null
        forceHideCompactNav()
      },
    })
    compactNavTlRef.current = tl
    tl.to(compact, { autoAlpha: 0, y: 20, scale: 0.92, duration: 0.2, ease: 'power2.in' }, 0)
      .to(rabbit, { y: 8, duration: 0.16, ease: 'power2.in' }, 0)
      .to(bunnyRef.current, { autoAlpha: 1, pointerEvents: 'auto', duration: 0.2 }, 0.04)
  }

  const expandCompactNav = () => {
    const circle = compactNavCircleRef.current
    const triangle = compactNavTriangleRef.current
    const rabbit = compactNavRabbitRef.current
    const links = getCompactNavLinks()
    if (!circle || !triangle || !rabbit || !links.length) return
    if (!roadSignCollapsedRef.current) return
    if (compactNavStateRef.current === 'open' || compactNavStateRef.current === 'opening') return

    killCompactNavTimeline()
    compactNavStateRef.current = 'opening'
    setIsCompactNavExpanded(true)
    if (compactNavLinksRef.current) {
      gsap.set(compactNavLinksRef.current, { pointerEvents: 'auto' })
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        compactNavTlRef.current = null
        compactNavStateRef.current = 'open'
      },
    })
    compactNavTlRef.current = tl

    if (reducedMotion) {
      tl.set(circle, {
        autoAlpha: 1,
        width: COMPACT_NAV_CONTACT_WIDTH,
        height: 36,
        borderRadius: '18px',
      })
        .set(triangle, { autoAlpha: 0, scale: 0.4 })
        .set(links, { autoAlpha: 1, x: 0 })
        .set(rabbit, { x: 6 })
      return
    }

    tl.to(circle, {
        width: COMPACT_NAV_CONTACT_WIDTH,
        height: 36,
        scaleX: 1,
        scaleY: 1,
        duration: 0.39,
        ease: 'power3.inOut',
      }, 0)
      .set(circle, { borderRadius: '18px' }, 0.39)
      .to(triangle, { autoAlpha: 0, x: 8, scale: 0.35, duration: 0.14, ease: 'power2.in' }, 0)
      .to(rabbit, { x: 6, y: -6, scaleX: 1.04, scaleY: 0.96, duration: 0.16, ease: 'power2.out' }, 0.08)
      .to([...links].reverse(), {
        autoAlpha: 1,
        x: 0,
        duration: 0.24,
        stagger: 0.055,
        ease: 'back.out(1.35)',
      }, 0.13)
      .to(rabbit, { x: 6, y: 0, scaleX: 1, scaleY: 1, duration: 0.22, ease: 'back.out(2)' }, 0.31)
  }

  const collapseCompactNav = () => {
    const circle = compactNavCircleRef.current
    const triangle = compactNavTriangleRef.current
    const rabbit = compactNavRabbitRef.current
    const links = getCompactNavLinks()
    if (!circle || !triangle || !rabbit || !links.length) return
    if (compactNavStateRef.current === 'closed' || compactNavStateRef.current === 'closing') return

    killCompactNavTimeline()
    resetCompactNavMagnet(true)
    compactNavStateRef.current = 'closing'
    setIsCompactNavExpanded(false)
    if (compactNavLinksRef.current) {
      gsap.set(compactNavLinksRef.current, { pointerEvents: 'none' })
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        compactNavTlRef.current = null
        compactNavStateRef.current = 'closed'
      },
    })
    compactNavTlRef.current = tl

    if (reducedMotion) {
      tl.set(links, { autoAlpha: 0, x: 24 })
        .set(circle, {
          autoAlpha: 1,
          width: COMPACT_NAV_CIRCLE_SIZE,
          height: COMPACT_NAV_CIRCLE_SIZE,
          borderRadius: '999px',
        })
        .set(triangle, { autoAlpha: 1, x: 0, scale: 1 })
        .set(rabbit, { x: 0 })
      return
    }

    tl.set(circle, { borderRadius: '999px' }, 0)
      .to(links, {
        autoAlpha: 0,
        x: 0,
        duration: 0.12,
        stagger: 0.025,
        ease: 'power2.in',
      }, 0)
      .set(links, { x: 24 }, 0.2)
      .to(circle, {
        width: COMPACT_NAV_CIRCLE_SIZE,
        height: COMPACT_NAV_CIRCLE_SIZE,
        duration: 0.3,
        ease: 'power3.inOut',
      }, 0.2)
      .to(rabbit, { x: 0, y: 4, scaleX: 0.96, scaleY: 1.04, duration: 0.12, ease: 'power2.out' }, 0.2)
      .to(triangle, { autoAlpha: 1, x: 0, scale: 1, duration: 0.2, ease: 'back.out(2)' }, 0.37)
      .to(rabbit, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.2, ease: 'back.out(2)' }, 0.36)
  }

  const getRoadSignItems = () => {
    const links = navRef.current
      ? Array.from(navRef.current.querySelectorAll('a'))
      : []
    return [clockRef.current, ...links].filter(Boolean)
  }

  const collapseRoadSignItems = () => {
    if (roadSignStateRef.current === 'collapsed' || roadSignStateRef.current === 'collapsing') return
    killRoadSignItemsTimeline()
    roadSignStateRef.current = 'collapsing'
    setRoadSignCollapsedState(true)
    forceHideCompactNav()

    const items = getRoadSignItems()
    if (!items.length) {
      window.setTimeout(() => {
        if (roadSignStateRef.current !== 'collapsing') return
        roadSignStateRef.current = 'collapsed'
        showCompactNav()
      }, 0)
      return
    }
    const reversedItems = [...items].reverse()
    gsap.killTweensOf(items)
    const tl = gsap.timeline()
    roadSignItemsTlRef.current = tl
    reversedItems.forEach((item, index) => {
      tl.to(
        item,
        { x: '120vw', duration: 0.5, ease: 'back.in(1.2)' },
        index * 0.12
      )
    })
    tl.call(() => {
      requestAnimationFrame(() => {
        if (roadSignStateRef.current !== 'collapsing') return
        roadSignItemsTlRef.current = null
        roadSignStateRef.current = 'collapsed'
        showCompactNav()
      })
    })
  }

  const expandRoadSignItems = () => {
    if (roadSignStateRef.current === 'expanded' || roadSignStateRef.current === 'expanding') return
    killRoadSignItemsTimeline()
    roadSignStateRef.current = 'expanding'
    setRoadSignCollapsedState(false)
    hideCompactNavForHero()

    const items = getRoadSignItems()
    if (!items.length) {
      roadSignStateRef.current = 'expanded'
      return
    }
    if (roadSignSlideRef.current) {
      gsap.set(roadSignSlideRef.current, { x: 0 })
    }
    gsap.killTweensOf(items)
    gsap.set(items, {
      transition: 'none',
      willChange: 'transform',
      force3D: true,
    })
    roadSignItemsTlRef.current = gsap.to(items, {
      x: 0,
      duration: 0.78,
      stagger: 0.08,
      ease: 'back.out(1.2)',
      overwrite: true,
      onComplete: () => {
        requestAnimationFrame(() => {
          roadSignItemsTlRef.current = null
          gsap.set(items, {
            clearProps: 'transform,transition,willChange',
          })
          roadSignStateRef.current = 'expanded'
        })
      },
    })
  }

  const handleRoadSignScroll = () => {
    if (!roadSignReadyRef.current) return
    const isHomePath = window.location.pathname === '/'

    if (isHomePath) {
      const pastHero = window.scrollY > window.innerHeight * 0.35

      if (pastHero !== pastHeroRef.current) {
        pastHeroRef.current = pastHero

        if (pastHero) {
          if (!roadSignCollapsedRef.current) {
            collapseRoadSignItems()
          }
        } else {
          if (roadSignCollapsedRef.current) {
            expandRoadSignItems()
          }
        }
      }

      if (
        pastHero
        && roadSignCollapsedRef.current
        && roadSignStateRef.current === 'collapsed'
        && compactNavRef.current
      ) {
        const compactStyles = window.getComputedStyle(compactNavRef.current)
        const compactIsHidden = compactStyles.visibility === 'hidden'
          || Number(compactStyles.opacity) < 0.05
        if (compactIsHidden) {
          showCompactNav()
        }
      }
    }
  }

  useEffect(() => {
    handleRoadSignScrollRef.current = handleRoadSignScroll
    forceHideCompactNavRef.current = forceHideCompactNav
  })

  const handleCompactNavToggleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!usesSimpleNav && !roadSignCollapsedRef.current) return
    if (compactNavStateRef.current === 'arriving') return
    if (compactNavStateRef.current === 'open' || compactNavStateRef.current === 'opening') {
      rememberCompactNavExpanded(false)
      collapseCompactNav()
      return
    }
    rememberCompactNavExpanded(true)
    expandCompactNav()
  }

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') {
      requestHomeLoaderSkip()
      return
    }
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const isWorkDetailPath = pathname.startsWith('/works/')
    const usesCompactPageNav = pathname === '/works'
      || pathname === '/profile'
      || pathname === '/contact'
    const root = asideRef.current
    const compactNavEl = compactNavRef.current
    const roadSignSlideEl = roadSignSlideRef.current
    let scaleRaf: number | null = null

    try {
      const savedPreference = window.sessionStorage.getItem(COMPACT_NAV_STATE_STORAGE_KEY)
      if (savedPreference !== null) {
        compactNavUserExpandedRef.current = savedPreference === 'true'
      }
    } catch {
      // Continue with the in-memory preference when session storage is unavailable.
    }

    const updateNavigationScale = () => {
      root?.style.setProperty(
        '--road-sign-scale',
        String(getRoadSignScale(window.innerWidth, window.innerHeight))
      )
      compactNavEl?.style.setProperty(
        '--compact-nav-scale',
        String(getCompactNavScale(window.innerWidth))
      )
    }

    const onResize = () => {
      if (scaleRaf !== null) return
      scaleRaf = window.requestAnimationFrame(() => {
        scaleRaf = null
        updateNavigationScale()
      })
    }

    const cleanupNavigationScale = () => {
      window.removeEventListener('resize', onResize)
      if (scaleRaf !== null) {
        window.cancelAnimationFrame(scaleRaf)
        scaleRaf = null
      }
    }

    if (isWorkDetailPath) return

    if (usesCompactPageNav) {
      if (!compactNavEl) return

      forceHideCompactNavRef.current({ restoreHeroBunny: false, syncState: false })
      const circle = compactNavCircleRef.current
      const triangle = compactNavTriangleRef.current
      const rabbit = compactNavRabbitRef.current
      const links = compactNavLinksRef.current
        ? Array.from(compactNavLinksRef.current.querySelectorAll('a'))
        : []
      const restoreExpanded = compactNavUserExpandedRef.current
        && Boolean(circle && triangle && rabbit && links.length)

      setRoadSignCollapsedState(true)
      pastHeroRef.current = true
      roadSignStateRef.current = 'collapsed'
      setIsCompactNavVisible(true)

      if (restoreExpanded && circle && triangle && rabbit) {
        gsap.set(circle, {
          autoAlpha: 1,
          width: COMPACT_NAV_CONTACT_WIDTH,
          height: 36,
          borderRadius: '18px',
          scaleX: 1,
          scaleY: 1,
        })
        gsap.set(triangle, {
          autoAlpha: 0,
          x: 8,
          scale: 0.35,
        })
        gsap.set(links, {
          autoAlpha: 1,
          x: 0,
        })
        gsap.set(rabbit, {
          x: 6,
          y: 0,
          scaleX: 1,
          scaleY: 1,
        })
        compactNavStateRef.current = 'open'
        setIsCompactNavExpanded(true)
        compactNavLinksRef.current?.style.setProperty('pointer-events', 'auto')
      } else {
        compactNavStateRef.current = 'closed'
        setIsCompactNavExpanded(false)
      }

      gsap.set(compactNavEl, {
        autoAlpha: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
      })

      updateNavigationScale()
      window.addEventListener('resize', onResize, { passive: true })

      return () => {
        killCompactNavTimeline()
        forceHideCompactNavRef.current({ restoreHeroBunny: false, syncState: false })
        roadSignCollapsedRef.current = false
        cleanupNavigationScale()
      }
    }

    if (!root) return

    setRoadSignCollapsedState(false)
    pastHeroRef.current = false
    roadSignStateRef.current = 'expanded'
    forceHideCompactNavRef.current({ restoreHeroBunny: false })

    updateNavigationScale()
    window.addEventListener('resize', onResize, { passive: true })

    const startBunnyLoop = () => {
      bunnyLoopTlRef.current?.kill()
      bunnyLoopTlRef.current = null
    }
    startBunnyLoopRef.current = startBunnyLoop

    const runAnimation = () => {
      if (!root || !navRef.current) return

      const links = Array.from(navRef.current.querySelectorAll('a'))
      const items = [clockRef.current, ...links].filter(Boolean)

      bunnyReadyRef.current = false
      roadSignReadyRef.current = false
      roadSignStateRef.current = 'expanded'
      bunnyLoopTlRef.current?.kill()
      bunnyLoopTlRef.current = null
      gsap.killTweensOf(items)
      gsap.killTweensOf(bunnyRef.current)
      bunnyTlRef.current?.kill()

      gsap.set(root, { visibility: 'hidden' })

      gsap.set(items, {
        x: '120vw',
        transition: 'none',
      })

      if (bunnyRef.current) {
        const isMobile = window.matchMedia('(max-width: 768px)').matches
        gsap.set(bunnyRef.current, { opacity: 0, y: isMobile ? 22 : 34, scale: 0.92, rotate: -4 })
      }

      // force browser to commit the initial state before revealing
      root.getBoundingClientRect()

      gsap.set(root, { visibility: 'visible' })

      gsap.to(items, {
        x: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.3)',
        overwrite: true,
        onComplete: () => {
          gsap.set(items, { clearProps: 'transform' })
          requestAnimationFrame(() => {
            gsap.set(items, { clearProps: 'transition' })
          })
          roadSignReadyRef.current = true
          roadSignStateRef.current = 'expanded'
          handleRoadSignScrollRef.current()
        },
      })

      if (bunnyRef.current) {
        const isMobile = window.matchMedia('(max-width: 768px)').matches
        const popY = isMobile ? -10 : -18
        bunnyTlRef.current = gsap.timeline({ delay: 2.15 })
          .to(bunnyRef.current, { opacity: 1, y: popY, scale: 1.04, rotate: 2, duration: 0.28, ease: 'power2.out' })
          .to(bunnyRef.current, { y: 0, scale: 1, rotate: 0, duration: 0.38, ease: 'back.out(1.8)' })
        addBunnySquash(bunnyTlRef.current, bunnyRef.current, isMobile)
        bunnyTlRef.current.call(() => {
          bunnyReadyRef.current = true
          startBunnyLoopRef.current()
        })
      }
    }

    const isHome = window.location.pathname === '/'
    const shouldSkip = shouldSkipHomeLoader()

    const onScroll = () => {
      if (scrollRafRef.current !== null) return
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null
        handleRoadSignScrollRef.current()
      })
    }

    if (!isHome) {
      gsap.set(root, { visibility: 'visible' })
      bunnyReadyRef.current = true
      roadSignReadyRef.current = true
      roadSignStateRef.current = 'expanded'
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', onScroll)
        if (scrollRafRef.current !== null) {
          window.cancelAnimationFrame(scrollRafRef.current)
          scrollRafRef.current = null
        }
        killRoadSignItemsTimeline()
        killCompactNavTimeline()
        cleanupNavigationScale()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    // Returning home skips the loader but replays the original road-sign entrance.
    // First visit stays hidden until the loader signals homeReveal.
    const bunnyEl = bunnyRef.current
    if (shouldSkip) {
      runAnimation()
    } else {
      window.addEventListener('homeReveal', runAnimation, { once: true })
    }

    return () => {
      window.removeEventListener('homeReveal', runAnimation)
      window.removeEventListener('scroll', onScroll)
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current)
        scrollRafRef.current = null
      }
      bunnyTlRef.current?.kill()
      bunnyLoopTlRef.current?.kill()
      gsap.killTweensOf(bunnyEl)
      if (roadSignSlideEl) {
        gsap.killTweensOf(roadSignSlideEl)
      }
      forceHideCompactNavRef.current({ restoreHeroBunny: false, syncState: false })
      killRoadSignItemsTimeline()
      cleanupNavigationScale()
    }
  }, [pathname])

  if (isWorkDetailPage) {
    return null
  }

  return (
    <>
      {/* A viewport-level handoff prevents the road-sign and compact rabbits from overlapping. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={compactNavTransitionRabbitRef}
        className={styles.compactNavTransitionRabbit}
        src="/road-sign/clock-rabbit.svg"
        alt=""
        draggable={false}
        aria-hidden="true"
      />

      {!usesSimpleNav && (
        <aside ref={asideRef} className={styles.roadSign} aria-label="Main navigation">
          <div ref={roadSignSlideRef} className={styles.roadSignSlide}>
            <div className={styles.roadSignGroup}>
              {/* Layer 1: clock sign with live time overlay */}
              <RoadSignClock
                className={styles.clock}
                clockRef={clockRef}
                bunnyRef={bunnyRef}
                onBunnyPointerEnter={() => {
                  if (!bunnyReadyRef.current) return
                  playBunnySquash()
                }}
              />

              {/* Layer 2: nav signs */}
              <nav ref={navRef} className={styles.nav} aria-label="Primary navigation">
                <Link
                  className={`${styles.link} ${styles.linkHome}`}
                  href="/"
                  onClick={handleHomeClick}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={`${styles.img} ${styles.imgDefault}`} src="/road-sign/home-sign-default.svg" alt="" draggable={false} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={`${styles.img} ${styles.imgHover}`} src="/road-sign/home-sign-hover.svg" alt="" draggable={false} />
                  <span className={styles.srOnly}>HOME</span>
                </Link>

                <Link className={`${styles.link} ${styles.linkWorks}`} href="/works">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={`${styles.img} ${styles.imgDefault}`} src="/road-sign/works-sign-default.svg" alt="" draggable={false} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={`${styles.img} ${styles.imgHover}`} src="/road-sign/works-sign-hover.svg" alt="" draggable={false} />
                  <span className={styles.srOnly}>WORKS</span>
                </Link>

                <Link className={`${styles.link} ${styles.linkProfile}`} href="/profile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={`${styles.img} ${styles.imgDefault}`} src="/road-sign/profile-sign-default.svg" alt="" draggable={false} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={`${styles.img} ${styles.imgHover}`} src="/road-sign/profile-sign-hover.svg" alt="" draggable={false} />
                  <span className={styles.srOnly}>PROFILE</span>
                </Link>

                <Link className={`${styles.link} ${styles.linkContact}`} href="/contact">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={`${styles.img} ${styles.imgDefault}`} src="/road-sign/contact-sign-default.svg" alt="" draggable={false} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={`${styles.img} ${styles.imgHover}`} src="/road-sign/contact-sign-hover.svg" alt="" draggable={false} />
                  <span className={styles.srOnly}>CONTACT</span>
                </Link>
              </nav>
            </div>
          </div>
        </aside>
      )}

      <aside
        ref={compactNavRef}
        className={`${styles.compactNav} ${isCompactNavVisible ? styles.compactNavVisible : ''} ${isCompactNavExpanded ? styles.compactNavOpen : ''} ${pathname === '/contact' ? styles.compactNavContactActive : ''}`}
        aria-label="Compact main navigation"
        aria-hidden={!isCompactNavVisible || (!usesSimpleNav && !isRoadSignCollapsed)}
      >
        <div ref={compactNavTravelRef} className={styles.compactNavTravel}>
          <div ref={compactNavStageRef} className={styles.compactNavStage}>
            <div ref={compactNavCircleRef} className={styles.compactNavMorphShape} aria-hidden="true" />
            <span ref={compactNavTriangleRef} className={styles.compactNavTriangle} aria-hidden="true" />

            <nav
              id="compact-home-navigation"
              ref={compactNavLinksRef}
              className={styles.compactNavLinks}
              aria-label="Primary navigation"
              aria-hidden={!isCompactNavExpanded}
              onPointerLeave={releaseCompactNavMagnet}
            >
              {SIMPLE_NAV_ITEMS.map((item, index) => {
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    className={`${styles.compactNavLink} ${item.href === '/contact' ? styles.compactNavLinkContact : ''} ${isActive ? styles.compactNavLinkActive : ''}`}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={isCompactNavExpanded ? undefined : -1}
                    onClick={item.href === '/' ? handleHomeClick : undefined}
                    onPointerEnter={() => playCompactNavMagnet(index)}
                    onFocus={() => playCompactNavMagnet(index)}
                  >
                    <span className={styles.compactNavPill} aria-hidden="true" />
                    <span className={styles.compactNavLabel}>{item.label}</span>
                    {index < SIMPLE_NAV_ITEMS.length - 1 && (
                      <span className={styles.compactNavTether} aria-hidden="true" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={compactNavRabbitRef}
              className={styles.compactNavRabbit}
              src="/road-sign/clock-rabbit.svg"
              alt=""
              draggable={false}
              aria-hidden="true"
            />

            <button
              type="button"
              className={styles.compactNavToggle}
              onClick={handleCompactNavToggleClick}
              onPointerEnter={playCompactNavRabbitBounce}
              aria-controls="compact-home-navigation"
              aria-expanded={isCompactNavExpanded}
              aria-label={isCompactNavExpanded ? 'Close compact navigation' : 'Open compact navigation'}
              tabIndex={isCompactNavVisible ? 0 : -1}
            />
          </div>
        </div>
      </aside>
    </>
  )
}
