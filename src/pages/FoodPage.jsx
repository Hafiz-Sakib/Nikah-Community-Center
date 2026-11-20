import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import FoodMenu from '../components/Food'
import CtaBand from '../components/CtaBand'
export default function FoodPage() {
  return (
    <>
      <PageHero title="Food" text="Traditional Bengali wedding menus, served fresh by our in-house kitchen." image="hero-4.webp" />
      <section className="py-16 sm:py-24"><div className="container-wide">
        <SectionHead eyebrow="Menu" title="Bengali wedding food" text="Pick a package to see exactly what is served, or browse every dish by category. Each dish shows its variation per package." />
        <div className="mt-12"><FoodMenu /></div>
        <p className="mt-8 text-center text-[13px] text-slate-600">Menus can be customised. Extra catering is available as an add-on (৳650 per guest) while booking.</p>
      </div></section>
      <CtaBand />
    </>
  )
}
