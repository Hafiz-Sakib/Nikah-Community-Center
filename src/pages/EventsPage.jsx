import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Events from '../components/Events'
import { EventSteps, EventPackageMatch } from '../components/PageSections'
import CtaBand from '../components/CtaBand'
import PhotoStrip from '../components/PhotoStrip'
import { StatsBand, FacilitiesGrid } from '../components/Facilities'
import { AmenityStrip, SpaceTour, IncludedChecklist, SafetyAccess } from '../components/FacilityExtras'
import { ShiftTimings, SeatingLayouts } from '../components/PageSections'
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
      <EventPackageMatch /><EventSteps />
      {/* the venue / facilities content, moved here from the old Facilities page */}
      <section className="py-16 sm:py-24"><div className="container-x">
        <SectionHead eyebrow="The venue" title="Built for celebrations" text="Comfort, capacity and care: everything under one roof. Every detail of the hall is designed to keep your guests comfortable." />
        <div className="mt-12"><StatsBand /></div>
        <div className="mt-8"><AmenityStrip /></div>
        <div className="mt-12"><FacilitiesGrid /></div>
      </div></section>
      <SpaceTour />
      <IncludedChecklist />
      <PhotoStrip bg eyebrow="Inside the hall" title="Your event, in our space" text="Stage, lighting and seating, set up for real celebrations."
        items={[{ id: 'p076', cap: 'Holud entrance' }, { id: 'p078', cap: 'Decorated aisle' }, { id: 'p060', cap: 'Bridal walk' }, { id: 'p059', cap: 'Family welcome' }]} />
      <SafetyAccess /><ShiftTimings /><SeatingLayouts /><CtaBand />
    </>
  )
}
