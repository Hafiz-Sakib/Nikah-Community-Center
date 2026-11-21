import PageHero from '../components/PageHero'
import ContactInfo from '../components/ContactInfo'
import CtaBand from '../components/CtaBand'
import Reveal from '../components/Reveal'
import { CONTACT } from '../data'
import { MapPinIcon, ArrowRight } from '../components/Icons'

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact Us" text="Questions, site visits or special requests — we’re here to help, every day." image="hero-11.webp" />
      <ContactInfo />
      <section className="pb-16 sm:pb-24"><div className="container-x">
        <Reveal><a href={CONTACT.mapsUrl} target="_blank" rel="noreferrer" className="group flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-slate-50 p-7 ring-1 ring-slate-200/80 transition hover:shadow-dock sm:flex-row sm:items-center sm:p-9">
          <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"><MapPinIcon /></span><div><h2 className="text-lg font-semibold text-fg">Come and see the hall</h2><p className="mt-1 text-sm text-slate-500">{CONTACT.address}<br />{CONTACT.hours}</p></div></div>
          <span className="btn-primary">Get directions <ArrowRight /></span>
        </a></Reveal>
      </div></section>
      <CtaBand />
    </>
  )
}
