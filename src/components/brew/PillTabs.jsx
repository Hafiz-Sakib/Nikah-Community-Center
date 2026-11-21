/* Adapted from Motion Brew "Pill tabs" (https://motion-brew.com/components/pill-tabs), ported to JSX and themed with this site's tokens. */
import * as React from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, useVelocity } from 'motion/react'

export function PillTabs({ tabs, value: valueProp, defaultValue, onValueChange, stretch = 0.45, blur = 7.5, label = 'Sections', className = '' }) {
  const reduceMotion = !!useReducedMotion()
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '')
  const filterId = `pill-blur-${uid}`
  const track = React.useRef(null)
  const tabRefs = React.useRef([])
  const blurNode = React.useRef(null)
  const [inner, setInner] = React.useState(defaultValue ?? tabs[0]?.id ?? '')
  const value = valueProp ?? inner
  const index = Math.max(0, tabs.findIndex((t) => t.id === value))
  const placed = React.useRef(false)
  const fromWidth = React.useRef(0)
  const toWidth = React.useRef(0)
  const [height, setHeight] = React.useState(0)

  const left = useMotionValue(0)
  const right = useMotionValue(0)
  const capX = useTransform(right, (r) => r - height)
  const midX = useTransform(left, (l) => l + height / 2)
  const midScale = useTransform([left, right], ([l, r]) => Math.max(0, r - l - height))
  const thin = useTransform([left, right], ([l, r]) => {
    if (reduceMotion) return 1
    const w = r - l
    const rest = Math.max(fromWidth.current, toWidth.current, 1)
    return 1 - Math.min(0.18, (Math.max(0, w - rest) / rest) * 0.35)
  })
  const center = useTransform([left, right], ([l, r]) => (l + r) / 2)
  const speed = useVelocity(center)
  useMotionValueEvent(speed, 'change', (v) => {
    const sd = blur > 0 && !reduceMotion ? Math.min(blur, Math.abs(v) / 420) : 0
    blurNode.current?.setAttribute('stdDeviation', `${sd.toFixed(2)} 0`)
  })

  const select = (id) => { if (valueProp === undefined) setInner(id); onValueChange?.(id) }

  const moveTo = React.useCallback((instant) => {
    const tab = tabRefs.current[index]
    if (!tab) return
    const l = tab.offsetLeft, r = l + tab.offsetWidth
    setHeight(tab.offsetHeight)
    if (instant || reduceMotion) { left.set(l); right.set(r); return }
    const goingRight = l > left.get()
    const amount = Math.min(1, Math.max(0, stretch))
    fromWidth.current = right.get() - left.get()
    toWidth.current = r - l
    const mass = 0.8
    const critical = (k) => 2 * Math.sqrt(k * mass)
    const leadK = 640, trailK = 700 - 540 * amount
    const lead = { type: 'spring', stiffness: leadK, damping: critical(leadK) * 0.95, mass }
    const trail = { type: 'spring', stiffness: trailK, damping: critical(trailK) * 0.9, mass, delay: 0.13 * amount }
    animate(left, l, goingRight ? trail : lead)
    animate(right, r, goingRight ? lead : trail)
  }, [index, left, right, reduceMotion, stretch])

  React.useLayoutEffect(() => { moveTo(!placed.current); placed.current = true }, [moveTo])
  React.useEffect(() => {
    const el = track.current
    if (!el) return
    const ro = new ResizeObserver(() => moveTo(true))
    ro.observe(el)
    return () => ro.disconnect()
  }, [moveTo])

  const focusTab = (i) => {
    const n = (i + tabs.length) % tabs.length
    select(tabs[n].id)
    tabRefs.current[n]?.focus()
  }

  return (
    <div ref={track} role="tablist" aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); focusTab(index + 1) }
        if (e.key === 'ArrowLeft') { e.preventDefault(); focusTab(index - 1) }
        if (e.key === 'Home') { e.preventDefault(); focusTab(0) }
        if (e.key === 'End') { e.preventDefault(); focusTab(tabs.length - 1) }
      }}
      className={`relative inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 p-1.5 ${className}`}>
      <svg aria-hidden className="absolute h-0 w-0"><filter id={filterId} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur ref={blurNode} stdDeviation="0 0" /></filter></svg>
      <motion.span aria-hidden className="pointer-events-none absolute inset-y-1.5 left-0 w-full"
        style={{ filter: `url(#${filterId}) drop-shadow(0 1px 2px rgba(0,0,0,0.08)) drop-shadow(0 4px 10px rgba(0,0,0,0.06))`, scaleY: thin }}>
        <motion.span className="absolute left-0 top-0 rounded-full bg-surface" style={{ x: left, width: height, height }} />
        <motion.span className="absolute left-0 top-0 w-px origin-left bg-surface" style={{ x: midX, scaleX: midScale, height }} />
        <motion.span className="absolute left-0 top-0 rounded-full bg-surface" style={{ x: capX, width: height, height }} />
      </motion.span>
      {tabs.map((tab, i) => {
        const active = i === index
        return (
          <motion.button key={tab.id} ref={(el) => { tabRefs.current[i] = el }} type="button" role="tab" aria-selected={active} tabIndex={active ? 0 : -1}
            onClick={() => select(tab.id)} whileTap={{ scale: 0.96 }}
            className={`relative z-10 inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 text-[14px] font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-brand sm:px-5 ${active ? 'text-fg' : 'text-slate-500 hover:text-fg'}`}>
            {tab.label}
          </motion.button>
        )
      })}
    </div>
  )
}
