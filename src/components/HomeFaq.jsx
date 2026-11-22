import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { faqs, img } from '../data'
import { PlusIcon, ArrowRight } from './Icons'
import Reveal from './Reveal'
import SectionHead from './SectionHead'

/* Panels spring open with motion blur; plus folds into minus; the answer comes into focus (motion-brew “Blur accordion”) */
export default function HomeFaq({ limit = 4 }) {
  const [open, setOpen] = useState(0)
  const reduce = useReducedMotion()
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="container-x">
        <SectionHead eyebrow="FAQ" title="Questions, answered" text="The things families ask us most before they book." />
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <Reveal y={0}><img src={img('crowd.webp')} alt="Family and friends gathered for a group photo at a wedding" loading="lazy" className="mx-auto w-full max-w-lg rounded-3xl object-cover shadow-dock" /></Reveal>
          <div className="space-y-3">
            {faqs.slice(0, limit).map((f, i) => {
              const on = open === i
              return (
                <Reveal key={f.q} delay={i * 0.05}>
                  <div className={`overflow-hidden rounded-2xl bg-surface ring-1 transition-shadow ${on ? 'shadow-dock ring-brand/30' : 'ring-slate-200/80'}`}>
                    <button onClick={() => setOpen(on ? -1 : i)} aria-expanded={on} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-fg">
                      <span>{f.q}</span>
                      <motion.span animate={{ rotate: on ? 135 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }} className="shrink-0 text-brand"><PlusIcon /></motion.span>
                    </button>
                    <motion.div initial={false} animate={{ height: on ? 'auto' : 0, filter: on || reduce ? 'blur(0px)' : 'blur(8px)', opacity: on ? 1 : 0 }} transition={{ type: 'spring', stiffness: 220, damping: 28 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500">{f.a}</p>
                    </motion.div>
                  </div>
                </Reveal>
              )
            })}
            <Reveal delay={0.25}><Link to="/connect" className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-brand-ink hover:underline">More questions <ArrowRight /></Link></Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
