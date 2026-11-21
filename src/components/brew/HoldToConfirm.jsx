/* Adapted from Motion Brew "Hold to confirm" (https://motion-brew.com/components/hold-to-confirm), ported to JSX and themed with this site's tokens.
   Hold (pointer, or Space / Enter) to fill the button; let go early and the fill drains back.
   When the hold completes the size stays the same: the label lifts away, a check draws itself, and the done label rises in letter by letter.
   Only transform, opacity and pathLength are animated. */
import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useMotionTemplate, useReducedMotion, useTransform } from 'motion/react'

export default function HoldToConfirm({ onConfirm, label = 'Hold to delete', doneLabel = 'Deleting…', duration = 0.9, confirmDelay = 0, resetAfter = 1.6, size = 'sm', disabled, className = '' }) {
  const reduce = useReducedMotion()
  const p = useMotionValue(0)
  const anim = useRef(null)
  const timers = useRef([])
  const [done, setDone] = useState(false)
  const clip = useTransform(p, (v) => `inset(0 ${100 - v * 100}% 0 0)`)
  const fillW = useMotionTemplate`${useTransform(p, (v) => v * 100)}%`
  useEffect(() => () => { anim.current?.stop(); timers.current.forEach(clearTimeout) }, [])
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)) }

  const start = () => {
    if (done || disabled) return
    anim.current?.stop()
    anim.current = animate(p, 1, {
      duration: reduce ? 0.01 : duration, ease: 'linear',
      onComplete: () => {
        setDone(true)
        later(() => onConfirm?.(), reduce ? 0 : confirmDelay * 1000)   // let the check + letters play before the caller closes anything
        later(() => { setDone(false); animate(p, 0, { duration: reduce ? 0.01 : 0.3, ease: 'easeOut' }) }, resetAfter * 1000)
      },
    })
  }
  const release = () => { if (done) return; anim.current?.stop(); animate(p, 0, { type: 'spring', stiffness: 380, damping: 32 }) }
  const h = size === 'sm' ? 'h-9 px-3.5 text-[13px]' : 'h-11 px-5 text-sm'
  const t = (d, delay = 0) => ({ duration: reduce ? 0.01 : d, delay: reduce ? 0 : delay, ease: [0.2, 0.8, 0.2, 1] })

  return (
    <button type="button" disabled={disabled} aria-label={done ? doneLabel : label}
      onPointerDown={(e) => { if (e.button === 0 || e.pointerType !== 'mouse') start() }} onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
      onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start() } }} onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') release() }}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative inline-flex shrink-0 touch-none select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-surface font-semibold text-red-600 ring-1 ring-red-300 transition-colors hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50 dark:text-red-300 dark:ring-red-400/50 dark:hover:bg-red-500/10 ${h} ${className}`}>
      <motion.span aria-hidden className="absolute inset-y-0 left-0 bg-red-600" style={{ width: fillW }} />
      {/* idle label (dark, then white under the fill); both lift away when the hold completes */}
      <motion.span className="relative" initial={false} animate={{ y: done ? '-140%' : 0, opacity: done ? 0 : 1 }} transition={t(0.28)}>{label}</motion.span>
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center text-white" style={{ clipPath: clip }} initial={false} animate={{ y: done ? '-140%' : 0, opacity: done ? 0 : 1 }} transition={t(0.28)}>{label}</motion.span>
      {/* confirmed state: check draws, then the label rises letter by letter */}
      <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M5 12.5l4.5 4.5L19 7" initial={false} animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }} transition={t(0.35, 0.12)} />
        </svg>
        <span className="flex">{[...doneLabel].map((c, i) => (
          <span key={i} className="inline-block overflow-hidden py-0.5">
            <motion.span className="inline-block" initial={false} animate={{ y: done ? 0 : '120%', opacity: done ? 1 : 0 }} transition={t(0.3, 0.22 + i * 0.03)}>{c === ' ' ? '\u00a0' : c}</motion.span>
          </span>
        ))}</span>
      </span>
      <span className="sr-only" role="status">{done ? doneLabel : ''}</span>
    </button>
  )
}
