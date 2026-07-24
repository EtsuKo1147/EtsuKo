import { notFound } from 'next/navigation'
import { getWorkBySlug, getWorks } from '@/sanity/lib/works'
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

  return <WorkDetailView work={work} works={detailWorks} />
}
