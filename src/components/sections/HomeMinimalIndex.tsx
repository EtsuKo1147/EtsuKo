'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { profileCopy, type ProfileLanguage } from '@/data/profile'
import HomePhysicsFooter from './HomePhysicsFooter'
import styles from './HomeMinimalIndex.module.css'

const polaroidAssetPath = '/home/images/works-polaroid'

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

export default function HomeMinimalIndex() {
  const [profileLanguage, setProfileLanguage] = useState<ProfileLanguage>('en')
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [isWorkCueActive, setIsWorkCueActive] = useState(false)
  const [isFeaturedBoardActive, setIsFeaturedBoardActive] = useState(false)
  const [featuredBoardStep, setFeaturedBoardStep] = useState(0)
  const polaroidHeroRef = useRef<HTMLDivElement>(null)
  const featuredBoardRef = useRef<HTMLDivElement>(null)
  const profile = profileCopy[profileLanguage]
  const activeCategory = polaroidCategories[activeCategoryIndex]
  const featuredBoardStepClass =
    featuredBoardStep > 0
      ? styles[`featuredBoardMobileStep${featuredBoardStep}` as keyof typeof styles]
      : ''

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
            <span className={styles.cameraFlash} aria-hidden="true">
              <span className={`${styles.cameraFlashFrame} ${styles.cameraFlashOne}`} />
              <span className={`${styles.cameraFlashFrame} ${styles.cameraFlashTwo}`} />
            </span>
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

        <div
          ref={featuredBoardRef}
          className={featuredBoardClassName}
        >
          {featuredPolaroids.map((work) => (
            <article className={styles.featuredItem} key={work.title}>
              <div className={styles.featuredCopy}>
                <span className={styles.featuredGhost}>{work.ghost}</span>
                <h3>{work.title}</h3>
                <p>{work.role}</p>
                <span>{work.year}</span>
              </div>

              <Link
                href={work.href}
                className={styles.featuredPhoto}
                aria-label={`View ${work.title}`}
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
              </Link>
            </article>
          ))}
        </div>

        <Link className={styles.viewMoreLink} href="/works" aria-label="View more works">
          <span className={styles.viewMoreText}>view more</span>
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
