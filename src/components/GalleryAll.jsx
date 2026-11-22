import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { galleryPhotos, GALLERY_CATS } from '../galleryPhotos'
import { img } from '../data'
import Lightbox from './Lightbox'
import SectionHead from './SectionHead'
import GalleryCarousel from './GalleryCarousel'

const STEP = 24

/* Full photo gallery: category filter, masonry grid, "show more", lightbox. */
export default function GalleryAll() {
  const [cat, setCat] = useState('all')
  const [shown, setShown] = useState(STEP)
  const [open, setOpen] = useState(null)
  const list = useMemo(() => (cat === 'all' ? galleryPhotos : galleryPhotos.filter((p) => p.cat === cat)), [cat])
  const counts = useMemo(() => Object.fromEntries(GALLERY_CATS.map((c) => [c.id, c.id === 'all' ? galleryPhotos.length : galleryPhotos.filter((p) => p.cat === c.id).length])), [])
  const visible = list.slice(0, shown)
  const pick = (id) => { setCat(id); setShown(STEP); setOpen(null) }

  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="container-wide">
        <SectionHead eyebrow="Gallery" title="Moments we have hosted" text={`${galleryPhotos.length} photos from weddings, holud, receptions and celebrations at our venue.`} />
        <div className="-mx-4 mt-8 sm:-mx-6"><GalleryCarousel /></div>
        <div className="-mx-4 mt-10 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Photo categories">
          <div className="mx-auto flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
            {GALLERY_CATS.map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => pick(c.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${cat === c.id ? 'bg-brand text-white shadow-glow' : 'bg-surface text-slate-600 ring-1 ring-slate-200/80 hover:text-fg'}`}>
                {c.label} <span className={cat === c.id ? 'text-white/70' : 'text-slate-400'}>{counts[c.id]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 columns-2 gap-3 md:columns-3 lg:columns-4">
          {visible.map((p, n) => (
            <motion.button key={p.src} type="button" onClick={() => setOpen(n)} aria-label={`Open photo ${n + 1}: ${p.alt}`}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.45, delay: (n % 4) * 0.05 }}
              className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-slate-200" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
              <img src={img(p.thumb)} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>

        {shown < list.length && (
          <div className="mt-10 text-center">
            <button onClick={() => setShown((s) => s + STEP)} className="inline-flex items-center gap-2 rounded-full bg-surface px-7 py-3 text-sm font-semibold text-fg ring-1 ring-slate-200/80 transition hover:bg-brand hover:text-white active:scale-95">
              Show more photos <span className="text-slate-400">({list.length - shown} left)</span>
            </button>
          </div>
        )}
      </div>
      <Lightbox items={list.slice(0, shown)} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </section>
  )
}
