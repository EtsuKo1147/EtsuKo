'use client'

import { useState } from 'react'
import HandDrawnLoader from '@/components/animation/HandDrawnLoader'
import Hero from '@/components/sections/Hero'
import SelectedWorks from '@/components/sections/SelectedWorks'
import AboutPreview from '@/components/sections/AboutPreview'
import ContactSection from '@/components/sections/ContactSection'

export default function HomePage() {
  const [loaderDone,    setLoaderDone]    = useState(false)
  const [homeRevealed,  setHomeRevealed]  = useState(false)

  return (
    <>
      {!loaderDone && (
        <HandDrawnLoader
          onReveal={() => setHomeRevealed(true)}
          onComplete={() => { setHomeRevealed(true); setLoaderDone(true) }}
        />
      )}
      <main
        style={{
          opacity: homeRevealed ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <Hero />
        <SelectedWorks />
        <AboutPreview />
        <ContactSection />
      </main>
    </>
  )
}
