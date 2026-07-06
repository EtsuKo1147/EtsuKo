'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import Link from 'next/link'
import { profileCopy, type ProfileLanguage } from '@/data/profile'
import HomePhysicsFooter from './HomePhysicsFooter'
import styles from './HomeMinimalIndex.module.css'

const polaroidAssetPath = '/home/images/works-polaroid'

const polaroidCategories = [
  {
    label: 'Branding',
    image: `${polaroidAssetPath}/work-branding.jpg`,
  },
  {
    label: 'Illustration',
    image: `${polaroidAssetPath}/work-illustration.jpg`,
  },
  {
    label: 'Web',
    image: `${polaroidAssetPath}/work-web.jpg`,
  },
  {
    label: 'Photography',
    image: `${polaroidAssetPath}/work-photography.jpg`,
  },
]

const featuredPolaroids = [
  {
    title: 'Loop Identity System',
    ghost: 'Branding',
    role: 'VI / LOGO / Package',
    year: '2026',
    image: `${polaroidAssetPath}/featured-01.jpg`,
    href: '/works/loop-identity-system',
  },
  {
    title: 'Type Signal Posters',
    ghost: 'Illustration',
    role: 'LOGO / Typography / Poster',
    year: '2025',
    image: `${polaroidAssetPath}/featured-02.jpg`,
    href: '/works/type-signal-posters',
  },
  {
    title: 'Etsu Portfolio System',
    ghost: 'Web Design',
    role: 'Web / Interaction / Frontend',
    year: '2026',
    image: `${polaroidAssetPath}/featured-03.jpg`,
    href: '/works/etsu-portfolio-system',
  },
  {
    title: 'North Pier Frames',
    ghost: 'Photography',
    role: 'Photography / Retouching',
    year: '2025',
    image: `${polaroidAssetPath}/featured-04.jpg`,
    href: '/works/north-pier-frames',
  },
]

export default function HomeMinimalIndex() {
  const [profileLanguage, setProfileLanguage] = useState<ProfileLanguage>('en')
  const profile = profileCopy[profileLanguage]
  const activeCategory = polaroidCategories[0]

  return (
    <section className={styles.index} aria-labelledby="home-work-index-title">
      <div className={styles.worksPolaroid} aria-labelledby="home-work-index-title">
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

        <div className={styles.polaroidHero}>
          <div className={styles.cameraStage} aria-label={`${activeCategory.label} work preview`}>
            <img
              src={`${polaroidAssetPath}/polaroid-camera-up.svg`}
              alt=""
              className={`${styles.cameraLayer} ${styles.cameraUp}`}
              draggable={false}
            />
            <img
              src={`${polaroidAssetPath}/polaroid-camera-down.svg`}
              alt=""
              className={`${styles.cameraLayer} ${styles.cameraDown}`}
              draggable={false}
            />

            <div className={styles.paperMask}>
              <div className={styles.cameraPaper}>
                <img
                  src={`${polaroidAssetPath}/polaroid-paper-blank.svg`}
                  alt=""
                  className={styles.paperShell}
                  draggable={false}
                />
                <img
                  src={activeCategory.image}
                  alt=""
                  className={styles.paperImage}
                  draggable={false}
                />
                <span className={styles.paperCaption}>{activeCategory.label}</span>
              </div>
            </div>
            <span className={styles.exitShadow} aria-hidden="true" />
          </div>

          <nav className={styles.polaroidCategories} aria-label="Work categories">
            {polaroidCategories.map((category) => (
              <Link
                href="/works"
                key={category.label}
                className={category.label === activeCategory.label ? styles.activeCategory : ''}
              >
                {category.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.featuredBoard}>
          {featuredPolaroids.map((work) => (
            <article className={styles.featuredItem} key={work.title}>
              <div className={styles.featuredCopy}>
                <span className={styles.featuredGhost}>{work.ghost}</span>
                <h3>{work.title}</h3>
                <p>{work.role}</p>
                <span>{work.year}</span>
              </div>

              <Link
                href={work.href}
                className={styles.featuredPhoto}
                aria-label={`View ${work.title}`}
              >
                <img
                  src={`${polaroidAssetPath}/polaroid-paper-blank.svg`}
                  alt=""
                  className={styles.featuredShell}
                  draggable={false}
                />
                <img
                  src={work.image}
                  alt=""
                  className={styles.featuredImage}
                  draggable={false}
                />
                <span className={styles.featuredStrip}>
                  <span>{work.title}</span>
                  <span>{work.year}</span>
                </span>
              </Link>
            </article>
          ))}
        </div>

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
              <span>back</span>
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
