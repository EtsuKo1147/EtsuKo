'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import LoadingTypewriter from './LoadingTypewriter'

// 仪表盘数字 loading 时长
const DASHBOARD_PROGRESS_MS = 1000

// 外部头盔时间线：数字、visor、眼睛、手套分段出现，避免同一刻挤在一起
const HELMET_START_MS    = 800
const HELMET_DURATION_MS = 900
const EYES_OPEN_MS       = 1200
const READY_START_MS     = 1900

// 点击进入主页的稳定重叠转场时长
const FADE_MS = 3500

// 响应式基准（1920×1080 设计稿）
const HELMET_BASE_WIDTH        = 380
const DASHBOARD_BASE_WIDTH     = 520
const CURSOR_BASE_WIDTH        = 300
const LOADING_NUMBER_BASE_FONT = 32
const NEEDLE_BASE_WIDTH        = 24
const NEEDLE_BASE_HEIGHT       = 90
const VISOR_OPEN_TRANSLATE_Y   = '-32%'

const NEEDLE_LEFT_POSITION    = { left: '27%', top: '85%' }
const NEEDLE_RIGHT_POSITION   = { left: '73%', top: '85%' }
const NEEDLE_TRANSLATE        = 'translate(-50%, -83%)'
const NEEDLE_TRANSFORM_ORIGIN = '50% 25%'

// 桌面端 interior stage 基准尺寸（1920×1080 设计坐标系）
const DESKTOP_INTERIOR_STAGE_WIDTH  = 1920
const DESKTOP_INTERIOR_STAGE_HEIGHT = 1080

// 桌面端 hand 在 stage 坐标系中的定位（px）
const DESKTOP_HAND_STAGE_LEFT   = 1300
const DESKTOP_HAND_STAGE_TOP    = 750
const DESKTOP_HAND_STAGE_WIDTH  = 760
const DESKTOP_HAND_ASPECT_RATIO = '985 / 1550'

// 桌面端内部 visor 打开位移，点击后会压缩到 3.5s 内完成
const DESKTOP_HAND_ENTRY_Y       = 420
const DESKTOP_VISOR_PUSH_Y       = -486
const DESKTOP_VISOR_EXIT_EXTRA_Y = -810
const DESKTOP_BOTTOM_EXIT_Y      = 1240
const DESKTOP_HAND_EXIT_X        = 1200

// 手机端 interior stage 基准尺寸（1170×2532 设计坐标系）
const MOBILE_INTERIOR_STAGE_WIDTH  = 1170
const MOBILE_INTERIOR_STAGE_HEIGHT = 2532

// 手机端内部 visor 打开位移，保留原资产坐标逻辑，只缩短时间
const MOBILE_HAND_ENTRY_Y       = 320
const MOBILE_VISOR_PUSH_Y       = -680
const MOBILE_VISOR_EXIT_EXTRA_Y = -980
const MOBILE_BOTTOM_EXIT_Y      = 2700
const MOBILE_HAND_EXIT_X        = 900

type LoaderPhase = 'loading' | 'ready' | 'pressed' | 'exiting' | 'done'
type EyeState    = 'closed' | 'open'

export default function HandDrawnLoader({
  onComplete,
  onReveal,
}: {
  onComplete: () => void
  onReveal?: () => void
}) {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [fading] = useState(false)
  const [eyeState,        setEyeState]        = useState<EyeState>('closed')
  const [visorUp,         setVisorUp]         = useState(false)
  const [phase,           setPhase]           = useState<LoaderPhase>('loading')
  const [mouse,           setMouse]           = useState({ x: 0, y: 0 })
  const [cursorPressed,   setCursorPressed]   = useState(false)
  const [showClickHint,   setShowClickHint]   = useState(false)
  const [hintDismissed,   setHintDismissed]   = useState(false)
  const [viewportSize,    setViewportSize]    = useState({ width: 0, height: 0 })
  const [cursorPositionReady, setCursorPositionReady] = useState(false)

  const onCompleteRef      = useRef(onComplete)
  const onRevealRef        = useRef(onReveal)
  const clickTimersRef     = useRef<number[]>([])
  const helmetRef          = useRef<HTMLDivElement | null>(null)
  const dashboardRef       = useRef<HTMLDivElement | null>(null)
  const hintDismissedRef   = useRef(false)
  const hasPointerMovedRef = useRef(false)
  const exitTimelineRef    = useRef<gsap.core.Timeline | null>(null)

  // interior transition refs
  const loaderBackdropRef       = useRef<HTMLDivElement | null>(null)
  const externalVisualRef       = useRef<HTMLDivElement | null>(null)
  const transitionCoverRef      = useRef<HTMLDivElement | null>(null)
  const interiorLayerRef        = useRef<HTMLDivElement | null>(null)
  const interiorDarkRef         = useRef<HTMLDivElement | null>(null)
  const internalVisorTopRef     = useRef<HTMLDivElement | null>(null)
  const internalHelmetBottomRef = useRef<HTMLDivElement | null>(null)
  const interiorHandRef         = useRef<HTMLDivElement | null>(null)

  const desktopInteriorStageRef  = useRef<HTMLDivElement | null>(null)
  const desktopVisorPushGroupRef = useRef<HTMLDivElement | null>(null)
  const mobileInteriorStageRef   = useRef<HTMLDivElement | null>(null)
  const mobileVisorPushGroupRef  = useRef<HTMLDivElement | null>(null)
  const mobileHandRef            = useRef<HTMLDivElement | null>(null)
  const mobileVisorTopRef        = useRef<HTMLDivElement | null>(null)
  const mobileHelmetBottomRef    = useRef<HTMLDivElement | null>(null)

  // 派生 scale（每次 render 计算）
  const viewportReady        = viewportSize.width > 0 && viewportSize.height > 0
  const safeViewportWidth    = viewportReady ? viewportSize.width : 1920
  const baseScale            = Math.min(1, safeViewportWidth / 1920)
  const helmetModuleScale    = Math.max(0.55, baseScale)
  const DASHBOARD_MOBILE_MIN_SCALE = 0.66
  const DASHBOARD_MAX_WIDTH_RATIO  = 0.95

  const dashboardRawScale           = Math.max(DASHBOARD_MOBILE_MIN_SCALE, baseScale)
  const dashboardViewportScaleLimit = (safeViewportWidth * DASHBOARD_MAX_WIDTH_RATIO) / DASHBOARD_BASE_WIDTH
  const dashboardModuleScale        = Math.min(dashboardRawScale, dashboardViewportScaleLimit)

  const safeViewportHeight = viewportReady ? viewportSize.height : 1080

  const desktopInteriorStageScale  = viewportReady
    ? Math.max(safeViewportWidth / DESKTOP_INTERIOR_STAGE_WIDTH, safeViewportHeight / DESKTOP_INTERIOR_STAGE_HEIGHT)
    : 1
  const desktopInteriorStageWidth  = DESKTOP_INTERIOR_STAGE_WIDTH  * desktopInteriorStageScale
  const desktopInteriorStageHeight = DESKTOP_INTERIOR_STAGE_HEIGHT * desktopInteriorStageScale

  const mobileInteriorStageScale  = viewportReady
    ? Math.max(safeViewportWidth / MOBILE_INTERIOR_STAGE_WIDTH, safeViewportHeight / MOBILE_INTERIOR_STAGE_HEIGHT)
    : 1
  const mobileInteriorStageWidth  = MOBILE_INTERIOR_STAGE_WIDTH  * mobileInteriorStageScale
  const mobileInteriorStageHeight = MOBILE_INTERIOR_STAGE_HEIGHT * mobileInteriorStageScale

  const helmetWidth     = HELMET_BASE_WIDTH        * helmetModuleScale
  const dashboardWidth  = DASHBOARD_BASE_WIDTH     * dashboardModuleScale
  const loadingFontSize = LOADING_NUMBER_BASE_FONT * dashboardModuleScale
  const cueW            = CURSOR_BASE_WIDTH        * helmetModuleScale
  const needleWidth     = Math.round(NEEDLE_BASE_WIDTH  * dashboardModuleScale)
  const needleHeight    = Math.round(NEEDLE_BASE_HEIGHT * dashboardModuleScale)

  // safe clamp：防止 click-helmet-hint 超出右侧或顶部
  const rightEdge = mouse.x + cueW * 0.99
  const clampedX  = rightEdge > viewportSize.width - 8
    ? viewportSize.width - 8 - cueW * 0.99
    : mouse.x
  const topEdge  = mouse.y - cueW * 0.68
  const clampedY = topEdge < 8 ? 8 + cueW * 0.68 : mouse.y

  // 桌面端 interior transition 判断
  const isDesktopInteriorTransition = viewportSize.width > 768

  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  useEffect(() => { onRevealRef.current = onReveal },     [onReveal])

  // viewport 监听（useLayoutEffect 确保首帧前拿到真实尺寸）
  useLayoutEffect(() => {
    function update() {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // loadingProgress: 0 → 100
  useEffect(() => {
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const progress = Math.min(100, Math.round((now - start) / DASHBOARD_PROGRESS_MS * 100))
      setLoadingProgress(progress)
      if (progress < 100) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // 挂载时一次性调度所有绝对时间事件
  useEffect(() => {
    const t0 = setTimeout(() => setVisorUp(true), HELMET_START_MS)
    const t1 = setTimeout(() => setEyeState('open'), EYES_OPEN_MS)
    const t2 = setTimeout(() => {
      setEyeState('open')
      setVisorUp(true)
      setPhase('ready')
    }, READY_START_MS)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // 进入 ready：手套初始位置（同步计算，避免首帧闪到左边缘）
  useLayoutEffect(() => {
    if (phase !== 'ready' || !viewportReady) return
    if (!hasPointerMovedRef.current) {
      const rect = dashboardRef.current?.getBoundingClientRect()
      if (rect) {
        setMouse({
          x: rect.left + rect.width  * 0.18,
          y: rect.top  + rect.height * 0.08,
        })
      } else {
        setMouse({ x: viewportSize.width / 2 - 80, y: viewportSize.height * 0.7 })
      }
    }
    setCursorPositionReady(true)
    setShowClickHint(true)
    setHintDismissed(false)
    hintDismissedRef.current = false
  }, [phase, viewportReady, viewportSize.width, viewportSize.height])

  // 鼠标追踪：挂载后一直生效
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      hasPointerMovedRef.current = true
      setCursorPositionReady(true)
      setMouse({ x: e.clientX, y: e.clientY })
      if (!hintDismissedRef.current) {
        const rect = helmetRef.current?.getBoundingClientRect()
        if (rect) {
          const isOverHelmet =
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top  && e.clientY <= rect.bottom
          if (isOverHelmet) {
            hintDismissedRef.current = true
            setHintDismissed(true)
            setShowClickHint(false)
          }
        }
      }
    }
    const onDown = () => setCursorPressed(true)
    const onUp   = () => setCursorPressed(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clickTimersRef.current.forEach(window.clearTimeout)
      clickTimersRef.current = []
      exitTimelineRef.current?.kill()
    }
  }, [])

  function runStableInteriorTimeline() {
    const activeStageRef = isDesktopInteriorTransition
      ? desktopInteriorStageRef.current
      : mobileInteriorStageRef.current
    const activePushGroupRef = isDesktopInteriorTransition
      ? desktopVisorPushGroupRef.current
      : mobileVisorPushGroupRef.current
    const activeHandRef = isDesktopInteriorTransition
      ? interiorHandRef.current
      : mobileHandRef.current
    const activeVisorTopRef = isDesktopInteriorTransition
      ? internalVisorTopRef.current
      : mobileVisorTopRef.current
    const activeHelmetBottomRef = isDesktopInteriorTransition
      ? internalHelmetBottomRef.current
      : mobileHelmetBottomRef.current
    const visorPushY = isDesktopInteriorTransition
      ? DESKTOP_VISOR_PUSH_Y
      : MOBILE_VISOR_PUSH_Y
    const visorExitExtraY = isDesktopInteriorTransition
      ? DESKTOP_VISOR_EXIT_EXTRA_Y
      : MOBILE_VISOR_EXIT_EXTRA_Y
    const bottomExitY = isDesktopInteriorTransition
      ? DESKTOP_BOTTOM_EXIT_Y
      : MOBILE_BOTTOM_EXIT_Y
    const handExitX = isDesktopInteriorTransition
      ? DESKTOP_HAND_EXIT_X
      : MOBILE_HAND_EXIT_X

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => { onCompleteRef.current() },
    })
    exitTimelineRef.current = tl

    tl.set(transitionCoverRef.current,       { autoAlpha: 0, xPercent: -120, yPercent: 0 })
    tl.set(loaderBackdropRef.current,        { autoAlpha: 1 })
    tl.set(externalVisualRef.current,        { autoAlpha: 1, filter: 'brightness(1)' })
    tl.set(interiorLayerRef.current,         { autoAlpha: 1 })
    tl.set(interiorDarkRef.current,          { autoAlpha: 0 })
    tl.set(desktopInteriorStageRef.current,  { autoAlpha: 0, scale: 1 })
    tl.set(mobileInteriorStageRef.current,   { autoAlpha: 0, scale: 1 })
    tl.set(desktopVisorPushGroupRef.current, { x: 0, y: 0 })
    tl.set(mobileVisorPushGroupRef.current,  { x: 0, y: 0 })
    tl.set(interiorHandRef.current,          { autoAlpha: 0, x: 0, y: DESKTOP_HAND_ENTRY_Y })
    tl.set(mobileHandRef.current,            { autoAlpha: 0, x: 0, y: MOBILE_HAND_ENTRY_Y })
    tl.set(internalVisorTopRef.current,      { x: 0, y: 0 })
    tl.set(internalHelmetBottomRef.current,  { x: 0, y: 0 })
    tl.set(mobileVisorTopRef.current,        { x: 0, y: 0 })
    tl.set(mobileHelmetBottomRef.current,    { x: 0, y: 0 })

    // 内部 visor 立即接上外部 helmet；黑幕不再参与切换。
    tl.fromTo(
      activeStageRef,
      { autoAlpha: 0, scale: 1.012, filter: 'brightness(1.35)' },
      { autoAlpha: 1, scale: 1, filter: 'brightness(1)', duration: 1.0, ease: 'power2.out' },
      0,
    )
    tl.to(loaderBackdropRef.current, { autoAlpha: 0, duration: 1.2 }, 0)
    tl.to(externalVisualRef.current, { autoAlpha: 0, filter: 'brightness(1.22)', duration: 0.85 }, 0.35)
    tl.to(activeHandRef, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.65)
    tl.to(activePushGroupRef, { y: visorPushY, duration: 1.6 }, 1.05)
    tl.to(activeHelmetBottomRef, { y: bottomExitY, duration: 1.3, ease: 'power2.in' }, 1.65)
    tl.fromTo(
      transitionCoverRef.current,
      { autoAlpha: 0, xPercent: -120 },
      { autoAlpha: 0.62, xPercent: 120, duration: 1.2, ease: 'power2.out' },
      0.55,
    )
    tl.call(() => onRevealRef.current?.(), undefined, 1.3)
    tl.to(activeHandRef, { x: handExitX, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, 2.65)
    tl.to(activeVisorTopRef, { y: visorExitExtraY, duration: 0.7, ease: 'power2.in' }, 2.65)
    tl.to(transitionCoverRef.current, { autoAlpha: 0, duration: 0.2 }, 1.75)
    tl.to(interiorLayerRef.current,   { autoAlpha: 0, duration: 0.15 }, 3.35)

    // 3.5s: onComplete 由 timeline onComplete 回调触发
  }

  function handleHelmetClick() {
    if (phase !== 'ready') return
    if (exitTimelineRef.current) return  // 防止重复点击

    // 公共：立刻隐藏手套和 click hint
    setShowClickHint(false)
    setHintDismissed(true)
    hintDismissedRef.current = true
    setPhase('pressed')

    runStableInteriorTimeline()
  }

  // 只在 ready / pressed 且 cursorPositionReady 时显示手套
  const shouldShowCursorCue = phase === 'ready' || phase === 'pressed'
  const showCursorStyle     = viewportReady && shouldShowCursorCue && cursorPositionReady

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: fading ? 'none' : 'all',
        cursor: showCursorStyle ? 'none' : 'default',
      }}
    >
      {/* 白色背景层，GSAP 控制淡出 */}
      <div
        ref={loaderBackdropRef}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#faf9f6',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* 外部视觉层：头盔 + dashboard + cueGroup */}
      <div
        ref={externalVisualRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <LoadingTypewriter />

        {/* 头盔居中，视觉上稍微往上 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'translateY(-4vh)',
            visibility: viewportReady ? 'visible' : 'hidden',
          }}
        >
          {/* 头盔容器 — 真实比例 436/552，overflow: visible 保证 visor 上移不被裁 */}
          <div
            ref={helmetRef}
            style={{
              position: 'relative',
              overflow: 'visible',
              width: helmetWidth,
              aspectRatio: '436 / 552',
            }}
            onClick={handleHelmetClick}
          >
            {/* Layer 1: 眼睛，两张叠放，opacity 切换 */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
              <Image
                src="/loading/eyes-closed.svg"
                alt=""
                fill
                sizes="(max-width: 768px) 62vw, 380px"
                style={{
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  transform: 'none',
                  opacity: eyeState === 'closed' ? 1 : 0,
                  transition: 'opacity 200ms',
                }}
                unoptimized
              />
              <Image
                src="/loading/eyes-open.svg"
                alt=""
                fill
                sizes="(max-width: 768px) 62vw, 380px"
                style={{
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  transform: 'none',
                  opacity: eyeState === 'open' ? 1 : 0,
                  transition: 'opacity 200ms',
                }}
                unoptimized
              />
            </div>

            {/* Layer 2: Visor，HELMET_START_MS 后开始上移 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                transform: visorUp
                  ? `translateY(${VISOR_OPEN_TRANSLATE_Y})`
                  : 'translateY(0)',
                transition: `transform ${HELMET_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              <Image
                src="/loading/helmet-visor.svg"
                alt=""
                fill
                sizes="(max-width: 768px) 62vw, 380px"
                style={{ objectFit: 'contain', pointerEvents: 'none' }}
                unoptimized
              />
            </div>

            {/* Layer 3: Shell，始终可见 */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
              <Image
                src="/loading/helmet-shell.svg"
                alt=""
                fill
                sizes="(max-width: 768px) 62vw, 380px"
                style={{
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  transform: 'none',
                }}
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* 仪表盘 — 固定在底部，水平居中 */}
        <div
          ref={dashboardRef}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -4,
            transform: 'translateX(-50%)',
            overflow: 'visible',
            width: dashboardWidth,
            aspectRatio: '900 / 420',
            visibility: viewportReady ? 'visible' : 'hidden',
          }}
        >
          {/* Layer 1: 仪表盘底图 */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <Image
              src="/loading/dashboard-shell.png"
              alt=""
              fill
              sizes="(max-width: 768px) 82vw, 520px"
              style={{ objectFit: 'contain', pointerEvents: 'none' }}
              priority
              unoptimized
            />
          </div>

          {/* Layer 2: needle-left */}
          <div
            style={{
              position: 'absolute',
              left: NEEDLE_LEFT_POSITION.left,
              top: NEEDLE_LEFT_POSITION.top,
              width: needleWidth,
              height: needleHeight,
              zIndex: 2,
              pointerEvents: 'none',
              transform: NEEDLE_TRANSLATE,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                transformOrigin: NEEDLE_TRANSFORM_ORIGIN,
                animationName: 'dashboard-needle-left-swing',
                animationDuration: '900ms',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationFillMode: 'both',
                willChange: 'transform',
              }}
            >
              <Image
                src="/loading/needle-left.png"
                alt=""
                width={needleWidth}
                height={needleHeight}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                unoptimized
              />
            </div>
          </div>

          {/* Layer 2: needle-right */}
          <div
            style={{
              position: 'absolute',
              left: NEEDLE_RIGHT_POSITION.left,
              top: NEEDLE_RIGHT_POSITION.top,
              width: needleWidth,
              height: needleHeight,
              zIndex: 2,
              pointerEvents: 'none',
              transform: NEEDLE_TRANSLATE,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                transformOrigin: NEEDLE_TRANSFORM_ORIGIN,
                animationName: 'dashboard-needle-right-swing',
                animationDuration: '1900ms',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationFillMode: 'both',
                animationDelay: '120ms',
                willChange: 'transform',
              }}
            >
              <Image
                src="/loading/needle-right.png"
                alt=""
                width={needleWidth}
                height={needleHeight}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                unoptimized
              />
            </div>
          </div>

          {/* Layer 3: green-flash-left */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              animationName: 'dashboard-green-flash',
              animationDuration: '520ms',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: '0ms',
              willChange: 'opacity',
            }}
          >
            <Image
              src="/loading/green-flash-left.png"
              alt=""
              fill
              sizes="(max-width: 768px) 82vw, 520px"
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>

          {/* Layer 3: green-flash-right */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              animationName: 'dashboard-green-flash',
              animationDuration: '520ms',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: '260ms',
              willChange: 'opacity',
            }}
          >
            <Image
              src="/loading/green-flash-right.png"
              alt=""
              fill
              sizes="(max-width: 768px) 82vw, 520px"
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>

          {/* Layer 4: red-pause-light */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 4,
              pointerEvents: 'none',
              animationName: 'dashboard-red-pause-breathe',
              animationDuration: '1200ms',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationFillMode: 'both',
              willChange: 'opacity, filter',
            }}
          >
            <Image
              src="/loading/red-pause-light.png"
              alt=""
              fill
              sizes="(max-width: 768px) 82vw, 520px"
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>

          {/* Layer 5: 进度数字 */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '67%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              fontSize: `${loadingFontSize}px`,
              fontWeight: 900,
              color: '#363636',
              fontFamily: '"Impact", "Arial Black", "Helvetica Neue", sans-serif',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              pointerEvents: 'none',
            }}
          >
            {loadingProgress}%
          </div>
        </div>

        {/* 手套 + click-helmet-hint cueGroup */}
        {showCursorStyle && (
          <div
            style={{
              position: 'fixed',
              left: clampedX,
              top: clampedY,
              width: cueW,
              pointerEvents: 'none',
              zIndex: 10020,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cursorPressed ? '/loading/glove-cursor-pressed.svg' : '/loading/glove-cursor.svg'}
              alt=""
              style={{
                width: '100%',
                height: 'auto',
                transform: 'translate(-44%, -23%)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/loading/click-helmet-hint.svg"
              alt=""
              style={{
                position: 'absolute',
                left: '34%',
                top: '-71%',
                width: '82%',
                height: 'auto',
                opacity: phase === 'ready' && showClickHint && !hintDismissed ? 1 : 0,
                transition: 'opacity 400ms ease',
              }}
            />
          </div>
        )}
      </div>

      {/* 内部头盔转场层（GSAP 控制，默认隐藏） */}
      <div
        ref={interiorLayerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* 内部黑场背景 */}
        <div
          ref={interiorDarkRef}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000000',
            zIndex: 1,
          }}
        />

        {/* 桌面端 1920×1080 interior stage */}
        <div
          ref={desktopInteriorStageRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: desktopInteriorStageWidth,
            height: desktopInteriorStageHeight,
            transform: 'translate(-50%, -50%)',
            transformOrigin: 'center center',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {/* visor push group：hand + visor-top 一起上移 */}
          <div
            ref={desktopVisorPushGroupRef}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            {/* hand.png — stage 坐标定位（px） */}
            <div
              ref={interiorHandRef}
              style={{
                position: 'absolute',
                left: DESKTOP_HAND_STAGE_LEFT,
                top: DESKTOP_HAND_STAGE_TOP,
                width: DESKTOP_HAND_STAGE_WIDTH,
                aspectRatio: DESKTOP_HAND_ASPECT_RATIO,
                zIndex: 2,
                pointerEvents: 'none',
                willChange: 'transform, opacity',
              }}
            >
              <Image
                src="/loading/hand.png"
                alt=""
                fill
                sizes="760px"
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>

            {/* internal-visor-top.png — 1920×1080 画布 */}
            <div
              ref={internalVisorTopRef}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 3,
                willChange: 'transform',
              }}
            >
              <Image
                src="/loading/internal-visor-top.png"
                alt=""
                fill
                sizes="100vw"
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>
          </div>

          {/* internal-helmet-bottom.png — 1920×1080 画布 */}
          <div
            ref={internalHelmetBottomRef}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 4,
              willChange: 'transform',
            }}
          >
            <Image
              src="/loading/internal-helmet-bottom.png"
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>
        </div>

        {/* 手机端 1170×2532 interior stage */}
        <div
          ref={mobileInteriorStageRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: mobileInteriorStageWidth,
            height: mobileInteriorStageHeight,
            transform: 'translate(-50%, -50%)',
            transformOrigin: 'center center',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {/* visor push group：hand-mobile + visor-top-mobile 一起上移 */}
          <div
            ref={mobileVisorPushGroupRef}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            {/* hand-mobile.png — 1170×2532 全屏透明画布 */}
            <div
              ref={mobileHandRef}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                willChange: 'transform, opacity',
              }}
            >
              <Image
                src="/loading/hand-mobile.png"
                alt=""
                fill
                sizes="100vw"
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>

            {/* internal-visor-top-mobile.png — 1170×2532 全屏透明画布 */}
            <div
              ref={mobileVisorTopRef}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 3,
                willChange: 'transform',
              }}
            >
              <Image
                src="/loading/internal-visor-top-mobile.png"
                alt=""
                fill
                sizes="100vw"
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>
          </div>

          {/* internal-helmet-bottom-mobile.png — 1170×2532 全屏透明画布 */}
          <div
            ref={mobileHelmetBottomRef}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 4,
              willChange: 'transform',
            }}
          >
            <Image
              src="/loading/internal-helmet-bottom-mobile.png"
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* 轻微玻璃扫光，给进入 visor 的瞬间一点仪式感，避免黑场 */}
      <div
        ref={transitionCoverRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: 3,
          pointerEvents: 'none',
          background: 'linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0) 38%, rgba(255, 255, 255, 0.58) 50%, rgba(110, 255, 219, 0.2) 56%, rgba(255, 255, 255, 0) 68%, transparent 100%)',
          mixBlendMode: 'screen',
          opacity: 0,
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  )
}
