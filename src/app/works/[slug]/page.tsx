import { notFound } from 'next/navigation'
import { getWorkBySlug, getWorks } from '@/sanity/lib/works'
import EditorialPhotographyDetail from './EditorialPhotographyDetail'
import WorkDetailView from './WorkDetailView'

type WorkDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: WorkDetailPageProps) {
  const { slug } = await params
  const work = await getWorkBySlug(slug)

  if (!work) {
    return { title: 'Work Not Found — Etsu.' }
  }

  return { title: `${work.title} — Etsu.` }
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params
  const [works, work] = await Promise.all([
    getWorks(),
    getWorkBySlug(slug),
  ])

  if (!work) {
    notFound()
  }

  const isWorkInNavigation = works.some((item) => item.slug === work.slug)
  const detailWorks = isWorkInNavigation ? works : [...works, work]
  const currentIndex = detailWorks.findIndex((item) => item.slug === work.slug)
  const nextWork =
    detailWorks.length > 1
      ? detailWorks[(currentIndex + 1 + detailWorks.length) % detailWorks.length]
      : null

  if (
    (currentIndex === 4 || currentIndex === 5) &&
    work.galleryImages &&
    work.galleryImages.length > 0
  ) {
    return (
      <EditorialPhotographyDetail
        work={work}
        works={detailWorks}
        nextWork={nextWork}
        displayIndex={currentIndex + 1}
        layoutVariant={currentIndex === 4 ? 'alternate' : 'standard'}
      />
    )
  }

  return <WorkDetailView work={work} works={detailWorks} />
}
