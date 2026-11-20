import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { faqs, img } from '../data'
import { ChevronDown } from './Icons'
import Reveal from './Reveal'
import SectionHead from './SectionHead'

export default function Faq({ bg = true }) {
  const [open, setOpen] = useState(0)
  return (
    <section className={`${bg ? 'bg-slate-50' : ''} py-16 sm:py-24`}>
      <div className="container-x">
        <SectionHead eyebrow="FAQ" title="Frequently asked questions" text="Quick answers about booking, pricing and policies." />
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const on = open === i
              return (
                <Reveal key={f.q} delay={i * 0.05}>
                  <div className={`overflow-hidden rounded-2xl bg-white ring-1 transition-shadow ${on ? 'shadow-dock ring-brand/30' : 'ring-slate-200/80'}`}>
                    <button onClick={() => setOpen(on ? -1 : i)} aria-expanded={on} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-ink">
                      <span>{f.q}</span>
                      <motion.span animate={{ rotate: on ? 180 : 0 }} className="shrink-0 text-brand"><ChevronDown /></motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}><p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</p></motion.div>)}
                    </AnimatePresence>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <Reveal y={0} delay={0.1}><img src={img('crowd.webp')} alt="Guests celebrating at an event" loading="lazy" className="mx-auto w-full max-w-lg rounded-3xl object-cover shadow-dock" /></Reveal>
        </div>
      </div>
    </section>
  )
}
