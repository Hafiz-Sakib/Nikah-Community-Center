import { useEffect } from 'react'
import { motion } from 'motion/react'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Ceremony from '../components/Ceremony'
import { StatsBand } from '../components/Facilities'
import Reviews from '../components/Reviews'
import CtaBand from '../components/CtaBand'
import ContactInfo from '../components/ContactInfo'
import Faq from '../components/Faq'
import { process, values } from '../data'
import { ICONS2 } from '../components/Icons'

const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function About({ scrollTo }) {
  useEffect(() => {
    if (!scrollTo) return
    const t = setTimeout(() => jump(scrollTo), 500)
    return () => clearTimeout(t)
  }, [scrollTo])
  return (
    <>
      <PageHero title="About & Contact" text="A warm, well-run community center built around your celebrations — and the easiest way to reach us." image="hero-3.webp" />
      <div className="container-x -mb-6 mt-8 flex justify-center gap-2">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="rounded-full bg-brand-soft px-5 py-2 text-sm font-medium text-brand-ink transition active:scale-95">About us</button>
        <button onClick={() => jump('contact')} className="rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 active:scale-95">Contact us</button>
      </div>
      <Ceremony />
      <section className="pb-16 sm:pb-24"><div className="container-x"><StatsBand /></div></section>
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
      <section className="py-16 sm:py-24"><div className="container-x">
        <SectionHead eyebrow="How it works" title="From enquiry to celebration" text="Five simple steps — most bookings take under two minutes online." />
        <ol className="relative mx-auto mt-14 max-w-2xl space-y-8 before:absolute before:left-6 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200">
          {process.map((s, i) => { const Ico = ICONS2[s.icon]; return (
            <motion.li key={s.title} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: 0.05 }} className="relative flex gap-5">
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-glow"><Ico /></span>
              <div className="pt-1"><p className="text-xs font-semibold uppercase tracking-wider text-brand">Step {i + 1}</p><h3 className="font-semibold text-fg">{s.title}</h3><p className="mt-1 text-sm text-slate-500">{s.text}</p></div>
            </motion.li>) })}
        </ol>
      </div></section>
      <Reviews />
      <section id="contact" className="scroll-mt-20 pt-16 sm:pt-24"><div className="container-x"><SectionHead eyebrow="Contact" title="Get in touch" text="Questions, site visits or special requests — we’re here to help." /></div></section>
      <ContactInfo />
      <Faq />
      <CtaBand />
    </>
  )
}
