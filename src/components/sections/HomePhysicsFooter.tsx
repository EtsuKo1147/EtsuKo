'use client'

import { useEffect, useRef, useState } from 'react'
import Matter, { type Body, type Engine, type Runner } from 'matter-js'
import styles from './HomePhysicsFooter.module.css'

const footerItems = [
  {
    src: '/footer/cartridge.svg',
    label: 'Cartridge',
    width: 361.4,
    height: 361.3,
    collision: { x: 0.92, y: 0.92 },
  },
  {
    src: '/footer/character-1.svg',
    label: 'Character one',
    width: 486.5,
    height: 522.3,
    collision: { x: 0.74, y: 0.82 },
  },
  {
    src: '/footer/character-2.svg',
    label: 'Character two',
    width: 317.2,
    height: 290.3,
    collision: { x: 0.8, y: 0.82 },
  },
  {
    src: '/footer/character-4.svg',
    label: 'Character four',
    width: 526.8,
    height: 511.6,
    collision: { x: 0.74, y: 0.78 },
  },
  {
    src: '/footer/character-5.svg',
    label: 'Character five',
    width: 324.3,
    height: 320.8,
    collision: { x: 0.8, y: 0.8 },
  },
  {
    src: '/footer/doodle-03.svg',
    label: 'Doodle three',
    width: 501.7,
    height: 264.3,
    collision: { x: 0.86, y: 0.7 },
  },
  {
    src: '/footer/doodle-04.svg',
    label: 'Doodle four',
    width: 186.4,
    height: 237.4,
    collision: { x: 0.76, y: 0.84 },
  },
  {
    src: '/footer/doodle-05.svg',
    label: 'Doodle five',
    width: 294.8,
    height: 301,
    collision: { x: 0.8, y: 0.8 },
  },
  {
    src: '/footer/doodle-06.svg',
    label: 'Doodle six',
    width: 417.5,
    height: 515.2,
    collision: { x: 0.7, y: 0.84 },
  },
  {
    src: '/footer/doodle-07.svg',
    label: 'Doodle seven',
    width: 352.1,
    height: 290.2,
    collision: { x: 0.82, y: 0.78 },
  },
  {
    src: '/footer/doodle-08.svg',
    label: 'Doodle eight',
    width: 331.2,
    height: 271.7,
    collision: { x: 0.82, y: 0.78 },
  },
] as const

const FOOTER_ITEM_BASE_SCALE = 0.34

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
  '--pile-height': string
  '--footer-mask': string
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const random = (min: number, max: number) => min + Math.random() * (max - min)

const getResponsiveItemScale = (stageWidth: number) => {
  const designScale = clamp(stageWidth / 1920, 0.529, 1)

  return FOOTER_ITEM_BASE_SCALE * 2.5 * designScale
}

export default function HomePhysicsFooter() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const worldRef = useRef<FooterPhysicsWorld | null>(null)
  const [itemScale, setItemScale] = useState(FOOTER_ITEM_BASE_SCALE * 2.5)
  const [hasStarted, setHasStarted] = useState(false)
  const pointerRef = useRef({
    x: -9999,
    y: -9999,
    previousX: -9999,
    previousY: -9999,
    previousTime: 0,
    lastMoveTime: 0,
    isInside: false,
    pointerType: '',
  })

  useEffect(() => {
    const stage = stageRef.current

    if (!stage) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches

    if (prefersReducedMotion) return

    let isWorldVisible = false
    let hasTriggered = false
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

    const stirNearbyItems = (
      items: FooterPhysicsItem[],
      localX: number,
      localY: number,
      velocityX: number,
      velocityY: number,
      radius: number,
      strength = 1,
    ) => {
      items.forEach(({ body }) => {
        const deltaX = body.position.x - localX
        const deltaY = body.position.y - localY
        const distance = Math.max(1, Math.hypot(deltaX, deltaY))

        if (distance > radius) return

        const falloff = (1 - distance / radius) ** 1.35
        const normalX = Math.abs(deltaX) < 1 ? random(-1, 1) : deltaX / distance
        const normalY = Math.abs(deltaY) < 1 ? random(-1, 1) : deltaY / distance

        Matter.Body.setVelocity(body, {
          x: body.velocity.x + (normalX * 12 * strength + velocityX * 0.2) * falloff,
          y: body.velocity.y + (normalY * 12 * strength + velocityY * 0.2) * falloff,
        })
        Matter.Body.setAngularVelocity(
          body,
          body.angularVelocity +
            (velocityX - velocityY) * 0.004 * falloff +
            random(-0.06, 0.06) * strength,
        )
      })
    }

    const createWorld = () => {
      destroyWorld()

      const bounds = stage.getBoundingClientRect()
      const width = bounds.width
      const height = bounds.height

      if (width <= 0 || height <= 0) return

      const nextItemScale = getResponsiveItemScale(width)
      const isCompactStage = width < 768
      const spawnMinX = isCompactStage ? width * 0.14 : width * 0.06
      const spawnMaxX = isCompactStage ? width * 0.86 : width * 0.94
      const collisionScale = isCompactStage ? 1 : 0.96

      setItemScale(nextItemScale)

      const engine = Matter.Engine.create({ enableSleeping: false })
      const runner = Matter.Runner.create()
      const thickness = Math.max(90, width * 0.08)
      const floorTop = height

      engine.gravity.x = 0
      engine.gravity.y = 1.65

      const walls = [
        Matter.Bodies.rectangle(width / 2, floorTop + thickness / 2, width + thickness * 2, thickness, {
          isStatic: true,
          friction: 0.96,
          restitution: 0.08,
        }),
        Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, {
          isStatic: true,
          friction: 0.72,
        }),
        Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, {
          isStatic: true,
          friction: 0.72,
        }),
      ]

      const physicsItems = itemRefs.current.flatMap((element, index) => {
        if (!element) return []

        const item = footerItems[index]

        if (!item) return []

        element.style.setProperty('--pile-width', `${item.width * nextItemScale}px`)
        element.style.setProperty('--pile-height', `${item.height * nextItemScale}px`)

        const rect = element.getBoundingClientRect()
        const itemWidth = rect.width
        const itemHeight = rect.height

        if (itemWidth <= 0 || itemHeight <= 0) return []

        const body = Matter.Bodies.rectangle(
          random(spawnMinX, spawnMaxX),
          random(-height * 0.18, height * 0.05) - index * 34,
          itemWidth * collisionScale * item.collision.x,
          itemHeight * collisionScale * item.collision.y,
          {
            density: 0.0014,
            friction: 0.9,
            frictionAir: 0.03,
            restitution: 0.18,
          },
        )

        Matter.Body.setAngle(body, random(-0.9, 0.9))
        Matter.Body.setVelocity(body, {
          x: random(-1.8, 1.8),
          y: random(10, 16),
        })

        return [{ body, element, width: itemWidth, height: itemHeight }]
      })

      const sync = () => {
        const pointer = pointerRef.current
        const isRecentPointer = performance.now() - pointer.lastMoveTime < 1600

        if (pointer.isInside && pointer.pointerType !== 'touch' && isRecentPointer) {
          stirNearbyItems(
            physicsItems,
            pointer.x,
            pointer.y,
            0,
            0,
            clamp(width * 0.24, 220, 460),
            0.26,
          )
        }

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

      syncItems(physicsItems)

      if (hasTriggered && isWorldVisible) Matter.Runner.run(runner, engine)
    }

    const stirPile = (power = 1) => {
      const currentWorld = worldRef.current
      const bounds = stage.getBoundingClientRect()

      if (!currentWorld || !hasTriggered || !isWorldVisible) return

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
      if (event.pointerType === 'touch') return

      const currentWorld = worldRef.current

      if (!currentWorld || !hasTriggered || !isWorldVisible) return

      const bounds = stage.getBoundingClientRect()
      const now = performance.now()
      const localX = event.clientX - bounds.left
      const localY = event.clientY - bounds.top
      const elapsed = Math.max(16, now - pointerRef.current.previousTime)
      const velocityX = ((localX - pointerRef.current.previousX) / elapsed) * 16
      const velocityY = ((localY - pointerRef.current.previousY) / elapsed) * 16
      const speed = clamp(Math.hypot(velocityX, velocityY), 0, 120)
      const radius = clamp(bounds.width * 0.25, 220, 480)

      pointerRef.current = {
        x: localX,
        y: localY,
        previousX: localX,
        previousY: localY,
        previousTime: now,
        lastMoveTime: now,
        isInside: true,
        pointerType: event.pointerType,
      }

      stirNearbyItems(currentWorld.items, localX, localY, velocityX, velocityY, radius, 1 + speed * 0.006)
    }

    const handlePointerLeave = () => {
      pointerRef.current.isInside = false
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (isCoarsePointer || event.pointerType === 'touch') {
        stirPile(0.9)
      }
    }

    const scheduleRebuild = () => {
      if (!hasTriggered) return

      window.clearTimeout(rebuildTimer)
      rebuildTimer = window.setTimeout(createWorld, 180)
    }

    const startWorld = () => {
      if (hasTriggered) return

      hasTriggered = true
      createWorld()
      setHasStarted(true)
    }

    const worldVisibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isWorldVisible = entry.isIntersecting

        const currentWorld = worldRef.current

        if (!currentWorld) return

        if (hasTriggered && isWorldVisible) {
          Matter.Runner.run(currentWorld.runner, currentWorld.engine)
        } else {
          Matter.Runner.stop(currentWorld.runner)
        }
      },
      { rootMargin: '30% 0px 30% 0px' },
    )
    const triggerElement =
      stage.closest('[data-contact-world]')?.querySelector('[data-physics-trigger]') ?? stage
    const triggerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startWorld()
      },
      {
        rootMargin: '0px 0px -28% 0px',
        threshold: 0.18,
      },
    )
    const resizeObserver = new ResizeObserver(scheduleRebuild)

    stage.addEventListener('pointermove', pushFromPointer)
    stage.addEventListener('pointerleave', handlePointerLeave)
    stage.addEventListener('pointerdown', handlePointerDown)
    worldVisibilityObserver.observe(stage)
    triggerObserver.observe(triggerElement)
    resizeObserver.observe(stage)

    return () => {
      window.clearTimeout(rebuildTimer)
      stage.removeEventListener('pointermove', pushFromPointer)
      stage.removeEventListener('pointerleave', handlePointerLeave)
      stage.removeEventListener('pointerdown', handlePointerDown)
      worldVisibilityObserver.disconnect()
      triggerObserver.disconnect()
      resizeObserver.disconnect()
      destroyWorld()
    }
  }, [])

  return (
    <footer
      className={`${styles.footer} ${hasStarted ? styles.footerStarted : ''}`}
      aria-label="Interactive footer"
    >
      <div ref={stageRef} className={styles.stage}>
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
                  '--pile-width': `${item.width * itemScale}px`,
                  '--pile-height': `${item.height * itemScale}px`,
                  '--footer-mask': `url('${item.src}')`,
                } as FooterItemStyle
              }
            >
              <span className={styles.itemMask} aria-label={item.label} />
            </li>
          ))}
        </ul>
      </div>

    </footer>
  )
}
