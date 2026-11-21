import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from './Icons'
import { toISO, tomorrowISO, plusDaysISO, dayStatus } from '../lib/store'

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const dot = { free: 'bg-emerald-500', partial: 'bg-amber-400', full: 'bg-red-400' }

export default function Calendar({ value, onChange, map }) {
  const min = tomorrowISO()
  const start = value ? new Date(value + 'T00:00') : new Date(min + 'T00:00')
  const [view, setView] = useState(new Date(start.getFullYear(), start.getMonth(), 1))
  const [dir, setDir] = useState(1)
  const max = plusDaysISO(365)
  const y = view.getFullYear(), m = view.getMonth()
  const first = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const nav = (d) => { setDir(d); setView(new Date(y, m + d, 1)) }
  const canPrev = toISO(new Date(y, m, 0)) >= min
  const canNext = toISO(new Date(y, m + 1, 1)) <= max

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => nav(-1)} disabled={!canPrev} aria-label="Previous month" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-fg ring-1 ring-slate-300 transition dark:ring-slate-400 enabled:hover:bg-slate-100 enabled:active:scale-90 disabled:opacity-35"><ChevronLeft width={18} height={18} /></button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={`${y}-${m}`} initial={{ opacity: 0, y: dir * 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: dir * -10 }} transition={{ duration: 0.15 }} className="font-semibold text-fg">
            {view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </motion.p>
        </AnimatePresence>
        <button type="button" onClick={() => nav(1)} disabled={!canNext} aria-label="Next month" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-fg ring-1 ring-slate-300 transition dark:ring-slate-400 enabled:hover:bg-slate-100 enabled:active:scale-90 disabled:opacity-35"><ChevronRight width={18} height={18} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">{DOW.map((d) => <span key={d} className="py-1">{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />
          const iso = toISO(new Date(y, m, d))
          const off = iso < min || iso > max
          const st = off ? null : dayStatus(iso, map)
          const sel = value === iso
          const disabled = off || st === 'full'
          return (
            <button key={iso} type="button" disabled={disabled} onClick={() => onChange(iso)} aria-pressed={sel}
              aria-label={`${iso}${st ? ', ' + st : ''}`}
              className={`relative flex aspect-square items-center justify-center rounded-2xl text-sm font-medium transition ${sel ? 'text-white' : disabled ? 'text-slate-400' : 'bg-slate-50 text-fg hover:bg-brand-soft hover:text-brand-ink'} ${st === 'full' ? 'bg-transparent line-through' : ''}`}>
              {sel && <motion.span layoutId="cal-sel" className="absolute inset-0 rounded-2xl bg-brand shadow-glow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">{d}</span>
              {st && !sel && <span className={`absolute bottom-1.5 h-1 w-1 rounded-full ${dot[st]}`} />}
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        {[['free', 'Available'], ['partial', 'One shift left'], ['full', 'Fully booked']].map(([k, l]) => (
          <span key={k} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${dot[k]}`} />{l}</span>
        ))}
      </div>
    </div>
  )
}
