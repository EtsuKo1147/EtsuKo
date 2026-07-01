'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import Link from 'next/link'
import HomePhysicsFooter from './HomePhysicsFooter'
import styles from './HomeMinimalIndex.module.css'

const categories = ['all', 'web', 'graphic', 'photo', 'illustration', 'branding']

const works = [
  {
    id: '01',
    title: 'Project One',
    category: 'Web Design',
    year: '2024',
    image: '/home/character-stage/works-console/previews/work-01.svg',
  },
  {
    id: '02',
    title: 'Project Two',
    category: 'Branding',
    year: '2024',
    image: '/home/character-stage/works-console/previews/work-02.svg',
  },
  {
    id: '03',
    title: 'Project Three',
    category: 'Motion',
    year: '2023',
    image: '/home/character-stage/works-console/previews/work-03.svg',
  },
  {
    id: '04',
    title: 'Project Four',
    category: 'Editorial',
    year: '2023',
    image: '/home/character-stage/works-console/previews/work-04.svg',
  },
  {
    id: '05',
    title: 'Project Five',
    category: 'Photography',
    year: '2022',
    image: '/home/character-stage/works-console/previews/work-05.svg',
  },
]

const profileCopy = {
  en: {
    lead: [
      'A visual designer interested in web design,',
      'graphic design, illustration and photography.',
      'Currently exploring AI-assisted workflows',
      'in design, creating bold, playful visuals and',
      'interactive works.',
    ],
    items: [
      {
        label: 'Name',
        value: ['KoEtsu'],
      },
      {
        label: 'Education',
        value: ['Kobe Design University, M.A.'],
      },
      {
        label: 'Creative Skills',
        value: [
          'Web Design / UI Design',
          'Graphic Design / Logo Design / VI Design',
          'Poster Design / Banner Design / Illustration',
          'Photography / Photo Retouching / Color Grading',
        ],
      },
      {
        label: 'Main Tools',
        value: ['Photoshop / Illustrator / Lightroom / Codex / Claude Code'],
      },
      {
        label: 'Hobbies & Interests',
        value: ['Motorcycling / Drawing', 'Action Games / Board Games'],
      },
    ],
    languageLabel: 'Language',
    languageSwitch: '<Jp/En>',
  },
  jp: {
    lead: [
      '私はWebデザイン、グラフィックデザイン、イラスト、写真に',
      '興味を持つビジュアルデザイナーです。',
      'デザインにおけるAIを活用したワークフローを探求しながら、',
      '大胆で遊び心のあるビジュアル表現や',
      'インタラクティブな作品を制作しています。',
    ],
    items: [
      {
        label: '名　前',
        value: ['胡 越 / Ko Etsu'],
      },
      {
        label: '学　歴',
        value: ['神戸芸術工科大学 修士'],
      },
      {
        label: '制作スキル',
        value: [
          'Webデザイン / UIデザイン / グラフィックデザイン',
          'ロゴデザイン / ビジュアルアイデンティティデザイン',
          'ポスターデザイン / バナーデザイン / イラストレーション',
          '写真撮影 / 写真レタッチ / カラーグレーディング',
        ],
      },
      {
        label: '主な使用ツール',
        value: ['Photoshop / Illustrator / Lightroom / Codex / Claude Code'],
      },
      {
        label: '趣味・関心',
        value: ['バイク / 絵を描くこと', 'アクションゲーム / ボードゲーム'],
      },
    ],
    languageLabel: '言語',
    languageSwitch: '<En/Jp>',
  },
} as const

export default function HomeMinimalIndex() {
  const [profileLanguage, setProfileLanguage] = useState<'en' | 'jp'>('en')
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
        {works.map((work) => (
          <Link className={styles.workTile} href="/works" key={work.id}>
            <figure className={styles.figure}>
              <img src={work.image} alt="" className={styles.image} draggable={false} />
            </figure>
            <div className={styles.meta}>
              <span>{work.id}</span>
              <h3>{work.title}</h3>
              <p>
                {work.category} / {work.year}
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
          </div>
        </section>
      </div>
    </section>
  )
}
