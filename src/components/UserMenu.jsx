import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMyBookings, isActive } from '../lib/bookings'
import Avatar from './Avatar'
import { ChevronDown, ClipboardIcon, ShieldIcon } from './Icons'

/* Desktop navbar: avatar + first name, dropdown with My bookings / Admin / Log out. */
export default function UserMenu() {
  const { user, isAdmin, signOut } = useAuth()
  const { bookings } = useMyBookings()
  const count = bookings.filter(isActive).length
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const out = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', out); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', esc) }
  }, [open])
  const item = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-fg transition-colors hover:bg-slate-100'
  return (
    <div ref={ref} className="relative hidden lg:block">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="relative flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-slate-100">
        <Avatar user={user} size={34} />
        <span className="max-w-[7rem] truncate text-sm font-medium text-fg">{user.name.split(' ')[0]}</span>
        <ChevronDown width={14} height={14} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">{count}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full z-10 w-64 pt-2">
            <div className="rounded-2xl bg-surface p-2 shadow-dock ring-1 ring-fg/5">
              <div className="flex items-center gap-3 px-3 py-2.5"><Avatar user={user} size={40} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-fg">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div></div>
              <div className="my-1 border-t border-slate-100" />
              <Link to="/my-bookings" role="menuitem" onClick={() => setOpen(false)} className={item}><ClipboardIcon width={18} height={18} className="text-brand-ink" />My bookings{count > 0 && <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{count}</span>}</Link>
              {isAdmin && <Link to="/admin" role="menuitem" onClick={() => setOpen(false)} className={item}><ShieldIcon width={18} height={18} className="text-brand-ink" />Admin</Link>}
              <button type="button" role="menuitem" onClick={() => { setOpen(false); signOut() }} className={`${item} text-red-600`}><span className="flex h-[18px] w-[18px] items-center justify-center">↩</span>Log out</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
