'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { workCategories, type Work, type WorkCategory } from '@/data/works'
import styles from './page.module.css'

type ActiveCategory = 'all' | WorkCategory

const categoryOptions: { slug: ActiveCategory; label: string }[] = [
  { slug: 'all', label: 'All' },
  ...workCategories,
]

type WorksViewProps = {
  works: Work[]
}

export default function WorksView({ works }: WorksViewProps) {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('all')
  const [isInverted, setIsInverted] = useState(false)

  const visibleWorks = useMemo(() => {
    if (activeCategory === 'all') {
      return works
    }

    return works.filter((work) => work.category === activeCategory)
  }, [activeCategory, works])

  return (
    <main className={`${styles.page} ${isInverted ? styles.pageInverted : ''}`}>
      <button
        type="button"
        className={styles.invertToggle}
        aria-pressed={isInverted}
        aria-label={isInverted ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setIsInverted((currentValue) => !currentValue)}
      />

      <section className={styles.hero} aria-labelledby="works-title">
        <p className={styles.eyebrow}>Selected projects</p>
        <h1 id="works-title" className={styles.title}>
          Works
        </h1>
        <p className={styles.intro}>
          A compact index across branding, photography, web, and graphic design.
          Built now as local data, shaped for a future Sanity setup.
        </p>
      </section>

      <nav className={styles.categoryNav} aria-label="Work categories">
        {categoryOptions.map((category) => (
          <button
            type="button"
            key={category.slug}
            className={activeCategory === category.slug ? styles.categoryActive : undefined}
            aria-pressed={activeCategory === category.slug}
            onClick={() => setActiveCategory(category.slug)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      <section className={styles.workGrid} aria-live="polite">
        {visibleWorks.map((work) => (
          <Link
            href={work.href}
            className={`${styles.workCard} ${work.featured ? styles.workCardFeatured : ''}`}
            key={work.id}
            style={
              {
                '--work-accent': work.accent,
                '--work-surface': work.surface,
              } as CSSProperties
            }
          >
            <figure className={styles.figure} aria-label={`${work.title} cover image`}>
              {work.coverImageUrl ? (
                <Image
                  src={work.coverImageUrl}
                  alt={work.coverImageAlt || work.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
                  className={styles.coverImage}
                />
              ) : (
                <>
                  <span className={styles.placeholderRing} />
                  <span className={styles.placeholderBar} />
                  <span className={styles.placeholderDot} />
                </>
              )}
              <span className={styles.placeholderIndex}>{work.id}</span>
            </figure>
            <div className={styles.cardMeta}>
              <span>{work.id}</span>
              <h2>{work.title}</h2>
              <p>
                {work.categoryLabel} / {work.year}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
