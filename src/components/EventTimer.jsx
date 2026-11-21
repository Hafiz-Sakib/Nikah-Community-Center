import { ClockIcon } from './Icons'
import { useNow, eventWindow, parts, pad, DAY } from '../lib/countdown'
import { fmtDate, SHIFTS } from '../lib/store'

/* Small reverse timer that counts down to the event. Shown on My bookings and in the staff dashboard. */
const TONE = {
  far: 'bg-brand-soft text-brand-ink ring-brand/30',
  near: 'bg-amber-100 text-amber-800 ring-amber-300',
  soon: 'bg-orange-100 text-orange-800 ring-orange-300',
  live: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
  done: 'bg-slate-100 text-slate-600 ring-slate-300',
}
const DARK = 'dark:!bg-white/10 dark:!ring-white/20 dark:!text-fg'

export default function EventTimer({ b, compact = false, className = '' }) {
  const now = useNow()
  if (!b || (b.status !== 'pending' && b.status !== 'confirmed')) return null
  const { start, end } = eventWindow(b)
  const left = start - now
  const shift = SHIFTS.find((s) => s.id === b.shift)
  const title = `Event: ${fmtDate(b.date)} · ${shift?.time ?? ''}`

  const live = now >= start && now < end
  const done = now >= end
  const tone = done ? 'done' : live ? 'live' : left < DAY ? 'soon' : left < 7 * DAY ? 'near' : 'far'
  const { d, h, m, s } = parts(left)

  return (
    <span title={title} className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONE[tone]} ${DARK} ${className}`}>
      {live ? <span aria-hidden className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
        : <ClockIcon width={14} height={14} aria-hidden className={tone === 'soon' ? 'motion-safe:animate-pulse' : ''} />}
      {done ? <span>Event ended</span>
        : live ? <span>Happening now</span>
        : (
          <span className="tabular-nums" role="timer" aria-label={`Event starts in ${d} days ${h} hours ${m} minutes`}>
            {!compact && <span className="mr-1 font-medium opacity-80">Event in</span>}
            {d > 0 && <><b className="text-[13px]">{d}</b><span className="mr-1 opacity-80">d</span></>}
            <b>{pad(h)}</b><span className="mr-1 opacity-80">h</span><b>{pad(m)}</b><span className="mr-1 opacity-80">m</span><b>{pad(s)}</b><span className="opacity-80">s</span>
          </span>
        )}
    </span>
  )
}
