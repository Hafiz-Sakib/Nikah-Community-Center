import { useState } from 'react'
import Modal from './Modal'
import StatusPill from './StatusPill'
import { useBookings, updateBooking, removeBooking, SHIFTS, money, fmtDate, toast } from '../lib/store'
import { CONTACT, packages } from '../data'
import { DownloadIcon } from './Icons'

const FILTERS = ['all', 'pending', 'confirmed', 'cancelled']

function csv(rows) {
  const head = ['ID', 'Status', 'Event', 'Package', 'Date', 'Shift', 'Guests', 'Name', 'Phone', 'Email', 'Total', 'Advance']
  const body = rows.map((b) => [b.id, b.status, b.eventType, b.packageId, b.date, b.shift, b.guests, b.name, b.phone, b.email, b.total, b.advance].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv' })); a.download = 'bookings.csv'; a.click()
}

export default function Admin({ open, onClose }) {
  const all = useBookings()
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('ncc.admin') === '1')
  const [pass, setPass] = useState('')
  const [filter, setFilter] = useState('all')
  const login = (e) => { e.preventDefault(); if (pass === CONTACT.adminPass) { sessionStorage.setItem('ncc.admin', '1'); setAuthed(true); setPass('') } else toast('Wrong passcode', 'error') }
  const list = all.filter((b) => filter === 'all' || b.status === filter).sort((a, b) => a.date.localeCompare(b.date))
  const pending = all.filter((b) => b.status === 'pending').length
  const revenue = all.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.total, 0)

  return (
    <Modal open={open} onClose={onClose} title="Staff dashboard" wide>
      {!authed ? (
        <form onSubmit={login} className="mx-auto max-w-sm space-y-4 py-6 text-center">
          <p className="text-sm text-slate-500">Enter the staff passcode to manage bookings.</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passcode" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
          <button className="btn-primary w-full">Sign in</button>
          <p className="text-xs text-slate-400">Demo only — this check runs in the browser and is not secure. Use a real backend before going live.</p>
        </form>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-3 gap-3 text-center">
            {[['Total', all.length], ['Pending', pending], ['Confirmed revenue', money(revenue)]].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-slate-50 p-3"><p className="text-lg font-semibold text-ink sm:text-2xl">{v}</p><p className="text-[11px] text-slate-500 sm:text-xs">{k}</p></div>
            ))}
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">{FILTERS.map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition ${filter === f ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>)}</div>
            <button onClick={() => csv(list)} disabled={!list.length} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-ink hover:bg-slate-200 disabled:opacity-40"><DownloadIcon width={16} height={16} />Export CSV</button>
          </div>
          {list.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No bookings here yet.</p> : (
            <ul className="space-y-3">
              {list.map((b) => (
                <li key={b.id} className="rounded-2xl p-4 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><p className="font-semibold text-ink">{b.name} <span className="font-normal text-slate-400">· {b.phone}</span></p>
                      <p className="text-sm text-slate-600">{b.eventType} · {fmtDate(b.date)} · {SHIFTS.find((s) => s.id === b.shift).label} · {b.guests} guests</p>
                      <p className="text-xs text-slate-400">{b.id} · {packages.find((p) => p.id === b.packageId)?.name} · {money(b.total)} (advance {money(b.advance)})</p></div>
                    <StatusPill status={b.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium">
                    {b.status !== 'confirmed' && <button onClick={() => { updateBooking(b.id, { status: 'confirmed' }); toast('Booking confirmed') }} className="rounded-full bg-emerald-500 px-3.5 py-1.5 text-white">Confirm</button>}
                    {b.status !== 'cancelled' && <button onClick={() => { updateBooking(b.id, { status: 'cancelled' }); toast('Booking cancelled') }} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-slate-700">Cancel</button>}
                    <a href={`tel:${b.phone}`} className="rounded-full bg-brand-soft px-3.5 py-1.5 text-brand-dark">Call</a>
                    <button onClick={() => { if (confirm('Delete permanently?')) removeBooking(b.id) }} className="rounded-full px-3.5 py-1.5 text-red-500 hover:bg-red-50">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  )
}
