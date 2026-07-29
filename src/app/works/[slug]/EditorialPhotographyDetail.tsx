'use client'

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import gsap from 'gsap'
import { useSiteTheme } from '@/components/theme/SiteThemeProvider'
import type { Work } from '@/data/works'
import detailStyles from './page.module.css'
import styles from './editorial-photography.module.css'

type EditorialPhotographyDetailProps = {
  work: Work
  works: Work[]
  nextWork: Work | null
  displayIndex: number
  layoutVariant: 'standard' | 'alternate'
}

export default function EditorialPhotographyDetail({
  work,
  works,
  nextWork,
  displayIndex,
  layoutVariant,
}: EditorialPhotographyDetailProps) {
  const { isInverted, toggleTheme } = useSiteTheme()
  const images = work.galleryImages || []
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  const closingRef = useRef(false)
  const currentIndex = displayIndex - 1
  const previousWork =
    works.length > 1
      ? works[(currentIndex - 1 + works.length) % works.length]
      : null

  const activeImage = activeIndex === null ? null : images[activeIndex]

  const openImage = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    openerRef.current = event.currentTarget
    closingRef.current = false
    setActiveIndex(index)
  }

  const closeImage = useCallback(() => {
    if (activeIndex === null || closingRef.current) {
      return
    }

    const overlay = overlayRef.current
    const media = mediaRef.current

    if (!overlay || !media) {
      wasOpenRef.current = false
      setActiveIndex(null)
      return
    }

    closingRef.current = true

    gsap
      .timeline({
        onComplete: () => {
          wasOpenRef.current = false
          closingRef.current = false
          setActiveIndex(null)
          openerRef.current?.focus()
        },
      })
      .to(media, {
        scale: 0.965,
        y: 12,
        autoAlpha: 0,
        duration: 0.22,
        ease: 'power2.in',
      })
      .to(
        overlay,
        {
          autoAlpha: 0,
          duration: 0.2,
          ease: 'power2.in',
        },
        0,
      )
  }, [activeIndex])

  const showPrevious = useCallback(() => {
    if (images.length < 2) {
      return
    }

    setActiveIndex((current) => {
      if (current === null) {
        return 0
      }

      return (current - 1 + images.length) % images.length
    })
  }, [images.length])

  const showNext = useCallback(() => {
    if (images.length < 2) {
      return
    }

    setActiveIndex((current) => {
      if (current === null) {
        return 0
      }

      return (current + 1) % images.length
    })
  }, [images.length])

  useLayoutEffect(() => {
    if (activeIndex === null) {
      return
    }

    const overlay = overlayRef.current
    const media = mediaRef.current

    if (!overlay || !media) {
      return
    }

    if (!wasOpenRef.current) {
      wasOpenRef.current = true
      gsap.fromTo(
        overlay,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.28, ease: 'power2.out' },
      )
      gsap.fromTo(
        media,
        { scale: 0.94, y: 18, autoAlpha: 0 },
        {
          scale: 1,
          y: 0,
          autoAlpha: 1,
          duration: 0.38,
          ease: 'power3.out',
        },
      )
      closeButtonRef.current?.focus()
      return
    }

    gsap.fromTo(
      media,
      { autoAlpha: 0.35, scale: 0.988 },
      { autoAlpha: 1, scale: 1, duration: 0.24, ease: 'power2.out' },
    )
  }, [activeIndex])

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeImage()
      }

      if (event.key === 'ArrowLeft') {
        showPrevious()
      }

      if (event.key === 'ArrowRight') {
        showNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex, closeImage, showNext, showPrevious])

  return (
    <main
      className={`${styles.page} ${
        layoutVariant === 'alternate' ? styles.pageAlternate : ''
      } ${isInverted ? styles.pageInverted : ''}`}
    >
      <button
        type="button"
        className={styles.invertToggle}
        aria-pressed={isInverted}
        aria-label={isInverted ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
      />

      <header className={styles.intro}>
        <div className={styles.introTitle}>
          <p className={styles.eyebrow}>
            Photo essay
          </p>
          <h1>{work.title}</h1>
        </div>

        <p className={styles.meta}>
          {work.categoryLabel}
          <span aria-hidden="true"> / </span>
          {work.year}
        </p>

        <div className={styles.descriptionGroup}>
          <p>{work.description}</p>
        </div>
      </header>

      <section
        className={styles.gallerySection}
        aria-label={`${work.title} image overview`}
      >
        <svg
          className={styles.compositionLines}
          viewBox="0 0 1000 2200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M62 126C245 65 242 430 482 395S722 248 934 372" />
          <circle cx="478" cy="395" r="31" />
        </svg>

        <span className={`${styles.accentBlock} ${styles.accentBlockOne}`} aria-hidden="true" />
        <span className={`${styles.accentBar} ${styles.accentBarOne}`} aria-hidden="true" />

        <div className={styles.galleryGrid}>
          {images.map((image, index) => {
            const layoutClass =
              styles[`layout${(index % 6) + 1}` as keyof typeof styles]

            return (
              <button
                type="button"
                className={`${styles.galleryItem} ${layoutClass}`}
                aria-label={`Open image ${index + 1} of ${images.length}`}
                onClick={(event) => openImage(index, event)}
                key={`${image.url}-${index}`}
              >
                <span className={styles.imageFrame}>
                  <img
                    src={image.url}
                    alt={image.alt || `${work.title} image ${index + 1}`}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        <Link href="/works" className={styles.footerLink}>
          <span>All works</span>
          <span aria-hidden="true">↖</span>
        </Link>

        {nextWork ? (
          <Link href={nextWork.href} className={styles.nextProject}>
            <span className={styles.nextLabel}>Next project</span>
            <span>{nextWork.title}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        ) : null}
      </footer>

      <aside className={detailStyles.navigator} aria-label="Work navigation">
        <nav
          className={detailStyles.mobileNavigator}
          aria-label="Mobile work navigation"
        >
          {previousWork ? (
            <Link
              href={previousWork.href}
              className={`${detailStyles.mobileNavLink} ${detailStyles.mobileNavPrev}`}
              aria-label={`Previous work: ${previousWork.title}`}
            >
              <span className={detailStyles.mobileNavArrow} aria-hidden="true">
                ◀
              </span>
              <span>Prev</span>
            </Link>
          ) : null}

          <Link
            href="/works"
            className={`${detailStyles.mobileNavLink} ${detailStyles.mobileNavWorks}`}
          >
            <span>Works</span>
            <svg
              className={detailStyles.mobileWorksIcon}
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M6 3 2 7l4 4M2.5 7H10c2.6 0 4 1.3 4 3.5S12.6 14 10 14" />
            </svg>
          </Link>

          {nextWork ? (
            <Link
              href={nextWork.href}
              className={`${detailStyles.mobileNavLink} ${detailStyles.mobileNavNext}`}
              aria-label={`Next work: ${nextWork.title}`}
            >
              <span>Next</span>
              <span className={detailStyles.mobileNavArrow} aria-hidden="true">
                ▶
              </span>
            </Link>
          ) : null}
        </nav>

        <div className={detailStyles.navigatorMain}>
          {previousWork ? (
            <Link
              href={previousWork.href}
              className={detailStyles.arrowAction}
              aria-label={`Previous work: ${previousWork.title}`}
            >
              <span
                className={`${detailStyles.actionHint} ${detailStyles.prevHint}`}
              >
                Prev
              </span>
              <svg
                className={`${detailStyles.chevron} ${detailStyles.chevronUp}`}
                viewBox="0 0 20 12"
                aria-hidden="true"
              >
                <path className={detailStyles.controlFill} d="M10 0 20 12H0Z" />
              </svg>
            </Link>
          ) : null}

          <nav className={detailStyles.workIndex} aria-label="All works">
            {works.map((item, index) => {
              const isCurrent = index === currentIndex

              return (
                <Link
                  href={item.href}
                  key={item.slug}
                  className={`${detailStyles.indexLink} ${
                    isCurrent ? detailStyles.indexCurrent : ''
                  }`}
                  aria-label={`${String(index + 1).padStart(2, '0')}: ${item.title}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  <svg
                    className={detailStyles.indexLine}
                    viewBox="0 0 100 2.5"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      className={detailStyles.controlStroke}
                      d="M0 1.25h100"
                    />
                  </svg>
                </Link>
              )
            })}
          </nav>

          {nextWork ? (
            <Link
              href={nextWork.href}
              className={detailStyles.arrowAction}
              aria-label={`Next work: ${nextWork.title}`}
            >
              <svg
                className={`${detailStyles.chevron} ${detailStyles.chevronDown}`}
                viewBox="0 0 20 12"
                aria-hidden="true"
              >
                <path className={detailStyles.controlFill} d="M0 0h20L10 12Z" />
              </svg>
              <span
                className={`${detailStyles.actionHint} ${detailStyles.nextHint}`}
              >
                Next
              </span>
            </Link>
          ) : null}
        </div>

        <Link
          href="/works"
          className={detailStyles.backAction}
          aria-label="Back to works"
        >
          <span className={detailStyles.backHint}>Works</span>
          <svg
            className={detailStyles.backIcon}
            viewBox="0 0 96 96"
            aria-hidden="true"
          >
            <path
              className={detailStyles.controlStroke}
              d="M31 18 12 37l19 19M14 37h41c18 0 29 10 29 25S73 87 55 87H17"
            />
          </svg>
        </Link>
      </aside>

      {activeImage && activeIndex !== null ? (
        <div
          ref={overlayRef}
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${work.title} image ${activeIndex + 1}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeImage()
            }
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            aria-label="Close image"
            onClick={closeImage}
          >
            <span aria-hidden="true">Close ×</span>
          </button>

          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxPrevious}`}
            aria-label="Previous image"
            onClick={showPrevious}
            disabled={images.length < 2}
          >
            <span aria-hidden="true">←</span>
          </button>

          <button
            ref={mediaRef}
            type="button"
            className={styles.lightboxMedia}
            aria-label="Close enlarged image"
            onClick={closeImage}
          >
            <img
              src={activeImage.url}
              alt={activeImage.alt || `${work.title} image ${activeIndex + 1}`}
              decoding="async"
            />
          </button>

          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            aria-label="Next image"
            onClick={showNext}
            disabled={images.length < 2}
          >
            <span aria-hidden="true">→</span>
          </button>

          <p className={styles.lightboxCount}>
            {String(activeIndex + 1).padStart(2, '0')}
            <span aria-hidden="true"> / </span>
            {String(images.length).padStart(2, '0')}
          </p>
        </div>
      ) : null}
    </main>
  )
}
