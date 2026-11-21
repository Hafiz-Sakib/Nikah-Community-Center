import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import PageHero from './PageHero'
import StatusPill from './StatusPill'
import EditBooking from './EditBooking'
import InvoiceView from './InvoiceView'
import { SHIFTS, money, fmtDate, toast } from '../lib/store'
import { packages } from '../data'
import { api } from '../lib/api'
import { useAvailability } from '../lib/useAvailability'
import { DownloadIcon, CloseIcon } from './Icons'

const FILTERS = ['all', 'pending', 'confirmed', 'cancelled', 'expired', 'completed']
const METHODS = ['office', 'bkash', 'nagad', 'bank', 'card']
const PAGE = 20

function csv(rows) {
  const head = ['ID', 'Status', 'Event', 'Package', 'Date', 'Shift', 'Guests', 'Name', 'Phone', 'Email', 'Total', 'Advance', 'Paid']
  const body = rows.map((b) => [b.id, b.status, b.eventType, b.packageId, b.date, b.shift, b.guests, b.name, b.phone, b.email, b.total, b.advance, b.paidAmount].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv' })); a.download = 'bookings.csv'; a.click()
}

function PaymentsPanel({ b, onChanged }) {
  const [amount, setAmount] = useState(Math.max(0, b.total - b.paidAmount))
  const [method, setMethod] = useState('office')
  const [ref, setRef] = useState('')
  const [busy, setBusy] = useState(false)
  const run = async (fn, msg) => { setBusy(true); try { await fn(); toast(msg); onChanged() } catch (e) { toast(e.message, 'error') } finally { setBusy(false) } }
  const review = (id, status) => run(() => api(`/admin/payments/${id}`, { method: 'PATCH', body: { status } }), `Payment ${status}`)
  const add = () => run(() => api(`/admin/bookings/${b.id}/payments`, { method: 'POST', body: { amount: +amount, method, ...(ref.trim() ? { reference: ref.trim() } : {}) } }), 'Payment recorded')
  const inp = 'rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-brand'
  return (
    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm">
      {b.payments?.length ? (
        <ul className="divide-y divide-slate-200">
          {b.payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2 py-2">
              <span className="min-w-0 flex-1"><b className="capitalize text-fg">{p.method}</b> {money(p.amount)}{p.reference && <span className="font-mono text-xs text-slate-500"> · {p.reference}</span>}</span>
              <StatusPill status={p.status} />
              {p.status !== 'verified' && <button disabled={busy} onClick={() => review(p.id, 'verified')} className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60">Verify</button>}
              {p.status === 'pending' && <button disabled={busy} onClick={() => review(p.id, 'rejected')} className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 disabled:opacity-60">Reject</button>}
            </li>
          ))}
        </ul>
      ) : <p className="text-xs text-slate-500">No payments yet.</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
        <span className="text-xs font-semibold text-slate-500">Record payment</span>
        <input className={`${inp} w-28`} type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount" />
        <select className={inp} value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Method">{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
        <input className={`${inp} w-36`} placeholder="Reference" value={ref} onChange={(e) => setRef(e.target.value)} />
        <button disabled={busy || !(+amount > 0)} onClick={add} className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">Add (verified)</button>
      </div>
    </div>
  )
}

export default function Admin() {
  const { map, reload: reloadMap } = useAvailability()
  const [stats, setStats] = useState(null)
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(null)       // booking id whose payments panel is open
  const [edit, setEdit] = useState(null)       // booking | 'new'
  const [inv, setInv] = useState(null)

  useEffect(() => { const t = setTimeout(() => { setQ(qInput); setPage(1) }, 350); return () => clearTimeout(t) }, [qInput])

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page), pageSize: String(PAGE) })
    if (filter !== 'all') p.set('status', filter)
    if (q) p.set('q', q)
    if (from) p.set('from', from)
    if (to) p.set('to', to)
    try {
      const [list, st] = await Promise.all([api(`/admin/bookings?${p}`), api('/admin/stats')])
      setData(list); setStats(st)
    } catch (e) { toast(e.message, 'error') } finally { setLoading(false) }
  }, [page, filter, q, from, to])
  useEffect(() => { load() }, [load])

  const changed = () => { load(); reloadMap() }
  const act = async (fn, msg) => { try { await fn(); toast(msg); changed() } catch (e) { toast(e.message, 'error') } }
  const setStatus = (b, status) => act(() => api(`/admin/bookings/${b.id}`, { method: 'PATCH', body: { status } }), `Booking ${status}`)
  const remove = (b) => { if (confirm(`Delete ${b.id} permanently? Its payments are deleted too.`)) act(() => api(`/admin/bookings/${b.id}`, { method: 'DELETE' }), 'Booking deleted') }
  const openInvoice = (b) => setInv({ ...b, invoiceNo: 'INV-' + b.id.replace(/^NCC-/, '') })   // list rows already carry snapshot + payments
  const pages = Math.max(1, Math.ceil(data.total / PAGE))
  const pill = (on) => `rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition ${on ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`

  return (
    <>
      <PageHero title="Staff dashboard" text="Manage bookings and payments." image="hero-14.webp" />
      <section className="py-12 sm:py-16"><div className="container-x max-w-4xl"><div className="rounded-[2rem] bg-surface p-5 shadow-dock ring-1 ring-slate-100 sm:p-8">
        <div className="mb-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          {[['Total', stats?.total ?? '–'], ['Pending', stats?.pending ?? '–'], ['Confirmed revenue', stats ? money(stats.revenue) : '–'], ['Upcoming 30 days', stats?.upcoming ?? '–']].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-slate-50 p-3"><p className="text-lg font-semibold text-fg sm:text-2xl">{v}</p><p className="text-[11px] text-slate-500 sm:text-xs">{k}</p></div>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">{FILTERS.map((f) => <button key={f} onClick={() => { setFilter(f); setPage(1) }} className={pill(filter === f)}>{f}</button>)}</div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Search code, name or phone" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} aria-label="From date" className="rounded-full border border-slate-200 bg-surface px-3 py-2 text-sm" />
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} aria-label="To date" className="rounded-full border border-slate-200 bg-surface px-3 py-2 text-sm" />
          <button onClick={() => csv(data.items)} disabled={!data.items.length} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-fg hover:bg-slate-200 disabled:opacity-40"><DownloadIcon width={16} height={16} />CSV</button>
          <button onClick={() => setEdit('new')} className="btn-primary !py-2.5">+ Walk-in booking</button>
        </div>

        {loading && !data.items.length ? <p className="py-10 text-center text-sm text-slate-500">Loading…</p>
        : data.items.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No bookings match.</p> : (
          <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((b) => (
              <li key={b.id} className="rounded-2xl p-4 ring-1 ring-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="font-semibold text-fg">{b.name} <span className="font-normal text-slate-400">· {b.phone}</span></p>
                    <p className="text-sm text-slate-600">{b.eventType} · {fmtDate(b.date)} · {SHIFTS.find((s) => s.id === b.shift)?.label} · {b.guests} guests</p>
                    <p className="text-xs text-slate-400">{b.id} · {packages.find((p) => p.id === b.packageId)?.name} · {money(b.total)} (advance {money(b.advance)}) · paid {money(b.paidAmount)}{b.payments?.some((p) => p.status === 'pending') && <b className="text-amber-600"> · payment to verify</b>}</p></div>
                  <StatusPill status={b.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium">
                  {b.status !== 'confirmed' && <button onClick={() => setStatus(b, 'confirmed')} className="rounded-full bg-emerald-500 px-3.5 py-1.5 text-white">Confirm</button>}
                  {b.status !== 'cancelled' && <button onClick={() => setStatus(b, 'cancelled')} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-slate-700">Cancel</button>}
                  <button onClick={() => setEdit(b)} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-slate-700">Edit</button>
                  <button onClick={() => setOpen(open === b.id ? null : b.id)} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-slate-700">Payments ({b.payments?.length ?? 0})</button>
                  <button onClick={() => openInvoice(b)} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-slate-700">Invoice</button>
                  <a href={`tel:${b.phone}`} className="rounded-full bg-brand-soft px-3.5 py-1.5 text-brand-ink">Call</a>
                  <button onClick={() => remove(b)} className="rounded-full px-3.5 py-1.5 text-red-500 hover:bg-red-50">Delete</button>
                </div>
                {open === b.id && <PaymentsPanel b={b} onChanged={changed} />}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>{data.total} booking{data.total === 1 ? '' : 's'}</span>
          <span className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-full bg-slate-100 px-3.5 py-1.5 font-medium text-slate-700 disabled:opacity-40">Prev</button>
            <span>Page {page} / {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-full bg-slate-100 px-3.5 py-1.5 font-medium text-slate-700 disabled:opacity-40">Next</button>
          </span>
        </div>

        <AnimatePresence>
          {edit && <EditBooking key={edit === 'new' ? 'new' : edit.id} booking={edit === 'new' ? null : edit} admin map={map} onClose={() => setEdit(null)} onSaved={changed} />}
          {inv && (
            <motion.div key="inv" className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto bg-black/70 p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInv(null)}>
              <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 30 }} animate={{ y: 0 }} className="relative mt-14 w-full max-w-[860px] rounded-3xl bg-surface p-3 sm:p-5">
                <button onClick={() => setInv(null)} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-fg"><CloseIcon /></button>
                <p className="mb-3 pr-12 text-lg font-semibold text-fg">Invoice {inv.invoiceNo}</p>
                <InvoiceView b={inv} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div></div></section>
    </>
  )
}
