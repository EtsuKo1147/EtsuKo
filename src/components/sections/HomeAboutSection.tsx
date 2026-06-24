import styles from './HomeAboutSection.module.css'

const aboutCards = [
  {
    label: 'About the player',
    title: 'Etsu / Visual Designer',
    body: 'Web, graphic, photography, illustration, and playful interactive work.',
  },
  {
    label: 'Base',
    title: 'Osaka Based',
    body: 'Working between bold visual systems, small details, and handmade energy.',
  },
  {
    label: 'Tools',
    title: 'Photoshop / Illustrator / Figma',
    body: 'Also uses Codex, Claude Code, Lightroom, Premiere Pro, and ChatGPT.',
  },
  {
    label: 'Available for',
    title: 'Design / Web / Photo / Drawing',
    body: 'Open to visual design, web design, banners, posters, and brand assets.',
  },
]

export default function HomeAboutSection() {
  return (
    <section className={styles.section} aria-labelledby="home-about-title">
      <div className={styles.frame}>
        <div className={styles.header}>
          <p className={styles.kicker}>Player file / About</p>
          <h2 id="home-about-title" className={styles.title}>
            About The Player
          </h2>
        </div>

        <div className={styles.cardGrid}>
          {aboutCards.map((card) => (
            <article className={styles.infoCard} key={card.label}>
              <p className={styles.cardLabel}>{card.label}</p>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardBody}>{card.body}</p>
            </article>
          ))}
        </div>

        <div className={styles.statusStrip} aria-hidden="true">
          <span>Design / Web / Photo / Drawing</span>
          <span>Osaka based</span>
          <span>Contact ready</span>
        </div>

        <footer className={styles.footer}>
          <p>Etsu Portfolio</p>
          <div className={styles.footerLinks}>
            <span>Works</span>
            <span>Profile</span>
            <span>Contact</span>
          </div>
          <p>Made in Osaka / 2026</p>
        </footer>
      </div>
    </section>
  )
}
