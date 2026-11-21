/* Adapted from Motion Brew "Hold to confirm" (https://motion-brew.com/components/hold-to-confirm), ported to JSX and themed with this site's tokens.
   Press and hold to fill; let go early and it drains back. Works with a held Space / Enter key too. */
import { useRef, useState } from 'react'
import { animate, motion, useMotionValue, useMotionTemplate, useReducedMotion, useTransform } from 'motion/react'

export default function HoldToConfirm({ onConfirm, label = 'Hold to delete', doneLabel = 'Deleting…', duration = 0.9, size = 'sm', disabled, className = '' }) {
  const reduce = useReducedMotion()
  const p = useMotionValue(0)
  const anim = useRef(null)
  const [done, setDone] = useState(false)
  const clip = useTransform(p, (v) => `inset(0 ${100 - v * 100}% 0 0)`)
  const fillW = useMotionTemplate`${useTransform(p, (v) => v * 100)}%`

  const start = () => {
    if (done || disabled) return
    anim.current?.stop()
    anim.current = animate(p, 1, { duration: reduce ? 0.01 : duration, ease: 'linear', onComplete: () => { setDone(true); onConfirm?.(); setTimeout(() => { setDone(false); p.set(0) }, 900) } })
  }
  const cancel = () => { if (done) return; anim.current?.stop(); animate(p, 0, { duration: 0.25, ease: 'easeOut' }) }
  const h = size === 'sm' ? 'h-9 px-3.5 text-[13px]' : 'h-11 px-5 text-sm'

  return (
    <button type="button" disabled={disabled}
      onPointerDown={(e) => { if (e.button === 0 || e.pointerType !== 'mouse') start() }} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}
      onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start() } }} onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') cancel() }}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative inline-flex shrink-0 touch-none select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-surface font-semibold text-red-600 ring-1 ring-red-300 transition-colors hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50 dark:text-red-300 dark:ring-red-400/50 dark:hover:bg-red-500/10 ${h} ${className}`}>
      <motion.span aria-hidden className="absolute inset-y-0 left-0 bg-red-600" style={{ width: fillW }} />
      <span className="relative">{done ? doneLabel : label}</span>
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center text-white" style={{ clipPath: clip }}>{done ? doneLabel : label}</motion.span>
    </button>
  )
}
