import { motion } from 'motion/react'
import { reviews, img } from '../data'
import { Star } from './Icons'
import SectionHead from './SectionHead'

const stars = (n) => Array.from({ length: 5 }, (_, i) => Math.max(0, Math.min(1, n - i)))

export default function Reviews() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <SectionHead eyebrow="Reviews" title="Loved by families and teams" text="What our guests say about their events." />
        <div className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {reviews.map((r, i) => (
            <motion.figure key={r.name} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 110, damping: 16 }} whileHover={{ y: -6 }}
              className="flex w-[82%] shrink-0 snap-center flex-col items-center rounded-3xl bg-white p-7 text-center shadow-dock ring-1 ring-slate-100 sm:w-auto sm:last:col-span-2 lg:last:col-span-1">
              <img src={img(r.img)} alt={r.name} loading="lazy" className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-soft" />
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-slate-600">“{r.text}”</blockquote>
              <div className="mt-4 flex gap-0.5" role="img" aria-label={`${r.stars} out of 5 stars`}>{stars(r.stars).map((f, k) => <Star key={k} fill={f} />)}</div>
              <figcaption className="mt-2"><b className="block text-ink">{r.name}</b><span className="text-xs text-slate-400">{r.role}</span></figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
