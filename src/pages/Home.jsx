import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import AvailabilityBar from '../components/AvailabilityBar'
import Marquee from '../components/Marquee'
import Ceremony from '../components/Ceremony'
import SectionHead from '../components/SectionHead'
import { StatsBand, FacilitiesGrid } from '../components/Facilities'
import Events from '../components/Events'
import FoodMenu from '../components/Food'
import { PackageGrid } from '../components/Packages'
import Gallery from '../components/Gallery'
import Reviews from '../components/Reviews'
import CtaBand from '../components/CtaBand'
import { ArrowRight } from '../components/Icons'

const More = ({ to, children }) => <div className="mt-10 text-center"><Link to={to} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-fg transition hover:bg-brand hover:text-white active:scale-95">{children}<ArrowRight /></Link></div>

export default function Home() {
  return (
    <>
      <Hero />
      <AvailabilityBar />
      <div className="mt-16"><Marquee /></div>
      <Ceremony />
      <section className="pb-16 sm:pb-24"><div className="container-x">
        <SectionHead eyebrow="Facilities" title="Everything your event needs" text="A complete venue, so you can focus on the people who matter." />
        <div className="mt-12"><StatsBand /></div>
        <div className="mt-5"><FacilitiesGrid limit={6} /></div>
        <More to="/facilities">All facilities</More>
      </div></section>
      <section className="bg-slate-50 py-16 sm:py-24"><div className="container-x">
        <SectionHead eyebrow="Events" title="Celebrate every occasion" text="From intimate milad to grand receptions — pick an event and we’ll set the stage." />
        <div className="mt-12"><Events limit={3} /></div>
        <More to="/events">Explore all events</More>
      </div></section>
      <section className="py-16 sm:py-24"><div className="container-wide">
        <SectionHead eyebrow="Food" title="A taste of Bengali weddings" text="Polao, rezala, mezbani beef, mishti doi and more — the menu changes with your package." />
        <div className="mt-12"><FoodMenu limit={8} /></div>
        <More to="/food">See the full menu</More>
      </div></section>
      <section className="py-16 sm:py-24"><div className="container-wide">
        <SectionHead eyebrow="Packages" title="Simple, honest pricing" text="Choose a package, add extras, and see the full price before you confirm." />
        <PackageGrid />
        <More to="/packages">Compare packages</More>
      </div></section>
      <Gallery />
      <Reviews />
      <CtaBand />
    </>
  )
}
