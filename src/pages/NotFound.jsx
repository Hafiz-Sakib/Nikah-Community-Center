import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { img } from '../data'

/* 404: the wedding rings photo, with a line that fits the venue. */
export default function NotFound() {
  const reduce = useReducedMotion()
  const up = (d) => reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  return (
    <section className="pt-16">
      <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-ink px-6 py-16 text-center">
        <img src={img('auth-rings.webp')} alt="" data-keep className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70" />
        <div className="relative max-w-xl text-white">
          <motion.p {...up(0.05)} className="select-none text-[7rem] font-bold leading-none tracking-tight text-white/90 sm:text-[10rem]" aria-hidden>404</motion.p>
          <motion.h1 {...up(0.15)} className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">This page has slipped away</motion.h1>
          <motion.p {...up(0.25)} className="mx-auto mt-3 max-w-md text-sm text-white/80 sm:text-base">Like a date that’s already been taken, the page you’re looking for isn’t here. Let’s get you back to the celebration.</motion.p>
          <motion.div {...up(0.35)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className="btn-primary">Back to home</Link>
            <Link to="/booking" className="inline-flex items-center justify-center rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white/25 active:scale-95">Book a date</Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
