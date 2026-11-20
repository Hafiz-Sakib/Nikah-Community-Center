import { Link } from 'react-router-dom'
/* In-site mark: same artwork as the app icon (arch + rings + sparkle) */
export function LogoMark({ size = 34, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a9bff" /><stop offset="1" stopColor="#1e4fd0" /></linearGradient>
        <radialGradient id="lh" cx=".25" cy=".1" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#lg)" /><rect width="512" height="512" rx="112" fill="url(#lh)" />
      <path d="M136 408V262Q136 150 256 80Q376 150 376 262V408" fill="none" stroke="#fff" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="224" cy="312" r="46" fill="none" stroke="#fff" strokeWidth="17" /><circle cx="288" cy="312" r="46" fill="none" stroke="#fff" strokeOpacity=".88" strokeWidth="17" />
      <path d="M256 150l9 24 24 9-24 9-9 24-9-24-24-9 24-9z" fill="#fff" />
    </svg>
  )
}
export default function Logo({ light = false }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5 whitespace-nowrap" aria-label="Nikah Community Center — home">
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110" />
      <span className={`flex flex-col text-[13px] font-bold leading-[1.1] tracking-tight sm:flex-row sm:gap-1 sm:text-xl ${light ? 'text-white' : 'text-fg'}`}>
        <span className="text-brand">Nikah</span><span className="lg:hidden xl:inline">Community Center</span><span className="hidden lg:inline xl:hidden">CC</span>
      </span>
    </Link>
  )
}
