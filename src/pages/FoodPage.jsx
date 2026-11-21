import { foodPkgs } from '../data'
import { money } from '../lib/store'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import FoodMenu from '../components/Food'
import { CateringFlow, SignatureDishes } from '../components/PageSections'
import CtaBand from '../components/CtaBand'
export default function FoodPage() {
  return (
    <>
      <PageHero title="Food" text="Traditional Bengali wedding menus, served fresh by our in-house kitchen." image="hero-4.webp" />
      <section className="py-16 sm:py-24"><div className="container-wide">
        <SectionHead eyebrow="Menu" title="Bengali wedding food" text="Pick a package to see exactly what is served, or browse every dish by category. Each dish shows its variation per package." />
        <div className="mt-12"><FoodMenu /></div>
        <p className="mt-8 text-center text-[13px] text-slate-600">Hall catering is priced per guest ({foodPkgs.map((p) => `${p.short} ${money(p.price)}`).join(' · ')}). Choose it in the booking form, or bring your own caterer.</p>
      </div></section>
      <SignatureDishes /><CateringFlow /><CtaBand />
    </>
  )
}
