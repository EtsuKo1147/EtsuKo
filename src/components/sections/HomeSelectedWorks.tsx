import Link from 'next/link'
import styles from './HomeSelectedWorks.module.css'

export default function HomeSelectedWorks() {
  return (
    <section className={styles.section}>

      {/* ── 插画层 ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/selected-works/selected-character-left.svg"
        alt=""
        className={`${styles.illus} ${styles.illusLeft}`}
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/selected-works/selected-character-top-left.svg"
        alt=""
        className={`${styles.illus} ${styles.illusTopLeft}`}
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/selected-works/selected-character-top-center.svg"
        alt=""
        className={`${styles.illus} ${styles.illusTopCenter}`}
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/selected-works/selected-character-top-right-dog.svg"
        alt=""
        className={`${styles.illus} ${styles.illusTopRight}`}
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/selected-works/selected-character-bottom-left-dog.svg"
        alt=""
        className={`${styles.illus} ${styles.illusBottomLeft}`}
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/selected-works/selected-character-bottom-center.svg"
        alt=""
        className={`${styles.illus} ${styles.illusBottomCenter}`}
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/home/selected-works/selected-character-bottom-right.svg"
        alt=""
        className={`${styles.illus} ${styles.illusBottomRight}`}
        aria-hidden="true"
      />

      {/* ── 卡片区域 ── */}
      <div className={styles.cardArea}>
        <Link href="/works" className={styles.cardLink} aria-label="View Selected Work 01">
          {/* 后方错位描边层 */}
          <div className={styles.cardShadow} aria-hidden="true" />
          {/* 主卡片 */}
          <div className={styles.card}>
            {/* 封面图 */}
            <div className={styles.cardCover}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/home/selected-works/selected-work-01-cover.svg"
                alt="Selected Work 01 cover"
                className={styles.cardCoverImg}
              />
            </div>
            {/* 文字内容 */}
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>SELECTED WORKS</span>
              <span className={styles.cardNumber}>01</span>
              <h2 className={styles.cardTitle}>SELECTED WORK 01</h2>
              <p className={styles.cardTags}>Branding / Visual Identity / Web Design</p>
              <span className={styles.cardBtn}>VIEW PROJECT →</span>
            </div>
          </div>
        </Link>
      </div>

    </section>
  )
}
