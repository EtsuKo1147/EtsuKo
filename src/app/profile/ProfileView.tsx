'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { profileCopy, type ProfileLanguage } from '@/data/profile'
import styles from './page.module.css'

export default function ProfileView() {
  const [profileLanguage, setProfileLanguage] = useState<ProfileLanguage>('en')
  const [isInverted, setIsInverted] = useState(false)
  const profile = profileCopy[profileLanguage]

  return (
    <main className={`${styles.page} ${isInverted ? styles.pageInverted : ''}`}>
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
