'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './LoadingTypewriter.module.css'

const LINES = [
  '> Booting ETSU Portfolio...',
  '> Loading profile...',
  '> Loading selected works...',
  '',
  '> Logo / VI / Banner / Illustration',
  '> Poster / Photography / Web Design...',
  '',
  '> Welcome to my portfolio.',
  '> Please click the helmet...',
  '',
  '> Are you ready?',
]

const FULL_TEXT = LINES.join('\n')
const CHAR_MS = 16
const NEWLINE_MS = 80

export default function LoadingTypewriter() {
  const [pos, setPos] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pos >= FULL_TEXT.length) return
    const delay = FULL_TEXT[pos] === '\n' ? NEWLINE_MS : CHAR_MS
    const t = setTimeout(() => setPos(p => p + 1), delay)
    return () => clearTimeout(t)
  }, [pos])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [pos])

  const lines = FULL_TEXT.slice(0, pos).split('\n')

  return (
    <div className={styles.typewriter} ref={containerRef}>
      <div className={styles.inner}>
        {lines.map((line, i) => (
          <div key={i} className={styles.line}>
            {line}
            {i === lines.length - 1 && (
              <span className={styles.cursor}>_</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
