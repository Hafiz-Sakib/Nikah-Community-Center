import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gallery, img } from '../data'
import { ChevronLeft, ChevronRight, CloseIcon } from './Icons'
import SectionHead from './SectionHead'

export default function Gallery() {
  const [i, setI] = useState(null)
  useEffect(() => {
    if (i === null) return
    const k = (e) => { if (e.key === 'Escape') setI(null); if (e.key === 'ArrowRight') setI((x) => (x + 1) % gallery.length); if (e.key === 'ArrowLeft') setI((x) => (x - 1 + gallery.length) % gallery.length) }
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k)
  }, [i])
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="container-x">
        <SectionHead eyebrow="Gallery" title="Moments we have hosted" text="A glimpse of weddings, celebrations and gatherings at our venue." />
        <div className="mt-12 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] md:grid-cols-4">
          {gallery.map((g, n) => (
            <motion.button key={g.src} type="button" onClick={() => setI(n)} aria-label={`Open: ${g.alt}`}
              initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: n * 0.06 }}
              className={`group relative overflow-hidden rounded-3xl ${g.span} ${n === 0 ? 'col-span-2 row-span-2' : ''}`}>
              <img src={img(g.src)} alt={g.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition group-hover:opacity-100" />
              <span className="absolute bottom-3 left-4 right-4 text-left text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">{g.alt}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {i !== null && (
          <motion.div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setI(null)}>
            <AnimatePresence mode="wait">
              <motion.img key={i} src={img(gallery[i].src)} alt={gallery[i].alt} onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, { offset }) => { if (offset.x < -80) setI((i + 1) % gallery.length); else if (offset.x > 80) setI((i - 1 + gallery.length) % gallery.length) }}
                className="max-h-[82svh] max-w-full rounded-2xl object-contain" />
            </AnimatePresence>
            <button aria-label="Close" onClick={() => setI(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"><CloseIcon /></button>
            {[[-1, 'left-3', ChevronLeft], [1, 'right-3', ChevronRight]].map(([d, p, Ico]) => (
              <button key={d} aria-label={d < 0 ? 'Previous' : 'Next'} onClick={(e) => { e.stopPropagation(); setI((i + d + gallery.length) % gallery.length) }} className={`absolute ${p} top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur sm:flex`}><Ico /></button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
