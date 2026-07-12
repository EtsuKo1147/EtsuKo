'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type CSSProperties } from 'react'
import { profileCopy, type ProfileLanguage } from '@/data/profile'
import styles from './page.module.css'

export default function ProfileView() {
  const [profileLanguage, setProfileLanguage] = useState<ProfileLanguage>('en')
  const [isInverted, setIsInverted] = useState(false)
  const [designScale, setDesignScale] = useState(1)
  const profile = profileCopy[profileLanguage]

  useEffect(() => {
    const updateDesignScale = () => {
      const widthScale = window.innerWidth / 1920
      const heightScale = window.innerHeight / 1080
      const nextScale = Math.max(0.78, Math.min(1, widthScale, heightScale))

      setDesignScale(Math.round(nextScale * 1000) / 1000)
    }

    updateDesignScale()
    window.addEventListener('resize', updateDesignScale)

    return () => {
      window.removeEventListener('resize', updateDesignScale)
    }
  }, [])

  const scaledPx = (value: number) => `${Math.round(value * designScale * 10) / 10}px`
  const pageScaleStyle = {
    '--profile-page-pad-top': scaledPx(24),
    '--profile-page-pad-x': scaledPx(76),
    '--profile-page-pad-bottom': scaledPx(128),
    '--profile-layout-width': scaledPx(1480),
    '--profile-header-gap': scaledPx(72),
    '--profile-header-margin-bottom': scaledPx(18),
    '--profile-lead-margin-top': scaledPx(38),
    '--profile-stage-min-height': scaledPx(860),
    '--profile-character-left': scaledPx(34),
    '--profile-character-bottom': scaledPx(176),
    '--profile-character-width': scaledPx(600),
    '--profile-console-width': scaledPx(980),
    '--profile-console-margin': scaledPx(-76),
    '--profile-list-gap': scaledPx(14),
    '--profile-list-dt-size': scaledPx(18.9),
    '--profile-list-dd-size': scaledPx(16.3),
    '--profile-list-dd-jp-size': scaledPx(16),
    '--profile-language-width': scaledPx(112),
    '--profile-language-height': scaledPx(120),
    '--profile-language-font-size': scaledPx(10.9),
  } as CSSProperties

  return (
    <main
      className={`${styles.page} ${isInverted ? styles.pageInverted : ''}`}
      style={pageScaleStyle}
    >
      <button
        type="button"
        className={styles.invertToggle}
        aria-pressed={isInverted}
        aria-label={isInverted ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setIsInverted((currentValue) => !currentValue)}
      />

      <section className={styles.header} aria-label="Profile">
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
      </section>

      <section className={styles.profileArcade} aria-label="Profile details">
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
      </section>
    </main>
  )
}
