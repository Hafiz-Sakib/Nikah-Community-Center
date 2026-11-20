import { motion } from 'framer-motion'
import { img } from '../data'
import { ArrowRight } from './Icons'
import Reveal from './Reveal'

export default function Ceremony() {
  return (
    <section className="py-16 sm:py-24" aria-labelledby="ceremony-h">
      <div className="container-x grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <motion.div initial={{ clipPath: 'inset(0 100% 0 0 round 24px)' }} whileInView={{ clipPath: 'inset(0 0% 0 0 round 24px)' }}
          viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl shadow-dock">
          <motion.img src={img('ceremony.webp')} alt="Couple at a wedding ceremony surrounded by family" loading="lazy"
            whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} className="aspect-[4/3] w-full object-cover" />
        </motion.div>
        <div>
          <Reveal as="h2" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl md:text-4xl"><span id="ceremony-h">A marriage ceremony is special to us</span></Reveal>
          <Reveal delay={0.1}><p className="mt-3 text-lg font-medium text-brand">Where there is love, there is life!</p></Reveal>
          <Reveal delay={0.2}><p className="mt-4 leading-relaxed text-slate-600">A wedding ceremony is a joyous occasion through which a couple starts their married life. It is not merely an obligation, but a socially and culturally important event — and we treat every one that way.</p></Reveal>
          <Reveal delay={0.3}>
            <motion.a href="#gallery" whileHover="hover" className="btn-primary mt-7 w-full sm:w-auto">
              Explore Our Gallery
              <motion.span variants={{ hover: { x: 4 } }} className="inline-flex"><ArrowRight /></motion.span>
            </motion.a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
