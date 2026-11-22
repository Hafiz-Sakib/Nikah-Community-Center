import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { packages, compare, img, capOf } from '../data'
import { ICONS2, CheckIcon, ArrowRight } from './Icons'
import Odometer from './Odometer'

/* Pricing card: a small photo on top, a floating icon, a hover lift, a slowly turning light border on the popular plan,
   a Shift / Full day segmented switch (the price rolls like an odometer) and a button with a shine sweep.
   Everything wraps instead of overlapping, so it stays tidy from 320px phones to wide desktops. */
const CARD_R = 'rounded-[2rem]'
function PackageCard({ p, index }) {
  const [full, setFull] = useState(false)
  const reduce = useReducedMotion()
  const Ico = ICONS2[p.icon]
  const price = Math.round(p.price * (full ? 1.7 : 1))

  return (
    <motion.li initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: index * 0.12, type: 'spring', stiffness: 100, damping: 16 }} className="h-full min-w-0">
      <motion.div whileHover={reduce ? undefined : { y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className={`group relative h-full p-[2px] ${CARD_R} ${p.popular ? 'shadow-glow' : 'shadow-card'} transition-shadow duration-500 hover:shadow-dock`}>
        {/* border: a soft ring, or a turning light for the popular plan */}
        <span aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${CARD_R} ${p.popular ? '' : 'bg-fg/5'}`}>
          {p.popular && <span className="absolute left-1/2 top-1/2 block aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow motion-reduce:animate-none" style={{ background: 'conic-gradient(from 0deg, rgba(63,135,245,.15), #3f87f5, #a78bfa, #38bdf8, rgba(63,135,245,.15))' }} />}
        </span>

        <div className={`relative flex h-full flex-col overflow-hidden rounded-[calc(2rem-2px)] bg-surface`}>
          {/* photo */}
          <div className="relative h-36 shrink-0 overflow-hidden bg-ink sm:h-40">
            <img src={img(p.photo)} alt="" loading="lazy" decoding="async" draggable={false} style={{ objectPosition: p.photoPos }}
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110 motion-reduce:transition-none" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" />
            <span aria-hidden className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 blur-md transition-all duration-1000 group-hover:left-full group-hover:opacity-100 motion-reduce:hidden" />
            <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
              {p.popular
                ? <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"><span className="relative flex h-1.5 w-1.5"><span className="absolute inset-0 animate-ping rounded-full bg-white/80 motion-reduce:animate-none" /><span className="relative h-1.5 w-1.5 rounded-full bg-white" /></span>Most booked</span>
                : <span className="rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">{p.tag}</span>}
              <span className="rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">Up to {capOf(p).toLocaleString('en-IN')} guests</span>
            </div>
          </div>

          <div className="relative flex min-w-0 flex-1 flex-col px-5 pb-5 pt-0">
            {/* floating icon sits on the photo edge */}
            <span className="-mt-6 mb-3 flex h-12 w-12 animate-float items-center justify-center rounded-2xl bg-surface text-brand-ink shadow-card ring-1 ring-fg/5 motion-reduce:animate-none"><Ico width={22} height={22} /></span>
            <h3 className="text-xl font-semibold leading-tight text-fg">{p.name}</h3>
            <p className="mt-1 text-[13px] font-medium text-brand-ink">{p.ideal}</p>
            <p className="mt-2 text-[15px] leading-snug text-slate-600">{p.desc}</p>

            <div className="mt-5 flex flex-wrap items-end gap-x-2 gap-y-1">
              <Odometer value={price} prefix="৳" className="text-[2.5rem] font-bold leading-none text-fg" />
              <span className="pb-1 text-[15px] text-slate-600">/ {full ? 'full day' : 'shift'}</span>
            </div>

            {/* Shift / Full day */}
            <div role="radiogroup" aria-label={`Billing for ${p.name}`} className="relative mt-4 grid grid-cols-2 rounded-full bg-slate-100 p-1">
              {[[false, 'Per shift'], [true, 'Full day']].map(([v, label]) => (
                <button key={label} type="button" role="radio" aria-checked={full === v} onClick={() => setFull(v)}
                  className={`relative z-10 rounded-full px-2 py-2 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${full === v ? 'text-fg' : 'text-slate-500 hover:text-fg'}`}>
                  {full === v && <motion.span layoutId={`bill-${p.id}`} transition={{ type: 'spring', stiffness: 500, damping: 34 }} className="absolute inset-0 -z-10 rounded-full bg-surface shadow-card" />}
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[13px] leading-snug text-slate-600">{full ? 'Morning + Evening · about 15% cheaper' : 'Billed per shift · Fri & Sat +15%'}</p>

            <Link to={`/booking?event=${p.events[0]}&package=${p.id}`} className={`group/btn relative mt-5 flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-3.5 text-center text-sm font-semibold transition-all active:scale-[0.98] ${p.popular ? 'bg-brand text-white shadow-glow hover:bg-brand-dark' : 'bg-slate-100 text-fg hover:bg-fg hover:text-surface'}`}>
              <span aria-hidden className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 transition-all duration-700 group-hover/btn:left-[130%] motion-reduce:hidden" />
              <span className="relative">Book this package</span>
              <span className="relative transition-transform duration-300 group-hover/btn:translate-x-1"><ArrowRight /></span>
            </Link>
            <p className="mt-3 text-center text-[13px] text-slate-600">30% advance confirms your date</p>

            <div className="my-5 h-px bg-slate-200/80" />
            <motion.ul initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } } }} className="space-y-3.5">
              {p.items.map((it) => {
                const I = ICONS2[it.icon]
                return (
                  <motion.li key={it.title} variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } }} className="group/item flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink transition-transform duration-300 group-hover/item:scale-110 group-hover/item:-rotate-6"><I width={16} height={16} /></span>
                    <span className="min-w-0"><span className="block text-[15px] font-medium leading-tight text-fg">{it.title}</span><span className="mt-0.5 block text-[13px] leading-snug text-slate-600">{it.text}</span></span>
                  </motion.li>
                )
              })}
            </motion.ul>
          </div>
        </div>
      </motion.div>
    </motion.li>
  )
}

/* Weddings and corporate events keep their own packages; birthdays, milad and other events each have theirs. */
const GROUPS = [
  { title: 'Weddings & receptions', note: 'Wedding, Reception and Holud', ids: ['wedding-basic', 'wedding-plus'] },
  { title: 'Corporate', note: 'Conferences, seminars and annual dinners', ids: ['corporate'] },
  { title: 'Birthday, Milad & other events', note: 'Each has its own package', ids: ['birthday-party', 'milad-mahfil', 'other-event'] },
]
export function PackageGrid() {
  return (
    <>
      {GROUPS.map((g) => (
        <div key={g.title} className="mt-12 first:mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h3 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">{g.title}</h3>
            <p className="text-sm text-slate-500">{g.note}</p>
          </div>
          <ul className={`grid grid-cols-1 gap-4 ${g.ids.length === 1 ? 'mx-auto max-w-md' : g.ids.length === 2 ? 'sm:grid-cols-2 lg:mx-auto lg:max-w-4xl' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {g.ids.map((id, i) => <PackageCard key={id} p={packages.find((p) => p.id === id)} index={i} />)}
          </ul>
        </div>
      ))}
      <p className="mt-6 text-center text-[13px] text-slate-600">Friday &amp; Saturday carry a 15% surcharge. Full day = Morning + Evening at 1.7× the shift price.</p>
    </>
  )
}

/* Package comparison. Large screens: one fixed-width table that always fits (no sideways or inner scrolling); the popular plan is lifted as a single
   continuous framed column from top to bottom, and hovering any column or row highlights it. Phones / tablets: pick a plan, read its list. */
const LABEL = 19, COL = (100 - LABEL) / 6
const Cell = ({ v }) => (v === true
  ? <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckIcon width={14} height={14} /></span>
  : v === false || v === '—' ? <span className="text-slate-300">—</span> : <span>{v}</span>)

export function CompareTable() {
  const [hc, setHc] = useState(null)
  const [sel, setSel] = useState(Math.max(0, packages.findIndex((p) => p.popular)))
  const pop = packages.findIndex((p) => p.popular)
  const left = (i) => `${LABEL + i * COL}%`
  const price = (p) => `৳${p.price.toLocaleString('en-IN')}`
  return (
    <>
      {/* desktop table */}
      <div className="relative hidden pt-4 lg:block" onMouseLeave={() => setHc(null)}>
        <div className="relative rounded-3xl bg-surface shadow-card ring-1 ring-fg/5">
          {hc !== null && hc !== pop && <div aria-hidden className="pointer-events-none absolute inset-y-0 rounded-2xl bg-brand/[0.06] transition-all duration-200" style={{ left: left(hc), width: `${COL}%` }} />}
          {pop >= 0 && (
            <div aria-hidden className="pointer-events-none absolute -inset-y-4 z-0 rounded-[1.75rem] border-2 border-brand bg-brand-soft/60 shadow-glow" style={{ left: left(pop), width: `${COL}%` }}>
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">Most popular</span>
            </div>
          )}
          <table className="relative z-10 w-full table-fixed border-collapse text-sm">
            <colgroup><col style={{ width: `${LABEL}%` }} />{packages.map((p) => <col key={p.id} style={{ width: `${COL}%` }} />)}</colgroup>
            <thead>
              <tr>
                <th className="px-6 py-7 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Compare</th>
                {packages.map((p, k) => {
                  const Ico = ICONS2[p.icon]
                  return (
                    <th key={p.id} onMouseEnter={() => setHc(k)} className="px-3 py-7 text-center align-top">
                      {Ico && <span className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${k === pop ? 'bg-brand text-white' : 'bg-slate-100 text-brand-ink'}`}><Ico width={18} height={18} /></span>}
                      <span className="block text-[15px] font-semibold leading-tight text-fg">{p.name}</span>
                      <span className="mt-1.5 block text-base font-bold tabular-nums text-brand-ink">{price(p)}</span>
                      <span className="text-[11px] font-normal text-slate-500">per shift</span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {compare.map((r, i) => (
                <motion.tr key={r.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="group/row border-t border-slate-200/70 transition-colors hover:bg-fg/[0.03]">
                  <td className="px-6 py-4 font-medium text-fg">{r.label}</td>
                  {r.v.map((v, k) => (
                    <td key={k} onMouseEnter={() => setHc(k)} className={`px-3 py-4 text-center text-[13px] leading-snug ${k === pop ? 'font-medium text-fg' : 'text-slate-600'}`}><Cell v={v} /></td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* phone / tablet: choose a plan, read its list (nothing scrolls sideways) */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="tablist" aria-label="Choose a package">
          {packages.map((p, k) => (
            <button key={p.id} type="button" role="tab" aria-selected={sel === k} onClick={() => setSel(k)}
              className={`relative rounded-2xl px-3 py-2.5 text-center text-[13px] font-semibold leading-tight transition active:scale-95 ${sel === k ? 'bg-brand text-white shadow-glow' : 'bg-surface text-slate-600 ring-1 ring-slate-200/80'}`}>
              {p.name}{k === pop && <span className={`mt-1 block text-[10px] font-bold uppercase tracking-wider ${sel === k ? 'text-white/80' : 'text-brand-ink'}`}>Most popular</span>}
            </button>
          ))}
        </div>
        <motion.div key={sel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          className={`mt-4 overflow-hidden rounded-3xl bg-surface shadow-card ${sel === pop ? 'ring-2 ring-brand' : 'ring-1 ring-fg/5'}`}>
          <div className={`flex items-center justify-between gap-3 px-5 py-4 ${sel === pop ? 'bg-brand-soft' : 'bg-slate-50'}`}>
            <p className="text-base font-semibold text-fg">{packages[sel].name}</p>
            <p className="text-right"><b className="text-lg tabular-nums text-brand-ink">{price(packages[sel])}</b><span className="block text-[11px] text-slate-500">per shift</span></p>
          </div>
          <ul className="divide-y divide-slate-200/70">
            {compare.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="font-medium text-fg">{r.label}</span>
                <span className="text-right text-slate-600"><Cell v={r.v[sel]} /></span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </>
  )
}
