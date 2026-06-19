'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import HomeEntryScrollController from '@/components/sections/HomeEntryScrollController'
import HomeHero from '@/components/sections/HomeHero'
import HomeProfileIntro from '@/components/sections/HomeProfileIntro'
import HomeSelectedWorks from '@/components/sections/HomeSelectedWorks'

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
      <main style={{ visibility: homeRevealed ? 'visible' : 'hidden' }}>
        <HomeHero revealed={homeRevealed} />
        <HomeProfileIntro />
        <HomeSelectedWorks />
      </main>
    </>
  )
}
