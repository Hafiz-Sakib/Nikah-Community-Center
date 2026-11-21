import { useSyncExternalStore } from 'react'

/* One shared 1-second clock for every timer on the page (20 booking cards = still 1 interval). */
let now = Date.now()
let timer = null
const subs = new Set()
const tick = () => { now = Date.now(); subs.forEach((f) => f()) }
const subscribe = (f) => {
  subs.add(f)
  if (!timer) { now = Date.now(); timer = setInterval(tick, 1000) }
  return () => { subs.delete(f); if (!subs.size) { clearInterval(timer); timer = null } }
}
export const useNow = () => useSyncExternalStore(subscribe, () => now, () => now)

export const HOUR = 3_600_000
export const DAY = 24 * HOUR
export const pad = (n) => String(n).padStart(2, '0')

/* ms -> { d, h, m, s } */
export function parts(ms) {
  const t = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 }
}
/* "2d 4h" / "5h 12m" / "12m 05s" — short text for chips and toasts */
export function short(ms) {
  const { d, h, m, s } = parts(ms)
  if (d) return `${d}d ${h}h`
  if (h) return `${h}h ${pad(m)}m`
  return `${m}m ${pad(s)}s`
}

/* Event window in Bangladesh time (UTC+6), whatever timezone the visitor's device is in. */
const SHIFT_TIME = { morning: ['10:00', '15:00'], evening: ['17:00', '22:30'], full: ['10:00', '22:30'] }
export function eventWindow(b) {
  const [a, z] = SHIFT_TIME[b.shift] ?? SHIFT_TIME.full
  return { start: new Date(`${b.date}T${a}:00+06:00`).getTime(), end: new Date(`${b.date}T${z}:00+06:00`).getTime() }
}

/* Run a refresh at most once per window, so ten cards hitting zero together cause one request. */
let lastSweep = 0
export function sweepOnce(fn, gap = 20_000) {
  if (Date.now() - lastSweep < gap) return
  lastSweep = Date.now()
  fn()
}

/* Payment hold of a pending booking. Mirrors the server rule: auto-cancel only when nothing is paid
   and no payment is waiting for staff to verify. */
export function holdOf(b, nowMs) {
  if (!b || b.status !== 'pending' || !b.holdExpiresAt) return null
  const end = new Date(b.holdExpiresAt).getTime()
  const windowMs = (b.holdHours ?? 72) * HOUR
  const left = end - nowMs
  const review = !!b.payments?.some((p) => p.status === 'pending')
  const paid = (b.paidAmount ?? 0) > 0
  const level = left <= 0 ? 'over' : left <= 6 * HOUR ? 'critical' : left <= 24 * HOUR ? 'urgent' : 'calm'
  return { end, left, windowMs, review, paid, level, days: Math.round(windowMs / DAY), progress: Math.min(1, Math.max(0, left / windowMs)) }
}
