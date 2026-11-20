import { Link } from 'react-router-dom'
import { img, nav, CONTACT } from '../data'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { InstallButton } from './Install'
export default function Footer() {
  return (
    <footer className="bg-ink pb-10 pt-14 text-white">
      <div className="container-x grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">A clean, elegant and budget-friendly venue for weddings, receptions, milad and corporate events in Chattogram.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3"><Link to="/booking" className="btn-primary">Book your date</Link><InstallButton className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95" /></div>
        </div>
        <div><h3 className="mb-3 text-sm font-semibold">Explore</h3><ul className="space-y-2 text-sm text-white/60">{nav.map((n) => <li key={n.to}><Link to={n.to} className="transition hover:text-white">{n.label}</Link></li>)}</ul></div>
        <div><h3 className="mb-3 text-sm font-semibold">Contact</h3><ul className="space-y-2 text-sm text-white/60"><li>{CONTACT.phone}</li><li className="break-all">{CONTACT.email}</li><li>{CONTACT.address}</li><li>{CONTACT.hours}</li></ul></div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Get the app</h3>
          <div className="flex flex-wrap gap-3 sm:flex-col">
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer"><img src={img('appstore.png')} alt="Download on the App Store" className="h-10 w-auto transition hover:scale-105" /></a>
            <a href="https://play.google.com/store" target="_blank" rel="noreferrer"><img src={img('playstore.png')} alt="Get it on Google Play" className="h-10 w-auto transition hover:scale-105" /></a>
          </div>
        </div>
      </div>
      <div className="container-x mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50">
        <p>© 2020 Nikah Community Center. All rights reserved by <a className="text-brand hover:underline" href="https://www.facebook.com/Sakib1056" target="_blank" rel="noreferrer">Mohammad Hafizur Rahman Sakib</a></p>
        <div className="flex items-center gap-4"><ThemeToggle /><Link to="/my-bookings" className="hover:text-white">My bookings</Link><Link to="/admin" className="hover:text-white">Staff login</Link></div>
      </div>
    </footer>
  )
}
