import { useCallback, useState } from 'react'
import { gallery, img } from '../data'
import { TiltCarousel } from '@/components/tilt-carousel'
import Lightbox from './Lightbox'

/* Gallery-style tilt carousel: the hall's best photos as looping 3D cards. Click the middle card to open it full-screen. */
const items = gallery.map((g) => ({ src: img(g.src), alt: g.alt, file: g.src }))
export default function GalleryCarousel() {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(null)
  const onActive = useCallback((k) => setActive(k), [])
  return (
    <div>
      <TiltCarousel items={items} cardWidth={200} tilt={30} perspective={1280} delay={2} onActive={onActive} onSelect={(_, i) => setOpen(i)} />
      <p className="mx-auto mt-2 min-h-[1.5rem] max-w-md px-4 text-center text-sm font-medium text-slate-600" aria-live="polite">{items[active]?.alt}</p>
      <Lightbox items={gallery} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </div>
  )
}
