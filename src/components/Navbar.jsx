import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { nav } from '../data'
import { MenuIcon, CloseIcon, ArrowRight } from './Icons'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { InstallButton } from './Install'

export default function Navbar({ count }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12)
    f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f)
  }, [])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])

  return (
    <>
      <motion.header initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-300 ${scrolled || open ? 'bg-surface/85 shadow-sm backdrop-blur-xl' : 'bg-surface'}`}>
        <nav className="container-x flex h-16 items-center justify-between gap-3" aria-label="Main">
          <Logo />
          <ul className="hidden items-center gap-0.5 lg:flex">
            {nav.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => `relative block rounded-full whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-brand-ink' : 'text-slate-600 hover:text-fg'}`}>
                  {({ isActive }) => (<>{isActive && <motion.span layoutId="desk-pill" className="absolute inset-0 -z-10 rounded-full bg-brand-soft" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}{n.label}</>)}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:block" />
            <Link to="/my-bookings" className="hidden rounded-full whitespace-nowrap px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 2xl:block">My bookings{count > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{count}</span>}</Link>
            <Link to="/booking" className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">Book Now</Link>
            <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-fg transition active:scale-90 lg:hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={open ? 'x' : 'm'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>{open ? <CloseIcon /> : <MenuIcon />}</motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[55] bg-surface pt-20 lg:hidden" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}>
            <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }} className="container-x max-h-full space-y-1 overflow-y-auto pb-40">
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 sm:hidden"><span className="font-medium text-fg">Dark mode</span><ThemeToggle /></motion.li>
              {[...nav, { to: '/my-bookings', label: 'My bookings' }].map((n) => (
                <motion.li key={n.to} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                  <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => `flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium ${isActive ? 'bg-brand-soft text-brand-ink' : 'text-fg'}`}>{n.label}<ArrowRight className="opacity-40" /></NavLink>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="space-y-3 pt-4"><Link to="/booking" className="btn-primary w-full !py-4 text-base">Book your date</Link><InstallButton className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 py-3.5 text-sm font-semibold text-fg">Install app</InstallButton></motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
