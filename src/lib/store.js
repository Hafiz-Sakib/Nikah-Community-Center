import { useSyncExternalStore } from 'react'

/* ---------- bookings store (localStorage demo backend) ---------- */
const KEY = 'ncc.bookings.v1'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
let state = read()
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())
function subscribe(l) {
  listeners.add(l)
  const h = (e) => { if (e.key === KEY) { state = read(); l() } }
  window.addEventListener('storage', h)
  return () => { listeners.delete(l); window.removeEventListener('storage', h) }
}
const persist = (next) => { state = next; try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {} emit() }
export const useBookings = () => useSyncExternalStore(subscribe, () => state)
export const addBooking = (b) => persist([b, ...state])
export const updateBooking = (id, patch) => persist(state.map((b) => (b.id === id ? { ...b, ...patch } : b)))
export const removeBooking = (id) => persist(state.filter((b) => b.id !== id))

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
export const tomorrowISO = () => { const d = new Date(); d.setDate(d.getDate() + 1); return toISO(d) }
export const fmtDate = (s, o = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) => fromISO(s).toLocaleDateString('en-GB', o)
export const money = (n) => `৳${Math.round(n).toLocaleString('en-IN')}`

export const SHIFTS = [
  { id: 'morning', label: 'Morning', time: '10:00 AM – 3:00 PM', mult: 1 },
  { id: 'evening', label: 'Evening', time: '5:00 PM – 10:30 PM', mult: 1 },
  { id: 'full', label: 'Full Day', time: '10:00 AM – 10:30 PM', mult: 1.7 },
]

// Demo seed: some slots look pre-booked so the calendar feels real. Replace with server data in production.
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
function seed(iso) {
  const h = hash(iso)
  return { morning: h % 7 === 0 || h % 11 === 0, evening: h % 4 === 0 || h % 13 === 0 }
}
export function takenSlots(iso, bookings) {
  const t = seed(iso)
  bookings.filter((b) => b.date === iso && b.status !== 'cancelled').forEach((b) => {
    if (b.shift === 'full') { t.morning = true; t.evening = true } else t[b.shift] = true
  })
  return t
}
export const dayStatus = (iso, bookings) => {
  const t = takenSlots(iso, bookings)
  return t.morning && t.evening ? 'full' : t.morning || t.evening ? 'partial' : 'free'
}
export const shiftFree = (shift, t) => (shift === 'full' ? !t.morning && !t.evening : !t[shift])

/* ---------- pricing ---------- */
export function quote({ pkg, shift, date, guests, addons = [], addonDefs }) {
  const mult = SHIFTS.find((s) => s.id === shift)?.mult ?? 1
  const base = pkg.price * mult
  const weekend = date ? [5, 6].includes(fromISO(date).getDay()) : false // Fri & Sat
  const weekendFee = weekend ? Math.round(base * 0.15) : 0
  const lines = addons.map((id) => {
    const a = addonDefs.find((x) => x.id === id)
    return { id, label: a.label, amount: a.perGuest ? a.price * guests : a.price, note: a.perGuest ? `${guests} guests` : '' }
  })
  const total = base + weekendFee + lines.reduce((s, l) => s + l.amount, 0)
  return { base, weekend, weekendFee, lines, total, advance: Math.round(total * 0.3) }
}
export const newId = () => 'NCC-' + Math.random().toString(36).slice(2, 8).toUpperCase()
