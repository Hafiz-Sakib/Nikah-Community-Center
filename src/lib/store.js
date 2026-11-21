import { useSyncExternalStore } from 'react'

/* ---------- toasts ---------- */
let toasts = []
const tl = new Set()
export const useToasts = () => useSyncExternalStore((l) => { tl.add(l); return () => tl.delete(l) }, () => toasts)
export function toast(message, type = 'success') {
  const t = { id: Math.random().toString(36).slice(2), message, type }
  toasts = [...toasts, t]; tl.forEach((l) => l())
  setTimeout(() => { toasts = toasts.filter((x) => x.id !== t.id); tl.forEach((l) => l()) }, 3800)
}

/* ---------- dates & availability ---------- */
export const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const fromISO = (s) => new Date(`${s}T00:00:00`)
/* "today" is always the Bangladesh date (the server decides with Asia/Dhaka), so a visitor in another time zone sees the same cut-off. */
export const todayISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date())
export const plusDaysISO = (n, from = todayISO()) => { const d = new Date(`${from}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
export const tomorrowISO = () => plusDaysISO(1)
export const fmtDate = (s, o = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) => fromISO(s).toLocaleDateString('en-GB', o)
export const money = (n) => `৳${Math.round(n).toLocaleString('en-IN')}`

export const SHIFTS = [
  { id: 'morning', label: 'Morning', time: '10:00 AM – 3:00 PM', mult: 1 },
  { id: 'evening', label: 'Evening', time: '5:00 PM – 10:30 PM', mult: 1 },
  { id: 'full', label: 'Full Day', time: '10:00 AM – 10:30 PM', mult: 1.7 },
]

/* Availability comes from the API (see useAvailability): map = { 'YYYY-MM-DD': { morning, evening } } for booked days. */
export function takenSlots(iso, map) {
  const t = map?.[iso]
  return { morning: !!t?.morning, evening: !!t?.evening }
}
export const dayStatus = (iso, map) => {
  const t = takenSlots(iso, map)
  return t.morning && t.evening ? 'full' : t.morning || t.evening ? 'partial' : 'free'
}
export const shiftFree = (shift, t) => (shift === 'full' ? !t.morning && !t.evening : !t[shift])

/* ---------- pricing ---------- */
export function quote({ pkg, shift, date, guests, addons = [], addonDefs, food = null }) {
  const mult = SHIFTS.find((s) => s.id === shift)?.mult ?? 1
  const base = Math.round(pkg.price * mult)                     // same rounding as the server
  const weekend = date ? [5, 6].includes(fromISO(date).getDay()) : false // Fri & Sat
  const weekendFee = weekend ? Math.round(base * 0.15) : 0
  const lines = food ? [{ id: 'catering', label: `Hall catering · ${food.name} menu`, amount: food.price * guests, note: `${guests} guests × ${food.price}` }] : []
  addons.forEach((id) => {
    const a = addonDefs.find((x) => x.id === id)
    lines.push({ id, label: a.label, amount: a.perGuest ? a.price * guests : a.price, note: a.perGuest ? `${guests} guests` : '' })
  })
  const total = base + weekendFee + lines.reduce((s, l) => s + l.amount, 0)
  return { base, weekend, weekendFee, lines, total, advance: Math.round(total * 0.3) }
}
