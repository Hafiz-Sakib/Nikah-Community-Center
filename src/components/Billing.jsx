import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PAYMENT, CONTACT } from '../data'
import { fmtDate, money, toast, SHIFTS, updateBooking } from '../lib/store'
import { billRows, waText } from '../lib/invoice'
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

function useCountdown(createdAt) {
  const end = new Date(createdAt).getTime() + 24 * 3600 * 1000
  const [left, setLeft] = useState(Math.max(0, end - Date.now()))
  useEffect(() => { const t = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000); return () => clearInterval(t) }, [end])
  const p = (n) => String(n).padStart(2, '0')
  return `${p(Math.floor(left / 3600000))}:${p(Math.floor((left % 3600000) / 60000))}:${p(Math.floor((left % 60000) / 1000))}`
}

const copy = async (text, what) => { try { await navigator.clipboard.writeText(text); toast(`${what} copied`) } catch { toast('Copy not available here', 'error') } }

export default function Billing({ b, onNew, onManage }) {
  const reduce = useReducedMotion()
  const [stage, setStage] = useState(reduce ? 1 : 0)
  const [tab, setTab] = useState('bill')
  const [hover, setHover] = useState(null)
  const [method, setMethod] = useState('bkash')
  const [perGuest, setPerGuest] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [paid, setPaid] = useState(b.payment || null)
  const { rows, q } = useMemo(() => billRows(b), [b])
  const s = SHIFTS.find((x) => x.id === b.shift)
  const pay = PAYMENT.find((m) => m.id === method)
  const timer = useCountdown(b.createdAt)
  const balance = q.total - q.advance
  useEffect(() => { if (stage === 0) { const t = setTimeout(() => setStage(1), 1500); return () => clearTimeout(t) } }, [stage])
  const ics = () => import('./ics').then((m) => m.downloadIcs(b))

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
        <Confetti />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"><CheckIcon width={32} height={32} strokeWidth={3} /></motion.div>
        <h3 className="mt-4 text-2xl font-semibold text-fg">Request received, {b.name.split(' ')[0]}!</h3>
        <p className="mt-1 text-sm text-slate-500">Pay the advance to confirm. We will also call <b>{b.phone}</b>.</p>
        <button onClick={() => copy(b.id, 'Booking ID')} className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 font-mono text-sm font-semibold text-brand-ink transition active:scale-95" aria-label={`Copy booking ID ${b.id}`}>{b.id}<ClipboardIcon width={15} height={15} /></button>
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
                <div><p className="text-xs uppercase tracking-widest text-white/70">Total bill</p><Odometer value={perGuest ? Math.round(q.total / b.guests) : q.total} prefix="৳" className="text-4xl font-semibold sm:text-5xl" /><p className="mt-1 text-xs text-white/70">{perGuest ? `per guest · ${b.guests} guests` : `${b.eventType} · ${fmtDate(b.date, { day: 'numeric', month: 'short', year: 'numeric' })} · ${s.label}`}</p></div>
                <button onClick={() => setPerGuest((v) => !v)} aria-pressed={perGuest} className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white/25 active:scale-95">{perGuest ? 'Show total' : 'Show per guest'}</button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/70">Advance due now (30%)</p><p className="mt-1 text-2xl font-semibold"><AnimatedNumber value={q.advance} prefix="৳" /></p></div>
                <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/70">Date held for</p><p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{timer}</p></div>
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
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-300 pt-3 text-sm"><span className="font-semibold text-fg">Balance after advance</span><span className="font-semibold text-fg">{money(balance)}</span></div>
            </div>

            {/* online card payment */}
            <div className="relative overflow-hidden rounded-3xl bg-ink p-5 text-white sm:p-6">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
              {paid ? (
                <div className="relative flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500"><CheckIcon width={22} height={22} /></span>
                  <div className="min-w-0"><p className="font-semibold">Advance paid · {money(paid.amount)}</p><p className="mt-0.5 text-sm text-white/60">{paid.brand || 'Card'} •••• {paid.last4} · Ref <span className="font-mono">{paid.ref}</span></p></div>
                </div>
              ) : (
                <div className="relative flex flex-wrap items-center justify-between gap-4">
                  <div><p className="text-xs font-semibold uppercase tracking-widest text-white/60">Fastest way</p><p className="mt-1 text-lg font-semibold">Pay the advance by card</p><p className="mt-0.5 text-sm text-white/60">Visa, Mastercard, Amex · {money(q.advance)} now</p></div>
                  <button onClick={() => setShowPay(true)} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100 active:scale-95">Pay {money(q.advance)}</button>
                </div>
              )}
            </div>

            {/* payment */}
            <div className="rounded-3xl p-5 ring-1 ring-slate-200">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{paid ? 'Other ways to pay the balance' : 'Or pay manually'} · {money(paid ? balance : q.advance)}</p>
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
                  {method !== 'office' && <p className="mt-3 text-xs text-slate-500">Use <button onClick={() => copy(b.id, 'Booking ID')} className="font-mono font-semibold text-fg underline decoration-dotted">{b.id}</button> as the reference, then send us the transaction ID on WhatsApp.</p>}
                </motion.div>
              </AnimatePresence>
            </div>
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
      <PaymentGateway open={showPay} onClose={() => setShowPay(false)} amount={q.advance} bookingId={b.id} payer={b.name}
        onPaid={(r) => { const p = { method: 'card', brand: r.brand, last4: r.last4, ref: r.ref, amount: r.amount, paidAt: r.paidAt }; setPaid(p); updateBooking(b.id, { payment: p }); toast('Advance payment received') }} />
      <div className="mt-4 flex justify-center gap-5 text-sm font-medium text-brand"><button onClick={onManage} className="hover:underline">My bookings</button><button onClick={onNew} className="hover:underline">Book another date</button></div>
    </div>
  )
}
