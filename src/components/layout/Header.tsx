'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent } from 'react'
import gsap from 'gsap'
import {
  requestHomeLoaderSkip,
  shouldSkipHomeLoader,
} from '@/components/animation/homeLoaderSession'
import styles from './RoadSign.module.css'
import RoadSignClock from './RoadSignClock'

type RoadSignState = 'collapsed' | 'expanding' | 'expanded' | 'collapsing'
type CollapseControlOptions = {
  autoHide?: boolean
}

const ROAD_SIGN_DESIGN_HEIGHT = 750
const ROAD_SIGN_DESIGN_WIDTH = 760
const ROAD_SIGN_BASE_WIDTH = 1920
const ROAD_SIGN_BASE_SCALE = 1.45
const ROAD_SIGN_MAX_SCALE = 1.45
const ROAD_SIGN_MOBILE_SCALE = 0.55
const ROAD_SIGN_SAFE_LEFT_MARGIN = 24
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

export default function Header() {
  const pathname = usePathname()
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
  const compactToggleRef = useRef<HTMLButtonElement>(null)
  const roadSignCollapsedRef = useRef(false)
  const pastHeroRef = useRef(false)
  const scrollRafRef = useRef<number | null>(null)
  const roadSignGroupRef = useRef<HTMLDivElement>(null)
  const collapseControlRef = useRef<HTMLButtonElement>(null)
  const collapseControlTimerRef = useRef<number | null>(null)
  const roadSignItemsTlRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null)
  const roadSignStateRef = useRef<RoadSignState>('expanded')
  const showCollapseControlRef = useRef<(options?: CollapseControlOptions) => void>(() => {})
  const handleRoadSignScrollRef = useRef<() => void>(() => {})
  const [isRoadSignCollapsed, setIsRoadSignCollapsed] = useState(false)

  const canUseHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const clearCollapseControlTimer = () => {
    if (collapseControlTimerRef.current === null) return
    window.clearTimeout(collapseControlTimerRef.current)
    collapseControlTimerRef.current = null
  }

  const killRoadSignItemsTimeline = () => {
    roadSignItemsTlRef.current?.kill()
    roadSignItemsTlRef.current = null
  }

  const forceHideCollapseControl = () => {
    const control = collapseControlRef.current
    clearCollapseControlTimer()
    if (!control) return
    gsap.killTweensOf(control)
    gsap.set(control, {
      autoAlpha: 0,
      visibility: 'hidden',
      opacity: 0,
      y: -8,
      scaleX: 0.98,
      scaleY: 0.08,
      pointerEvents: 'none',
    })
  }

  const forceHideCompactToggle = () => {
    const compact = compactToggleRef.current
    if (!compact) return
    gsap.killTweensOf(compact)
    gsap.set(compact, {
      autoAlpha: 0,
      visibility: 'hidden',
      opacity: 0,
      scale: 0.22,
      x: 10,
      y: 86,
      rotate: -14,
      pointerEvents: 'none',
    })
  }

  const hideCollapseControl = () => {
    const control = collapseControlRef.current
    clearCollapseControlTimer()
    if (!control) return
    gsap.killTweensOf(control)
    gsap.to(control, {
      autoAlpha: 0,
      y: -8,
      scaleX: 0.98,
      scaleY: 0.08,
      duration: 0.14,
      ease: 'power2.in',
      pointerEvents: 'none',
      overwrite: true,
    })
  }

  const showCollapseControl = ({ autoHide = false }: CollapseControlOptions = {}) => {
    const control = collapseControlRef.current
    if (!control) return
    if (!roadSignReadyRef.current) return
    if (roadSignStateRef.current !== 'expanded') return

    clearCollapseControlTimer()
    const isVisible = window.getComputedStyle(control).visibility !== 'hidden'
      && Number(gsap.getProperty(control, 'opacity')) > 0.85
      && Number(gsap.getProperty(control, 'scaleY')) > 0.95
    if (isVisible) {
      gsap.set(control, { pointerEvents: 'auto' })
      if (autoHide && canUseHover()) {
        collapseControlTimerRef.current = window.setTimeout(() => {
          hideCollapseControl()
        }, 1300)
      }
      return
    }

    gsap.killTweensOf(control)
    gsap.set(control, {
      transformOrigin: '50% 0%',
      autoAlpha: 1,
      visibility: 'visible',
      opacity: 0.35,
      y: -8,
      scaleX: 0.98,
      scaleY: 0.08,
      pointerEvents: 'auto',
    })
    gsap.to(control, {
      opacity: 1,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.18,
      ease: 'back.out(1.4)',
      pointerEvents: 'auto',
      overwrite: true,
    })

    if (autoHide && canUseHover()) {
      collapseControlTimerRef.current = window.setTimeout(() => {
        hideCollapseControl()
      }, 1300)
    }
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

  const showCompactToggle = () => {
    const compact = compactToggleRef.current
    if (!compact) return
    if (roadSignStateRef.current !== 'collapsed') {
      forceHideCompactToggle()
      return
    }
    gsap.killTweensOf(compact)
    gsap.set(compact, {
      transformOrigin: '18% 8%',
      autoAlpha: 1,
      visibility: 'visible',
      opacity: 1,
      scale: 0.22,
      x: 10,
      y: 86,
      rotate: -14,
      pointerEvents: 'auto',
    })
    gsap.timeline({ defaults: { overwrite: true } })
      .to(compact, { x: 18, y: 94, rotate: 4, scale: 1.16, duration: 0.18, ease: 'back.out(3)' })
      .to(compact, { x: 15, y: 91, rotate: -2, scale: 0.9, duration: 0.08, ease: 'power1.inOut' })
      .to(compact, { x: 17, y: 93, rotate: 2, scale: 1.07, duration: 0.08, ease: 'power1.inOut' })
      .to(compact, { x: 16, y: 92, rotate: 0, scale: 1, duration: 0.11, ease: 'back.out(2)', pointerEvents: 'auto' })
  }

  const setRoadSignCollapsedState = (next: boolean) => {
    roadSignCollapsedRef.current = next
    setIsRoadSignCollapsed(next)
  }

  const playCompactHoverWobble = () => {
    const compact = compactToggleRef.current
    if (!compact) return
    if (!roadSignReadyRef.current) return
    if (!roadSignCollapsedRef.current) return
    playBunnySquash()
    gsap.killTweensOf(compact)
    gsap.set(compact, { transformOrigin: '18% 8%' })
    gsap.to(compact, {
      x: 14,
      y: 88,
      rotate: -1,
      scale: 0.94,
      duration: 0.14,
      ease: 'power2.out',
      overwrite: true,
    })
  }

  const resetCompactHoverState = () => {
    const compact = compactToggleRef.current
    if (!compact) return
    if (!roadSignReadyRef.current) return
    if (!roadSignCollapsedRef.current) return
    gsap.killTweensOf(compact)
    gsap.set(compact, { transformOrigin: '18% 8%' })
    gsap.to(compact, {
      x: 16,
      y: 92,
      rotate: 0,
      scale: 1,
      duration: 0.16,
      ease: 'back.out(1.6)',
      pointerEvents: 'auto',
      overwrite: true,
    })
  }

  const getRoadSignItems = () => {
    const links = navRef.current
      ? Array.from(navRef.current.querySelectorAll('a'))
      : []
    return [clockRef.current, ...links].filter(Boolean)
  }

  const collapseRoadSignItems = ({ controlExitDelay = 0 } = {}) => {
    if (roadSignStateRef.current === 'collapsed' || roadSignStateRef.current === 'collapsing') return
    killRoadSignItemsTimeline()
    roadSignStateRef.current = 'collapsing'
    setRoadSignCollapsedState(true)
    forceHideCollapseControl()
    forceHideCompactToggle()

    const items = getRoadSignItems()
    if (!items.length) {
      window.setTimeout(() => {
        if (roadSignStateRef.current !== 'collapsing') return
        roadSignStateRef.current = 'collapsed'
        showCompactToggle()
      }, controlExitDelay * 1000)
      return
    }
    const reversedItems = [...items].reverse()
    gsap.killTweensOf(items)
    const tl = gsap.timeline({ delay: controlExitDelay })
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
        showCompactToggle()
      })
    })
  }

  const expandRoadSignItems = () => {
    if (roadSignStateRef.current === 'expanded' || roadSignStateRef.current === 'expanding') return
    killRoadSignItemsTimeline()
    roadSignStateRef.current = 'expanding'
    setRoadSignCollapsedState(false)
    forceHideCollapseControl()
    forceHideCompactToggle()

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
          showCollapseControl({ autoHide: canUseHover() })
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
    }

    if (!canUseHover() && roadSignStateRef.current === 'expanded') {
      showCollapseControl()
    }
  }

  useEffect(() => {
    showCollapseControlRef.current = showCollapseControl
    handleRoadSignScrollRef.current = handleRoadSignScroll
  })

  const handleRoadSignPointerEnter = () => {
    if (!roadSignReadyRef.current) return
    if (!canUseHover()) return
    showCollapseControl()
  }

  const handleRoadSignPointerLeave = () => {
    if (!roadSignReadyRef.current) return
    if (!canUseHover()) return
    hideCollapseControl()
  }

  const handleCompactToggleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!roadSignCollapsedRef.current) return
    expandRoadSignItems()
  }

  const handleCollapseControlClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    clearCollapseControlTimer()
    if (!roadSignReadyRef.current) return
    if (roadSignStateRef.current !== 'expanded') return
    collapseRoadSignItems({ controlExitDelay: 0.14 })
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
    const compactEl = compactToggleRef.current
    const collapseControlEl = collapseControlRef.current
    const roadSignSlideEl = roadSignSlideRef.current
    let scaleRaf: number | null = null

    const updateRoadSignScale = () => {
      root.style.setProperty(
        '--road-sign-scale',
        String(getRoadSignScale(window.innerWidth, window.innerHeight))
      )
    }

    const onResize = () => {
      if (scaleRaf !== null) return
      scaleRaf = window.requestAnimationFrame(() => {
        scaleRaf = null
        updateRoadSignScale()
      })
    }

    const cleanupRoadSignScale = () => {
      window.removeEventListener('resize', onResize)
      if (scaleRaf !== null) {
        window.cancelAnimationFrame(scaleRaf)
        scaleRaf = null
      }
    }

    updateRoadSignScale()
    window.addEventListener('resize', onResize, { passive: true })

    if (compactEl && !roadSignCollapsedRef.current) {
      gsap.set(compactEl, {
        autoAlpha: 0,
        scale: 0.22,
        x: 10,
        y: 86,
        rotate: -14,
        pointerEvents: 'none',
      })
    }

    if (collapseControlEl) {
      gsap.set(collapseControlEl, {
        autoAlpha: 0,
        y: -8,
        scaleX: 0.98,
        scaleY: 0.08,
        pointerEvents: 'none',
      })
    }

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
      if (!canUseHover()) {
        showCollapseControlRef.current()
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', onScroll)
        if (scrollRafRef.current !== null) {
          window.cancelAnimationFrame(scrollRafRef.current)
          scrollRafRef.current = null
        }
        if (compactEl) {
          gsap.killTweensOf(compactEl)
        }
        if (collapseControlEl) {
          gsap.killTweensOf(collapseControlEl)
        }
        killRoadSignItemsTimeline()
        cleanupRoadSignScale()
        clearCollapseControlTimer()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    if (shouldSkip) {
      gsap.set(root, { visibility: 'visible' })
      bunnyReadyRef.current = true
      roadSignReadyRef.current = true
      roadSignStateRef.current = 'expanded'
      handleRoadSignScrollRef.current()
      return () => {
        window.removeEventListener('scroll', onScroll)
        if (scrollRafRef.current !== null) {
          window.cancelAnimationFrame(scrollRafRef.current)
          scrollRafRef.current = null
        }
        if (compactEl) {
          gsap.killTweensOf(compactEl)
        }
        if (collapseControlEl) {
          gsap.killTweensOf(collapseControlEl)
        }
        killRoadSignItemsTimeline()
        cleanupRoadSignScale()
        clearCollapseControlTimer()
      }
    }

    // First visit to home: stay hidden until loader signals homeReveal
    const bunnyEl = bunnyRef.current
    window.addEventListener('homeReveal', runAnimation, { once: true })
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
      if (compactEl) {
        gsap.killTweensOf(compactEl)
      }
      if (collapseControlEl) {
        gsap.killTweensOf(collapseControlEl)
      }
      killRoadSignItemsTimeline()
      cleanupRoadSignScale()
      clearCollapseControlTimer()
    }
  }, [])

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
    <aside ref={asideRef} className={styles.roadSign} aria-label="Main navigation">
      <div ref={roadSignSlideRef} className={styles.roadSignSlide}>
      <div
        ref={roadSignGroupRef}
        className={styles.roadSignGroup}
        onPointerEnter={handleRoadSignPointerEnter}
        onPointerLeave={handleRoadSignPointerLeave}
      >

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

        <button
          ref={compactToggleRef}
          type="button"
          className={styles.compactToggle}
          onClick={handleCompactToggleClick}
          onPointerEnter={playCompactHoverWobble}
          onPointerLeave={resetCompactHoverState}
          aria-label={isRoadSignCollapsed ? 'Open road sign navigation' : 'Close road sign navigation'}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.compactButton}
            src="/road-sign/compact/compact-toggle-base.svg"
            alt=""
            draggable={false}
          />
        </button>

        <button
          ref={collapseControlRef}
          type="button"
          className={styles.collapseControl}
          onClick={handleCollapseControlClick}
          aria-label="Collapse road sign navigation"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.collapseControlIcon}
            src="/road-sign/collapse-control.svg"
            alt=""
            draggable={false}
          />
        </button>
      </div>
      </div>
    </aside>
  )
}
