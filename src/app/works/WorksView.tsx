'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { type Work, type WorkCategory } from '@/data/works'
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
  const [isInverted, setIsInverted] = useState(false)
  const [designScale, setDesignScale] = useState(1)

  const activeCategoryOption =
    categoryOptions.find((category) => category.slug === activeCategory) ?? categoryOptions[0]

  const visibleWorks = useMemo(() => {
    const filteredWorks =
      activeCategory === 'all'
        ? works
        : works.filter((work) => work.category === activeCategory)

    return filteredWorks.slice(0, 4)
  }, [activeCategory, works])

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

  const scaledPx = (value: number) => `${Math.round(value * designScale * 10) / 10}px`
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
    '--works-polaroid-width': scaledPx(420),
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
        onClick={() => setIsInverted((currentValue) => !currentValue)}
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

        <section className={styles.workDisplay} aria-live="polite">
          {visibleWorks.map((work, index) => (
            <Link
              href={work.href}
              className={styles.workPolaroid}
              key={work.id}
              style={
                {
                  '--work-rotate': `${[-7, 2, -2, 8][index] ?? 0}deg`,
                  '--work-x': scaledPx([-18, 10, -4, 16][index] ?? 0),
                  '--work-y': scaledPx([12, -8, 18, 28][index] ?? 0),
                } as CSSProperties
              }
            >
              <span className={styles.workPaperViewport}>
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
              <span className={styles.workPaperFrame} aria-hidden="true" />
              <span className={styles.workMeta}>
                <span>{work.title}</span>
                <span>{work.year}</span>
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
