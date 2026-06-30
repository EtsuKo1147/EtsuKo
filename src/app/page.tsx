'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import HomeEntryScrollController from '@/components/sections/HomeEntryScrollController'
import HomeHero from '@/components/sections/HomeHero'
import HomeMinimalIndex from '@/components/sections/HomeMinimalIndex'
import styles from './page.module.css'

const HandDrawnLoader = dynamic(
  () => import('@/components/animation/HandDrawnLoader'),
  { ssr: false }
)

const shouldSkipHomeLoader = () =>
  typeof window !== 'undefined' &&
  sessionStorage.getItem('skipHomeLoader') === '1'

export default function HomePage() {
  const [loaderDone,   setLoaderDone]   = useState(shouldSkipHomeLoader)
  const [homeRevealed, setHomeRevealed] = useState(shouldSkipHomeLoader)
  const [isInverted, setIsInverted] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('skipHomeLoader') === '1') {
      sessionStorage.removeItem('skipHomeLoader')
    }
  }, [])

  const revealHome = () => {
    setHomeRevealed(true)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('homeReveal'))
    }
  }

  return (
    <>
      <HomeEntryScrollController />
      {!loaderDone && (
        <HandDrawnLoader
          onReveal={revealHome}
          onComplete={() => {
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
          onClick={() => setIsInverted((currentValue) => !currentValue)}
        >
          {isInverted ? 'Light' : 'Invert'}
        </button>
        <HomeHero revealed={homeRevealed} />
        <HomeMinimalIndex />
      </main>
    </>
  )
}
