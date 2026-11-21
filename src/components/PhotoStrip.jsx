import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { img } from '../data'
import { ArrowRight } from './Icons'
import SectionHead from './SectionHead'

/* A row of real photos with captions. items: [{ id: 'p031', cap: 'Caption', alt? }] (files: public/images/gallery/<id>.webp) */
const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }
export default function PhotoStrip({ eyebrow, title, text, items, bg = false, link = true }) {
  const cols = items.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'
  return (
    <section className={`${bg ? 'bg-slate-50' : ''} py-16 sm:py-24`}>
      <div className="container-x">
        <SectionHead eyebrow={eyebrow} title={title} text={text} />
        <motion.ul initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ show: { transition: { staggerChildren: 0.09 } } }} className={`mt-12 grid gap-3 ${cols}`}>
          {items.map((p) => (
            <motion.li key={p.id} variants={item} className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-ink">
              <img src={img(`gallery/${p.id}-t.webp`)} alt={p.alt || p.cap} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute inset-x-4 bottom-4 text-sm font-semibold text-white">{p.cap}</span>
            </motion.li>
          ))}
        </motion.ul>
        {link && <div className="mt-10 text-center"><Link to="/gallery" className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-fg transition hover:bg-brand hover:text-white active:scale-95">See the full gallery <ArrowRight /></Link></div>}
      </div>
    </section>
  )
}
