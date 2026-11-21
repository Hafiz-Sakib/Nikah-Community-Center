import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import StatusPill from './StatusPill'
import EventTimer from './EventTimer'
import Modal from './Modal'
import { HoldChip } from './HoldTimer'
import EditBooking from './EditBooking'
import InvoiceView from './InvoiceView'
import Odometer from './Odometer'
import Button from './brew/Button'
import HoldToConfirm from './brew/HoldToConfirm'
import { PillTabs } from './brew/PillTabs'
import { SHIFTS, money, fmtDate, toast } from '../lib/store'
import { packages, img, PAYMENT } from '../data'
import PayLogo from './PayLogo'
import { moneyOf } from '../lib/invoice'
import { api } from '../lib/api'
import { useAvailability } from '../lib/useAvailability'
import { shownStatus } from '../lib/bookings'
import Avatar from './Avatar'
import { DownloadIcon, CloseIcon, SearchIcon, PlusIcon, PhoneIcon, CheckIcon, ChevronDown, ChevronLeft, ChevronRight, ClipboardIcon, CalendarIcon, WalletIcon, UsersIcon } from './Icons'

const FILTERS = ['all', 'verify', 'pending', 'confirmed', 'cancelled', 'completed']
const LABELS = { verify: 'To verify' }
const fmtWhen = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const METHODS = ['office', 'bkash', 'nagad', 'bank', 'card']
const PAGE = 20
const field = 'h-11 rounded-full border border-slate-300 bg-surface px-4 text-sm text-fg outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15'

function csv(rows) {
  const head = ['ID', 'Status', 'Event', 'Package', 'Date', 'Shift', 'Guests', 'Name', 'Phone', 'Email', 'Total', 'Advance', 'Paid']
  const body = rows.map((b) => [b.id, b.status, b.eventType, b.packageId, b.date, b.shift, b.guests, b.name, b.phone, b.email, b.total, b.advance, b.paidAmount].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([[head.join(','), ...body].join('\n')], { type: 'text/csv' })); a.download = 'bookings.csv'; a.click()
}

export function PaymentsPanel({ b, onChanged }) {
  const m = moneyOf(b)
  const closed = ['cancelled', 'expired'].includes(b.status)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('office')
  const [ref, setRef] = useState('')
  const [note, setNote] = useState('')
  const [sure, setSure] = useState(false)          // second tap: the payment is only written after this confirmation
  const [busy, setBusy] = useState(false)
  const n = Number(amount || 0)
  const amountOk = Number.isInteger(n) && n > 0 && n <= m.room
  const run = async (fn, msg) => { setBusy(true); try { await fn(); toast(msg); onChanged(); return true } catch (e) { toast(e.message, 'error'); return false } finally { setBusy(false) } }
  const review = (id, status) => run(() => api(`/admin/payments/${id}`, { method: 'PATCH', body: { status } }), `Payment ${status}`)
  const add = async () => {
    const ok = await run(() => api(`/admin/bookings/${b.id}/payments`, { method: 'POST', body: { amount: n, method, ...(ref.trim() ? { reference: ref.trim() } : {}), ...(note.trim() ? { note: note.trim() } : {}) } }), 'Payment recorded')
    if (ok) { setAmount(''); setRef(''); setNote(''); setSure(false) }
  }
  const label = (id) => PAYMENT.find((x) => x.id === id)?.label ?? id
  const inp = 'h-10 rounded-xl border border-slate-300 bg-surface px-3 text-sm text-fg outline-none focus:border-brand focus:ring-4 focus:ring-brand/15'
  const cell = (k, v, tone = 'text-fg') => <div className="min-w-0 rounded-xl bg-surface px-3 py-2 ring-1 ring-slate-200"><p className="text-[11px] text-slate-500">{k}</p><p className={`truncate text-sm font-semibold tabular-nums sm:text-base ${tone}`}>{v}</p></div>
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
      <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200 sm:p-4">
        <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-fg">Payments</p>{m.paidInFull && <StatusPill status="fully paid" />}</div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {cell('Total', money(m.total))}{cell('Received', money(m.paid), 'text-emerald-600 dark:text-emerald-300')}{cell('Waiting to verify', money(m.waiting), m.waiting ? 'text-amber-700 dark:text-amber-300' : 'text-fg')}{cell('Balance due', money(m.balance), m.balance ? 'text-fg' : 'text-emerald-600 dark:text-emerald-300')}
        </div>
        <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden><span className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (m.paid / m.total) * 100)}%` }} /><span className="h-full bg-amber-400 transition-all" style={{ width: `${Math.max(0, Math.min(100 - (m.paid / m.total) * 100, (m.waiting / m.total) * 100))}%` }} /></div>
        {m.overpaid && <p className="mt-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 ring-1 ring-red-200 dark:!bg-red-500/10 dark:!text-red-200">{m.closed ? `This booking is cancelled: refund ${money(m.refundDue)} to the customer. No more payments can be added.` : `Total is now lower than received: refund ${money(m.refundDue)} to the customer and note it. No more payments can be added.`}</p>}

        {b.payments?.length ? (
          <ul className="mt-3 divide-y divide-slate-200">
            {b.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                <PayLogo id={p.method} size="sm" />
                <span className="min-w-0 flex-1 basis-44 text-sm text-slate-600"><b className="text-fg">{label(p.method)}</b> · <b className="tabular-nums text-fg">{money(p.amount)}</b>{p.reference && <span className="ml-1 break-all tabular-nums text-xs text-slate-500">· {p.reference}</span>}<span className="block text-xs text-slate-500">{fmtWhen(p.createdAt)}{p.note ? ` · ${p.note}` : ''}</span></span>
                <StatusPill status={p.status} />
                {p.status !== 'verified' && !closed && <Button size="sm" variant="success" disabled={busy} onClick={() => review(p.id, 'verified')}><CheckIcon width={14} height={14} />Verify</Button>}
                {p.status === 'pending' && <Button size="sm" variant="danger" disabled={busy} onClick={() => review(p.id, 'rejected')}>Reject</Button>}
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-slate-500">No payments yet.</p>}

        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-sm font-semibold text-fg">Record a payment</p>
          {closed ? <p className="mt-1.5 text-sm text-slate-500">This booking is cancelled, so it cannot take payments. Any money already received is shown as a refund due.</p>
          : m.room === 0 ? <p className="mt-1.5 text-sm text-slate-500">{m.paidInFull ? 'Fully paid. Nothing left to collect.' : `Payments waiting to verify (${money(m.waiting)}) already cover the balance. Verify or reject them first.`}</p>
          : (<>
            <p className="mt-1 text-xs text-slate-500">Cash at the office or a transfer you saw arrive. It is recorded as received straight away. Up to {money(m.room)} can still be added{m.waiting > 0 ? ` (${money(m.waiting)} more is waiting to verify)` : ''}.</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button size="sm" variant="soft" onClick={() => { setAmount(String(m.room)); setSure(false) }}>Whole balance {money(m.room)}</Button>
              {m.needAdvance > 0 && <Button size="sm" variant="outline" onClick={() => { setAmount(String(m.needAdvance)); setSure(false) }}>Advance {money(m.needAdvance)}</Button>}
            </div>
            <div role="radiogroup" aria-label="Method" className="mt-2.5 flex flex-wrap gap-2">
              {METHODS.map((id) => (
                <button key={id} type="button" role="radio" aria-checked={method === id} onClick={() => { setMethod(id); setSure(false) }} className={`inline-flex h-10 items-center gap-2 rounded-full pl-1.5 pr-3.5 text-sm font-semibold ring-1 transition ${method === id ? 'bg-brand-soft text-brand-ink ring-brand' : 'bg-surface text-slate-600 ring-slate-300 hover:ring-slate-400'}`}><PayLogo id={id} size="sm" className="!h-7 !w-11 !rounded-md" />{label(id)}</button>
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap items-end gap-3">
              <label className="w-full text-xs font-medium text-slate-500 sm:w-auto">Amount (৳)<input className={`${inp} mt-1 block w-full tabular-nums sm:w-36 ${amount !== '' && !amountOk ? '!border-red-400' : ''}`} inputMode="numeric" value={amount} onChange={(e) => { setAmount(e.target.value.replace(/\D/g, '').slice(0, 9)); setSure(false) }} placeholder={`max ${m.room}`} /></label>
              <label className="w-full min-w-[8rem] flex-1 text-xs font-medium text-slate-500 sm:w-auto">Reference<input className={`${inp} mt-1 block w-full`} placeholder="Txn ID (optional)" value={ref} onChange={(e) => setRef(e.target.value)} maxLength={60} /></label>
              <label className="w-full min-w-[8rem] flex-1 text-xs font-medium text-slate-500 sm:w-auto">Note<input className={`${inp} mt-1 block w-full`} placeholder={method === 'office' ? 'e.g. Cash, received by Rafi' : 'optional'} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} /></label>
            </div>
            {amount !== '' && !amountOk && <p className="mt-1.5 text-xs text-red-600 dark:text-red-300">Enter a whole amount between ৳1 and {money(m.room)}.</p>}
            <AnimatePresence mode="wait" initial={false}>
              {!sure ? (
                <motion.div key="go" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3"><Button disabled={busy || !amountOk} onClick={() => setSure(true)}><PlusIcon width={16} height={16} />Record payment</Button></motion.div>
              ) : (
                <motion.div key="sure" role="alertdialog" aria-label="Confirm payment" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-300 dark:!bg-amber-500/10 dark:!ring-amber-400/40">
                  <p className="min-w-0 flex-1 basis-56 text-sm text-fg"><b>Received {money(n)} by {label(method)}?</b><span className="block text-xs text-slate-600">{n === m.room ? 'This clears the whole balance and marks the booking Full Paid.' : `Balance after this: ${money(m.room - n + m.waiting)}.`} It cannot be undone from here.</span></p>
                  <span className="flex w-full gap-2 sm:w-auto"><Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => setSure(false)}>Back</Button><Button size="sm" variant="success" disabled={busy} className="flex-1 sm:flex-none" onClick={add}>{busy ? 'Saving…' : 'Yes, record it'}</Button></span>
                </motion.div>
              )}
            </AnimatePresence>
          </>)}
        </div>
      </div>
    </motion.div>
  )
}

/* Cancelling is final (the date goes back on sale and the booking can never be re-opened), so it needs a deliberate press-and-hold,
   and staff are told up front how much has to be refunded. */
function CancelDialog({ b, onClose, onDone }) {
  const m = moneyOf(b)
  const [reason, setReason] = useState('')
  const go = async () => {
    try {
      await api(`/admin/bookings/${b.id}/cancel`, { method: 'POST', body: reason.trim() ? { reason: reason.trim() } : {} })
      toast(m.paid > 0 ? `Booking cancelled · refund ${money(m.paid)} to the customer` : 'Booking cancelled')
      onDone(); onClose()
    } catch (e) { toast(e.message, 'error') }
  }
  return (
    <Modal size="sm" title="Cancel this booking?" onClose={onClose}>
      <p className="text-sm text-slate-600"><b className="text-fg">{b.name}</b> · {b.eventType} · {fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })}<span className="mt-0.5 block text-xs tabular-nums text-slate-400">{b.id}</span></p>
      <p className="mt-2 text-sm text-slate-500">The date goes back on sale. A cancelled booking cannot be confirmed or re-opened.</p>

      {m.paid > 0 ? (
        <div role="status" className="mt-4 rounded-2xl bg-red-50 p-4 ring-1 ring-red-200 dark:!bg-red-500/10 dark:!ring-red-400/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:!text-red-200">Refund to the customer</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-red-700 dark:!text-red-200">{money(m.paid)}</p>
          <p className="mt-1.5 text-xs text-slate-600">The customer has paid {money(m.paid)} (verified). Pay this back after cancelling.</p>
        </div>
      ) : (
        <p role="status" className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 dark:!bg-emerald-500/10 dark:!text-emerald-300 dark:!ring-emerald-400/30">No verified payment. Nothing to refund.</p>
      )}
      {m.waiting > 0 && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200 dark:!bg-amber-500/10 dark:!text-amber-200 dark:!ring-amber-400/30"><b>{money(m.waiting)}</b> was submitted but is not verified yet. If that money really reached you, refund it too; otherwise reject it afterwards.</p>}

      <label className="mt-4 block"><span className="mb-1 block text-xs font-semibold text-slate-500">Reason (optional)</span>
        <input className={`${field} w-full !rounded-xl`} value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} placeholder="e.g. customer asked to cancel" /></label>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onClose}>Keep booking</Button>
        <HoldToConfirm size="md" duration={1.2} confirmDelay={0.8} label="Hold to cancel booking" doneLabel="Cancelled" onConfirm={go} />
      </div>
      <p className="mt-2 text-center text-xs text-slate-400 sm:text-right">Press and hold the red button</p>
    </Modal>
  )
}

/* Payments the customer has submitted (any transaction ID). They count as paid for now; staff check the real statement, then verify or reject. */
function VerifyBox({ b, busy, onReview }) {
  const pend = (b.payments || []).filter((p) => p.status === 'pending')
  if (!pend.length) return null
  const closed = b.status === 'cancelled' || b.status === 'expired'
  const paid = moneyOf(b).paid
  return (
    <div className="mt-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-300 dark:!bg-amber-500/10 dark:!ring-amber-400/40 sm:p-4">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:!text-amber-200"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />{closed ? 'Payment on a cancelled booking · cannot be verified' : 'Payment to verify · timer paused'}</p>
      <ul className="mt-2 divide-y divide-amber-200 dark:divide-white/10">
        {pend.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 first:pt-1 last:pb-0">
            <span className="min-w-0 flex-1 basis-48 text-sm text-slate-600">
              <b className="text-fg">{money(p.amount)}</b> · <span className="font-semibold text-fg">{PAYMENT.find((x) => x.id === p.method)?.label ?? p.method}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{p.reference ? <>TrxID <span className="break-all tabular-nums text-fg">{p.reference}</span></> : 'No reference'} · {fmtWhen(p.createdAt)}</span>
            </span>
            <span className="flex w-full gap-2 sm:w-auto">
              {!closed && <Button size="sm" variant="success" disabled={busy} className="flex-1 sm:flex-none" onClick={() => onReview(p.id, 'verified')}><CheckIcon width={14} height={14} />{b.status === 'pending' && paid + p.amount >= b.advance ? 'Verify & confirm' : 'Verify'}</Button>}
              <Button size="sm" variant="danger" disabled={busy} className="flex-1 sm:flex-none" onClick={() => onReview(p.id, 'rejected')}>Reject</Button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Stat({ icon: Icon, label, children, tone = 'brand', onClick, className = '' }) {
  const tones = { brand: 'bg-brand-soft text-brand-ink', amber: 'bg-amber-100 text-amber-800', emerald: 'bg-emerald-100 text-emerald-800', sky: 'bg-sky-100 text-sky-800' }
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag {...(onClick ? { type: 'button', onClick } : {})} className={`min-w-0 rounded-3xl bg-surface p-4 text-left shadow-card ring-1 ring-slate-200 sm:p-5 ${onClick ? 'transition hover:ring-brand/50 active:scale-[0.98]' : ''} ${className}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]} dark:!bg-white/10 dark:!text-fg`}><Icon width={20} height={20} /></span>
      <div className="mt-4 truncate text-2xl font-semibold text-fg sm:text-3xl">{children}</div>
      <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
    </Tag>
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
  const [cancelling, setCancelling] = useState(null)   // booking whose cancel dialog is open

  useEffect(() => { const t = setTimeout(() => { setQ(qInput); setPage(1) }, 350); return () => clearTimeout(t) }, [qInput])

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    const p = new URLSearchParams({ page: String(page), pageSize: String(PAGE) })
    if (filter === 'verify') p.set('verify', '1')
    else if (filter !== 'all') p.set('status', filter)
    if (q) p.set('q', q)
    if (from) p.set('from', from)
    if (to) p.set('to', to)
    try {
      const [list, st] = await Promise.all([api(`/admin/bookings?${p}`), api('/admin/stats')])
      setData(list); setStats(st)
    } catch (e) { if (!quiet) toast(e.message, 'error') } finally { setLoading(false) }
  }, [page, filter, q, from, to])
  useEffect(() => { load() }, [load])
  /* new payments from customers show up without a manual refresh */
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) load(true) }, 30_000)
    return () => clearInterval(t)
  }, [load])
  const tabs = useMemo(() => FILTERS.map((f) => ({ id: f, label: (LABELS[f] ?? f[0].toUpperCase() + f.slice(1)) + (f === 'verify' && stats?.toVerify ? ` (${stats.toVerify})` : '') })), [stats?.toVerify])

  const changed = () => { load(); reloadMap() }
  const [reviewing, setReviewing] = useState(false)
  const review = async (id, status) => { setReviewing(true); try { await act(() => api(`/admin/payments/${id}`, { method: 'PATCH', body: { status } }), `Payment ${status}`) } finally { setReviewing(false) } }
  const act = async (fn, msg) => { try { await fn(); toast(msg); changed() } catch (e) { toast(e.message, 'error') } }
  const remove = (b) => act(() => api(`/admin/bookings/${b.id}`, { method: 'DELETE' }), 'Booking deleted')   // hold-to-confirm; the server refuses confirmed / completed / paid bookings
  const openInvoice = (b) => setInv({ ...b, invoiceNo: 'INV-' + b.id.replace(/^NCC-/, '') })   // list rows already carry snapshot + payments
  const pages = Math.max(1, Math.ceil(data.total / PAGE))
  const filtered = filter !== 'all' || q || from || to

  return (
    <>
      {/* header */}
      <section className="pt-16">
        <div className="relative overflow-hidden bg-ink">
          <img src={img('hero-14.webp')} alt="" data-keep className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
          <div className="container-x relative flex flex-wrap items-end justify-between gap-4 py-10 text-white sm:py-14 min-[1536px]:!max-w-7xl min-[1920px]:!max-w-[96rem]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Staff only</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Staff dashboard</h1>
              <p className="mt-1.5 max-w-md text-sm text-white/80">Confirm bookings, verify payments and print invoices.</p>
            </div>
            <Button variant="white" size="lg" onClick={() => setEdit('new')}><PlusIcon width={18} height={18} />Walk-in booking</Button>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-8 sm:pb-24">
        <div className="container-x min-[1536px]:!max-w-7xl min-[1920px]:!max-w-[96rem]">
          {/* stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            <Stat icon={WalletIcon} tone="amber" label="Payments to verify" className="col-span-2 sm:col-span-1" onClick={() => { setFilter('verify'); setPage(1) }}>{stats ? <Odometer value={stats.toVerify ?? 0} /> : '–'}</Stat>
            <Stat icon={ClipboardIcon} label="Total bookings">{stats ? <Odometer value={stats.total} /> : '–'}</Stat>
            <Stat icon={UsersIcon} tone="amber" label="Waiting for action">{stats ? <Odometer value={stats.pending} /> : '–'}</Stat>
            <Stat icon={CheckIcon} tone="emerald" label="Confirmed bookings">{stats ? <Odometer value={stats.confirmed ?? 0} /> : '–'}</Stat>
            <Stat icon={CheckIcon} tone="sky" label="Completed orders">{stats ? <Odometer value={stats.completed ?? 0} /> : '–'}</Stat>
            <Stat icon={WalletIcon} tone="emerald" label="Revenue (confirmed + completed)">{stats ? <Odometer value={stats.revenue} prefix="৳" /> : '–'}</Stat>
            <Stat icon={CalendarIcon} tone="sky" label="Events in next 30 days">{stats ? <Odometer value={stats.upcoming} /> : '–'}</Stat>
          </div>

          {/* controls */}
          <div className="mt-6 rounded-[2rem] bg-surface p-4 shadow-dock ring-1 ring-slate-200 sm:p-6">
            <div className="-mx-1 overflow-x-auto px-1 pb-1"><PillTabs tabs={tabs} value={filter} onValueChange={(f) => { setFilter(f); setPage(1) }} label="Booking status" /></div>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[14rem] flex-1">
                <SearchIcon width={18} height={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Search code, name or phone" aria-label="Search bookings" className={`${field} w-full pl-11`} />
              </div>
              <div className="grid w-full grid-cols-2 gap-2.5 sm:contents">
                <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} aria-label="From date" className={`${field} w-full sm:w-44`} />
                <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} aria-label="To date" className={`${field} w-full sm:w-44`} />
              </div>
              <Button variant="outline" onClick={() => csv(data.items)} disabled={!data.items.length}><DownloadIcon width={16} height={16} />Export CSV</Button>
            </div>

            {/* list */}
            <div className="mt-5">
              {loading && !data.items.length ? <div className="space-y-3" aria-label="Loading">{[0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-3xl bg-slate-100" />)}</div>
              : data.items.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 py-14 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink"><ClipboardIcon width={22} height={22} /></span>
                  <p className="mt-3 font-semibold text-fg">{filtered ? 'No bookings match these filters' : 'No bookings yet'}</p>
                  <p className="mt-1 text-sm text-slate-500">{filtered ? 'Try another status or clear the search.' : 'Walk-in and online bookings will show up here.'}</p>
                  {filtered && <Button className="mt-4" variant="outline" onClick={() => { setFilter('all'); setQInput(''); setFrom(''); setTo('') }}>Clear filters</Button>}
                </div>
              ) : (
                <ul className={`grid grid-cols-1 gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
                  {data.items.map((b) => {
                    return (
                      <li key={b.id} className="min-w-0 rounded-3xl bg-surface p-4 ring-1 ring-slate-200 transition hover:ring-brand/40 sm:p-5">
                        <div className="flex gap-4">
                          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
                            <span className="text-2xl font-semibold leading-none">{fmtDate(b.date, { day: 'numeric' })}</span>
                            <span className="mt-1 text-xs font-medium">{fmtDate(b.date, { month: 'short' })}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-3">
                                <Avatar user={{ name: b.name, avatar: b.avatar }} size={40} />
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-fg">{b.name}</p>
                                  <p className="text-sm text-slate-500">{b.phone}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5"><StatusPill status={shownStatus(b)} />{b.status === 'pending' && <HoldChip b={b} onExpire={changed} />}</div>
                            </div>
                            <p className="mt-1.5 break-words text-sm text-slate-600">{b.eventType} · {SHIFTS.find((s) => s.id === b.shift)?.label} · {b.guests} guests · {packages.find((p) => p.id === b.packageId)?.name}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                              <span className="text-slate-500">Total <b className="text-fg">{money(b.total)}</b></span>
                              <span className="text-slate-500">Advance <b className="text-fg">{money(b.advance)}</b></span>
                              <span className="text-slate-500">Paid <b className={b.paidAmount >= b.advance ? 'text-emerald-600 dark:text-emerald-300' : 'text-fg'}>{money(b.paidAmount)}</b></span>
                              {moneyOf(b).overpaid ? <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:!bg-red-500/15 dark:!text-red-200">Refund due {money(moneyOf(b).refundDue)}</span> : moneyOf(b).paidInFull ? <StatusPill status="fully paid" /> : moneyOf(b).closed ? null : <span className="text-slate-500">Due <b className={b.status === 'completed' ? 'text-red-600 dark:text-red-300' : 'text-fg'}>{money(moneyOf(b).balance)}</b></span>}
                              <span className="tabular-nums text-xs text-slate-400">{b.id}</span>
                            </div>
                            <div className="mt-2.5"><EventTimer b={b} /></div>
                            {b.status === 'expired' && <p className="mt-2 text-xs text-red-600 dark:text-red-300">Auto-cancelled: advance not paid in time</p>}
                            {b.status === 'completed' && !moneyOf(b).paidInFull && <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-300">Event is over and {money(moneyOf(b).balance)} is unpaid. Open Payments to record it when collected.</p>}
                            </div>
                        </div>
                        <VerifyBox b={b} busy={reviewing} onReview={review} />
                        {b.status === 'pending' && !(b.payments || []).some((p) => p.status === 'pending') && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200">Not confirmed yet. It is confirmed automatically once a payment of at least {money(Math.max(0, b.advance - moneyOf(b).paid))} is verified.</p>}

                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                          {['pending', 'confirmed'].includes(b.status) && <Button size="sm" variant="danger" onClick={() => setCancelling(b)}>Cancel booking</Button>}
                          <Button size="sm" variant="outline" onClick={() => setEdit(b)}>Edit</Button>
                          <Button size="sm" variant={open === b.id ? 'primary' : 'soft'} aria-expanded={open === b.id} onClick={() => setOpen(open === b.id ? null : b.id)}>Payments ({b.payments?.length ?? 0})<ChevronDown width={14} height={14} className={`transition-transform ${open === b.id ? 'rotate-180' : ''}`} /></Button>
                          <Button size="sm" variant="info" onClick={() => openInvoice(b)}>Invoice</Button>
                          <Button as="a" size="sm" variant="soft" href={`tel:${b.phone}`}><PhoneIcon width={14} height={14} />Call</Button>
                          {!['confirmed', 'completed'].includes(b.status) && !(b.paidAmount > 0) && <HoldToConfirm className="ml-auto" label="Hold to delete" onConfirm={() => remove(b)} />}
                        </div>
                        <AnimatePresence initial={false}>{open === b.id && <PaymentsPanel key="p" b={b} onChanged={changed} />}</AnimatePresence>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* pagination */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <span><b className="text-fg">{data.total}</b> booking{data.total === 1 ? '' : 's'}</span>
              <span className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft width={14} height={14} />Prev</Button>
                <span className="px-1">Page {page} of {pages}</span>
                <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next<ChevronRight width={14} height={14} /></Button>
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {edit && <EditBooking key={edit === 'new' ? 'new' : edit.id} booking={edit === 'new' ? null : edit} admin map={map} onClose={() => setEdit(null)} onSaved={changed} />}
          {cancelling && <CancelDialog key="cancel" b={cancelling} onClose={() => setCancelling(null)} onDone={changed} />}
          {inv && <Modal key="inv" size="lg" title={`Invoice ${inv.invoiceNo}`} onClose={() => setInv(null)}><InvoiceView b={inv} /></Modal>}
        </AnimatePresence>
      </section>
    </>
  )
}
