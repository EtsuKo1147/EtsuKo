'use client'

/* eslint-disable @next/next/no-img-element */

import Image from 'next/image'
import Link from 'next/link'
import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useSiteTheme } from '@/components/theme/SiteThemeProvider'
import type { Work, WorkImage } from '@/data/works'
import styles from './page.module.css'

type WorkDetailViewProps = {
  work: Work
  works: Work[]
}

type PreviewState = {
  index: number
  top: number
} | null

type SteppedGalleryProps = {
  title: string
  images: WorkImage[]
}

function SteppedGallery({ title, images }: SteppedGalleryProps) {
  const galleryRef = useRef<HTMLElement>(null)
  const figureRefs = useRef<(HTMLElement | null)[]>([])
  const activeIndexRef = useRef(0)
  const transitionRef = useRef(false)
  const wheelAccumulatorRef = useRef(0)
  const wheelLockedRef = useRef(false)
  const wheelUnlockTimerRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchCurrentYRef = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useLayoutEffect(() => {
    const gallery = galleryRef.current
    const figures = figureRefs.current.filter(
      (figure): figure is HTMLElement => figure !== null,
    )

    if (!gallery || figures.length === 0) {
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wheelThreshold = 42
    const touchThreshold = 48
    const animationDuration = reducedMotion ? 0 : 0.5

    activeIndexRef.current = 0
    setActiveIndex(0)

    gsap.set(figures, {
      yPercent: (index) => (index === 0 ? 0 : 100),
      zIndex: (index) => index + 1,
    })

    const updateAccessibility = (nextIndex: number) => {
      figures.forEach((figure, index) => {
        figure.setAttribute('aria-hidden', index === nextIndex ? 'false' : 'true')
      })
    }

    updateAccessibility(0)

    const scheduleWheelUnlock = (delay = 220) => {
      if (wheelUnlockTimerRef.current !== null) {
        window.clearTimeout(wheelUnlockTimerRef.current)
      }

      wheelUnlockTimerRef.current = window.setTimeout(() => {
        if (transitionRef.current) {
          scheduleWheelUnlock(100)
          return
        }

        wheelLockedRef.current = false
      }, delay)
    }

    const changeImage = (direction: 1 | -1) => {
      if (transitionRef.current) {
        return false
      }

      const currentIndex = activeIndexRef.current
      const nextIndex = currentIndex + direction

      if (nextIndex < 0 || nextIndex >= figures.length) {
        return false
      }

      transitionRef.current = true
      const animatedFigure = direction === 1 ? figures[nextIndex] : figures[currentIndex]

      gsap.to(animatedFigure, {
        yPercent: direction === 1 ? 0 : 100,
        duration: animationDuration,
        ease: reducedMotion ? 'none' : 'power3.inOut',
        overwrite: true,
        onComplete: () => {
          activeIndexRef.current = nextIndex
          setActiveIndex(nextIndex)
          updateAccessibility(nextIndex)
          transitionRef.current = false
        },
      })

      return true
    }

    const galleryIsSettledInViewport = () => {
      const rect = gallery.getBoundingClientRect()
      return rect.top <= 2 && rect.bottom >= window.innerHeight - 2
    }

    const handleWheel = (event: WheelEvent) => {
      if (!galleryIsSettledInViewport()) {
        wheelAccumulatorRef.current = 0
        return
      }

      const direction: 1 | -1 = event.deltaY >= 0 ? 1 : -1
      const isLeavingTowardIntro = direction === -1 && activeIndexRef.current === 0

      if (isLeavingTowardIntro && !transitionRef.current) {
        wheelAccumulatorRef.current = 0
        return
      }

      event.preventDefault()

      if (wheelLockedRef.current || transitionRef.current) {
        scheduleWheelUnlock()
        return
      }

      wheelAccumulatorRef.current += event.deltaY

      if (Math.abs(wheelAccumulatorRef.current) < wheelThreshold) {
        return
      }

      const moved = changeImage(wheelAccumulatorRef.current > 0 ? 1 : -1)
      wheelAccumulatorRef.current = 0

      if (moved) {
        wheelLockedRef.current = true
        scheduleWheelUnlock(650)
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]

      if (!touch || !galleryIsSettledInViewport()) {
        touchStartYRef.current = null
        touchCurrentYRef.current = null
        return
      }

      touchStartYRef.current = touch.clientY
      touchCurrentYRef.current = touch.clientY
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      const startY = touchStartYRef.current

      if (!touch || startY === null) {
        return
      }

      touchCurrentYRef.current = touch.clientY
      const isMovingToNext = touch.clientY < startY

      if (activeIndexRef.current > 0 || isMovingToNext) {
        event.preventDefault()
      }
    }

    const handleTouchEnd = () => {
      const startY = touchStartYRef.current
      const endY = touchCurrentYRef.current

      touchStartYRef.current = null
      touchCurrentYRef.current = null

      if (startY === null || endY === null || transitionRef.current) {
        return
      }

      const distance = startY - endY

      if (Math.abs(distance) >= touchThreshold) {
        changeImage(distance > 0 ? 1 : -1)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        if (changeImage(1)) {
          event.preventDefault()
        }
      }

      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        if (changeImage(-1)) {
          event.preventDefault()
        }
      }
    }

    gallery.addEventListener('wheel', handleWheel, { passive: false })
    gallery.addEventListener('touchstart', handleTouchStart, { passive: true })
    gallery.addEventListener('touchmove', handleTouchMove, { passive: false })
    gallery.addEventListener('touchend', handleTouchEnd, { passive: true })
    gallery.addEventListener('keydown', handleKeyDown)

    return () => {
      if (wheelUnlockTimerRef.current !== null) {
        window.clearTimeout(wheelUnlockTimerRef.current)
      }

      gsap.killTweensOf(figures)
      gallery.removeEventListener('wheel', handleWheel)
      gallery.removeEventListener('touchstart', handleTouchStart)
      gallery.removeEventListener('touchmove', handleTouchMove)
      gallery.removeEventListener('touchend', handleTouchEnd)
      gallery.removeEventListener('keydown', handleKeyDown)
    }
  }, [images])

  return (
    <section
      ref={galleryRef}
      className={styles.steppedGallery}
      aria-label={`${title} project images`}
      aria-roledescription="image gallery"
      tabIndex={0}
    >
      {images.map((image, index) => (
        <figure
          ref={(figure) => {
            figureRefs.current[index] = figure
          }}
          className={styles.steppedGalleryFigure}
          aria-label={`${title} image ${index + 2} of ${images.length + 1}`}
          aria-hidden={index !== activeIndex}
          key={`${image.url}-${index}`}
        >
          <img
            src={image.url}
            alt={image.alt || `${title} image ${index + 2}`}
            loading={index <= activeIndex + 1 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </figure>
      ))}
      <span className={styles.galleryAnnouncement} aria-live="polite">
        Image {activeIndex + 1} of {images.length}
      </span>
    </section>
  )
}

export default function WorkDetailView({ work, works }: WorkDetailViewProps) {
  const { isInverted, toggleTheme } = useSiteTheme()
  const pageRef = useRef<HTMLElement>(null)
  const narrativeRef = useRef<HTMLElement>(null)
  const introTextRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const categoryRef = useRef<HTMLParagraphElement>(null)
  const descriptionGroupRef = useRef<HTMLDivElement>(null)
  const coverPanelRef = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<PreviewState>(null)

  const currentIndex = Math.max(
    0,
    works.findIndex((item) => item.slug === work.slug),
  )
  const hasMultipleWorks = works.length > 1
  const previousWork = hasMultipleWorks
    ? works[(currentIndex - 1 + works.length) % works.length]
    : null
  const nextWork = hasMultipleWorks
    ? works[(currentIndex + 1) % works.length]
    : null
  const previewWork = preview ? works[preview.index] : null
  const usesSteppedGallery = currentIndex === 4 || currentIndex === 5

  const getSafePreviewTop = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const edge = Math.min(180, window.innerHeight / 3)
    return Math.max(edge, Math.min(window.innerHeight - edge, rect.top + rect.height / 2))
  }

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const page = pageRef.current
    const narrative = narrativeRef.current
    const introText = introTextRef.current
    const title = titleRef.current
    const category = categoryRef.current
    const descriptionGroup = descriptionGroupRef.current
    const coverPanel = coverPanelRef.current

    if (
      !page ||
      !narrative ||
      !introText ||
      !title ||
      !category ||
      !descriptionGroup ||
      !coverPanel
    ) {
      return
    }

    const context = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(title, {
          yPercent: 112,
          visibility: 'visible',
        })
        gsap.set(category, {
          y: () => window.innerHeight + category.offsetHeight + 48,
          visibility: 'visible',
        })
        gsap.set(coverPanel, {
          xPercent: 100,
          visibility: 'visible',
        })

        const clearIntroAnimation = () => {
          gsap.set([title, category, coverPanel], {
            clearProps: 'transform',
            visibility: 'visible',
          })
          gsap.set(descriptionGroup, {
            clearProps: 'transform,opacity,visibility',
          })
        }

        const introTimeline = gsap.timeline({
          defaults: { overwrite: 'auto' },
          onComplete: clearIntroAnimation,
          onInterrupt: clearIntroAnimation,
        })

        introTimeline
          .to(title, {
            yPercent: 0,
            duration: 0.4,
            ease: 'power4.out',
          })
          .to(
            category,
            {
              y: 0,
              duration: 0.32,
              ease: 'power3.out',
            },
            0.08,
          )
          .fromTo(
            descriptionGroup,
            {
              x: () => -(window.innerWidth + descriptionGroup.offsetWidth + 48),
              autoAlpha: 0,
            },
            {
              x: 0,
              autoAlpha: 1,
              duration: 0.32,
              ease: 'power3.out',
            },
            0.08,
          )
          .to(
            coverPanel,
            {
              xPercent: 0,
              duration: 0.4,
              ease: 'power3.out',
            },
            0,
          )
      })

      media.add(
        '(min-width: 761px) and (prefers-reduced-motion: no-preference)',
        () => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: narrative,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          })

          timeline
            .to(introText, {
              xPercent: -108,
              ease: 'none',
              duration: 0.46,
            })
            .to(
              coverPanel,
              {
                left: 0,
                ease: 'none',
                duration: 0.84,
              },
              0.14,
            )
        },
      )

      return () => media.revert()
    }, page)

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      context.revert()
    }
  }, [work.slug])

  const showPreview = (index: number, event: PointerEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }

    setPreview({ index, top: getSafePreviewTop(event.currentTarget) })
  }

  const pageStyle = {
    '--work-accent': work.accent,
    '--work-surface': work.surface,
  } as CSSProperties

  return (
    <main
      ref={pageRef}
      className={`${styles.page} ${isInverted ? styles.pageInverted : ''}`}
      style={pageStyle}
    >
      <button
        type="button"
        className={styles.invertToggle}
        aria-pressed={isInverted}
        aria-label={isInverted ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
      />

      <section ref={narrativeRef} className={styles.narrative} aria-label={`${work.title} introduction`}>
        <div className={styles.heroSticky}>
          <div className={styles.introPanel}>
            <div ref={introTextRef} className={styles.introContent}>
              <div className={styles.titleMask}>
                <h1 ref={titleRef} className={styles.title}>{work.title}</h1>
              </div>
              <p ref={categoryRef} className={styles.category}>
                {work.categoryLabel} / {work.year}
              </p>
              <div ref={descriptionGroupRef} className={styles.descriptionGroup}>
                <p className={styles.description}>{work.description}</p>
                {work.projectLinks && work.projectLinks.length > 0 ? (
                  <nav className={styles.projectLinks} aria-label={`${work.title} project links`}>
                    {work.projectLinks.map((link) => (
                      <a
                        href={link.url}
                        className={styles.projectLink}
                        target="_blank"
                        rel="noreferrer"
                        key={`${link.label}-${link.url}`}
                      >
                        <span>{link.label}</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </nav>
                ) : null}
              </div>
            </div>
          </div>

          <div ref={coverPanelRef} className={styles.coverPanel}>
            <figure className={styles.coverFigure}>
              {work.coverImageUrl ? (
                <Image
                  src={work.coverImageUrl}
                  alt={work.coverImageAlt || work.title}
                  fill
                  priority
                  sizes="100vw"
                  className={styles.coverImage}
                />
              ) : (
                <div
                  className={styles.coverFallback}
                  role="img"
                  aria-label={work.coverImageAlt || work.title}
                />
              )}
            </figure>
          </div>
        </div>
      </section>

      {work.galleryImages && work.galleryImages.length > 0 ? (
        usesSteppedGallery ? (
          <SteppedGallery
            key={work.slug}
            title={work.title}
            images={work.galleryImages}
          />
        ) : (
          <section className={styles.gallery} aria-label={`${work.title} project images`}>
            {work.galleryImages.map((image, index) => (
              <figure className={styles.galleryFigure} key={`${image.url}-${index}`}>
                <img
                  src={image.url}
                  alt={image.alt || `${work.title} image ${index + 2}`}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ))}
          </section>
        )
      ) : null}

      {nextWork ? (
        <Link
          href={nextWork.href}
          className={styles.pageNext}
          aria-label={`Next work: ${nextWork.title}`}
        >
          <span className={styles.pageNextLabel}>Next</span>
          <svg className={styles.pageNextArrow} viewBox="0 0 64 34" aria-hidden="true">
            <path d="M4 4 32 30 60 4" />
          </svg>
        </Link>
      ) : null}

      <aside className={styles.navigator} aria-label="Work navigation">
        <nav className={styles.mobileNavigator} aria-label="Mobile work navigation">
          {previousWork ? (
            <Link
              href={previousWork.href}
              className={`${styles.mobileNavLink} ${styles.mobileNavPrev}`}
              aria-label={`Previous work: ${previousWork.title}`}
            >
              <span className={styles.mobileNavArrow} aria-hidden="true">◀</span>
              <span>Prev</span>
            </Link>
          ) : (
            <span
              className={`${styles.mobileNavLink} ${styles.mobileNavPrev} ${styles.mobileNavDisabled}`}
              aria-disabled="true"
            >
              <span className={styles.mobileNavArrow} aria-hidden="true">◀</span>
              <span>Prev</span>
            </span>
          )}

          <Link href="/works" className={`${styles.mobileNavLink} ${styles.mobileNavWorks}`}>
            <span>Works</span>
            <svg className={styles.mobileWorksIcon} viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3 2 7l4 4M2.5 7H10c2.6 0 4 1.3 4 3.5S12.6 14 10 14" />
            </svg>
          </Link>

          {nextWork ? (
            <Link
              href={nextWork.href}
              className={`${styles.mobileNavLink} ${styles.mobileNavNext}`}
              aria-label={`Next work: ${nextWork.title}`}
            >
              <span>Next</span>
              <span className={styles.mobileNavArrow} aria-hidden="true">▶</span>
            </Link>
          ) : (
            <span
              className={`${styles.mobileNavLink} ${styles.mobileNavNext} ${styles.mobileNavDisabled}`}
              aria-disabled="true"
            >
              <span>Next</span>
              <span className={styles.mobileNavArrow} aria-hidden="true">▶</span>
            </span>
          )}
        </nav>

        <div className={styles.navigatorMain}>
          {previousWork ? (
            <Link href={previousWork.href} className={styles.arrowAction} aria-label={`Previous work: ${previousWork.title}`}>
              <span className={`${styles.actionHint} ${styles.prevHint}`}>Prev</span>
              <svg className={`${styles.chevron} ${styles.chevronUp}`} viewBox="0 0 20 12" aria-hidden="true">
                <path className={styles.controlFill} d="M10 0 20 12H0Z" />
              </svg>
            </Link>
          ) : (
            <span className={`${styles.arrowAction} ${styles.actionDisabled}`} aria-label="No previous work" aria-disabled="true">
              <svg className={`${styles.chevron} ${styles.chevronUp}`} viewBox="0 0 20 12" aria-hidden="true">
                <path className={styles.controlFill} d="M10 0 20 12H0Z" />
              </svg>
            </span>
          )}

          <nav className={styles.workIndex} aria-label="All works">
            {works.map((item, index) => {
              const isCurrent = index === currentIndex

              return (
                <Link
                  href={item.href}
                  key={item.slug}
                  className={`${styles.indexLink} ${isCurrent ? styles.indexCurrent : ''}`}
                  aria-label={`${String(index + 1).padStart(2, '0')}: ${item.title}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  onPointerEnter={(event) => showPreview(index, event)}
                  onPointerLeave={() => setPreview(null)}
                  onFocus={(event) => {
                    setPreview({ index, top: getSafePreviewTop(event.currentTarget) })
                  }}
                  onBlur={() => setPreview(null)}
                >
                  <svg
                    className={styles.indexLine}
                    viewBox="0 0 100 2.5"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path className={styles.controlStroke} d="M0 1.25h100" />
                  </svg>
                </Link>
              )
            })}
          </nav>

          {nextWork ? (
            <Link href={nextWork.href} className={styles.arrowAction} aria-label={`Next work: ${nextWork.title}`}>
              <svg className={`${styles.chevron} ${styles.chevronDown}`} viewBox="0 0 20 12" aria-hidden="true">
                <path className={styles.controlFill} d="M0 0h20L10 12Z" />
              </svg>
              <span className={`${styles.actionHint} ${styles.nextHint}`}>Next</span>
            </Link>
          ) : (
            <span className={`${styles.arrowAction} ${styles.actionDisabled}`} aria-label="No next work" aria-disabled="true">
              <svg className={`${styles.chevron} ${styles.chevronDown}`} viewBox="0 0 20 12" aria-hidden="true">
                <path className={styles.controlFill} d="M0 0h20L10 12Z" />
              </svg>
            </span>
          )}
        </div>

        <Link href="/works" className={styles.backAction} aria-label="Back to works">
          <span className={styles.backHint}>Works</span>
          <svg className={styles.backIcon} viewBox="0 0 96 96" aria-hidden="true">
            <path className={styles.controlStroke} d="M31 18 12 37l19 19M14 37h41c18 0 29 10 29 25S73 87 55 87H17" />
          </svg>
        </Link>
      </aside>

      {previewWork && preview ? (
        <div
          className={styles.workPreview}
          style={{ '--preview-top': `${preview.top}px` } as CSSProperties}
          aria-hidden="true"
        >
          <div className={styles.previewImage}>
            {previewWork.coverImageUrl ? (
              <Image
                src={previewWork.coverImageUrl}
                alt=""
                fill
                sizes="(max-width: 900px) 220px, 360px"
                className={styles.previewCover}
              />
            ) : (
              <span className={styles.previewFallback} style={{ background: previewWork.surface }}>
                {previewWork.title}
              </span>
            )}
          </div>
          <span className={styles.previewCaption}>{previewWork.title}</span>
        </div>
      ) : null}
    </main>
  )
}
