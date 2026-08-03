import {
  works as fallbackWorks,
  workCategories,
  type Work,
  type WorkCategory,
  type WorkImage,
  type WorkLink,
} from '@/data/works'
import type { SanityImageSource } from '@sanity/image-url'
import { client } from './client'

type SanityWorkImage = {
  asset?: {
    _id?: string
    url?: string
    metadata?: {
      dimensions?: {
        width?: number
        height?: number
        aspectRatio?: number
      }
    }
  }
  crop?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  hotspot?: {
    x?: number
    y?: number
    height?: number
    width?: number
  }
  alt?: string
}

type SanityWorkLink = {
  label?: string
  url?: string
}

type SanityWork = {
  _id: string
  title?: string
  slug?: string
  category?: string
  year?: string
  description?: string
  summary?: string
  role?: string
  tools?: string
  accent?: string
  surface?: string
  featured?: boolean
  order?: number
  coverImage?: SanityWorkImage
  galleryImages?: SanityWorkImage[]
  projectLinks?: SanityWorkLink[]
}

const worksQuery = `*[_type == "work"] | order(order asc, _createdAt asc) {
  _id,
  title,
  "slug": slug.current,
  category,
  year,
  description,
  role,
  accent,
  surface,
  featured,
  order,
  coverImage {
    asset->{
      _id,
      url,
      metadata { dimensions }
    },
    crop,
    hotspot,
    alt
  }
}`

const workBySlugQuery = `*[_type == "work" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  category,
  year,
  description,
  projectLinks[] {
    label,
    url
  },
  summary,
  role,
  tools,
  accent,
  surface,
  featured,
  order,
  coverImage {
    asset->{
      _id,
      url,
      metadata { dimensions }
    },
    crop,
    hotspot,
    alt
  },
  galleryImages[] {
    asset->{
      _id,
      url,
      metadata { dimensions }
    },
    crop,
    hotspot,
    alt
  }
}`

const categoryLabels = new Map(workCategories.map((category) => [category.slug, category.label]))

function isWorkCategory(category: string | undefined): category is WorkCategory {
  return (
    category === 'branding' ||
    category === 'photography' ||
    category === 'web' ||
    category === 'graphic'
  )
}

function normalizeWorkImage(image: SanityWorkImage | undefined): WorkImage | undefined {
  if (!image?.asset?.url) {
    return undefined
  }

  return {
    url: image.asset.url,
    alt: image.alt,
    source: image as SanityImageSource,
  }
}

function normalizeWorkLink(link: SanityWorkLink | undefined): WorkLink | undefined {
  if (!link?.label || !link.url) {
    return undefined
  }

  return {
    label: link.label,
    url: link.url,
  }
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

function normalizeSanityWork(work: SanityWork, index: number): Work | null {
  if (!work.title || !work.slug || !isWorkCategory(work.category)) {
    return null
  }

  const id = String(work.order || index + 1).padStart(2, '0')
  const coverImage = normalizeWorkImage(work.coverImage)
  const galleryImages = work.galleryImages?.map(normalizeWorkImage).filter(isPresent)
  const projectLinks = work.projectLinks?.map(normalizeWorkLink).filter(isPresent)

  return {
    id,
    slug: work.slug,
    title: work.title,
    category: work.category,
    categoryLabel: categoryLabels.get(work.category) || work.category,
    year: work.year || '',
    description: work.description || '',
    summary: work.summary || '',
    role: work.role || '',
    tools: work.tools || '',
    accent: work.accent || '#363636',
    surface: work.surface || '#ecebe6',
    featured: work.featured,
    href: `/works/${work.slug}`,
    coverImage: coverImage
      ? { ...coverImage, alt: coverImage.alt || work.title }
      : undefined,
    galleryImages,
    projectLinks,
  }
}

export async function getWorks(): Promise<Work[]> {
  try {
    const sanityWorks = await client.fetch<SanityWork[]>(
      worksQuery,
      {},
      { next: { revalidate: 60 } }
    )
    const normalizedWorks = sanityWorks.map(normalizeSanityWork).filter(isPresent)

    return normalizedWorks.length > 0 ? normalizedWorks : fallbackWorks
  } catch (error) {
    console.warn('Failed to fetch Sanity works. Falling back to local works.', error)
    return fallbackWorks
  }
}

export async function getWorkBySlug(slug: string): Promise<Work | undefined> {
  try {
    const sanityWork = await client.fetch<SanityWork | null>(
      workBySlugQuery,
      { slug },
      { next: { revalidate: 60 } }
    )
    const normalizedWork = sanityWork ? normalizeSanityWork(sanityWork, 0) : null

    return normalizedWork || fallbackWorks.find((work) => work.slug === slug)
  } catch (error) {
    console.warn('Failed to fetch Sanity work. Falling back to local work.', error)
    return fallbackWorks.find((work) => work.slug === slug)
  }
}
