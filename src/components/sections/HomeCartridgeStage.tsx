'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from 'react'
import {
  cartridgeShell,
  getHomeCharacterById,
  type HomeCharacterId,
} from './homeCharacterData'
import styles from './HomeCartridgeStage.module.css'

type HomeCartridgeStageProps = {
  selectedCharacterId: HomeCharacterId
  showCardPreview?: boolean
}

export default function HomeCartridgeStage({
  selectedCharacterId,
  showCardPreview = true,
}: HomeCartridgeStageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const cartridgeRef = useRef<HTMLDivElement>(null)
  const selectedCharacter = getHomeCharacterById(selectedCharacterId)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let frame = 0

    const clamp = (value: number, min = 0, max = 1) =>
      Math.min(Math.max(value, min), max)

    const range = (value: number, start: number, end: number) =>
      clamp((value - start) / (end - start))

    const updateCartridgeProgress = () => {
      frame = 0
      const copy = copyRef.current
      const cartridge = cartridgeRef.current
      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = clamp(-rect.top / travel)
      const riseProgress = range(progress, 0, 0.4)
      const attachProgress = range(progress, 0.4, 0.65)
      const cardFadeProgress = range(progress, 0.5, 0.64)
      const lockProgress = range(progress, 0.65, 1)

      const cartridgeY = (1 - riseProgress) * window.innerHeight * 0.52
      const cardY = attachProgress * window.innerHeight * 0.27
      const cardScale = 1 - attachProgress * 0.58
      const cardOpacity = 1 - cardFadeProgress
      const labelOpacity = range(progress, 0.58, 0.66)
      const cartridgeSettle = lockProgress * -24
      const cartridgeTranslateY = cartridgeY + cartridgeSettle
      const cartridgeTop = cartridge
        ? cartridge.offsetTop + cartridgeTranslateY
        : 0
      const copyTargetY =
        copy && cartridge
          ? cartridgeTop - copy.offsetTop - copy.offsetHeight - 20
          : 0
      const copyY = lockProgress * copyTargetY

      section.style.setProperty('--cartridge-progress', progress.toFixed(3))
      section.style.setProperty('--cartridge-y', `${cartridgeTranslateY.toFixed(2)}px`)
      section.style.setProperty('--card-y', `${cardY.toFixed(2)}px`)
      section.style.setProperty('--card-scale', cardScale.toFixed(3))
      section.style.setProperty('--card-opacity', cardOpacity.toFixed(3))
      section.style.setProperty('--label-opacity', labelOpacity.toFixed(3))
      section.style.setProperty('--copy-y', `${copyY.toFixed(2)}px`)
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateCartridgeProgress)
    }

    updateCartridgeProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="cartridge-stage-title">
      <div className={styles.stage}>
        <div className={styles.scene}>
          {showCardPreview && (
            <div className={styles.cardPreview} aria-hidden="true">
              <img
                src={selectedCharacter.card}
                alt=""
                className={styles.cardImage}
                draggable={false}
              />
            </div>
          )}

          <div ref={copyRef} className={styles.copyBlock}>
            <p className={styles.kicker}>character loaded</p>
            <h2 id="cartridge-stage-title" className={styles.title}>
              {selectedCharacter.name} Cartridge
            </h2>
          </div>

          <div ref={cartridgeRef} className={styles.cartridgeWrap}>
            <img
              src={cartridgeShell}
              alt=""
              className={styles.cartridgeShell}
              draggable={false}
              aria-hidden="true"
            />
            <img
              key={selectedCharacter.cartridgeLabel}
              src={selectedCharacter.cartridgeLabel}
              alt={`${selectedCharacter.name} cartridge label`}
              className={styles.cartridgeLabel}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
