import { Link } from 'react-router-dom'
import { img } from '../data'
import SectionHead from './SectionHead'

/* Slow, endless ribbon of portraits (pauses on hover, static when reduced motion is on). ids: files in public/images/gallery */
export default function PhotoMarquee({ ids, eyebrow, title, text }) {
  const row = [...ids, ...ids]
  return (
    <section className="overflow-hidden py-16 sm:py-24">
      <div className="container-x"><SectionHead eyebrow={eyebrow} title={title} text={text} /></div>
      <div className="mt-12 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max gap-3 pr-3 [animation-duration:70s] animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:overflow-x-auto">
          {row.map((id, i) => (
            <Link key={`${id}-${i}`} to="/gallery" tabIndex={i >= ids.length ? -1 : 0} aria-hidden={i >= ids.length} aria-label="Open the gallery"
              className="group relative block h-72 w-52 shrink-0 overflow-hidden rounded-3xl bg-ink sm:h-96 sm:w-72">
              <img src={img(`gallery/${id}-t.webp`)} alt="" loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
