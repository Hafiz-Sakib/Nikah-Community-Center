/* Card checkout. Form behaviour adapted from Motion Brew "Payment form" (https://motion-brew.com/components/payment-form)
   (floating labels, gliding focus ring, per-field checks, shake on a bad field, lock button, sealed confirmation),
   ported to JSX and rebuilt on Motion only. The live card comes from "Metal card stack". */
import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { money } from '../../lib/store'
import { GATEWAY_LIVE, brandOf, chargeCard, digitsOf, expiryValid, formatExpiry, formatNumber, luhn } from '../../lib/gateway'
import { CalendarIcon, CloseIcon, UserIcon } from '../Icons'
import { Rolling } from '../brew/AmountSlider'
import { MetalCard } from './MetalCard'
import { BrandLogo } from './marks'

const GLIDE = [0.22, 1, 0.36, 1]
const RING = { type: 'spring', stiffness: 420, damping: 34 }
const SUCCESS = '#269a5a'
const ERROR = '#d6453d'

const CardIcon = () => (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="3" /><path d="M2.5 10h19M6.5 15h4" /></svg>)
const CvcIcon = () => (<svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><rect x="2" y="4.5" width="16" height="11" rx="2.5" /><rect x="2" y="7" width="16" height="2.5" fill="currentColor" stroke="none" /><rect x="11" y="11" width="4.5" height="2.5" rx="0.75" /></svg>)

function Lock({ shut, still }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <motion.path d="M5 7.5V5.25a3 3 0 0 1 6 0V7.5" initial={false} animate={{ y: shut ? 0 : -2.25, rotate: shut ? 0 : -14 }} style={{ originX: '11px', originY: '7.5px' }} transition={still ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 16 }} />
      <rect x="3.25" y="7.5" width="9.5" height="6.5" rx="1.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** A soft well: label floats on focus, the shared ring glides in, a check draws when valid, a bad blur shakes. */
function Field({ id, label, value, onChange, focused, setFocused, icon, valid, error, right, disabled, still, inputProps, className = '', uid, wide, inputRef }) {
  const [touched, setTouched] = useState(false)
  const shake = useAnimationControls()
  const isFocused = focused === id
  const floated = isFocused || value.length > 0
  const showError = touched && !isFocused && !valid && value.length > 0
  const inputId = `${uid}-${id}`
  return (
    <div className={className}>
      <motion.div animate={shake} className={`relative h-14 rounded-full sm:h-[4.25rem] bg-slate-100 transition-colors duration-200 ${!isFocused && !disabled ? 'hover:bg-slate-200/70' : ''}`}>
        {isFocused && <motion.span layoutId={`${uid}-ring`} aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-inset ring-fg" transition={still ? { duration: 0 } : RING} />}
        {showError && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 0 2px ${ERROR}80` }} />}
        <span aria-hidden className={`pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-fg' : 'text-slate-400'}`}>
          <motion.span className="grid" initial={false} animate={isFocused && !still ? { scale: [1, 1.18, 1], rotate: [0, -10, 6, 0] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.45, ease: GLIDE }}>{icon}</motion.span>
        </span>
        <span className="pointer-events-none absolute left-[52px] top-1/2 -translate-y-1/2"><motion.label htmlFor={inputId} className="block origin-left text-sm text-slate-500" initial={false} animate={{ y: floated ? -7 : 0, scale: floated ? 12 / 14 : 1 }} transition={still ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 34 }}>{label}</motion.label></span>
        <input id={inputId} ref={inputRef} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(id)}
          onBlur={() => { setFocused(null); if (value.length) setTouched(true); if (value.length && !valid && !still) shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } }) }}
          aria-invalid={showError || undefined} aria-describedby={showError ? `${inputId}-error` : undefined}
          className={`absolute inset-0 w-full rounded-full bg-transparent pb-1.5 pl-[52px] pt-6 text-base sm:pb-2 sm:pt-7 leading-6 tabular-nums text-fg outline-none placeholder:text-transparent disabled:cursor-not-allowed ${wide ? 'pr-32' : 'pr-12'}`} {...inputProps} />
        <span className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {right}
          <AnimatePresence>
            {valid && (
              <motion.span key="ok" className="grid h-5 w-5 place-items-center" style={{ color: SUCCESS }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden><motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: still ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, ease: GLIDE }} /></svg>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.div>
      <AnimatePresence initial={false}>
        {showError && (
          <motion.p id={`${inputId}-error`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: still ? 0 : 0.25, ease: GLIDE }} className="overflow-hidden px-5 text-xs" style={{ color: ERROR }}>
            <span className="block pt-1.5">{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Scalloped seal that spins in, draws its tick and bursts sparks (Motion Brew "Verify flow" seal, rebuilt on Motion). */
function seal(bumps = 9, depth = 0.085, r = 42) {
  const pts = []
  for (let i = 0; i <= 180; i++) { const t = (i / 180) * Math.PI * 2; const rr = r * (1 + depth * Math.cos(bumps * t)); pts.push(`${(50 + Math.cos(t) * rr).toFixed(2)} ${(50 + Math.sin(t) * rr).toFixed(2)}`) }
  return `M${pts.join(' L')}Z`
}
const SEAL = seal()
function Seal({ still }) {
  const sparks = Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 - Math.PI / 2 + 0.2; return { x1: 60 + Math.cos(a) * 48, y1: 60 + Math.sin(a) * 48, x2: 60 + Math.cos(a) * 58, y2: 60 + Math.sin(a) * 58 } })
  return (
    <svg viewBox="0 0 120 120" className="h-[104px] w-[104px] overflow-visible" aria-hidden>
      {!still && sparks.map((p, i) => (
        <motion.line key={i} {...p} stroke={SUCCESS} strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }} transition={{ duration: 0.7, delay: 0.3 + i * 0.02, times: [0, 0.5, 1] }} />
      ))}
      <motion.g style={{ transformOrigin: '60px 60px' }} initial={still ? false : { scale: 0, rotate: -60 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
        <path d={SEAL} transform="translate(10 10)" fill={SUCCESS} />
        <motion.path d="M44 61l11 11 22-23" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: still ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }} />
      </motion.g>
    </svg>
  )
}

const fmtWhen = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function PaymentGateway({ open, onClose, amount, bookingId, payer = '', onPaid }) {
  const still = !!useReducedMotion()
  const uid = useId()
  const first = useRef(null)
  const [v, setV] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [focused, setFocused] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | loading | done
  const [err, setErr] = useState('')
  const [res, setRes] = useState(null)
  const set = (patch) => { setErr(''); setV((p) => ({ ...p, ...patch })) }

  useEffect(() => { if (open) { setV({ number: '', name: (payer || '').replace(/[^\p{L}\s'.-]/gu, '').slice(0, 40), expiry: '', cvc: '' }); setPhase('idle'); setErr(''); setRes(null); setFocused(null) } }, [open])
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const k = (e) => { if (e.key === 'Escape' && phase !== 'loading') onClose() }
    document.addEventListener('keydown', k)
    const t = setTimeout(() => first.current?.focus(), 350)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', k); clearTimeout(t) }
  }, [open, phase, onClose])

  const digits = digitsOf(v.number)
  const brand = brandOf(digits)
  const amex = brand === 'Amex'
  const numberOk = digits.length === (amex ? 15 : 16) && luhn(digits)
  const nameOk = v.name.trim().length > 1
  const expiryOk = expiryValid(v.expiry)
  const cvcOk = v.cvc.length === (amex ? 4 : 3)
  const ready = numberOk && nameOk && expiryOk && cvcOk
  const locked = phase !== 'idle'

  const submit = async (e) => {
    e.preventDefault()
    if (!ready || locked) return
    setPhase('loading'); setErr('')
    try {
      const r = await chargeCard({ amount, bookingId, card: { number: digits, name: v.name.trim(), expiry: v.expiry, cvc: v.cvc } })
      // From here on only the safe parts (brand, last 4, reference) are kept: drop the raw card from state.
      setV({ number: '', name: '', expiry: '', cvc: '' })
      setRes(r); setPhase('done'); onPaid?.(r)
    } catch (ex) { setPhase('idle'); setErr(ex.message || 'Payment failed. Please try again.') }
  }
  const fillTest = () => {
    const y = String((new Date().getFullYear() + 2) % 100).padStart(2, '0')
    set({ number: '4242 4242 4242 4242', name: payer || 'Test Customer', expiry: `12/${y}`, cvc: '123' })
  }

  const shownDigits = res ? '' : digits
  const common = { uid, focused, setFocused, disabled: locked, still }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => phase !== 'loading' && onClose()} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`}
            initial={still ? false : { y: 48, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 32, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="relative grid max-h-[100dvh] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-t-[2rem] bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl sm:max-h-[92dvh] sm:rounded-[2rem] lg:grid-cols-[1.02fr_1fr] 2xl:max-w-5xl">
            <button onClick={onClose} disabled={phase === 'loading'} aria-label="Close checkout" className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 disabled:opacity-40 lg:bg-slate-100 lg:text-fg lg:hover:bg-slate-200"><CloseIcon /></button>

            {/* left: summary + live card */}
            <div className="relative overflow-hidden bg-ink p-4 pt-5 text-white sm:p-8">
              <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#9b1c1c]/40 blur-3xl" />
              <div className="relative">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/60"><svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden><path d="M5 7V5.25a3 3 0 0 1 6 0V7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /><rect x="3.25" y="7" width="9.5" height="7" rx="1.75" /></svg>Secure checkout</p>
                <h2 id={`${uid}-title`} className="mt-3 text-sm text-white/70">Your payment</h2>
                <p className="mt-1 text-3xl font-semibold sm:text-5xl"><Rolling text={money(amount)} still={still} /></p>
                <p className="mt-2 text-xs text-white/50">Booking <span className="tabular-nums text-white/80">{bookingId}</span></p>
                <div className="mt-4 sm:mt-8"><MetalCard owner={payer.toUpperCase()} digits={shownDigits} brand={res ? res.brand : brand} holder={res ? '' : v.name.toUpperCase()} expiry={res ? '' : v.expiry} cvc={v.cvc} flipped={focused === 'cvc' && !res} /></div>
                <ul className="mt-4 hidden space-y-2 text-xs text-white/60 sm:mt-8 sm:block">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Card number and CVC are never saved on this device</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />The balance is paid later, before the event</li>
                </ul>
              </div>
            </div>

            {/* right: form or receipt */}
            <div className="relative p-4 sm:min-h-[460px] sm:p-8">
              <AnimatePresence mode="wait" initial={false}>
                {phase !== 'done' ? (
                  <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, scale: 0.97, filter: 'blur(6px)', transition: { duration: 0.25 } }} initial={still ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: GLIDE }}>
                    <div className="flex items-start justify-between gap-3 pr-10 lg:pr-12">
                      <div><h3 className="text-lg font-semibold tracking-tight text-fg">Pay by card</h3><p className="mt-1 text-sm text-slate-500">Visa, Mastercard, Amex and Discover accepted.</p></div>
                    </div>
                    {!GATEWAY_LIVE && (
                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800 ring-1 ring-amber-200">
                        <span className="rounded-full bg-amber-200 px-2 py-0.5 font-semibold uppercase tracking-wide">Demo mode</span>
                        <span>No real charge is made.</span>
                        <button type="button" onClick={fillTest} disabled={locked} className="font-semibold underline decoration-dotted underline-offset-2 disabled:opacity-50">Use test card</button>
                      </div>
                    )}
                    <LayoutGroup id={uid}>
                      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3">
                        <Field {...common} id="number" wide inputRef={first} label="Card number" value={v.number} onChange={(x) => set({ number: formatNumber(digitsOf(x)) })} valid={numberOk} error="Check the card number." className="col-span-2" icon={<CardIcon />}
                          right={<AnimatePresence mode="popLayout">{brand && <motion.span key={brand} initial={still ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={still ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: GLIDE }} className="grid"><BrandLogo brand={brand} /></motion.span>}</AnimatePresence>}
                          inputProps={{ inputMode: 'numeric', autoComplete: 'cc-number', maxLength: 23 }} />
                        <Field {...common} id="name" label="Name on card" value={v.name} onChange={(x) => set({ name: x.replace(/[^\p{L}\s'.-]/gu, '').slice(0, 40) })} valid={nameOk} error="Enter the name on the card." className="col-span-2" icon={<UserIcon width={20} height={20} />} inputProps={{ autoComplete: 'cc-name', autoCapitalize: 'words' }} />
                        <Field {...common} id="expiry" label="Expiry" value={v.expiry} onChange={(x) => set({ expiry: x.length < v.expiry.length && v.expiry.endsWith('/') ? x.replace('/', '') : formatExpiry(x) })} valid={expiryOk} error="Use a future date, MM/YY." icon={<CalendarIcon width={20} height={20} />} inputProps={{ inputMode: 'numeric', autoComplete: 'cc-exp', maxLength: 5 }} />
                        <Field {...common} id="cvc" label="CVC" value={v.cvc} onChange={(x) => set({ cvc: digitsOf(x).slice(0, amex ? 4 : 3) })} valid={cvcOk} error={amex ? 'Four digits on the front.' : 'Three digits on the back.'} icon={<CvcIcon />} inputProps={{ inputMode: 'numeric', autoComplete: 'cc-csc', maxLength: 4 }} />
                      </div>
                    </LayoutGroup>

                    <AnimatePresence>{err && <motion.p role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{err}</motion.p>}</AnimatePresence>

                    <motion.button type="submit" aria-disabled={!ready || locked} whileTap={ready && !locked && !still ? { scale: 0.98 } : undefined}
                      className={`mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${ready || locked ? 'cursor-pointer bg-ink text-white' : 'cursor-default bg-slate-100 text-slate-400'}`}>
                      <span className="relative grid h-4 w-4 place-items-center">
                        {phase === 'loading'
                          ? <motion.span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: still ? 0 : 360 }} transition={{ rotate: { duration: 0.8, ease: 'linear', repeat: Infinity } }} />
                          : <Lock shut={ready} still={still} />}
                      </span>
                      {phase === 'loading' ? 'Processing payment' : `Pay ${money(amount)}`}
                    </motion.button>
                    <p className="mt-3 text-center text-xs text-slate-400">By paying you agree to our booking and cancellation terms.</p>
                  </motion.form>
                ) : (
                  <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: GLIDE, delay: still ? 0 : 0.1 }} className="flex h-full flex-col" role="status">
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <Seal still={still} />
                      <h3 className="mt-3 text-xl font-semibold tracking-tight text-fg">Payment submitted</h3>
                      <p className="mt-1 text-sm text-slate-500">Thank you{payer ? `, ${payer.split(' ')[0]}` : ''}. It counts as paid for now and your date stays held while our team verifies it.</p>
                      <dl className="mt-6 w-full max-w-sm divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4 text-left text-sm">
                        {[['Amount', money(res.amount)], ['Booking', res.bookingId], ['Reference', res.ref], ['Card', `${res.brand || 'Card'} •••• ${res.last4}`], ['Date', fmtWhen(res.paidAt)]].map(([k, val]) => (
                          <div key={k} className="flex items-center justify-between gap-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="font-semibold tabular-nums text-fg">{val}</dd></div>
                        ))}
                      </dl>
                    </div>
                    <button onClick={onClose} className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-ink text-sm font-semibold text-white transition active:scale-[0.98]">Done</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
