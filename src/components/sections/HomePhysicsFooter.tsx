'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from 'react'
import Matter, { type Body, type Engine, type Runner } from 'matter-js'
import styles from './HomePhysicsFooter.module.css'

const footerItems = [
  { src: '/footer/cartridge.svg', label: 'Cartridge', width: 230, aspect: '907.3 / 914.5' },
  { src: '/footer/character-1.svg', label: 'Character one', width: 150, aspect: '486.5 / 522.3' },
  { src: '/footer/character-2.svg', label: 'Character two', width: 150, aspect: '317.2 / 290.3' },
  { src: '/footer/character-4.svg', label: 'Character four', width: 150, aspect: '526.8 / 511.6' },
  { src: '/footer/doodle-03.svg', label: 'Doodle three', width: 220, aspect: '501.7 / 264.3' },
  { src: '/footer/doodle-04.svg', label: 'Doodle four', width: 130, aspect: '186.4 / 237.4' },
  { src: '/footer/doodle-05.svg', label: 'Doodle five', width: 145, aspect: '294.8 / 301' },
  { src: '/footer/doodle-06.svg', label: 'Doodle six', width: 130, aspect: '417.5 / 515.2' },
  { src: '/footer/doodle-08.svg', label: 'Doodle eight', width: 155, aspect: '331.2 / 271.7' },
] as const

type FooterPhysicsItem = {
  body: Body
  element: HTMLLIElement
  width: number
  height: number
}

type FooterPhysicsWorld = {
  engine: Engine
  runner: Runner
  items: FooterPhysicsItem[]
  sync: () => void
}

type FooterItemStyle = React.CSSProperties & {
  '--pile-width': string
  '--pile-aspect': string
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const random = (min: number, max: number) => min + Math.random() * (max - min)

export default function HomePhysicsFooter() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const worldRef = useRef<FooterPhysicsWorld | null>(null)
  const pointerRef = useRef({
    x: -9999,
    y: -9999,
    previousX: -9999,
    previousY: -9999,
    previousTime: 0,
  })

  useEffect(() => {
    const stage = stageRef.current

    if (!stage) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches

    if (prefersReducedMotion) return

    let isActive = false
    let rebuildTimer = 0

    const destroyWorld = () => {
      const currentWorld = worldRef.current

      if (!currentWorld) return

      Matter.Events.off(currentWorld.engine, 'afterUpdate', currentWorld.sync)
      Matter.Runner.stop(currentWorld.runner)
      Matter.Composite.clear(currentWorld.engine.world, false)
      Matter.Engine.clear(currentWorld.engine)
      worldRef.current = null
    }

    const syncItems = (items: FooterPhysicsItem[]) => {
      items.forEach(({ body, element, width, height }) => {
        const x = body.position.x - width / 2
        const y = body.position.y - height / 2

        element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${body.angle}rad)`
      })
    }

    const createWorld = () => {
      destroyWorld()

      const bounds = stage.getBoundingClientRect()
      const width = bounds.width
      const height = bounds.height

      if (width <= 0 || height <= 0) return

      const engine = Matter.Engine.create({ enableSleeping: true })
      const runner = Matter.Runner.create()
      const thickness = Math.max(90, width * 0.08)

      engine.gravity.x = 0
      engine.gravity.y = 1.08

      const walls = [
        Matter.Bodies.rectangle(width / 2, height + thickness / 2, width + thickness * 2, thickness, {
          isStatic: true,
          friction: 0.92,
          restitution: 0.08,
        }),
        Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, {
          isStatic: true,
          friction: 0.6,
        }),
        Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, {
          isStatic: true,
          friction: 0.6,
        }),
      ]

      const physicsItems = itemRefs.current.flatMap((element, index) => {
        if (!element) return []

        const rect = element.getBoundingClientRect()
        const itemWidth = rect.width
        const itemHeight = rect.height

        if (itemWidth <= 0 || itemHeight <= 0) return []

        const body = Matter.Bodies.rectangle(
          random(width * 0.14, width * 0.86),
          -height * 0.45 - index * 44 - random(0, height * 0.45),
          itemWidth * 0.82,
          itemHeight * 0.82,
          {
            density: 0.0014,
            friction: 0.78,
            frictionAir: 0.025,
            restitution: 0.28,
          },
        )

        Matter.Body.setAngle(body, random(-0.9, 0.9))

        return [{ body, element, width: itemWidth, height: itemHeight }]
      })

      const sync = () => {
        syncItems(physicsItems)
      }

      Matter.Composite.add(engine.world, [...walls, ...physicsItems.map((item) => item.body)])
      Matter.Events.on(engine, 'afterUpdate', sync)

      worldRef.current = {
        engine,
        runner,
        items: physicsItems,
        sync,
      }

      if (isActive) Matter.Runner.run(runner, engine)
    }

    const stirPile = (power = 1) => {
      const currentWorld = worldRef.current
      const bounds = stage.getBoundingClientRect()

      if (!currentWorld || !isActive) return

      currentWorld.items.forEach(({ body }) => {
        const direction = body.position.x < bounds.width / 2 ? -1 : 1

        Matter.Body.setVelocity(body, {
          x: body.velocity.x + direction * random(4, 10) * power + random(-4, 4),
          y: body.velocity.y - random(11, 20) * power,
        })
        Matter.Body.setAngularVelocity(
          body,
          body.angularVelocity + random(-0.28, 0.28) * power,
        )
      })
    }

    const pushFromPointer = (event: PointerEvent) => {
      if (isCoarsePointer) return

      const currentWorld = worldRef.current

      if (!currentWorld || !isActive) return

      const bounds = stage.getBoundingClientRect()
      const now = performance.now()
      const localX = event.clientX - bounds.left
      const localY = event.clientY - bounds.top
      const elapsed = Math.max(16, now - pointerRef.current.previousTime)
      const velocityX = ((localX - pointerRef.current.previousX) / elapsed) * 16
      const velocityY = ((localY - pointerRef.current.previousY) / elapsed) * 16
      const speed = clamp(Math.hypot(velocityX, velocityY), 0, 120)
      const radius = clamp(bounds.width * 0.16, 120, 240)

      pointerRef.current = {
        x: localX,
        y: localY,
        previousX: localX,
        previousY: localY,
        previousTime: now,
      }

      currentWorld.items.forEach(({ body }) => {
        const deltaX = body.position.x - localX
        const deltaY = body.position.y - localY
        const distance = Math.max(1, Math.hypot(deltaX, deltaY))

        if (distance > radius) return

        const falloff = 1 - distance / radius
        const normalX = deltaX / distance
        const normalY = deltaY / distance

        Matter.Body.setVelocity(body, {
          x: body.velocity.x + (normalX * 8 + velocityX * 0.16) * falloff,
          y: body.velocity.y + (normalY * 8 + velocityY * 0.16) * falloff,
        })
        Matter.Body.setAngularVelocity(
          body,
          body.angularVelocity + (velocityX - velocityY) * 0.003 * falloff + speed * 0.0012,
        )
      })
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (isCoarsePointer || event.pointerType === 'touch') {
        stirPile(0.9)
      }
    }

    const scheduleRebuild = () => {
      window.clearTimeout(rebuildTimer)
      rebuildTimer = window.setTimeout(createWorld, 180)
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isActive = entry.isIntersecting

        const currentWorld = worldRef.current

        if (!currentWorld) return

        if (isActive) {
          Matter.Runner.run(currentWorld.runner, currentWorld.engine)
        } else {
          Matter.Runner.stop(currentWorld.runner)
        }
      },
      { rootMargin: '20% 0px' },
    )
    const resizeObserver = new ResizeObserver(scheduleRebuild)

    stage.addEventListener('pointermove', pushFromPointer)
    stage.addEventListener('pointerdown', handlePointerDown)
    intersectionObserver.observe(stage)
    resizeObserver.observe(stage)
    createWorld()

    return () => {
      window.clearTimeout(rebuildTimer)
      stage.removeEventListener('pointermove', pushFromPointer)
      stage.removeEventListener('pointerdown', handlePointerDown)
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      destroyWorld()
    }
  }, [])

  return (
    <footer className={styles.footer} aria-label="Interactive footer">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Selected footer</p>
        <p className={styles.note}>stir</p>
      </div>

      <div ref={stageRef} className={styles.stage}>
        <button type="button" className={styles.stirButton}>
          stir
        </button>
        <ul className={styles.pile} aria-hidden="true">
          {footerItems.map((item, index) => (
            <li
              ref={(element) => {
                itemRefs.current[index] = element
              }}
              className={styles.item}
              key={item.src}
              style={
                {
                  '--pile-width': `${item.width}px`,
                  '--pile-aspect': item.aspect,
                } as FooterItemStyle
              }
            >
              <img src={item.src} alt={item.label} draggable={false} />
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
