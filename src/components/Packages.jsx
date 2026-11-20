import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { packages, compare } from '../data'
import { ICONS2, CheckIcon, ArrowRight } from './Icons'
import Odometer from './Odometer'

/* Pricing card in a soft shell (idea: Motion Brew "Pricing card").
   Hover: the shell glows with a drifting gradient and the quiet note rolls up; the price rolls like an odometer when you switch to Full day. */
function PackageCard({ p, index }) {
  const [full, setFull] = useState(false)
  const Ico = ICONS2[p.icon]
  const price = Math.round(p.price * (full ? 1.7 : 1))

  return (
    <motion.li initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: index * 0.1, type: 'spring', stiffness: 100, damping: 16 }} className="h-full">
      <div className={`group relative flex h-full flex-col rounded-[2rem] p-1.5 ring-1 transition-shadow duration-500 hover:shadow-card ${p.popular ? 'bg-brand-soft ring-brand/30' : 'bg-slate-100 ring-fg/5'}`}>
        {/* drifting glow, visible on hover */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute -inset-1/4 animate-drift motion-reduce:animate-none" style={{ background: 'radial-gradient(38% 38% at 28% 30%, rgba(63,135,245,.42), transparent 70%), radial-gradient(36% 36% at 76% 72%, rgba(167,139,250,.34), transparent 70%), radial-gradient(30% 30% at 70% 20%, rgba(56,189,248,.28), transparent 70%)' }} />
        </div>

        {/* strip above the card */}
        <div className="relative z-10 flex h-10 items-center justify-between px-4 text-[13px] font-medium text-slate-600">
          <span className="relative block h-4 overflow-hidden whitespace-nowrap">
            <span className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-1/2 motion-reduce:transition-none">
              <span className="block h-4 leading-4">{p.ideal}</span>
              <span className="block h-4 leading-4 text-brand-ink">Up to {p.cap} guests</span>
            </span>
          </span>
          {p.popular && <span className="shrink-0 whitespace-nowrap rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">Most booked</span>}
        </div>

        <div className={`relative z-10 flex flex-1 flex-col rounded-3xl bg-surface p-5 shadow-card ${p.popular ? 'ring-1 ring-brand/40' : ''}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-fg"><Ico width={20} height={20} /></span>
            <h3 className="text-lg font-semibold text-fg">{p.name}</h3>
          </div>
          <p className="mt-3 text-[15px] leading-snug text-slate-600">{p.desc}</p>

          <div className="mt-5">
            <Odometer value={price} prefix="৳" className="text-[2.6rem] font-bold leading-none text-fg" />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[15px] text-slate-600">/ {full ? 'full day' : 'shift'}</span>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-slate-600">
                Full day
                <button type="button" role="switch" aria-checked={full} aria-label={`Full day price for ${p.name}`} onClick={() => setFull((f) => !f)}
                  className={`relative h-6 w-10 rounded-full transition-colors duration-300 ${full ? 'bg-brand' : 'bg-slate-200'}`}>
                  <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${full ? 'left-[1.15rem]' : 'left-0.5'}`} />
                </button>
              </label>
            </div>
            <p className="mt-2 text-[13px] text-slate-600">{full ? 'Morning + Evening · about 15% cheaper' : 'Billed per shift · Fri & Sat +15%'}</p>
          </div>

          <motion.div whileHover="hover" whileTap={{ scale: 0.98 }} className="mt-5">
            <Link to={`/booking?package=${p.id}`} className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-colors ${p.popular ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-slate-100 text-fg hover:bg-fg hover:text-surface'}`}>
              Book this package <motion.span variants={{ hover: { x: 4 } }} className="inline-flex"><ArrowRight /></motion.span>
            </Link>
          </motion.div>
          <p className="mt-3 text-center text-[13px] text-slate-600">30% advance confirms your date</p>

          <div className="my-5 h-px bg-slate-200/80" />
          <motion.ul initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } }} className="space-y-4">
            {p.items.map((it) => {
              const I = ICONS2[it.icon]
              return (
                <motion.li key={it.title} variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-start gap-3">
                  <I width={18} height={18} className="mt-0.5 shrink-0 text-brand-ink" />
                  <span><span className="block text-[15px] font-medium leading-tight text-fg">{it.title}</span><span className="mt-0.5 block text-[13px] leading-snug text-slate-600">{it.text}</span></span>
                </motion.li>
              )
            })}
          </motion.ul>
        </div>
      </div>
    </motion.li>
  )
}

export function PackageGrid() {
  return (
    <>
      <ul className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {packages.map((p, i) => <PackageCard key={p.id} p={p} index={i} />)}
      </ul>
      <p className="mt-6 text-center text-[13px] text-slate-600">Friday &amp; Saturday carry a 15% surcharge. Full day = Morning + Evening at 1.7× the shift price.</p>
    </>
  )
}

export function CompareTable() {
  return (
    <div className="overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-fg/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-surface p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Compare</th>
              {packages.map((p) => <th key={p.id} className={`p-4 text-left ${p.popular ? 'bg-brand-soft' : ''}`}><span className="block font-semibold text-fg">{p.name}</span><span className="text-xs font-normal text-brand-ink">৳{p.price.toLocaleString('en-IN')} / shift</span></th>)}
            </tr>
          </thead>
          <tbody>
            {compare.map((r, i) => (
              <motion.tr key={r.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="border-t border-slate-100">
                <td className="sticky left-0 z-10 bg-surface p-4 font-medium text-fg">{r.label}</td>
                {r.v.map((v, k) => (
                  <td key={k} className={`p-4 text-slate-600 ${packages[k].popular ? 'bg-brand-soft/50' : ''}`}>
                    {v === true ? <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckIcon width={14} height={14} /></span> : v === false ? <span className="text-slate-300">—</span> : v}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
