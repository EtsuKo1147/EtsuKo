'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import styles from './contact.module.css'

export default function ContactView() {
  const [isInverted, setIsInverted] = useState(false)

  return (
    <main className={`${styles.contactPage} ${isInverted ? styles.contactPageInverted : ''}`}>
      <button
        type="button"
        className={styles.invertToggle}
        aria-pressed={isInverted}
        aria-label={isInverted ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setIsInverted((currentValue) => !currentValue)}
      />

      <section className={styles.contactShell} aria-labelledby="contact-title">
        <div className={styles.contactHeader}>
          <p className={styles.eyebrow}>Selected contact</p>
          <h1 id="contact-title" className={styles.title}>
            Contact
          </h1>
        </div>

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
