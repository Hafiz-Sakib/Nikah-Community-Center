import PageHero from '../components/PageHero'
import GalleryAll from '../components/GalleryAll'
import { OccasionStrip, KitchenPeek } from '../components/PageSections'
import CtaBand from '../components/CtaBand'
import PhotoStrip from '../components/PhotoStrip'
export default function GalleryPage() {
  return (<><PageHero title="Gallery" text="Moments from weddings, celebrations and gatherings." image="hero-5.webp" /><GalleryAll />
    <PhotoStrip eyebrow="Our work" title="Celebrations we are proud of" text="A few of the families and couples who chose us for their big day." bg
      items={[{ id: 'p032', cap: 'Wedding day' }, { id: 'p047', cap: 'Bengali bride' }, { id: 'p010', cap: 'Nikah with family' }, { id: 'p061', cap: 'Garlands and smiles' }]} />
    <OccasionStrip /><KitchenPeek /><CtaBand /></>)
}
