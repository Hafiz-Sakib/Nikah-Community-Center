import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { ClockIcon, ArrowRight, CheckCircle } from './Icons'
import Button from './brew/Button'
import { useNow, holdOf, parts, pad, short, sweepOnce } from '../lib/countdown'

/* Pay-within-48-hours warning. The server cancels an unpaid pending booking when its hold runs out;
   these pieces make that deadline visible and get the screen to refresh the moment it passes. */
const LOOK = {
  calm:     { box: 'bg-amber-50 ring-amber-300 text-amber-900', bar: 'bg-amber-500', icon: 'bg-amber-500', title: 'Pay the advance to keep your date' },
  urgent:   { box: 'bg-orange-50 ring-orange-300 text-orange-900', bar: 'bg-orange-500', icon: 'bg-orange-500', title: 'Less than 24 hours left to pay' },
  critical: { box: 'bg-red-50 ring-red-300 text-red-900', bar: 'bg-red-500', icon: 'bg-red-500', title: 'Last hours — pay now or the date is released' },
  over:     { box: 'bg-red-50 ring-red-300 text-red-900', bar: 'bg-red-500', icon: 'bg-red-500', title: 'Time is up — releasing the date…' },
}
const DARK = 'dark:!bg-white/5 dark:!text-fg dark:!ring-white/15'

/* fires onExpire (once per 20 s across the whole page) after the deadline passes, so the list reloads and shows "expired" */
function useExpiry(h, onExpire) {
  const done = useRef(false)
  useEffect(() => {
    if (!h || h.left > 0 || h.review || h.paid || done.current || !onExpire) return
    done.current = true
    const t = setTimeout(() => sweepOnce(onExpire), 1500)
    return () => clearTimeout(t)
  }, [h?.left <= 0, h?.review, h?.paid]) // eslint-disable-line
  useEffect(() => { if (h && h.left > 0) done.current = false }, [h?.end]) // eslint-disable-line
}

function Clock({ left }) {
  const { d, h, m, s } = parts(left)
  const unit = (v, u, show = true) => show && <span className="inline-flex items-baseline"><b className="text-lg tabular-nums sm:text-xl">{u === 'd' ? v : pad(v)}</b><span className="ml-0.5 mr-1.5 text-[11px] font-semibold uppercase opacity-70">{u}</span></span>
  return <span role="timer" aria-label={`Time left to pay: ${d} days ${h} hours ${m} minutes`} className="inline-flex flex-wrap items-baseline">{unit(d, 'd', d > 0)}{unit(h, 'h')}{unit(m, 'm')}{unit(s, 's')}</span>
}

/* Full banner: My bookings card and the booking confirmation screen */
export function HoldWarning({ b, onPay, onExpire, hideCta = false, className = '' }) {
  const now = useNow()
  const h = holdOf(b, now)
  useExpiry(h, onExpire)
  if (!h || h.paid) return null

  if (h.review) {
    return (
      <div className={`mt-3 flex items-start gap-3 rounded-2xl bg-sky-50 p-3.5 text-sm text-sky-900 ring-1 ring-sky-300 ${DARK} ${className}`}>
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white"><CheckCircle width={18} height={18} /></span>
        <p><b>Payment submitted.</b> It counts as paid for now and the 48-hour timer is paused while our team verifies it. Your booking confirms as soon as it is verified.</p>
      </div>
    )
  }

  const look = LOOK[h.level]
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role={h.level === 'calm' ? 'status' : 'alert'}
      className={`mt-3 rounded-2xl p-3.5 ring-1 ${look.box} ${DARK} ${className}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${look.icon} ${h.level === 'critical' ? 'motion-safe:animate-pulse' : ''}`}><ClockIcon width={18} height={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{look.title}</p>
          <div className="mt-0.5 text-fg"><Clock left={Math.max(0, h.left)} /></div>
          <p className="mt-1 text-xs opacity-80">Unpaid bookings are cancelled automatically after {h.hours} hours and the date goes back on sale.</p>
        </div>
        {!hideCta && onPay && h.level !== 'over' && <Button size="sm" onClick={onPay} className="hidden sm:inline-flex">Pay now<ArrowRight width={14} height={14} /></Button>}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10" aria-hidden>
        <motion.div className={`h-full rounded-full ${look.bar}`} initial={false} animate={{ width: `${h.progress * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
      {!hideCta && onPay && h.level !== 'over' && <Button size="sm" onClick={onPay} className="mt-3 w-full sm:hidden">Pay now<ArrowRight width={14} height={14} /></Button>}
    </motion.div>
  )
}

/* Tiny chip: staff dashboard */
export function HoldChip({ b, onExpire, className = '' }) {
  const now = useNow()
  const h = holdOf(b, now)
  useExpiry(h, onExpire)
  if (!h || h.paid) return null
  const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset dark:!bg-white/10 dark:!text-fg dark:!ring-white/20'
  if (h.review) return <span className={`${base} bg-sky-100 text-sky-800 ring-sky-300 ${className}`}>Timer paused · payment to verify</span>
  const tone = { calm: 'bg-amber-100 text-amber-800 ring-amber-300', urgent: 'bg-orange-100 text-orange-800 ring-orange-300', critical: 'bg-red-100 text-red-700 ring-red-300', over: 'bg-red-100 text-red-700 ring-red-300' }[h.level]
  return (
    <span title="Unpaid booking: cancelled automatically when this runs out" className={`${base} ${tone} ${className}`}>
      <ClockIcon width={13} height={13} className={h.level === 'critical' ? 'motion-safe:animate-pulse' : ''} />
      {h.level === 'over' ? 'Cancelling…' : <>Auto-cancel in <span className="tabular-nums">{short(h.left)}</span></>}
    </span>
  )
}

/* "2d 23h 59m" text for the dark billing card */
export function useHoldText(b) {
  const now = useNow()
  const h = holdOf(b, now)
  if (!h) return null
  const { d, h: hh, m, s } = parts(Math.max(0, h.left))
  return d ? `${d}d ${pad(hh)}h ${pad(m)}m` : `${pad(hh)}:${pad(m)}:${pad(s)}`
}
