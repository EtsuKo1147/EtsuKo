'use client'

import { useEffect, useState } from 'react'
import styles from '@/components/sections/HomeHero.module.css'

type ClockState = {
  time: string
  gmt: string
}

function getClockState(): ClockState {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00'

  return {
    time: `${hour}:${minute}`,
    gmt: 'GMT+9',
  }
}

export function TimeBoard() {
  const [clock, setClock] = useState<ClockState>({
    time: '--:--',
    gmt: 'GMT',
  })

  useEffect(() => {
    const updateClock = () => setClock(getClockState())

    updateClock()
    const timer = window.setInterval(updateClock, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className={styles.roadSignClock} aria-label={`${clock.time} ${clock.gmt}`}>
      <div className={styles.roadSignClockIcon} aria-hidden="true">
        <span className={`${styles.roadSignClockHand} ${styles.roadSignClockHandRed}`} />
        <span className={`${styles.roadSignClockHand} ${styles.roadSignClockHandBlack}`} />
      </div>
      <div className={styles.roadSignClockText}>
        <div className={styles.roadSignClockTime}>{clock.time}</div>
        <div className={styles.roadSignClockCaption}>
          <span>({clock.gmt})</span>
          <span>Etsu. portfolio</span>
        </div>
      </div>
    </div>
  )
}
