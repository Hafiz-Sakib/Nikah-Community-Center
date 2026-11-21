import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { moments, img } from '../data'
import { ChevronLeft, ChevronRight } from './Icons'
import SectionHead from './SectionHead'

/* Looping photo cards: the middle one faces you, the rest turn away in 3D (motion-brew “Tilt carousel”) */
const N = moments.length
const wrap = (d) => { let x = ((d % N) + N) % N; if (x > N / 2) x -= N; return x }

export default function Moments() {
  const reduce = useReducedMotion()
  const [i, setI] = useState(2)
  const [paused, setPaused] = useState(false)
  const [w, setW] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 210 : 280))
  useEffect(() => { const f = () => setW(window.innerWidth < 640 ? 210 : 280); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, [])
  const go = useCallback((d) => setI((n) => (n + d + N) % N), [])
  useEffect(() => { if (paused || reduce) return; const t = setInterval(() => go(1), 3800); return () => clearInterval(t) }, [paused, reduce, go])
  const h = Math.round(w * 1.33)

  return (
    <section className="overflow-hidden bg-slate-50 py-16 sm:py-24" aria-roledescription="carousel" aria-label="Wedding moments">
      <div className="container-x"><SectionHead eyebrow="Moments" title="Stories told in our gardens and halls" text="Swipe through a few frames from couples who celebrated with us." /></div>
      <div className="relative mx-auto mt-12 select-none" style={{ height: h + 40, perspective: 1300 }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1} className="absolute inset-0 z-[5] cursor-grab touch-pan-y active:cursor-grabbing"
          onDragEnd={(_, { offset, velocity }) => { if (offset.x < -50 || velocity.x < -400) go(1); else if (offset.x > 50 || velocity.x > 400) go(-1) }} />
        {moments.map((m, k) => {
          const d = wrap(k - i), a = Math.abs(d)
          const vis = a <= 3
          return (
            <motion.figure key={m.src} aria-hidden={d !== 0} initial={false}
              animate={{ x: d * w * 0.62, rotateY: -d * 32, scale: 1 - a * 0.1, opacity: vis ? 1 - a * 0.18 : 0, zIndex: 10 - a }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 24 }}
              className="absolute left-1/2 top-5 overflow-hidden rounded-3xl bg-ink shadow-dock" style={{ width: w, height: h, marginLeft: -w / 2, pointerEvents: 'none', transformStyle: 'preserve-3d' }}>
              <img src={img(m.src)} alt={m.alt} loading="lazy" draggable={false} className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-sm font-medium text-white">{m.tag}</figcaption>
              {d !== 0 && <span aria-hidden className="absolute inset-0 bg-black/25" />}
            </motion.figure>
          )
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-5">
        <button onClick={() => go(-1)} aria-label="Previous photo" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg shadow-dock transition active:scale-90"><ChevronLeft /></button>
        <div className="flex gap-1.5" role="tablist" aria-label="Photos">
          {moments.map((_, n) => <button key={n} role="tab" aria-selected={n === i} aria-label={`Photo ${n + 1}`} onClick={() => setI(n)} className={`h-2 rounded-full transition-all ${n === i ? 'w-6 bg-brand' : 'w-2 bg-slate-300'}`} />)}
        </div>
        <button onClick={() => go(1)} aria-label="Next photo" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg shadow-dock transition active:scale-90"><ChevronRight /></button>
      </div>
    </section>
  )
}
