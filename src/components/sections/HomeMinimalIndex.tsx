'use client'

/* eslint-disable @next/next/no-img-element */

import {
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
  },
  {
    label: 'Illustration',
    image: `${polaroidAssetPath}/work-illustration.jpg`,
  },
  {
    label: 'Web',
    image: `${polaroidAssetPath}/work-web.jpg`,
  },
  {
    label: 'Photography',
    image: `${polaroidAssetPath}/work-photography.jpg`,
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

export default function HomeMinimalIndex() {
  const [profileLanguage, setProfileLanguage] = useState<ProfileLanguage>('en')
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [isWorkCueActive, setIsWorkCueActive] = useState(false)
  const [isFeaturedBoardActive, setIsFeaturedBoardActive] = useState(false)
  const [featuredBoardStep, setFeaturedBoardStep] = useState(0)
  const [isWorksStampCameraVisible, setIsWorksStampCameraVisible] = useState(false)
  const [isWorksStampCameraPressed, setIsWorksStampCameraPressed] = useState(false)
  const [isWorksStampHintActive, setIsWorksStampHintActive] = useState(false)
  const [stampPhotos, setStampPhotos] = useState<StampPhoto[]>([])
  const worksStampZoneRef = useRef<HTMLDivElement>(null)
  const polaroidHeroRef = useRef<HTMLDivElement>(null)
  const featuredBoardRef = useRef<HTMLDivElement>(null)
  const stampPhotoIdRef = useRef(0)
  const hasShownWorksStampHintRef = useRef(false)
  const profile = profileCopy[profileLanguage]
  const activeCategory = polaroidCategories[activeCategoryIndex]
  const featuredBoardStepClass =
    featuredBoardStep > 0
      ? styles[`featuredBoardMobileStep${featuredBoardStep}` as keyof typeof styles]
      : ''

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

  const updateWorksStampCursor = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') {
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
    if (!updateWorksStampCursor(event)) {
      return
    }

    setIsWorksStampCameraVisible(true)
  }

  const handleWorksStampPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!updateWorksStampCursor(event)) {
      return
    }

    if (!isWorksStampCameraVisible) {
      setIsWorksStampCameraVisible(true)
    }
  }

  const handleWorksStampPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    const point = updateWorksStampCursor(event)

    if (!point) {
      return
    }

    setIsWorksStampHintActive(false)

    setIsWorksStampCameraPressed(true)

    const clickedInteractiveElement =
      event.target instanceof Element && event.target.closest('a, button')

    if (clickedInteractiveElement) {
      return
    }

    const nextPhoto: StampPhoto = {
      id: stampPhotoIdRef.current,
      src: stampPhotoAssets[Math.floor(Math.random() * stampPhotoAssets.length)],
      x: point.x,
      y: point.y,
      rotate: Math.round((Math.random() * 30 - 15) * 10) / 10,
      offsetX: Math.round(Math.random() * 44 - 22),
      offsetY: Math.round(Math.random() * 36 - 18),
      scale: Math.round((0.9 + Math.random() * 0.16) * 100) / 100,
    }

    stampPhotoIdRef.current += 1
    setStampPhotos((currentPhotos) => [...currentPhotos, nextPhoto].slice(-10))
  }

  const handleWorksStampPointerUp = () => {
    setIsWorksStampCameraPressed(false)
  }

  const handleWorksStampPointerLeave = () => {
    setIsWorksStampCameraVisible(false)
    setIsWorksStampCameraPressed(false)
  }

  useEffect(() => {
    const zone = worksStampZoneRef.current

    if (!zone) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasShownWorksStampHintRef.current) {
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

    const mobileQuery = window.matchMedia('(max-width: 640px)')
    let observer: IntersectionObserver | null = null
    let frame = 0

    const updateMobileStep = () => {
      frame = 0

      if (!mobileQuery.matches) {
        return
      }

      const rect = board.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const progress =
        (viewportHeight * 0.72 - rect.top) /
        Math.max(rect.height - viewportHeight * 0.28, 1)

      let nextStep = 0

      if (progress >= 0.12) {
        nextStep = 1
      }

      if (progress >= 0.32) {
        nextStep = 2
      }

      if (progress >= 0.52) {
        nextStep = 3
      }

      if (progress >= 0.72) {
        nextStep = 4
      }

      setIsFeaturedBoardActive(progress >= 0.04)
      setFeaturedBoardStep(nextStep)
    }

    const requestMobileStepUpdate = () => {
      if (frame) {
        return
      }

      frame = window.requestAnimationFrame(updateMobileStep)
    }

    const setupFeaturedBoardTrigger = () => {
      observer?.disconnect()
      observer = null
      window.removeEventListener('scroll', requestMobileStepUpdate)
      window.removeEventListener('resize', requestMobileStepUpdate)

      if (mobileQuery.matches) {
        setIsFeaturedBoardActive(false)
        setFeaturedBoardStep(0)
        window.addEventListener('scroll', requestMobileStepUpdate, { passive: true })
        window.addEventListener('resize', requestMobileStepUpdate)
        requestMobileStepUpdate()
        return
      }

      setFeaturedBoardStep(0)
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return
          }

          setIsFeaturedBoardActive(true)
          observer?.disconnect()
          observer = null
        },
        {
          rootMargin: '-18% 0px -24% 0px',
          threshold: 0.18,
        },
      )

      observer.observe(board)
    }

    setupFeaturedBoardTrigger()
    mobileQuery.addEventListener('change', setupFeaturedBoardTrigger)

    return () => {
      observer?.disconnect()
      mobileQuery.removeEventListener('change', setupFeaturedBoardTrigger)
      window.removeEventListener('scroll', requestMobileStepUpdate)
      window.removeEventListener('resize', requestMobileStepUpdate)

      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

  const featuredBoardClassName = [
    styles.featuredBoard,
    isFeaturedBoardActive ? styles.featuredBoardActive : '',
    featuredBoardStepClass,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={styles.index} aria-labelledby="home-work-index-title">
      <div
        className={`${styles.worksPolaroid} ${isWorkCueActive ? styles.worksPolaroidCue : ''}`}
        aria-labelledby="home-work-index-title"
      >
        <div
          ref={worksStampZoneRef}
          className={styles.worksStampZone}
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
                  href="/works"
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

        <div className={styles.featuredLargeStack}>
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
            <span className={styles.profileCharacter} aria-hidden="true" />

            <div className={styles.profileConsoleFrame}>
              <img
                src="/home/character-stage/doodles/new-gameplayer-2-02.svg"
                alt=""
                className={styles.profileConsole}
                draggable={false}
              />

              <div className={styles.profileScreen} aria-live="polite">
                <div
                  key={profileLanguage}
                  className={`${styles.profileScreenContent} ${
                    profileLanguage === 'jp' ? styles.profileJapanese : ''
                  }`}
                >
                  <dl className={styles.profileList}>
                    {profile.items.map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>
                          {item.value.map((line) => (
                            <span key={line}>{line}</span>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    className={styles.profileLanguage}
                    onClick={() =>
                      setProfileLanguage((currentLanguage) =>
                        currentLanguage === 'en' ? 'jp' : 'en',
                      )
                    }
                  >
                    {profile.languageLabel}
                    <br />
                    {profile.languageSwitch}
                  </button>
                </div>
              </div>
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
