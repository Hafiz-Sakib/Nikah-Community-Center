import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { img } from '../data'
import { ICONS2, CheckIcon, ArrowRight } from './Icons'
import SectionHead from './SectionHead'

const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.07 } } }

/* ---------- 1. scrolling strip of amenities ---------- */
const AMENITIES = [['snow', 'Air-conditioned'], ['car', 'Parking for 80 cars'], ['bolt', 'Backup generator'], ['wifi', 'Free Wi-Fi'], ['camera', 'CCTV'], ['crown', 'Bridal rooms'], ['access', 'Step-free entry'], ['music', 'Sound & lights'], ['utensils', 'In-house kitchen'], ['moon', 'Prayer space'], ['shield', 'Security staff']]
export function AmenityStrip() {
  const row = [...AMENITIES, ...AMENITIES]
  return (
    <div className="group relative overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]" aria-label="Amenities">
      <div className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row.map(([ic, label], k) => {
          const Ico = ICONS2[ic]
          return <span key={k} aria-hidden={k >= AMENITIES.length} className="flex shrink-0 items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-medium text-fg ring-1 ring-slate-200/80"><Ico width={18} height={18} className="text-brand" />{label}</span>
        })}
      </div>
    </div>
  )
}

/* ---------- 2. interactive tour of the spaces ---------- */
const ZONES = [
  { id: 'hall', icon: 'users', title: 'Main hall', photo: 'hero-7.webp', pos: '50% 50%', text: 'A column-free, air-conditioned hall with every sightline open to the stage.', points: ['Round-table, theatre or buffet layouts', 'Up to 600 guests', 'Central cooling & backup power'] },
  { id: 'stage', icon: 'sparkles', title: 'Stage & décor', photo: 'hero-1.webp', pos: '50% 55%', text: 'Floral backdrops, themed seating and warm lighting set before your guests arrive.', points: ['Standard and premium stage designs', 'Entrance & aisle decoration', 'Lighting and LED wall (add-on)'] },
  { id: 'rooms', icon: 'crown', title: 'Bridal & green rooms', photo: 'g-bride-lamps.webp', pos: '50% 40%', text: 'Private, mirrored rooms so the couple and family can get ready in comfort.', points: ['Private AC rooms with mirrors', 'Close to the stage entrance', 'Bridal room available as an add-on'] },
  { id: 'entrance', icon: 'building', title: 'Entrance & lobby', photo: 'reception.webp', pos: '50% 38%', text: 'A welcoming, rose-framed entrance with room for greeting guests and photographs.', points: ['Step-free access & ramp', 'Guest reception area', 'Attendants on busy event days'] },
  { id: 'kitchen', icon: 'utensils', title: 'Kitchen & dining', photo: 'food-kacchi.webp', pos: '50% 50%', text: 'Our own chefs and serving staff cook and serve fresh, generous menus on the day.', points: ['Bengali wedding menus', 'Trained serving staff', 'Hygienic, separate kitchen'] },
]
export function SpaceTour() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const z = ZONES[i]
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="container-x">
        <SectionHead eyebrow="Venue tour" title="Walk through every space" text="Tap a space to see what it offers on your big day." />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div role="tablist" aria-label="Venue spaces" className="space-y-2">
            {ZONES.map((s, k) => {
              const on = k === i, Ico = ICONS2[s.icon]
              return (
                <button key={s.id} role="tab" aria-selected={on} onClick={() => setI(k)}
                  className={`relative block w-full overflow-hidden rounded-2xl p-4 text-left outline-none ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-brand ${on ? 'bg-surface shadow-dock ring-brand/30' : 'bg-surface/60 ring-slate-200/80 hover:bg-surface'}`}>
                  {on && <motion.span layoutId="tour-bar" className="absolute inset-y-3 left-0 w-1 rounded-full bg-brand" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${on ? 'bg-brand text-white' : 'bg-brand-soft text-brand'}`}><Ico width={20} height={20} /></span>
                    <span className="min-w-0 flex-1 font-semibold text-fg">{s.title}</span>
                    <span className="text-xs font-semibold tabular-nums text-slate-400">0{k + 1}</span>
                  </span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="block overflow-hidden">
                        <span className="mt-3 block text-sm leading-relaxed text-slate-600">{s.text}</span>
                        <span className="mt-3 flex flex-wrap gap-2">{s.points.map((pt) => <span key={pt} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-ink"><CheckIcon width={12} height={12} />{pt}</span>)}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )
            })}
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink shadow-card lg:aspect-auto lg:min-h-[460px]">
            <AnimatePresence initial={false}>
              <motion.img key={z.id} src={img(z.photo)} alt={z.title} draggable={false} style={{ objectPosition: z.pos }}
                initial={{ opacity: 0, scale: reduce ? 1 : 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover" />
            </AnimatePresence>
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            <AnimatePresence mode="wait">
              <motion.div key={z.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="absolute inset-x-5 bottom-5 text-white">
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">Space {i + 1} of {ZONES.length}</p>
                <p className="mt-1 text-2xl font-semibold">{z.title}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- 3. included with every booking ---------- */
const INCLUDED = ['Hall cleaned and set before your shift', 'Tables, chairs and standard seating', 'Air-conditioning and lighting', 'Backup generator on standby', 'Parking attendants on event days', 'Security guards at the entrance', 'Hall staff for on-the-day support', 'Clean washrooms, checked each shift', 'Free guest Wi-Fi', 'Power points for your vendors']
export function IncludedChecklist() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <span className="inline-block rounded-full bg-brand-soft px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-ink">Always included</span>
          <h2 className="section-title mt-3">The basics are already taken care of</h2>
          <p className="mt-3 max-w-md text-slate-500">Every booking comes with the essentials below, so your package price goes towards what makes your day special.</p>
          <Link to="/packages" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-95">See packages <ArrowRight /></Link>
        </div>
        <motion.ul initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid gap-3 sm:grid-cols-2">
          {INCLUDED.map((t) => (
            <motion.li key={t} variants={item} whileHover={{ y: -3 }} className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-slate-200/80 transition-shadow hover:shadow-card">
              <motion.span variants={{ hidden: { scale: 0.4, rotate: -40 }, show: { scale: 1, rotate: 0 } }} transition={{ type: 'spring', stiffness: 400, damping: 16 }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckIcon width={14} height={14} /></motion.span>
              <span className="min-w-0 text-sm font-medium leading-snug text-fg">{t}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

/* ---------- 4. safety & access ---------- */
const SAFE = [
  { icon: 'shield', title: 'Security you can see', text: 'Guards at the entrance and parking attendants, so guests feel looked after.', stat: 'Guards', label: 'entrance & parking' },
  { icon: 'camera', title: 'CCTV monitoring', text: 'Cameras watch the entrance, lobby and parking throughout your event.', stat: 'CCTV', label: 'entrance, lobby & parking' },
  { icon: 'bolt', title: 'Power that never drops', text: 'A backup generator keeps the lights, sound and cooling running.', stat: 'Backup', label: 'generator on standby' },
  { icon: 'access', title: 'Easy for everyone', text: 'A step-free entrance and ramp for elders, prams and wheelchair users.', stat: 'Ramp', label: 'at the main door' },
]
export function SafetyAccess() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <SectionHead eyebrow="Safe & comfortable" title="Peace of mind for you and your guests" text="Your family should enjoy the day, not worry about it." />
        <motion.ul initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SAFE.map((s) => {
            const Ico = ICONS2[s.icon]
            return (
              <motion.li key={s.title} variants={item} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="group relative overflow-hidden rounded-3xl bg-surface p-6 ring-1 ring-slate-200/80 transition-shadow hover:shadow-dock">
                <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-brand/20" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"><Ico /></span>
                <h3 className="relative mt-4 font-semibold text-fg">{s.title}</h3>
                <p className="relative mt-1 text-sm leading-relaxed text-slate-500">{s.text}</p>
                <p className="relative mt-4 border-t border-slate-200/80 pt-3"><span className="text-xl font-bold text-brand-ink">{s.stat}</span> <span className="text-xs text-slate-500">{s.label}</span></p>
              </motion.li>
            )
          })}
        </motion.ul>
      </div>
    </section>
  )
}
