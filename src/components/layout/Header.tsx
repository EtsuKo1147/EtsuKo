'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent } from 'react'
import gsap from 'gsap'
import styles from './RoadSign.module.css'
import RoadSignClock from './RoadSignClock'

export default function Header() {
  const pathname = usePathname()
  const asideRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const clockRef = useRef<HTMLDivElement>(null)
  const bunnyRef = useRef<HTMLDivElement>(null)
  const bunnyTlRef = useRef<gsap.core.Timeline | null>(null)
  const bunnyLoopTlRef = useRef<gsap.core.Timeline | null>(null)
  const bunnyReadyRef = useRef(false)
  const startBunnyLoopRef = useRef<() => void>(() => {})

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
    const tl = gsap.timeline({ onComplete: () => startBunnyLoopRef.current() })
    addBunnySquash(tl, bunny, isMobile)
  }

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') {
      sessionStorage.setItem('skipHomeLoader', '1')
      return
    }
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const root = asideRef.current
    if (!root) return

    const startBunnyLoop = () => {
      const bunny = bunnyRef.current
      if (!bunny || window.location.pathname !== '/') return
      const isMobile = window.matchMedia('(max-width: 768px)').matches
      bunnyLoopTlRef.current?.kill()
      bunnyLoopTlRef.current = gsap.timeline({ repeat: -1, repeatDelay: 2.08, delay: 4.5 })
      addBunnySquash(bunnyLoopTlRef.current, bunny, isMobile)
    }
    startBunnyLoopRef.current = startBunnyLoop

    const runAnimation = () => {
      if (!root || !navRef.current) return

      const links = Array.from(navRef.current.querySelectorAll('a'))
      const items = [clockRef.current, ...links].filter(Boolean)

      bunnyReadyRef.current = false
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
      root.offsetHeight

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
    const shouldSkip = sessionStorage.getItem('skipHomeLoader') === '1'

    if (!isHome) {
      gsap.set(root, { visibility: 'visible' })
      bunnyReadyRef.current = true
      return
    }

    if (shouldSkip) {
      gsap.set(root, { visibility: 'visible' })
      bunnyReadyRef.current = true
      return
    }

    // First visit to home: stay hidden until loader signals homeReveal
    const bunnyEl = bunnyRef.current
    window.addEventListener('homeReveal', runAnimation, { once: true })
    return () => {
      window.removeEventListener('homeReveal', runAnimation)
      bunnyTlRef.current?.kill()
      bunnyLoopTlRef.current?.kill()
      gsap.killTweensOf(bunnyEl)
    }
  }, [])

  return (
    <aside ref={asideRef} className={styles.roadSign} aria-label="Main navigation">
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

        <Link className={`${styles.link} ${styles.linkProfile}`} href="/about">
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
    </aside>
  )
}
