import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { nav } from '../data'
import { MenuIcon, CloseIcon, ArrowRight, ClipboardIcon, ICONS2, HomeIcon, PhoneIcon, ShieldIcon } from './Icons'
import { useAuth } from '../context/AuthContext'
import { useMyBookings, isActive } from '../lib/bookings'
import Avatar from './Avatar'
import UserMenu from './UserMenu'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { InstallIconButton } from './Install'

const NAV_ICONS = { ...ICONS2, home: HomeIcon, phone: PhoneIcon }
const isOn = (to, pathname, isActive) => isActive

/* Desktop: every page is a direct link (no dropdown). The bar runs edge to edge and the links spread evenly across the free space
   between the logo and the buttons, so the row fills the whole width on one line. Mobile menu lists everything. */
const linkCls = (on) => `relative flex items-center gap-1 rounded-full whitespace-nowrap px-3.5 py-2 text-sm font-medium transition-colors xl:px-5 xl:py-2.5 ${on ? 'text-brand-ink' : 'text-slate-600 hover:text-fg'}`
const pill = <motion.span layoutId="desk-pill" className="absolute inset-0 -z-10 rounded-full bg-surface shadow-sm ring-1 ring-slate-200/70" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { bookings } = useMyBookings()
  const count = bookings.filter(isActive).length
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
        <nav className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8 xl:px-12 2xl:px-16" aria-label="Main">
          <Logo />
          <div className="hidden min-w-0 flex-1 justify-center lg:flex"><ul className="flex items-center gap-0.5 rounded-full bg-slate-100/80 p-1 ring-1 ring-slate-200/70 xl:gap-1">
            {nav.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => linkCls(isActive)}>
                  {({ isActive }) => (<>{isActive && pill}{n.label}</>)}
                </NavLink>
              </li>
            ))}
          </ul></div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <InstallIconButton />
            {user && (
              <Link to="/my-bookings" aria-label="My bookings" className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full lg:hidden">
                <Avatar user={user} size={34} />
                {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">{count}</span>}
              </Link>
            )}
            {user ? <UserMenu /> : <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-fg ring-1 ring-slate-300 transition hover:bg-slate-100 lg:inline-flex">Log in</Link>}
            <Link to="/booking" className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">Book Now</Link>
            <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-fg transition active:scale-90 lg:hidden">
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
            <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }} className="container-x max-h-full space-y-1 overflow-y-auto pb-24">
              {user && (
                <motion.li variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                  <Avatar user={user} size={44} /><div className="min-w-0"><p className="truncate font-semibold text-fg">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                </motion.li>
              )}
              {[...nav, ...(user ? [{ to: '/my-bookings', label: 'My bookings', icon: 'clipboard', hint: count ? `${count} active` : 'View, edit or cancel a booking' }] : []), ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: 'shield', hint: 'Manage all bookings' }] : [])].map((n) => {
                const Ico = NAV_ICONS[n.icon]
                return (
                  <motion.li key={n.to} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                    <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => `flex items-center gap-4 rounded-2xl px-3 py-3 ${isOn(n.to, pathname, isActive) ? 'bg-brand-soft text-brand-ink' : 'text-fg'}`}>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-brand-ink"><Ico width={22} height={22} /></span>
                      <span className="min-w-0 flex-1"><span className="block text-base font-semibold leading-tight">{n.label}</span><span className="block truncate text-xs text-slate-600">{n.hint}</span></span>
                      <ArrowRight className="shrink-0 opacity-40" />
                    </NavLink>
                  </motion.li>
                )
              })}
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="space-y-3 pt-4"><Link to="/booking" className="btn-primary w-full !py-4 text-base">Book your date</Link>
                {user ? <button type="button" onClick={() => { setOpen(false); signOut() }} className="w-full rounded-full bg-slate-100 py-3.5 text-base font-semibold text-red-600">Log out</button>
                  : <Link to="/login" className="flex w-full items-center justify-center rounded-full bg-slate-100 py-3.5 text-base font-semibold text-fg">Log in / Sign up</Link>}
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
