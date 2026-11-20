import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { events, img } from '../data'
import { ICONS2, ArrowRight } from './Icons'

export default function Events({ limit }) {
  const list = limit ? events.slice(0, limit) : events
  return (
    <motion.ul initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ show: { transition: { staggerChildren: 0.09 } } }} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((e) => {
        const Ico = ICONS2[e.icon]
        return (
          <motion.li key={e.slug} variants={{ hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } }}>
            <Link to={`/booking?event=${e.slug}&package=${e.pkg}`} className="group relative block h-[380px] overflow-hidden rounded-[2rem] bg-ink shadow-sm">
              <img src={img(e.image)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <span className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md"><Ico /></span>
              <span className="absolute right-5 top-5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">{e.guests}</span>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="text-xl font-semibold">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75 transition-all duration-500 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:opacity-100">{e.text}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Book this event <span className="transition group-hover:translate-x-1"><ArrowRight /></span></span>
              </div>
            </Link>
          </motion.li>
        )
      })}
    </motion.ul>
  )
}
