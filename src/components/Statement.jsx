import { motion, useReducedMotion } from 'motion/react'
import Reveal from './Reveal'

/* Marker sweeps behind key phrases as the paragraph scrolls in (motion-brew “Highlight text”) */
const Mark = ({ children, i }) => {
  const reduce = useReducedMotion()
  return (
    <motion.mark initial={{ backgroundSize: reduce ? '100% 100%' : '0% 100%' }} whileInView={{ backgroundSize: '100% 100%' }} viewport={{ once: true, margin: '-25% 0px' }}
      transition={{ duration: 0.9, delay: 0.2 + i * 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-md bg-transparent bg-gradient-to-r from-brand/25 to-brand/25 bg-no-repeat px-1 text-fg [-webkit-box-decoration-break:clone] [box-decoration-break:clone]" style={{ backgroundPosition: '0 0' }}>{children}</motion.mark>
  )
}

export default function Statement() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x max-w-4xl text-center">
        <Reveal><span className="inline-block rounded-full bg-brand-soft px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-ink">Why families choose us</span></Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 text-2xl font-medium leading-[1.55] tracking-tight text-slate-500 sm:text-3xl md:text-[2.4rem] md:leading-[1.5]">
            From <Mark i={0}>holud to reception</Mark>, one team looks after the stage, the food and the guests — in a <Mark i={1}>spotless, air-conditioned hall</Mark> with fair prices and <Mark i={2}>no surprises on the day</Mark>.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
