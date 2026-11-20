import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { img } from '../data'

export default function PageHero({ title, text, image = 'hero-1.webp' }) {
  return (
    <section className="pt-16">
      <div className="relative h-[270px] overflow-hidden bg-ink sm:h-[340px]">
        <motion.img src={img(image)} alt="" initial={{ scale: 1.2 }} animate={{ scale: 1.02 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        <div className="container-x relative flex h-full flex-col justify-end pb-10 text-white sm:pb-14">
          <motion.nav initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-white/70">
            <Link to="/" className="hover:text-white">Home</Link><span>/</span><span className="text-white">{title}</span>
          </motion.nav>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }} className="text-3xl font-semibold tracking-tight sm:text-5xl">{title}</motion.h1>
          {text && <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">{text}</motion.p>}
        </div>
      </div>
    </section>
  )
}
