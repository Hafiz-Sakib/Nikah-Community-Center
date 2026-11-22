/* Tilt carousel, built from the Motion Brew "Tilt carousel" description (https://motion-brew.com/components/tilt-carousel).
   One motion value (`pos`, in card units) places every card: its wrapped distance from the middle drives x, rotateY, translateZ, scale, brightness and blur. */
import { useCallback, useEffect, useRef } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const wrap = (d, n) => { let x = ((d % n) + n) % n; if (x > n / 2) x -= n; return x }

function Card({ item, i, n, pos, cardWidth, tilt, inactiveScale, onPick }) {
  const abs = (p) => Math.abs(wrap(i - p, n))
  const x = useTransform(pos, (p) => wrap(i - p, n) * cardWidth * 0.74)
  const rotateY = useTransform(pos, (p) => -clamp(wrap(i - p, n), -1, 1) * tilt)
  const z = useTransform(pos, (p) => -Math.min(abs(p), 4) * 70)
  const scale = useTransform(pos, (p) => { const a = abs(p); return 1 - (1 - inactiveScale) * Math.min(a, 1) - 0.03 * Math.max(0, Math.min(a, 4) - 1) })
  const filter = useTransform(pos, (p) => { const a = abs(p); return `brightness(${(1 - 0.1 * Math.min(a, 3)).toFixed(3)}) blur(${(Math.max(0, a - 1) * 2.2).toFixed(2)}px)` })
  const opacity = useTransform(pos, (p) => { const a = abs(p); return clamp(Math.min(4 - a, (n / 2 - a) * 2), 0, 1) })
  const zIndex = useTransform(pos, (p) => 100 - Math.round(abs(p) * 10))
  const src = typeof item === 'string' ? item : item.src
  const alt = typeof item === 'string' ? '' : item.alt || ''
  return (
    <motion.div data-card={i} onClick={() => onPick(i)} style={{ x, rotateY, z, scale, filter, opacity, zIndex, width: cardWidth, marginLeft: -cardWidth / 2, marginTop: `calc(var(--tc-h) / -2)`, aspectRatio: '4 / 5' }}
      className="absolute left-1/2 top-1/2 cursor-pointer overflow-hidden rounded-[22px] bg-slate-200 shadow-[0_24px_40px_-22px_rgba(15,23,42,.55)] will-change-transform [backface-visibility:hidden]">
      <img src={src} alt={alt} draggable={false} loading="lazy" decoding="async" className="pointer-events-none h-full w-full select-none object-cover" />
    </motion.div>
  )
}

export function TiltCarousel({ items = [], cardWidth = 200, tilt = 30, perspective = 1280, inactiveScale = 0.86, speed = 1, autoplay = true, delay = 2, onSelect, onActive, className = '' }) {
  const n = items.length
  const reduce = useReducedMotion()
  const pos = useMotionValue(0)
  const target = useRef(0)
  const ctrl = useRef(null)
  const hover = useRef(false)
  const drag = useRef(null)
  const moved = useRef(false)
  const last = useRef(-1)
  const spread = cardWidth * 0.74
  const height = cardWidth * 1.25

  const go = useCallback((to, throwy = false) => {
    target.current = to
    ctrl.current?.stop()
    ctrl.current = animate(pos, to, reduce ? { duration: 0.22, ease: 'easeOut' } : { type: 'spring', stiffness: (throwy ? 120 : 150) * speed, damping: 20 + 4 * speed, mass: 0.9 })
  }, [pos, reduce, speed])
  const step = useCallback((d) => go(Math.round(target.current) + d), [go])

  useEffect(() => pos.on('change', (p) => {
    if (!onActive) return
    const k = ((Math.round(p) % n) + n) % n
    if (k !== last.current) { last.current = k; onActive(k) }
  }), [pos, n, onActive])

  useEffect(() => {
    if (!autoplay || reduce || n < 2) return
    const t = setInterval(() => { if (!hover.current && !drag.current && !document.hidden) step(1) }, Math.max(0.8, delay) * 1000)
    return () => clearInterval(t)
  }, [autoplay, reduce, delay, n, step])

  const down = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    ctrl.current?.stop(); target.current = pos.get()
    drag.current = { x: e.clientX, p: pos.get(), t: performance.now(), v: 0, lx: e.clientX, lt: performance.now(), id: e.pointerId }
    moved.current = false
  }
  const move = (e) => {
    const d = drag.current; if (!d) return
    const dx = e.clientX - d.x
    if (!moved.current && Math.abs(dx) > 6) { moved.current = true; try { e.currentTarget.setPointerCapture(d.id) } catch {} }
    if (!moved.current) return
    const now = performance.now(), dt = Math.max(1, now - d.lt)
    d.v = 0.8 * d.v + 0.2 * ((e.clientX - d.lx) / dt) * 1000   // px / s, smoothed
    d.lx = e.clientX; d.lt = now
    pos.set(d.p - dx / spread)
  }
  const up = () => {
    const d = drag.current; drag.current = null
    if (!d || !moved.current) return
    const throwBy = clamp(-d.v / spread * 0.16, -2, 2)
    go(Math.round(pos.get() + throwBy), true)
    setTimeout(() => { moved.current = false }, 0)
  }
  const pick = (i) => {
    if (moved.current) return
    const d = wrap(i - Math.round(target.current), n)
    if (d < 0) step(-1)
    else if (d > 0) step(1)
    else onSelect?.(items[i], i)
  }
  const key = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
    else if (e.key === 'Enter') { const k = ((Math.round(target.current) % n) + n) % n; onSelect?.(items[k], k) }
  }

  if (!n) return null
  return (
    <div role="region" aria-roledescription="carousel" aria-label="Photo carousel" tabIndex={0}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') hover.current = true }} onPointerLeave={() => { hover.current = false }}
      onKeyDown={key}
      style={{ perspective, height: height + 56, '--tc-h': `${height}px`, touchAction: 'pan-y' }}
      className={`relative w-full select-none overflow-hidden outline-none [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] focus-visible:ring-2 focus-visible:ring-brand/50 ${className}`}>
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {items.map((item, i) => <Card key={i} {...{ item, i, n, pos, cardWidth, tilt, inactiveScale }} onPick={pick} />)}
      </div>
    </div>
  )
}

export default TiltCarousel
