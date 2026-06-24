'use client'

/* eslint-disable @next/next/no-img-element */

import {
  cursorGearFrame,
  getHomeCharacterById,
  homeCharacters,
  type HomeCharacterId,
} from './homeCharacterData'
import styles from './HomeCharacterSelect.module.css'

type HomeCharacterSelectProps = {
  selectedCharacterId: HomeCharacterId
  onSelectCharacter: (id: HomeCharacterId) => void
}

export default function HomeCharacterSelect({
  selectedCharacterId,
  onSelectCharacter,
}: HomeCharacterSelectProps) {
  const selectedCharacter = getHomeCharacterById(selectedCharacterId)
  const selectedIndex = Math.max(
    homeCharacters.findIndex((character) => character.id === selectedCharacter.id),
    0,
  )

  const showPreviousCharacter = () => {
    const previousIndex = selectedIndex === 0 ? homeCharacters.length - 1 : selectedIndex - 1
    onSelectCharacter(homeCharacters[previousIndex].id)
  }

  const showNextCharacter = () => {
    const nextIndex = selectedIndex === homeCharacters.length - 1 ? 0 : selectedIndex + 1
    onSelectCharacter(homeCharacters[nextIndex].id)
  }

  return (
    <section className={styles.section} aria-labelledby="character-select-title">
      <div className={styles.stage}>
        <p className={styles.kicker}>choose your character</p>
        <h2 id="character-select-title" className={styles.srOnly}>
          Choose your character
        </h2>

        <div className={styles.carousel} aria-live="polite">
          <button
            type="button"
            className={`${styles.arrowButton} ${styles.arrowButtonLeft}`}
            onClick={showPreviousCharacter}
            aria-label="Show previous character"
          >
            <img
              src="/home/character-stage/ui/arrow-left.svg"
              alt=""
              className={styles.arrowIcon}
              draggable={false}
            />
          </button>

          <div className={styles.cardShell}>
            <img
              key={selectedCharacter.id}
              src={selectedCharacter.card}
              alt={`${selectedCharacter.name} character card`}
              className={styles.characterCard}
              draggable={false}
            />
          </div>

          <button
            type="button"
            className={`${styles.arrowButton} ${styles.arrowButtonRight}`}
            onClick={showNextCharacter}
            aria-label="Show next character"
          >
            <img
              src="/home/character-stage/ui/arrow-right.svg"
              alt=""
              className={styles.arrowIcon}
              draggable={false}
            />
          </button>
        </div>

        <div className={styles.characterMeta} aria-hidden="true">
          <span>{String(selectedIndex + 1).padStart(2, '0')}</span>
          <span>{selectedCharacter.name}</span>
          <span>{selectedCharacter.role}</span>
        </div>

        <aside className={styles.cursorGear} aria-label={`${selectedCharacter.cursorName} equipped`}>
          <img
            src={cursorGearFrame}
            alt=""
            className={styles.cursorGearFrame}
            draggable={false}
            aria-hidden="true"
          />
          <div className={styles.cursorGearContent}>
            <p className={styles.cursorGearLabel}>Cursor Gear</p>
            <img
              key={selectedCharacter.cursor}
              src={selectedCharacter.cursor}
              alt=""
              className={styles.cursorIcon}
              draggable={false}
              aria-hidden="true"
            />
            <p className={styles.cursorGearName}>{selectedCharacter.cursorName}</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
