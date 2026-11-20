import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { slides, img } from '../data'
import { ChevronLeft, ChevronRight, ArrowRight } from './Icons'

export default function Hero({ onBook }) {
  const [[i, dir], setPage] = useState([0, 1])
  const [paused, setPaused] = useState(false)
  const go = useCallback((d) => setPage(([p]) => [(p + d + slides.length) % slides.length, d]), [])
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => go(1), 5500)
    return () => clearInterval(t)
  }, [go, paused, i])
  const s = slides[i]

  return (
    <section id="home" className="pt-16" aria-roledescription="carousel" aria-label="Venue highlights">
      <div className="relative h-[64svh] min-h-[430px] w-full overflow-hidden bg-ink sm:h-[70vh] md:h-[560px]"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={i} custom={dir}
            variants={{ enter: (d) => ({ x: d > 0 ? '100%' : '-100%' }), center: { x: 0 }, exit: (d) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0.4 }) }}
            initial="enter" animate="center" exit="exit"
            transition={{ type: 'spring', stiffness: 220, damping: 30 }}
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => { if (offset.x < -60 || velocity.x < -400) go(1); else if (offset.x > 60 || velocity.x > 400) go(-1) }}
            className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          >
            <motion.img src={img(s.image)} alt="" draggable={false}
              initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: 'easeOut' }}
              className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 pb-20 text-center sm:px-16">
          <AnimatePresence mode="wait">
            <motion.div key={i} className="max-w-2xl text-white"
              initial="hidden" animate="show" exit="out"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } }, out: { opacity: 0, transition: { duration: 0.15 } } }}>
              <motion.h1 variants={{ hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">{s.title}</motion.h1>
              <motion.p variants={{ hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1 } }} className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">{s.text}</motion.p>
              {s.cta && (
                <motion.a variants={{ hidden: { y: 24, opacity: 0 }, show: { y: 0, opacity: 1 } }} href="#booking" onClick={onBook}
                  className="btn-primary pointer-events-auto mt-6">Book Now <ArrowRight /></motion.a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {[[-1, 'left-3 sm:left-6', ChevronLeft, 'Previous slide'], [1, 'right-3 sm:right-6', ChevronRight, 'Next slide']].map(([d, pos, Ico, label]) => (
          <button key={label} onClick={() => go(d)} aria-label={label}
            className={`absolute top-1/2 ${pos} hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-90 sm:flex`}>
            <Ico />
          </button>
        ))}

        <div className="absolute inset-x-0 bottom-20 flex justify-center gap-2">
          {slides.map((_, n) => (
            <button key={n} onClick={() => setPage([n, n > i ? 1 : -1])} aria-label={`Slide ${n + 1}`} aria-current={n === i}
              className="relative h-1.5 overflow-hidden rounded-full bg-white/35 transition-all" style={{ width: n === i ? 40 : 20 }}>
              {n === i && <motion.span key={`${i}-${paused}`} className="absolute inset-0 origin-left rounded-full bg-white"
                initial={{ scaleX: 0 }} animate={{ scaleX: paused ? 1 : 1 }} transition={{ duration: paused ? 0 : 5.5, ease: 'linear' }} />}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
