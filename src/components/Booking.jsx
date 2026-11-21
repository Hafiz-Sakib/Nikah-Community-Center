import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { packages, addons, eventTypes, events, CONTACT, foodPkgs, foodItems } from '../data'
import { takenSlots, shiftFree, SHIFTS, quote, money, fmtDate, toast } from '../lib/store'
import { useAuth } from '../context/AuthContext'
import { useMyBookings } from '../lib/bookings'
import { useAvailability } from '../lib/useAvailability'
import { api } from '../lib/api'
import { GoogleG } from './AuthShell'
import Calendar from './Calendar'
import Billing from './Billing'
import Button from './brew/Button'
import { PillTabs } from './brew/PillTabs'
import { TiltCard } from './brew/TiltCard'
import Odometer from './Odometer'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { tomorrowISO } from '../lib/store'
import { CalendarIcon, CheckIcon, ClockIcon, MinusIcon, PlusIcon, ArrowRight, ChevronLeft, DownloadIcon, ChatIcon } from './Icons'

const STEPS = ['Event', 'Date & shift', 'Details', 'Confirm']
const DRAFT = 'ncc.bookingDraft'
function loadDraft() { try { const d = JSON.parse(sessionStorage.getItem(DRAFT) || 'null'); return d && typeof d === 'object' ? d : null } catch { return null } }
const saveDraft = (f) => { try { sessionStorage.setItem(DRAFT, JSON.stringify(f)); sessionStorage.setItem('ncc.returnTo', '/booking') } catch {} }
const phoneOk = (p) => /^(?:\+?88)?01[3-9]\d{8}$/.test(p.replace(/[\s-]/g, ''))
const emailOk = (e) => !e || /^\S+@\S+\.\S+$/.test(e)
const input = 'w-full rounded-2xl border border-slate-300 bg-surface px-4 py-3 text-sm text-fg outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15'

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      {children}
      <AnimatePresence>{error && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1 block text-xs text-red-500">{error}</motion.span>}</AnimatePresence>
    </label>
  )
}

function Row({ k, v, strong }) {
  return <div className={`flex items-start justify-between gap-4 py-1.5 text-sm ${strong ? 'font-semibold text-fg' : 'text-slate-600'}`}><span>{k}</span><span className="text-right">{v}</span></div>
}

function Summary({ f, q, pkg, shift, menu }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <p className="mb-2 text-sm font-semibold text-fg">Your booking</p>
      <Row k="Package" v={pkg.name} />
      <Row k="Event" v={f.eventType} />
      <Row k="Guests" v={f.guests} />
      <Row k="Food" v={menu ? `Hall catering · ${menu.name}` : 'Own caterer'} />
      <Row k="Date" v={f.date ? fmtDate(f.date) : '—'} />
      <Row k="Shift" v={shift ? shift.label : '—'} />
      <div className="my-2 border-t border-dashed border-slate-300" />
      <Row k={`Hall (${shift?.label ?? 'shift'})`} v={money(q.base)} />
      {q.weekend && <Row k="Weekend surcharge 15%" v={money(q.weekendFee)} />}
      {q.lines.map((l) => <Row key={l.id} k={l.label} v={money(l.amount)} />)}
      <div className="my-2 border-t border-slate-300" />
      <div className="flex items-end justify-between gap-4 pt-2"><span className="text-sm font-semibold text-fg">Total</span><Odometer value={q.total} prefix="৳" className="text-2xl font-semibold text-fg" /></div>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-brand-soft px-4 py-3 ring-1 ring-brand/30"><span className="text-sm font-semibold text-brand-ink">Advance to confirm (30%)</span><b className="text-brand-ink">{money(q.advance)}</b></div>
    </div>
  )
}

export default function Booking() {
  const navigate = useNavigate()
  const onManage = () => navigate('/my-bookings')
  const [sp] = useSearchParams()
  const { user, signInGoogle } = useAuth()
  const { reload: reloadMine } = useMyBookings()
  const { map, reload: reloadMap } = useAvailability()
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(() => (loadDraft() ? 3 : 0))
  const [dir, setDir] = useState(1)
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState(null)
  const [f, setF] = useState(() => loadDraft() ?? { packageId: 'wedding-plus', eventType: 'Wedding', guests: 200, date: '', shift: '', addons: [], catering: 'own', menu: 'wedding-plus', name: '', phone: '', email: '', notes: '' })
  useEffect(() => { try { sessionStorage.removeItem(DRAFT) } catch {} }, [])   // draft only needs to survive the login round-trip
  useEffect(() => { if (user) setF((x) => ({ ...x, name: x.name || user.name || '', email: x.email || user.email || '' })) }, [user])
  const set = (p) => setF((x) => ({ ...x, ...p }))
  /* Picking an event type also selects the package that suits it (Milad -> Wedding Basic, Corporate -> Corporate Event...).
     The package can still be changed afterwards; "Other" keeps whatever is selected. */
  const pickEvent = (t) => setF((x) => {
    const suggested = events.find((e) => e.slug === t)?.pkg
    const packageId = suggested && packages.some((p) => p.id === suggested) ? suggested : x.packageId
    const cap = Math.min(600, packages.find((p) => p.id === packageId).cap)
    return { ...x, eventType: t, packageId, guests: Math.min(x.guests, cap) }
  })

  useEffect(() => {
    const ev = sp.get('event'), pk = sp.get('package'), d = sp.get('date'), g = parseInt(sp.get('guests'), 10)
    if (!ev && !pk && !d && !g) return
    const okDate = d && /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= tomorrowISO()
    setDone(null); setStep(okDate ? 1 : 0)
    setF((x) => ({ ...x, ...(ev && eventTypes.includes(ev) ? { eventType: ev } : {}), ...(pk && packages.some((p) => p.id === pk) ? { packageId: pk } : {}), ...(okDate ? { date: d, shift: '' } : {}), ...(g ? { guests: Math.max(20, Math.min(600, g)) } : {}) }))
  }, [sp])

  const pkg = packages.find((p) => p.id === f.packageId)
  const shift = SHIFTS.find((s) => s.id === f.shift)
  const taken = useMemo(() => (f.date ? takenSlots(f.date, map) : null), [f.date, map])
  const menu = f.catering === 'hall' ? foodPkgs.find((m) => m.id === f.menu) : null
  const q = quote({ pkg, shift: f.shift, date: f.date, guests: f.guests, addons: f.addons, addonDefs: addons, food: menu })
  const cap = Math.min(600, pkg.cap)
  useEffect(() => { if (f.guests > cap) set({ guests: cap }) }, [cap]) // eslint-disable-line
  useEffect(() => { if (f.date && f.shift && taken && !shiftFree(f.shift, taken)) set({ shift: '' }) }, [taken]) // eslint-disable-line

  const errs = { shift: tried && step === 1 && (!f.date ? 'Pick a date' : !f.shift ? 'Pick a shift' : ''), name: tried && step === 2 && f.name.trim().length < 2 ? 'Enter your name' : '', phone: tried && step === 2 && !phoneOk(f.phone) ? 'Enter a valid mobile number, e.g. 01712345678' : '', email: tried && step === 2 && !emailOk(f.email) ? 'Enter a valid email' : '' }
  const valid = [true, f.date && f.shift, f.name.trim().length >= 2 && phoneOk(f.phone) && emailOk(f.email), true][step]

  const go = (d) => {
    if (d > 0 && !valid) { setTried(true); toast('Please complete the highlighted fields', 'error'); return }
    setTried(false); setDir(d); setStep((s) => s + d)
  }
  const confirm = async () => {
    if (!user) return
    setBusy(true)
    try {
      const body = { eventType: f.eventType, packageId: f.packageId, date: f.date, shift: f.shift, guests: f.guests, addons: f.addons, catering: f.catering, ...(f.catering === 'hall' ? { menu: f.menu } : {}), name: f.name.trim(), phone: f.phone.replace(/[\s-]/g, ''), email: f.email.trim(), notes: f.notes }   // no price fields: the server prices it
      const b = await api('/bookings', { method: 'POST', body })
      setDone(b); toast('Booking request submitted'); reloadMine(); reloadMap()
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
    } catch (e) {
      toast(e.message, 'error')
      if (e.status === 409) { reloadMap(); set({ shift: '' }); setStep(1) }
    } finally { setBusy(false) }
  }
  const loginFirst = (google) => { saveDraft(f); if (google) signInGoogle(); else navigate('/login') }
  const reset = () => { setDone(null); setStep(0); setF((x) => ({ ...x, date: '', shift: '', addons: [], notes: '' })) }

  const slide = { enter: (d) => ({ opacity: 0, x: d * 40 }), center: { opacity: 1, x: 0 }, exit: (d) => ({ opacity: 0, x: d * -40 }) }

  return (
    <section id="booking" className="relative py-12 sm:py-16">
      <div className="container-x">
        <div className={`grid gap-6 ${done ? "mx-auto max-w-3xl 2xl:max-w-4xl" : "lg:grid-cols-[1fr_340px]"}`}>
          <div className="rounded-[2rem] bg-surface p-5 shadow-dock ring-1 ring-slate-200 sm:p-8">
            {done ? <Billing b={done} fresh onNew={reset} onManage={onManage} /> : (
              <>
                <div className="mb-8" aria-label="Progress">
                  <div className="flex gap-1.5" aria-hidden>
                    {STEPS.map((_, i) => (
                      <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"><motion.span className="block h-full origin-left rounded-full bg-brand" initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} /></span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-fg sm:text-xl">{STEPS[step]}</p>
                    <p className="text-sm font-medium text-slate-500">Step {step + 1} of {STEPS.length}</p>
                  </div>
                  <ol className="sr-only">{STEPS.map((x, i) => <li key={x} aria-current={i === step ? 'step' : undefined}>{x}</li>)}</ol>
                </div>

                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
                    {step === 0 && (
                      <div className="space-y-6">
                        <div>
                          <p className="mb-2 text-sm font-medium text-fg">Event type</p>
                          <div className="-mx-1 overflow-x-auto px-1 pb-1"><PillTabs tabs={eventTypes.map((t) => ({ id: t, label: t }))} value={f.eventType} onValueChange={pickEvent} label="Event type" /></div>
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-fg">Package</p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {packages.map((p) => (
                              <TiltCard key={p.id} maxTilt={6} hoverScale={1.02} className={`!rounded-2xl ring-1 transition-colors ${f.packageId === p.id ? '!bg-brand-soft !ring-2 ring-brand' : 'ring-slate-300'}`}>
                                <button type="button" onClick={() => set({ packageId: p.id })} aria-pressed={f.packageId === p.id} className="block h-full w-full p-4 pb-5 text-left">
                                <span className="flex flex-wrap items-center justify-between gap-1"><b className="text-fg">{p.name}</b>{p.popular && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">Popular</span>}</span>
                                <span className="mt-1 block text-sm text-brand-ink">{money(p.price)} <span className="text-slate-400">/ shift</span></span>
                                <span className="mt-1 block text-xs text-slate-500">Up to {p.cap} guests</span>
                                </button>
                                {f.packageId === p.id && <span aria-hidden className="pointer-events-none absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white"><CheckIcon width={14} height={14} /></span>}
                              </TiltCard>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                          <div><p className="text-sm font-medium text-fg">Expected guests</p><p className="text-xs text-slate-500">Max {cap} for this package</p></div>
                          <div className="flex items-center gap-3">
                            <button type="button" aria-label="Fewer guests" disabled={f.guests <= 20} onClick={() => set({ guests: Math.max(20, f.guests - 10) })} className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg ring-1 ring-slate-400 transition hover:bg-slate-100 active:scale-90 disabled:opacity-35"><MinusIcon width={18} height={18} /></button>
                            <span className="flex w-16 justify-center"><Odometer value={f.guests} className="text-2xl font-semibold text-fg" /></span>
                            <button type="button" aria-label="More guests" disabled={f.guests >= cap} onClick={() => set({ guests: Math.min(cap, f.guests + 10) })} className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg ring-1 ring-slate-400 transition hover:bg-slate-100 active:scale-90 disabled:opacity-35"><PlusIcon width={18} height={18} /></button>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="grid gap-8 md:grid-cols-2">
                        <Calendar value={f.date} onChange={(d) => set({ date: d })} map={map} />
                        <div>
                          <p className="mb-2 text-sm font-medium text-fg">{f.date ? fmtDate(f.date, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Select a date first'}</p>
                          <div className="space-y-2.5">
                            {SHIFTS.map((s) => {
                              const free = taken ? shiftFree(s.id, taken) : false
                              const on = f.shift === s.id
                              return (
                                <button key={s.id} type="button" disabled={!f.date || !free} onClick={() => set({ shift: s.id })} aria-pressed={on}
                                  className={`relative flex w-full items-center justify-between rounded-2xl p-4 text-left ring-1 transition ${on ? 'bg-brand-soft ring-2 ring-brand' : 'bg-surface ring-slate-300 enabled:hover:ring-brand/60'} disabled:cursor-not-allowed disabled:opacity-50`}>
                                  <span><b className="block text-fg">{s.label}</b><span className="text-xs text-slate-500">{s.time}</span></span>
                                  <span className="text-right text-sm">{f.date && !free ? <span className="font-medium text-red-500">Booked</span> : <span className="font-semibold text-brand-ink">{money(pkg.price * s.mult * (f.date && [5, 6].includes(new Date(f.date + 'T00:00').getDay()) ? 1.15 : 1))}</span>}</span>
                                </button>
                              )
                            })}
                          </div>
                          {errs.shift && <p className="mt-2 text-xs text-red-500">{errs.shift}</p>}
                          {q.weekend && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800 ring-1 ring-amber-200">Friday / Saturday: a 15% weekend surcharge is included in these prices.</p>}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <p className="mb-2 text-sm font-medium text-fg">Food & catering</p>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {[['own', 'Own caterer', 'Bring your own caterer (tell us in advance)'], ['hall', 'Convention hall catering', 'Our in-house kitchen and serving staff']].map(([id, label, hint]) => {
                              const on = f.catering === id
                              return (
                                <button key={id} type="button" aria-pressed={on} onClick={() => set({ catering: id, ...(id === 'hall' && f.catering !== 'hall' ? { menu: f.packageId } : {}) })}
                                  className={`rounded-2xl p-4 text-left ring-1 transition ${on ? 'bg-brand-soft ring-2 ring-brand' : 'bg-surface ring-slate-300 hover:ring-brand/60'}`}>
                                  <b className="block text-sm text-fg">{label}</b><span className="text-xs text-slate-600">{hint}</span>
                                </button>
                              )
                            })}
                          </div>
                          <AnimatePresence initial={false}>
                            {f.catering === 'hall' && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <p className="mb-2 mt-5 text-sm font-medium text-fg">Choose a food package</p>
                                <div className="grid gap-2.5 sm:grid-cols-3">
                                  {foodPkgs.map((m) => {
                                    const on = f.menu === m.id
                                    const dishes = foodItems.filter((i) => i.by[m.id])
                                    return (
                                      <button key={m.id} type="button" aria-pressed={on} onClick={() => set({ menu: m.id })}
                                        className={`flex flex-col rounded-2xl p-3.5 text-left ring-1 transition ${on ? 'bg-brand-soft ring-2 ring-brand' : 'bg-surface ring-slate-300 hover:ring-brand/60'}`}>
                                        <b className="text-sm text-fg">{m.name} menu</b>
                                        <span className="text-xs text-slate-600">{m.text}</span>
                                        <span className="mt-1 text-sm font-semibold text-brand-ink">{money(m.price)} <span className="text-xs font-normal text-slate-600">/ guest</span></span>
                                        <span className="mt-1 text-xs text-slate-600">{dishes.length} dishes · {money(m.price * f.guests)} for {f.guests}</span>
                                        <span className="mt-2 text-xs leading-snug text-slate-600">{dishes.slice(0, 4).map((d) => d.name).join(', ')}…</span>
                                      </button>
                                    )
                                  })}
                                </div>
                                <a href="/food" target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-ink underline-offset-2 hover:underline">See full menu with photos →</a>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div>
                          <p className="mb-2 text-sm font-medium text-fg">Optional extras</p>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {addons.filter((a) => a.id !== 'catering').map((a) => {
                              const on = f.addons.includes(a.id)
                              return (
                                <button key={a.id} type="button" aria-pressed={on} onClick={() => set({ addons: on ? f.addons.filter((x) => x !== a.id) : [...f.addons, a.id] })}
                                  className={`flex items-start gap-3 rounded-2xl p-3.5 text-left ring-1 transition ${on ? 'bg-brand-soft ring-2 ring-brand' : 'bg-surface ring-slate-300 hover:ring-brand/60'}`}>
                                  <motion.span animate={{ scale: on ? 1 : 0.9 }} className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white transition-colors ${on ? 'bg-brand' : 'bg-slate-100'}`}>{on && <CheckIcon width={14} height={14} />}</motion.span>
                                  <span><b className="block text-sm text-fg">{a.label}</b><span className="text-xs text-slate-500">{a.hint}</span><span className="mt-0.5 block text-xs font-semibold text-brand-ink">{money(a.price)}{a.perGuest ? ' / guest' : ''}</span></span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Full name" error={errs.name}><input className={input} value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your name" autoComplete="name" /></Field>
                          <Field label="Mobile number" error={errs.phone}><input className={input} value={f.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" /></Field>
                          <div className="sm:col-span-2"><Field label="Email (optional)" error={errs.email}><input className={input} value={f.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" inputMode="email" autoComplete="email" /></Field></div>
                          <div className="sm:col-span-2"><Field label="Notes (optional)"><textarea className={input} rows={3} value={f.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Theme, special requests, setup timing…" /></Field></div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-5">
                        <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                          <Row k="Name" v={f.name} /><Row k="Mobile" v={f.phone} />{f.email && <Row k="Email" v={f.email} />}{f.notes && <Row k="Notes" v={<span className="max-w-[16rem] break-words">{f.notes}</span>} />}
                        </div>
                        <div className="lg:hidden"><Summary f={f} q={q} pkg={pkg} shift={shift} menu={menu} /></div>
                        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-3.5 text-sm text-amber-900 ring-1 ring-amber-300 dark:!bg-white/5 dark:!text-fg dark:!ring-white/15">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white"><ClockIcon width={16} height={16} /></span>
                          <p><b>Pay within 48 hours.</b> Your date is held for 48 hours. If the {money(q.advance)} advance is not paid by then, the booking is cancelled automatically and the date is released.</p>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500">By confirming you agree to our cancellation policy: full advance refund if cancelled 14+ days before the event. Pay the 30% advance after booking to confirm your date.</p>
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

                <div className="mt-8 flex items-center justify-between gap-3">
                  <Button variant="outline" size="lg" onClick={() => go(-1)} disabled={step === 0} className="disabled:invisible"><ChevronLeft width={18} height={18} />Back</Button>
                  <div className="flex items-center gap-4">
                    <span className="hidden items-end gap-2 text-sm text-slate-500 sm:flex">Total <Odometer value={q.total} prefix="৳" className="text-lg font-semibold text-fg" /></span>
                    {step < 3 ? <Button size="lg" onClick={() => go(1)}>Continue<ArrowRight /></Button>
                      : user ? <Button size="lg" variant="success" onClick={confirm} disabled={busy}><CheckIcon width={18} height={18} />{busy ? 'Booking…' : 'Confirm booking'}</Button>
                      : <Button size="lg" onClick={() => loginFirst(false)}>Log in to book</Button>}
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className={done ? "hidden" : "hidden lg:block"}><div className="sticky top-24"><Summary f={f} q={q} pkg={pkg} shift={shift} menu={menu} />
            <p className="mt-3 flex items-center gap-2 px-2 text-xs text-slate-500"><CalendarIcon width={16} height={16} />Dates are held for 48 hours. Unpaid bookings are cancelled automatically.</p></div></aside>
        </div>
      </div>
    </section>
  )
}
