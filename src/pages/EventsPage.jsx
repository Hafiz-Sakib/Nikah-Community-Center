import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Events from '../components/Events'
import { EventSteps, EventPackageMatch } from '../components/PageSections'
import CtaBand from '../components/CtaBand'
import PhotoStrip from '../components/PhotoStrip'
export default function EventsPage() {
  return (
    <>
      <PageHero title="Events" text="Weddings, holud, receptions, milad and corporate gatherings." image="hero-12.webp" />
      <section className="py-16 sm:py-24"><div className="container-x">
        <SectionHead eyebrow="Pick your occasion" title="We host every kind of celebration" text="Tap an event to start a booking with the right package already selected." />
        <div className="mt-12"><Events /></div>
      </div></section>
      <PhotoStrip eyebrow="Seen at our venue" title="Moments from every occasion" text="From grand entrances to candle-lit nikah evenings." bg
        items={[{ id: 'p022', cap: 'Grand entrance' }, { id: 'p020', cap: 'Night arrival' }, { id: 'p085', cap: 'Candle-lit nikah' }, { id: 'p063', cap: 'Holud morning' }]} />
      <EventPackageMatch /><EventSteps /><CtaBand />
    </>
  )
}
