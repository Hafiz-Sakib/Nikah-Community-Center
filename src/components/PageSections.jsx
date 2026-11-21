import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { events, process, foodPkgs, foodItems, packages, img } from '../data'
import { money } from '../lib/store'
import { ICONS2, ArrowRight, CheckIcon } from './Icons'
import SectionHead from './SectionHead'

const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }
const card = 'rounded-3xl bg-surface p-6 ring-1 ring-slate-200/80'
const Wrap = ({ children, bg, wide }) => (
  <section className={`${bg ? 'bg-slate-50' : ''} py-16 sm:py-24`}><div className={wide ? 'container-wide' : 'container-x'}>{children}</div></section>
)
const List = ({ className, children }) => (
  <motion.ul initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className={className}>{children}</motion.ul>
)

/* ---------- Facilities ---------- */
const shifts = [
  { icon: 'sparkles', title: 'Morning shift', time: '10:00 AM – 3:00 PM', text: 'Ideal for holud, milad, aqiqah and daytime seminars.' },
  { icon: 'moon', title: 'Evening shift', time: '5:00 PM – 10:30 PM', text: 'Our most popular slot for weddings and receptions.' },
  { icon: 'calendar', title: 'Full day', time: 'Both shifts', text: 'Book both shifts at a combined rate for the whole day.' },
]
export function ShiftTimings() {
  return (
    <Wrap bg>
      <SectionHead eyebrow="Shifts" title="Pick the time that suits you" text="Three simple slots, with live availability while you book." />
      <List className="mt-12 grid gap-4 md:grid-cols-3">
        {shifts.map((s) => { const Ico = ICONS2[s.icon]; return (
          <motion.li key={s.title} variants={item} className={card}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Ico /></span>
            <h3 className="mt-4 font-semibold text-fg">{s.title}</h3>
            <p className="mt-1 text-lg font-bold text-brand-ink">{s.time}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.text}</p>
          </motion.li>) })}
      </List>
    </Wrap>
  )
}

const layouts = [
  { icon: 'users', title: 'Round-table banquet', text: 'Family-style tables, the classic choice for weddings and receptions.' },
  { icon: 'mic', title: 'Theatre style', text: 'Rows facing the stage, best for seminars, launches and ceremonies.' },
  { icon: 'utensils', title: 'Buffet & stations', text: 'Open floor with food counters, ideal for corporate dinners and parties.' },
]
export function SeatingLayouts() {
  return (
    <Wrap>
      <SectionHead eyebrow="Layouts" title="One hall, many arrangements" text="Our column-free hall is set up your way before every shift." />
      <List className="mt-12 grid gap-4 md:grid-cols-3">
        {layouts.map((s) => { const Ico = ICONS2[s.icon]; return (
          <motion.li key={s.title} variants={item} className={`${card} text-center`}>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Ico /></span>
            <h3 className="mt-4 font-semibold text-fg">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.text}</p>
          </motion.li>) })}
      </List>
    </Wrap>
  )
}

/* ---------- Events ---------- */
export function EventSteps() {
  return (
    <Wrap>
      <SectionHead eyebrow="How it works" title="From enquiry to celebration" text="Five easy steps, whatever the occasion." />
      <List className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {process.map((s, i) => { const Ico = ICONS2[s.icon]; return (
          <motion.li key={s.title} variants={item} className={card}>
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Ico /></span>
              <span className="text-2xl font-bold text-slate-300">{i + 1}</span>
            </div>
            <h3 className="mt-4 font-semibold text-fg">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.text}</p>
          </motion.li>) })}
      </List>
    </Wrap>
  )
}

export function EventPackageMatch() {
  return (
    <Wrap bg>
      <SectionHead eyebrow="Best fit" title="Which package suits your event?" text="Our suggested starting point for each occasion. You can change it while booking." />
      <List className="mt-12 grid gap-3 md:grid-cols-2">
        {events.map((e) => { const p = packages.find((x) => x.id === e.pkg); return (
          <motion.li key={e.slug} variants={item}>
            <Link to={`/booking?event=${e.slug}&package=${e.pkg}`} className="group flex items-center gap-4 rounded-3xl bg-surface p-3 pr-5 ring-1 ring-slate-200/80 transition hover:shadow-dock">
              <img src={img(e.image)} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">{e.title}</p>
                <p className="text-sm text-slate-500">{e.guests}</p>
                <p className="mt-0.5 text-sm font-semibold text-brand-ink">{p.name} · from {money(p.price)}</p>
              </div>
              <span className="text-brand transition group-hover:translate-x-1"><ArrowRight /></span>
            </Link>
          </motion.li>) })}
      </List>
    </Wrap>
  )
}

/* ---------- Gallery ---------- */
export function OccasionStrip() {
  return (
    <Wrap>
      <SectionHead eyebrow="By occasion" title="Every kind of celebration" text="See what we host, then book the one that fits you." />
      <List className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {events.map((e) => (
          <motion.li key={e.slug} variants={item}>
            <Link to="/events" className="group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-ink">
              <img src={img(e.image)} alt={e.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white">{e.title}</span>
            </Link>
          </motion.li>
        ))}
      </List>
    </Wrap>
  )
}

const kitchen = ['kacchi', 'rezala', 'roast', 'mishti-doi']
export function KitchenPeek() {
  const list = kitchen.map((id) => foodItems.find((f) => f.id === id)).filter(Boolean)
  return (
    <Wrap bg>
      <SectionHead eyebrow="From our kitchen" title="The food your guests will remember" text="A taste of the Bengali wedding menu cooked by our in-house team." />
      <List className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        {list.map((f) => (
          <motion.li key={f.id} variants={item} className="group overflow-hidden rounded-3xl bg-surface ring-1 ring-slate-200/80">
            <div className="aspect-[4/3] overflow-hidden"><img src={img(`food-${f.id}.webp`)} alt={f.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /></div>
            <div className="p-4"><p className="font-semibold text-fg">{f.name}</p><p className="text-sm text-slate-600">{f.bn}</p></div>
          </motion.li>
        ))}
      </List>
      <div className="mt-8 text-center"><Link to="/food" className="inline-flex items-center gap-2 font-semibold text-brand-ink">See the full menu <ArrowRight /></Link></div>
    </Wrap>
  )
}

/* ---------- Packages ---------- */
export function CateringPrices() {
  return (
    <Wrap bg>
      <SectionHead eyebrow="Hall catering" title="Food priced per guest" text="Add our in-house kitchen to any booking, or bring your own caterer." />
      <List className="mt-12 grid gap-4 md:grid-cols-3">
        {foodPkgs.map((p) => (
          <motion.li key={p.id} variants={item} className={card}>
            <p className="font-semibold text-fg">{p.name}</p>
            <p className="mt-1 text-sm text-slate-500">{p.text}</p>
            <p className="mt-4 text-2xl font-bold text-brand-ink">{money(p.price)}<span className="text-xs font-normal text-slate-400"> / guest</span></p>
            <Link to="/food" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-ink">See the menu <ArrowRight /></Link>
          </motion.li>
        ))}
      </List>
    </Wrap>
  )
}

const terms = [
  ['30% advance', 'Secures your date. The balance is due before the event.'],
  ['Weekend surcharge', 'Fridays and Saturdays carry a 15% surcharge.'],
  ['Full day rate', 'Book both shifts together at a combined rate.'],
  ['Free cancellation', 'Full advance refund if you cancel 14 or more days before the event.'],
]
export function BookingTerms() {
  return (
    <Wrap>
      <SectionHead eyebrow="Good to know" title="Booking & payment terms" text="Everything is shown clearly before you confirm." />
      <List className="mt-12 grid gap-3 sm:grid-cols-2">
        {terms.map(([t, d]) => (
          <motion.li key={t} variants={item} className="flex items-start gap-4 rounded-3xl bg-surface p-5 ring-1 ring-slate-200/80">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"><CheckIcon width={16} height={16} /></span>
            <div><p className="font-semibold text-fg">{t}</p><p className="mt-1 text-sm text-slate-500">{d}</p></div>
          </motion.li>
        ))}
      </List>
    </Wrap>
  )
}

/* ---------- Food ---------- */
const flow = [
  { icon: 'clipboard', title: 'Choose hall catering', text: 'Select it in the booking form, or keep your own caterer.' },
  { icon: 'utensils', title: 'Pick a food package', text: 'Basic, Plus or Corporate, each with its own set of dishes.' },
  { icon: 'users', title: 'Tell us your guest count', text: 'Pricing is per guest and shown in your booking summary.' },
  { icon: 'sparkles', title: 'We cook and serve', text: 'Fresh from our in-house kitchen, served by trained staff.' },
]
export function CateringFlow() {
  return (
    <Wrap>
      <SectionHead eyebrow="How it works" title="Hall catering in four steps" />
      <List className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {flow.map((s, i) => { const Ico = ICONS2[s.icon]; return (
          <motion.li key={s.title} variants={item} className={card}>
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Ico /></span>
              <span className="text-2xl font-bold text-slate-300">{i + 1}</span>
            </div>
            <h3 className="mt-4 font-semibold text-fg">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.text}</p>
          </motion.li>) })}
      </List>
    </Wrap>
  )
}

const sig = ['kacchi', 'morog-polao', 'rezala', 'roast', 'ilish', 'zorda']
export function SignatureDishes() {
  const list = sig.map((id) => foodItems.find((f) => f.id === id)).filter(Boolean)
  return (
    <Wrap bg>
      <SectionHead eyebrow="Signature dishes" title="Guest favourites" text="The dishes most requested for Bengali weddings." />
      <List className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
        {list.map((f) => (
          <motion.li key={f.id} variants={item} className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink">
            <img src={img(`food-${f.id}.webp`)} alt={f.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <span className="absolute inset-x-4 bottom-3 text-white"><span className="block font-semibold">{f.name}</span><span className="text-sm text-white/75">{f.bn}</span></span>
          </motion.li>
        ))}
      </List>
    </Wrap>
  )
}
