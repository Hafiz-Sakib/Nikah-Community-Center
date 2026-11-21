/* Adapted from Motion Brew "Amount slider" (https://motion-brew.com/components/amount-slider), ported to JSX.
   Generalised: `format` renders the number (guests here), and the loan estimate / trust row were removed. */
import * as React from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react'

const ROLL = { type: 'spring', stiffness: 300, damping: 28, mass: 0.7 }
const PRESS = { type: 'spring', stiffness: 260, damping: 26 }
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function Digit({ digit, still }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden">
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" initial={false} animate={{ y: `${-digit * 10}%` }} transition={still ? { duration: 0 } : ROLL}>
        {DIGITS.map((d) => <span key={d} className="flex h-[1em] items-center justify-center">{d}</span>)}
      </motion.span>
    </span>
  )
}

/** A formatted number whose digits roll like an odometer. Separators and symbols stay put. */
export function Rolling({ text, still = false }) {
  const chars = Array.from(text)
  return (
    <span aria-label={text} role="text" className="inline-flex leading-none tabular-nums">
      {chars.map((ch, i) => {
        const key = chars.length - i
        return /\d/.test(ch)
          ? <Digit key={key} digit={Number(ch)} still={still} />
          : <span key={`${key}-${ch}`} aria-hidden className="inline-block h-[1em] whitespace-pre">{ch}</span>
      })}
    </span>
  )
}

export function AmountSlider({ label = 'Guests', min = 50, max = 600, step = 10, defaultValue = 200, format = (n) => String(n), onChange }) {
  const still = !!useReducedMotion()
  const span = Math.max(1, max - min)
  const clamp = (v) => Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min))
  const [value, setValue] = React.useState(() => clamp(defaultValue))
  const [grab, setGrab] = React.useState(false)
  const track = React.useRef(null)
  const pos = useMotionValue((value - min) / span)
  const stretch = useMotionValue(0)

  const commit = (v) => {
    const next = clamp(v)
    setValue((cur) => { if (cur !== next) onChange?.(next); return next })
  }
  useMotionValueEvent(pos, 'change', (p) => commit(min + Math.min(1, Math.max(0, p)) * span))
  React.useEffect(() => { onChange?.(value) }, []) // eslint-disable-line

  const left = useTransform(pos, (p) => { const c = Math.min(1, Math.max(0, p)); return `calc(${c * 100}% + ${24 - c * 48}px)` })
  const scaleX = useTransform(stretch, (s) => 1 + Math.min(0.35, Math.abs(s) * 0.004))
  const originX = useTransform(stretch, (s) => (s < 0 ? 1 : 0))

  const ratioAt = (clientX) => { const r = track.current.getBoundingClientRect(); return (clientX - r.left - 24) / Math.max(1, r.width - 48) }
  const glide = (p) => animate(pos, Math.min(1, Math.max(0, p)), still ? { duration: 0 } : PRESS)

  const onDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.focus({ focusVisible: false })
    setGrab(true); pos.stop(); glide(ratioAt(e.clientX))
  }
  const onMove = (e) => {
    if (!grab) return
    pos.stop()
    const w = Math.max(1, track.current.getBoundingClientRect().width - 48)
    const p = ratioAt(e.clientX)
    pos.set(Math.min(1, Math.max(0, p)))
    stretch.set(p < 0 ? p * w : p > 1 ? (p - 1) * w : 0)
  }
  const onUp = () => {
    if (!grab) return
    setGrab(false)
    animate(stretch, 0, still ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 18 })
    glide((value - min) / span)
  }
  const onKey = (e) => {
    const big = Math.max(step, Math.round(span / 10 / step) * step)
    const by = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big }
    let next = null
    if (e.key in by) next = clamp(value + by[e.key])
    else if (e.key === 'Home') next = min
    else if (e.key === 'End') next = max
    if (next === null) return
    e.preventDefault(); glide((next - min) / span)
  }

  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-[32px] font-medium leading-none tracking-tight text-fg"><Rolling text={format(value)} still={still} /></p>
      <div className="mt-8">
        <div ref={track} role="slider" tabIndex={0} aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={format(value)}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
          className="relative h-10 cursor-pointer touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4">
          <span className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200">
            <motion.span className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: left }} />
          </span>
          <motion.span className="absolute top-1/2 -ml-6 -mt-4 block h-8 w-12" style={{ left }}>
            <motion.span className="flex h-full w-full items-center justify-center gap-[3px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12),0_6px_16px_-6px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
              style={{ scaleX, originX }} animate={{ scale: grab && !still ? 1.12 : 1 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }}>
              {[0, 1, 2].map((k) => <motion.span key={k} className="h-3 w-px rounded-full bg-slate-400" animate={{ x: grab && !still ? (k - 1) * 2 : 0 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }} />)}
            </motion.span>
          </motion.span>
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-slate-500 tabular-nums"><span>{format(min)}</span><span>{format(max)}</span></div>
      </div>
    </div>
  )
}
