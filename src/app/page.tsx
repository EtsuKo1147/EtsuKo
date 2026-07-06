'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import HomeEntryScrollController from '@/components/sections/HomeEntryScrollController'
import HomeHero from '@/components/sections/HomeHero'
import HomeMinimalIndex from '@/components/sections/HomeMinimalIndex'
import {
  clearHomeLoaderSkipRequest,
  markHomeLoaderPlayed,
  shouldSkipHomeLoader,
} from '@/components/animation/homeLoaderSession'
import styles from './page.module.css'

const HandDrawnLoader = dynamic(
  () => import('@/components/animation/HandDrawnLoader'),
  { ssr: false }
)

export default function HomePage() {
  const [loaderDone,   setLoaderDone]   = useState(shouldSkipHomeLoader)
  const [homeRevealed, setHomeRevealed] = useState(shouldSkipHomeLoader)
  const [isInverted, setIsInverted] = useState(false)

  const revealHome = () => {
    setHomeRevealed(true)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('homeReveal'))
    }
  }

  useEffect(() => {
    const skippedLoader = shouldSkipHomeLoader()
    clearHomeLoaderSkipRequest()

    if (skippedLoader) {
      markHomeLoaderPlayed()
      window.dispatchEvent(new CustomEvent('homeReveal'))
    }
  }, [])

  return (
    <>
      <HomeEntryScrollController />
      {!loaderDone && (
        <HandDrawnLoader
          onReveal={revealHome}
          onComplete={() => {
            markHomeLoaderPlayed()
            revealHome()
            setLoaderDone(true)
          }}
        />
      )}
      {/* Keep main free of overflowX hidden; it can break touch scrolling on mobile browsers. */}
      <main
        className={`${styles.homeMain} ${isInverted ? styles.homeMainInverted : ''}`}
        style={{ visibility: homeRevealed ? 'visible' : 'hidden' }}
      >
        <button
          type="button"
          className={styles.invertToggle}
          aria-pressed={isInverted}
          aria-label={isInverted ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setIsInverted((currentValue) => !currentValue)}
        />
        <HomeHero revealed={homeRevealed} />
        <HomeMinimalIndex />
      </main>
    </>
  )
}
