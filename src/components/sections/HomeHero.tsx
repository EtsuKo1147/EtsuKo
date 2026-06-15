'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import styles from './HomeHero.module.css'

type HomeHeroProps = { revealed?: boolean }

export default function HomeHero({ revealed = false }: HomeHeroProps) {
  const frameGroupRef = useRef<HTMLDivElement>(null)
  const motorcycleRef = useRef<HTMLDivElement>(null)
  const arrowBeltRef  = useRef<HTMLDivElement>(null)

  // Set hidden start positions only on first visit (loader is covering the screen)
  useEffect(() => {
    if (revealed) return
    gsap.set(frameGroupRef.current, { y: '-110%' })
    gsap.set(motorcycleRef.current, { x: '-60%', y: '-80%' })
  }, [])

  // Run entrance animation only when revealed becomes true
  useEffect(() => {
    if (!revealed) return

    gsap.fromTo(
      frameGroupRef.current,
      { y: '-130%' },
      { y: 0, delay: -0.3, duration: 2.0, ease: 'power3.out' }
    )

    gsap.fromTo(
      motorcycleRef.current,
      { x: '-100vw', y: '-60vh' },
      { x: 0, y: 0, duration: 1.5, delay: 0, ease: 'power3.out' }
    )

    gsap.fromTo(
      arrowBeltRef.current,
      { x: '-120vw' },
      { x: 0, duration: 1.5, delay: 0.4, ease: 'power3.out' }
    )

    return () => {
      gsap.killTweensOf([frameGroupRef.current, motorcycleRef.current, arrowBeltRef.current])
    }
  }, [revealed])

  return (
    <section className={styles.hero}>
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

        <div ref={motorcycleRef} className={styles.motorcycle}>
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
    </section>
  )
}
