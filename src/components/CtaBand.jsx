import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { CONTACT } from '../data'
import { ArrowRight, PhoneIcon } from './Icons'
import { FlipWords, Magnetic } from './ui'

export default function CtaBand() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-brand-dark px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <motion.div aria-hidden animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <motion.div aria-hidden animate={{ x: [0, -25, 0], y: [0, 25, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-2xl font-semibold tracking-tight sm:text-4xl">Ready to plan your <FlipWords words={['wedding', 'reception', 'holud', 'milad', 'event']} className="text-white/90 underline decoration-white/40 decoration-2 underline-offset-8" />?</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-white/85">Reserve your date online in minutes, or talk to our team first. We’re happy to show you around.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Magnetic><Link to="/booking" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand shadow-xl transition active:scale-95">Book online <ArrowRight /></Link></Magnetic>
            <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/25 active:scale-95"><PhoneIcon width={18} height={18} />Call us</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
