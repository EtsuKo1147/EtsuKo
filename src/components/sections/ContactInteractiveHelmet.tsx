'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react'
import styles from './ContactInteractiveHelmet.module.css'

const BLINK_DURATION_MS = 220

type ContactInteractiveHelmetProps = {
  className?: string
}

export default function ContactInteractiveHelmet({
  className = '',
}: ContactInteractiveHelmetProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const gloveRef = useRef<HTMLDivElement>(null)
  const blinkTimerRef = useRef<number | null>(null)
  const [eyesClosed, setEyesClosed] = useState(false)
  const [visorClosed, setVisorClosed] = useState(false)
  const [gloveVisible, setGloveVisible] = useState(false)
  const [glovePressed, setGlovePressed] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    const contactRegion = root?.closest<HTMLElement>('[data-contact-interactive]')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

    if (!root || !contactRegion || !finePointer.matches) return

    let pointerFrame = 0
    let pointerX = 0
    let pointerY = 0
    let gloveIsVisible = false

    const setGloveActive = (active: boolean) => {
      contactRegion.classList.toggle(styles.contactGloveActive, active)

      if (gloveIsVisible === active) return

      gloveIsVisible = active
      setGloveVisible(active)

      if (!active) {
        setGlovePressed(false)
      }
    }

    const renderPointerPosition = () => {
      pointerFrame = 0
      gloveRef.current?.style.setProperty(
        'transform',
        `translate3d(${pointerX}px, ${pointerY}px, 0)`,
      )
    }

    const updatePointerPosition = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse') return

      pointerX = event.clientX
      pointerY = event.clientY
      const interactiveControl =
        event.target instanceof Element
          ? event.target.closest('a, button')
          : null
      const isGloveExcluded =
        event.target instanceof Element
          ? Boolean(event.target.closest('[data-contact-glove-exclude]'))
          : false
      const isGloveTarget = interactiveControl?.hasAttribute(
        'data-contact-glove-target',
      )

      setGloveActive(
        !isGloveExcluded && (!interactiveControl || Boolean(isGloveTarget)),
      )

      if (!pointerFrame) {
        pointerFrame = window.requestAnimationFrame(renderPointerPosition)
      }
    }

    const activateGlove = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse') return

      updatePointerPosition(event)
    }

    const deactivateGlove = () => {
      setGloveActive(false)
    }

    const releaseGlove = () => {
      setGlovePressed(false)
    }

    contactRegion.addEventListener('pointerenter', activateGlove)
    contactRegion.addEventListener('pointermove', updatePointerPosition)
    contactRegion.addEventListener('pointerleave', deactivateGlove)
    window.addEventListener('pointerup', releaseGlove)
    window.addEventListener('pointercancel', releaseGlove)

    return () => {
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame)
      contactRegion.classList.remove(styles.contactGloveActive)
      contactRegion.removeEventListener('pointerenter', activateGlove)
      contactRegion.removeEventListener('pointermove', updatePointerPosition)
      contactRegion.removeEventListener('pointerleave', deactivateGlove)
      window.removeEventListener('pointerup', releaseGlove)
      window.removeEventListener('pointercancel', releaseGlove)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (blinkTimerRef.current !== null) {
        window.clearTimeout(blinkTimerRef.current)
      }
    }
  }, [])

  const blink = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (blinkTimerRef.current !== null) {
      window.clearTimeout(blinkTimerRef.current)
    }

    setEyesClosed(true)
    blinkTimerRef.current = window.setTimeout(() => {
      setEyesClosed(false)
      blinkTimerRef.current = null
    }, BLINK_DURATION_MS)
  }

  const rootClassName = [styles.root, className].filter(Boolean).join(' ')

  return (
    <div ref={rootRef} className={rootClassName}>
      <button
        type="button"
        className={styles.helmetButton}
        aria-label={visorClosed ? 'Open helmet visor' : 'Close helmet visor'}
        aria-pressed={visorClosed}
        data-contact-glove-target
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') blink()
        }}
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse') setGlovePressed(true)
        }}
        onClick={() => setVisorClosed((current) => !current)}
      >
        <span className={styles.eyeLayer} aria-hidden="true">
          <img
            src="/contact/eyes-open.svg"
            alt=""
            className={`${styles.layerImage} ${eyesClosed ? styles.eyeHidden : styles.eyeVisible}`}
            draggable={false}
          />
          <img
            src="/contact/eyes-closed.svg"
            alt=""
            className={`${styles.layerImage} ${eyesClosed ? styles.eyeVisible : styles.eyeHidden}`}
            draggable={false}
          />
        </span>

        <span className={styles.visorClip} aria-hidden="true">
          <img
            src="/contact/helmet-visor.svg"
            alt=""
            className={`${styles.layerImage} ${styles.visor} ${
              visorClosed ? styles.visorClosed : styles.visorOpen
            }`}
            draggable={false}
          />
        </span>

        <img
          src="/contact/helmet-shell.svg"
          alt=""
          className={`${styles.layerImage} ${styles.shellLayer}`}
          draggable={false}
          aria-hidden="true"
        />
      </button>

      <div
        ref={gloveRef}
        className={`${styles.gloveCursor} ${gloveVisible ? styles.gloveVisible : ''}`}
        aria-hidden="true"
      >
        <img
          src={
            glovePressed
              ? '/contact/glove-cursor-pressed.svg'
              : '/contact/glove-cursor.svg'
          }
          alt=""
          draggable={false}
        />
      </div>
    </div>
  )
}
