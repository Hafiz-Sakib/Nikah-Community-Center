import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import { StatsBand, FacilitiesGrid } from '../components/Facilities'
import { PackageGrid } from '../components/Packages'
import { ShiftTimings, SeatingLayouts } from '../components/PageSections'
import CtaBand from '../components/CtaBand'
import PhotoStrip from '../components/PhotoStrip'
export default function FacilitiesPage() {
  return (
    <>
      <PageHero title="Facilities" text="Comfort, capacity and care — everything under one roof." image="hero-7.webp" />
      <section className="py-16 sm:py-24"><div className="container-x">
        <StatsBand />
        <div className="mt-12"><SectionHead eyebrow="What’s included" title="Built for celebrations" text="Every detail of the venue is designed to keep your guests comfortable." /></div>
        <div className="mt-12"><FacilitiesGrid /></div>
      </div></section>
      <PhotoStrip eyebrow="Inside the hall" title="Your event, in our space" text="Stage, lighting and seating, set up for real celebrations."
        items={[{ id: 'p076', cap: 'Holud entrance' }, { id: 'p078', cap: 'Decorated aisle' }, { id: 'p060', cap: 'Bridal walk' }, { id: 'p059', cap: 'Family welcome' }]} />
      <ShiftTimings /><SeatingLayouts /><CtaBand />
    </>
  )
}
