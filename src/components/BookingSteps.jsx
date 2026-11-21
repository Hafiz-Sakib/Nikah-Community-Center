import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { process } from '../data'
import { ICONS2, CheckIcon } from './Icons'
import SectionHead from './SectionHead'

/* Segmented bar fills and each step checks in turn (motion-brew “Verify flow”) */
export default function BookingSteps() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const reduce = useReducedMotion()
  const [done, setDone] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduce) { setDone(process.length); return }
    const t = setInterval(() => setDone((n) => { if (n >= process.length) { clearInterval(t); return n } return n + 1 }), 750)
    return () => clearInterval(t)
  }, [inView, reduce])
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x" ref={ref}>
        <SectionHead eyebrow="How it works" title="Book your date in five easy steps" text="From the first enquiry to the big day, here is how simple we keep it." />
        <div className="mx-auto mt-12 flex max-w-4xl gap-1.5" aria-hidden>
          {process.map((_, k) => (
            <span key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <motion.span className="block h-full origin-left rounded-full bg-brand" initial={false} animate={{ scaleX: done > k ? 1 : 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
            </span>
          ))}
        </div>
        <ol className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {process.map((s, k) => {
            const Ico = ICONS2[s.icon], on = done > k
            return (
              <motion.li key={s.title} initial={false} animate={{ y: on ? 0 : 10, opacity: on ? 1 : 0.5 }} transition={{ duration: 0.4 }}
                className={`relative flex gap-4 rounded-3xl p-5 ring-1 transition-colors lg:flex-col lg:gap-3 ${on ? 'bg-surface shadow-card ring-brand/25' : 'bg-slate-50 ring-slate-200/70'}`}>
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink"><Ico width={22} height={22} />
                  <motion.span initial={false} animate={{ scale: on ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-surface"><CheckIcon width={12} height={12} strokeWidth={3} /></motion.span>
                </span>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step {k + 1}</p><h3 className="font-semibold text-fg">{s.title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-500">{s.text}</p></div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
