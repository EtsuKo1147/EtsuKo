'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from 'react'
import type { SanityImageSource } from '@sanity/image-url'
import NextImage from 'next/image'
import { imageLoader } from 'next-sanity/image'
import { urlFor } from '@/sanity/lib/image'

type NextImageProps = ComponentProps<typeof NextImage>

type SanityImageProps = Omit<
  NextImageProps,
  | 'src'
  | 'alt'
  | 'width'
  | 'height'
  | 'fill'
  | 'sizes'
  | 'quality'
  | 'priority'
  | 'preload'
  | 'className'
  | 'style'
  | 'ref'
  | 'loader'
> & {
  image: SanityImageSource
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes: string
  quality?: number
  priority?: boolean
  className?: string
  objectFit?: CSSProperties['objectFit']
  style?: CSSProperties
  deferUntilNearViewport?: boolean
  deferDelayMs?: number
}

type SanityImageRecord = {
  asset?: {
    _id?: string
    _ref?: string
    url?: string
    metadata?: {
      dimensions?: {
        width?: number
        height?: number
      }
    }
  }
  crop?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
}

type DeferredImagePhase = 'deferred' | 'full'

const FALLBACK_DIMENSIONS = { width: 1600, height: 1200 }
const DEFERRED_IMAGE_SIZES = '1px'
const DEFERRED_IMAGE_QUALITY = 72

function readAssetDimensions(image: SanityImageSource) {
  if (!image || typeof image !== 'object') {
    return FALLBACK_DIMENSIONS
  }

  const source = image as SanityImageRecord
  const metadataDimensions = source.asset?.metadata?.dimensions

  if (metadataDimensions?.width && metadataDimensions.height) {
    return {
      width: metadataDimensions.width,
      height: metadataDimensions.height,
    }
  }

  const assetIdentity = source.asset?._ref || source.asset?._id || source.asset?.url || ''
  const match = assetIdentity.match(/-(\d+)x(\d+)(?:-|\.)/)

  if (!match) {
    return FALLBACK_DIMENSIONS
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  }
}

export function getSanityImageDimensions(image: SanityImageSource) {
  const source = image as SanityImageRecord
  const dimensions = readAssetDimensions(image)
  const crop = source.crop

  if (!crop) {
    return dimensions
  }

  return {
    width: Math.max(
      1,
      Math.round(dimensions.width * (1 - (crop.left || 0) - (crop.right || 0))),
    ),
    height: Math.max(
      1,
      Math.round(dimensions.height * (1 - (crop.top || 0) - (crop.bottom || 0))),
    ),
  }
}

const SanityImage = forwardRef<HTMLImageElement, SanityImageProps>(
  function SanityImage(
    {
      image,
      alt,
      width,
      height,
      fill = false,
      sizes,
      quality = 80,
      priority = false,
      className,
      objectFit,
      style,
      deferUntilNearViewport = false,
      deferDelayMs = 0,
      onLoad,
      ...imageProps
    },
    ref,
  ) {
    const internalRef = useRef<HTMLImageElement | null>(null)
    const [deferredPhase, setDeferredPhase] = useState<DeferredImagePhase>(
      deferUntilNearViewport ? 'deferred' : 'full',
    )
    const intrinsicDimensions = getSanityImageDimensions(image)
    const aspectRatio = intrinsicDimensions.width / intrinsicDimensions.height
    const renderedWidth = width || Math.round((height || intrinsicDimensions.height) * aspectRatio)
    const renderedHeight = height || Math.round(renderedWidth / aspectRatio)
    const imageStyle = objectFit ? { ...style, objectFit } : style
    const src = urlFor(image).url()
    const effectivePhase = priority || !deferUntilNearViewport ? 'full' : deferredPhase
    const responsiveSizes =
      effectivePhase === 'full' ? sizes : DEFERRED_IMAGE_SIZES
    const responsiveQuality =
      effectivePhase === 'full' ? quality : DEFERRED_IMAGE_QUALITY
    const setImageRef = useCallback(
      (node: HTMLImageElement | null) => {
        internalRef.current = node

        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    useEffect(() => {
      if (
        !deferUntilNearViewport ||
        priority ||
        deferredPhase !== 'deferred'
      ) {
        return
      }

      const imageElement = internalRef.current
      let loadTimer: number | null = null

      if (!imageElement || typeof IntersectionObserver === 'undefined') {
        setDeferredPhase('full')
        return
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) {
            return
          }

          if (deferDelayMs > 0) {
            loadTimer = window.setTimeout(() => {
              setDeferredPhase('full')
            }, deferDelayMs)
          } else {
            setDeferredPhase('full')
          }

          observer.disconnect()
        },
        { rootMargin: '700px 0px' },
      )

      observer.observe(imageElement)

      return () => {
        observer.disconnect()

        if (loadTimer !== null) {
          window.clearTimeout(loadTimer)
        }
      }
    }, [deferDelayMs, deferUntilNearViewport, deferredPhase, priority])

    const handleImageLoad = useCallback<
      NonNullable<NextImageProps['onLoad']>
    >(
      (event) => {
        if (
          deferUntilNearViewport &&
          effectivePhase === 'full' &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
          typeof event.currentTarget.animate === 'function'
        ) {
          event.currentTarget.animate(
            [
              { opacity: 0.9, filter: 'blur(2px)' },
              { opacity: 1, filter: 'blur(0px)' },
            ],
            {
              duration: 260,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            },
          )
        }

        onLoad?.(event)
      },
      [deferUntilNearViewport, effectivePhase, onLoad],
    )

    if (fill) {
      return (
        <NextImage
          {...imageProps}
          ref={setImageRef}
          loader={imageLoader}
          src={src}
          alt={alt}
          fill
          sizes={responsiveSizes}
          quality={responsiveQuality}
          preload={priority}
          className={className}
          style={imageStyle}
          onLoad={handleImageLoad}
        />
      )
    }

    return (
      <NextImage
        {...imageProps}
        ref={setImageRef}
        loader={imageLoader}
        src={src}
        alt={alt}
        width={renderedWidth}
        height={renderedHeight}
        sizes={responsiveSizes}
        quality={responsiveQuality}
        preload={priority}
        className={className}
        style={imageStyle}
        onLoad={handleImageLoad}
      />
    )
  },
)

export default SanityImage
