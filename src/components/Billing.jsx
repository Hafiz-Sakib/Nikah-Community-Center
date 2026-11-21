import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PAYMENT, CONTACT } from '../data'
import { fmtDate, money, toast } from '../lib/store'
import { billRows, waText, paidOf } from '../lib/invoice'
import { api } from '../lib/api'
import { useMyBookings } from '../lib/bookings'
import StatusPill from './StatusPill'
import { HoldWarning, useHoldText } from './HoldTimer'
import Odometer from './Odometer'
import AnimatedNumber from './AnimatedNumber'
import InvoiceView from './InvoiceView'
import PaymentGateway from './gateway/PaymentGateway'
import { CheckIcon, ChatIcon, DownloadIcon, ClipboardIcon } from './Icons'

const COLORS = ['#fde68a', '#6f0202', '#3f87f5', '#10b981', '#f472b6', '#d4a017']
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
  const refresh = async () => { try { setB(await api(`/bookings/${b.id}`)) } catch {} reloadMine() }
  useEffect(() => { if (!fresh) refresh() }, []) // eslint-disable-line
  useEffect(() => { if (stage === 0) { const t = setTimeout(() => setStage(1), 1500); return () => clearTimeout(t) } }, [stage])
  const ics = () => import('./ics').then((m) => m.downloadIcs(b))
  /* A payment is only a request until staff verify it (checked against the bKash/Nagad/bank statement). */
  const submitPayment = async (body) => {
    setBusy(true)
    try { await api(`/bookings/${b.id}/payments`, { method: 'POST', body }); toast('Payment submitted — waiting for verification'); setTrx(''); await refresh() }
    catch (e) { toast(e.message, 'error') }
    finally { setBusy(false) }
  }
  const submitManual = () => {
    if (method !== 'office' && trx.trim().length < 4) { toast('Enter the transaction ID', 'error'); return }
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
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"><CheckIcon width={32} height={32} strokeWidth={3} /></motion.div>
        <h3 className="mt-4 text-2xl font-semibold text-fg">{fresh ? `Request received, ${b.name.split(' ')[0]}!` : `Billing · ${b.eventType}`}</h3>
        <p className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500"><StatusPill status={b.status} />{b.status === 'pending' ? <span>Pay the advance to confirm. We will also call <b>{b.phone}</b>.</span> : null}</p>
        <button onClick={() => copy(b.id, 'Booking ID')} className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 font-mono text-sm font-semibold text-brand-ink transition active:scale-95" aria-label={`Copy booking ID ${b.id}`}>{b.id}<ClipboardIcon width={15} height={15} /></button>
        {b.status === 'pending' && <div className="mx-auto mt-4 max-w-xl text-left"><HoldWarning b={b} hideCta onExpire={refresh} className="!mt-0" /></div>}
      </div>

      <div className="mx-auto mt-6 flex w-fit rounded-full bg-slate-100 p-1" role="tablist">
        {[['bill', 'Your bill'], ['invoice', 'Invoice']].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${tab === id ? 'text-fg' : 'text-slate-500'}`}>
            {tab === id && <motion.span layoutId="bill-tab" className="absolute inset-0 rounded-full bg-surface shadow-sm" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}<span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === 'bill' ? (
          <motion.div key="bill" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-6 space-y-5">
            {/* totals */}
            <div className="rounded-3xl bg-gradient-to-br from-[#6f0202] to-[#9b1c1c] p-6 text-white shadow-lg">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-xs uppercase tracking-widest text-white/70">Total bill</p><Odometer value={perGuest ? Math.round(q.total / b.guests) : q.total} prefix="৳" className="text-4xl font-semibold sm:text-5xl" /><p className="mt-1 text-xs text-white/70">{perGuest ? `per guest · ${b.guests} guests` : `${b.eventType} · ${fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })} · ${q.shiftLabel}`}</p></div>
                <button onClick={() => setPerGuest((v) => !v)} aria-pressed={perGuest} className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white/25 active:scale-95">{perGuest ? 'Show total' : 'Show per guest'}</button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/70">{advanceDue > 0 ? 'Advance due now (30%)' : 'Advance (30%) received'}</p><p className="mt-1 text-2xl font-semibold"><AnimatedNumber value={advanceDue > 0 ? advanceDue : q.advance} prefix="৳" /></p></div>
                <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/70">{b.status === 'pending' && b.holdExpiresAt ? 'Date held for' : 'Paid so far'}</p><p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{b.status === 'pending' && b.holdExpiresAt ? timer : money(paid)}</p></div>
              </div>
            </div>

            {/* breakdown */}
            <div className="rounded-3xl p-5 ring-1 ring-slate-200">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Where your money goes</p>
              <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" onMouseLeave={() => setHover(null)}>
                {rows.map((r) => (
                  <motion.span key={r.id} onMouseEnter={() => setHover(r.id)} initial={{ width: 0 }} animate={{ width: `${(r.amount / q.total) * 100}%`, opacity: hover && hover !== r.id ? 0.35 : 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: r.tone }} className="h-full border-r-2 border-surface last:border-0" />
                ))}
              </div>
              <ul className="mt-4 divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <motion.li key={r.id} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }} onMouseEnter={() => setHover(r.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(r.id)} tabIndex={0}
                    className={`flex items-center gap-3 rounded-xl px-2 py-3 text-sm outline-none transition-colors ${hover === r.id ? 'bg-slate-50' : ''}`}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.tone }} />
                    <span className="min-w-0 flex-1"><span className="block font-medium text-fg">{r.label}</span>{r.note && <span className="block text-xs text-slate-500">{r.note}</span>}</span>
                    <b className="text-fg">{money(r.amount)}</b>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-300 pt-3 text-sm"><span className="font-semibold text-fg">Balance due</span><span className="font-semibold text-fg">{money(balance)}</span></div>
            </div>

            {/* payments so far */}
            {payments.length > 0 && (
              <div className="rounded-3xl p-5 ring-1 ring-slate-200">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Payments</p>
                <ul className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="min-w-0 flex-1"><span className="block font-medium capitalize text-fg">{p.method}{p.reference ? <span className="font-mono text-xs font-normal text-slate-500"> · {p.reference}</span> : null}</span><span className="block text-xs text-slate-500">{fmtDate(p.createdAt.slice(0, 10))}</span></span>
                      <StatusPill status={p.status} /><b className="w-24 text-right text-fg">{money(p.amount)}</b>
                    </li>
                  ))}
                </ul>
                {waiting > 0 && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">{money(waiting)} is waiting for admin verification. Your booking confirms once the advance is verified.</p>}
              </div>
            )}

            {active && dueNow > 0 && (<>
            {/* online card payment (demo gateway) */}
            <div className="relative overflow-hidden rounded-3xl bg-ink p-5 text-white sm:p-6">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-widest text-white/60">Fastest way</p><p className="mt-1 text-lg font-semibold">Pay {advanceDue > 0 ? 'the advance' : 'the balance'} by card</p><p className="mt-0.5 text-sm text-white/60">Visa, Mastercard, Amex · {money(dueNow)} now</p></div>
                <button onClick={() => setShowPay(true)} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100 active:scale-95 disabled:opacity-60">Pay {money(dueNow)}</button>
              </div>
            </div>

            {/* manual payment */}
            <div className="rounded-3xl p-5 ring-1 ring-slate-200">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Or pay manually · {money(dueNow)}</p>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Payment method">
                {PAYMENT.map((m) => (
                  <button key={m.id} role="radio" aria-checked={method === m.id} onClick={() => setMethod(m.id)} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${method === m.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {method === m.id && <motion.span layoutId="pay-pill" className="absolute inset-0 rounded-full" style={{ background: m.color }} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}<span className="relative">{m.label}</span>
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={method} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
                  <p className="text-xs text-slate-500">{pay.kind}</p>
                  <div className="mt-1 flex items-center justify-between gap-3"><p className="break-words font-semibold text-fg">{pay.value}</p>{method !== 'office' && <button onClick={() => copy(pay.value.split(' · ')[0].replace(/^A\/C /, ''), 'Number')} className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-brand-ink ring-1 ring-slate-200 active:scale-95">Copy</button>}</div>
                  {method !== 'office' && <p className="mt-3 text-xs text-slate-500">Use <button onClick={() => copy(b.id, 'Booking ID')} className="font-mono font-semibold text-fg underline decoration-dotted">{b.id}</button> as the reference, then enter the transaction ID below.</p>}
                </motion.div>
              </AnimatePresence>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                {method !== 'office' && <input value={trx} onChange={(e) => setTrx(e.target.value)} maxLength={60} placeholder="Transaction ID (TrxID)" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-surface px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />}
                <button onClick={submitManual} disabled={busy} className="btn-primary disabled:opacity-60">{busy ? 'Submitting…' : method === 'office' ? 'I will pay at the office' : 'Submit payment'}</button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Staff verify the payment against our account, then your booking is confirmed.</p>
            </div>
            </>)}
          </motion.div>
        ) : (
          <motion.div key="inv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6"><InvoiceView b={b} /></motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <a href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(waText(b, pay.label))}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-95"><ChatIcon width={18} height={18} />Send payment proof</a>
        <button onClick={ics} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-fg transition hover:bg-slate-200 active:scale-95"><DownloadIcon width={18} height={18} />Add to calendar</button>
        <button onClick={() => setTab('invoice')} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-fg transition hover:bg-slate-200 active:scale-95"><ClipboardIcon width={18} height={18} />View invoice</button>
      </div>
      <PaymentGateway open={showPay} onClose={() => setShowPay(false)} amount={dueNow} bookingId={b.id} payer={b.name}
        onPaid={(r) => submitPayment({ amount: dueNow, method: 'card', reference: r.ref })} />
      <div className="mt-4 flex justify-center gap-5 text-sm font-medium text-brand">{onManage && <button onClick={onManage} className="hover:underline">My bookings</button>}{onNew && <button onClick={onNew} className="hover:underline">Book another date</button>}</div>
    </div>
  )
}
