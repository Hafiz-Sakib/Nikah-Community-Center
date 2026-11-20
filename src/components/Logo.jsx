import { Link } from 'react-router-dom'
import { img } from '../data'

/* In-site mark: the venue's own emblem (public/images/logo-mark.png).
   Drawn as a CSS mask so it takes the brand maroon in light mode and a soft rose in dark mode / on dark backgrounds. */
export function LogoMark({ size = 38, className = '', light = false }) {
  const url = `url(${img('logo-mark.png')})`
  return (
    <span role="img" aria-label="Nikah Community Center emblem" className={`logo-mark inline-block shrink-0 ${light ? 'logo-mark-light' : ''} ${className}`}
      style={{ width: size, height: size, WebkitMaskImage: url, maskImage: url }} />
  )
}

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5 whitespace-nowrap" aria-label="Nikah Community Center — home">
      <LogoMark light={light} size={40} className="transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-110" />
      <span className={`flex flex-col text-[13px] font-bold leading-[1.1] tracking-tight sm:flex-row sm:gap-1 sm:text-xl ${light ? 'text-white' : 'text-fg'}`}>
        <span className={light ? 'text-rose-200' : 'text-logo'}>Nikah</span><span className="lg:hidden xl:inline">Community Center</span><span className="hidden lg:inline xl:hidden">CC</span>
      </span>
    </Link>
  )
}
