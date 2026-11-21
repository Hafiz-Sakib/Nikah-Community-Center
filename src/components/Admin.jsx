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
import { packages, img } from '../data'
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

function PaymentsPanel({ b, onChanged }) {
  const [amount, setAmount] = useState(Math.max(0, b.total - b.paidAmount))
  const [method, setMethod] = useState('office')
  const [ref, setRef] = useState('')
  const [busy, setBusy] = useState(false)
  const run = async (fn, msg) => { setBusy(true); try { await fn(); toast(msg); onChanged() } catch (e) { toast(e.message, 'error') } finally { setBusy(false) } }
  const review = (id, status) => run(() => api(`/admin/payments/${id}`, { method: 'PATCH', body: { status } }), `Payment ${status}`)
  const add = () => run(() => api(`/admin/bookings/${b.id}/payments`, { method: 'POST', body: { amount: +amount, method, ...(ref.trim() ? { reference: ref.trim() } : {}) } }), 'Payment recorded')
  const inp = 'h-10 rounded-xl border border-slate-300 bg-surface px-3 text-sm text-fg outline-none focus:border-brand focus:ring-4 focus:ring-brand/15'
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <p className="mb-2 text-sm font-semibold text-fg">Payments</p>
        {b.payments?.length ? (
          <ul className="divide-y divide-slate-200">
            {b.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2 py-2.5">
                <span className="min-w-0 flex-1 text-sm text-slate-600"><b className="capitalize text-fg">{p.method}</b> · {money(p.amount)}{p.reference && <span className="ml-1 break-all font-mono text-xs text-slate-500">· {p.reference}</span>}</span>
                <StatusPill status={p.status} />
                {p.status !== 'verified' && <Button size="sm" variant="success" disabled={busy} onClick={() => review(p.id, 'verified')}><CheckIcon width={14} height={14} />Verify</Button>}
                {p.status === 'pending' && <Button size="sm" variant="danger" disabled={busy} onClick={() => review(p.id, 'rejected')}>Reject</Button>}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-500">No payments yet.</p>}
        <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-slate-200 pt-3">
          <label className="text-xs font-medium text-slate-500">Amount<input className={`${inp} mt-1 block w-32`} type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
          <label className="text-xs font-medium text-slate-500">Method<select className={`${inp} mt-1 block`} value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></label>
          <label className="min-w-[8rem] flex-1 text-xs font-medium text-slate-500">Reference<input className={`${inp} mt-1 block w-full`} placeholder="Txn ID (optional)" value={ref} onChange={(e) => setRef(e.target.value)} /></label>
          <Button disabled={busy || !(+amount > 0)} onClick={add}><PlusIcon width={16} height={16} />Record payment</Button>
        </div>
      </div>
    </motion.div>
  )
}

/* Payments the customer has submitted (any transaction ID). They count as paid for now; staff check the real statement, then verify or reject. */
function VerifyBox({ b, busy, onReview }) {
  const pend = (b.payments || []).filter((p) => p.status === 'pending')
  if (!pend.length) return null
  return (
    <div className="mt-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-300 dark:!bg-amber-500/10 dark:!ring-amber-400/40 sm:p-4">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:!text-amber-200"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />Payment to verify · timer paused</p>
      <ul className="mt-2 divide-y divide-amber-200 dark:divide-white/10">
        {pend.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 first:pt-1 last:pb-0">
            <span className="min-w-0 flex-1 basis-48 text-sm text-slate-600">
              <b className="text-fg">{money(p.amount)}</b> · <span className="font-semibold capitalize text-fg">{p.method}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{p.reference ? <>TrxID <span className="break-all font-mono text-fg">{p.reference}</span></> : 'No reference'} · {fmtWhen(p.createdAt)}</span>
            </span>
            <span className="flex w-full gap-2 sm:w-auto">
              <Button size="sm" variant="success" disabled={busy} className="flex-1 sm:flex-none" onClick={() => onReview(p.id, 'verified')}><CheckIcon width={14} height={14} />Verify</Button>
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
  const setStatus = (b, status) => act(() => api(`/admin/bookings/${b.id}`, { method: 'PATCH', body: { status } }), `Booking ${status}`)
  const remove = (b) => act(() => api(`/admin/bookings/${b.id}`, { method: 'DELETE' }), 'Booking deleted')   // guarded by hold-to-confirm
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            <Stat icon={WalletIcon} tone="amber" label="Payments to verify" className="col-span-2 sm:col-span-1" onClick={() => { setFilter('verify'); setPage(1) }}>{stats ? <Odometer value={stats.toVerify ?? 0} /> : '–'}</Stat>
            <Stat icon={ClipboardIcon} label="Total bookings">{stats ? <Odometer value={stats.total} /> : '–'}</Stat>
            <Stat icon={UsersIcon} tone="amber" label="Waiting for action">{stats ? <Odometer value={stats.pending} /> : '–'}</Stat>
            <Stat icon={WalletIcon} tone="emerald" label="Confirmed revenue">{stats ? <Odometer value={stats.revenue} prefix="৳" /> : '–'}</Stat>
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
                <ul className={`grid gap-4 transition-opacity min-[1536px]:grid-cols-2 ${loading ? 'opacity-60' : ''}`}>
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
                              <span className="font-mono text-xs text-slate-400">{b.id}</span>
                            </div>
                            <div className="mt-2.5"><EventTimer b={b} /></div>
                            {b.status === 'expired' && <p className="mt-2 text-xs text-red-600 dark:text-red-300">Auto-cancelled: advance not paid in time</p>}
                            </div>
                        </div>
                        <VerifyBox b={b} busy={reviewing} onReview={review} />

                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                          {b.status !== 'confirmed' && <Button size="sm" variant="success" onClick={() => setStatus(b, 'confirmed')}><CheckIcon width={14} height={14} />Confirm</Button>}
                          {b.status !== 'cancelled' && b.status !== 'expired' && <Button size="sm" variant="outline" onClick={() => setStatus(b, 'cancelled')}>Cancel booking</Button>}
                          <Button size="sm" variant="outline" onClick={() => setEdit(b)}>Edit</Button>
                          <Button size="sm" variant={open === b.id ? 'primary' : 'soft'} aria-expanded={open === b.id} onClick={() => setOpen(open === b.id ? null : b.id)}>Payments ({b.payments?.length ?? 0})<ChevronDown width={14} height={14} className={`transition-transform ${open === b.id ? 'rotate-180' : ''}`} /></Button>
                          <Button size="sm" variant="outline" onClick={() => openInvoice(b)}>Invoice</Button>
                          <Button as="a" size="sm" variant="soft" href={`tel:${b.phone}`}><PhoneIcon width={14} height={14} />Call</Button>
                          <HoldToConfirm className="ml-auto" label="Hold to delete" onConfirm={() => remove(b)} />
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
          {inv && <Modal key="inv" size="lg" title={`Invoice ${inv.invoiceNo}`} onClose={() => setInv(null)}><InvoiceView b={inv} /></Modal>}
        </AnimatePresence>
      </section>
    </>
  )
}
