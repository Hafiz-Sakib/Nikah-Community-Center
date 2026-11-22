import { motion } from 'motion/react'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Ceremony from '../components/Ceremony'
import ContactInfo from '../components/ContactInfo'
import { HelpTopics, VisitInfo } from '../components/ContactExtras'
import Reviews from '../components/Reviews'
import Faq from '../components/Faq'
import CtaBand from '../components/CtaBand'
import Reveal from '../components/Reveal'
import { CONTACT, values } from '../data'
import { ICONS2, MapPinIcon, ArrowRight } from '../components/Icons'

/* One page for "About us" + "Contact". Sections that were on the old About page but are not about us / contact
   moved to their own pages: StatsBand stays on Facilities, "How it works" is on Packages, "Our work" photos are on Gallery. */
export default function Connect() {
  return (
    <>
      <PageHero title="Connect" text="Who we are, what you can expect, and the quickest ways to reach us — every day." image="hero-10.webp" />
      <ContactInfo />
      <Ceremony />
      <section className="bg-slate-50 py-16 sm:py-24"><div className="container-x">
        <SectionHead eyebrow="Our promise" title="What you can expect from us" />
        <motion.ul initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={{ show: { transition: { staggerChildren: 0.09 } } }} className="mt-12 grid gap-4 sm:grid-cols-2">
          {values.map((v) => { const Ico = ICONS2[v.icon]; return (
            <motion.li key={v.title} variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }} className="flex gap-4 rounded-3xl bg-surface p-6 ring-1 ring-slate-200/80">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Ico /></span>
              <div><h3 className="font-semibold text-fg">{v.title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-500">{v.text}</p></div>
            </motion.li>) })}
        </motion.ul>
      </div></section>
      <VisitInfo />
      <HelpTopics />
      <section className="py-14 sm:py-20"><div className="container-x">
        <Reveal><a href={CONTACT.mapsUrl} target="_blank" rel="noreferrer" className="group flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-slate-50 p-7 ring-1 ring-slate-200/80 transition hover:shadow-dock sm:flex-row sm:items-center sm:p-9">
          <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"><MapPinIcon /></span><div><h2 className="text-lg font-semibold text-fg">Come and see the hall</h2><p className="mt-1 text-sm text-slate-500">{CONTACT.address}<br />{CONTACT.hours}</p></div></div>
          <span className="btn-primary">Get directions <ArrowRight /></span>
        </a></Reveal>
      </div></section>
      <Reviews />
      <Faq />
      <CtaBand />
    </>
  )
}
