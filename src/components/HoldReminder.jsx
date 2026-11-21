import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ClockIcon, CloseIcon } from './Icons'
import { useMyBookings } from '../lib/bookings'
import { useNow, holdOf, HOUR, short } from '../lib/countdown'

/* Floating nudge, shown on any page when an unpaid booking has less than 24 hours left.
   Dismiss it and it stays away for that booking until the next visit (sessionStorage). */
const KEY = 'ncc-hold-dismissed'
const read = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || '[]') } catch { return [] } }

export default function HoldReminder() {
  const { bookings } = useMyBookings()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const now = useNow()
  const [gone, setGone] = useState(read)

  const urgent = useMemo(() => bookings
    .map((b) => ({ b, h: holdOf(b, now) }))
    .filter(({ b, h }) => h && !h.paid && !h.review && h.left > 0 && h.left <= 24 * HOUR && !gone.includes(b.id))
    .sort((x, y) => x.h.left - y.h.left)[0], [bookings, now, gone])

  const hidden = ['/my-bookings', '/booking', '/admin', '/login', '/signup'].includes(pathname) || pathname.startsWith('/billing/')
  const close = () => { const next = [...gone, urgent.b.id]; setGone(next); try { sessionStorage.setItem(KEY, JSON.stringify(next)) } catch {} }

  return (
    <AnimatePresence>
      {urgent && !hidden && (
        <motion.div key={urgent.b.id} role="alert" initial={{ opacity: 0, y: -14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="fixed right-3 top-[4.75rem] z-[58] w-[calc(100vw-1.5rem)] max-w-sm rounded-2xl bg-surface p-3.5 shadow-dock ring-1 ring-orange-300 dark:ring-orange-400/50">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white motion-safe:animate-pulse"><ClockIcon width={18} height={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-fg">Payment due — <span className="tabular-nums">{short(urgent.h.left)}</span> left</p>
              <p className="mt-0.5 text-xs text-slate-500">Booking <span className="tabular-nums">{urgent.b.id}</span> is cancelled automatically if the advance is not paid.</p>
              <button onClick={() => navigate(`/billing/${urgent.b.id}`)} className="mt-2 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-dark active:scale-95">Pay now</button>
            </div>
            <button onClick={close} aria-label="Dismiss reminder" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-fg"><CloseIcon width={14} height={14} /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
