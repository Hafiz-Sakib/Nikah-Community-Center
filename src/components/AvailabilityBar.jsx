import { useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { eventTypes } from '../data'
import { tomorrowISO, takenSlots, useBookings, toast } from '../lib/store'
import { CalendarIcon, UsersIcon, ArrowRight } from './Icons'

const f = 'w-full bg-transparent text-sm font-medium text-fg outline-none'
export default function AvailabilityBar() {
  const navigate = useNavigate()
  const bookings = useBookings()
  const [v, setV] = useState({ eventType: 'Wedding', date: '', guests: 200 })
  const submit = (e) => {
    e.preventDefault()
    if (v.date) {
      const t = takenSlots(v.date, bookings)
      if (t.morning && t.evening) { toast('That date is fully booked — try another', 'error'); return }
    }
    const qs = new URLSearchParams({ event: v.eventType, guests: String(Math.max(20, Math.min(600, +v.guests || 200))), ...(v.date ? { date: v.date } : {}) })
    navigate(`/booking?${qs}`)
  }
  return (
    <div className="container-x relative z-10 -mt-14">
      <motion.form onSubmit={submit} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 18 }}
        className="grid gap-2 rounded-[1.75rem] bg-surface p-3 shadow-dock ring-1 ring-slate-100 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="rounded-2xl bg-slate-50 px-4 py-2.5"><span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">Event</span>
          <select className={f} value={v.eventType} onChange={(e) => setV({ ...v, eventType: e.target.value })}>{eventTypes.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="rounded-2xl bg-slate-50 px-4 py-2.5"><span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400"><CalendarIcon width={12} height={12} />Date</span>
          <input type="date" min={tomorrowISO()} className={f} value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} /></label>
        <label className="rounded-2xl bg-slate-50 px-4 py-2.5"><span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400"><UsersIcon width={12} height={12} />Guests</span>
          <input type="number" min={20} max={600} className={f} value={v.guests} onChange={(e) => setV({ ...v, guests: e.target.value })} /></label>
        <button className="btn-primary sm:col-span-2 lg:col-span-1">Check availability <ArrowRight /></button>
      </motion.form>
    </div>
  )
}
