import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { packages, addons, eventTypes, foodPkgs } from '../data'
import { takenSlots, shiftFree, SHIFTS, quote, money, fmtDate, toast } from '../lib/store'
import { api } from '../lib/api'
import Calendar from './Calendar'
import { CloseIcon } from './Icons'

const STATUSES = ['pending', 'confirmed', 'cancelled', 'expired', 'completed']
const phoneOk = (p) => /^(?:\+?88)?01[3-9]\d{8}$/.test(p.replace(/[\s-]/g, ''))
const inp = 'w-full rounded-xl border border-slate-200 bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brand focus:ring-4 focus:ring-brand/15'
const lab = 'mb-1 block text-xs font-medium text-slate-500'

/* Edit an existing booking (user: PATCH /bookings/:id, admin: PATCH /admin/bookings/:id) or,
   with no `booking`, create a walk-in booking as admin (POST /admin/bookings). The server re-prices and re-checks the slot. */
export default function EditBooking({ booking, map, admin = false, onClose, onSaved }) {
  const create = !booking
  const [f, setF] = useState(() => booking ? {
    eventType: booking.eventType, packageId: booking.packageId, date: booking.date, shift: booking.shift, guests: booking.guests,
    addons: booking.addons || [], catering: booking.catering, menu: booking.menu || booking.packageId,
    name: booking.name, phone: booking.phone, email: booking.email || '', notes: booking.notes || '', status: booking.status,
  } : { eventType: 'Wedding', packageId: 'wedding-plus', date: '', shift: '', guests: 200, addons: [], catering: 'own', menu: 'wedding-plus', name: '', phone: '', email: '', notes: '', status: 'confirmed' })
  const [busy, setBusy] = useState(false)
  const set = (p) => setF((x) => ({ ...x, ...p }))
  const pkg = packages.find((p) => p.id === f.packageId)
  const cap = Math.min(600, pkg.cap)

  // the booking being edited must not block its own slot
  const taken = useMemo(() => {
    if (!f.date) return null
    const t = takenSlots(f.date, map)
    if (booking && f.date === booking.date) { if (booking.shift === 'full') { t.morning = false; t.evening = false } else t[booking.shift] = false }
    return t
  }, [f.date, map, booking])
  const menu = f.catering === 'hall' ? foodPkgs.find((m) => m.id === f.menu) : null
  const q = quote({ pkg, shift: f.shift, date: f.date, guests: Math.min(f.guests, cap), addons: f.addons, addonDefs: addons, food: menu })

  const save = async () => {
    if (!f.date || !f.shift) return toast('Pick a date and shift', 'error')
    if (f.name.trim().length < 2) return toast('Enter a name', 'error')
    if (!phoneOk(f.phone)) return toast('Enter a valid mobile number', 'error')
    setBusy(true)
    try {
      const { status, ...rest } = f
      const body = { ...rest, guests: Math.min(+f.guests || 20, cap), name: f.name.trim(), phone: f.phone.replace(/[\s-]/g, ''), email: f.email.trim(), menu: f.catering === 'hall' ? f.menu : null }
      let out
      if (create) out = await api('/admin/bookings', { method: 'POST', body })
      else if (admin) out = await api(`/admin/bookings/${booking.id}`, { method: 'PATCH', body: { ...body, status } })
      else out = await api(`/bookings/${booking.id}`, { method: 'PATCH', body })
      toast(create ? 'Booking created' : 'Booking updated'); onSaved?.(out); onClose()
    } catch (e) { toast(e.message, 'error'); if (e.status === 409) set({ shift: '' }); onSaved?.(null, true) }
    finally { setBusy(false) }
  }

  const reconfirm = !create && !admin && booking.status === 'confirmed' && (f.date !== booking.date || f.shift !== booking.shift || f.packageId !== booking.packageId)

  return (
    <motion.div className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto bg-black/70 p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} className="relative mt-14 w-full max-w-3xl rounded-3xl bg-surface p-4 sm:p-6">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-fg"><CloseIcon /></button>
        <p className="mb-4 pr-12 text-lg font-semibold text-fg">{create ? 'New walk-in booking' : `Edit ${booking.id}`}</p>

        <div className="grid gap-4 sm:grid-cols-3">
          <label><span className={lab}>Event</span><select className={inp} value={f.eventType} onChange={(e) => set({ eventType: e.target.value })}>{eventTypes.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label><span className={lab}>Package</span><select className={inp} value={f.packageId} onChange={(e) => set({ packageId: e.target.value })}>{packages.map((p) => <option key={p.id} value={p.id}>{p.name} · {money(p.price)}</option>)}</select></label>
          <label><span className={lab}>Guests (20–{cap})</span><input className={inp} type="number" min={20} max={cap} value={f.guests} onChange={(e) => set({ guests: e.target.value })} /></label>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <Calendar value={f.date} onChange={(d) => set({ date: d, shift: '' })} map={map} />
          <div>
            <p className="mb-2 text-sm font-medium text-fg">{f.date ? fmtDate(f.date, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Select a date first'}</p>
            <div className="space-y-2">
              {SHIFTS.map((s) => {
                const free = taken ? shiftFree(s.id, taken) : false
                return (
                  <button key={s.id} type="button" disabled={!f.date || !free} onClick={() => set({ shift: s.id })} aria-pressed={f.shift === s.id}
                    className={`flex w-full items-center justify-between rounded-xl p-3 text-left ring-1 transition ${f.shift === s.id ? 'bg-brand-soft ring-2 ring-brand' : 'bg-surface ring-slate-200 enabled:hover:ring-brand/40'} disabled:cursor-not-allowed disabled:opacity-50`}>
                    <span><b className="block text-sm text-fg">{s.label}</b><span className="text-xs text-slate-500">{s.time}</span></span>
                    {f.date && !free && <span className="text-xs font-medium text-red-500">Booked</span>}
                  </button>
                )
              })}
            </div>
            {reconfirm && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">Changing the date, shift or package sends this booking back to “pending” for staff re-approval.</p>}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <span className={lab}>Food</span>
            <div className="flex gap-2">{[['own', 'Own caterer'], ['hall', 'Hall catering']].map(([id, l]) => <button key={id} type="button" aria-pressed={f.catering === id} onClick={() => set({ catering: id })} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ring-1 ${f.catering === id ? 'bg-brand-soft ring-2 ring-brand text-brand-ink' : 'ring-slate-200 text-slate-600'}`}>{l}</button>)}</div>
            <AnimatePresence initial={false}>{f.catering === 'hall' && <motion.select initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${inp} mt-2`} value={f.menu} onChange={(e) => set({ menu: e.target.value })}>{foodPkgs.map((m) => <option key={m.id} value={m.id}>{m.name} menu · {money(m.price)}/guest</option>)}</motion.select>}</AnimatePresence>
          </div>
          <div>
            <span className={lab}>Extras</span>
            <div className="flex flex-wrap gap-2">{addons.filter((a) => a.id !== 'catering').map((a) => { const on = f.addons.includes(a.id); return <button key={a.id} type="button" aria-pressed={on} onClick={() => set({ addons: on ? f.addons.filter((x) => x !== a.id) : [...f.addons, a.id] })} className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${on ? 'bg-brand text-white ring-brand' : 'ring-slate-200 text-slate-600'}`}>{a.label.split(' ')[0]} · {money(a.price)}</button> })}</div>
          </div>
          <label><span className={lab}>Name</span><input className={inp} value={f.name} onChange={(e) => set({ name: e.target.value })} /></label>
          <label><span className={lab}>Mobile</span><input className={inp} value={f.phone} inputMode="tel" onChange={(e) => set({ phone: e.target.value })} /></label>
          <label><span className={lab}>Email</span><input className={inp} value={f.email} inputMode="email" onChange={(e) => set({ email: e.target.value })} /></label>
          {admin && !create && <label><span className={lab}>Status</span><select className={inp} value={f.status} onChange={(e) => set({ status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>}
          <label className="sm:col-span-2"><span className={lab}>Notes</span><textarea className={inp} rows={2} maxLength={500} value={f.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">New total <b className="text-fg">{money(q.total)}</b> · advance {money(q.advance)} <span className="text-xs">(final price is set by the server)</span></p>
          <div className="flex gap-2"><button onClick={onClose} className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600">Close</button><button onClick={save} disabled={busy} className="btn-primary disabled:opacity-60">{busy ? 'Saving…' : create ? 'Create booking' : 'Save changes'}</button></div>
        </div>
      </motion.div>
    </motion.div>
  )
}
