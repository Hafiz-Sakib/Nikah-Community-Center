import { img, PAYMENT } from '../data'
import { BuildingIcon } from './Icons'
import { BrandLogo } from './gateway/marks'

/* Payment method mark on a white tile, so the real logos stay readable in day and night mode.
   Fixed box + object-contain: every logo (wide wordmark or square emblem) is centred and never stretched. */
const SIZE = { sm: 'h-8 w-[3.25rem] rounded-lg', md: 'h-11 w-[4.5rem] rounded-xl', lg: 'h-14 w-[5.75rem] rounded-2xl sm:h-16 sm:w-28' }
const BOX = 'grid shrink-0 place-items-center bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.06)]'

export default function PayLogo({ id, size = 'md', className = '' }) {
  const m = PAYMENT.find((x) => x.id === id)
  const cls = `${BOX} ${SIZE[size]} ${className}`
  if (m?.logo) return <span className={cls}><img src={img(m.logo.src)} width={m.logo.w} height={m.logo.h} alt={m.label} loading="lazy" decoding="async" draggable={false} className="h-auto max-h-[66%] w-auto max-w-[78%] select-none object-contain" /></span>
  if (id === 'card') return <span className={`${cls} gap-0.5 text-slate-700`}><svg viewBox="0 0 24 24" className={size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-label="Card"><rect x="2.5" y="5" width="19" height="14" rx="3" /><path d="M2.5 10h19M6.5 15h4" /></svg></span>
  return <span className={`${cls} text-slate-700`}><BuildingIcon className={size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} aria-label="Office" /></span>
}
export { BrandLogo }
