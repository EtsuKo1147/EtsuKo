import { getWorks } from '@/sanity/lib/works'
import type { WorkCategory } from '@/data/works'
import WorksView from './WorksView'

export const metadata = { title: 'Works — Etsu.' }

type ActiveCategory = 'all' | WorkCategory

type WorksPageProps = {
  searchParams?: Promise<{
    category?: string | string[]
  }>
}

function normalizeCategoryParam(category: string | string[] | undefined): ActiveCategory {
  const rawCategory = Array.isArray(category) ? category[0] : category

  switch (rawCategory?.toLowerCase()) {
    case 'branding':
      return 'branding'
    case 'illustration':
    case 'graphic':
      return 'graphic'
    case 'web':
      return 'web'
    case 'photography':
      return 'photography'
    default:
      return 'all'
  }
}

export default async function WorksPage({ searchParams }: WorksPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const works = await getWorks()
  const initialCategory = normalizeCategoryParam(resolvedSearchParams?.category)

  return <WorksView key={initialCategory} works={works} initialCategory={initialCategory} />
}
