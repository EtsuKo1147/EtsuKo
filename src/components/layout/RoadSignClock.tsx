'use client'

import { useState, useEffect } from 'react'
import type { Ref } from 'react'
import styles from './RoadSignClock.module.css'

const fmt = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function buildClockInfo(date: Date): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const city = tz.split('/').pop()?.replace(/_/g, ' ').toUpperCase() ?? tz.toUpperCase()

  const offsetMin = -date.getTimezoneOffset()
  const absH = Math.floor(Math.abs(offsetMin) / 60)
  const absM = Math.abs(offsetMin) % 60
  const sign = offsetMin >= 0 ? '+' : '-'
  const gmtStr = absM === 0
    ? `GMT${sign}${absH}`
    : `GMT${sign}${absH}:${String(absM).padStart(2, '0')}`

  const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`

  return `${city}（${gmtStr}）${dateStr}`
}

type RoadSignClockProps = {
  className?: string
  clockRef?: Ref<HTMLDivElement>
}

export default function RoadSignClock({ className, clockRef }: RoadSignClockProps) {
  const [time, setTime] = useState<string | null>(null)
  const [clockInfo, setClockInfo] = useState<string | null>(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(fmt.format(now))
      setClockInfo(buildClockInfo(now))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div ref={clockRef} className={`${className ?? ''} ${styles.wrap}`}>
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
      {clockInfo !== null && (
        <div className={styles.dateOverlay}>{clockInfo}</div>
      )}
      <div className={styles.tickerOverlay} aria-hidden="true">
        <div className={styles.tickerViewport}>
          <div className={styles.tickerTrack}>
            <span className={styles.tickerText}>
              ETSU&apos;s portfolio / logo design / VI design / illustration / poster / banner / photography / web design_
            </span>
            <span className={styles.tickerText}>
              ETSU&apos;s portfolio / logo design / VI design / illustration / poster / banner / photography / web design_
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
