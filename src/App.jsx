import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { TabBar } from '@/components/tab-bar'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toaster from './components/Toaster'
import MyBookings from './components/MyBookings'
import Admin from './components/Admin'
import Home from './pages/Home'
import About from './pages/About'
import FacilitiesPage from './pages/FacilitiesPage'
import EventsPage from './pages/EventsPage'
import GalleryPage from './pages/GalleryPage'
import PackagesPage from './pages/PackagesPage'
import BookingPage from './pages/BookingPage'
import ContactPage from './pages/ContactPage'
import NotFound from './pages/NotFound'
import { useBookings } from './lib/store'

const pathOf = { home: '/', explore: '/events', packages: '/packages', 'my-bookings': '/my-bookings', booking: '/booking' }
const tabFor = (p) => {
  if (p === '/') return 'home'
  if (['/events', '/facilities', '/gallery', '/about'].includes(p)) return 'explore'
  if (p === '/packages') return 'packages'
  if (p === '/my-bookings') return 'my-bookings'
  if (p === '/booking') return 'booking'
  return ''
}

function Page({ children }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>{children}</motion.div>
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const bookings = useBookings()
  const count = bookings.filter((b) => b.status !== 'cancelled').length
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'explore', label: 'Explore', icon: 'search' },
    { id: 'packages', label: 'Packages', icon: 'chart' },
    { id: 'my-bookings', label: 'Bookings', icon: 'history', badge: count },
    { id: 'booking', label: 'Book', icon: 'profile' },
  ]

  return (
    <>
      <Navbar count={count} />
      <AnimatePresence mode="wait" initial={false}>
        <main key={location.pathname}>
          <Page>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/facilities" element={<FacilitiesPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Page>
        </main>
      </AnimatePresence>
      <Footer />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 lg:hidden" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <TabBar className="pointer-events-auto" tabs={tabs} value={tabFor(location.pathname)} onChange={(id) => navigate(pathOf[id])} />
      </div>
      <Toaster />
    </>
  )
}
