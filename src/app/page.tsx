'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import HomeEntryScrollController from '@/components/sections/HomeEntryScrollController'
import HomeHero from '@/components/sections/HomeHero'
import HomeCursorLayer from '@/components/sections/HomeCursorLayer'
import HomeGameJourney from '@/components/sections/HomeGameJourney'
import HomeAboutSection from '@/components/sections/HomeAboutSection'
import {
  getHomeCharacterById,
  type HomeCharacterId,
} from '@/components/sections/homeCharacterData'
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
  const [selectedCharacterId, setSelectedCharacterId] =
    useState<HomeCharacterId>('rider')
  const selectedCharacter = getHomeCharacterById(selectedCharacterId)

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
        className={styles.homeMain}
        style={{ visibility: homeRevealed ? 'visible' : 'hidden' }}
      >
        <HomeHero revealed={homeRevealed} />
        <HomeGameJourney
          selectedCharacterId={selectedCharacterId}
          onSelectCharacter={setSelectedCharacterId}
        />
        <HomeAboutSection />
      </main>
      <HomeCursorLayer character={selectedCharacter} enabled={homeRevealed} />
    </>
  )
}
