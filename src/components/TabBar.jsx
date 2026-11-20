import { motion } from 'framer-motion'
import { HomeIcon, PieIcon, HistoryIcon, SearchIcon, UserIcon } from './Icons'

const TABS = [
  { key: 'home', label: 'Home', Icon: HomeIcon, href: '#home', match: ['home', 'facilities', 'gallery'] },
  { key: 'packages', label: 'Packages', Icon: PieIcon, href: '#packages', match: ['packages'] },
  { key: 'bookings', label: 'Bookings', Icon: HistoryIcon, action: true },
  { key: 'faq', label: 'FAQ', Icon: SearchIcon, href: '#faq', match: ['reviews', 'faq', 'contact'] },
  { key: 'book', label: 'Book', Icon: UserIcon, href: '#booking', match: ['booking'] },
]

export default function TabBar({ active, modalOpen, onMyBookings, count }) {
  return (
    <motion.nav aria-label="Primary" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.3 }}
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 lg:hidden" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
      <ul className="flex max-w-full items-center gap-1 rounded-full border border-white/70 bg-white/80 p-2 shadow-dock backdrop-blur-xl">
        {TABS.map(({ key, label, Icon, href, match, action }) => {
          const on = action ? modalOpen : !modalOpen && match.includes(active)
          const badge = action && count > 0 ? count : 0
          const cls = `relative flex h-11 items-center justify-center rounded-full ${on ? 'px-4 text-ink' : 'w-11 text-slate-400'}`
          const inner = (
            <>
              {on && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-slate-200/80" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <motion.span layout="position" className="relative flex items-center gap-2">
                <Icon />
                {on && <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} className="overflow-hidden whitespace-nowrap text-sm font-medium">{label}</motion.span>}
              </motion.span>
              {badge > 0 && !on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{badge}</motion.span>}
            </>
          )
          return (
            <li key={key}>
              {action ? <button type="button" aria-label={label} onClick={onMyBookings} className={cls}>{inner}</button>
                : <a href={href} aria-label={label} aria-current={on ? 'page' : undefined} className={cls}>{inner}</a>}
            </li>
          )
        })}
      </ul>
    </motion.nav>
  )
}
