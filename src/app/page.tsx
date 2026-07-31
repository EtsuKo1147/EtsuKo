import HomePageClient from './HomePageClient'
import { getWorks } from '@/sanity/lib/works'

export default async function HomePage() {
  const works = await getWorks()
  const featuredWorks = [
    ...works.filter((work) => work.featured),
    ...works.filter((work) => !work.featured),
  ].slice(0, 4)
  const featuredLargeWorkHref = works[4]?.href ?? '/works'

  return (
    <HomePageClient
      featuredWorks={featuredWorks}
      featuredLargeWorkHref={featuredLargeWorkHref}
    />
  )
}
