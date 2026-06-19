import { notFound } from 'next/navigation'
import styles from './page.module.css'

const workDetails = [
  {
    slug: 'work-01',
    title: 'Selected Works 1',
    category: 'Branding / Web Design',
    image: '/works-console/previews/work-01.svg',
  },
  {
    slug: 'work-02',
    title: 'Selected Works 2',
    category: 'Illustration / Visual Identity',
    image: '/works-console/previews/work-02.svg',
  },
  {
    slug: 'work-03',
    title: 'Selected Works 3',
    category: 'Web Design / Interactive',
    image: '/works-console/previews/work-03.svg',
  },
  {
    slug: 'work-04',
    title: 'Selected Works 4',
    category: 'Graphic Design / Editorial',
    image: '/works-console/previews/work-04.svg',
  },
  {
    slug: 'work-05',
    title: 'Selected Works 5',
    category: 'Art Direction / Photography',
    image: '/works-console/previews/work-05.svg',
  },
]

type WorkDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: WorkDetailPageProps) {
  const { slug } = await params
  const work = workDetails.find((item) => item.slug === slug)

  if (!work) {
    return { title: 'Work Not Found — Etsu.' }
  }

  return { title: `${work.title} — Etsu.` }
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params
  const work = workDetails.find((item) => item.slug === slug)

  if (!work) {
    notFound()
  }

  return (
    <main className={styles.page}>
      <div className={styles.meta}>
        <p className={styles.eyebrow}>Selected Works</p>
        <h1 className={styles.title}>{work.title}</h1>
        <p className={styles.category}>{work.category}</p>
      </div>

      <figure className={styles.figure}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={work.image} alt={work.title} className={styles.image} />
      </figure>
    </main>
  )
}
