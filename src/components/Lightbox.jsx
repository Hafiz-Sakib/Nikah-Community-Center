import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { img } from '../data'
import { ChevronLeft, ChevronRight, CloseIcon } from './Icons'

/* Full-screen photo viewer: arrows / swipe / Esc. `items` need { src, alt }. */
export default function Lightbox({ items, index, onIndex, onClose }) {
  const n = items.length
  const open = index !== null && index !== undefined
  useEffect(() => {
    if (!open) return
    const k = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % n)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + n) % n)
    }
    document.addEventListener('keydown', k)
    return () => document.removeEventListener('keydown', k)
  }, [open, index, n, onIndex, onClose])
  return (
    <AnimatePresence>
      {open && items[index] && (
        <motion.div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <AnimatePresence mode="wait">
            <motion.img key={items[index].src} src={img(items[index].src)} alt={items[index].alt} onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, { offset }) => { if (offset.x < -80) onIndex((index + 1) % n); else if (offset.x > 80) onIndex((index - 1 + n) % n) }}
              className="max-h-[82svh] max-w-full rounded-2xl object-contain" />
          </AnimatePresence>
          <span className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">{index + 1} / {n}</span>
          <button aria-label="Close" onClick={onClose} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"><CloseIcon /></button>
          {[[-1, 'left-3', ChevronLeft], [1, 'right-3', ChevronRight]].map(([d, p, Ico]) => (
            <button key={d} aria-label={d < 0 ? 'Previous' : 'Next'} onClick={(e) => { e.stopPropagation(); onIndex((index + d + n) % n) }} className={`absolute ${p} top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur sm:flex`}><Ico /></button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
