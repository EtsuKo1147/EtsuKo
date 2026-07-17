'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { profileCopy, type ProfileLanguage } from '@/data/profile'
import { useSiteTheme } from '@/components/theme/SiteThemeProvider'
import styles from './page.module.css'

type ProfileTypewriterSegment = {
  key: string
  text: string
  kind: 'label' | 'value'
  pauseAfter: number
}

type ProfileTypewriterLineProps = {
  text: string
  visibleText: string
  showCursor: boolean
  showEndCursor: boolean
}

function getProfileTypewriterSegments(language: ProfileLanguage) {
  const segments: ProfileTypewriterSegment[] = []

  profileCopy[language].items.forEach((item, itemIndex) => {
    segments.push({
      key: `${itemIndex}-label`,
      text: item.label,
      kind: 'label',
      pauseAfter: 45,
    })

    item.value.forEach((line, lineIndex) => {
      segments.push({
        key: `${itemIndex}-value-${lineIndex}`,
        text: line,
        kind: 'value',
        pauseAfter: lineIndex === item.value.length - 1 ? 65 : 24,
      })
    })
  })

  return segments
}

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

function ProfileConsoleTypewriter({
  language,
  onLanguageToggle,
}: {
  language: ProfileLanguage
  onLanguageToggle: () => void
}) {
  const [hasEnteredView, setHasEnteredView] = useState(false)
  const [typingState, setTypingState] = useState({
    language,
    visibleCharacters: 0,
  })
  const screenRef = useRef<HTMLDivElement>(null)
  const initialTypingLanguageRef = useRef(language)
  const hasConsumedInitialPlaybackRef = useRef(false)
  const profile = profileCopy[language]
  const segments = getProfileTypewriterSegments(language)
  const totalCharacters = segments.reduce(
    (total, segment) => total + Array.from(segment.text).length,
    0,
  )
  const visibleCharacters =
    typingState.language === language
      ? typingState.visibleCharacters
      : totalCharacters
  const renderedSegments = new Map<
    string,
    { visibleText: string; showCursor: boolean; showEndCursor: boolean }
  >()
  let characterOffset = 0

  segments.forEach((segment, segmentIndex) => {
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
        segmentIndex === segments.length - 1 &&
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

    const typingSegments = getProfileTypewriterSegments(language)
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const shouldPlayInitialAnimation =
      !hasConsumedInitialPlaybackRef.current &&
      language === initialTypingLanguageRef.current

    if (reducedMotionQuery.matches || !shouldPlayInitialAnimation) {
      hasConsumedInitialPlaybackRef.current = true
      const frame = window.requestAnimationFrame(() => {
        setTypingState({ language, visibleCharacters: totalCharacters })
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
      if (isCancelled || segmentIndex >= typingSegments.length) {
        return
      }

      hasConsumedInitialPlaybackRef.current = true

      const segment = typingSegments[segmentIndex]
      const characters = Array.from(segment.text)

      if (characterIndex < characters.length) {
        characterIndex += 1
        nextVisibleCharacters += 1
        setTypingState({
          language,
          visibleCharacters: nextVisibleCharacters,
        })

        const characterDelay =
          language === 'jp'
            ? segment.kind === 'label'
              ? 18
              : 8
            : segment.kind === 'label'
              ? 14
              : 6

        timeoutId = window.setTimeout(typeNextCharacter, characterDelay)
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
  }, [hasEnteredView, language, totalCharacters])

  return (
    <div ref={screenRef} className={styles.profileScreen} aria-live="polite">
      <div
        className={`${styles.profileScreenContent} ${
          language === 'jp' ? styles.profileJapanese : ''
        }`}
      >
        <dl className={styles.profileList}>
          {profile.items.map((item, itemIndex) => {
            const labelSegment = renderedSegments.get(`${itemIndex}-label`)

            return (
              <div key={item.label}>
                <dt>
                  <ProfileTypewriterLine
                    text={item.label}
                    visibleText={labelSegment?.visibleText ?? ''}
                    showCursor={labelSegment?.showCursor ?? false}
                    showEndCursor={labelSegment?.showEndCursor ?? false}
                  />
                </dt>
                <dd>
                  {item.value.map((line, lineIndex) => {
                    const segment = renderedSegments.get(
                      `${itemIndex}-value-${lineIndex}`,
                    )

                    return (
                      <ProfileTypewriterLine
                        key={line}
                        text={line}
                        visibleText={segment?.visibleText ?? ''}
                        showCursor={segment?.showCursor ?? false}
                        showEndCursor={segment?.showEndCursor ?? false}
                      />
                    )
                  })}
                </dd>
              </div>
            )
          })}
        </dl>

        <button
          type="button"
          className={styles.profileLanguage}
          onClick={onLanguageToggle}
        >
          {profile.languageLabel}
          <br />
          {profile.languageSwitch}
        </button>
      </div>
    </div>
  )
}

export default function ProfileView() {
  const [profileLanguage, setProfileLanguage] = useState<ProfileLanguage>('en')
  const { isInverted, toggleTheme } = useSiteTheme()
  const [designScale, setDesignScale] = useState(1)
  const profileConsoleFrameRef = useRef<HTMLDivElement>(null)
  const profile = profileCopy[profileLanguage]

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
    '--profile-list-gap': scaledPx(14),
    '--profile-list-dt-size': scaledPx(18.9),
    '--profile-list-dd-size': scaledPx(16.3),
    '--profile-list-dd-jp-size': scaledPx(16),
    '--profile-language-width': scaledPx(112),
    '--profile-language-height': scaledPx(120),
    '--profile-language-font-size': scaledPx(10.9),
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
        <p
          className={`${styles.profileLead} ${
            profileLanguage === 'jp' ? styles.profileJapanese : ''
          }`}
        >
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

            <ProfileConsoleTypewriter
              language={profileLanguage}
              onLanguageToggle={() =>
                setProfileLanguage((currentLanguage) =>
                  currentLanguage === 'en' ? 'jp' : 'en',
                )
              }
            />
          </div>
        </div>
      </section>
    </main>
  )
}
