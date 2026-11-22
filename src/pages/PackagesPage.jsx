import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import { PackageGrid, CompareTable } from '../components/Packages'
import Faq from '../components/Faq'
import { CateringPrices, BookingTerms } from '../components/PageSections'
import CtaBand from '../components/CtaBand'
import PhotoStrip from '../components/PhotoStrip'
import { motion } from 'motion/react'
import { addons, process } from '../data'
import { ICONS2 } from '../components/Icons'
import { money } from '../lib/store'

export default function PackagesPage() {
  return (
    <>
      <PageHero title="Packages" text="Transparent pricing for every kind of event." image="hero-8.webp" />
      <section className="py-16 sm:py-24"><div className="container-wide"><PackageGrid /></div></section>
      <section className="bg-slate-50 py-16 sm:py-24"><div className="container-wide">
        <SectionHead eyebrow="Compare" title="Find the right fit" />
        <div className="mt-12"><CompareTable /></div>
      </div></section>
      <section className="py-16 sm:py-24"><div className="container-x">
        <SectionHead eyebrow="Add-ons" title="Make it yours" text="Add any of these while booking." />
        <motion.ul initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.07 } } }} className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {addons.map((a) => (
            <motion.li key={a.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="rounded-3xl bg-surface p-5 ring-1 ring-slate-200/80">
              <p className="font-semibold text-fg">{a.label}</p><p className="mt-1 text-sm text-slate-500">{a.hint}</p>
              <p className="mt-3 text-lg font-bold text-brand-ink">{money(a.price)}<span className="text-xs font-normal text-slate-400">{a.perGuest ? ' / guest' : ''}</span></p>
            </motion.li>
          ))}
        </motion.ul>
      </div></section>
      <section className="bg-slate-50 py-16 sm:py-24"><div className="container-x">
        <SectionHead eyebrow="How it works" title="From enquiry to celebration" text="Five simple steps — most bookings take under two minutes online." />
        <ol className="relative mx-auto mt-14 max-w-2xl space-y-8 before:absolute before:left-6 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200">
          {process.map((s, i) => { const Ico = ICONS2[s.icon]; return (
            <motion.li key={s.title} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: 0.05 }} className="relative flex gap-5">
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-glow"><Ico /></span>
              <div className="pt-1"><p className="text-xs font-semibold uppercase tracking-wider text-brand">Step {i + 1}</p><h3 className="font-semibold text-fg">{s.title}</h3><p className="mt-1 text-sm text-slate-500">{s.text}</p></div>
            </motion.li>) })}
        </ol>
      </div></section>
      <PhotoStrip eyebrow="What it looks like" title="Décor you can expect" text="Floral stages, warm lighting and a setting worth the photographs."
        items={[{ id: 'p033', cap: 'Floral stage' }, { id: 'p039', cap: 'Stage and seating' }, { id: 'p053', cap: 'Bridal backdrop' }]} />
      <CateringPrices /><BookingTerms /><Faq />
      <CtaBand />
    </>
  )
}
