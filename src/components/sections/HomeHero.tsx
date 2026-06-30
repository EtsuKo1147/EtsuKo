'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import styles from './HomeHero.module.css'

type HomeHeroProps = { revealed?: boolean }

export default function HomeHero({ revealed = false }: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const frameGroupRef = useRef<HTMLDivElement>(null)
  const motorcycleIntroRef = useRef<HTMLDivElement>(null)
  const arrowLayerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<HTMLDivElement>(null)

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
    const arrowLayer = arrowLayerRef.current

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
      arrowLayer,
      { x: '-120vw' },
      { x: 0, duration: 1.5, delay: 0.4, ease: 'power3.out' }
    )

    return () => {
      gsap.killTweensOf([frameGroup, motorcycleIntro, arrowLayer])
    }
  }, [revealed])

  useEffect(() => {
    const timer = timerRef.current
    if (!timer || !revealed) {
      if (timer) timer.textContent = '00:00.000'
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = Math.max(0, Math.floor(now - start))
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      const milliseconds = elapsed % 1000

      const minuteText = String(minutes).padStart(2, '0')
      const secondText = String(seconds).padStart(2, '0')
      const millisecondText = String(milliseconds).padStart(3, '0')

      timer.textContent = `${minuteText}:${secondText}.${millisecondText}`
      frame = window.requestAnimationFrame(tick)
    }

    timer.textContent = '00:00.000'
    frame = window.requestAnimationFrame(tick)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
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
      const motorY = progress * 34
      const minimapX = progress * -2
      const minimapY = progress * -5
      const minimapRotate = progress * -75
      const motorRotate = progress * 0.3

      hero.style.setProperty('--hero-scroll-progress', progress.toFixed(3))
      hero.style.setProperty('--frame-x', '0px')
      hero.style.setProperty('--frame-y', '0px')
      hero.style.setProperty('--motor-x', '0px')
      hero.style.setProperty('--motor-y', `${motorY.toFixed(2)}px`)
      hero.style.setProperty('--minimap-x', `${minimapX.toFixed(2)}px`)
      hero.style.setProperty('--minimap-y', `${minimapY.toFixed(2)}px`)
      hero.style.setProperty('--minimap-rotate', `${minimapRotate.toFixed(2)}deg`)
      hero.style.setProperty('--motor-rotate', `${motorRotate.toFixed(2)}deg`)
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
        <div className={styles.heroScene}>
          <div ref={frameGroupRef} className={styles.frameGroup}>
            <div className={styles.frameSprite} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/frame/hero-frame-01.svg" alt="" className={styles.heroFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/frame/hero-frame-02.svg" alt="" className={styles.heroFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/frame/hero-frame-03.svg" alt="" className={styles.heroFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/frame/hero-frame-04.svg" alt="" className={styles.heroFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/frame/hero-frame-05.svg" alt="" className={styles.heroFrame} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/frame/hero-frame-06.svg" alt="" className={styles.heroFrame} />
            </div>

            <div className={styles.minimap} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/hero/ui/minimap-base.svg" alt="" className={styles.minimapBase} />
              <span className={styles.minimapDot} />
            </div>

            <div ref={timerRef} className={styles.timerReadout} aria-label="Homepage timer">
              00:00.000
            </div>

            <div ref={arrowLayerRef} className={styles.arrowLayer}>
              <div className={`${styles.arrowBelt} ${styles.arrowBeltLeft}`}>
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

              <div className={`${styles.arrowBelt} ${styles.arrowBeltRight}`}>
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
                    <img src="/home/hero-motorcycle-1.svg" alt="" className={styles.motorcycleFrame} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/hero-motorcycle-2.svg" alt="" className={styles.motorcycleFrame} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/hero-motorcycle-3.svg" alt="" className={styles.motorcycleFrame} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/hero-motorcycle-4.svg" alt="" className={styles.motorcycleFrame} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/hero-motorcycle-5.svg" alt="" className={styles.motorcycleFrame} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/hero-motorcycle-6.svg" alt="" className={styles.motorcycleFrame} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
