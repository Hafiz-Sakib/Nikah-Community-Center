import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { PAYMENT, CONTACT, packages, capOf } from '../data'
import { fmtDate, money, toast } from '../lib/store'
import { billRows, waText, moneyOf } from '../lib/invoice'
import { api } from '../lib/api'
import { useMyBookings, shownStatus } from '../lib/bookings'
import StatusPill from './StatusPill'
import { HoldWarning, useHoldText } from './HoldTimer'
import Odometer from './Odometer'
import AnimatedNumber from './AnimatedNumber'
import InvoiceView from './InvoiceView'
import PaymentGateway from './gateway/PaymentGateway'
import PaymentHub from './PaymentHub'
import PayLogo from './PayLogo'
import PayProgress from './PayProgress'
import Button from './brew/Button'
import { CheckIcon, ChatIcon, DownloadIcon, ClipboardIcon, PlusIcon, CalendarIcon } from './Icons'

const CARD = 'rounded-3xl bg-surface p-4 ring-1 ring-slate-200 shadow-card sm:p-5'
const EYEBROW = 'text-[11px] font-semibold uppercase tracking-wider text-slate-500'

const COLORS = ['#fde68a', '#2563d6', '#3f87f5', '#10b981', '#f472b6', '#d4a017']
function Confetti() {
  const bits = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ a: (i / 34) * Math.PI * 2 + Math.random() * 0.4, d: 90 + Math.random() * 120, r: Math.random() * 540 - 270, c: COLORS[i % COLORS.length], w: 6 + Math.random() * 6 })), [])
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {bits.map((p, i) => (
        <motion.span key={i} className="absolute rounded-[2px]" style={{ width: p.w, height: p.w * 0.5, background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }} animate={{ x: Math.cos(p.a) * p.d, y: Math.sin(p.a) * p.d + 60, opacity: 0, rotate: p.r }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} />
      ))}
    </div>
  )
}

const copy = async (text, what) => { try { await navigator.clipboard.writeText(text); toast(`${what} copied`) } catch { toast('Copy not available here', 'error') } }

/* Shown instead of the pay options once every taka is received (verified by staff). */
function RefundDue({ m }) {
  return (
    <section role="status" className="rounded-3xl bg-amber-50 p-5 text-center ring-1 ring-amber-300 dark:!bg-amber-500/10 dark:!ring-amber-400/40 sm:p-6">
      <h3 className="text-lg font-semibold text-fg">Refund due {money(m.refundDue)}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">The new total is {money(m.total)} and you have paid {money(m.paid)}. Our team will contact you to refund the extra {money(m.refundDue)}. Nothing more to pay.</p>
    </section>
  )
}

function FullPaid({ m, name, reduce, onInvoice }) {
  return (
    <motion.section role="status" initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-5 text-center text-white shadow-lg shadow-emerald-600/25 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -left-12 -top-16 h-52 w-52 rounded-full bg-white/15 blur-2xl" />
      {!reduce && <Confetti />}
      <motion.span initial={reduce ? false : { scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }} className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-emerald-600 shadow-lg"><CheckIcon width={34} height={34} strokeWidth={3} /></motion.span>
      <h3 className="relative mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Full Paid</h3>
      <p className="relative mx-auto mt-1.5 max-w-md text-sm text-white/90">Thank you{name ? `, ${name.split(' ')[0]}` : ''}. We have received all {money(m.paid)} for this booking. Nothing more to pay.</p>
      <button type="button" onClick={onInvoice} className="relative mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-95"><ClipboardIcon width={16} height={16} />View paid invoice</button>
    </motion.section>
  )
}

export default function Billing({ b: initial, fresh = false, onNew, onManage }) {
  const reduce = useReducedMotion()
  const { reload: reloadMine } = useMyBookings()
  const [b, setB] = useState(initial)
  const [stage, setStage] = useState(reduce || !fresh ? 1 : 0)
  const [tab, setTab] = useState('bill')
  const [hover, setHover] = useState(null)
  const [method, setMethod] = useState('bkash')
  const [perGuest, setPerGuest] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [payAmount, setPayAmount] = useState(0)
  const hubRef = useRef(null)
  const hubInView = useInView(hubRef, { margin: '0px 0px -25% 0px' })
  const [busy, setBusy] = useState(false)
  const { rows, q } = useMemo(() => billRows(b), [b])
  const pay = PAYMENT.find((m) => m.id === method) || PAYMENT[1]
  const timer = useHoldText(b)
  const m = moneyOf(b)
  const pkgDef = packages.find((x) => x.id === b.packageId)
  const pkgCap = pkgDef ? capOf(pkgDef) : 0
  const { paid, waiting, balance } = m
  const payments = b.payments || []
  const canPay = ['pending', 'confirmed', 'completed'].includes(b.status) && m.room > 0          // something is still open to pay
  const fullPaidShown = m.paidInFull && ['pending', 'confirmed', 'completed'].includes(b.status)
  const fullSubmitted = !m.paidInFull && m.room === 0 && waiting > 0 && ['pending', 'confirmed', 'completed'].includes(b.status)
  const inReview = b.status === 'pending' && waiting > 0
  const advanceCovered = !m.advanceReceived && m.needAdvance === 0   // advance fully submitted, only staff verification is left
  const dueNow = m.needAdvance > 0 ? m.needAdvance : m.room
  const refresh = async () => { try { setB(await api(`/bookings/${b.id}`)) } catch {} reloadMine() }
  useEffect(() => { if (!fresh) refresh() }, []) // eslint-disable-line
  useEffect(() => { if (stage === 0) { const t = setTimeout(() => setStage(1), 1500); return () => clearTimeout(t) } }, [stage])
  const ics = () => import('./ics').then((m) => m.downloadIcs(b))
  /* A payment is only a request until staff verify it (checked against the bKash/Nagad/bank statement). */
  const submitPayment = async (body) => {
    setBusy(true)
    try { await api(`/bookings/${b.id}/payments`, { method: 'POST', body }); toast('Payment submitted — counted as paid, staff will verify it'); await refresh(); return true }
    catch (e) { toast(e.message, 'error'); return false }
    finally { setBusy(false) }
  }
  const goPay = () => hubRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })

  if (stage === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
        <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden><circle cx="42" cy="42" r="34" fill="none" strokeWidth="6" className="stroke-slate-200" /><motion.circle cx="42" cy="42" r="34" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-brand" strokeDasharray="213" initial={{ strokeDashoffset: 213, rotate: -90 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.4, ease: 'easeInOut' }} style={{ transformOrigin: '42px 42px' }} /></svg>
        <p className="mt-5 text-lg font-semibold text-fg">Preparing your bill…</p>
        <p className="mt-1 text-sm text-slate-500">Holding {fmtDate(b.date)} for you</p>
      </div>
    )
  }

  return (
    <div>
      <div className="relative text-center">
        {fresh && <Confetti />}
        {fresh && (<>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"><CheckIcon width={32} height={32} strokeWidth={3} /></motion.div>
        <h3 className="mt-4 text-xl font-semibold text-fg sm:text-2xl">{fresh ? `Request received, ${b.name.split(' ')[0]}!` : `Billing · ${b.eventType}`}</h3>
        </>)}
        <p className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500 ${fresh ? 'mt-1' : ''}`}><StatusPill status={shownStatus(b)} />{m.paidInFull && !m.overpaid && <StatusPill status="fully paid" />}{inReview ? null : b.status === 'pending' ? <span>Pay the advance to confirm. We will also call <b>{b.phone}</b>.</span> : b.status === 'confirmed' && balance > 0 ? <span>Advance received. Pay the rest online, at the office or after the event.</span> : b.status === 'completed' && balance > 0 ? <span>The event is over and {money(balance)} is still unpaid.</span> : null}</p>
        <p className="mx-auto mt-2 flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-600"><span>{b.eventType}</span><span aria-hidden>·</span><b className="text-fg">{q.pkgName}</b><span aria-hidden>·</span><span>{b.guests?.toLocaleString('en-IN')} guests{pkgCap ? <span className="text-slate-400"> (package allows up to {pkgCap.toLocaleString('en-IN')})</span> : null}</span></p>
        <button onClick={() => copy(b.id, 'Booking ID')} className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 font-mono text-sm font-semibold text-brand-ink ring-1 ring-brand/30 transition hover:ring-brand active:scale-95" aria-label={`Copy booking ID ${b.id}`}>{b.id}<ClipboardIcon width={15} height={15} /></button>
        {b.status === 'pending' && <div className="mx-auto mt-4 max-w-xl text-left"><HoldWarning b={b} hideCta onExpire={refresh} className="!mt-0" /></div>}
        {!['cancelled', 'expired'].includes(b.status) && <PayProgress submitted={payments.length > 0} verified={paid >= q.advance} confirmed={b.status === 'confirmed' || b.status === 'completed'} />}
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-xs grid-cols-2 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200" role="tablist">
        {[['bill', 'Your bill'], ['invoice', 'Invoice']].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === id ? 'text-fg' : 'text-slate-500 hover:text-fg'}`}>
            {tab === id && <motion.span layoutId="bill-tab" className="absolute inset-0 rounded-full bg-surface shadow-sm ring-1 ring-slate-200" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}<span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === 'bill' ? (
          <motion.div key="bill" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
            {/* totals */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e4fbf] via-brand-dark to-brand p-4 text-white shadow-glow sm:p-6">
              <div aria-hidden className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex flex-wrap items-end justify-between gap-3 sm:gap-4">
                <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-widest text-white/80">Total bill</p><Odometer value={perGuest ? Math.round(q.total / b.guests) : q.total} prefix="৳" className="text-3xl font-semibold sm:text-5xl" /><p className="mt-1 text-xs leading-relaxed text-white/80">{perGuest ? `per guest · ${b.guests} guests` : `${b.eventType} · ${fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })} · ${q.shiftLabel}`}</p></div>
                <button onClick={() => setPerGuest((v) => !v)} aria-pressed={perGuest} className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25 active:scale-95">{perGuest ? 'Show total' : 'Show per guest'}</button>
              </div>
              <div className="relative mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                <div className="min-w-0 rounded-2xl bg-white/12 p-3.5 ring-1 ring-white/20 sm:p-4"><p className="text-xs text-white/80">{m.advanceReceived ? 'Advance (30%) received' : advanceCovered ? 'Advance (30%) submitted' : 'Advance due now (30%)'}</p><p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl"><AnimatedNumber value={m.advance} prefix="৳" /></p>
                  <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-white/20" role="img" aria-label={`Advance: ${money(Math.min(paid, m.advance))} verified of ${money(m.advance)}`}><motion.span className="h-full bg-emerald-300" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (paid / m.advance) * 100)}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} /><motion.span className="h-full bg-white/70" initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100 - Math.min(100, (paid / m.advance) * 100), (waiting / m.advance) * 100))}%` }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} /></div></div>
                <div className="min-w-0 rounded-2xl bg-white/12 p-3.5 ring-1 ring-white/20 sm:p-4"><p className="text-xs text-white/80">{m.paidInFull ? 'Paid in full' : inReview ? 'Paid · staff verifying' : b.status === 'pending' && b.holdExpiresAt ? `Pay within (${b.holdHours ?? 48} h hold)` : 'Paid so far'}</p><p className="mt-1 break-words font-mono text-xl font-semibold tabular-nums sm:text-2xl">{m.paidInFull ? money(paid) : inReview ? money(paid + waiting) : b.status === 'pending' && b.holdExpiresAt ? timer : money(paid)}</p>{!(b.status === 'pending' && b.holdExpiresAt && !inReview) && <p className="mt-1 text-xs text-white/80">{m.paidInFull ? 'Nothing left to pay' : `Balance ${money(balance)}`}</p>}</div>
              </div>
              <div className="relative mt-4" role="img" aria-label={`${money(paid)} of ${money(m.total)} paid`}>
                <div className="flex h-2 overflow-hidden rounded-full bg-white/20"><motion.span className="h-full bg-emerald-300" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (paid / m.total) * 100)}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} /><motion.span className="h-full bg-white/60" initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100 - Math.min(100, (paid / m.total) * 100), (waiting / m.total) * 100))}%` }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} /></div>
                <p className="mt-1.5 flex justify-between text-[11px] text-white/80"><span>{Math.round((paid / m.total) * 100)}% paid{waiting > 0 ? ` · ${money(waiting)} verifying` : ''}</span><span>{money(m.total)}</span></p>
              </div>
            </div>

            {/* breakdown */}
            <div className={CARD}>
              <p className={`mb-3 ${EYEBROW}`}>Where your money goes</p>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100 sm:h-3" onMouseLeave={() => setHover(null)}>
                {rows.map((r) => (
                  <motion.span key={r.id} onMouseEnter={() => setHover(r.id)} initial={{ width: 0 }} animate={{ width: `${(r.amount / q.total) * 100}%`, opacity: hover && hover !== r.id ? 0.35 : 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: r.tone }} className="h-full border-r-2 border-surface last:border-0" />
                ))}
              </div>
              <ul className="mt-4 divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <motion.li key={r.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }} onMouseEnter={() => setHover(r.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(r.id)} tabIndex={0}
                    className={`flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/50 sm:py-3 ${hover === r.id ? 'bg-slate-50' : ''}`}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.tone }} />
                    <span className="min-w-0 flex-1"><span className="block break-words font-medium text-fg">{r.label}</span>{r.note && <span className="block text-xs text-slate-500">{r.note}</span>}</span>
                    <b className="shrink-0 tabular-nums text-fg">{money(r.amount)}</b>
                  </motion.li>
                ))}
              </ul>
              <div className={`mt-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm ring-1 ${m.paidInFull ? 'bg-emerald-50 ring-emerald-300 dark:!bg-emerald-500/10 dark:!ring-emerald-400/30' : 'bg-brand-soft ring-brand/25'}`}><span className={`font-semibold ${m.paidInFull ? 'text-emerald-700 dark:text-emerald-300' : 'text-brand-ink'}`}>{m.overpaid ? 'Refund due' : m.paidInFull ? 'Fully paid' : 'Balance due'}</span><span className={`text-base font-semibold tabular-nums ${m.paidInFull ? 'text-emerald-700 dark:text-emerald-300' : 'text-brand-ink'}`}>{money(m.overpaid ? m.refundDue : balance)}</span></div>
            </div>

            {/* payments so far */}
            {payments.length > 0 && (
              <div className={CARD}>
                <p className={`mb-3 ${EYEBROW}`}>Payments</p>
                <ul className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 text-sm">
                      <PayLogo id={p.method} size="sm" />
                      <span className="min-w-0 flex-1 basis-40"><span className="block font-medium text-fg">{PAYMENT.find((x) => x.id === p.method)?.label ?? p.method}{p.reference ? <span className="break-all font-mono text-xs font-normal text-slate-500"> · {p.reference}</span> : null}</span><span className="block text-xs text-slate-500">{fmtDate(p.createdAt.slice(0, 10))}</span></span>
                      <StatusPill status={p.status === 'pending' ? 'in review' : p.status} /><b className="ml-auto min-w-[5.5rem] text-right tabular-nums text-fg">{money(p.amount)}</b>
                    </li>
                  ))}
                </ul>
                {waiting > 0 && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 ring-1 ring-amber-200 dark:!bg-amber-500/10 dark:!text-amber-200 dark:!ring-amber-400/30">{money(waiting)} is counted as paid for now and sent to our staff to verify. {b.status === 'pending' ? 'Your date stays held and the booking confirms once the advance is verified.' : 'Your balance updates as soon as it is verified.'}</p>}
              </div>
            )}

            {canPay && <PaymentHub ref={hubRef} bookingId={b.id} m={m} busy={busy} method={method} setMethod={setMethod} onCard={(a) => { setPayAmount(a); setShowPay(true) }} onSubmit={submitPayment} />}
            {fullSubmitted && (
              <div role="status" className="flex items-start gap-3 rounded-3xl bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-300 dark:!bg-sky-500/10 dark:!text-fg dark:!ring-sky-400/30">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-500 text-white"><CheckIcon width={16} height={16} strokeWidth={3} /></span>
                <p><b>Full payment submitted.</b> Our team is verifying {money(waiting)}. Once it is verified this booking shows Fully paid.</p>
              </div>
            )}
            {fullPaidShown && m.overpaid && <RefundDue m={m} />}
            {fullPaidShown && !m.overpaid && <FullPaid m={m} name={b.name} reduce={reduce} onInvoice={() => setTab('invoice')} />}
          </motion.div>
        ) : (
          <motion.div key="inv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6"><InvoiceView b={b} /></motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 grid gap-2.5 pb-[env(safe-area-inset-bottom)] sm:grid-cols-3 sm:gap-3">
        {!m.paidInFull && (<Button as="a" size="lg" variant="success" href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(waText(b, pay.label))}`} target="_blank" rel="noreferrer" className="w-full !text-sm"><ChatIcon width={18} height={18} />Send payment proof</Button>)}
        <Button size="lg" variant="outline" onClick={ics} className="w-full !text-sm"><DownloadIcon width={18} height={18} />Add to calendar</Button>
        <Button size="lg" variant="outline" onClick={() => setTab('invoice')} className="w-full !text-sm"><ClipboardIcon width={18} height={18} />View invoice</Button>
      </div>
      <AnimatePresence>
        {canPay && tab === 'bill' && !hubInView && !showPay && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }} className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
            <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink p-2.5 pl-4 text-white shadow-2xl ring-1 ring-white/15">
              <div className="min-w-0 flex-1"><p className="text-[11px] text-white/60">{m.needAdvance > 0 ? 'Advance due now' : 'Balance to pay'}</p><p className="truncate text-lg font-semibold tabular-nums">{money(dueNow)}</p></div>
              <button onClick={goPay} className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition active:scale-95">Pay now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <PaymentGateway open={showPay} onClose={() => setShowPay(false)} amount={payAmount} bookingId={b.id} payer={b.name}
        onPaid={(r) => submitPayment({ amount: payAmount, method: 'card', reference: r.ref })} />
      {(onManage || onNew) && (
        <div className="mt-4 grid gap-2.5 border-t border-slate-200 pt-4 sm:grid-cols-2 sm:gap-3">
          {onManage && <Button size="lg" variant="soft" onClick={onManage} className="w-full"><ClipboardIcon width={18} height={18} />My bookings</Button>}
          {onNew && <Button size="lg" variant="primary" onClick={onNew} className="w-full"><PlusIcon width={18} height={18} />Book another date</Button>}
        </div>
      )}
    </div>
  )
}
