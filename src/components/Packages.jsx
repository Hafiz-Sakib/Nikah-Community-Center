import { motion } from 'framer-motion'
import { packages } from '../data'
import { money } from '../lib/store'
import { CheckCircle } from './Icons'
import Reveal from './Reveal'

const list = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const card = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 16 } } }

export default function Packages({ onChoose }) {
  return (
    <section id="packages" className="bg-slate-50 py-16 sm:py-24">
      <div className="container-x">
        <Reveal><h2 className="section-title">Our Packages</h2></Reveal>
        <Reveal delay={0.08}><p className="mx-auto mt-3 max-w-xl text-center text-slate-500">Simple pricing for every kind of occasion.</p></Reveal>
        <motion.ul variants={list} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
          {packages.map((p) => (
            <motion.li key={p.name} variants={card} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`relative flex h-full flex-col rounded-3xl p-6 ${p.popular ? 'bg-brand text-white shadow-glow lg:-my-4 lg:py-10' : 'bg-white shadow-sm ring-1 ring-slate-200/70'}`}>
              {p.popular && <span className="absolute -top-3 right-5 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow">Popular</span>}
              <p className={`text-3xl font-bold ${p.popular ? '' : 'text-ink'}`}>{money(p.price)}<span className={`ml-1 text-sm font-normal ${p.popular ? 'text-white/70' : 'text-slate-400'}`}>/ shift</span></p>
              <h3 className={`mt-2 text-lg font-semibold ${p.popular ? '' : 'text-ink'}`}>{p.name}</h3>
              <p className={`mt-1 text-xs font-medium ${p.popular ? 'text-white/70' : 'text-slate-400'}`}>Up to {p.cap} guests</p>
              <p className={`mt-1 text-sm ${p.popular ? 'text-white/85' : 'text-slate-500'}`}>{p.desc}</p>
              <ul className="my-5 flex-1 space-y-2.5">
                {p.items.map((it) => (
                  <li key={it} className={`flex items-center gap-2 text-sm ${p.popular ? 'text-white' : 'text-slate-600'}`}>
                    <CheckCircle className={`shrink-0 ${p.popular ? 'text-white' : 'text-brand'}`} />{it}
                  </li>
                ))}
              </ul>
              <motion.a href="#booking" onClick={() => onChoose(p.id)} whileTap={{ scale: 0.96 }}
                className={`rounded-full py-3 text-center text-sm font-semibold transition ${p.popular ? 'bg-white text-brand hover:bg-brand-soft' : 'bg-brand-soft text-brand hover:bg-brand hover:text-white'}`}>
                Book this package
              </motion.a>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
