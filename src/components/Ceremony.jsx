import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { img } from '../data'
import { ArrowRight } from './Icons'
import Reveal from './Reveal'
import { Underline } from './ui'

/* Text set on a circle, spinning around an arrow badge (motion-brew “Rotating text”) */
function SpinBadge() {
  return (
    <Link to="/booking" aria-label="Book your date" className="group absolute -bottom-6 right-4 z-10 flex h-28 w-28 items-center justify-center rounded-full bg-brand text-white shadow-glow transition active:scale-95 sm:right-8 sm:h-32 sm:w-32">
      <svg viewBox="0 0 120 120" aria-hidden className="absolute inset-0 animate-[spin-slow_14s_linear_infinite] motion-reduce:animate-none">
        <defs><path id="ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
        <text fontSize="11.5" fontWeight="600" letterSpacing="3.2" fill="currentColor"><textPath href="#ring">BOOK YOUR DATE • BOOK YOUR DATE • </textPath></text>
      </svg>
      <ArrowRight width={26} height={26} className="-rotate-45 transition-transform group-hover:rotate-0" />
    </Link>
  )
}

export default function Ceremony() {
  return (
    <section className="py-16 sm:py-24" aria-labelledby="ceremony-h">
      <div className="container-x grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="relative"><motion.div initial={{ clipPath: 'inset(0 100% 0 0 round 24px)' }} whileInView={{ clipPath: 'inset(0 0% 0 0 round 24px)' }}
          viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl shadow-dock">
          <motion.img src={img('ceremony.webp')} alt="Family standing together on a decorated wedding stage" loading="lazy"
            whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} className="aspect-[4/3] w-full object-cover" />
        </motion.div><SpinBadge /></div>
        <div>
          <Reveal as="h2" className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl md:text-4xl"><span id="ceremony-h">A marriage ceremony is special to us</span></Reveal>
          <Reveal delay={0.1}><p className="mt-3 text-lg font-medium text-brand">Where there is love, there is <Underline>life</Underline>!</p></Reveal>
          <Reveal delay={0.2}><p className="mt-4 leading-relaxed text-slate-600">A wedding ceremony is a joyous occasion through which a couple starts their married life. It is not merely an obligation, but a socially and culturally important event — and we treat every one that way.</p></Reveal>
          <Reveal delay={0.3}>
            <motion.div whileHover="hover" className="mt-7"><Link to="/gallery" className="btn-primary w-full sm:w-auto">
              Explore Our Gallery
              <motion.span variants={{ hover: { x: 4 } }} className="inline-flex"><ArrowRight /></motion.span>
            </Link></motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
