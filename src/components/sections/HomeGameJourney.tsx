'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react'
import HomeCharacterSelect from './HomeCharacterSelect'
import {
  cartridgeShell,
  getHomeCharacterById,
  type HomeCharacterId,
} from './homeCharacterData'
import styles from './HomeGameJourney.module.css'

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
      const storyProgress = clamp(progress / 0.72)
      const assistExitProgress = range(storyProgress, 0.2, 0.35)
      const cursorExitProgress = range(storyProgress, 0.2, 0.4)
      const metaExitProgress = range(storyProgress, 0.38, 0.52)
      const cartridgeEnterProgress = range(storyProgress, 0.35, 0.58)
      const cardToLabelProgress = range(storyProgress, 0.62, 0.75)
      const cartridgeLockProgress = range(storyProgress, 0.58, 0.68)
      const labelOpacity = range(storyProgress, 0.64, 0.75)
      const cartridgeOpacity = range(storyProgress, 0.35, 0.44)
      const consoleEnterProgress = range(storyProgress, 0.82, 0.92)
      const cartridgeSlotProgress = range(storyProgress, 0.92, 1)
      const isCharacterInteractive = storyProgress < 0.45
      const isConsoleInteractive = storyProgress >= 0.82 && progress < 0.78
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
      const cartridgeClipBottom = cartridgeSlotProgress * 46
      const consoleY = (1 - consoleEnterProgress) * window.innerHeight * 1.05
      const cartridgeScale = 0.9 + cartridgeEnterProgress * 0.1

      journey.style.setProperty('--character-stage-progress', storyProgress.toFixed(4))
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
      journey.style.setProperty(
        '--character-select-pointer-events',
        isCharacterInteractive ? 'auto' : 'none',
      )
      journey.style.setProperty(
        '--game-console-pointer-events',
        isConsoleInteractive ? 'auto' : 'none',
      )
      journey.dataset.characterInteractive = String(isCharacterInteractive)
      journey.dataset.consoleInteractive = String(isConsoleInteractive)
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
      data-character-interactive="true"
      data-console-interactive="false"
    >
      <GameJourneyChrome />
      <GameConsoleLayer />
      <SharedCartridgeLayer selectedCharacterId={selectedCharacterId} />
      <HomeCharacterSelect
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={onSelectCharacter}
      />
    </section>
  )
}

function GameJourneyChrome() {
  return (
    <div className={styles.gameChrome} aria-hidden="true">
      <div className={styles.bgGrid} />
      <div className={styles.bgNoise} />
      <svg
        className={styles.bgSlash}
        viewBox="0 0 2560 1219"
        preserveAspectRatio="none"
      >
        <g stroke="currentColor" strokeWidth="1.5" opacity="0.1">
          <path d="M-80 180 L760 -60" />
          <path d="M-80 215 L790 -45" />
          <path d="M2640 1040 L1820 1280" />
          <path d="M2640 1080 L1850 1300" />
        </g>
        <g fill="currentColor" opacity="0.07">
          <polygon points="110,840 420,840 370,900 60,900" />
        </g>
      </svg>
      <div className={styles.bgWatermark}>04</div>
      <div className={styles.scanline} />
      <span className={`${styles.frameTick} ${styles.frameTickTl}`} />
      <span className={`${styles.frameTick} ${styles.frameTickTr}`} />
      <span className={`${styles.frameTick} ${styles.frameTickBl}`} />
      <span className={`${styles.frameTick} ${styles.frameTickBr}`} />
      <span className={`${styles.hudTag} ${styles.hudTagPrimary}`}>
        SYS / CHARACTER SELECT
      </span>
      <span className={`${styles.hudTag} ${styles.hudTagSecondary}`}>
        MODE / DESIGN · STABLE
      </span>
      <div className={styles.vignette} />
    </div>
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
    <div className={styles.gameConsoleLayer}>
      <GameConsoleTop />
    </div>
  )
}

function GameConsoleTop() {
  const [hasStarted, setHasStarted] = useState(false)
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)
  const glitchTimeoutRef = useRef<number | null>(null)
  const selectedWork = selectedWorks[selectedWorkIndex]

  useEffect(() => {
    return () => {
      if (glitchTimeoutRef.current) {
        window.clearTimeout(glitchTimeoutRef.current)
      }
    }
  }, [])

  const triggerScreenGlitch = () => {
    setIsGlitching(true)

    if (glitchTimeoutRef.current) {
      window.clearTimeout(glitchTimeoutRef.current)
    }

    glitchTimeoutRef.current = window.setTimeout(() => {
      setIsGlitching(false)
      glitchTimeoutRef.current = null
    }, 360)
  }

  const showNextWork = () => {
    triggerScreenGlitch()

    if (!hasStarted) {
      setHasStarted(true)
      return
    }

    setSelectedWorkIndex((currentIndex) =>
      currentIndex === selectedWorks.length - 1 ? 0 : currentIndex + 1,
    )
  }

  return (
    <div className={styles.gameConsoleStage}>
      <div
        className={`${styles.gameConsoleScreen} ${
          isGlitching ? styles.gameConsoleScreenGlitching : ''
        }`}
      >
        {hasStarted ? (
          <div className={styles.workScreen}>
            <img
              key={selectedWork.preview}
              src={selectedWork.preview}
              alt=""
              className={styles.workPreviewImage}
              draggable={false}
              aria-hidden="true"
            />
            <div className={styles.workScreenMeta}>
              <p className={styles.workScreenEyebrow}>Selected Works</p>
              <p className={styles.workScreenTitle}>{selectedWork.title}</p>
              <p className={styles.workScreenCategory}>{selectedWork.category}</p>
            </div>
          </div>
        ) : (
          <div className={styles.startScreen}>
            <p className={styles.bootText}>Character loaded</p>
            <p className={styles.startTitle}>Press Start</p>
            <p className={styles.startHint}>Try me</p>
          </div>
        )}
        <div className={styles.screenFx} aria-hidden="true" />
        <div className={styles.screenGreenScanline} aria-hidden="true" />
        <div className={styles.screenGlitch} aria-hidden="true" />
      </div>
      <img
        src={`${worksConsole}/gameplayer.svg`}
        alt=""
        className={styles.gameConsoleImage}
        draggable={false}
      />
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
  )
}
