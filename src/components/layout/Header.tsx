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

    const runAnimation = () => {
      if (!root || !navRef.current) return

      const links = Array.from(navRef.current.querySelectorAll('a'))

      gsap.killTweensOf(links)

      gsap.set(root, { visibility: 'hidden' })

      gsap.set(links, {
        x: '120vw',
        transition: 'none',
      })

      // force browser to commit the initial state before revealing
      root.offsetHeight

      gsap.set(root, { visibility: 'visible' })

      gsap.to(links, {
        x: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.3)',
        overwrite: true,
        onComplete: () => {
          gsap.set(links, { clearProps: 'transform' })
          requestAnimationFrame(() => {
            gsap.set(links, { clearProps: 'transition' })
          })
        },
      })
    }

    const isHome = window.location.pathname === '/'
    const shouldSkip = sessionStorage.getItem('skipHomeLoader') === '1'

    if (!isHome) {
      gsap.set(root, { visibility: 'visible' })
      return
    }

    if (shouldSkip) {
      gsap.set(root, { visibility: 'visible' })
      return
    }

    // First visit to home: stay hidden until loader signals homeReveal
    window.addEventListener('homeReveal', runAnimation, { once: true })
    return () => window.removeEventListener('homeReveal', runAnimation)
  }, [])

  return (
    <aside ref={asideRef} className={styles.roadSign} aria-label="Main navigation">

      {/* Layer 1: clock sign with live time overlay */}
      <RoadSignClock className={styles.clock} />

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
    </aside>
  )
}
