import styles from './contact.module.css'

export const metadata = { title: 'Contact — Etsu.' }

export default function ContactPage() {
  return (
    <main className={styles.contactPage}>
      <section className={styles.contactShell} aria-labelledby="contact-title">
        <div className={styles.contactHeader}>
          <p className={styles.eyebrow}>Selected contact</p>
          <h1 id="contact-title" className={styles.title}>
            Contact
          </h1>
          <p className={styles.contactIntro}>
            ご相談やご質問など、下記フォームよりお気軽にお問い合わせください！
            <br />
            内容を確認後、折り返しご連絡いたします。
          </p>
        </div>

        <form
          className={styles.contactForm}
          action="mailto:koetsu1147@gmail.com"
          method="post"
          encType="text/plain"
        >
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
              placeholder="犬田 太郎"
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
              placeholder="株式会社サンプル"
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
              placeholder="sample@email.com"
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
              placeholder="お問い合わせ内容をご記入ください"
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
