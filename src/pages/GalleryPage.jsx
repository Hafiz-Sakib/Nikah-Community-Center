import PageHero from '../components/PageHero'
import GalleryAll from '../components/GalleryAll'
import { OccasionStrip, KitchenPeek } from '../components/PageSections'
import CtaBand from '../components/CtaBand'
export default function GalleryPage() {
  return (<><PageHero title="Gallery" text="Moments from weddings, celebrations and gatherings." image="hero-5.webp" /><GalleryAll /><OccasionStrip /><KitchenPeek /><CtaBand /></>)
}
