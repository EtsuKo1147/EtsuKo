import {
  works as fallbackWorks,
  workCategories,
  type Work,
  type WorkCategory,
  type WorkImage,
} from '@/data/works'
import { client } from './client'

type SanityWorkImage = {
  url?: string
  alt?: string
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
}

const worksQuery = `*[_type == "work"] | order(order asc, _createdAt asc) {
  _id,
  title,
  "slug": slug.current,
  category,
  year,
  description,
  summary,
  role,
  tools,
  accent,
  surface,
  featured,
  order,
  "coverImage": {
    "url": coverImage.asset->url,
    "alt": coverImage.alt
  },
  "galleryImages": galleryImages[] {
    "url": asset->url,
    "alt": alt
  }
}`

const workBySlugQuery = `*[_type == "work" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  category,
  year,
  description,
  summary,
  role,
  tools,
  accent,
  surface,
  featured,
  order,
  "coverImage": {
    "url": coverImage.asset->url,
    "alt": coverImage.alt
  },
  "galleryImages": galleryImages[] {
    "url": asset->url,
    "alt": alt
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
  if (!image?.url) {
    return undefined
  }

  return {
    url: image.url,
    alt: image.alt,
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
    coverImageUrl: coverImage?.url,
    coverImageAlt: coverImage?.alt || work.title,
    galleryImages,
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
