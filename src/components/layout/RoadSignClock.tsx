'use client'

import { useState, useEffect } from 'react'
import styles from './RoadSignClock.module.css'

const fmt = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export default function RoadSignClock({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setTime(fmt.format(new Date()))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`${className ?? ''} ${styles.wrap}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.image}
        src="/road-sign/clock-sign.svg"
        alt=""
        draggable={false}
      />
      {time !== null && (
        <div className={styles.timeOverlay}>{time}</div>
      )}
    </div>
  )
}
