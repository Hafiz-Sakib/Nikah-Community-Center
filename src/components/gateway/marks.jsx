/* Card network marks. Small tile (form) and large (on the metal card). Adapted from Motion Brew "Payment form" and "Metal card stack". */
const font = 'ui-sans-serif, system-ui, -apple-system, Helvetica, Arial, sans-serif'
const tile = 'block h-6 w-9 overflow-hidden rounded-[6px] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.08)]'

export function BrandLogo({ brand }) {
  if (brand === 'Mastercard') return (
    <svg viewBox="0 0 36 24" className={tile} role="img" aria-label="Mastercard"><rect width="36" height="24" fill="#fff" /><circle cx="14.5" cy="12" r="6.5" fill="#eb001b" /><circle cx="21.5" cy="12" r="6.5" fill="#f79e1b" /><path d="M18 6.52a6.5 6.5 0 0 1 0 10.96 6.5 6.5 0 0 1 0-10.96Z" fill="#ff5f00" /></svg>
  )
  if (brand === 'Amex') return (
    <svg viewBox="0 0 36 24" className={tile} role="img" aria-label="American Express"><rect width="36" height="24" fill="#016fd0" /><text x="18" y="15.5" textAnchor="middle" fill="#fff" fontFamily={font} fontSize="8.5" fontWeight="800" letterSpacing="0.3">AMEX</text></svg>
  )
  if (brand === 'Discover') return (
    <svg viewBox="0 0 36 24" className={tile} role="img" aria-label="Discover"><rect width="36" height="24" fill="#fff" /><path d="M20 24 36 16v8Z" fill="#f48120" opacity="0.9" /><text x="3" y="13.9" fill="#231f20" fontFamily={font} fontSize="5.2" fontWeight="800">DISC</text><circle cx="18.4" cy="12.1" r="2.1" fill="#f48120" /><text x="20.9" y="13.9" fill="#231f20" fontFamily={font} fontSize="5.2" fontWeight="800">VER</text></svg>
  )
  return (
    <svg viewBox="0 0 36 24" className={tile} role="img" aria-label="Visa"><rect width="36" height="24" fill="#fff" /><text x="18" y="16" textAnchor="middle" fill="#1a1f71" fontFamily={font} fontSize="11" fontStyle="italic" fontWeight="900" letterSpacing="-0.2">VISA</text></svg>
  )
}

export function Network({ brand, ink }) {
  if (brand === 'Mastercard') return (
    <svg viewBox="0 0 52 32" className="h-8 w-[52px]" role="img" aria-label="Mastercard"><circle cx="19" cy="16" r="13" fill="#eb001b" /><circle cx="33" cy="16" r="13" fill="#f79e1b" /><path d="M26 5.1a13 13 0 0 1 0 21.8 13 13 0 0 1 0-21.8Z" fill="#ff5f00" /></svg>
  )
  if (brand === 'Amex') return (
    <svg viewBox="0 0 60 36" className="h-9 w-[60px]" role="img" aria-label="American Express"><rect width="60" height="36" rx="4" fill="#016fd0" /><text x="30" y="16" textAnchor="middle" fill="#fff" fontFamily={font} fontSize="9.5" fontWeight="900" letterSpacing="0.4">AMERICAN</text><text x="30" y="27" textAnchor="middle" fill="#fff" fontFamily={font} fontSize="9.5" fontWeight="900" letterSpacing="0.4">EXPRESS</text></svg>
  )
  if (brand === 'Discover') return (
    <svg viewBox="0 0 84 20" className="h-5 w-[84px]" role="img" aria-label="Discover"><text x="0" y="15" fill={ink} fontFamily={font} fontSize="14" fontWeight="800" letterSpacing="0.2">DISC</text><circle cx="42.5" cy="10" r="6" fill="#f48120" /><text x="49" y="15" fill={ink} fontFamily={font} fontSize="14" fontWeight="800" letterSpacing="0.2">VER</text></svg>
  )
  if (brand === 'Visa') return (
    <svg viewBox="0 0 64 22" className="h-[22px] w-16" role="img" aria-label="Visa"><text x="32" y="19" textAnchor="middle" fill={ink} fontFamily={font} fontSize="22" fontStyle="italic" fontWeight="900" letterSpacing="-0.5">VISA</text></svg>
  )
  return null
}
