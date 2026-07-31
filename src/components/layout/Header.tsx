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
const COMPACT_NAV_TRIANGLE_ROTATION = -22
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
  const compactNavLinksRef = useRef<HTMLElement>(null)
  const compactNavTlRef = useRef<gsap.core.Timeline | null>(null)
  const compactNavStateRef = useRef<CompactNavState>('closed')
  const compactNavActiveIndexRef = useRef<number | null>(null)
  const [isRoadSignCollapsed, setIsRoadSignCollapsed] = useState(false)
  const [isCompactNavVisible, setIsCompactNavVisible] = useState(false)
  const [isCompactNavExpanded, setIsCompactNavExpanded] = useState(false)

  const canUseHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const killRoadSignItemsTimeline = () => {
    roadSignItemsTlRef.current?.kill()
    roadSignItemsTlRef.current = null
  }

  const addBunnySquash = (tl: gsap.core.Timeline, bunny: HTMLDivElement, isMobile: boolean) => {
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

  const setRoadSignCollapsedState = (next: boolean) => {
    roadSignCollapsedRef.current = next
    setIsRoadSignCollapsed(next)
  }

  const getCompactNavLinks = () => compactNavLinksRef.current
    ? Array.from(compactNavLinksRef.current.querySelectorAll('a'))
    : []

  const getCompactNavPills = () => compactNavLinksRef.current
    ? Array.from(compactNavLinksRef.current.querySelectorAll(`.${styles.compactNavPill}`))
    : []

  const getCompactNavTethers = () => compactNavLinksRef.current
    ? Array.from(compactNavLinksRef.current.querySelectorAll(`.${styles.compactNavTether}`))
    : []

  const killCompactNavTimeline = () => {
    compactNavTlRef.current?.kill()
    compactNavTlRef.current = null
  }

  const resetCompactNavMagnet = () => {
    const pills = getCompactNavPills()
    const tethers = getCompactNavTethers()
    compactNavActiveIndexRef.current = null
    gsap.killTweensOf([...pills, ...tethers])
    gsap.to(pills, {
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

    const pills = getCompactNavPills()
    const tethers = getCompactNavTethers()
    const activePill = pills[activeIndex]
    if (!activePill) return

    compactNavActiveIndexRef.current = activeIndex
    gsap.killTweensOf([...pills, ...tethers])
    gsap.to(tethers, { autoAlpha: 0, scaleX: 0, duration: 0.08, overwrite: true })

    pills.forEach((pill, index) => {
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

    if (previousIndex === null || !pills[previousIndex]) {
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
    const previousPill = pills[previousIndex]
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
    const pills = getCompactNavPills()
    const tethers = getCompactNavTethers()
    const activePill = activeIndex === null ? null : pills[activeIndex]
    const activeLink = activeIndex === null ? null : getCompactNavLinks()[activeIndex]
    compactNavActiveIndexRef.current = null

    gsap.killTweensOf([...pills, ...tethers])
    gsap.to(tethers, {
      autoAlpha: 0,
      scaleX: 0,
      duration: 0.12,
      ease: 'power2.in',
      overwrite: true,
    })
    pills.forEach((pill, index) => {
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
        borderRadius: '50%',
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
    if (!compact || !travel || !circle || !triangle || !rabbit) return
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
    const startX = sourceRect
      ? sourceRect.left + sourceRect.width / 2 - (targetRect.left + targetRect.width / 2)
      : 64
    const startY = sourceRect
      ? sourceRect.top + sourceRect.height / 2 - (targetRect.top + targetRect.height / 2)
      : -120
    const startRabbitScale = sourceRect && targetRect.width > 0
      ? sourceRect.width / targetRect.width
      : 1.16
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.set(compact, {
      x: 0,
      y: 0,
      autoAlpha: 1,
      visibility: 'visible',
      pointerEvents: 'none',
    })
    gsap.set(travel, { x: startX, y: startY })
    gsap.set(circle, { autoAlpha: 0, scale: 0.18 })
    gsap.set(triangle, {
      autoAlpha: 0,
      scale: 0.18,
      rotate: COMPACT_NAV_TRIANGLE_ROTATION - 16,
    })
    gsap.set(rabbit, { autoAlpha: 1, visibility: 'visible', scale: startRabbitScale })

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
        .set(bunnyRef.current, { autoAlpha: 0, pointerEvents: 'none' })
      return
    }

    tl.to(rabbit, { scale: 1, duration: 0.5, ease: 'power3.inOut' }, 0)
      .to(bunnyRef.current, { autoAlpha: 0, pointerEvents: 'none', duration: 0.12 }, 0)
      .to(circle, { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'back.out(2.1)' }, 0.04)
      .to(triangle, {
        autoAlpha: 1,
        scale: 1,
        rotate: COMPACT_NAV_TRIANGLE_ROTATION,
        duration: 0.22,
        ease: 'back.out(2)',
      }, 0.14)
      .to(travel, { x: 0, y: 0, duration: 0.56, ease: 'power3.inOut' }, 0.14)
      .set(compact, { pointerEvents: 'auto' })
      .to(rabbit, { y: -5, duration: 0.1, ease: 'power2.out' }, 0.58)
      .to(rabbit, { y: 0, duration: 0.2, ease: 'back.out(2)' }, 0.68)
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
        width: COMPACT_NAV_CONTACT_WIDTH,
        height: 36,
        borderRadius: 18,
      })
        .set(triangle, { autoAlpha: 0, scale: 0.4 })
        .set(links, { autoAlpha: 1, x: 0 })
        .set(circle, { autoAlpha: 0 })
      return
    }

    tl.to(circle, { scaleX: 0.9, scaleY: 0.82, duration: 0.08, ease: 'power2.in' }, 0)
      .to(circle, {
        width: COMPACT_NAV_CONTACT_WIDTH,
        height: 36,
        borderRadius: 18,
        scaleX: 1,
        scaleY: 1,
        duration: 0.32,
        ease: 'power3.inOut',
      }, 0.07)
      .to(triangle, { autoAlpha: 0, x: 8, scale: 0.35, duration: 0.14, ease: 'power2.in' }, 0)
      .to(rabbit, { y: -6, scaleX: 1.04, scaleY: 0.96, duration: 0.16, ease: 'power2.out' }, 0.08)
      .to([...links].reverse(), {
        autoAlpha: 1,
        x: 0,
        duration: 0.24,
        stagger: 0.055,
        ease: 'back.out(1.35)',
      }, 0.13)
      .to(circle, { autoAlpha: 0, duration: 0.12, ease: 'power1.out' }, 0.39)
      .to(rabbit, { y: 0, scaleX: 1, scaleY: 1, duration: 0.22, ease: 'back.out(2)' }, 0.31)
  }

  const collapseCompactNav = () => {
    const circle = compactNavCircleRef.current
    const triangle = compactNavTriangleRef.current
    const rabbit = compactNavRabbitRef.current
    const links = getCompactNavLinks()
    if (!circle || !triangle || !rabbit || !links.length) return
    if (compactNavStateRef.current === 'closed' || compactNavStateRef.current === 'closing') return

    killCompactNavTimeline()
    resetCompactNavMagnet()
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
          borderRadius: '50%',
        })
        .set(triangle, { autoAlpha: 1, x: 0, scale: 1 })
      return
    }

    tl.set(circle, { autoAlpha: 1 }, 0)
      .to(links, {
      autoAlpha: 0,
      x: 24,
      duration: 0.16,
      stagger: 0.035,
      ease: 'power2.in',
    }, 0)
      .to(circle, {
        width: COMPACT_NAV_CIRCLE_SIZE,
        height: COMPACT_NAV_CIRCLE_SIZE,
        borderRadius: '50%',
        duration: 0.3,
        ease: 'power3.inOut',
      }, 0.08)
      .to(rabbit, { y: 4, scaleX: 0.96, scaleY: 1.04, duration: 0.12, ease: 'power2.out' }, 0.08)
      .to(triangle, { autoAlpha: 1, x: 0, scale: 1, duration: 0.2, ease: 'back.out(2)' }, 0.25)
      .to(rabbit, { y: 0, scaleX: 1, scaleY: 1, duration: 0.2, ease: 'back.out(2)' }, 0.24)
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
    if (!roadSignCollapsedRef.current) return
    if (compactNavStateRef.current === 'arriving') return
    if (compactNavStateRef.current === 'open' || compactNavStateRef.current === 'opening') {
      collapseCompactNav()
      return
    }
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
    const root = asideRef.current
    if (!root) return
    const compactNavEl = compactNavRef.current
    const roadSignSlideEl = roadSignSlideRef.current
    let scaleRaf: number | null = null

    setRoadSignCollapsedState(false)
    pastHeroRef.current = false
    roadSignStateRef.current = 'expanded'
    forceHideCompactNavRef.current({ restoreHeroBunny: false })

    const updateNavigationScale = () => {
      root.style.setProperty(
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

  if (usesSimpleNav) {
    const activeHref = pathname.startsWith('/works') ? '/works' : pathname

    return (
      <aside className={styles.simplePageNav} aria-label="Main navigation">
        <nav className={styles.simplePageNavList}>
          {SIMPLE_NAV_ITEMS.map((item) => {
            const isActive = activeHref === item.href

            return (
              <Link
                key={item.href}
                className={`${styles.simplePageNavLink} ${isActive ? styles.simplePageNavLinkActive : ''}`}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={item.href === '/' ? handleHomeClick : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    )
  }

  return (
    <>
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

      <aside
        ref={compactNavRef}
        className={`${styles.compactNav} ${isCompactNavVisible ? styles.compactNavVisible : ''} ${isCompactNavExpanded ? styles.compactNavOpen : ''}`}
        aria-label="Compact main navigation"
        aria-hidden={!isRoadSignCollapsed || !isCompactNavVisible}
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
              {SIMPLE_NAV_ITEMS.map((item, index) => (
                <Link
                  key={item.href}
                  className={`${styles.compactNavLink} ${item.href === '/contact' ? styles.compactNavLinkContact : ''}`}
                  href={item.href}
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
              ))}
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
