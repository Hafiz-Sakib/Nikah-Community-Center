import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { packages, addons, eventTypes, foodPkgs, packagesFor, defaultPackageFor, capOf, HALL_CAP } from '../data'
import { moneyOf } from '../lib/invoice'
import { takenSlots, shiftFree, SHIFTS, quote, money, fmtDate, toast } from '../lib/store'
import { api } from '../lib/api'
import Calendar from './Calendar'
import { CloseIcon } from './Icons'
import Button from './brew/Button'
import Modal from './Modal'

const phoneOk = (p) => /^(?:\+?88)?01[3-9]\d{8}$/.test(p.replace(/[\s-]/g, ''))
const inp = 'w-full rounded-xl border border-slate-300 bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brand focus:ring-4 focus:ring-brand/15'
const lab = 'mb-1 block text-xs font-medium text-slate-500'

/* Edit an existing booking (user: PATCH /bookings/:id, admin: PATCH /admin/bookings/:id) or,
   with no `booking`, create a walk-in booking as admin (POST /admin/bookings). The server re-prices and re-checks the slot. */
export default function EditBooking({ booking, map, admin = false, onClose, onSaved }) {
  const create = !booking
  const [f, setF] = useState(() => booking ? {
    eventType: booking.eventType, packageId: booking.packageId, date: booking.date, shift: booking.shift, guests: booking.guests,
    addons: booking.addons || [], catering: booking.catering, menu: booking.menu || booking.packageId,
    name: booking.name, phone: booking.phone, email: booking.email || '', notes: booking.notes || '', status: booking.status,
  } : { eventType: 'Wedding', packageId: 'wedding-plus', date: '', shift: '', guests: 200, addons: [], catering: 'own', menu: 'wedding-plus', name: '', phone: '', email: '', notes: '', status: 'pending' })
  const [busy, setBusy] = useState(false)
  const set = (p) => setF((x) => ({ ...x, ...p }))
  const pkg = packages.find((p) => p.id === f.packageId)
  const cap = capOf(pkg)
  const pkgOptions = packagesFor(f.eventType)
  // a legacy booking may sit on a package that no longer fits its event: keep it selectable so it can still be viewed
  const pkgList = pkgOptions.some((p) => p.id === f.packageId) ? pkgOptions : [pkg, ...pkgOptions]
  const pickEvent = (t) => setF((x) => { const ok = packagesFor(t); const next = ok.find((p) => p.id === x.packageId) ?? defaultPackageFor(t); return { ...x, eventType: t, packageId: next.id, guests: Math.min(+x.guests || 20, capOf(next)) } })

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
      toast(create ? 'Walk-in booking created. Record the advance payment to confirm it.' : 'Booking updated'); onSaved?.(out); onClose()
    } catch (e) { toast(e.message, 'error'); if (e.status === 409) set({ shift: '' }); onSaved?.(null, true) }
    finally { setBusy(false) }
  }

  const reconfirm = !create && !admin && booking.status === 'confirmed' && (f.date !== booking.date || f.shift !== booking.shift || f.packageId !== booking.packageId)

  return (
    <Modal size="lg" title={create ? 'New walk-in booking' : `Edit ${booking.id}`} onClose={onClose}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label><span className={lab}>Event</span><select className={inp} value={f.eventType} onChange={(e) => pickEvent(e.target.value)}>{eventTypes.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label><span className={lab}>Package</span><select className={inp} value={f.packageId} onChange={(e) => { const np = packages.find((p) => p.id === e.target.value); set({ packageId: np.id, guests: Math.min(+f.guests || 20, capOf(np)) }) }}>{pkgList.map((p) => <option key={p.id} value={p.id}>{p.name} · {money(p.price)}</option>)}</select></label>
          <label><span className={lab}>Guests (20–{cap.toLocaleString('en-IN')})</span><input className={inp} type="number" min={20} max={cap} value={f.guests} onChange={(e) => set({ guests: e.target.value })} /></label>
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
                    className={`flex w-full items-center justify-between rounded-xl p-3 text-left ring-1 transition ${f.shift === s.id ? 'bg-brand-soft ring-2 ring-brand' : 'bg-surface ring-slate-300 enabled:hover:ring-brand/60'} disabled:cursor-not-allowed disabled:opacity-50`}>
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
            <div className="flex gap-2">{[['own', 'Own caterer'], ['hall', 'Hall catering']].map(([id, l]) => <button key={id} type="button" aria-pressed={f.catering === id} onClick={() => set({ catering: id, ...(id === 'hall' && !foodPkgs.some((m) => m.id === f.menu) ? { menu: (foodPkgs.find((m) => m.id === f.packageId) ?? foodPkgs[0]).id } : {}) })} className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ring-1 ${f.catering === id ? 'bg-brand-soft ring-2 ring-brand text-brand-ink' : 'ring-slate-300 text-slate-700'}`}>{l}</button>)}</div>
            <AnimatePresence initial={false}>{f.catering === 'hall' && <motion.select initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${inp} mt-2`} value={f.menu} onChange={(e) => set({ menu: e.target.value })}>{foodPkgs.map((m) => <option key={m.id} value={m.id}>{m.name} menu · {money(m.price)}/guest</option>)}</motion.select>}</AnimatePresence>
          </div>
          <div>
            <span className={lab}>Extras</span>
            <div className="flex flex-wrap gap-2">{addons.filter((a) => a.id !== 'catering').map((a) => { const on = f.addons.includes(a.id); return <button key={a.id} type="button" aria-pressed={on} onClick={() => set({ addons: on ? f.addons.filter((x) => x !== a.id) : [...f.addons, a.id] })} className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${on ? 'bg-brand text-white ring-brand' : 'ring-slate-300 text-slate-700'}`}>{a.label.split(' ')[0]} · {money(a.price)}</button> })}</div>
          </div>
          <label><span className={lab}>Name</span><input className={inp} value={f.name} onChange={(e) => set({ name: e.target.value })} /></label>
          <label><span className={lab}>Mobile</span><input className={inp} value={f.phone} inputMode="tel" onChange={(e) => set({ phone: e.target.value })} /></label>
          <label><span className={lab}>Email</span><input className={inp} value={f.email} inputMode="email" onChange={(e) => set({ email: e.target.value })} /></label>
          {admin && !create && <label><span className={lab}>Status</span><select className={inp} value={f.status} disabled={['cancelled', 'expired', 'completed'].includes(booking.status)} onChange={(e) => set({ status: e.target.value })}>{(['pending', 'confirmed'].includes(booking.status) ? [booking.status, 'cancelled'] : [booking.status]).map((s) => <option key={s}>{s}</option>)}</select><span className="mt-1 block text-xs text-slate-500">{booking.status === 'pending' ? 'Confirmed automatically once the advance payment is verified.' : ['cancelled', 'expired'].includes(booking.status) ? 'A cancelled booking cannot be re-opened. Make a new booking.' : ''}</span></label>}
          <label className="sm:col-span-2"><span className={lab}>Notes</span><textarea className={inp} rows={2} maxLength={500} value={f.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <div className="min-w-0"><p className="text-sm text-slate-500">New total <b className="text-fg">{money(q.total)}</b> · advance {money(q.advance)} <span className="text-xs">(final price is set by the server)</span></p>{!create && !admin && (() => { const pd = moneyOf(booking).paid; if (!pd) return null; const d = q.total - pd; return <p className={`mt-0.5 text-xs font-semibold ${d < 0 ? 'text-amber-700 dark:text-amber-300' : d > 0 ? 'text-brand-ink' : 'text-emerald-600 dark:text-emerald-300'}`}>{d > 0 ? `You have paid ${money(pd)} · balance after this change ${money(d)}` : d < 0 ? `You have paid ${money(pd)} · refund due ${money(-d)} after this change` : `You have paid ${money(pd)} · fully covered`}</p> })()}</div>
          <div className="flex gap-2"><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={save} disabled={busy}>{busy ? 'Saving…' : create ? 'Create booking' : 'Save changes'}</Button></div>
        </div>
    </Modal>
  )
}
