import { forwardRef, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PAYMENT, CONTACT } from '../data'
import { money, toast } from '../lib/store'
import { BrandLogo } from './gateway/marks'
import PayLogo from './PayLogo'
import { CheckIcon, ClipboardIcon, LockIcon, MapPinIcon, ClockIcon, ShieldIcon, PhoneIcon, ChatIcon } from './Icons'

const GLIDE = [0.22, 1, 0.36, 1]
const tint = (c, a = '14') => `${c}${a}`

function useCopy() {
  const [done, setDone] = useState(null)
  const copy = async (text, key, what) => {
    try { await navigator.clipboard.writeText(text); setDone(key); toast(`${what} copied`); setTimeout(() => setDone((k) => (k === key ? null : k)), 1600) }
    catch { toast('Copy not available here', 'error') }
  }
  return [done, copy]
}

function CopyBtn({ on, onClick, label }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold ring-1 transition active:scale-95 ${on ? 'bg-emerald-500 text-white ring-emerald-500' : 'bg-surface text-brand-ink ring-brand/40 hover:ring-brand'}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={on ? 'ok' : 'cp'} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.14 }} className="grid">
          {on ? <CheckIcon width={14} height={14} strokeWidth={3} /> : <ClipboardIcon width={14} height={14} />}
        </motion.span>
      </AnimatePresence>
      {on ? 'Copied' : 'Copy'}
    </button>
  )
}

function Tile({ m, selected, onSelect, onKey, reduce }) {
  return (
    <button type="button" role="radio" aria-checked={selected} tabIndex={selected ? 0 : -1} onClick={onSelect} onKeyDown={onKey} data-pay={m.id}
      className="group relative flex h-full w-full min-w-0 flex-col items-center gap-2 rounded-2xl p-2.5 pb-2 text-center outline-none ring-1 ring-slate-200 transition-colors hover:ring-slate-300 focus-visible:ring-2 focus-visible:ring-brand sm:p-3">
      {selected && <motion.span layoutId="pay-sel" aria-hidden className="absolute inset-0 rounded-2xl" style={{ background: tint(m.color, '12'), boxShadow: `inset 0 0 0 2px ${m.color}` }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />}
      <motion.span className="relative" whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.94 }}><PayLogo id={m.id} size="md" /></motion.span>
      <span className={`relative text-xs font-semibold sm:text-[13px] ${selected ? 'text-fg' : 'text-slate-600 group-hover:text-fg'}`}>{m.label}</span>
      <AnimatePresence>
        {selected && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }} className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full text-white ring-2 ring-surface" style={{ background: m.color }} aria-hidden><CheckIcon width={11} height={11} strokeWidth={3.5} /></motion.span>}
      </AnimatePresence>
    </button>
  )
}

/* How much to pay now. Before the advance is in: the advance, or everything. After: any part of the balance, or all of it. */
function AmountPicker({ m, choice, setChoice, custom, setCustom, opts, amount, ok, reduce }) {
  const min = m.needAdvance > 0 ? m.needAdvance : 1
  const left = m.room - amount
  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-slate-500">How much would you like to pay now?</p>
      <div role="radiogroup" aria-label="Amount to pay" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {opts.map((o) => {
          const sel = choice === o.id
          return (
            <button key={o.id} type="button" role="radio" aria-checked={sel} onClick={() => setChoice(o.id)} className="relative flex min-h-[3.75rem] min-w-0 flex-col items-start justify-center rounded-2xl px-3.5 py-2 text-left outline-none ring-1 ring-slate-200 transition-colors hover:ring-slate-300 focus-visible:ring-2 focus-visible:ring-brand">
              {sel && <motion.span layoutId="amt-sel" aria-hidden className="absolute inset-0 rounded-2xl bg-brand-soft ring-2 ring-inset ring-brand" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative text-xs text-slate-500">{o.label}</span>
              <span className="relative truncate text-base font-semibold tabular-nums text-fg">{o.id === 'custom' ? 'Type amount' : money(o.value)}</span>
            </button>
          )
        })}
      </div>
      <AnimatePresence initial={false}>
        {choice === 'custom' && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: GLIDE }} className="overflow-hidden">
            <label className="mt-2.5 block">
              <span className="sr-only">Amount in taka</span>
              <span className="relative block">
                <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">৳</span>
                <input value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 9))} inputMode="numeric" autoComplete="off" placeholder={`${min.toLocaleString('en-IN')} – ${m.room.toLocaleString('en-IN')}`} aria-invalid={custom !== '' && !ok || undefined}
                  className={`h-12 w-full rounded-2xl border-2 bg-surface pl-9 pr-4 text-lg font-semibold tabular-nums text-fg outline-none placeholder:text-base placeholder:font-normal placeholder:text-slate-400 focus:ring-4 ${custom !== '' && !ok ? 'border-red-400 focus:ring-red-500/15' : 'border-slate-300 focus:border-brand focus:ring-brand/15'}`} />
              </span>
              {custom !== '' && !ok && <span className="mt-1.5 block text-xs text-red-600 dark:text-red-300">{amount > m.room ? `That is more than the ${money(m.room)} still to pay.` : `Pay at least ${money(min)}${m.needAdvance > 0 ? ' to cover the advance' : ''}.`}</span>}
            </label>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-2.5 flex items-center gap-2 text-sm text-slate-600" aria-live="polite">
        {ok ? (left === 0
          ? <><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white"><CheckIcon width={12} height={12} strokeWidth={3.5} /></span><span><b className="text-fg">This settles everything.</b> Nothing left to pay afterwards.</span></>
          : <span>Still to pay after this: <b className="tabular-nums text-fg">{money(left)}</b>{m.needAdvance === 0 ? ' · you can pay it later, online or at the office.' : ''}</span>) : <span className="text-slate-500">Choose or type an amount to continue.</span>}
      </p>
    </div>
  )
}

const PaymentHub = forwardRef(function PaymentHub({ bookingId, m, busy, method, setMethod, onCard, onSubmit }, ref) {
  const reduce = useReducedMotion()
  const opts = useMemo(() => {
    const o = []
    if (m.needAdvance > 0) o.push({ id: 'advance', label: 'Advance (30%)', value: m.needAdvance })
    if (m.room > 0 && m.room !== m.needAdvance) o.push({ id: 'full', label: m.needAdvance > 0 ? 'Pay in full' : 'Full balance', value: m.room })
    if (m.needAdvance === 0 && m.room >= 2000) o.push({ id: 'half', label: 'Half of it', value: Math.ceil(m.room / 2 / 100) * 100 })   // round up to a clean ৳100
    o.push({ id: 'custom', label: 'Other amount' })
    return o.filter((x, i, a) => x.id === 'custom' || a.findIndex((y) => y.value === x.value) === i)
  }, [m.needAdvance, m.room])
  const [choice, setChoice] = useState(opts[0].id)
  const [custom, setCustom] = useState('')
  const cur = opts.find((o) => o.id === choice) ?? opts[0]
  const amount = cur.id === 'custom' ? Number(custom || 0) : cur.value
  const minPay = m.needAdvance > 0 ? m.needAdvance : 1
  const amountOk = Number.isInteger(amount) && amount >= minPay && amount <= m.room
  useEffect(() => { setCustom(''); setChoice(opts[0].id) }, [m.room, m.needAdvance]) // eslint-disable-line
  const [trx, setTrx] = useState('')
  const [touched, setTouched] = useState(false)
  const [copied, copy] = useCopy()
  const pm = PAYMENT.find((x) => x.id === method) || PAYMENT[1]
  const trxOk = trx.replace(/[^a-z0-9]/gi, '').length >= 6
  const showErr = touched && !trxOk
  const pick = (id) => { setMethod(id); setTouched(false) }
  const onKey = (e) => {
    const i = PAYMENT.findIndex((x) => x.id === method)
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = PAYMENT[(i + d + PAYMENT.length) % PAYMENT.length]
    pick(n.id); requestAnimationFrame(() => e.currentTarget.parentElement.querySelector(`[data-pay="${n.id}"]`)?.focus())
  }
  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!amountOk) { toast('Choose a valid amount', 'error'); return }
    if (!trxOk) { setTouched(true); toast('Enter the transaction ID', 'error'); return }
    const ok = await onSubmit({ amount, method: pm.id, ...(trx.trim() ? { reference: trx.trim() } : {}) })
    if (ok) { setTrx(''); setTouched(false) }
  }
  const wallet = pm.id === 'bkash' || pm.id === 'nagad'
  const num = (pm.value || '').split(' · ')[0].replace(/^A\/C /, '')

  return (
    <section ref={ref} id="pay-hub" aria-labelledby="pay-hub-title" className="scroll-mt-24 rounded-3xl bg-surface p-4 ring-1 ring-slate-200 shadow-card sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 id="pay-hub-title" className="text-lg font-semibold tracking-tight text-fg">{m.needAdvance > 0 ? 'Pay the advance' : 'Pay the balance'}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{m.needAdvance > 0 ? 'Pay the advance to confirm your date, or pay in full.' : 'Your advance is in. Pay the rest in parts or all at once.'}</p>
        </div>
        <p className="rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-semibold tabular-nums text-brand-ink ring-1 ring-brand/30">{m.needAdvance > 0 ? money(m.needAdvance) : money(m.room)} <span className="font-medium opacity-70">{m.needAdvance > 0 ? 'advance due' : 'balance'}</span></p>
      </div>

      <AmountPicker m={m} opts={opts} choice={choice} setChoice={setChoice} custom={custom} setCustom={setCustom} amount={amount} ok={amountOk} reduce={reduce} />

      <p className="mt-5 text-xs font-medium text-slate-500">Pay with</p>
      <div role="radiogroup" aria-label="Payment method" className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {PAYMENT.map((x) => (
          <div key={x.id} className="min-w-0"><Tile m={x} selected={method === x.id} onSelect={() => pick(x.id)} onKey={onKey} reduce={reduce} /></div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={pm.id} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: GLIDE }} className="mt-4">
          {pm.id === 'card' && (
            <div className="relative overflow-hidden rounded-2xl bg-brand-soft p-4 text-fg ring-1 ring-brand/25 sm:p-5">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand/15 blur-3xl" />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-brand-ink"><LockIcon width={14} height={14} />Instant, secure checkout</p>
                  <p className="mt-1 text-lg font-semibold">Pay {money(amount)} by card</p>
                  <div className="mt-3 flex flex-wrap gap-2">{['Visa', 'Mastercard', 'Amex', 'Discover'].map((b) => <BrandLogo key={b} brand={b} />)}</div>
                </div>
                <button type="button" onClick={() => amountOk && onCard(amount)} disabled={busy || !amountOk} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-semibold text-white shadow-glow ring-1 ring-white/20 transition hover:bg-brand-dark active:scale-95 disabled:opacity-60 sm:w-auto">Continue to card</button>
              </div>
              <p className="relative mt-3 text-xs text-slate-500">Card number and CVC are never saved. The booking confirms once staff verify the payment.</p>
            </div>
          )}

          {(wallet || pm.id === 'bank') && (
            <form onSubmit={submit} noValidate>
              <div className="rounded-2xl p-3.5 ring-1 ring-slate-200 sm:p-5" style={{ background: tint(pm.color, '0d') }}>
                <div className="flex items-center gap-3">
                  <PayLogo id={pm.id} size="lg" />
                  <div className="min-w-0"><p className="text-xs text-slate-500">{pm.kind}</p><p className="text-base font-semibold text-fg sm:text-lg">Send {money(amount)} to</p></div>
                </div>
                <div className="mt-3.5 flex items-center justify-between gap-3 rounded-xl bg-surface p-3 ring-1 ring-slate-200 sm:p-3.5">
                  <p className={`min-w-0 break-words font-semibold text-fg ${wallet ? 'text-xl tabular-nums tracking-wide sm:text-2xl' : 'text-sm leading-relaxed'}`}>{pm.value}</p>
                  <CopyBtn on={copied === 'num'} onClick={() => copy(num, 'num', wallet ? 'Number' : 'Account number')} label={`Copy ${pm.label} number`} />
                </div>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3.5 py-2.5 ring-1 ring-slate-200"><span className="min-w-0"><span className="block text-[11px] text-slate-500">Amount</span><b className="block tabular-nums text-fg">{money(amount)}</b></span><CopyBtn on={copied === 'amt'} onClick={() => copy(String(amount), 'amt', 'Amount')} label="Copy amount" /></div>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3.5 py-2.5 ring-1 ring-slate-200"><span className="min-w-0"><span className="block text-[11px] text-slate-500">Reference</span><b className="block truncate font-mono text-fg">{bookingId}</b></span><CopyBtn on={copied === 'ref'} onClick={() => copy(bookingId, 'ref', 'Booking ID')} label="Copy booking ID" /></div>
                </div>
                <ol className="mt-4 space-y-2.5">
                  {pm.steps.map((t, i) => (
                    <motion.li key={t} initial={reduce ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.06, ease: GLIDE }} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white" style={{ background: pm.color }}>{i + 1}</span><span className="min-w-0 flex-1">{t}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
                <label className="block min-w-0 flex-1">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">{wallet ? 'Transaction ID (TrxID)' : 'Transfer / slip reference'}</span>
                  <span className="relative block">
                    <input value={trx} onChange={(e) => setTrx(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} onBlur={() => trx && setTouched(true)} maxLength={60} placeholder={wallet ? 'e.g. 9A7K2M4XQP' : 'e.g. TRF123456'} enterKeyHint="send" autoCapitalize="characters" autoCorrect="off" autoComplete="off" aria-invalid={showErr || undefined} aria-describedby="trx-hint"
                      className={`h-12 w-full min-w-0 rounded-2xl border-2 bg-surface pl-4 pr-11 font-mono text-base tracking-wider text-fg outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:ring-4 sm:text-sm ${showErr ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : trxOk ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/15' : 'border-slate-300 focus:border-brand focus:ring-brand/15'}`} />
                    <AnimatePresence>{trxOk && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-3.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-emerald-500 text-white" aria-hidden><CheckIcon width={12} height={12} strokeWidth={3.5} /></motion.span>}</AnimatePresence>
                  </span>
                  <span id="trx-hint" className={`mt-1.5 block text-xs ${showErr ? 'text-red-600 dark:text-red-300' : 'text-slate-500'}`}>{showErr ? 'Enter at least 6 letters or digits from the receipt.' : 'Found on the confirmation message or receipt.'}</span>
                </label>
                <button type="submit" disabled={busy} aria-disabled={!trxOk} className={`mt-0 inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60 sm:mt-[1.375rem] sm:w-auto ${trxOk ? 'shadow-lg' : 'opacity-80'}`} style={{ background: pm.color }}>
                  {busy ? <><motion.span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }} />Submitting…</> : <><ShieldIcon width={16} height={16} />Submit payment</>}
                </button>
              </div>
            </form>
          )}

          {pm.id === 'office' && (
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 sm:p-5">
              <div className="flex items-center gap-3"><PayLogo id="office" size="lg" /><div className="min-w-0"><p className="text-xs text-slate-500">{pm.kind}</p><p className="text-base font-semibold text-fg sm:text-lg">Pay at the venue{m.needAdvance === 0 ? ' or after the event' : ''}</p></div></div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{m.needAdvance > 0 ? 'Bring the advance to our office before the hold runs out.' : 'You can pay the rest in cash or by card at our office, before the event or once it is over.'} Our team records it here the moment you pay, and your balance updates.</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2.5"><MapPinIcon width={18} height={18} className="mt-0.5 shrink-0 text-slate-400" />{CONTACT.address}</li>
                <li className="flex items-start gap-2.5"><ClockIcon width={18} height={18} className="mt-0.5 shrink-0 text-slate-400" />{CONTACT.hours}</li>
              </ul>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-surface px-6 text-sm font-semibold text-fg ring-1 ring-slate-300 transition hover:bg-slate-100 active:scale-95"><PhoneIcon width={16} height={16} />Call the office</a>
                <a href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hello! I will pay for booking ${bookingId} at the office.`)}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95"><ChatIcon width={16} height={16} />WhatsApp us</a>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500"><ShieldIcon width={14} height={14} className="mt-0.5 shrink-0" />Online payments are checked by our staff against our account. Office payments are recorded by staff, so you never need to enter them yourself.</p>
    </section>
  )
})
export default PaymentHub
