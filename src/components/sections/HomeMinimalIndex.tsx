'use client'

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import Link from 'next/link'
import { profileCopy, type ProfileLanguage } from '@/data/profile'
import HomePhysicsFooter from './HomePhysicsFooter'
import styles from './HomeMinimalIndex.module.css'

const polaroidAssetPath = '/home/images/works-polaroid'
const worksCameraAssetPath = '/home/images/works-camera'
const profileJapaneseFontSpec = '1rem "WadaLabChuMaruGo2004P"'
const profileJapaneseFontSample = '日本語プロフィール制作スキル'

const stampPhotoAssets = [
  `${worksCameraAssetPath}/stamp-photo-01.svg`,
  `${worksCameraAssetPath}/stamp-photo-02.svg`,
  `${worksCameraAssetPath}/stamp-photo-03.svg`,
  `${worksCameraAssetPath}/stamp-photo-04.svg`,
  `${worksCameraAssetPath}/stamp-photo-05.svg`,
]

const stampHintCharacters = [
  { char: 'カ', x: -5.15, y: 1.8, rotate: -20, swingA: -4, swingB: 6, delay: 0 },
  { char: 'メ', x: -4.03, y: 1.2, rotate: -11, swingA: 5, swingB: -5, delay: 140 },
  { char: 'ラ', x: -2.88, y: 0.72, rotate: -10, swingA: -3, swingB: 7, delay: 60 },
  { char: 'を', x: -1.62, y: 0.46, rotate: -2, swingA: 6, swingB: -4, delay: 210 },
  { char: '押', x: -0.28, y: 0.34, rotate: 1, swingA: -5, swingB: 5, delay: 100 },
  { char: 'し', x: 1.02, y: 0.42, rotate: 5, swingA: 4, swingB: -6, delay: 260 },
  { char: 'て', x: 2.22, y: 0.66, rotate: 5, swingA: -7, swingB: 3, delay: 40 },
  { char: 'み', x: 3.28, y: 1.06, rotate: 14, swingA: 5, swingB: -5, delay: 180 },
  { char: 'て', x: 4.2, y: 1.58, rotate: 15, swingA: -4, swingB: 6, delay: 90 },
  { char: '！', x: 5.0, y: 2.16, rotate: 26, swingA: 6, swingB: -4, delay: 230 },
]

type StampPhoto = {
  id: number
  src: string
  x: number
  y: number
  rotate: number
  offsetX: number
  offsetY: number
  scale: number
}

const polaroidCategories = [
  {
    label: 'Branding',
    image: `${polaroidAssetPath}/work-branding.jpg`,
    href: '/works?category=branding',
  },
  {
    label: 'Illustration',
    image: `${polaroidAssetPath}/work-illustration.jpg`,
    href: '/works?category=illustration',
  },
  {
    label: 'Web',
    image: `${polaroidAssetPath}/work-web.jpg`,
    href: '/works?category=web',
  },
  {
    label: 'Photography',
    image: `${polaroidAssetPath}/work-photography.jpg`,
    href: '/works?category=photography',
  },
]

const featuredPolaroids = [
  {
    title: 'Loop Identity System',
    ghost: 'Branding',
    role: 'VI / LOGO / Package',
    year: '2026',
    image: `${polaroidAssetPath}/featured-01.jpg`,
    href: '/works/loop-identity-system',
  },
  {
    title: 'Type Signal Posters',
    ghost: 'Illustration',
    role: 'LOGO / Typography / Poster',
    year: '2025',
    image: `${polaroidAssetPath}/featured-02.jpg`,
    href: '/works/type-signal-posters',
  },
  {
    title: 'Etsu Portfolio System',
    ghost: 'Web Design',
    role: 'Web / Interaction / Frontend',
    year: '2026',
    image: `${polaroidAssetPath}/featured-03.jpg`,
    href: '/works/etsu-portfolio-system',
  },
  {
    title: 'North Pier Frames',
    ghost: 'Photography',
    role: 'Photography / Retouching',
    year: '2025',
    image: `${polaroidAssetPath}/featured-04.jpg`,
    href: '/works/north-pier-frames',
  },
]

function ViewMoreWorksCue() {
  const rawId = useId()
  const ringPathId = `view-more-works-ring-${rawId.replace(/:/g, '')}`

  return (
    <span className={styles.viewMoreWorksCue} aria-hidden="true">
      <svg viewBox="0 0 140 140" className={styles.viewMoreWorksCueSvg}>
        <defs>
          <path
            id={ringPathId}
            d="M70 70 m -54 0 a 54 54 0 1 1 108 0 a 54 54 0 1 1 -108 0"
          />
        </defs>
        <g className={styles.viewMoreWorksCueText}>
          <text>
            <textPath href={`#${ringPathId}`} startOffset="0%">
              View more Works
            </textPath>
          </text>
          <text>
            <textPath href={`#${ringPathId}`} startOffset="50%">
              View more Works
            </textPath>
          </text>
        </g>
        <g className={styles.viewMoreWorksCueArrow}>
          <path d="M45 70H92" />
          <path d="M79 57 94 70 79 83" />
        </g>
      </svg>
    </span>
  )
}

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

export default function HomeMinimalIndex() {
  const [profileLanguage, setProfileLanguage] = useState<ProfileLanguage>('en')
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [isWorkCueActive, setIsWorkCueActive] = useState(false)
  const [isFeaturedBoardActive, setIsFeaturedBoardActive] = useState(false)
  const [isFeaturedLargeViewMoreActive, setIsFeaturedLargeViewMoreActive] = useState(false)
  const [isWorksStampCameraVisible, setIsWorksStampCameraVisible] = useState(false)
  const [isWorksStampCameraPressed, setIsWorksStampCameraPressed] = useState(false)
  const [isWorksStampHintActive, setIsWorksStampHintActive] = useState(false)
  const [isProfileCharacterActive, setIsProfileCharacterActive] = useState(false)
  const [isProfileCharacterReady, setIsProfileCharacterReady] = useState(false)
  const [stampPhotos, setStampPhotos] = useState<StampPhoto[]>([])
  const [homeDesignScale, setHomeDesignScale] = useState(1)
  const worksStampZoneRef = useRef<HTMLDivElement>(null)
  const mobileWorksStampStageRef = useRef<HTMLDivElement>(null)
  const polaroidHeroRef = useRef<HTMLDivElement>(null)
  const featuredBoardRef = useRef<HTMLDivElement>(null)
  const featuredLargeStackRef = useRef<HTMLDivElement>(null)
  const profileCharacterRef = useRef<HTMLSpanElement>(null)
  const profileConsoleFrameRef = useRef<HTMLDivElement>(null)
  const mobileStampPointerStartRef = useRef<{
    pointerId: number
    clientX: number
    clientY: number
  } | null>(null)
  const mobileStampPressTimerRef = useRef<number | null>(null)
  const stampPhotoIdRef = useRef(0)
  const hasShownWorksStampHintRef = useRef(false)
  const hasDismissedWorksStampHintRef = useRef(false)
  const profileJapaneseFontReadyRef = useRef(false)
  const profileJapaneseFontLoadRef = useRef<Promise<void> | null>(null)
  const profile = profileCopy[profileLanguage]
  const activeCategory = polaroidCategories[activeCategoryIndex]

  const loadProfileJapaneseFont = useCallback(() => {
    if (profileJapaneseFontReadyRef.current) {
      return Promise.resolve()
    }

    if (typeof document === 'undefined' || !('fonts' in document)) {
      return Promise.resolve()
    }

    const fontSet = document.fonts

    if (fontSet.check(profileJapaneseFontSpec, profileJapaneseFontSample)) {
      profileJapaneseFontReadyRef.current = true
      return Promise.resolve()
    }

    if (!profileJapaneseFontLoadRef.current) {
      profileJapaneseFontLoadRef.current = fontSet
        .load(profileJapaneseFontSpec, profileJapaneseFontSample)
        .then(() => {
          profileJapaneseFontReadyRef.current = true
        })
        .catch(() => {
          profileJapaneseFontLoadRef.current = null
        })
    }

    return profileJapaneseFontLoadRef.current
  }, [])

  const handleProfileLanguageToggle = useCallback(() => {
    if (profileLanguage === 'jp') {
      setProfileLanguage('en')
      return
    }

    void loadProfileJapaneseFont().then(() => {
      setProfileLanguage((currentLanguage) =>
        currentLanguage === 'en' ? 'jp' : currentLanguage,
      )
    })
  }, [loadProfileJapaneseFont, profileLanguage])

  useEffect(() => {
    const updateHomeDesignScale = () => {
      const widthScale = window.innerWidth / 1920
      const heightScale = window.innerHeight / 1080
      const nextScale = Math.max(0.78, Math.min(1, widthScale, heightScale))

      setHomeDesignScale(Math.round(nextScale * 1000) / 1000)
    }

    updateHomeDesignScale()
    window.addEventListener('resize', updateHomeDesignScale)

    return () => {
      window.removeEventListener('resize', updateHomeDesignScale)
    }
  }, [])

  useEffect(() => {
    void loadProfileJapaneseFont()
  }, [loadProfileJapaneseFont])

  const handlePolaroidPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()

    event.currentTarget.style.setProperty(
      '--view-more-cue-x',
      `${event.clientX - rect.left}px`,
    )
    event.currentTarget.style.setProperty(
      '--view-more-cue-y',
      `${event.clientY - rect.top}px`,
    )
  }

  const isWorksStampExcludedTarget = (target: EventTarget | null) =>
    target instanceof Element && Boolean(target.closest('a, button, [data-works-stamp-exclude]'))

  const addWorksStampPhoto = (point: { x: number; y: number }) => {
    const nextPhoto: StampPhoto = {
      id: stampPhotoIdRef.current,
      src: stampPhotoAssets[Math.floor(Math.random() * stampPhotoAssets.length)],
      x: point.x,
      y: point.y,
      rotate: Math.round((Math.random() * 30 - 15) * 10) / 10,
      offsetX: Math.round((Math.random() * 44 - 22) * homeDesignScale),
      offsetY: Math.round((Math.random() * 36 - 18) * homeDesignScale),
      scale: Math.round((0.9 + Math.random() * 0.16) * 100) / 100,
    }

    stampPhotoIdRef.current += 1
    setStampPhotos((currentPhotos) => [...currentPhotos, nextPhoto].slice(-10))
  }

  const updateWorksStampCursor = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== 'mouse'
      || window.matchMedia('(max-width: 640px)').matches
    ) {
      return null
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }

    event.currentTarget.style.setProperty('--stamp-cursor-x', `${point.x}px`)
    event.currentTarget.style.setProperty('--stamp-cursor-y', `${point.y}px`)

    return point
  }

  const handleWorksStampPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (isWorksStampExcludedTarget(event.target)) {
      setIsWorksStampCameraVisible(false)
      setIsWorksStampCameraPressed(false)
      return
    }

    if (!updateWorksStampCursor(event)) {
      return
    }

    setIsWorksStampCameraVisible(true)

    if (!hasDismissedWorksStampHintRef.current) {
      setIsWorksStampHintActive(true)
    }
  }

  const handleWorksStampPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isWorksStampExcludedTarget(event.target)) {
      setIsWorksStampCameraVisible(false)
      setIsWorksStampCameraPressed(false)
      return
    }

    if (!updateWorksStampCursor(event)) {
      return
    }

    if (!isWorksStampCameraVisible) {
      setIsWorksStampCameraVisible(true)
    }

    if (!hasDismissedWorksStampHintRef.current && !isWorksStampHintActive) {
      setIsWorksStampHintActive(true)
    }
  }

  const handleWorksStampPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    if (isWorksStampExcludedTarget(event.target)) {
      setIsWorksStampCameraVisible(false)
      setIsWorksStampCameraPressed(false)
      return
    }

    const point = updateWorksStampCursor(event)

    if (!point) {
      return
    }

    hasDismissedWorksStampHintRef.current = true
    setIsWorksStampHintActive(false)

    setIsWorksStampCameraPressed(true)
    addWorksStampPhoto(point)
  }

  const handleWorksStampPointerUp = () => {
    setIsWorksStampCameraPressed(false)
  }

  const handleWorksStampPointerLeave = () => {
    if (window.matchMedia('(max-width: 640px)').matches) {
      return
    }

    setIsWorksStampCameraVisible(false)
    setIsWorksStampCameraPressed(false)
  }

  const handleMobileStampPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    event.stopPropagation()
    mobileStampPointerStartRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    }
  }

  const handleMobileStampPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()

    const startPoint = mobileStampPointerStartRef.current
    mobileStampPointerStartRef.current = null

    if (!startPoint || startPoint.pointerId !== event.pointerId) {
      return
    }

    const movement = Math.hypot(
      event.clientX - startPoint.clientX,
      event.clientY - startPoint.clientY,
    )

    if (movement > 12) {
      return
    }

    const stage = mobileWorksStampStageRef.current

    if (!stage) {
      return
    }

    const rect = stage.getBoundingClientRect()
    const point = {
      x: Math.min(Math.max(event.clientX - rect.left, 54), rect.width - 54),
      y: Math.min(Math.max(event.clientY - rect.top, 48), rect.height - 48),
    }

    stage.style.setProperty('--stamp-cursor-x', `${point.x}px`)
    stage.style.setProperty('--stamp-cursor-y', `${point.y}px`)

    hasDismissedWorksStampHintRef.current = true
    setIsWorksStampHintActive(false)
    setIsWorksStampCameraVisible(true)
    setIsWorksStampCameraPressed(true)
    addWorksStampPhoto(point)

    if (mobileStampPressTimerRef.current !== null) {
      window.clearTimeout(mobileStampPressTimerRef.current)
    }

    mobileStampPressTimerRef.current = window.setTimeout(() => {
      setIsWorksStampCameraPressed(false)
      mobileStampPressTimerRef.current = null
    }, 160)
  }

  const handleMobileStampPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    mobileStampPointerStartRef.current = null
  }

  useEffect(() => {
    return () => {
      if (mobileStampPressTimerRef.current !== null) {
        window.clearTimeout(mobileStampPressTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const zone = worksStampZoneRef.current

    if (!zone || window.matchMedia('(max-width: 640px)').matches) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          !entry.isIntersecting
          || hasShownWorksStampHintRef.current
          || hasDismissedWorksStampHintRef.current
        ) {
          return
        }

        hasShownWorksStampHintRef.current = true
        setIsWorksStampHintActive(true)

        observer.disconnect()
      },
      {
        rootMargin: '-18% 0px -18% 0px',
        threshold: 0.22,
      },
    )

    observer.observe(zone)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const stage = mobileWorksStampStageRef.current

    if (!stage || !window.matchMedia('(max-width: 640px)').matches) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          !entry.isIntersecting
          || hasShownWorksStampHintRef.current
          || hasDismissedWorksStampHintRef.current
        ) {
          return
        }

        stage.style.setProperty('--stamp-cursor-x', '50%')
        stage.style.setProperty('--stamp-cursor-y', '50%')
        hasShownWorksStampHintRef.current = true
        setIsWorksStampCameraVisible(true)
        setIsWorksStampHintActive(true)
        observer.disconnect()
      },
      {
        rootMargin: '-18% 0px -18% 0px',
        threshold: 0.42,
      },
    )

    observer.observe(stage)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const polaroidHero = polaroidHeroRef.current

    if (!polaroidHero) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        setActiveCategoryIndex(0)
        setIsWorkCueActive(false)
        window.requestAnimationFrame(() => {
          setIsWorkCueActive(true)
        })
        observer.disconnect()
      },
      {
        rootMargin: '-28% 0px -22% 0px',
        threshold: 0.35,
      },
    )

    observer.observe(polaroidHero)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const board = featuredBoardRef.current

    if (!board) {
      return
    }

    const topPhoto = board.querySelector<HTMLElement>(`.${styles.featuredPhoto}`)

    if (!topPhoto) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        setIsFeaturedBoardActive(true)
        observer.disconnect()
      },
      {
        rootMargin: '0px 0px -4% 0px',
        threshold: 0.78,
      },
    )

    observer.observe(topPhoto)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const featuredLargeStack = featuredLargeStackRef.current

    if (!featuredLargeStack) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        setIsFeaturedLargeViewMoreActive(true)
        observer.disconnect()
      },
      {
        rootMargin: '-24% 0px -18% 0px',
        threshold: 0.18,
      },
    )

    observer.observe(featuredLargeStack)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const consoleFrame = profileConsoleFrameRef.current

    if (!consoleFrame) {
      return
    }

    const mobileQuery = window.matchMedia('(max-width: 640px)')

    const centerProfileConsole = () => {
      consoleFrame.style.removeProperty('--home-profile-console-center-shift')

      if (!mobileQuery.matches) {
        return
      }

      const consoleRect = consoleFrame.getBoundingClientRect()
      const viewportCenter = document.documentElement.clientWidth / 2
      const consoleCenter = consoleRect.left + consoleRect.width / 2
      const centerShift = Math.round((viewportCenter - consoleCenter) * 10) / 10

      consoleFrame.style.setProperty(
        '--home-profile-console-center-shift',
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

  useEffect(() => {
    const character = profileCharacterRef.current

    if (!character) {
      return
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        setIsProfileCharacterActive(true)

        if (reducedMotionQuery.matches) {
          setIsProfileCharacterReady(true)
        }

        observer.disconnect()
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.16,
      },
    )

    observer.observe(character)

    return () => {
      observer.disconnect()
    }
  }, [])

  const featuredBoardClassName = [
    styles.featuredBoard,
    isFeaturedBoardActive ? styles.featuredBoardActive : '',
  ]
    .filter(Boolean)
    .join(' ')

  const featuredLargeStackClassName = [
    styles.featuredLargeStack,
    isFeaturedBoardActive ? styles.featuredLargeDeckActive : '',
    isFeaturedLargeViewMoreActive ? styles.featuredLargeViewMoreActive : '',
  ]
    .filter(Boolean)
    .join(' ')
  const worksStampZoneClassName = [
    styles.worksStampZone,
    isWorksStampCameraVisible ? styles.worksStampZoneCameraActive : '',
  ]
    .filter(Boolean)
    .join(' ')
  const scaledPx = (value: number) => `${Math.round(value * homeDesignScale * 10) / 10}px`
  const homeScaleStyle = {
    '--home-layout-width': scaledPx(1480),
    '--home-section-pad-x': scaledPx(76),
    '--home-section-pad-top': scaledPx(150),
    '--home-works-overhang': scaledPx(200),
    '--home-polaroid-gap': scaledPx(112),
    '--home-polaroid-min-height': scaledPx(780),
    '--home-camera-stage-width': scaledPx(520),
    '--home-stamp-photo-width': scaledPx(118),
    '--home-stamp-camera-width': scaledPx(152),
    '--home-stamp-hint-offset': scaledPx(14),
    '--home-stamp-hint-font-size': scaledPx(22.7),
    '--home-featured-row-min': scaledPx(360),
    '--home-featured-row-gap': scaledPx(70),
    '--home-featured-margin-top': scaledPx(122),
    '--home-featured-item-min-height': scaledPx(650),
    '--home-featured-item-y': scaledPx(170),
    '--home-featured-copy-width': scaledPx(340),
    '--home-featured-large-width': scaledPx(1020),
    '--home-featured-large-margin': scaledPx(20),
    '--home-featured-large-stack-x': scaledPx(-24),
    '--home-featured-large-stack-y': scaledPx(-270),
    '--home-featured-large-spread-x': scaledPx(-90),
    '--home-view-more-right': scaledPx(-130),
    '--home-view-more-bottom': scaledPx(64),
    '--home-view-more-width': scaledPx(480),
    '--home-view-more-gap': scaledPx(16),
    '--home-view-more-pad-top': scaledPx(35),
    '--home-view-more-pad-right': scaledPx(32),
    '--home-view-more-pad-bottom': scaledPx(79),
    '--home-view-more-pad-left': scaledPx(39),
    '--home-view-more-text-size': scaledPx(27.5),
    '--home-view-more-arrow-width': scaledPx(66),
    '--home-view-more-hover-x': scaledPx(29),
    '--home-profile-margin-top': scaledPx(210),
    '--home-profile-stage-min-height': scaledPx(860),
    '--home-profile-character-left': scaledPx(34),
    '--home-profile-character-bottom': scaledPx(176),
    '--home-profile-character-width': scaledPx(520),
    '--home-profile-character-enter-x': scaledPx(132),
    '--home-profile-character-enter-y': scaledPx(96),
    '--home-profile-character-overshoot-x': scaledPx(-14),
    '--home-profile-character-overshoot-y': scaledPx(-16),
    '--home-profile-character-settle-x': scaledPx(5),
    '--home-profile-character-settle-y': scaledPx(6),
    '--home-profile-character-fine-x': scaledPx(-3),
    '--home-profile-character-fine-y': scaledPx(-5),
    '--home-profile-character-hover-y': scaledPx(-18),
    '--home-profile-character-hover-y-small': scaledPx(-8),
    '--home-profile-console-width': scaledPx(980),
    '--home-profile-console-margin': scaledPx(-76),
    '--home-contact-tail': scaledPx(680),
    '--home-contact-margin-top': scaledPx(250),
    '--home-direct-mail-doodle-width': scaledPx(520),
    '--featured-copy-1-stack-x': scaledPx(180),
    '--featured-copy-1-stack-y': scaledPx(18),
    '--featured-copy-1-x': scaledPx(-130),
    '--featured-copy-1-y': scaledPx(50),
    '--featured-copy-1-title-x': scaledPx(-5),
    '--featured-copy-1-title-y': scaledPx(-10),
    '--featured-copy-1-role-x': scaledPx(-15),
    '--featured-copy-1-role-y': scaledPx(46),
    '--featured-copy-1-year-x': scaledPx(2),
    '--featured-copy-1-year-y': scaledPx(100),
    '--featured-copy-2-stack-x': scaledPx(-178),
    '--featured-copy-2-stack-y': scaledPx(24),
    '--featured-copy-2-x': scaledPx(180),
    '--featured-copy-2-y': scaledPx(-64),
    '--featured-copy-2-title-x': scaledPx(8),
    '--featured-copy-2-role-x': scaledPx(-6),
    '--featured-copy-2-role-y': scaledPx(42),
    '--featured-copy-2-year-x': scaledPx(-25),
    '--featured-copy-2-year-y': scaledPx(90),
    '--featured-copy-3-stack-x': scaledPx(176),
    '--featured-copy-3-stack-y': scaledPx(-18),
    '--featured-copy-3-x': scaledPx(-200),
    '--featured-copy-3-y': scaledPx(40),
    '--featured-copy-3-title-x': scaledPx(-5),
    '--featured-copy-3-title-y': scaledPx(-10),
    '--featured-copy-3-role-x': scaledPx(-10),
    '--featured-copy-3-role-y': scaledPx(50),
    '--featured-copy-3-year-x': scaledPx(-4),
    '--featured-copy-3-year-y': scaledPx(92),
    '--featured-copy-4-stack-x': scaledPx(-170),
    '--featured-copy-4-stack-y': scaledPx(-18),
    '--featured-copy-4-x': scaledPx(220),
    '--featured-copy-4-y': scaledPx(-20),
    '--featured-copy-4-title-x': scaledPx(-10),
    '--featured-copy-4-role-x': scaledPx(10),
    '--featured-copy-4-role-y': scaledPx(54),
    '--featured-copy-4-year-x': scaledPx(20),
    '--featured-copy-4-year-y': scaledPx(96),
  } as CSSProperties

  return (
    <section
      className={styles.index}
      aria-labelledby="home-work-index-title"
      style={homeScaleStyle}
    >
      <div
        className={`${styles.worksPolaroid} ${isWorkCueActive ? styles.worksPolaroidCue : ''}`}
        aria-labelledby="home-work-index-title"
      >
        <div
          ref={worksStampZoneRef}
          className={worksStampZoneClassName}
          onPointerEnter={handleWorksStampPointerEnter}
          onPointerMove={handleWorksStampPointerMove}
          onPointerDown={handleWorksStampPointerDown}
          onPointerUp={handleWorksStampPointerUp}
          onPointerCancel={handleWorksStampPointerLeave}
          onPointerLeave={handleWorksStampPointerLeave}
        >
          <div className={styles.worksStampPhotoLayer} aria-hidden="true">
            {stampPhotos.map((photo) => (
              <img
                key={photo.id}
                src={photo.src}
                alt=""
                className={styles.worksStampPhoto}
                draggable={false}
                style={
                  {
                    '--stamp-photo-x': `${photo.x}px`,
                    '--stamp-photo-y': `${photo.y}px`,
                    '--stamp-photo-offset-x': `${photo.offsetX}px`,
                    '--stamp-photo-offset-y': `${photo.offsetY}px`,
                    '--stamp-photo-rotate': `${photo.rotate}deg`,
                    '--stamp-photo-scale': `${photo.scale}`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <span
            className={[
              styles.worksStampCamera,
              isWorksStampCameraVisible ? styles.worksStampCameraVisible : '',
              isWorksStampCameraPressed ? styles.worksStampCameraPressed : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          >
            {isWorksStampHintActive && (
              <span className={styles.worksStampHint}>
                {stampHintCharacters.map((item, index) => (
                  <span
                    className={styles.worksStampHintChar}
                    key={`${item.char}-${index}`}
                    style={
                      {
                        '--stamp-hint-index': index,
                        '--stamp-hint-x': `${item.x}em`,
                        '--stamp-hint-y': `${item.y}em`,
                        '--stamp-hint-rotate': `${item.rotate}deg`,
                        '--stamp-hint-wiggle-a': `${item.swingA}deg`,
                        '--stamp-hint-wiggle-b': `${item.swingB}deg`,
                        '--stamp-hint-wiggle-delay': `${item.delay}ms`,
                      } as CSSProperties
                    }
                  >
                    <span className={styles.worksStampHintGlyph}>
                      {item.char === '押' ? (
                        <img
                          src={`${worksCameraAssetPath}/stamp-hint-osu.svg`}
                          alt=""
                          className={styles.worksStampHintOsu}
                          draggable={false}
                        />
                      ) : (
                        item.char
                      )}
                    </span>
                  </span>
                ))}
              </span>
            )}
            <img
              src={`${worksCameraAssetPath}/stamp-camera-idle-back.svg`}
              alt=""
              className={`${styles.worksStampCameraBack} ${styles.worksStampCameraIdleBack}`}
              draggable={false}
            />
            <img
              src={`${worksCameraAssetPath}/stamp-camera-idle.svg`}
              alt=""
              className={styles.worksStampCameraIdle}
              draggable={false}
            />
            <img
              src={`${worksCameraAssetPath}/stamp-camera-pressed-back.svg`}
              alt=""
              className={`${styles.worksStampCameraBack} ${styles.worksStampCameraPressedBack}`}
              draggable={false}
            />
            <img
              src={`${worksCameraAssetPath}/stamp-camera-pressed.svg`}
              alt=""
              className={styles.worksStampCameraPressedImage}
              draggable={false}
            />
          </span>

          <div className={styles.header}>
            <p className={styles.eyebrow}>Selected index</p>
            <h2 id="home-work-index-title" className={styles.title}>
              Works
            </h2>
            <p className={styles.intro}>
              Visual design, web direction, graphics, images, and small interactive
              experiments.
            </p>
          </div>

          <div ref={polaroidHeroRef} className={styles.polaroidHero}>
            <div className={styles.cameraStage} aria-label={`${activeCategory.label} work preview`}>
              <img
                src={`${polaroidAssetPath}/polaroid-camera-down.svg`}
                alt=""
                className={`${styles.cameraLayer} ${styles.cameraDown}`}
                draggable={false}
              />
              <span
                className={`${styles.cameraLayer} ${styles.cameraUp}`}
                aria-hidden="true"
              />
              <svg
                className={styles.cameraTextRing}
                viewBox="0 0 180 180"
                aria-hidden="true"
              >
                <defs>
                  <path
                    id="camera-category-ring"
                    d="M90 90 m -68 0 a 68 68 0 1 1 136 0 a 68 68 0 1 1 -136 0"
                  />
                </defs>
                <text>
                  <textPath href="#camera-category-ring" startOffset="8%">
                    Branding
                  </textPath>
                </text>
                <text>
                  <textPath href="#camera-category-ring" startOffset="32%">
                    Illustration
                  </textPath>
                </text>
                <text>
                  <textPath href="#camera-category-ring" startOffset="65%">
                    Web
                  </textPath>
                </text>
                <text>
                  <textPath href="#camera-category-ring" startOffset="78%">
                    Photography
                  </textPath>
                </text>
              </svg>
              <span className={styles.cameraCategoryLabel}>{activeCategory.label}</span>

              <div className={styles.paperMask}>
                <div className={styles.cameraPaper} key={activeCategory.label}>
                  <span className={styles.paperShell} aria-hidden="true" />
                  <img
                    src={activeCategory.image}
                    alt=""
                    className={styles.paperImage}
                    draggable={false}
                  />
                  <span className={styles.paperSurfaceShadow} aria-hidden="true" />
                  <span className={styles.paperCaption}>{activeCategory.label}</span>
                </div>
              </div>
            </div>

            <nav className={styles.polaroidCategories} aria-label="Work categories">
              {polaroidCategories.map((category, index) => (
                <Link
                  href={category.href}
                  key={category.label}
                  className={category.label === activeCategory.label ? styles.activeCategory : ''}
                  onMouseEnter={() => setActiveCategoryIndex(index)}
                  onFocus={() => setActiveCategoryIndex(index)}
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          </div>

          <div
            ref={mobileWorksStampStageRef}
            className={styles.mobileWorksStampStage}
            aria-label="Tap anywhere in this area to take a photo"
            onPointerDown={handleMobileStampPointerDown}
            onPointerUp={handleMobileStampPointerUp}
            onPointerCancel={handleMobileStampPointerCancel}
          >
            <div
              className={`${styles.worksStampPhotoLayer} ${styles.mobileWorksStampPhotoLayer}`}
              aria-hidden="true"
            >
              {stampPhotos.map((photo) => (
                <img
                  key={`mobile-${photo.id}`}
                  src={photo.src}
                  alt=""
                  className={`${styles.worksStampPhoto} ${styles.mobileWorksStampPhoto}`}
                  draggable={false}
                  style={
                    {
                      '--stamp-photo-x': `${photo.x}px`,
                      '--stamp-photo-y': `${photo.y}px`,
                      '--stamp-photo-offset-x': `${photo.offsetX}px`,
                      '--stamp-photo-offset-y': `${photo.offsetY}px`,
                      '--stamp-photo-rotate': `${photo.rotate}deg`,
                      '--stamp-photo-scale': `${photo.scale}`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            <span
              className={[
                styles.worksStampCamera,
                styles.mobileWorksStampCamera,
                isWorksStampCameraVisible ? styles.worksStampCameraVisible : '',
                isWorksStampCameraPressed ? styles.worksStampCameraPressed : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            >
              {isWorksStampHintActive && (
                <span className={styles.worksStampHint}>
                  {stampHintCharacters.map((item, index) => (
                    <span
                      className={styles.worksStampHintChar}
                      key={`mobile-${item.char}-${index}`}
                      style={
                        {
                          '--stamp-hint-index': index,
                          '--stamp-hint-x': `${item.x}em`,
                          '--stamp-hint-y': `${item.y}em`,
                          '--stamp-hint-rotate': `${item.rotate}deg`,
                          '--stamp-hint-wiggle-a': `${item.swingA}deg`,
                          '--stamp-hint-wiggle-b': `${item.swingB}deg`,
                          '--stamp-hint-wiggle-delay': `${item.delay}ms`,
                        } as CSSProperties
                      }
                    >
                      <span className={styles.worksStampHintGlyph}>
                        {item.char === '押' ? (
                          <img
                            src={`${worksCameraAssetPath}/stamp-hint-osu.svg`}
                            alt=""
                            className={styles.worksStampHintOsu}
                            draggable={false}
                          />
                        ) : (
                          item.char
                        )}
                      </span>
                    </span>
                  ))}
                </span>
              )}
              <img
                src={`${worksCameraAssetPath}/stamp-camera-idle-back.svg`}
                alt=""
                className={`${styles.worksStampCameraBack} ${styles.worksStampCameraIdleBack}`}
                draggable={false}
              />
              <img
                src={`${worksCameraAssetPath}/stamp-camera-idle.svg`}
                alt=""
                className={styles.worksStampCameraIdle}
                draggable={false}
              />
              <img
                src={`${worksCameraAssetPath}/stamp-camera-pressed-back.svg`}
                alt=""
                className={`${styles.worksStampCameraBack} ${styles.worksStampCameraPressedBack}`}
                draggable={false}
              />
              <img
                src={`${worksCameraAssetPath}/stamp-camera-pressed.svg`}
                alt=""
                className={styles.worksStampCameraPressedImage}
                draggable={false}
              />
            </span>
          </div>

          <div
            ref={featuredBoardRef}
            className={featuredBoardClassName}
          >
              {featuredPolaroids.map((work) => (
                <article className={styles.featuredItem} key={work.title}>
                  <div className={styles.featuredCopy}>
                    <span className={styles.featuredGhost}>{work.ghost}</span>
                    <h3 className={styles.featuredTitle}>{work.title}</h3>
                    <p className={styles.featuredRole}>{work.role}</p>
                    <span className={styles.featuredYear}>{work.year}</span>
                  </div>

                  <Link
                    href={work.href}
                    className={styles.featuredPhoto}
                    aria-label={`View ${work.title}`}
                    onPointerMove={handlePolaroidPointerMove}
                  >
                    <span className={styles.featuredShell} aria-hidden="true" />
                    <img
                      src={work.image}
                      alt=""
                      className={styles.featuredImage}
                      draggable={false}
                    />
                    <span className={styles.paperSurfaceShadow} aria-hidden="true" />
                    <span className={styles.featuredStrip}>
                      <span>{work.title}</span>
                      <span>{work.year}</span>
                    </span>
                    <ViewMoreWorksCue />
                  </Link>
                </article>
              ))}
          </div>

          <div
            ref={featuredLargeStackRef}
            className={featuredLargeStackClassName}
          >
              <Link
                className={styles.featuredLargeFrame}
                href="/works"
                aria-label="View Photography works"
                onPointerMove={handlePolaroidPointerMove}
              >
                <span className={styles.featuredLargeViewport} aria-hidden="true">
                  <picture className={styles.featuredLargePicture}>
                    <source
                      media="(max-width: 640px)"
                      srcSet={`${polaroidAssetPath}/featured-05-mobile.jpg`}
                    />
                    <img
                      src={`${polaroidAssetPath}/featured-05.jpg`}
                      alt=""
                      className={styles.featuredLargeImage}
                      draggable={false}
                    />
                  </picture>
                </span>
                <picture className={styles.featuredLargeFrameImage}>
                  <source
                    media="(max-width: 640px)"
                    srcSet={`${polaroidAssetPath}/polaroid-paper-blank-mobile.svg`}
                  />
                  <img
                    src={`${polaroidAssetPath}/polaroid-paper-blank-large.svg`}
                    alt=""
                    draggable={false}
                  />
                </picture>
                <span className={styles.featuredLargeSurfaceShadow} aria-hidden="true" />
                <span className={styles.featuredLargeStrip}>
                  <span>Photography</span>
                  <span>2026</span>
                </span>
                <ViewMoreWorksCue />
              </Link>

              <Link className={styles.viewMoreLink} href="/works" aria-label="View more works">
                <span className={styles.viewMoreText}>
                 view
                 <br />
                  more
                </span>
                <svg
                  className={styles.viewMoreArrow}
                  viewBox="0 0 64 28"
                  aria-hidden="true"
                >
                  <path d="M4 14H54" />
                  <path d="M44 5 56 14 44 23" />
                </svg>
              </Link>
          </div>
        </div>
      </div>

      <section className={styles.profileSection} aria-labelledby="home-profile-title">
        <div className={styles.profileHeader}>
          <p className={styles.eyebrow}>Selected profile</p>
          <h2 id="home-profile-title" className={styles.title}>
            Profile
          </h2>
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
        </div>

        <div className={styles.profileArcade}>
          <div className={styles.profileStage}>
            <span
              ref={profileCharacterRef}
              className={`${styles.profileCharacter} ${
                isProfileCharacterActive ? styles.profileCharacterActive : ''
              } ${isProfileCharacterReady ? styles.profileCharacterReady : ''}`}
              aria-hidden="true"
              onAnimationEnd={() => {
                if (isProfileCharacterActive) {
                  setIsProfileCharacterReady(true)
                }
              }}
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
                onLanguageToggle={handleProfileLanguageToggle}
              />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.contactWorld} data-contact-world>
        <HomePhysicsFooter />

        <section className={styles.contactSection} aria-labelledby="home-contact-title">
          <div className={styles.contactHeader}>
            <p className={styles.eyebrow}>Selected contact</p>
            <h2 id="home-contact-title" className={styles.title} data-physics-trigger>
              Contact
            </h2>
          </div>

          <div className={styles.directMailPanel}>
            <span className={styles.directMailDoodle} aria-hidden="true" />
            <h3 id="home-direct-mail-title" className={styles.directMailTitle}>
              Direct Mail
            </h3>
            <a
              className={styles.directMailLink}
              href="mailto:koetsu1147@gmail.com?subject=Portfolio%20Contact"
            >
              koetsu1147@gmail.com
            </a>
            <button
              type="button"
              className={styles.topButton}
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img src="/home/character-stage/ui/top-up.svg" alt="" draggable={false} />
              <span>back</span>
            </button>
            <div className={styles.contactCredits} aria-label="Footer credits">
              <p>Designed &amp; Built by ETSU.</p>
              <p>&copy; 2026</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
