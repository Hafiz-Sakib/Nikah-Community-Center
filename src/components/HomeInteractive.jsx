import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { events, packages, foodPkgs, addons, img, capOf } from '../data'
import { money } from '../lib/store'
import { ICONS2, ArrowRight, ChevronDown } from './Icons'
import SectionHead from './SectionHead'
import { PillTabs } from './brew/PillTabs'
import { TiltCard } from './brew/TiltCard'
import { AmountSlider, Rolling } from './brew/AmountSlider'

/* ---------- 1. Event planner (Motion Brew: Pill tabs) ---------- */
export function EventPlanner() {
  const [id, setId] = useState(events[0].slug)
  const e = events.find((x) => x.slug === id)
  const p = packages.find((x) => x.id === e.pkg)
  const Ico = ICONS2[e.icon]
  return (
    <section className="py-16 sm:py-24"><div className="container-x">
      <SectionHead eyebrow="Plan your day" title="What are you celebrating?" text="Pick an occasion and see the setup, size and package we suggest." />
      <div className="mt-10 flex justify-center overflow-x-auto pb-2">
        <PillTabs label="Occasion" value={id} onValueChange={setId} tabs={events.map((x) => ({ id: x.slug, label: x.title.split(' ')[0] }))} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={e.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}
          className="mx-auto mt-8 grid max-w-4xl overflow-hidden rounded-[2rem] bg-surface shadow-card ring-1 ring-slate-200/80 md:grid-cols-2">
          <div className="relative h-64 md:h-auto"><img src={img(e.image)} alt={e.title} className="absolute inset-0 h-full w-full object-cover" /></div>
          <div className="p-6 sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Ico /></span>
            <h3 className="mt-4 text-xl font-semibold text-fg">{e.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{e.text}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-100 p-3"><dt className="text-slate-500">Typical size</dt><dd className="mt-0.5 font-semibold text-fg">{e.guests}</dd></div>
              <div className="rounded-2xl bg-slate-100 p-3"><dt className="text-slate-500">Suggested</dt><dd className="mt-0.5 font-semibold text-fg">{p.name}</dd></div>
            </dl>
            <p className="mt-4 text-sm text-slate-500">Hall from <span className="text-lg font-bold text-brand-ink">{money(p.price)}</span> per shift</p>
            <Link to={`/booking?event=${e.slug}&package=${e.pkg}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-95">Book this event <ArrowRight /></Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div></section>
  )
}

/* ---------- 2. Cost estimator (Motion Brew: Amount slider + Pill tabs) ---------- */
/* Package picker: a dropdown (native select, so it works well with a phone's own picker) instead of a sideways-scrolling tab strip. */
function PackageSelect({ value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">Package</span>
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="Package"
          className="h-12 w-full cursor-pointer appearance-none rounded-2xl bg-slate-100 pl-4 pr-11 text-sm font-semibold text-fg outline-none ring-1 ring-transparent transition hover:bg-slate-200/70 focus-visible:ring-2 focus-visible:ring-brand">
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <ChevronDown width={18} height={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  )
}
const catering = foodPkgs.reduce((a, f) => ({ ...a, [f.id]: f.price }), {})
export function CostEstimator() {
  const [pkgId, setPkgId] = useState('wedding-plus')
  const [shift, setShift] = useState('single')
  const [food, setFood] = useState('hall')
  const [guests, setGuests] = useState(200)
  const p = packages.find((x) => x.id === pkgId)
  const g = Math.min(guests, capOf(p))
  const hall = Math.round(p.price * (shift === 'full' ? 1.7 : 1))
  const meals = food === 'hall' ? g * (catering[p.menu ?? pkgId] ?? 0) : 0
  const total = hall + meals
  const fmt = (n) => n.toLocaleString('en-IN')
  return (
    <section className="bg-slate-50 py-16 sm:py-24"><div className="container-x">
      <SectionHead eyebrow="Estimate" title="What will it cost?" text="Slide your guest count and watch the estimate update. The final price is confirmed in your booking summary." />
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-3xl bg-surface p-6 shadow-card ring-1 ring-slate-200/80 sm:p-8">
          <div className="space-y-4">
            <PackageSelect value={pkgId} onChange={setPkgId} options={packages.map((x) => ({ id: x.id, label: x.name }))} />
            <div className="flex flex-wrap gap-3">
              <PillTabs label="Shift" value={shift} onValueChange={setShift} tabs={[{ id: 'single', label: 'One shift' }, { id: 'full', label: 'Full day' }]} />
              <PillTabs label="Catering" value={food} onValueChange={setFood} tabs={[{ id: 'hall', label: 'Hall catering' }, { id: 'own', label: 'Own caterer' }]} />
            </div>
          </div>
          <div className="mt-8">
            <AmountSlider key={pkgId} label={`Expected guests (up to ${capOf(p).toLocaleString('en-IN')})`} min={30} max={capOf(p)} step={capOf(p) > 500 ? 50 : 10} defaultValue={Math.min(g, capOf(p))} onChange={setGuests} />
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-3xl bg-surface p-6 text-fg shadow-card ring-1 ring-slate-200/80 dark:bg-ink dark:text-white dark:shadow-dock dark:ring-white/10 sm:p-8">
          <div>
            <p className="text-sm text-slate-500 dark:text-white/60">Estimated total</p>
            <p className="mt-2 text-4xl font-semibold sm:text-5xl"><Rolling text={`৳${fmt(total)}`} /></p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex justify-between gap-4 border-b border-slate-200 pb-3 dark:border-white/10"><span className="text-slate-600 dark:text-white/70">{p.name}, {shift === 'full' ? 'full day' : 'one shift'}</span><span className="font-medium tabular-nums">{money(hall)}</span></li>
              <li className="flex justify-between gap-4 border-b border-slate-200 pb-3 dark:border-white/10"><span className="text-slate-600 dark:text-white/70">{food === 'hall' ? `Hall catering, ${g} × ${money(catering[p.menu ?? pkgId] ?? 0)}` : 'Own caterer'}</span><span className="font-medium tabular-nums">{food === 'hall' ? money(meals) : '—'}</span></li>
            </ul>
            <p className="mt-4 text-xs text-slate-500 dark:text-white/50">Add-ons and the 15% Friday/Saturday surcharge are not included.</p>
          </div>
          <Link to={`/booking?package=${pkgId}&guests=${g}`} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-95 dark:bg-white dark:text-ink dark:hover:bg-slate-100">Book this plan <ArrowRight /></Link>
        </div>
      </div>
    </div></section>
  )
}

/* ---------- 3. Add-ons (Motion Brew: Tilt card) ---------- */
const addonIcon = { catering: 'utensils', stage: 'sparkles', sound: 'music', photo: 'camera', bridal: 'crown' }
export function AddonTilt() {
  return (
    <section className="py-16 sm:py-24"><div className="container-x">
      <SectionHead eyebrow="Make it yours" title="Extras for your big day" text="Hover a card to tilt it. Add any of these while booking." />
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {addons.map((a) => { const Ico = ICONS2[addonIcon[a.id] || 'sparkles']; return (
          <li key={a.id}>
            <TiltCard className="p-6 ring-1 ring-slate-200/80">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Ico /></span>
              <h3 className="mt-4 font-semibold text-fg">{a.label}</h3>
              <p className="mt-1 text-sm text-slate-500">{a.hint}</p>
              <p className="mt-4 text-lg font-bold text-brand-ink">{money(a.price)}<span className="text-xs font-normal text-slate-400">{a.perGuest ? ' / guest' : ''}</span></p>
            </TiltCard>
          </li>) })}
      </ul>
    </div></section>
  )
}
