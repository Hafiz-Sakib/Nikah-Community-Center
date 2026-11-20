import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { faqs, img } from '../data'
import { ChevronDown } from './Icons'
import Reveal from './Reveal'

export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="bg-slate-50 py-16 sm:py-24">
      <div className="container-x">
        <Reveal><h2 className="section-title">Frequently Asked Questions</h2></Reveal>
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const on = open === i
              return (
                <Reveal key={f.q} delay={i * 0.06}>
                  <div className={`overflow-hidden rounded-2xl bg-white ring-1 transition-shadow ${on ? 'shadow-dock ring-brand/30' : 'ring-slate-200/80'}`}>
                    <button onClick={() => setOpen(on ? -1 : i)} aria-expanded={on}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-ink">
                      <span>{f.q}</span>
                      <motion.span animate={{ rotate: on ? 180 : 0 }} className="shrink-0 text-brand"><ChevronDown /></motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
                          <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <Reveal y={0} delay={0.1}>
            <img src={img('crowd.webp')} alt="Guests celebrating at an event" loading="lazy" className="mx-auto w-full max-w-lg rounded-3xl object-cover shadow-dock" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
