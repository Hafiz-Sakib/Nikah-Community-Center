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
import { useMyBookings, isActive, shownStatus } from '../lib/bookings'
import { moneyOf } from '../lib/invoice'
import { useAvailability } from '../lib/useAvailability'
import Modal from './Modal'
import ActionButton from './brew/ActionButton'
import { ClipboardIcon, CloseIcon, WalletIcon, EditIcon, LockIcon, CheckIcon } from './Icons'

const EDIT_CUTOFF_DAYS = 3   // same as the server's EDIT_CUTOFF_DAYS
const plusDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toISO(d) }

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
      <section className="py-12 sm:py-16"><div className="container-x max-w-3xl 2xl:max-w-4xl"><div className="rounded-[2rem] bg-surface p-5 shadow-dock ring-1 ring-slate-100 sm:p-8">
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
              const m = moneyOf(b)
              const showMoney = isActive(b) || b.status === 'completed'
              const owes = b.status === 'completed' && m.balance > 0        // event is over but money is still missing
              const canBill = isActive(b) || owes
              const unpaid = b.status === 'pending' && b.paidAmount === 0 && !b.payments?.some((x) => x.status === 'pending')
              return (
                <motion.li key={b.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl p-4 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-semibold text-fg">{b.eventType} · {fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })}</p><p className="text-xs text-slate-500">{s.label} · {s.time}</p><EventTimer b={b} className="mt-2" /></div>
                    <div className="flex flex-col items-end gap-1.5"><StatusPill status={shownStatus(b)} />{m.paidInFull && !m.overpaid && showMoney && <StatusPill status="fully paid" />}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                    <span className="font-mono text-xs">{b.id}</span><span>{p?.name} · {b.guests} guests</span><b className="text-fg">{money(b.total)}</b>
                  </div>
                  {showMoney && (m.overpaid
                    ? <p className="mt-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 dark:!bg-amber-500/10 dark:!text-amber-200 dark:!ring-amber-400/30">Total changed · refund due {money(m.refundDue)} (our team will contact you)</p>
                    : m.paidInFull
                    ? <p className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:!bg-emerald-500/10 dark:!text-emerald-300 dark:!ring-emerald-400/30"><CheckIcon width={14} height={14} strokeWidth={3} />Full Paid · {money(m.paid)} received</p>
                    : <p className="mt-1 text-xs text-slate-500">Paid {money(m.paid)} · Balance <b className={owes ? 'text-red-600 dark:text-red-300' : 'text-fg'}>{money(m.balance)}</b>{m.waiting > 0 ? ` · ${money(m.waiting)} submitted, staff are verifying it` : ''}</p>)}
                  {owes && <p className="mt-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 ring-1 ring-red-200 dark:!bg-red-500/10 dark:!text-red-200 dark:!ring-red-400/30">The event is over and {money(m.balance)} is still unpaid. Pay it online or at our office.</p>}
                  {b.status === 'pending' && <HoldWarning b={b} onPay={() => setBill(b)} onExpire={() => { toast('An unpaid booking was cancelled automatically', 'error'); reload(); reloadMap() }} />}
                  {b.status === 'expired' && <p className="mt-2 rounded-xl bg-orange-50 p-3 text-xs text-orange-700 ring-1 ring-orange-200 dark:!bg-white/5 dark:!text-fg dark:!ring-white/15">Cancelled — the advance was not paid within {b.holdHours ?? 48} hours, so the date was released. This record stays here for your reference; you can book the date again if it is still available.</p>}
                  <AnimatePresence mode="wait" initial={false}>
                    {confirmId === b.id ? (
                      <motion.div key="confirm" role="alertdialog" aria-label="Confirm cancellation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                        className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-red-50 p-3 ring-1 ring-red-200 dark:!bg-red-500/10 dark:!ring-red-400/30">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"><CloseIcon width={16} height={16} /></span>
                        <p className="min-w-0 flex-1 text-sm font-semibold text-fg">Cancel this booking?<span className="block text-xs font-normal text-slate-500">The date goes back on sale.</span></p>
                        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                          <ActionButton variant="neutral" onClick={() => setConfirmId(null)}>Keep it</ActionButton>
                          <ActionButton variant="solidDanger" disabled={busy} onClick={() => cancel(b.id)}>{busy ? 'Cancelling…' : 'Yes, cancel'}</ActionButton>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="actions" exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:flex sm:flex-wrap sm:items-center">
                        {canBill && <ActionButton variant={m.paidInFull ? 'info' : 'primary'} icon={m.paidInFull ? CheckIcon : WalletIcon} attention={unpaid || owes} delay={0.05} wrap="col-span-2 sm:order-2 sm:col-span-1" onClick={() => setBill(b)}>{m.paidInFull ? 'Billing · Full paid' : b.status === 'pending' ? 'Pay / billing' : 'Pay balance'}</ActionButton>}
                        <ActionButton variant="info" icon={ClipboardIcon} delay={0} wrap={`sm:order-1 ${canEdit ? '' : 'col-span-2'}`} onClick={() => openInvoice(b)}>Invoice</ActionButton>
                        {canEdit && <ActionButton variant="neutral" icon={EditIcon} delay={0.1} wrap="sm:order-3" onClick={() => setEdit(b)}>Edit</ActionButton>}
                        {isActive(b) && !canEdit && <p className="col-span-2 inline-flex items-center gap-1.5 text-xs text-slate-400 sm:order-3 sm:col-span-1"><LockIcon width={13} height={13} />Edits close {EDIT_CUTOFF_DAYS} days before the event — call us</p>}
                        {canCancel && <ActionButton variant="danger" icon={CloseIcon} delay={0.15} wrap="col-span-2 sm:order-4 sm:col-span-1 sm:ml-auto" onClick={() => setConfirmId(b.id)}>Cancel booking</ActionButton>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
      <AnimatePresence>
        {inv && <Modal key="inv" size="lg" title={`Invoice ${inv.invoiceNo}`} onClose={() => setInv(null)}><InvoiceView b={inv} /></Modal>}
        {bill && <Modal key="bill" size="lg" title={`Billing · ${bill.id}`} onClose={() => { setBill(null); reload() }}><Billing b={bill} /></Modal>}
        {edit && <EditBooking key="edit" booking={edit} map={map} onClose={() => setEdit(null)} onSaved={() => { reload(); reloadMap() }} />}
      </AnimatePresence>
      <p className="mt-5 text-center text-xs text-slate-400">Refunds for cancelled bookings are handled by our team. Call us if you need help.</p>
      </div></div></section>
    </>
  )
}
