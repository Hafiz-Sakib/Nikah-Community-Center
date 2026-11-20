import { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Link } from 'react-router-dom'
import { packages, compare } from '../data'
import { ICONS2, CheckIcon, ArrowRight } from './Icons'
import AnimatedNumber from './AnimatedNumber'

function PackageCard({ p, mode, index }) {
  const Ico = ICONS2[p.icon]
  const mult = mode === 'full' ? 1.7 : 1
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const gx = useMotionValue(50), gy = useMotionValue(30)
  const glare = useTransform([gx, gy], ([x, y]) => `radial-gradient(320px circle at ${x}% ${y}%, rgba(255,255,255,${p.popular ? 0.14 : 0.55}), transparent 60%)`)
  const move = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    ry.set((x - 0.5) * 10); rx.set((0.5 - y) * 10); gx.set(x * 100); gy.set(y * 100)
  }
  const leave = () => { rx.set(0); ry.set(0) }
  const dark = p.popular

  return (
    <motion.li initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: index * 0.1, type: 'spring', stiffness: 100, damping: 16 }}
      style={{ perspective: 1100 }} className={dark ? 'lg:-my-4' : ''}>
      <motion.div onPointerMove={move} onPointerLeave={leave} style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className={`relative h-full overflow-hidden rounded-[2rem] p-[1.5px] ${dark ? 'shadow-glow' : 'shadow-sm ring-1 ring-slate-200'}`}>
        {dark && <div aria-hidden className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none" style={{ background: 'conic-gradient(from 0deg, #3f87f5, #a5c8ff, #ffffff, #3f87f5 40%, #1d4ed8, #3f87f5)', animation: 'spin-slow 6s linear infinite' }} />}
        <div className={`relative flex h-full flex-col rounded-[calc(2rem-1.5px)] p-6 sm:p-7 ${dark ? 'bg-ink text-white lg:py-10' : 'bg-white'}`}>
          <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
          <div className="relative flex items-start justify-between">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dark ? 'bg-brand text-white shadow-lg shadow-brand/40' : 'bg-brand-soft text-brand'}`}><Ico /></span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${dark ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-slate-100 text-slate-500'}`}>{dark ? '★ ' : ''}{p.tag}</span>
          </div>
          <h3 className={`relative mt-5 text-xl font-semibold ${dark ? '' : 'text-ink'}`}>{p.name}</h3>
          <p className={`relative mt-1 text-sm ${dark ? 'text-white/65' : 'text-slate-500'}`}>{p.desc}</p>

          <div className="relative mt-5 flex items-end gap-1.5">
            <AnimatedNumber value={Math.round(p.price * mult)} prefix="৳" className={`text-[2rem] font-bold tracking-tight tabular-nums xl:text-4xl ${dark ? '' : 'text-ink'}`} />
            <span className={`whitespace-nowrap pb-1 text-sm ${dark ? 'text-white/55' : 'text-slate-400'}`}>/ {mode === 'full' ? 'full day' : 'shift'}</span>
          </div>

          <div className="relative mt-5">
            <div className={`mb-1.5 flex justify-between text-xs font-medium ${dark ? 'text-white/65' : 'text-slate-500'}`}><span>Capacity</span><span>Up to {p.cap} guests</span></div>
            <div className={`h-1.5 overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${(p.cap / 600) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }} className={`h-full rounded-full ${dark ? 'bg-brand' : 'bg-gradient-to-r from-brand to-sky-400'}`} />
            </div>
          </div>

          <div className={`relative my-5 h-px ${dark ? 'bg-white/10' : 'bg-slate-100'}`} />
          <motion.ul initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }} className="relative flex-1 space-y-3">
            {p.items.map((it) => (
              <motion.li key={it} variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className={`flex items-center gap-3 text-sm ${dark ? 'text-white/85' : 'text-slate-600'}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-brand text-white' : 'bg-brand-soft text-brand'}`}><CheckIcon width={12} height={12} /></span>{it}
              </motion.li>
            ))}
          </motion.ul>

          <motion.div whileHover="hover" whileTap={{ scale: 0.97 }} className="relative mt-7">
            <Link to={`/booking?package=${p.id}`} className={`group flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition ${dark ? 'bg-white text-ink hover:bg-brand-soft' : 'bg-ink text-white hover:bg-brand'}`}>
              Book this package <motion.span variants={{ hover: { x: 4 } }} className="inline-flex"><ArrowRight /></motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.li>
  )
}

export function PackageGrid() {
  const [mode, setMode] = useState('shift')
  return (
    <>
      <div className="mt-8 flex justify-center">
        <div className="relative inline-flex rounded-full bg-slate-100 p-1" role="tablist" aria-label="Pricing basis">
          {[['shift', 'Per shift'], ['full', 'Full day']].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${mode === k ? 'text-ink' : 'text-slate-500'}`}>
              {mode === k && <motion.span layoutId="pkg-mode" className="absolute inset-0 rounded-full bg-white shadow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative flex items-center gap-2">{l}{k === 'full' && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">SAVE 15%</span>}</span>
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
        {packages.map((p, i) => <PackageCard key={p.id} p={p} mode={mode} index={i} />)}
      </ul>
      <p className="mt-6 text-center text-xs text-slate-400">Friday &amp; Saturday carry a 15% surcharge. Full day = Morning + Evening at 1.7× the shift price.</p>
    </>
  )
}

export function CompareTable() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-dock ring-1 ring-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Compare</th>
              {packages.map((p) => <th key={p.id} className={`p-4 text-left ${p.popular ? 'bg-brand-soft' : ''}`}><span className="block font-semibold text-ink">{p.name}</span><span className="text-xs font-normal text-brand-dark">৳{p.price.toLocaleString('en-IN')} / shift</span></th>)}
            </tr>
          </thead>
          <tbody>
            {compare.map((r, i) => (
              <motion.tr key={r.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="border-t border-slate-100">
                <td className="sticky left-0 z-10 bg-white p-4 font-medium text-ink">{r.label}</td>
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
