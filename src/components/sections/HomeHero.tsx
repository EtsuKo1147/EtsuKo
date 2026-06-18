'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import styles from './HomeHero.module.css'

type HomeHeroProps = { revealed?: boolean }

const PROFILE_TITLE = '> Profile'
const PROFILE_COPY =
  'A visual designer interested in web design, graphic design, illustration and photography. Currently exploring AI-assisted workflows in design, creating bold, playful visuals and interactive works.'
const PROFILE_TYPEWRITER_GAP = 1
const PROFILE_TYPEWRITER_TOTAL =
  PROFILE_TITLE.length + PROFILE_TYPEWRITER_GAP + PROFILE_COPY.length

export default function HomeHero({ revealed = false }: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const frameGroupRef = useRef<HTMLDivElement>(null)
  const motorcycleIntroRef = useRef<HTMLDivElement>(null)
  const arrowBeltRef  = useRef<HTMLDivElement>(null)
  const [profileCharCount, setProfileCharCount] = useState(0)

  const titleCharCount = Math.min(profileCharCount, PROFILE_TITLE.length)
  const copyCharCount = Math.max(
    0,
    Math.min(PROFILE_COPY.length, profileCharCount - PROFILE_TITLE.length - PROFILE_TYPEWRITER_GAP)
  )
  const displayedProfileTitle = PROFILE_TITLE.slice(0, titleCharCount)
  const displayedProfileCopy = PROFILE_COPY.slice(0, copyCharCount)
  const showProfileCaret = profileCharCount > 0
  const showTitleCaret =
    showProfileCaret && profileCharCount <= PROFILE_TITLE.length + PROFILE_TYPEWRITER_GAP
  const showCopyCaret = showProfileCaret && !showTitleCaret

  // Set hidden start positions only on first visit (loader is covering the screen)
  useEffect(() => {
    if (revealed) return
    gsap.set(frameGroupRef.current, { y: '-110%' })
    gsap.set(motorcycleIntroRef.current, { x: '-60%', y: '-80%' })
  }, [revealed])

  // Run entrance animation only when revealed becomes true
  useEffect(() => {
    if (!revealed) return
    const frameGroup = frameGroupRef.current
    const motorcycleIntro = motorcycleIntroRef.current
    const arrowBelt = arrowBeltRef.current

    gsap.fromTo(
      frameGroup,
      { y: '-130%' },
      { y: 0, delay: -0.3, duration: 2.0, ease: 'power3.out' }
    )

    gsap.fromTo(
      motorcycleIntro,
      { x: '-100vw', y: '-60vh' },
      { x: 0, y: 0, duration: 1.5, delay: 0, ease: 'power3.out' }
    )

    gsap.fromTo(
      arrowBelt,
      { x: '-120vw' },
      { x: 0, duration: 1.5, delay: 0.4, ease: 'power3.out' }
    )

    return () => {
      gsap.killTweensOf([frameGroup, motorcycleIntro, arrowBelt])
    }
  }, [revealed])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    let frame = 0

    const updateScrollProgress = () => {
      frame = 0
      const rect = hero.getBoundingClientRect()
      const travel = Math.max(hero.offsetHeight - window.innerHeight, 1)
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1)
      const profileProgress = Math.min(Math.max((progress - 0.34) / 0.36, 0), 1)
      const isMobile = window.matchMedia('(max-width: 768px)').matches
      const motorX = progress * window.innerWidth * (isMobile ? 0.44 : 0.52)
      const motorY = progress * window.innerHeight * (isMobile ? 0.7 : 0.88)
      const motorRotate = progress * 2
      const profileOffset = (1 - profileProgress) * 18
      const nextProfileCharCount = Math.round(profileProgress * PROFILE_TYPEWRITER_TOTAL)

      hero.style.setProperty('--hero-scroll-progress', progress.toFixed(3))
      hero.style.setProperty('--profile-reveal-progress', profileProgress.toFixed(3))
      hero.style.setProperty('--motor-x', `${motorX.toFixed(1)}px`)
      hero.style.setProperty('--motor-y', `${motorY.toFixed(1)}px`)
      hero.style.setProperty('--motor-rotate', `${motorRotate.toFixed(2)}deg`)
      hero.style.setProperty('--profile-offset', `${profileOffset.toFixed(1)}px`)
      setProfileCharCount((current) =>
        current === nextProfileCharCount ? current : nextProfileCharCount
      )
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateScrollProgress)
    }

    updateScrollProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.brandVertical}>ETSU.</div>

      <div className={`${styles.visualStage}${revealed ? ` ${styles.revealed}` : ''}`}>
        <div ref={frameGroupRef} className={styles.frameGroup}>
          <div className={styles.frameMask} aria-hidden="true">
            <div className={styles.lineSprite}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/line-1.svg" alt="" className={styles.lineFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/line-2.svg" alt="" className={styles.lineFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/line-3.svg" alt="" className={styles.lineFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/line-4.svg" alt="" className={styles.lineFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/line-5.svg" alt="" className={styles.lineFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/line-6.svg" alt="" className={styles.lineFrame} />
            </div>
          </div>
          <Image
            src="/home/hero-motion-frame.svg"
            alt=""
            fill
            priority
            className={styles.motionFrame}
          />
        </div>

        <div ref={arrowBeltRef} className={styles.arrowBelt}>
          <div className={styles.arrowSkew}>
          <div className={styles.arrowGrid} aria-hidden="true">
            <span className={styles.arrowCell} />
            <span className={styles.arrowCell} />
            <span className={styles.arrowCell} />
            <span className={styles.arrowCell} />
            <span className={styles.arrowCell} />
            <span className={styles.arrowCell} />
            <span className={styles.arrowCell} />
          </div>
          </div>
        </div>

        <div className={styles.motorcycleScrollLayer}>
          <div className={styles.motorcycleMotion}>
            <div ref={motorcycleIntroRef} className={styles.motorcycle}>
              <div className={styles.tailFx} aria-hidden="true">
                <div className={styles.tailSprite}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/tail-1.svg" alt="" className={styles.tailFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/tail-2.svg" alt="" className={styles.tailFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/tail-3.svg" alt="" className={styles.tailFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/tail-4.svg" alt="" className={styles.tailFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/tail-5.svg" alt="" className={styles.tailFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/tail-6.svg" alt="" className={styles.tailFrame} />
                </div>
              </div>
              <div className={styles.motorcycleSprite}>
                <div className={styles.motorcycleSpriteTrack}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/hero-motorcycle-1.webp" alt="" className={styles.motorcycleFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/hero-motorcycle-2.webp" alt="" className={styles.motorcycleFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/hero-motorcycle-3.webp" alt="" className={styles.motorcycleFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/hero-motorcycle-4.webp" alt="" className={styles.motorcycleFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/hero-motorcycle-5.webp" alt="" className={styles.motorcycleFrame} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/home/hero-motorcycle-6.webp" alt="" className={styles.motorcycleFrame} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.transitionArea}>
        <div
          className={styles.profileText}
          aria-label={`${PROFILE_TITLE} ${PROFILE_COPY}`}
        >
          <div className={styles.profileMeasure} aria-hidden="true">
            <p className={styles.profileKicker}>{PROFILE_TITLE}</p>
            <p className={styles.profileCopy}>{PROFILE_COPY}</p>
          </div>
          <div className={styles.profileTyped}>
            <p className={styles.profileKicker} aria-hidden={titleCharCount === 0}>
              {displayedProfileTitle}
              {showTitleCaret && <span className={styles.profileCaret}>_</span>}
            </p>
            <p className={styles.profileCopy} aria-hidden={copyCharCount === 0}>
              {displayedProfileCopy}
              {showCopyCaret && <span className={styles.profileCaret}>_</span>}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
