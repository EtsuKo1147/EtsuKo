'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type CSSProperties } from 'react'
import styles from './contact.module.css'

export default function ContactView() {
  const [isInverted, setIsInverted] = useState(false)
  const [designScale, setDesignScale] = useState(1)

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

  useEffect(() => {
    document.body.dataset.simpleNavInverted = isInverted ? 'true' : 'false'

    return () => {
      delete document.body.dataset.simpleNavInverted
    }
  }, [isInverted])

  const scaledPx = (value: number) => `${Math.round(value * designScale * 10) / 10}px`
  const pageScaleStyle = {
    '--contact-shell-width': scaledPx(1480),
    '--contact-shell-pad-top': scaledPx(48),
    '--contact-shell-pad-x': scaledPx(76),
    '--contact-shell-pad-bottom': scaledPx(160),
    '--contact-panel-margin-bottom': scaledPx(72),
    '--contact-panel-pad-top': scaledPx(42),
    '--contact-panel-pad-bottom': scaledPx(58),
    '--contact-doodle-width': scaledPx(460),
    '--contact-title-margin-top': scaledPx(56),
    '--contact-title-size': scaledPx(92.8),
    '--contact-link-margin-top': scaledPx(32),
    '--contact-link-size': scaledPx(40),
    '--contact-form-width': scaledPx(1120),
    '--contact-form-gap': scaledPx(54),
    '--contact-form-pad-top': scaledPx(40),
    '--contact-field-gap': scaledPx(20),
    '--contact-label-size': scaledPx(21.6),
    '--contact-input-size': scaledPx(18.6),
    '--contact-input-height': scaledPx(64),
    '--contact-input-pad-x': scaledPx(32),
    '--contact-textarea-height': scaledPx(300),
    '--contact-textarea-pad-y': scaledPx(28),
    '--contact-textarea-radius': scaledPx(38),
    '--contact-note-margin-top': scaledPx(46),
    '--contact-submit-width': scaledPx(340),
    '--contact-submit-height': scaledPx(72),
    '--contact-submit-size': scaledPx(20),
  } as CSSProperties

  return (
    <main
      className={`${styles.contactPage} ${isInverted ? styles.contactPageInverted : ''}`}
      style={pageScaleStyle}
    >
      <button
        type="button"
        className={styles.invertToggle}
        aria-pressed={isInverted}
        aria-label={isInverted ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setIsInverted((currentValue) => !currentValue)}
      />

      <section className={styles.contactShell} aria-label="Contact">
        <section className={styles.directMailPanel} aria-labelledby="contact-direct-mail-title">
          <img
            src="/home/character-stage/doodles/character-6.svg"
            alt=""
            className={styles.directMailDoodle}
            draggable={false}
          />
          <h2 id="contact-direct-mail-title" className={styles.directMailTitle}>
            Direct Mail
          </h2>
          <a
            className={styles.directMailLink}
            href="mailto:koetsu1147@gmail.com?subject=Portfolio%20Contact"
          >
            koetsu1147@gmail.com
          </a>
        </section>

        <form
          className={styles.contactForm}
          action="mailto:koetsu1147@gmail.com"
          method="post"
          encType="text/plain"
        >
          <p className={styles.contactIntro}>
            ご相談やご質問など、下記フォームよりお気軽にお問い合わせください！内容を確認後、折り返しご連絡いたします。
          </p>

          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="contact-name">
              <span>お名前</span>
              <span className={styles.requiredBadge}>必須</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="contact-company">
              <span>会社名</span>
              <span className={styles.optionalBadge}>任意</span>
            </label>
            <input
              id="contact-company"
              name="company"
              type="text"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="contact-email">
              <span>メールアドレス</span>
              <span className={styles.requiredBadge}>必須</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="contact-message">
              <span>お問い合わせ内容</span>
              <span className={styles.requiredBadge}>必須</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              className={styles.formTextarea}
              rows={8}
              required
            />
          </div>

          <p className={styles.contactNote}>
            個人情報の取り扱いについては、
            <span className={styles.contactPrivacy}>プライバシーポリシー</span>
            をご確認ください。
          </p>

          <div className={styles.contactActions}>
            <button className={styles.contactSubmit} type="submit">
              送信する
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
