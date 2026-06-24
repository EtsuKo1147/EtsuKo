'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from 'react'
import HomeCharacterSelect from './HomeCharacterSelect'
import {
  cartridgeShell,
  getHomeCharacterById,
  type HomeCharacterId,
} from './homeCharacterData'
import styles from './HomeGameJourney.module.css'

const worksConsole = '/home/character-stage/works-console'

type HomeGameJourneyProps = {
  selectedCharacterId: HomeCharacterId
  onSelectCharacter: (id: HomeCharacterId) => void
}

export default function HomeGameJourney({
  selectedCharacterId,
  onSelectCharacter,
}: HomeGameJourneyProps) {
  const journeyRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const journey = journeyRef.current

    if (!journey) {
      return
    }

    let frame = 0

    const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)
    const range = (value: number, start: number, end: number) =>
      clamp((value - start) / (end - start))

    const updateProgress = () => {
      frame = 0

      const rect = journey.getBoundingClientRect()
      const travel = Math.max(journey.offsetHeight - window.innerHeight, 1)
      const progress = clamp(-rect.top / travel)
      const assistExitProgress = range(progress, 0.2, 0.35)
      const cursorExitProgress = range(progress, 0.2, 0.4)
      const metaExitProgress = range(progress, 0.38, 0.52)
      const cartridgeEnterProgress = range(progress, 0.35, 0.58)
      const cardToLabelProgress = range(progress, 0.62, 0.75)
      const cartridgeLockProgress = range(progress, 0.58, 0.68)
      const labelOpacity = range(progress, 0.64, 0.75)
      const cartridgeOpacity = range(progress, 0.35, 0.44)
      const consoleEnterProgress = range(progress, 0.82, 0.92)
      const cartridgeSlotProgress = range(progress, 0.92, 1)
      const consoleWidth =
        window.innerWidth <= 640
          ? window.innerWidth * 1.52
          : window.innerWidth <= 960
            ? window.innerWidth * 1.18
            : Math.min(1920, window.innerWidth * 0.96)
      const consoleHeight = consoleWidth * (1080 / 1920)
      const consoleTop = (window.innerHeight - consoleHeight) / 2
      const cartridgeBaseTop = Math.min(Math.max(window.innerHeight * 0.3, 260), 340)
      const slotTargetTop = consoleTop + consoleHeight * 0.63 + 80
      const slotTargetY = slotTargetTop - cartridgeBaseTop
      const readCartridgeY =
        (1 - cartridgeEnterProgress) * window.innerHeight * 0.82 -
        cartridgeLockProgress * 18
      const cartridgeY =
        readCartridgeY + (slotTargetY - readCartridgeY) * cartridgeSlotProgress
      const baseCartridgeWidth = Math.min(600, window.innerWidth * 0.74)
      const slotCartridgeWidth = consoleWidth * 0.14
      const cartridgeWidth =
        baseCartridgeWidth +
        (slotCartridgeWidth - baseCartridgeWidth) * cartridgeSlotProgress
      const cartridgeScale = 0.9 + cartridgeEnterProgress * 0.1
      const cartridgeClipBottom = cartridgeSlotProgress * 46
      const consoleY = (1 - consoleEnterProgress) * window.innerHeight * 1.05

      journey.style.setProperty('--character-stage-progress', progress.toFixed(4))
      journey.style.setProperty(
        '--character-title-opacity',
        String(1 - assistExitProgress),
      )
      journey.style.setProperty('--character-title-y', `${-34 * assistExitProgress}px`)
      journey.style.setProperty(
        '--character-arrow-opacity',
        String(1 - assistExitProgress),
      )
      journey.style.setProperty('--character-arrow-y', `${-18 * assistExitProgress}px`)
      journey.style.setProperty(
        '--character-cursor-opacity',
        String(1 - cursorExitProgress),
      )
      journey.style.setProperty(
        '--character-cursor-scale',
        String(1 - cursorExitProgress * 0.72),
      )
      journey.style.setProperty(
        '--character-meta-opacity',
        String(0.58 * (1 - metaExitProgress)),
      )
      journey.style.setProperty(
        '--character-card-opacity',
        String(1 - cardToLabelProgress),
      )
      journey.style.setProperty(
        '--character-card-scale',
        String(1 - cardToLabelProgress * 0.16),
      )
      journey.style.setProperty('--character-card-y', `${-18 * cardToLabelProgress}px`)
      journey.style.setProperty('--shared-cartridge-opacity', String(cartridgeOpacity))
      journey.style.setProperty('--shared-cartridge-y', `${cartridgeY.toFixed(2)}px`)
      journey.style.setProperty('--shared-cartridge-scale', cartridgeScale.toFixed(3))
      journey.style.setProperty('--shared-cartridge-width', `${cartridgeWidth.toFixed(2)}px`)
      journey.style.setProperty('--shared-cartridge-clip-bottom', `${cartridgeClipBottom}%`)
      journey.style.setProperty('--shared-label-opacity', String(labelOpacity))
      journey.style.setProperty('--game-console-y', `${consoleY.toFixed(2)}px`)
    }

    const requestUpdate = () => {
      if (frame) {
        return
      }

      frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }

      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  return (
    <section
      ref={journeyRef}
      className={styles.journey}
      aria-label="Character to works game journey"
    >
      <GameConsoleLayer />
      <SharedCartridgeLayer selectedCharacterId={selectedCharacterId} />
      <HomeCharacterSelect
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={onSelectCharacter}
      />
    </section>
  )
}

function SharedCartridgeLayer({
  selectedCharacterId,
}: {
  selectedCharacterId: HomeCharacterId
}) {
  const selectedCharacter = getHomeCharacterById(selectedCharacterId)

  return (
    <div className={styles.sharedCartridgeLayer} aria-hidden="true">
      <div className={styles.sharedCartridgeScene}>
        <div className={styles.sharedCartridgeFrame}>
          <div className={styles.sharedCartridgeClip}>
            <div className={styles.sharedCartridge}>
              <img
                src={cartridgeShell}
                alt=""
                className={styles.sharedCartridgeShell}
                draggable={false}
              />
              <img
                key={selectedCharacter.cartridgeLabel}
                src={selectedCharacter.cartridgeLabel}
                alt=""
                className={styles.sharedCartridgeLabel}
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GameConsoleLayer() {
  return (
    <div className={styles.gameConsoleLayer} aria-hidden="true">
      <div className={styles.gameConsoleStage}>
        <div className={styles.gameConsoleScreen}>
          <div className={styles.startScreen}>
            <p className={styles.bootText}>Character loaded</p>
            <p className={styles.startTitle}>Press Start</p>
            <p className={styles.startHint}>Try me</p>
          </div>
        </div>
        <img
          src={`${worksConsole}/gameplayer.svg`}
          alt=""
          className={styles.gameConsoleImage}
          draggable={false}
        />
      </div>
    </div>
  )
}
