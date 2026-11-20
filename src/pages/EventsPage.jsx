import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Events from '../components/Events'
import CtaBand from '../components/CtaBand'
export default function EventsPage() {
  return (
    <>
      <PageHero title="Events" text="Weddings, holud, receptions, milad and corporate gatherings." image="hero-2.webp" />
      <section className="py-16 sm:py-24"><div className="container-x">
        <SectionHead eyebrow="Pick your occasion" title="We host every kind of celebration" text="Tap an event to start a booking with the right package already selected." />
        <div className="mt-12"><Events /></div>
      </div></section>
      <CtaBand />
    </>
  )
}
