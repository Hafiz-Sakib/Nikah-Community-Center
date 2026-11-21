import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { reviews, img } from '../data'
import { Star } from './Icons'
import SectionHead from './SectionHead'

const stars = (n) => Array.from({ length: 5 }, (_, i) => Math.max(0, Math.min(1, n - i)))
const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('')
const R = 30, C = 2 * Math.PI * R
const EVERY = 6500

/* Quote rises word by word out of blur; a ring fills around the active avatar (motion-brew “Avatar testimonial”) */
export default function Reviews() {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => { if (paused || reduce) return; const t = setTimeout(() => setI((n) => (n + 1) % reviews.length), EVERY); return () => clearTimeout(t) }, [i, paused, reduce])
  const r = reviews[i]
  return (
    <section className="py-16 sm:py-24" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x">
        <SectionHead eyebrow="Reviews" title="Loved by families and teams" text="What our guests say about their events." />
        <div className="mx-auto mt-12 max-w-3xl text-center">
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 sm:gap-x-4">
            {reviews.map((x, k) => (
              <button key={x.name} onClick={() => setI(k)} aria-label={`Show review by ${x.name}`} aria-pressed={k === i} className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 72 72" aria-hidden>
                  <circle cx="36" cy="36" r={R} fill="none" strokeWidth="3" className="stroke-slate-200" />
                  {k === i && <motion.circle key={`${i}-${paused}`} cx="36" cy="36" r={R} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-brand" strokeDasharray={C} initial={{ strokeDashoffset: reduce || paused ? 0 : C }} animate={{ strokeDashoffset: 0 }} transition={{ duration: reduce || paused ? 0 : EVERY / 1000, ease: 'linear' }} />}
                </svg>
                <span className={`flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full text-base font-semibold transition-all ${k === i ? 'bg-brand text-white' : 'bg-brand-soft text-brand-ink opacity-60 hover:opacity-100'}`}>{x.photo ? <img src={img(x.photo)} alt="" loading="lazy" className="h-full w-full rounded-full object-cover" /> : initials(x.name)}</span>
              </button>
            ))}
          </div>
          <div className="mt-8 min-h-[11rem] sm:min-h-[9rem]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.blockquote key={i} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="text-xl font-medium leading-relaxed tracking-tight text-fg sm:text-2xl">
                <span className="sr-only">{r.text}</span>
                <span aria-hidden>“{r.text.split(' ').map((w, k) => (
                  <motion.span key={k} className="inline-block whitespace-pre" initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.55, delay: k * 0.035, ease: [0.22, 1, 0.36, 1] }}>{w + (k < r.text.split(' ').length - 1 ? ' ' : '')}</motion.span>
                ))}”</span>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className="mt-2 flex justify-center gap-0.5" role="img" aria-label={`${r.stars} out of 5 stars`}>{stars(r.stars).map((f, k) => <Star key={k} fill={f} />)}</div>
          <p className="mt-3"><b className="text-fg">{r.name}</b><span className="block text-sm text-slate-400">{r.role}</span></p>
        </div>
      </div>
    </section>
  )
}
