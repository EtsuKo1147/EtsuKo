import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { works } from '@/data/works'
import styles from './page.module.css'

type WorkDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: WorkDetailPageProps) {
  const { slug } = await params
  const work = works.find((item) => item.slug === slug)

  if (!work) {
    return { title: 'Work Not Found — Etsu.' }
  }

  return { title: `${work.title} — Etsu.` }
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params
  const work = works.find((item) => item.slug === slug)

  if (!work) {
    notFound()
  }

  return (
    <main
      className={styles.page}
      style={
        {
          '--work-accent': work.accent,
          '--work-surface': work.surface,
        } as CSSProperties
      }
    >
      <section className={styles.hero}>
        <div className={styles.meta}>
          <p className={styles.eyebrow}>Selected Works / {work.id}</p>
          <h1 className={styles.title}>{work.title}</h1>
          <p className={styles.category}>
            {work.categoryLabel} / {work.year}
          </p>
        </div>

        <p className={styles.description}>{work.description}</p>
      </section>

      <Link href="/works" className={styles.figureLink} aria-label="Back to all works">
        <figure className={styles.figure}>
          <span className={styles.placeholderIndex}>{work.id}</span>
          <span className={styles.placeholderRing} />
          <span className={styles.placeholderBar} />
          <span className={styles.placeholderDot} />
          <figcaption>Click image to return to works</figcaption>
        </figure>
      </Link>

      <section className={styles.detailGrid} aria-label="Project detail">
        <div>
          <p className={styles.detailLabel}>Overview</p>
          <p className={styles.summary}>{work.summary}</p>
        </div>
        <dl className={styles.detailList}>
          <div>
            <dt>Category</dt>
            <dd>{work.categoryLabel}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{work.role}</dd>
          </div>
          <div>
            <dt>Tools</dt>
            <dd>{work.tools}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{work.year}</dd>
          </div>
        </dl>
      </section>

      <Link href="/works" className={styles.backLink}>
        Back to works
      </Link>
    </main>
  )
}
