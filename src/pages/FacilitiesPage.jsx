import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import { StatsBand, FacilitiesGrid } from '../components/Facilities'
import { PackageGrid } from '../components/Packages'
import CtaBand from '../components/CtaBand'
export default function FacilitiesPage() {
  return (
    <>
      <PageHero title="Facilities" text="Comfort, capacity and care — everything under one roof." image="hero-4.webp" />
      <section className="py-16 sm:py-24"><div className="container-x">
        <StatsBand />
        <div className="mt-12"><SectionHead eyebrow="What’s included" title="Built for celebrations" text="Every detail of the venue is designed to keep your guests comfortable." /></div>
        <div className="mt-12"><FacilitiesGrid /></div>
      </div></section>
      <CtaBand />
    </>
  )
}
