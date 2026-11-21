import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { slides, img } from '../data'
import { ChevronLeft, ChevronRight, ArrowRight } from './Icons'
import { Magnetic } from './ui'

const N = slides.length
const pad = (n) => String(n + 1).padStart(2, '0')
const ease = [0.76, 0, 0.24, 1]

export default function Hero() {
  const [[i, dir], setPage] = useState([0, 1])
  const [paused, setPaused] = useState(false)
  const go = useCallback((d) => setPage(([p]) => [(p + d + N) % N, d]), [])
  const jump = (n) => setPage(([p]) => [n, n > p ? 1 : -1])
  const s = slides[i]
  const next = slides[(i + 1) % N]

  return (
    <section className="pt-16" data-paused={paused} aria-roledescription="carousel" aria-label="Venue highlights"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[76svh] min-h-[520px] w-full overflow-hidden bg-ink md:h-[640px]">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div key={i} custom={dir} className="absolute inset-0"
            variants={{
              enter: (d) => ({ clipPath: d > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', zIndex: 2 }),
              center: { clipPath: 'inset(0 0 0 0)', zIndex: 2 },
              exit: { zIndex: 1, scale: 1.06, opacity: 0.55 },
            }}
            initial="enter" animate="center" exit="exit" transition={{ duration: 1.05, ease }}>
            <motion.img src={img(s.image)} alt="" draggable={false} className="h-full w-full object-cover" style={{ objectPosition: s.pos }}
              initial={{ scale: 1.3, x: dir * 80 }} animate={{ scale: 1.02, x: 0 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent ${s.side === 'right' ? 'md:bg-gradient-to-l' : 'md:bg-gradient-to-r'} md:from-black/80 md:via-black/45 md:to-black/10`} />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} className="absolute inset-0 z-[5] cursor-grab touch-pan-y active:cursor-grabbing"
          onDragEnd={(_, { offset, velocity }) => { if (offset.x < -70 || velocity.x < -450) go(1); else if (offset.x > 70 || velocity.x > 450) go(-1) }} />

        <div className="pointer-events-none absolute inset-0 z-10 flex items-end md:items-center">
          <div className="container-x w-full pb-36 md:pb-20">
            <AnimatePresence mode="wait">
              <motion.div key={i} className={`max-w-2xl text-white ${s.side === 'right' ? 'md:ml-auto md:max-w-xl' : ''}`} initial="hidden" animate="show" exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } } }}>
                <motion.span variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium uppercase tracking-widest backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />{s.eyebrow}
                </motion.span>
                <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.1] tracking-tight sm:mt-5 sm:text-5xl md:text-6xl" aria-label={s.title}>
                  {s.title.split(' ').map((w, k) => (
                    <span key={k} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
                      <motion.span className="inline-block" variants={{ hidden: { y: '110%' }, show: { y: 0 } }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>{w}</motion.span>
                    </span>
                  ))}
                </h1>
                <motion.p variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="mt-5 hidden max-w-lg text-sm leading-relaxed text-white/80 sm:block sm:text-base">{s.text}</motion.p>
                <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="pointer-events-auto mt-5 flex flex-wrap gap-3 sm:mt-7">
                  <Magnetic><Link to="/booking" className="btn-primary">Book now <ArrowRight /></Link></Magnetic>
                  <Link to="/packages" className="inline-flex items-center rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95">View packages</Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* controls */}
        <div className="absolute inset-x-0 bottom-[4.5rem] z-10 md:bottom-20">
          <div className="container-x flex items-end justify-between gap-6">
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-baseline gap-1 font-medium tabular-nums">
                <span className="relative inline-block h-7 w-8 overflow-hidden text-2xl">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span key={i} initial={{ y: dir * 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: dir * -28, opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">{pad(i)}</motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-sm text-white/50">/ {pad(N - 1)}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5" role="tablist" aria-label="Slides">
                {slides.map((_, n) => (
                  <button key={n} role="tab" aria-selected={n === i} aria-label={`Slide ${n + 1}`} onClick={() => jump(n)} className="group flex h-6 items-center">
                    <span className={`relative block h-[3px] overflow-hidden rounded-full bg-white/30 transition-all duration-500 ${n === i ? 'w-9 md:w-12' : 'w-2.5 md:w-[18px]'}`}>
                      {n === i ? <span key={i} className="hero-progress absolute inset-0 rounded-full bg-white" onAnimationEnd={() => go(1)} /> : n < i ? <span className="absolute inset-0 bg-white/80" /> : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <button onClick={() => go(1)} aria-label={`Next: ${next.title}`} className="group hidden items-center gap-3 rounded-2xl bg-white/10 p-1.5 pr-4 text-left text-white backdrop-blur-md transition hover:bg-white/20 lg:flex">
                <img src={img(next.image)} alt="" className="h-12 w-16 rounded-xl object-cover" style={{ objectPosition: next.pos }} />
                <span className="max-w-[9rem]"><span className="block text-[10px] uppercase tracking-widest text-white/60">Next</span><span className="line-clamp-1 text-sm font-medium">{next.eyebrow}</span></span>
              </button>
              {[[-1, ChevronLeft, 'Previous slide'], [1, ChevronRight, 'Next slide']].map(([d, Ico, label]) => (
                <button key={label} onClick={() => go(d)} aria-label={label} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white hover:text-ink active:scale-90"><Ico /></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
