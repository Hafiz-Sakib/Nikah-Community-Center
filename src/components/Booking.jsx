import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { packages, addons, eventTypes, events, foodPkgs, foodItems, packagesFor, defaultPackageFor, capOf, HALL_CAP } from '../data'
import { takenSlots, shiftFree, SHIFTS, quote, money, fmtDate, toast, tomorrowISO } from '../lib/store'
import { useAuth } from '../context/AuthContext'
import { useMyBookings } from '../lib/bookings'
import { useAvailability } from '../lib/useAvailability'
import { api } from '../lib/api'
import { GoogleG } from './AuthShell'
import Calendar from './Calendar'
import Modal from './Modal'
import Button from './brew/Button'
import { TiltCard } from './brew/TiltCard'
import { Rolling } from './brew/AmountSlider'
import Odometer from './Odometer'
import { CalendarIcon, CheckIcon, ClockIcon, MinusIcon, PlusIcon, ArrowRight, ChevronLeft, EditIcon, ShieldIcon, UsersIcon, SparklesIcon, MusicIcon, CameraIcon, HeartIcon, ICONS2 } from './Icons'

/* Booking flow: Event -> Date & shift -> Details -> Confirm.
   Money rules (price, 30% advance, 48 h hold) are decided by the server; the numbers on screen use the same
   formulas so what you see is what the bill will say, and the server's answer is compared after booking. */
const STEPS = [
  { id: 'event', label: 'Event', hint: 'Type, package, guests' },
  { id: 'date', label: 'Date & shift', hint: 'Live availability' },
  { id: 'details', label: 'Details', hint: 'Food, extras, contact' },
  { id: 'confirm', label: 'Confirm', hint: 'Review & book' },
]
const HOLD_HOURS = 48
const DRAFT = 'ncc.bookingDraft'
const EASE = [0.22, 1, 0.36, 1]
function loadDraft() { try { const d = JSON.parse(sessionStorage.getItem(DRAFT) || 'null'); return d && typeof d === 'object' ? d : null } catch { return null } }
const saveDraft = (f) => { try { sessionStorage.setItem(DRAFT, JSON.stringify(f)); sessionStorage.setItem('ncc.returnTo', '/booking') } catch {} }
const phoneOk = (p) => /^(?:\+?88)?01[3-9]\d{8}$/.test(p.replace(/[\s-]/g, ''))
const emailOk = (e) => !e || /^\S+@\S+\.\S+$/.test(e)
const input = 'w-full rounded-2xl border border-slate-300 bg-surface px-4 py-3 text-base text-fg outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15 sm:text-sm'
const foodFor = (packageId) => (foodPkgs.find((m) => m.id === packageId) ?? foodPkgs[0]).id   // a package with no menu of its own (birthday, milad...) starts on the first menu
const isWeekend = (iso) => !!iso && [5, 6].includes(new Date(`${iso}T00:00:00`).getDay())
const hallPrice = (pkg, s, date) => { const base = Math.round(pkg.price * s.mult); return base + (isWeekend(date) ? Math.round(base * 0.15) : 0) }   // same as the server

const SunI = (p) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden {...p}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></svg>
const MoonI = (p) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
const DayI = (p) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden {...p}><circle cx="12" cy="12" r="9" /><path d="M12 3v18" /><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" opacity=".25" /></svg>
const ADDON_ICON = { stage: SparklesIcon, sound: MusicIcon, photo: CameraIcon, bridal: HeartIcon }
const SHIFT_ICON = { morning: SunI, evening: MoonI, full: DayI }

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      {children}
      <AnimatePresence>{error && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1 block text-xs text-red-500">{error}</motion.span>}</AnimatePresence>
    </label>
  )
}

function Heading({ title, text }) {
  return <div className="mb-3"><h3 className="text-base font-semibold text-fg sm:text-lg">{title}</h3>{text && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{text}</p>}</div>
}

/* A choice that looks like a card: used for shifts, catering, menus, extras. */
function Choice({ on, disabled, onClick, children, className = '' }) {
  return (
    <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick}
      className={`relative w-full rounded-2xl p-4 text-left outline-none ring-1 transition-[box-shadow,background-color] focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-45 ${on ? 'bg-brand-soft ring-2 ring-brand' : 'bg-surface ring-slate-200 enabled:hover:ring-brand/50'} ${className}`}>
      {children}
    </button>
  )
}
const Tick = ({ on }) => (
  <span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ring-1 transition-colors ${on ? 'bg-brand text-white ring-brand' : 'bg-surface text-transparent ring-slate-300'}`}><CheckIcon width={14} height={14} strokeWidth={3} /></span>
)

/* ---------- stepper ---------- */
function Stepper({ step, onJump }) {
  return (
    <nav aria-label="Booking progress" className="mb-6 sm:mb-8">
      <ol className="flex items-start">
        {STEPS.map((s, i) => {
          const done = i < step, cur = i === step
          return (
            <li key={s.id} className="relative flex flex-1 flex-col items-center text-center" aria-current={cur ? 'step' : undefined}>
              {i > 0 && <span aria-hidden className="absolute right-1/2 top-[17px] h-0.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-slate-200"><motion.span className="block h-full origin-left bg-brand" initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE }} /></span>}
              <button type="button" disabled={!done} onClick={() => onJump(i)} aria-label={`${done ? 'Go back to ' : ''}${s.label}`}
                className={`relative z-10 grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ring-4 ring-surface transition-colors disabled:cursor-default ${done ? 'bg-brand text-white hover:bg-brand-dark' : cur ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'bg-slate-100 text-slate-500'}`}>
                {done ? <CheckIcon width={16} height={16} strokeWidth={3} /> : i + 1}
              </button>
              <span className={`mt-2 text-[11px] font-semibold leading-tight sm:text-sm ${cur ? 'text-fg' : done ? 'text-brand-ink' : 'text-slate-400'}`}>{s.label}</span>
              <span className="mt-0.5 hidden text-xs text-slate-400 md:block">{s.hint}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ---------- receipt (dark card, always the same figures the bill will show) ---------- */
function Row({ k, v }) {
  return <div className="flex items-start justify-between gap-4 py-1.5 text-sm text-slate-600"><span className="min-w-0">{k}</span><span className="shrink-0 text-right font-medium tabular-nums text-fg">{v}</span></div>
}
function Receipt({ f, q, pkg, shift, menu, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.75rem] bg-surface p-5 shadow-dock ring-1 ring-slate-200 sm:p-6 ${className}`}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand via-sky-400 to-emerald-400" />
      <div className="flex items-center justify-between gap-3 pt-1"><p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Your booking</p><span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand-ink">{pkg.name}</span></div>
      <div className="mt-3 divide-y divide-dashed divide-slate-200">
        <div className="pb-2">
          <Row k="Event" v={f.eventType} />
          <Row k="Guests" v={f.guests.toLocaleString('en-IN')} />
          <Row k="Food" v={menu ? `Hall · ${menu.name}` : 'Own caterer'} />
          <Row k="Date" v={f.date ? fmtDate(f.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
          <Row k="Shift" v={shift ? shift.label : '—'} />
        </div>
        <div className="pt-2">
          <Row k={`Hall · ${shift?.label ?? 'shift'}`} v={money(q.base)} />
          {q.weekend && <Row k="Weekend surcharge 15%" v={money(q.weekendFee)} />}
          {q.lines.map((l) => <Row key={l.id} k={<>{l.label}{l.note && <span className="block text-xs text-slate-400">{l.note}</span>}</>} v={money(l.amount)} />)}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
        <span className="text-sm font-semibold text-fg">Total</span>
        <Odometer value={q.total} prefix="৳" className="text-3xl font-semibold text-fg" />
      </div>
      <div className="mt-4 rounded-2xl bg-brand-soft p-3.5 ring-1 ring-brand/25">
        <div className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-brand-ink">Advance to confirm (30%)</span><b className="tabular-nums text-brand-ink">{money(q.advance)}</b></div>
        <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500"><span>Balance after advance</span><span className="tabular-nums">{money(q.total - q.advance)}</span></div>
      </div>
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500"><ClockIcon width={14} height={14} className="mt-0.5 shrink-0" />Nothing is charged now. Your date is held for {HOLD_HOURS} hours; unpaid bookings cancel automatically.</p>
    </div>
  )
}

export default function Booking() {
  const navigate = useNavigate()
  const reduce = !!useReducedMotion()
  const [sp] = useSearchParams()
  const { user, signInGoogle } = useAuth()
  const { reload: reloadMine } = useMyBookings()
  const { map, reload: reloadMap } = useAvailability()
  const [busy, setBusy] = useState(false)
  const sending = useRef(false)
  const top = useRef(null)
  const firstRender = useRef(true)
  const [step, setStep] = useState(() => (loadDraft() ? 3 : 0))
  const [dir, setDir] = useState(1)
  const [tried, setTried] = useState(false)
  const [agree, setAgree] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [f, setF] = useState(() => ({ packageId: 'wedding-plus', eventType: 'Wedding', guests: 200, date: '', shift: '', addons: [], catering: 'own', menu: 'wedding-plus', name: '', phone: '', email: '', notes: '', ...(loadDraft() ?? {}) }))
  useEffect(() => { try { sessionStorage.removeItem(DRAFT) } catch {} }, [])   // draft only needs to survive the login round-trip
  useEffect(() => { if (user) setF((x) => ({ ...x, name: x.name || user.name || '', email: x.email || user.email || '' })) }, [user])
  const set = (p) => setF((x) => ({ ...x, ...p }))
  /* Picking an event type also selects the package that suits it (Milad -> Wedding Basic, Corporate -> Corporate Event...).
     The package can still be changed afterwards; "Other" keeps whatever is selected. */
  const pickEvent = (t) => setF((x) => {
    const ok = packagesFor(t)                                  // only packages made for this kind of event
    const suggested = events.find((e) => e.slug === t)?.pkg
    const next = ok.find((p) => p.id === x.packageId) ?? ok.find((p) => p.id === suggested) ?? defaultPackageFor(t)
    return { ...x, eventType: t, packageId: next.id, guests: Math.min(x.guests, capOf(next)) }
  })

  useEffect(() => {
    const ev = sp.get('event'), pk = sp.get('package'), d = sp.get('date'), g = parseInt(sp.get('guests'), 10)
    if (!ev && !pk && !d && !g) return
    const okDate = d && /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= tomorrowISO()
    setStep(okDate ? 1 : 0)
    setF((x) => {
      const eventType = ev && eventTypes.includes(ev) ? ev : x.eventType
      const ok = packagesFor(eventType)
      const next = ok.find((p) => p.id === pk) ?? ok.find((p) => p.id === x.packageId) ?? defaultPackageFor(eventType)   // a package for another kind of event is ignored
      const guests = g ? Math.round(Math.max(20, g) / 10) * 10 : x.guests
      return { ...x, eventType, packageId: next.id, ...(okDate ? { date: d, shift: '' } : {}), guests: Math.min(capOf(next), guests) }
    })
  }, [sp])

  const pkg = packages.find((p) => p.id === f.packageId)
  const shift = SHIFTS.find((s) => s.id === f.shift)
  const taken = useMemo(() => (f.date ? takenSlots(f.date, map) : null), [f.date, map])
  const menu = f.catering === 'hall' ? foodPkgs.find((m) => m.id === f.menu) ?? foodPkgs[0] : null
  const q = quote({ pkg, shift: f.shift, date: f.date, guests: f.guests, addons: f.addons, addonDefs: addons, food: menu })
  const cap = capOf(pkg)
  useEffect(() => { if (f.guests > cap) set({ guests: cap }) }, [cap]) // eslint-disable-line
  useEffect(() => { if (f.date && f.shift && taken && !shiftFree(f.shift, taken)) set({ shift: '' }) }, [taken]) // eslint-disable-line
  useEffect(() => { if (f.catering === 'hall' && !foodPkgs.some((m) => m.id === f.menu)) set({ menu: foodFor(f.packageId) }) }, [f.catering, f.menu, f.packageId]) // eslint-disable-line
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return } top.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }) }, [step]) // eslint-disable-line

  const errs = { shift: tried && step === 1 && (!f.date ? 'Pick a date' : !f.shift ? 'Pick a shift' : ''), name: tried && step === 2 && f.name.trim().length < 2 ? 'Enter your name' : '', phone: tried && step === 2 && !phoneOk(f.phone) ? 'Enter a valid mobile number, e.g. 01712345678' : '', email: tried && step === 2 && !emailOk(f.email) ? 'Enter a valid email' : '' }
  const stepOk = [
    () => !!pkg && f.guests >= 20 && f.guests <= cap,
    () => !!(f.date && f.date >= tomorrowISO() && f.shift && taken && shiftFree(f.shift, taken)),
    () => f.name.trim().length >= 2 && phoneOk(f.phone) && emailOk(f.email),
    () => agree,
  ]
  const valid = stepOk[step]()

  const go = (d) => {
    if (d > 0 && !valid) { setTried(true); toast(step === 3 ? 'Please accept the booking terms first' : 'Please complete the highlighted fields', 'error'); return }
    setTried(false); setDir(d); setStep((s) => Math.max(0, Math.min(3, s + d)))
  }
  const jump = (i) => { if (i < step) { setTried(false); setDir(-1); setStep(i) } }

  const confirm = async () => {
    if (!user || sending.current) return
    if (!valid) { go(1); return }
    const bad = [0, 1, 2].find((i) => !stepOk[i]())                        // re-check everything the server will check
    if (bad !== undefined) { toast('Please review your booking details first', 'error'); setTried(true); setDir(-1); setStep(bad); return }
    sending.current = true; setBusy(true)
    try {
      const body = { eventType: f.eventType, packageId: f.packageId, date: f.date, shift: f.shift, guests: f.guests, addons: f.addons, catering: f.catering, ...(f.catering === 'hall' ? { menu: menu.id } : {}), name: f.name.trim(), phone: f.phone.replace(/[\s-]/g, ''), email: f.email.trim(), notes: f.notes }   // no price fields: the server prices it
      const b = await api('/bookings', { method: 'POST', body })
      reloadMine(); reloadMap()
      const served = b.priceSnapshot?.total
      if (typeof served === 'number' && served !== q.total) toast(`Final price from our system: ${money(served)}`, 'error')
      else toast('Booking request submitted')
      navigate(`/billing/${b.id}`, { state: { booking: b, fresh: true }, replace: true })
    } catch (e) {
      toast(e.message, 'error')
      if (e.status === 409) { reloadMap(); set({ shift: '' }); setDir(-1); setStep(1) }
    } finally { sending.current = false; setBusy(false) }
  }
  const loginFirst = (google) => { saveDraft(f); if (google) signInGoogle(); else navigate('/login') }

  const slide = { enter: (d) => ({ opacity: 0, x: reduce ? 0 : d * 32 }), center: { opacity: 1, x: 0 }, exit: (d) => ({ opacity: 0, x: reduce ? 0 : d * -32 }) }
  const pkgs = packagesFor(f.eventType)
  const pct = ((f.guests - 20) / Math.max(1, cap - 20)) * 100
  const chips = [100, 200, 300, 500, 1000, 1500, 2000].filter((n) => n <= cap)

  return (
    <section id="booking" className="relative overflow-hidden pb-32 pt-24 sm:pb-20 sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-80 bg-gradient-to-b from-brand-soft to-transparent" />
      <div className="container-x relative max-w-6xl">
        <header ref={top} className="mb-6 scroll-mt-24 sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-ink">Reserve</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg sm:text-5xl">Book your date</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500 sm:text-base">Live availability, clear prices, no payment until you confirm. It takes about two minutes.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <div className="min-w-0 rounded-[1.75rem] bg-surface p-4 shadow-dock ring-1 ring-slate-200 sm:rounded-[2rem] sm:p-8">
            <Stepper step={step} onJump={jump} />

            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
                {step === 0 && (
                  <div className="space-y-7">
                    <div>
                      <Heading title="What are you celebrating?" />
                      <div role="radiogroup" aria-label="Event type" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {eventTypes.map((t) => {
                          const on = f.eventType === t
                          const Ico = ICONS2[events.find((e) => e.slug === t)?.icon] ?? SparklesIcon
                          return (
                            <button key={t} type="button" role="radio" aria-checked={on} onClick={() => pickEvent(t)}
                              className={`flex items-center gap-2.5 rounded-2xl p-2.5 text-left text-sm font-semibold outline-none ring-1 transition focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.97] ${on ? 'bg-brand-soft text-brand-ink ring-2 ring-brand' : 'bg-surface text-slate-600 ring-slate-200 hover:ring-brand/50'}`}>
                              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${on ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}><Ico width={18} height={18} /></span>
                              <span className="truncate">{t}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <Heading title="Choose a package" text="Priced per shift. Food and extras come next." />
                      <div className={`grid gap-3 ${pkgs.length === 1 ? '' : pkgs.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                        {pkgs.map((p) => {
                          const on = f.packageId === p.id
                          return (
                            <TiltCard key={p.id} maxTilt={5} hoverScale={1.015} className={`!rounded-3xl ring-1 transition-colors ${on ? '!bg-brand-soft !ring-2 ring-brand' : 'ring-slate-200'}`}>
                              <button type="button" onClick={() => set({ packageId: p.id })} aria-pressed={on} className="flex h-full w-full flex-col p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand sm:p-5">
                                <span className="flex items-start justify-between gap-2"><b className="text-base text-fg">{p.name}</b>{p.popular && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">Popular</span>}</span>
                                <span className="mt-2 block text-2xl font-semibold tracking-tight text-fg">{money(p.price)}<span className="ml-1 text-xs font-normal text-slate-500">/ shift</span></span>
                                <span className="mt-1 block text-xs text-slate-500">Up to {capOf(p).toLocaleString('en-IN')} guests</span>
                                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                                  {(p.items ?? []).slice(0, 3).map((it) => <li key={it.title} className="flex items-start gap-2"><CheckIcon width={13} height={13} strokeWidth={3} className="mt-0.5 shrink-0 text-emerald-500" />{it.title}</li>)}
                                </ul>
                              </button>
                              <AnimatePresence>{on && <motion.span aria-hidden initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }} className="pointer-events-none absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-brand text-white shadow-glow"><CheckIcon width={15} height={15} strokeWidth={3} /></motion.span>}</AnimatePresence>
                            </TiltCard>
                          )
                        })}
                      </div>
                    </div>
                    <div className="rounded-3xl bg-surface p-4 shadow-card ring-1 ring-slate-200 sm:p-6">
                      <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-ink"><UsersIcon width={20} height={20} /></span><div><p className="text-sm font-semibold text-fg">Expected guests</p><p className="text-xs text-slate-500">Up to {cap.toLocaleString('en-IN')} on this package · hall holds {HALL_CAP.toLocaleString('en-IN')}</p></div></div>
                      <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6">
                        <button type="button" aria-label="Fewer guests" disabled={f.guests <= 20} onClick={() => set({ guests: Math.max(20, f.guests - 10) })} className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-fg transition hover:bg-slate-200 active:scale-90 disabled:opacity-35"><MinusIcon width={20} height={20} /></button>
                        <p className="min-w-[7rem] text-center text-5xl font-semibold leading-none tracking-tight text-fg sm:min-w-[9rem] sm:text-6xl"><Rolling text={f.guests.toLocaleString('en-IN')} still={reduce} /></p>
                        <button type="button" aria-label="More guests" disabled={f.guests >= cap} onClick={() => set({ guests: Math.min(cap, f.guests + 10) })} className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-glow transition hover:bg-brand-dark active:scale-90 disabled:opacity-35"><PlusIcon width={20} height={20} /></button>
                      </div>
                      <input type="range" aria-label="Expected guests" min={20} max={cap} step={10} value={f.guests} onChange={(e) => set({ guests: +e.target.value })} className="range-brew mt-5" style={{ '--p': `${pct}%` }} />
                      <div className="flex justify-between text-xs font-medium tabular-nums text-slate-500"><span>20</span><span>{cap.toLocaleString('en-IN')}</span></div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Quick guest counts">
                        {chips.map((n) => <button key={n} type="button" onClick={() => set({ guests: n })} aria-pressed={f.guests === n} className={`h-9 rounded-full px-4 text-xs font-semibold ring-1 transition active:scale-95 ${f.guests === n ? 'bg-brand text-white ring-brand' : 'bg-surface text-slate-600 ring-slate-300 hover:ring-brand/60'}`}>{n.toLocaleString('en-IN')}</button>)}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-7 md:grid-cols-[1fr_1fr] md:gap-8">
                    <div><Heading title="Pick a date" text="Green is free, amber has one shift left." /><Calendar value={f.date} onChange={(d) => set({ date: d })} map={map} /></div>
                    <div>
                      <Heading title={f.date ? fmtDate(f.date, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Then choose a shift'} text={f.date ? 'Hall price per shift for your package.' : 'Select a date to see which shifts are free.'} />
                      <LayoutGroup><div className="space-y-2.5" role="group" aria-label="Shift">
                        {SHIFTS.map((s) => {
                          const free = taken ? shiftFree(s.id, taken) : false
                          const on = f.shift === s.id
                          const Ico = SHIFT_ICON[s.id]
                          return (
                            <Choice key={s.id} on={on} disabled={!f.date || !free} onClick={() => set({ shift: s.id })} className="flex items-center gap-3.5">
                              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors ${on ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}><Ico /></span>
                              <span className="min-w-0 flex-1"><b className="block text-fg">{s.label}</b><span className="text-xs text-slate-500">{s.time}</span></span>
                              <span className="shrink-0 text-right text-sm">{f.date && !free ? <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-500">Booked</span> : f.date ? <b className="tabular-nums text-brand-ink">{money(hallPrice(pkg, s, f.date))}</b> : <span className="text-xs text-slate-400">{money(Math.round(pkg.price * s.mult))}</span>}</span>
                            </Choice>
                          )
                        })}
                      </div></LayoutGroup>
                      {errs.shift && <p role="alert" className="mt-2 text-xs text-red-500">{errs.shift}</p>}
                      {q.weekend && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-medium text-amber-800 ring-1 ring-amber-200 dark:!bg-amber-500/10 dark:!text-amber-200 dark:!ring-amber-400/30">Friday / Saturday: a 15% weekend surcharge is included in these prices.</p>}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-7">
                    <div>
                      <Heading title="Food & catering" />
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {[['own', 'Own caterer', 'Bring your own caterer (tell us in advance)'], ['hall', 'Convention hall catering', 'Our in-house kitchen and serving staff']].map(([id, label, hint]) => {
                          const on = f.catering === id
                          return (
                            <Choice key={id} on={on} onClick={() => set({ catering: id, ...(id === 'hall' ? { menu: foodPkgs.some((m) => m.id === f.menu) ? f.menu : foodFor(f.packageId) } : {}) })} className="flex items-start gap-3">
                              <Tick on={on} /><span><b className="block text-sm text-fg">{label}</b><span className="text-xs text-slate-600">{hint}</span></span>
                            </Choice>
                          )
                        })}
                      </div>
                      <AnimatePresence initial={false}>
                        {f.catering === 'hall' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <p className="mb-2 mt-5 text-sm font-medium text-fg">Choose a food package</p>
                            <div className="grid gap-2.5 sm:grid-cols-3">
                              {foodPkgs.map((m) => {
                                const on = menu?.id === m.id
                                const dishes = foodItems.filter((i) => i.by[m.id])
                                return (
                                  <Choice key={m.id} on={on} onClick={() => set({ menu: m.id })} className="flex flex-col !p-3.5">
                                    <b className="text-sm text-fg">{m.name} menu</b>
                                    <span className="text-xs text-slate-600">{m.text}</span>
                                    <span className="mt-1 text-sm font-semibold text-brand-ink">{money(m.price)} <span className="text-xs font-normal text-slate-600">/ guest</span></span>
                                    <span className="mt-1 text-xs text-slate-600">{dishes.length} dishes · {money(m.price * f.guests)} for {f.guests}</span>
                                    <span className="mt-2 text-xs leading-snug text-slate-500">{dishes.slice(0, 4).map((d) => d.name).join(', ')}…</span>
                                  </Choice>
                                )
                              })}
                            </div>
                            <a href="/food" target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-ink underline-offset-2 hover:underline">See full menu with photos →</a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <Heading title="Optional extras" text="Tap to add. Priced once per event." />
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {addons.filter((a) => a.id !== 'catering').map((a) => {
                          const on = f.addons.includes(a.id)
                          const Ico = ADDON_ICON[a.id] ?? SparklesIcon
                          return (
                            <Choice key={a.id} on={on} onClick={() => set({ addons: on ? f.addons.filter((x) => x !== a.id) : [...f.addons, a.id] })} className="flex items-center gap-3 !p-3.5">
                              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors ${on ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}><Ico width={22} height={22} /></span>
                              <span className="min-w-0 flex-1"><b className="block text-sm text-fg">{a.label}</b><span className="text-xs text-slate-500">{a.hint}</span></span>
                              <span className="flex shrink-0 flex-col items-end gap-1.5"><span className="text-xs font-semibold tabular-nums text-brand-ink">+{money(a.price)}</span><Tick on={on} /></span>
                            </Choice>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <Heading title="Who should we contact?" text="We call this number to confirm your booking." />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full name" error={errs.name}><input className={input} value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your name" autoComplete="name" /></Field>
                        <Field label="Mobile number" error={errs.phone}><input className={input} value={f.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" /></Field>
                        <div className="sm:col-span-2"><Field label="Email (optional)" error={errs.email}><input className={input} value={f.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" inputMode="email" autoComplete="email" /></Field></div>
                        <div className="sm:col-span-2"><Field label="Notes (optional)"><textarea className={`${input} min-h-[10rem] resize-none`} rows={6} maxLength={500} value={f.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Theme, special requests, setup timing…" /></Field></div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <Heading title="Review your booking" text="Check everything once. You can still change it before the event." />
                    {[
                      [0, 'Event', `${f.eventType} · ${pkg.name}`, `${f.guests.toLocaleString('en-IN')} guests`],
                      [1, 'Date & shift', f.date ? fmtDate(f.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—', shift ? `${shift.label} · ${shift.time}` : ''],
                      [2, 'Food & extras', menu ? `Hall catering · ${menu.name} menu` : 'Own caterer', f.addons.length ? addons.filter((a) => f.addons.includes(a.id)).map((a) => a.label).join(', ') : 'No extras'],
                      [2, 'Contact', f.name, [f.phone, f.email].filter(Boolean).join(' · ')],
                    ].map(([to, k, a, b], i) => (
                      <div key={i} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k}</p><p className="mt-0.5 break-words font-semibold text-fg">{a}</p>{b && <p className="mt-0.5 break-words text-sm text-slate-500">{b}</p>}</div>
                        <button type="button" onClick={() => jump(to)} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-brand-ink ring-1 ring-brand/30 transition hover:ring-brand"><EditIcon width={14} height={14} />Edit</button>
                      </div>
                    ))}
                    {f.notes && <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Notes</p><p className="mt-0.5 break-words text-sm text-fg">{f.notes}</p></div>}
                    <div className="lg:hidden"><Receipt f={f} q={q} pkg={pkg} shift={shift} menu={menu} /></div>
                    <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-3.5 text-sm text-amber-900 ring-1 ring-amber-300 dark:!bg-white/5 dark:!text-fg dark:!ring-white/15">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500 text-white"><ClockIcon width={16} height={16} /></span>
                      <p><b>Pay within {HOLD_HOURS} hours.</b> Your date is held for {HOLD_HOURS} hours. If the {money(q.advance)} advance is not paid by then, the booking is cancelled automatically and the date is released.</p>
                    </div>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 transition ${agree ? 'bg-brand-soft ring-brand' : tried && !agree ? 'ring-red-400' : 'ring-slate-200'}`}>
                      <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="peer sr-only" />
                      <span aria-hidden className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md ring-1 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${agree ? 'bg-brand text-white ring-brand' : 'bg-surface text-transparent ring-slate-300'}`}><CheckIcon width={14} height={14} strokeWidth={3} /></span>
                      <span className="text-sm leading-relaxed text-slate-600">I understand the total is <b className="text-fg">{money(q.total)}</b>, the advance is <b className="text-fg">{money(q.advance)}</b> (30%), and I agree to the cancellation policy: full advance refund if cancelled 14+ days before the event.</span>
                    </label>
                    {!user && (
                      <div className="rounded-2xl bg-brand-soft p-4 text-center ring-1 ring-brand/20">
                        <p className="text-sm font-semibold text-brand-ink">Log in to book</p>
                        <p className="mt-1 text-xs text-slate-600">Your details are saved, you will come right back here.</p>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
                          <button type="button" onClick={() => loginFirst(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-fg ring-1 ring-slate-400 transition hover:bg-slate-100 active:scale-95"><GoogleG width={18} height={18} />Continue with Google</button>
                          <Button onClick={() => loginFirst(false)}>Log in with email</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* nav: a bar pinned to the bottom on phones (total always in view), inline on larger screens */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:z-auto sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                <Button variant="outline" size="lg" onClick={() => go(-1)} disabled={step === 0} className="!px-4 disabled:invisible sm:!px-7" aria-label="Back"><ChevronLeft width={18} height={18} /><span className="hidden sm:inline">Back</span></Button>
                <button type="button" onClick={() => setSheet(true)} className="min-w-0 flex-1 text-left sm:flex-none sm:cursor-default lg:pointer-events-none" aria-label="Show booking summary">
                  <span className="block text-[11px] text-slate-500">{q.total ? 'Total' : 'Total (pick a shift)'}</span>
                  <Odometer value={q.total} prefix="৳" className="text-lg font-semibold text-fg sm:text-xl" />
                </button>
                {step < 3 ? <Button size="lg" onClick={() => go(1)} aria-disabled={!valid} className={valid ? '' : 'opacity-80'}>Continue<ArrowRight /></Button>
                  : user ? <Button size="lg" variant="success" onClick={confirm} disabled={busy || !agree}><CheckIcon width={18} height={18} />{busy ? 'Booking…' : 'Confirm booking'}</Button>
                  : <Button size="lg" onClick={() => loginFirst(false)}>Log in to book</Button>}
              </div>
            </div>
          </div>

          <aside className="hidden lg:block"><div className="sticky top-24 space-y-3">
            <Receipt f={f} q={q} pkg={pkg} shift={shift} menu={menu} />
            <p className="flex items-start gap-2 px-2 text-xs text-slate-500"><ShieldIcon width={15} height={15} className="mt-0.5 shrink-0" />Prices are calculated by our server when you book, so the bill always matches.</p>
            <p className="flex items-start gap-2 px-2 text-xs text-slate-500"><CalendarIcon width={15} height={15} className="mt-0.5 shrink-0" />Dates are held for {HOLD_HOURS} hours. Unpaid bookings are cancelled automatically.</p>
          </div></aside>
        </div>
      </div>

      <AnimatePresence>{sheet && <Modal key="sum" size="sm" title="Booking summary" onClose={() => setSheet(false)}><Receipt f={f} q={q} pkg={pkg} shift={shift} menu={menu} /></Modal>}</AnimatePresence>
    </section>
  )
}
