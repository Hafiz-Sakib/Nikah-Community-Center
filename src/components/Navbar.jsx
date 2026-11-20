import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'packages', label: 'Packages' },
  { id: 'booking', label: 'Book' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar({ active, onMyBookings, count }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <motion.header initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 shadow-sm backdrop-blur-xl' : 'bg-white'}`}>
      <nav className="container-x flex h-16 items-center justify-between gap-3" aria-label="Main">
        <a href="#home" className="text-lg font-bold tracking-tight text-ink sm:text-xl"><span className="text-brand">Nikah </span>Community Center</a>
        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className={`relative block rounded-full px-3 py-2 text-sm font-medium transition-colors ${active === n.id ? 'text-brand-dark' : 'text-slate-600 hover:text-ink'}`}>
                {active === n.id && <motion.span layoutId="desk-pill" className="absolute inset-0 -z-10 rounded-full bg-brand-soft" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button onClick={onMyBookings} className="relative hidden rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 lg:block">
            My bookings{count > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{count}</span>}
          </button>
          <a href="#booking" className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">Book Now</a>
        </div>
      </nav>
    </motion.header>
  )
}
