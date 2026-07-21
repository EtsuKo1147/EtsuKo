'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { type Work, type WorkCategory } from '@/data/works'
import { useSiteTheme } from '@/components/theme/SiteThemeProvider'
import styles from './page.module.css'

type ActiveCategory = 'all' | WorkCategory

const polaroidAssetPath = '/home/images/works-polaroid'

const categoryOptions: { slug: ActiveCategory; label: string }[] = [
  { slug: 'all', label: 'ALL' },
  { slug: 'branding', label: 'Branding' },
  { slug: 'graphic', label: 'Illustration' },
  { slug: 'web', label: 'Web' },
  { slug: 'photography', label: 'Photography' },
]

const categoryPreviewImages: Record<ActiveCategory, string> = {
  all: `${polaroidAssetPath}/work-branding.jpg`,
  branding: `${polaroidAssetPath}/work-branding.jpg`,
  graphic: `${polaroidAssetPath}/work-illustration.jpg`,
  web: `${polaroidAssetPath}/work-web.jpg`,
  photography: `${polaroidAssetPath}/work-photography.jpg`,
}

const projectPreviewImages = [
  `${polaroidAssetPath}/featured-01.jpg`,
  `${polaroidAssetPath}/featured-02.jpg`,
  `${polaroidAssetPath}/featured-03.jpg`,
  `${polaroidAssetPath}/featured-04.jpg`,
]

type WorksViewProps = {
  works: Work[]
  initialCategory?: ActiveCategory
}

export default function WorksView({ works, initialCategory = 'all' }: WorksViewProps) {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(initialCategory)
  const { isInverted, toggleTheme } = useSiteTheme()
  const [designScale, setDesignScale] = useState(1)
  const [displayPanelScale, setDisplayPanelScale] = useState(1)
  const workDisplayViewportRef = useRef<HTMLElement>(null)

  const activeCategoryOption =
    categoryOptions.find((category) => category.slug === activeCategory) ?? categoryOptions[0]

  const visibleWorks = useMemo(() => {
    return activeCategory === 'all'
      ? works
      : works.filter((work) => work.category === activeCategory)
  }, [activeCategory, works])

  useEffect(() => {
    const updateDesignScale = () => {
      const widthScale = window.innerWidth / 1920
      const heightScale = window.innerHeight / 1080
      const nextScale = Math.max(0.78, Math.min(1, widthScale, heightScale))

      setDesignScale(Math.round(nextScale * 1000) / 1000)
      setDisplayPanelScale(Math.round(Math.min(widthScale, heightScale) * 1000) / 1000)
    }

    updateDesignScale()
    window.addEventListener('resize', updateDesignScale)

    return () => {
      window.removeEventListener('resize', updateDesignScale)
    }
  }, [])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1101px)')

    const handlePageWheel = (event: WheelEvent) => {
      const viewport = workDisplayViewportRef.current

      if (
        !desktopQuery.matches ||
        !viewport ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return
      }

      if (event.target instanceof Node && viewport.contains(event.target)) {
        return
      }

      const maxScrollTop = viewport.scrollHeight - viewport.clientHeight

      if (maxScrollTop <= 0 || event.deltaY === 0) {
        return
      }

      const normalizedDelta =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * viewport.clientHeight
            : event.deltaY

      event.preventDefault()
      viewport.scrollTop = Math.max(
        0,
        Math.min(maxScrollTop, viewport.scrollTop + normalizedDelta),
      )
    }

    window.addEventListener('wheel', handlePageWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handlePageWheel)
    }
  }, [])

  const scaledPx = (value: number) => `${Math.round(value * designScale * 10) / 10}px`
  const scaledDisplayPanelPx = (value: number) =>
    `${Math.round(value * displayPanelScale * 10) / 10}px`
  const pageScaleStyle = {
    '--works-page-pad-top': scaledPx(44),
    '--works-page-pad-x': scaledPx(76),
    '--works-page-pad-bottom': scaledPx(128),
    '--works-layout-width': scaledPx(1600),
    '--works-layout-gap': scaledPx(86),
    '--works-rail-top': scaledPx(44),
    '--works-rail-left-offset': scaledPx(100),
    '--works-rail-gap': scaledPx(18),
    '--works-rail-width': scaledPx(382),
    '--works-rail-height-pad': scaledPx(88),
    '--works-camera-width': scaledPx(382),
    '--works-camera-ring-width': scaledPx(180),
    '--works-category-label-size': scaledPx(20),
    '--works-paper-caption-size': scaledPx(12.8),
    '--works-category-gap': scaledPx(11),
    '--works-category-margin-top': scaledPx(24),
    '--works-category-font-size': scaledPx(27),
    '--works-display-column-gap': scaledPx(70),
    '--works-display-row-gap': scaledPx(96),
    '--works-display-pad-top': scaledPx(82),
    '--works-display-pad-bottom': scaledPx(140),
    '--works-display-panel-width': scaledDisplayPanelPx(1400),
    '--works-display-panel-height': scaledDisplayPanelPx(1000),
    '--works-display-panel-right': scaledDisplayPanelPx(130),
    '--works-display-panel-safe-left': scaledPx(594),
    '--works-display-panel-radius': scaledDisplayPanelPx(40),
    '--works-polaroid-width': scaledPx(480),
    '--works-polaroid-row-overlap': scaledPx(60),
    '--works-polaroid-hover-y': scaledPx(8),
    '--works-meta-font-size': scaledPx(12.5),
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

      <div className={styles.worksLayout}>
        <aside className={styles.worksRail} aria-label="Works category controls">
          <div className={styles.cameraStage} aria-label={`${activeCategoryOption.label} preview`}>
            <img
              src={`${polaroidAssetPath}/polaroid-camera-down.svg`}
              alt=""
              className={`${styles.cameraLayer} ${styles.cameraDown}`}
              draggable={false}
            />
            <span className={`${styles.cameraLayer} ${styles.cameraUp}`} aria-hidden="true" />
            <svg className={styles.cameraTextRing} viewBox="0 0 180 180" aria-hidden="true">
              <defs>
                <path
                  id="works-category-ring"
                  d="M90 90 m -68 0 a 68 68 0 1 1 136 0 a 68 68 0 1 1 -136 0"
                />
              </defs>
              <text>
                <textPath href="#works-category-ring" startOffset="8%">
                  Branding
                </textPath>
              </text>
              <text>
                <textPath href="#works-category-ring" startOffset="32%">
                  Illustration
                </textPath>
              </text>
              <text>
                <textPath href="#works-category-ring" startOffset="65%">
                  Web
                </textPath>
              </text>
              <text>
                <textPath href="#works-category-ring" startOffset="78%">
                  Photography
                </textPath>
              </text>
            </svg>
            <span className={styles.cameraCategoryLabel}>{activeCategoryOption.label}</span>
            <span className={styles.paperMask} aria-hidden="true">
              <span className={styles.cameraPaper} key={activeCategory}>
                <span className={styles.paperShell} />
                <img
                  src={categoryPreviewImages[activeCategory]}
                  alt=""
                  className={styles.paperImage}
                  draggable={false}
                />
                <span className={styles.paperSurfaceShadow} />
                <span className={styles.paperCaption}>{activeCategoryOption.label}</span>
              </span>
            </span>
          </div>

          <nav className={styles.categoryNav} aria-label="Work categories">
            {categoryOptions.map((category) => (
              <button
                type="button"
                key={category.slug}
                className={activeCategory === category.slug ? styles.categoryActive : undefined}
                aria-pressed={activeCategory === category.slug}
                onMouseEnter={() => setActiveCategory(category.slug)}
                onFocus={() => setActiveCategory(category.slug)}
                onClick={() => setActiveCategory(category.slug)}
              >
                <span>{category.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section
          ref={workDisplayViewportRef}
          key={activeCategory}
          className={styles.workDisplayViewport}
          aria-live="polite"
          aria-label={`${activeCategoryOption.label} works`}
          tabIndex={0}
        >
          <div className={styles.workDisplay}>
            {visibleWorks.map((work, index) => {
              const layoutIndex = index % 4

              return (
                <Link
                  href={work.href}
                  className={styles.workPolaroid}
                  key={`${activeCategory}-${work.slug}`}
                  style={
                    {
                      '--work-rotate': `${[-8, 10, 4, -8][layoutIndex]}deg`,
                      '--work-x': scaledPx([-90, -70, 60, 80][layoutIndex]),
                      '--work-y': scaledPx([-20, 10, -80, -90][layoutIndex]),
                      '--work-flip-delay': `${layoutIndex * 55}ms`,
                    } as CSSProperties
                  }
                >
                  <span className={styles.workFlip}>
                    <span className={styles.workImageViewport}>
                      {work.coverImageUrl ? (
                        <img
                          src={work.coverImageUrl}
                          alt={work.coverImageAlt || work.title}
                          className={styles.workCoverImage}
                          draggable={false}
                        />
                      ) : (
                        <img
                          src={projectPreviewImages[index % projectPreviewImages.length]}
                          alt=""
                          className={styles.workCoverImage}
                          draggable={false}
                        />
                      )}
                    </span>
                    <span className={styles.paperSurfaceShadow} aria-hidden="true" />
                    <span className={styles.workMeta}>
                      <span>{work.title}</span>
                      <span>{work.year}</span>
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
