import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PAYMENT, CONTACT } from '../data'
import { fmtDate, money, toast } from '../lib/store'
import { billRows, waText, paidOf } from '../lib/invoice'
import { api } from '../lib/api'
import { useMyBookings, shownStatus } from '../lib/bookings'
import StatusPill from './StatusPill'
import { HoldWarning, useHoldText } from './HoldTimer'
import Odometer from './Odometer'
import AnimatedNumber from './AnimatedNumber'
import InvoiceView from './InvoiceView'
import PaymentGateway from './gateway/PaymentGateway'
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
  const [trx, setTrx] = useState('')
  const [busy, setBusy] = useState(false)
  const { rows, q } = useMemo(() => billRows(b), [b])
  const pay = PAYMENT.find((m) => m.id === method)
  const timer = useHoldText(b)
  const paid = paidOf(b)
  const payments = b.payments || []
  const waiting = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const advanceDue = Math.max(0, q.advance - paid)
  const balance = q.total - paid
  const dueNow = advanceDue > 0 ? Math.max(0, advanceDue - waiting) : Math.max(0, balance - waiting)   // what is left to pay after pending payments
  const active = b.status === 'pending' || b.status === 'confirmed'
  const inReview = b.status === 'pending' && waiting > 0
  const advanceCovered = advanceDue > 0 && dueNow === 0   // advance fully submitted, only staff verification is left
  const refresh = async () => { try { setB(await api(`/bookings/${b.id}`)) } catch {} reloadMine() }
  useEffect(() => { if (!fresh) refresh() }, []) // eslint-disable-line
  useEffect(() => { if (stage === 0) { const t = setTimeout(() => setStage(1), 1500); return () => clearTimeout(t) } }, [stage])
  const ics = () => import('./ics').then((m) => m.downloadIcs(b))
  /* A payment is only a request until staff verify it (checked against the bKash/Nagad/bank statement). */
  const submitPayment = async (body) => {
    setBusy(true)
    try { await api(`/bookings/${b.id}/payments`, { method: 'POST', body }); toast('Payment submitted — counted as paid, staff will verify it'); setTrx(''); await refresh() }
    catch (e) { toast(e.message, 'error') }
    finally { setBusy(false) }
  }
  const submitManual = () => {
    if (method !== 'office' && !trx.trim()) { toast('Enter the transaction ID', 'error'); return }
    submitPayment({ amount: dueNow, method, ...(trx.trim() ? { reference: trx.trim() } : {}) })
  }

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
        <p className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500 ${fresh ? 'mt-1' : ''}`}><StatusPill status={shownStatus(b)} />{inReview ? null : b.status === 'pending' ? <span>Pay the advance to confirm. We will also call <b>{b.phone}</b>.</span> : null}</p>
        <button onClick={() => copy(b.id, 'Booking ID')} className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 font-mono text-sm font-semibold text-brand-ink ring-1 ring-brand/30 transition hover:ring-brand active:scale-95" aria-label={`Copy booking ID ${b.id}`}>{b.id}<ClipboardIcon width={15} height={15} /></button>
        {b.status === 'pending' && <div className="mx-auto mt-4 max-w-xl text-left"><HoldWarning b={b} hideCta onExpire={refresh} className="!mt-0" /></div>}
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
                <div className="min-w-0 rounded-2xl bg-white/12 p-3.5 ring-1 ring-white/20 sm:p-4"><p className="text-xs text-white/80">{advanceCovered ? 'Advance (30%) submitted' : advanceDue > 0 ? 'Advance due now (30%)' : 'Advance (30%) received'}</p><p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl"><AnimatedNumber value={advanceCovered ? q.advance : advanceDue > 0 ? dueNow : q.advance} prefix="৳" /></p></div>
                <div className="min-w-0 rounded-2xl bg-white/12 p-3.5 ring-1 ring-white/20 sm:p-4"><p className="text-xs text-white/80">{inReview ? 'Paid · staff verifying' : b.status === 'pending' && b.holdExpiresAt ? 'Pay within (48 h hold)' : 'Paid so far'}</p><p className="mt-1 break-words font-mono text-xl font-semibold tabular-nums sm:text-2xl">{inReview ? money(paid + waiting) : b.status === 'pending' && b.holdExpiresAt ? timer : money(paid)}</p></div>
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
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-sm ring-1 ring-brand/25"><span className="font-semibold text-brand-ink">Balance due</span><span className="text-base font-semibold tabular-nums text-brand-ink">{money(balance)}</span></div>
            </div>

            {/* payments so far */}
            {payments.length > 0 && (
              <div className={CARD}>
                <p className={`mb-3 ${EYEBROW}`}>Payments</p>
                <ul className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 text-sm">
                      <span className="min-w-0 flex-1 basis-40"><span className="block font-medium capitalize text-fg">{p.method}{p.reference ? <span className="break-all font-mono text-xs font-normal text-slate-500"> · {p.reference}</span> : null}</span><span className="block text-xs text-slate-500">{fmtDate(p.createdAt.slice(0, 10))}</span></span>
                      <StatusPill status={p.status === 'pending' ? 'in review' : p.status} /><b className="ml-auto min-w-[5.5rem] text-right tabular-nums text-fg">{money(p.amount)}</b>
                    </li>
                  ))}
                </ul>
                {waiting > 0 && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 ring-1 ring-amber-200 dark:!bg-amber-500/10 dark:!text-amber-200 dark:!ring-amber-400/30">{money(waiting)} is counted as paid for now and sent to our staff to verify. Your date stays held and the booking confirms once the advance is verified.</p>}
              </div>
            )}

            {active && dueNow > 0 && (<>
            {/* online card payment (demo gateway) */}
            <div className="relative overflow-hidden rounded-3xl bg-ink p-4 text-white ring-1 ring-white/10 sm:p-6">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
              <div className="relative flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-sky-300">Fastest way</p><p className="mt-1 text-lg font-semibold">Pay {advanceDue > 0 ? 'the advance' : 'the balance'} by card</p><p className="mt-0.5 text-sm text-white/60">Visa, Mastercard, Amex · {money(dueNow)} now</p></div>
                <button onClick={() => setShowPay(true)} disabled={busy} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-glow ring-1 ring-white/20 transition hover:bg-brand-dark active:scale-95 disabled:opacity-60 sm:w-auto">Pay {money(dueNow)}</button>
              </div>
            </div>

            {/* manual payment */}
            <div className={CARD}>
              <p className={`mb-3 ${EYEBROW}`}>Or pay manually · {money(dueNow)}</p>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap" role="radiogroup" aria-label="Payment method">
                {PAYMENT.map((m) => (
                  <button key={m.id} role="radio" aria-checked={method === m.id} onClick={() => setMethod(m.id)} className={`relative rounded-full px-3 py-2 text-sm font-semibold ring-1 transition sm:px-4 ${method === m.id ? 'text-white ring-transparent' : 'bg-slate-100 text-slate-600 ring-slate-200 hover:bg-slate-200'}`}>
                    {method === m.id && <motion.span layoutId="pay-pill" className="absolute inset-0 rounded-full" style={{ background: m.color }} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}<span className="relative">{m.label}</span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={method} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-4 rounded-2xl bg-slate-50 p-3.5 text-sm ring-1 ring-slate-200 sm:p-4">
                  <p className="text-xs text-slate-500">{pay.kind}</p>
                  <div className="mt-1 flex items-center justify-between gap-3"><p className="break-words font-semibold text-fg">{pay.value}</p>{method !== 'office' && <button onClick={() => copy(pay.value.split(' · ')[0].replace(/^A\/C /, ''), 'Number')} className="shrink-0 rounded-full bg-surface px-3.5 py-1.5 text-xs font-semibold text-brand-ink ring-1 ring-brand/40 transition hover:ring-brand active:scale-95">Copy</button>}</div>
                  {method !== 'office' && <p className="mt-3 text-xs text-slate-500">Use <button onClick={() => copy(b.id, 'Booking ID')} className="font-mono font-semibold text-fg underline decoration-dotted">{b.id}</button> as the reference, then enter the transaction ID below.</p>}
                </motion.div>
              </AnimatePresence>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                {method !== 'office' && <input value={trx} onChange={(e) => setTrx(e.target.value)} maxLength={60} placeholder="Transaction ID (TrxID)" enterKeyHint="send" autoCapitalize="characters" autoCorrect="off" className="h-11 min-w-0 flex-1 rounded-full border border-slate-300 bg-surface px-4 text-sm text-fg outline-none placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15" />}
                <button onClick={submitManual} disabled={busy} className="btn-primary h-11 !py-0 disabled:opacity-60">{busy ? 'Submitting…' : method === 'office' ? 'I will pay at the office' : 'Submit payment'}</button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Any transaction ID is accepted for now and your date stays held. Staff verify it against our account, then your booking is confirmed.</p>
            </div>
            </>)}
          </motion.div>
        ) : (
          <motion.div key="inv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6"><InvoiceView b={b} /></motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 grid gap-2.5 pb-[env(safe-area-inset-bottom)] sm:grid-cols-3 sm:gap-3">
        <Button as="a" size="lg" variant="success" href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(waText(b, pay.label))}`} target="_blank" rel="noreferrer" className="w-full !text-sm"><ChatIcon width={18} height={18} />Send payment proof</Button>
        <Button size="lg" variant="outline" onClick={ics} className="w-full !text-sm"><DownloadIcon width={18} height={18} />Add to calendar</Button>
        <Button size="lg" variant="outline" onClick={() => setTab('invoice')} className="w-full !text-sm"><ClipboardIcon width={18} height={18} />View invoice</Button>
      </div>
      <PaymentGateway open={showPay} onClose={() => setShowPay(false)} amount={dueNow} bookingId={b.id} payer={b.name}
        onPaid={(r) => submitPayment({ amount: dueNow, method: 'card', reference: r.ref })} />
      {(onManage || onNew) && (
        <div className="mt-4 grid gap-2.5 border-t border-slate-200 pt-4 sm:grid-cols-2 sm:gap-3">
          {onManage && <Button size="lg" variant="soft" onClick={onManage} className="w-full"><ClipboardIcon width={18} height={18} />My bookings</Button>}
          {onNew && <Button size="lg" variant="primary" onClick={onNew} className="w-full"><PlusIcon width={18} height={18} />Book another date</Button>}
        </div>
      )}
    </div>
  )
}
