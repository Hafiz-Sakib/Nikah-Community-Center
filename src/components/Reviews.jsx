import { motion, useReducedMotion } from 'motion/react'
import { reviews, img } from '../data'
import { Star } from './Icons'
import SectionHead from './SectionHead'
import { TiltCard } from './brew/TiltCard'

const stars = (n) => Array.from({ length: 5 }, (_, i) => Math.max(0, Math.min(1, n - i)))
const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('')
const avg = reviews.reduce((s, r) => s + r.stars, 0) / reviews.length

/* Review cards: a swipeable row on phones, a 2 / 3 column grid on larger screens. Each card lifts and tilts a little on hover. */
export default function Reviews() {
  const reduce = useReducedMotion()
  return (
    <section className="py-16 sm:py-24">
      <div className="container-wide">
        <SectionHead eyebrow="Reviews" title="Loved by families and teams" text="What our guests say about their events." />
        <div className="mt-6 flex items-center justify-center gap-3" role="img" aria-label={`Average rating ${avg.toFixed(1)} out of 5`}>
          <span className="flex gap-0.5">{stars(avg).map((f, k) => <Star key={k} fill={f} />)}</span>
          <span className="text-sm text-slate-500"><b className="text-fg">{avg.toFixed(1)}</b> from {reviews.length} reviews</span>
        </div>
        <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {reviews.map((r, k) => (
            <motion.li key={r.name} className="w-[82%] shrink-0 snap-center sm:w-auto"
              initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: (k % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}>
              <TiltCard maxTilt={5} hoverScale={1.02} glareOpacity={0.18} className="ring-1 ring-slate-200/70">
                <figure className="flex h-full flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-0.5" role="img" aria-label={`${r.stars} out of 5 stars`}>{stars(r.stars).map((f, i) => <Star key={i} fill={f} />)}</div>
                    <span aria-hidden className="select-none font-serif text-5xl leading-none text-brand/25">“</span>
                  </div>
                  <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-fg">{r.text}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-200/70 pt-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-semibold text-brand-ink">
                      {r.photo ? <img src={img(r.photo)} alt="" loading="lazy" className="h-full w-full object-cover" /> : initials(r.name)}
                    </span>
                    <span className="min-w-0"><b className="block truncate text-sm text-fg">{r.name}</b><span className="block truncate text-xs text-slate-500">{r.role}</span></span>
                  </figcaption>
                </figure>
              </TiltCard>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
