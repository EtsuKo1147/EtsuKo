'use client'

/* eslint-disable @next/next/no-img-element */

import Image from 'next/image'
import Link from 'next/link'
import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useSiteTheme } from '@/components/theme/SiteThemeProvider'
import type { Work } from '@/data/works'
import styles from './page.module.css'

type WorkDetailViewProps = {
  work: Work
  works: Work[]
}

type PreviewState = {
  index: number
  top: number
} | null

export default function WorkDetailView({ work, works }: WorkDetailViewProps) {
  const { isInverted, toggleTheme } = useSiteTheme()
  const pageRef = useRef<HTMLElement>(null)
  const narrativeRef = useRef<HTMLElement>(null)
  const introTextRef = useRef<HTMLDivElement>(null)
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
    const coverPanel = coverPanelRef.current

    if (!page || !narrative || !introText || !coverPanel) {
      return
    }

    const context = gsap.context(() => {
      const media = gsap.matchMedia()

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

      media.add(
        '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
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
                top: 0,
                height: '100%',
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
              <h1 className={styles.title}>{work.title}</h1>
              <p className={styles.category}>
                {work.categoryLabel} / {work.year}
              </p>
              <p className={styles.description}>{work.description}</p>
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
      ) : null}

      <aside className={styles.navigator} aria-label="Work navigation">
        <div className={styles.navigatorMain}>
          {previousWork ? (
            <Link href={previousWork.href} className={styles.arrowAction} aria-label={`Previous work: ${previousWork.title}`}>
              <span className={`${styles.actionHint} ${styles.prevHint}`}>Prev</span>
              <svg className={`${styles.chevron} ${styles.chevronUp}`} viewBox="0 0 20 10" aria-hidden="true">
                <path className={styles.controlStroke} d="M0 10 10 0l10 10" />
              </svg>
            </Link>
          ) : (
            <span className={`${styles.arrowAction} ${styles.actionDisabled}`} aria-label="No previous work" aria-disabled="true">
              <svg className={`${styles.chevron} ${styles.chevronUp}`} viewBox="0 0 20 10" aria-hidden="true">
                <path className={styles.controlStroke} d="M0 10 10 0l10 10" />
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
              <svg className={`${styles.chevron} ${styles.chevronDown}`} viewBox="0 0 20 10" aria-hidden="true">
                <path className={styles.controlStroke} d="M0 0 10 10 20 0" />
              </svg>
              <span className={`${styles.actionHint} ${styles.nextHint}`}>Next</span>
            </Link>
          ) : (
            <span className={`${styles.arrowAction} ${styles.actionDisabled}`} aria-label="No next work" aria-disabled="true">
              <svg className={`${styles.chevron} ${styles.chevronDown}`} viewBox="0 0 20 10" aria-hidden="true">
                <path className={styles.controlStroke} d="M0 0 10 10 20 0" />
              </svg>
            </span>
          )}
        </div>

        <Link href="/works" className={styles.backAction} aria-label="Back to works">
          <span className={styles.backHint}>Back to works</span>
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
