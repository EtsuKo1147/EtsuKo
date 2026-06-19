'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './HomeSelectedWorks.module.css'

const selectedWorks = [
  {
    title: 'Selected Works 1',
    category: 'Branding / Web Design',
    href: '/works/work-01',
    preview: '/works-console/previews/work-01.svg',
  },
  {
    title: 'Selected Works 2',
    category: 'Illustration / Visual Identity',
    href: '/works/work-02',
    preview: '/works-console/previews/work-02.svg',
  },
  {
    title: 'Selected Works 3',
    category: 'Web Design / Interactive',
    href: '/works/work-03',
    preview: '/works-console/previews/work-03.svg',
  },
  {
    title: 'Selected Works 4',
    category: 'Graphic Design / Editorial',
    href: '/works/work-04',
    preview: '/works-console/previews/work-04.svg',
  },
  {
    title: 'Selected Works 5',
    category: 'Art Direction / Photography',
    href: '/works/work-05',
    preview: '/works-console/previews/work-05.svg',
  },
]

export default function HomeSelectedWorks() {
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(0)
  const [doodleMotion, setDoodleMotion] = useState({
    one: '',
    two: '',
  })
  const selectedWork = selectedWorks[selectedWorkIndex]

  const showPreviousWork = () => {
    setSelectedWorkIndex((currentIndex) =>
      currentIndex === 0 ? selectedWorks.length - 1 : currentIndex - 1,
    )
  }

  const showNextWork = () => {
    setSelectedWorkIndex((currentIndex) =>
      currentIndex === selectedWorks.length - 1 ? 0 : currentIndex + 1,
    )
  }

  const setDoodleState = (doodle: 'one' | 'two', motion: string) => {
    setDoodleMotion((currentMotion) => ({
      ...currentMotion,
      [doodle]: motion,
    }))
  }

  return (
    <section className={styles.section} aria-labelledby="selected-works-title">
      <div className={styles.consoleLayout}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/works-console/doodles/doodle-01.svg"
          alt=""
          className={`${styles.doodle} ${styles.doodleOne} ${doodleMotion.one ? styles[doodleMotion.one] : ''}`}
          draggable={false}
          aria-hidden="true"
          onPointerEnter={() => setDoodleState('one', 'doodleSpin')}
          onPointerLeave={() => setDoodleState('one', 'doodleSpringBack')}
          onAnimationEnd={() => {
            if (doodleMotion.one === 'doodleSpringBack') {
              setDoodleState('one', '')
            }
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/works-console/doodles/doodle-02.svg"
          alt=""
          className={`${styles.doodle} ${styles.doodleTwo} ${doodleMotion.two ? styles[doodleMotion.two] : ''}`}
          draggable={false}
          aria-hidden="true"
          onPointerEnter={() => setDoodleState('two', 'doodleSpin')}
          onPointerLeave={() => setDoodleState('two', 'doodleSpringBack')}
          onAnimationEnd={() => {
            if (doodleMotion.two === 'doodleSpringBack') {
              setDoodleState('two', '')
            }
          }}
        />

        <div className={styles.consoleStage}>
          <div className={styles.screenViewport} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedWork.preview}
              alt=""
              className={styles.previewImage}
            />
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/works-console/console-shell.svg"
            alt=""
            className={styles.consoleShell}
            aria-hidden="true"
          />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/works-console/joystick.svg"
            alt=""
            className={styles.joystick}
            aria-hidden="true"
          />

          <button
            type="button"
            className={`${styles.controlButton} ${styles.buttonUp}`}
            aria-label="Show previous selected work"
            onClick={showPreviousWork}
          />

          <button
            type="button"
            className={`${styles.controlButton} ${styles.buttonDown}`}
            aria-label="Show next selected work"
            onClick={showNextWork}
          />

          <Link
            href={selectedWork.href}
            className={styles.viewProjectLink}
            aria-label={`View ${selectedWork.title}`}
          />
        </div>

        <aside className={styles.workMeta} aria-label="Selected work information">
          <p className={styles.metaEyebrow}>Selected Works</p>
          <h2 id="selected-works-title" className={styles.workTitle}>
            {selectedWork.title}
          </h2>
          <p className={styles.workCategory}>{selectedWork.category}</p>
        </aside>
      </div>
    </section>
  )
}
