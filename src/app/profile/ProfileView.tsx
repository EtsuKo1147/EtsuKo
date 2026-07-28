'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { profileCopy } from '@/data/profile'
import { useSiteTheme } from '@/components/theme/SiteThemeProvider'
import styles from './page.module.css'

const profileBiographyParagraphs = [
  '中国・安徽省出身、大阪府在住。2023年に神戸芸術工科大学大学院の修士課程を修了後、現在は大阪でブランディングデザインを中心に仕事をしています。グラフィックデザインのほか、写真やイラストレーションなどの制作にも取り組んでおり、今後はWeb・UIデザインにも活動の幅を広げていきたいと考えています。',
  '情報が自然に伝わり、見る人の記憶にそっと残るようなデザインが好きです。目の前の課題に丁寧に向き合いながら、日々制作に取り組んでいます。',
  'バイク、写真、絵、ゲームが好きで、休日はバイクで出かけたり、写真を撮ったり、絵を描いたり、ゲームをしたりして過ごしています。',
] as const

type ProfileTypewriterSegment = {
  key: string
  text: string
  pauseAfter: number
}

type ProfileTypewriterLineProps = {
  text: string
  visibleText: string
  showCursor: boolean
  showEndCursor: boolean
}

const profileTypewriterSegments: ProfileTypewriterSegment[] =
  profileBiographyParagraphs.map((text, index) => ({
    key: `paragraph-${index}`,
    text,
    pauseAfter: 90,
  }))

function ProfileTypewriterLine({
  text,
  visibleText,
  showCursor,
  showEndCursor,
}: ProfileTypewriterLineProps) {
  return (
    <span className={styles.profileTypewriterLine}>
      <span className={styles.profileTypewriterMeasure} aria-hidden="true">
        {text}
      </span>
      <span className={styles.profileTypewriterValue} aria-hidden="true">
        {visibleText}
        {showCursor ? <span className={styles.profileTypewriterCursor} /> : null}
        {showEndCursor ? (
          <span className={styles.profileTypewriterEndCursor}>_</span>
        ) : null}
      </span>
      <span className={styles.profileTypewriterAccessible}>{text}</span>
    </span>
  )
}

function ProfileConsoleTypewriter() {
  const [hasEnteredView, setHasEnteredView] = useState(false)
  const [visibleCharacters, setVisibleCharacters] = useState(0)
  const screenRef = useRef<HTMLDivElement>(null)
  const hasConsumedInitialPlaybackRef = useRef(false)
  const totalCharacters = profileTypewriterSegments.reduce(
    (total, segment) => total + Array.from(segment.text).length,
    0,
  )
  const renderedSegments = new Map<
    string,
    { visibleText: string; showCursor: boolean; showEndCursor: boolean }
  >()
  let characterOffset = 0

  profileTypewriterSegments.forEach((segment, segmentIndex) => {
    const characters = Array.from(segment.text)
    const segmentStart = characterOffset
    const visibleLength = Math.max(
      0,
      Math.min(characters.length, visibleCharacters - segmentStart),
    )

    renderedSegments.set(segment.key, {
      visibleText: characters.slice(0, visibleLength).join(''),
      showCursor:
        hasEnteredView &&
        visibleCharacters >= segmentStart &&
        visibleCharacters < segmentStart + characters.length,
      showEndCursor:
        segmentIndex === profileTypewriterSegments.length - 1 &&
        visibleCharacters >= totalCharacters,
    })
    characterOffset += characters.length
  })

  useEffect(() => {
    const screen = screenRef.current

    if (!screen) {
      return
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (reducedMotionQuery.matches) {
      const frame = window.requestAnimationFrame(() => {
        setHasEnteredView(true)
      })

      return () => {
        window.cancelAnimationFrame(frame)
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        setHasEnteredView(true)
        observer.disconnect()
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.22,
      },
    )

    observer.observe(screen)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!hasEnteredView) {
      return
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const shouldPlayInitialAnimation = !hasConsumedInitialPlaybackRef.current

    if (reducedMotionQuery.matches || !shouldPlayInitialAnimation) {
      hasConsumedInitialPlaybackRef.current = true
      const frame = window.requestAnimationFrame(() => {
        setVisibleCharacters(totalCharacters)
      })

      return () => {
        window.cancelAnimationFrame(frame)
      }
    }

    let timeoutId: number | undefined
    let segmentIndex = 0
    let characterIndex = 0
    let nextVisibleCharacters = 0
    let isCancelled = false

    const typeNextCharacter = () => {
      if (isCancelled || segmentIndex >= profileTypewriterSegments.length) {
        return
      }

      hasConsumedInitialPlaybackRef.current = true

      const segment = profileTypewriterSegments[segmentIndex]
      const characters = Array.from(segment.text)

      if (characterIndex < characters.length) {
        characterIndex += 1
        nextVisibleCharacters += 1
        setVisibleCharacters(nextVisibleCharacters)

        timeoutId = window.setTimeout(typeNextCharacter, 5)
        return
      }

      segmentIndex += 1
      characterIndex = 0
      timeoutId = window.setTimeout(typeNextCharacter, segment.pauseAfter)
    }

    timeoutId = window.setTimeout(typeNextCharacter, 120)

    return () => {
      isCancelled = true

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [hasEnteredView, totalCharacters])

  return (
    <div ref={screenRef} className={styles.profileScreen} aria-live="polite">
      <div className={`${styles.profileScreenContent} ${styles.profileJapanese}`}>
        <div className={styles.profileBiography}>
          {profileBiographyParagraphs.map((paragraph, index) => {
            const segment = renderedSegments.get(`paragraph-${index}`)

            return (
              <p key={paragraph}>
                <ProfileTypewriterLine
                  text={paragraph}
                  visibleText={segment?.visibleText ?? ''}
                  showCursor={segment?.showCursor ?? false}
                  showEndCursor={segment?.showEndCursor ?? false}
                />
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ProfileView() {
  const { isInverted, toggleTheme } = useSiteTheme()
  const [designScale, setDesignScale] = useState(1)
  const profileConsoleFrameRef = useRef<HTMLDivElement>(null)
  const profile = profileCopy.jp

  useEffect(() => {
    const updateDesignScale = () => {
      const widthScale = window.innerWidth / 1920
      const heightScale = window.innerHeight / 1080
      const nextScale = Math.max(0.78, Math.min(1, widthScale, heightScale))

      setDesignScale(Math.round(nextScale * 1000) / 1000)
    }

    updateDesignScale()
    window.addEventListener('resize', updateDesignScale)

    return () => {
      window.removeEventListener('resize', updateDesignScale)
    }
  }, [])

  useEffect(() => {
    const consoleFrame = profileConsoleFrameRef.current

    if (!consoleFrame) {
      return
    }

    const mobileQuery = window.matchMedia('(max-width: 640px)')

    const centerProfileConsole = () => {
      consoleFrame.style.removeProperty('--profile-console-center-shift')

      if (!mobileQuery.matches) {
        return
      }

      const consoleRect = consoleFrame.getBoundingClientRect()
      const viewportCenter = document.documentElement.clientWidth / 2
      const consoleCenter = consoleRect.left + consoleRect.width / 2
      const centerShift = Math.round((viewportCenter - consoleCenter) * 10) / 10

      consoleFrame.style.setProperty(
        '--profile-console-center-shift',
        `${centerShift}px`,
      )
    }

    const frame = window.requestAnimationFrame(centerProfileConsole)
    window.addEventListener('resize', centerProfileConsole)
    mobileQuery.addEventListener('change', centerProfileConsole)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', centerProfileConsole)
      mobileQuery.removeEventListener('change', centerProfileConsole)
    }
  }, [])

  const scaledPx = (value: number) => `${Math.round(value * designScale * 10) / 10}px`
  const pageScaleStyle = {
    '--profile-page-pad-top': scaledPx(24),
    '--profile-page-pad-x': scaledPx(76),
    '--profile-page-pad-bottom': scaledPx(128),
    '--profile-layout-width': scaledPx(1480),
    '--profile-header-gap': scaledPx(72),
    '--profile-header-margin-bottom': scaledPx(18),
    '--profile-lead-margin-top': scaledPx(38),
    '--profile-stage-min-height': scaledPx(860),
    '--profile-character-left': scaledPx(34),
    '--profile-character-bottom': scaledPx(176),
    '--profile-character-width': scaledPx(600),
    '--profile-console-width': scaledPx(980),
    '--profile-console-margin': scaledPx(-76),
  } as CSSProperties

  return (
    <main
      className={`${styles.page} ${isInverted ? styles.pageInverted : ''}`}
      style={pageScaleStyle}
    >
      <button
        type="button"
        className={styles.invertToggle}
        aria-pressed={isInverted}
        aria-label={isInverted ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
      />

      <section className={styles.header} aria-label="Profile">
        <p className={`${styles.profileLead} ${styles.profileJapanese}`}>
          {profile.lead.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </section>

      <section className={styles.profileArcade} aria-label="Profile details">
        <div className={styles.profileStage}>
          <img
            src="/home/character-stage/doodles/character-3.svg"
            alt=""
            className={styles.profileCharacter}
            draggable={false}
          />

          <div ref={profileConsoleFrameRef} className={styles.profileConsoleFrame}>
            <img
              src="/home/character-stage/doodles/new-gameplayer-2-02.svg"
              alt=""
              className={styles.profileConsole}
              draggable={false}
            />

            <ProfileConsoleTypewriter />
          </div>
        </div>
      </section>
    </main>
  )
}
