import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Route, Routes, useLocation } from 'react-router-dom'
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
import FoodPage from './pages/FoodPage'
import NotFound from './pages/NotFound'
import { InstallBanner } from './components/Install'
import { useBookings, toast } from './lib/store'

function Page({ children }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>{children}</motion.div>
}

export default function App() {
  const location = useLocation()
  const bookings = useBookings()
  const count = bookings.filter((b) => b.status !== 'cancelled').length
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  useEffect(() => {
    const off = () => toast('You’re offline — saved pages still work', 'error'), on = () => toast('Back online')
    window.addEventListener('offline', off); window.addEventListener('online', on)
    return () => { window.removeEventListener('offline', off); window.removeEventListener('online', on) }
  }, [])

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
              <Route path="/contact" element={<About scrollTo="contact" />} />
              <Route path="/food" element={<FoodPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Page>
        </main>
      </AnimatePresence>
      <Footer />
      <InstallBanner />
      <Toaster />
    </>
  )
}
