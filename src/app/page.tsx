import HomePageClient from './HomePageClient'
import { getWorks } from '@/sanity/lib/works'

export default async function HomePage() {
  const works = await getWorks()
  const prioritizedWorks = [
    ...works.filter((work) => work.featured),
    ...works.filter((work) => !work.featured),
  ]
  const featuredWorks = prioritizedWorks
    .slice(0, 4)
    .map((work, index) => (index === 2 ? works[5] ?? work : work))
  const featuredLargeWorkHref = works[4]?.href ?? '/works'

  return (
    <HomePageClient
      featuredWorks={featuredWorks}
      featuredLargeWorkHref={featuredLargeWorkHref}
    />
  )
}
