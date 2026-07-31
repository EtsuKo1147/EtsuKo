'use client'

/* eslint-disable @next/next/no-img-element */

import Image from 'next/image'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useSiteTheme } from '@/components/theme/SiteThemeProvider'
import type { Work } from '@/data/works'
import detailStyles from './page.module.css'
import styles from './editorial-photography.module.css'

type EditorialPhotographyDetailProps = {
  work: Work
  works: Work[]
  nextWork: Work | null
  displayIndex: number
  layoutVariant: 'commercial' | 'offset' | 'split' | 'poster' | 'quiet'
}

type PreviewState = {
  index: number
  top: number
} | null

const ZOOM_LEVELS = [30, 65, 100] as const

type ZoomLevel = (typeof ZOOM_LEVELS)[number]

type LightboxSizing = {
  fitWidth: number
  maxWidth: number
}

type PanState = {
  pointerId: number
  startX: number
  startY: number
  startScrollLeft: number
  startScrollTop: number
  moved: boolean
}

function getImageDimensions(url: string) {
  const match = url.match(/-(\d+)x(\d+)\.(?:avif|gif|jpe?g|png|webp)(?:\?.*)?$/i)

  if (!match) {
    return { width: 1600, height: 1200 }
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  }
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
  const lightboxImages = work.coverImageUrl
    ? [
        {
          url: work.coverImageUrl,
          alt: work.coverImageAlt || work.title,
        },
        ...images,
      ]
    : images
  const galleryLightboxOffset = work.coverImageUrl ? 1 : 0
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [preview, setPreview] = useState<PreviewState>(null)
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(30)
  const [lightboxSizing, setLightboxSizing] =
    useState<LightboxSizing | null>(null)
  const pageRef = useRef<HTMLElement>(null)
  const heroStageRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLElement>(null)
  const metaRef = useRef<HTMLParagraphElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const lightboxScrollRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const lightboxImageRef = useRef<HTMLImageElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const sourceRectRef = useRef<DOMRect | null>(null)
  const panStateRef = useRef<PanState | null>(null)
  const suppressPanClickRef = useRef(false)
  const zoomFocusRef = useRef<{ x: number; y: number } | null>(null)
  const wasOpenRef = useRef(false)
  const closingRef = useRef(false)
  const currentIndex = displayIndex - 1
  const previousWork =
    works.length > 1
      ? works[(currentIndex - 1 + works.length) % works.length]
      : null
  const previewWork = preview ? works[preview.index] : null

  const activeImage =
    activeIndex === null ? null : lightboxImages[activeIndex]
  const titleWords = work.title.trim().split(/\s+/)
  const titleTail = titleWords.pop() || work.title
  const variantClass = {
    commercial: styles.pageCommercial,
    offset: styles.pageOffset,
    split: styles.pageSplit,
    poster: styles.pagePoster,
    quiet: styles.pageQuiet,
  }[layoutVariant]
  const galleryOffset = {
    commercial: 0,
    offset: 0,
    split: 4,
    poster: 8,
    quiet: 11,
  }[layoutVariant]
  const zoomProgress = (zoomLevel - 30) / 70
  const zoomIndex = ZOOM_LEVELS.indexOf(zoomLevel)
  const targetImageWidth = lightboxSizing
    ? lightboxSizing.fitWidth +
      (lightboxSizing.maxWidth - lightboxSizing.fitWidth) * zoomProgress
    : null
  const zoomImageStyle =
    zoomLevel !== 30 && targetImageWidth !== null
      ? ({ width: `${targetImageWidth}px` } as CSSProperties)
      : undefined

  const getSafePreviewTop = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const edge = Math.min(180, window.innerHeight / 3)

    return Math.max(
      edge,
      Math.min(window.innerHeight - edge, rect.top + rect.height / 2),
    )
  }

  const showPreview = (
    index: number,
    event: PointerEvent<HTMLAnchorElement>,
  ) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }

    setPreview({ index, top: getSafePreviewTop(event.currentTarget) })
  }

  const openImage = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    openerRef.current = event.currentTarget
    sourceRectRef.current = event.currentTarget.getBoundingClientRect()
    closingRef.current = false
    setZoomLevel(30)
    setLightboxSizing(null)
    zoomFocusRef.current = null
    setActiveIndex(index)
  }

  const closeImage = useCallback(() => {
    if (activeIndex === null || closingRef.current) {
      return
    }

    const overlay = overlayRef.current
    const media = mediaRef.current
    const image = lightboxImageRef.current

    if (!overlay || !media) {
      wasOpenRef.current = false
      sourceRectRef.current = null
      setActiveIndex(null)
      return
    }

    const finishClose = () => {
      wasOpenRef.current = false
      closingRef.current = false
      sourceRectRef.current = null
      setActiveIndex(null)
      openerRef.current?.focus()
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose()
      return
    }

    closingRef.current = true
    const sourceRect = sourceRectRef.current
    const currentSourceRect =
      sourceRect && openerRef.current
        ? openerRef.current.getBoundingClientRect()
        : sourceRect
    const imageRect = image?.getBoundingClientRect()
    const canReturnToSource =
      image &&
      imageRect &&
      imageRect.width > 0 &&
      imageRect.height > 0 &&
      currentSourceRect &&
      currentSourceRect.width > 0 &&
      currentSourceRect.height > 0

    if (canReturnToSource) {
      const sourceCenterX =
        currentSourceRect.left + currentSourceRect.width / 2
      const sourceCenterY =
        currentSourceRect.top + currentSourceRect.height / 2
      const imageCenterX = imageRect.left + imageRect.width / 2
      const imageCenterY = imageRect.top + imageRect.height / 2

      gsap
        .timeline({ onComplete: finishClose })
        .to(image, {
          x: sourceCenterX - imageCenterX,
          y: sourceCenterY - imageCenterY,
          scaleX: currentSourceRect.width / imageRect.width,
          scaleY: currentSourceRect.height / imageRect.height,
          transformOrigin: 'center center',
          duration: 0.42,
          ease: 'power3.inOut',
        })
        .to(
          overlay,
          {
            autoAlpha: 0,
            duration: 0.24,
            ease: 'power2.in',
          },
          0.14,
        )
      return
    }

    gsap
      .timeline({ onComplete: finishClose })
      .to(media, {
        scale: 0.985,
        y: 8,
        duration: 0.2,
        ease: 'power2.in',
      })
      .to(
        overlay,
        {
          autoAlpha: 0,
          duration: 0.18,
          ease: 'power2.in',
        },
        0,
      )
  }, [activeIndex])

  const showPrevious = useCallback(() => {
    if (lightboxImages.length < 2) {
      return
    }

    sourceRectRef.current = null
    setZoomLevel(30)
    setLightboxSizing(null)
    zoomFocusRef.current = null
    setActiveIndex((current) => {
      if (current === null) {
        return 0
      }

      return (current - 1 + lightboxImages.length) % lightboxImages.length
    })
  }, [lightboxImages.length])

  const showNext = useCallback(() => {
    if (lightboxImages.length < 2) {
      return
    }

    sourceRectRef.current = null
    setZoomLevel(30)
    setLightboxSizing(null)
    zoomFocusRef.current = null
    setActiveIndex((current) => {
      if (current === null) {
        return 0
      }

      return (current + 1) % lightboxImages.length
    })
  }, [lightboxImages.length])

  useLayoutEffect(() => {
    const heroStage = heroStageRef.current
    const cover = coverRef.current
    const meta = metaRef.current
    const description = descriptionRef.current

    if (!heroStage || !cover || !meta || !description) {
      return
    }

    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const titleWordElements = gsap.utils.toArray<HTMLElement>(
          '[data-title-word]',
          heroStage,
        )
        const titleWordDuration =
          titleWordElements.length > 1 ? 0.5 : 0.6
        const titleWordStagger =
          titleWordElements.length > 1
            ? 0.1 / (titleWordElements.length - 1)
            : 0
        const animatedElements = [
          ...titleWordElements,
          cover,
          meta,
          description,
        ]
        const clearMotionStyles = () => {
          gsap.set(animatedElements, {
            clearProps:
              'transform,willChange,transformOrigin,transformPerspective',
          })
        }

        gsap.set(titleWordElements, {
          rotationX: -110,
          yPercent: 118,
          scaleY: 0.82,
          transformOrigin: '50% 100%',
          transformPerspective: 700,
          willChange: 'transform',
        })
        gsap.set(cover, {
          y: () => -(cover.getBoundingClientRect().bottom + 32),
          willChange: 'transform',
        })
        gsap.set(description, {
          x: () => {
            const rect = description.getBoundingClientRect()
            const distanceToLeft = rect.left
            const distanceToRight = window.innerWidth - rect.right

            return distanceToLeft <= distanceToRight
              ? -(rect.right + 48)
              : window.innerWidth - rect.left + 48
          },
          willChange: 'transform',
        })
        const metaRect = meta.getBoundingClientRect()
        const isHorizontalMeta = window
          .getComputedStyle(meta)
          .writingMode.startsWith('horizontal')
        const metaDistanceToLeft = metaRect.left
        const metaDistanceToRight = window.innerWidth - metaRect.right
        const metaEntranceX = isHorizontalMeta
          ? metaDistanceToLeft <= metaDistanceToRight
            ? -(metaRect.right + 48)
            : window.innerWidth - metaRect.left + 48
          : 0

        gsap.set(meta, {
          x: metaEntranceX,
          y: isHorizontalMeta ? 0 : -(metaRect.bottom + 32),
          willChange: 'transform',
        })

        const timeline = gsap.timeline({
          defaults: { overwrite: 'auto' },
          onComplete: clearMotionStyles,
          onInterrupt: clearMotionStyles,
        })

        timeline
          .to(
            cover,
            {
              y: 0,
              duration: 0.6,
              ease: 'power4.out',
            },
            0,
          )
          .to(
            titleWordElements,
            {
              keyframes: [
                {
                  rotationX: 6,
                  yPercent: 0,
                  scaleY: 1.035,
                  duration: titleWordDuration * 0.82,
                  ease: 'power2.inOut',
                },
                {
                  rotationX: 0,
                  yPercent: 0,
                  scaleY: 1,
                  duration: titleWordDuration * 0.18,
                  ease: 'power1.out',
                },
              ],
              stagger: titleWordStagger,
            },
            0,
          )
          .to(
            description,
            {
              x: 0,
              duration: 0.46,
              ease: 'power3.out',
            },
            0.14,
          )
          .to(
            meta,
            {
              x: 0,
              y: 0,
              duration: 0.38,
              ease: 'power3.out',
            },
            0.22,
          )

        return () => {
          timeline.kill()
          clearMotionStyles()
        }
      })
    }, heroStage)

    return () => {
      media.revert()
      context.revert()
    }
  }, [work.slug])

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const page = pageRef.current
    const gallery = galleryRef.current

    if (!page || !gallery) {
      return
    }

    const context = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>(
          `.${styles.commercialGalleryItem}`,
          gallery,
        )

        items.forEach((item, index) => {
          const image = item.querySelector('img')

          if (!image) {
            return
          }

          const rect = item.getBoundingClientRect()
          const isMobile = window.matchMedia('(max-width: 700px)').matches
          const centerRatio = (rect.left + rect.width / 2) / window.innerWidth
          const origin = isMobile
            ? 'top'
            : centerRatio < 0.43
              ? 'left'
              : centerRatio > 0.57
                ? 'right'
                : 'top'
          const initialClip =
            origin === 'left'
              ? 'inset(0 100% 0 0)'
              : origin === 'right'
                ? 'inset(0 0 0 100%)'
                : 'inset(0 0 100% 0)'
          const imageOffset =
            origin === 'left'
              ? { xPercent: -2.5, yPercent: 0 }
              : origin === 'right'
                ? { xPercent: 2.5, yPercent: 0 }
                : { xPercent: 0, yPercent: isMobile ? -1.5 : -2.5 }

          gsap.set(item, {
            clipPath: initialClip,
            willChange: 'clip-path',
          })
          gsap.set(image, {
            ...imageOffset,
            willChange: 'transform',
          })

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: 'top 88%',
              once: true,
            },
            defaults: {
              overwrite: 'auto',
            },
          })

          timeline
            .to(item, {
              clipPath: 'inset(0 0 0 0)',
              duration: 0.58,
              delay: (index % 2) * 0.07,
              ease: 'power3.out',
              onComplete: () => {
                gsap.set(item, { clearProps: 'clipPath,willChange' })
              },
            })
            .to(
              image,
              {
                xPercent: 0,
                yPercent: 0,
                duration: 0.68,
                ease: 'power3.out',
                onComplete: () => {
                  gsap.set(image, { clearProps: 'transform,willChange' })
                },
              },
              0,
            )
        })

      })

      return () => media.revert()
    }, page)

    const refreshFrame = window.requestAnimationFrame(() =>
      ScrollTrigger.refresh(),
    )

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      context.revert()
    }
  }, [images.length, work.slug])

  useLayoutEffect(() => {
    if (activeIndex === null) {
      return
    }

    const overlay = overlayRef.current
    const media = mediaRef.current

    if (!overlay || !media) {
      return
    }

    gsap.killTweensOf([overlay, media])
    gsap.set(media, { visibility: 'hidden' })

    if (!wasOpenRef.current) {
      wasOpenRef.current = true
      gsap.fromTo(overlay, { autoAlpha: 0 }, {
        autoAlpha: 1,
        duration: 0.22,
        ease: 'power2.out',
      })
      return
    }

    gsap.set(overlay, { autoAlpha: 1 })
  }, [activeIndex])

  const animateLightboxImage = () => {
    const media = mediaRef.current
    const image = lightboxImageRef.current

    if (!media || !image) {
      return
    }

    gsap.killTweensOf([media, image])
    gsap.set(media, { visibility: 'visible' })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(image, { clearProps: 'transform' })
      closeButtonRef.current?.focus()
      return
    }

    const sourceRect = sourceRectRef.current
    const imageRect = image.getBoundingClientRect()
    const canExpandFromSource =
      sourceRect &&
      sourceRect.width > 0 &&
      sourceRect.height > 0 &&
      imageRect.width > 0 &&
      imageRect.height > 0

    if (canExpandFromSource) {
      const sourceCenterX = sourceRect.left + sourceRect.width / 2
      const sourceCenterY = sourceRect.top + sourceRect.height / 2
      const imageCenterX = imageRect.left + imageRect.width / 2
      const imageCenterY = imageRect.top + imageRect.height / 2

      gsap.fromTo(
        image,
        {
          x: sourceCenterX - imageCenterX,
          y: sourceCenterY - imageCenterY,
          scaleX: sourceRect.width / imageRect.width,
          scaleY: sourceRect.height / imageRect.height,
          transformOrigin: 'center center',
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.46,
          ease: 'power3.inOut',
          clearProps: 'transform',
          onComplete: () => closeButtonRef.current?.focus(),
        },
      )
      return
    }

    gsap.fromTo(
      media,
      { scale: 0.985, y: 8 },
      {
        scale: 1,
        y: 0,
        duration: 0.24,
        ease: 'power2.out',
        clearProps: 'transform',
        onComplete: () => closeButtonRef.current?.focus(),
      },
    )
  }

  const measureLightboxImage = useCallback(() => {
    const image = lightboxImageRef.current

    if (!image || image.naturalWidth === 0 || image.naturalHeight === 0) {
      return
    }

    const isCompact = window.innerWidth <= 1050
    const maxWidth = isCompact
      ? window.innerWidth - 36
      : Math.min(window.innerWidth * 0.82, 1680)
    const maxHeight = isCompact
      ? window.innerHeight - 140
      : window.innerHeight * 0.82
    const aspectRatio = image.naturalWidth / image.naturalHeight
    const fitWidth = Math.min(
      image.naturalWidth,
      maxWidth,
      maxHeight * aspectRatio,
    )
    const expandedWidth = fitWidth * (100 / 30)

    setLightboxSizing({
      fitWidth,
      maxWidth: expandedWidth,
    })
  }, [])

  const handleLightboxImageLoad = () => {
    measureLightboxImage()
    window.requestAnimationFrame(animateLightboxImage)
  }

  const changeZoom = (direction: -1 | 1) => {
    const nextLevel = ZOOM_LEVELS[zoomIndex + direction]

    if (nextLevel === undefined) {
      return
    }

    const scroller = lightboxScrollRef.current

    if (scroller && scroller.scrollWidth > 0 && scroller.scrollHeight > 0) {
      zoomFocusRef.current = {
        x:
          (scroller.scrollLeft + scroller.clientWidth / 2) /
          scroller.scrollWidth,
        y:
          (scroller.scrollTop + scroller.clientHeight / 2) /
          scroller.scrollHeight,
      }
    }

    sourceRectRef.current = null
    setZoomLevel(nextLevel)
  }

  useLayoutEffect(() => {
    const scroller = lightboxScrollRef.current

    if (activeIndex === null || !scroller) {
      return
    }

    if (zoomLevel === 30) {
      scroller.scrollTo({ top: 0, left: 0 })
      zoomFocusRef.current = null
      return
    }

    const focus = zoomFocusRef.current ?? { x: 0.5, y: 0.5 }
    const frame = window.requestAnimationFrame(() => {
      scroller.scrollTo({
        left: focus.x * scroller.scrollWidth - scroller.clientWidth / 2,
        top: focus.y * scroller.scrollHeight - scroller.clientHeight / 2,
      })
      zoomFocusRef.current = null
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeIndex, targetImageWidth, zoomLevel])

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const handleResize = () => measureLightboxImage()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [activeIndex, measureLightboxImage])

  const handlePanPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      zoomLevel === 30 ||
      event.pointerType === 'touch' ||
      event.button !== 0 ||
      event.target !== lightboxImageRef.current
    ) {
      return
    }

    panStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: event.currentTarget.scrollLeft,
      startScrollTop: event.currentTarget.scrollTop,
      moved: false,
    }
    suppressPanClickRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.dataset.dragging = 'true'
  }

  const handlePanPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pan = panStateRef.current

    if (!pan || pan.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - pan.startX
    const deltaY = event.clientY - pan.startY

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      pan.moved = true
    }

    event.currentTarget.scrollLeft = pan.startScrollLeft - deltaX
    event.currentTarget.scrollTop = pan.startScrollTop - deltaY
    event.preventDefault()
  }

  const finishPan = (event: PointerEvent<HTMLDivElement>) => {
    const pan = panStateRef.current

    if (!pan || pan.pointerId !== event.pointerId) {
      return
    }

    suppressPanClickRef.current = pan.moved
    panStateRef.current = null
    event.currentTarget.dataset.dragging = 'false'

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleLightboxBackgroundClick = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (suppressPanClickRef.current) {
      suppressPanClickRef.current = false
      return
    }

    if (event.target === event.currentTarget) {
      closeImage()
    }
  }

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
      ref={pageRef}
      className={`${styles.page} ${styles.pageEditorial} ${variantClass} ${
        isInverted ? styles.pageInverted : ''
      }`}
      style={{ '--work-accent': work.accent } as CSSProperties}
    >
      <button
        type="button"
        className={styles.invertToggle}
        aria-pressed={isInverted}
        aria-label={isInverted ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
      />

      <header className={styles.commercialHero}>
        <div
          ref={heroStageRef}
          className={styles.commercialHeroStage}
          key={work.slug}
        >
          <h1 className={styles.commercialTitle} aria-label={work.title}>
            {titleWords.length > 0 ? (
              <span className={styles.commercialTitleLead}>
                {titleWords.map((word, index) => (
                  <span
                    className={styles.commercialTitleWordMask}
                    key={`${word}-${index}`}
                  >
                    <span
                      className={styles.commercialTitleWord}
                      data-title-word
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </span>
            ) : null}
            <span className={styles.commercialTitleTail}>
              <span className={styles.commercialTitleWordMask}>
                <span
                  className={styles.commercialTitleWord}
                  data-title-word
                >
                  {titleTail}
                </span>
              </span>
            </span>
          </h1>

          <figure ref={coverRef} className={styles.commercialCover}>
            {work.coverImageUrl ? (
              <button
                type="button"
                className={styles.commercialCoverButton}
                aria-label={`Open cover image 1 of ${lightboxImages.length}`}
                onClick={(event) => openImage(0, event)}
              >
                <Image
                  src={work.coverImageUrl}
                  alt={work.coverImageAlt || work.title}
                  fill
                  priority
                  sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1050px) 60vw, 46vw"
                  className={styles.commercialCoverImage}
                />
              </button>
            ) : (
              <span
                className={styles.commercialCoverFallback}
                style={{ background: work.surface }}
                role="img"
                aria-label={work.coverImageAlt || work.title}
              />
            )}
          </figure>

          <p ref={metaRef} className={styles.commercialMeta}>
            <span>{work.categoryLabel}</span>
            {work.year ? <span>{work.year}</span> : null}
          </p>

          <div
            ref={descriptionRef}
            className={styles.commercialDescription}
          >
            <p>{work.description}</p>
            {work.role ? <p className={styles.commercialRole}>{work.role}</p> : null}
            {work.projectLinks && work.projectLinks.length > 0 ? (
              <nav
                className={styles.commercialProjectLinks}
                aria-label={`${work.title} project links`}
              >
                {work.projectLinks.map((link) => (
                  <a
                    href={link.url}
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
      </header>

      {images.length > 0 ? (
        <section
          ref={galleryRef}
          className={styles.commercialGallerySection}
          aria-label={`${work.title} image overview`}
        >
          <div className={styles.commercialGalleryGrid}>
            {images.map((image, index) => {
              const layoutClass =
                styles[
                  `commercialLayout${
                    ((index + galleryOffset) % 15) + 1
                  }` as keyof typeof styles
                ]
              const dimensions = getImageDimensions(image.url)

              return (
                <button
                  type="button"
                  className={`${styles.commercialGalleryItem} ${layoutClass}`}
                  aria-label={`Open image ${
                    index + 1 + galleryLightboxOffset
                  } of ${lightboxImages.length}`}
                  onClick={(event) =>
                    openImage(index + galleryLightboxOffset, event)
                  }
                  key={`${image.url}-${index}`}
                >
                  <span className={styles.commercialImageFrame}>
                    <Image
                      src={image.url}
                      alt={image.alt || `${work.title} image ${index + 1}`}
                      width={dimensions.width}
                      height={dimensions.height}
                      sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1050px) 78vw, 64vw"
                    />
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <footer className={styles.footer}>
        <Link href="/works" className={styles.footerLink}>
          <span>All works</span>
          <svg
            className={styles.footerWorksIcon}
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M6 3 2 7l4 4M2.5 7H10c2.6 0 4 1.3 4 3.5S12.6 14 10 14" />
          </svg>
        </Link>

        {nextWork ? (
          <Link href={nextWork.href} className={styles.nextProject}>
            <span className={styles.nextLabel}>Next project</span>
            <span className={styles.nextProjectTitle}>{nextWork.title}</span>
            <svg
              className={styles.nextProjectArrow}
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path d="M4 12 12 4M9 4h3v3" />
            </svg>
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
                  onPointerEnter={(event) => showPreview(index, event)}
                  onPointerLeave={() => setPreview(null)}
                  onFocus={(event) => {
                    setPreview({
                      index,
                      top: getSafePreviewTop(event.currentTarget),
                    })
                  }}
                  onBlur={() => setPreview(null)}
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

      {previewWork && preview ? (
        <div
          className={detailStyles.workPreview}
          style={{ '--preview-top': `${preview.top}px` } as CSSProperties}
          aria-hidden="true"
        >
          <div className={detailStyles.previewImage}>
            {previewWork.coverImageUrl ? (
              <Image
                src={previewWork.coverImageUrl}
                alt=""
                fill
                sizes="(max-width: 900px) 220px, 360px"
                className={detailStyles.previewCover}
              />
            ) : (
              <span
                className={detailStyles.previewFallback}
                style={{ background: previewWork.surface }}
              >
                {previewWork.title}
              </span>
            )}
          </div>
          <span className={detailStyles.previewCaption}>
            {previewWork.title}
          </span>
        </div>
      ) : null}

      {activeImage && activeIndex !== null ? (
        <div
          ref={overlayRef}
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${work.title} image ${activeIndex + 1}`}
          data-zoom-level={zoomLevel}
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
            disabled={lightboxImages.length < 2}
          >
            <span aria-hidden="true">←</span>
          </button>

          <div
            ref={lightboxScrollRef}
            className={styles.lightboxScrollArea}
            data-pannable={zoomLevel !== 30}
            onPointerDown={handlePanPointerDown}
            onPointerMove={handlePanPointerMove}
            onPointerUp={finishPan}
            onPointerCancel={finishPan}
            onClick={handleLightboxBackgroundClick}
          >
            <div
              ref={mediaRef}
              className={styles.lightboxMedia}
              onClick={handleLightboxBackgroundClick}
            >
              <img
                ref={lightboxImageRef}
                key={activeImage.url}
                src={activeImage.url}
                alt={
                  activeImage.alt || `${work.title} image ${activeIndex + 1}`
                }
                decoding="async"
                onLoad={handleLightboxImageLoad}
                style={zoomImageStyle}
                draggable={false}
              />
            </div>
          </div>

          <div
            className={styles.zoomControls}
            role="group"
            aria-label="Image zoom controls"
          >
            <button
              type="button"
              className={styles.zoomButton}
              aria-label="Zoom out"
              disabled={zoomIndex === 0}
              onClick={() => changeZoom(-1)}
            >
              <span className={styles.zoomMinus} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.zoomButton}
              aria-label="Zoom in"
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              onClick={() => changeZoom(1)}
            >
              <span className={styles.zoomPlus} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            aria-label="Next image"
            onClick={showNext}
            disabled={lightboxImages.length < 2}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </main>
  )
}
