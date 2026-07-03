'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import Link from 'next/link'
import { workCategories, works } from '@/data/works'
import { profileCopy, type ProfileLanguage } from '@/data/profile'
import HomePhysicsFooter from './HomePhysicsFooter'
import styles from './HomeMinimalIndex.module.css'

const categories = ['all', ...workCategories.map((category) => category.slug)]
const homeWorks = works.slice(0, 5)

export default function HomeMinimalIndex() {
  const [profileLanguage, setProfileLanguage] = useState<ProfileLanguage>('en')
  const profile = profileCopy[profileLanguage]

  return (
    <section className={styles.index} aria-labelledby="home-work-index-title">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Selected index</p>
        <h2 id="home-work-index-title" className={styles.title}>
          Works
        </h2>
        <p className={styles.intro}>
          Visual design, web direction, graphics, images, and small interactive
          experiments.
        </p>
      </div>

      <nav className={styles.categoryNav} aria-label="Work categories">
        {categories.map((category) => (
          <Link href="/works" key={category}>
            {category}
          </Link>
        ))}
      </nav>

      <div className={styles.workGrid}>
        {homeWorks.map((work) => (
          <Link className={styles.workTile} href={work.href} key={work.id}>
            <figure className={styles.figure}>
              <span className={styles.placeholderIndex}>{work.id}</span>
              <span className={styles.placeholderRing} />
              <span className={styles.placeholderBar} />
              <span className={styles.placeholderDot} />
            </figure>
            <div className={styles.meta}>
              <span>{work.id}</span>
              <h3>{work.title}</h3>
              <p>
                {work.categoryLabel} / {work.year}
              </p>
            </div>
          </Link>
        ))}
        <Link className={styles.viewMoreLink} href="/works" aria-label="View more works">
          <span className={styles.viewMoreText}>view more</span>
          <svg
            className={styles.viewMoreArrow}
            viewBox="0 0 64 28"
            aria-hidden="true"
          >
            <path d="M4 14H54" />
            <path d="M44 5 56 14 44 23" />
          </svg>
        </Link>
      </div>

      <section className={styles.profileSection} aria-labelledby="home-profile-title">
        <div className={styles.profileHeader}>
          <p className={styles.eyebrow}>Selected profile</p>
          <h2 id="home-profile-title" className={styles.title}>
            Profile
          </h2>
          <p
            className={`${styles.profileLead} ${
              profileLanguage === 'jp' ? styles.profileJapanese : ''
            }`}
          >
            {profile.lead.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </div>

        <div className={styles.profileArcade}>
          <div className={styles.profileStage}>
            <img
              src="/home/character-stage/doodles/character-3.svg"
              alt=""
              className={styles.profileCharacter}
              draggable={false}
            />

            <div className={styles.profileConsoleFrame}>
              <img
                src="/home/character-stage/doodles/new-gameplayer-2-02.svg"
                alt=""
                className={styles.profileConsole}
                draggable={false}
              />

              <div className={styles.profileScreen} aria-live="polite">
                <div
                  key={profileLanguage}
                  className={`${styles.profileScreenContent} ${
                    profileLanguage === 'jp' ? styles.profileJapanese : ''
                  }`}
                >
                  <dl className={styles.profileList}>
                    {profile.items.map((item) => (
                      <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>
                          {item.value.map((line) => (
                            <span key={line}>{line}</span>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    className={styles.profileLanguage}
                    onClick={() =>
                      setProfileLanguage((currentLanguage) =>
                        currentLanguage === 'en' ? 'jp' : 'en',
                      )
                    }
                  >
                    {profile.languageLabel}
                    <br />
                    {profile.languageSwitch}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.contactWorld} data-contact-world>
        <HomePhysicsFooter />

        <section className={styles.contactSection} aria-labelledby="home-contact-title">
          <div className={styles.contactHeader}>
            <p className={styles.eyebrow}>Selected contact</p>
            <h2 id="home-contact-title" className={styles.title} data-physics-trigger>
              Contact
            </h2>
          </div>

          <div className={styles.directMailPanel}>
            <img
              src="/home/character-stage/doodles/character-6.svg"
              alt=""
              className={styles.directMailDoodle}
              draggable={false}
            />
            <h3 id="home-direct-mail-title" className={styles.directMailTitle}>
              Direct Mail
            </h3>
            <a
              className={styles.directMailLink}
              href="mailto:koetsu1147@gmail.com?subject=Portfolio%20Contact"
            >
              koetsu1147@gmail.com
            </a>
            <button
              type="button"
              className={styles.topButton}
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img src="/home/character-stage/ui/top-up.svg" alt="" draggable={false} />
              <span>top</span>
            </button>
            <div className={styles.contactCredits} aria-label="Footer credits">
              <p>Designed &amp; Built by ETSU.</p>
              <p>&copy; 2026</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
