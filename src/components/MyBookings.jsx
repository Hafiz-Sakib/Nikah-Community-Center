import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import PageHero from './PageHero'
import StatusPill from './StatusPill'
import { useBookings, updateBooking, SHIFTS, money, fmtDate, toast } from '../lib/store'
import { packages } from '../data'
import { SearchIcon } from './Icons'

export default function MyBookings() {
  const navigate = useNavigate()
  const all = useBookings()
  const [q, setQ] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const term = q.trim().toLowerCase().replace(/[\s-]/g, '')
  const list = all.filter((b) => !term || b.id.toLowerCase().replace('-', '').includes(term) || b.phone.includes(term))
  const cancel = (id) => { updateBooking(id, { status: 'cancelled' }); setConfirmId(null); toast('Booking cancelled') }

  return (
    <>
      <PageHero title="My bookings" text="Look up, review or cancel your reservations." image="hero-2.webp" />
      <section className="py-12 sm:py-16"><div className="container-x max-w-3xl"><div className="rounded-[2rem] bg-surface p-5 shadow-dock ring-1 ring-slate-100 sm:p-8">
      <div className="relative mb-5">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width={18} height={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by booking ID or mobile number" className="w-full rounded-full border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
      </div>
      {list.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-medium text-fg">{all.length ? 'No match found' : 'No bookings yet'}</p>
          <p className="mt-1 text-sm text-slate-500">{all.length ? 'Check the ID or number and try again.' : 'Reserve your first date in just a couple of minutes.'}</p>
          {!all.length && <button onClick={() => navigate('/booking')} className="btn-primary mt-5">Book now</button>}
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {list.map((b) => {
              const s = SHIFTS.find((x) => x.id === b.shift)
              const p = packages.find((x) => x.id === b.packageId)
              return (
                <motion.li key={b.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl p-4 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-semibold text-fg">{b.eventType} · {fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })}</p><p className="text-xs text-slate-500">{s.label} · {s.time}</p></div>
                    <StatusPill status={b.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                    <span className="font-mono text-xs">{b.id}</span><span>{p?.name} · {b.guests} guests</span><b className="text-fg">{money(b.total)}</b>
                  </div>
                  {b.status !== 'cancelled' && (
                    <div className="mt-3 border-t border-slate-100 pt-3 text-right">
                      {confirmId === b.id ? (
                        <span className="inline-flex items-center gap-2 text-sm"><span className="text-slate-500">Cancel this booking?</span>
                          <button onClick={() => cancel(b.id)} className="rounded-full bg-red-500 px-3 py-1.5 font-semibold text-white">Yes, cancel</button>
                          <button onClick={() => setConfirmId(null)} className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">Keep</button></span>
                      ) : <button onClick={() => setConfirmId(b.id)} className="text-sm font-medium text-red-500 hover:underline">Cancel booking</button>}
                    </div>
                  )}
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
      <p className="mt-5 text-center text-xs text-slate-400">Bookings are stored on this device in this demo.</p>
      </div></div></section>
    </>
  )
}
