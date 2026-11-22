import { Link } from 'react-router-dom'
import { ArrowRight } from './Icons'
import SectionHead from './SectionHead'
import GalleryCarousel from './GalleryCarousel'

export default function Gallery() {
  return (
    <section className="overflow-hidden bg-slate-50 py-16 sm:py-24">
      <div className="container-x">
        <SectionHead eyebrow="Gallery" title="Moments we have hosted" text="A glimpse of weddings, celebrations and gatherings at our venue. Drag, flick or click a card." />
      </div>
      <div className="mt-10"><GalleryCarousel /></div>
      <div className="mt-8 text-center"><Link to="/gallery" className="inline-flex items-center gap-2 rounded-full bg-surface px-6 py-3 text-sm font-semibold text-fg ring-1 ring-slate-200/80 transition hover:bg-brand hover:text-white active:scale-95">View all photos <ArrowRight /></Link></div>
    </section>
  )
}
