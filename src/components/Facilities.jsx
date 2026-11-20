import { useEffect, useRef } from 'react'
import { animate, useInView, motion } from 'motion/react'
import { facilities, stats } from '../data'
import { ICONS2 } from './Icons'

function Counter({ to, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) + suffix } })
    return () => c.stop()
  }, [inView, to, suffix])
  return <span ref={ref}>0{suffix}</span>
}

export function StatsBand() {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-3xl bg-ink p-5 text-center text-white sm:grid-cols-4 sm:p-8">
      {stats.map((s) => (<div key={s.label}><p className="text-3xl font-semibold tabular-nums sm:text-4xl"><Counter to={s.value} suffix={s.suffix} /></p><p className="mt-1 text-xs text-white/60 sm:text-sm">{s.label}</p></div>))}
    </div>
  )
}

function Spot({ children, className = '' }) {
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`) }
  return (
    <div onMouseMove={move} className={`group relative overflow-hidden rounded-3xl bg-surface p-6 ring-1 ring-slate-200/80 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(260px circle at var(--x) var(--y), rgba(63,135,245,.14), transparent 70%)' }} />
      <div className="relative">{children}</div>
    </div>
  )
}

export function FacilitiesGrid({ limit }) {
  const list = limit ? facilities.slice(0, limit) : facilities
  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((f) => {
        const Ico = ICONS2[f.icon]
        return (
          <motion.div key={f.title} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}>
            <Spot className="h-full transition-shadow hover:shadow-dock">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Ico /></span>
              <h3 className="mt-4 font-semibold text-fg">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{f.text}</p>
            </Spot>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
