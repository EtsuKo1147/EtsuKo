import styles from './HomeProfileIntro.module.css'

const profileLines = [
  '> Profile',
  'A visual designer interested',
  'in web design, graphic design,',
  'illustration and photography.',
  'Currently exploring AI-assisted',
  'workflows in design, creating bold,',
  'playful visuals and interactive works.',
]

export default function HomeProfileIntro() {
  return (
    <section className={styles.profileIntro} aria-labelledby="home-profile-title">
      <div className={styles.copyBlock}>
        {profileLines.map((line, index) => {
          const isTitle = index === 0

          return (
            <p
              key={line}
              id={isTitle ? 'home-profile-title' : undefined}
              className={`${styles.lineMask}${isTitle ? ` ${styles.kicker}` : ''}`}
            >
              <span>{line}</span>
            </p>
          )
        })}
      </div>
    </section>
  )
}
