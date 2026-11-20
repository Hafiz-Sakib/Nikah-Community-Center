import { useCallback, useEffect, useState } from 'react'
import Navbar, { NAV } from './components/Navbar'
import TabBar from './components/TabBar'
import Hero from './components/Hero'
import AvailabilityBar from './components/AvailabilityBar'
import Marquee from './components/Marquee'
import Ceremony from './components/Ceremony'
import Facilities from './components/Facilities'
import Gallery from './components/Gallery'
import Packages from './components/Packages'
import Booking from './components/Booking'
import Reviews from './components/Reviews'
import Faq from './components/Faq'
import Contact from './components/Contact'
import Footer from './components/Footer'
import MyBookings from './components/MyBookings'
import Admin from './components/Admin'
import Toaster from './components/Toaster'
import useActiveSection from './components/useActiveSection'
import { useBookings } from './lib/store'

const IDS = NAV.map((n) => n.id)

export default function App() {
  const active = useActiveSection(IDS)
  const bookings = useBookings()
  const [modal, setModal] = useState(null)
  const [prefill, setPrefill] = useState(null)
  const count = bookings.filter((b) => b.status !== 'cancelled').length

  useEffect(() => {
    const h = () => { if (location.hash === '#admin') setModal('admin') }
    h(); window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h)
  }, [])
  const close = useCallback(() => { setModal(null); if (location.hash === '#admin') history.replaceState(null, '', location.pathname + location.search) }, [])
  const check = (p) => { setPrefill({ ...p, n: Date.now() }); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }) }
  const toBooking = () => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <Navbar active={active} count={count} onMyBookings={() => setModal('mine')} />
      <main>
        <Hero />
        <AvailabilityBar onCheck={check} />
        <div className="mt-16"><Marquee /></div>
        <Ceremony />
        <Facilities />
        <Gallery />
        <Packages onChoose={(id) => setPrefill({ data: { packageId: id }, n: Date.now() })} />
        <Booking prefill={prefill} onManage={() => setModal('mine')} />
        <Reviews />
        <Faq />
        <Contact />
      </main>
      <Footer onAdmin={() => setModal('admin')} />
      <TabBar active={active} modalOpen={modal === 'mine'} count={count} onMyBookings={() => setModal('mine')} />
      <MyBookings open={modal === 'mine'} onClose={close} onBook={toBooking} />
      <Admin open={modal === 'admin'} onClose={close} />
      <Toaster />
    </>
  )
}
