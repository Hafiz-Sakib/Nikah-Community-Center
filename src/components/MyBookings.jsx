import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import PageHero from './PageHero'
import StatusPill from './StatusPill'
import EventTimer from './EventTimer'
import { HoldWarning } from './HoldTimer'
import Avatar from './Avatar'
import Billing from './Billing'
import EditBooking from './EditBooking'
import InvoiceView from './InvoiceView'
import { SHIFTS, money, fmtDate, toast, toISO } from '../lib/store'
import { packages } from '../data'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useMyBookings, isActive } from '../lib/bookings'
import { useAvailability } from '../lib/useAvailability'
import { ClipboardIcon, CloseIcon } from './Icons'

const EDIT_CUTOFF_DAYS = 3   // same as the server's EDIT_CUTOFF_DAYS
const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toISO(d) }

function Modal({ title, onClose, children }) {
  return (
    <motion.div className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto bg-black/70 p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} className="relative mt-14 w-full max-w-[860px] rounded-3xl bg-surface p-3 sm:p-5">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-fg"><CloseIcon /></button>
        <p className="mb-3 pr-12 text-lg font-semibold text-fg">{title}</p>
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function MyBookings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { bookings: all, loading, error, reload } = useMyBookings()
  const { map, reload: reloadMap } = useAvailability()
  const [confirmId, setConfirmId] = useState(null)
  const [inv, setInv] = useState(null)       // invoice booking (fresh from /invoice)
  const [bill, setBill] = useState(null)
  const [edit, setEdit] = useState(null)
  const [busy, setBusy] = useState(false)
  const today = plusDays(0), editFrom = plusDays(EDIT_CUTOFF_DAYS)
  const list = useMemo(() => all.slice().sort((a, b) => b.date.localeCompare(a.date)), [all])

  const cancel = async (id) => {
    setBusy(true)
    try { await api(`/bookings/${id}/cancel`, { method: 'POST', body: {} }); toast('Booking cancelled'); setConfirmId(null); reload(); reloadMap() }
    catch (e) { toast(e.message, 'error') } finally { setBusy(false) }
  }
  const openInvoice = async (b) => {
    try { setInv(await api(`/bookings/${b.id}/invoice`)) } catch (e) { toast(e.message, 'error') }
  }

  return (
    <>
      <PageHero title="My bookings" text="Review, edit, pay or cancel your reservations." image="hero-13.webp" />
      <section className="py-12 sm:py-16"><div className="container-x max-w-3xl"><div className="rounded-[2rem] bg-surface p-5 shadow-dock ring-1 ring-slate-100 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <Avatar user={user} size={48} />
        <div className="min-w-0"><p className="truncate text-lg font-semibold text-fg">Hi, {user?.name}</p><p className="truncate text-sm text-slate-500">{user?.email}</p></div>
      </div>
      {loading && !all.length ? <p className="py-10 text-center text-sm text-slate-500">Loading your bookings…</p>
      : error && !all.length ? <div className="py-10 text-center"><p className="text-sm text-red-500">{error}</p><button onClick={reload} className="btn-primary mt-4">Try again</button></div>
      : list.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-medium text-fg">No bookings yet</p>
          <p className="mt-1 text-sm text-slate-500">Reserve your first date in just a couple of minutes.</p>
          <button onClick={() => navigate('/booking')} className="btn-primary mt-5">Book now</button>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {list.map((b) => {
              const s = SHIFTS.find((x) => x.id === b.shift)
              const p = packages.find((x) => x.id === b.packageId)
              const canEdit = isActive(b) && b.date >= editFrom
              const canCancel = isActive(b) && b.date >= today
              const due = b.total - b.paidAmount
              return (
                <motion.li key={b.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl p-4 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-semibold text-fg">{b.eventType} · {fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })}</p><p className="text-xs text-slate-500">{s.label} · {s.time}</p><EventTimer b={b} className="mt-2" /></div>
                    <StatusPill status={b.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                    <span className="font-mono text-xs">{b.id}</span><span>{p?.name} · {b.guests} guests</span><b className="text-fg">{money(b.total)}</b>
                  </div>
                  {isActive(b) && <p className="mt-1 text-xs text-slate-500">Paid {money(b.paidAmount)} · Balance {money(due)}{b.payments?.some((x) => x.status === 'pending') ? ' · payment awaiting verification' : ''}</p>}
                  {b.status === 'pending' && <HoldWarning b={b} onPay={() => setBill(b)} onExpire={() => { toast('An unpaid booking was cancelled automatically', 'error'); reload(); reloadMap() }} />}
                  {b.status === 'expired' && <p className="mt-2 rounded-xl bg-orange-50 p-3 text-xs text-orange-700 ring-1 ring-orange-200 dark:!bg-white/5 dark:!text-fg dark:!ring-white/15">This booking was cancelled automatically because the advance was not paid within {Math.round((b.holdHours ?? 72) / 24)} days. The date is free again — you can book it again if it is still available.</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm font-medium">
                    <button onClick={() => openInvoice(b)} className="inline-flex items-center gap-1.5 text-brand-ink hover:underline"><ClipboardIcon width={16} height={16} />Invoice</button>
                    {isActive(b) && <button onClick={() => setBill(b)} className="text-brand-ink hover:underline">Pay / billing</button>}
                    {canEdit && <button onClick={() => setEdit(b)} className="text-brand-ink hover:underline">Edit</button>}
                    {isActive(b) && !canEdit && <span className="text-xs font-normal text-slate-400">Edits close {EDIT_CUTOFF_DAYS} days before the event — call us</span>}
                    {canCancel && (
                      <span className="ml-auto text-right">
                        {confirmId === b.id ? (
                          <span className="inline-flex items-center gap-2"><span className="font-normal text-slate-500">Cancel this booking?</span>
                            <button disabled={busy} onClick={() => cancel(b.id)} className="rounded-full bg-red-500 px-3 py-1.5 font-semibold text-white disabled:opacity-60">Yes, cancel</button>
                            <button onClick={() => setConfirmId(null)} className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-600">Keep</button></span>
                        ) : <button onClick={() => setConfirmId(b.id)} className="text-red-500 hover:underline">Cancel booking</button>}
                      </span>
                    )}
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
      <AnimatePresence>
        {inv && <Modal key="inv" title={`Invoice ${inv.invoiceNo}`} onClose={() => setInv(null)}><InvoiceView b={inv} /></Modal>}
        {bill && <Modal key="bill" title={`Billing · ${bill.id}`} onClose={() => { setBill(null); reload() }}><Billing b={bill} /></Modal>}
        {edit && <EditBooking key="edit" booking={edit} map={map} onClose={() => setEdit(null)} onSaved={() => { reload(); reloadMap() }} />}
      </AnimatePresence>
      <p className="mt-5 text-center text-xs text-slate-400">Refunds for cancelled bookings are handled by our team. Call us if you need help.</p>
      </div></div></section>
    </>
  )
}
