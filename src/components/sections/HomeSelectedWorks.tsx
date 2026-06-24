'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react'
import {
  cartridgeShell,
  getHomeCharacterById,
  type HomeCharacterId,
} from './homeCharacterData'
import styles from './HomeSelectedWorks.module.css'

const worksConsole = '/home/character-stage/works-console'

const selectedWorks = [
  {
    title: 'Selected Works 1',
    category: 'Branding / Web Design',
    preview: `${worksConsole}/previews/work-01.svg`,
  },
  {
    title: 'Selected Works 2',
    category: 'Graphic Design / Visual Identity',
    preview: `${worksConsole}/previews/work-02.svg`,
  },
  {
    title: 'Selected Works 3',
    category: 'Poster / Illustration',
    preview: `${worksConsole}/previews/work-03.svg`,
  },
  {
    title: 'Selected Works 4',
    category: 'Photography / Retouching',
    preview: `${worksConsole}/previews/work-04.svg`,
  },
  {
    title: 'Selected Works 5',
    category: 'Web Design / Interaction',
    preview: `${worksConsole}/previews/work-05.svg`,
  },
]

type HomeSelectedWorksProps = {
  selectedCharacterId: HomeCharacterId
  showInsertedCartridge?: boolean
}

export default function HomeSelectedWorks({
  selectedCharacterId,
  showInsertedCartridge = true,
}: HomeSelectedWorksProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const selectedCharacter = getHomeCharacterById(selectedCharacterId)
  const selectedWork = selectedWorks[selectedWorkIndex]

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let frame = 0

    const clamp = (value: number, min = 0, max = 1) =>
      Math.min(Math.max(value, min), max)

    const range = (value: number, start: number, end: number) =>
      clamp((value - start) / (end - start))

    const updateInsertProgress = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = clamp(-rect.top / travel)
      const insertProgress = range(progress, 0.08, 0.44)
      const cartridgeY = (1 - insertProgress) * -window.innerHeight * 0.82
      const cartridgeScale = 0.94 - insertProgress * 0.44

      section.style.setProperty('--works-progress', progress.toFixed(3))
      section.style.setProperty('--cartridge-insert-y', `${cartridgeY.toFixed(2)}px`)
      section.style.setProperty('--cartridge-insert-scale', cartridgeScale.toFixed(3))
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateInsertProgress)
    }

    updateInsertProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  const showNextWork = () => {
    if (!hasStarted) {
      setHasStarted(true)
      return
    }

    setSelectedWorkIndex((currentIndex) =>
      currentIndex === selectedWorks.length - 1 ? 0 : currentIndex + 1,
    )
  }

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="selected-works-title"
    >
      <div className={styles.stickyStage}>
        <div className={styles.consoleStage}>
          <div className={styles.screenLayer}>
            {hasStarted ? (
              <>
                <img
                  key={selectedWork.preview}
                  src={selectedWork.preview}
                  alt=""
                  className={styles.previewImage}
                  draggable={false}
                  aria-hidden="true"
                />
                <div className={styles.workMeta}>
                  <p className={styles.metaEyebrow}>Selected Works</p>
                  <h2 id="selected-works-title" className={styles.workTitle}>
                    {selectedWork.title}
                  </h2>
                  <p className={styles.workCategory}>{selectedWork.category}</p>
                </div>
              </>
            ) : (
              <div className={styles.startScreen}>
                <p className={styles.bootText}>Character loaded</p>
                <h2 id="selected-works-title" className={styles.startTitle}>
                  Press Start
                </h2>
                <p className={styles.startHint}>Click joystick to view works</p>
              </div>
            )}
          </div>

          <img
            src={`${worksConsole}/gameplayer.svg`}
            alt=""
            className={styles.gameplayer}
            draggable={false}
            aria-hidden="true"
          />

          {showInsertedCartridge && (
            <div className={styles.cartridgeMask} aria-hidden="true">
              <div className={styles.cartridgeInsert}>
                <img
                  src={cartridgeShell}
                  alt=""
                  className={styles.cartridgeShell}
                  draggable={false}
                />
                <img
                  key={selectedCharacter.cartridgeLabel}
                  src={selectedCharacter.cartridgeLabel}
                  alt=""
                  className={styles.cartridgeLabel}
                  draggable={false}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            className={styles.joystickButton}
            aria-label={
              hasStarted
                ? `Show next work, current work is ${selectedWork.title}`
                : 'Start selected works preview'
            }
            onClick={showNextWork}
          />
        </div>
      </div>
    </section>
  )
}
