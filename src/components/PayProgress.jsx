import { motion, useReducedMotion } from 'motion/react'
import { CheckIcon } from './Icons'

/* Where the booking is on its way to confirmed. Derived from real data, nothing is faked. */
export default function PayProgress({ submitted, verified, confirmed }) {
  const reduce = useReducedMotion()
  const done = [true, submitted || verified || confirmed, verified || confirmed, confirmed]
  const labels = ['Requested', 'Advance paid', 'Verified', 'Confirmed']
  const active = done.findIndex((d) => !d)
  const reach = (active === -1 ? 3 : Math.max(0, active - 1)) / 3   // 0..1 along the line between first and last dot
  return (
    <ol aria-label="Booking progress" className="relative mx-auto mt-5 grid max-w-xl grid-cols-4 text-center">
      <span aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[13px] h-0.5 rounded-full bg-slate-200" />
      <motion.span aria-hidden className="absolute left-[12.5%] top-[13px] h-0.5 origin-left rounded-full bg-emerald-500" style={{ width: '75%' }} initial={{ scaleX: 0 }} animate={{ scaleX: reach }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }} />
      {labels.map((l, i) => {
        const on = done[i], now = i === active
        return (
          <li key={l} className="relative flex min-w-0 flex-col items-center gap-1.5" aria-current={now ? 'step' : undefined}>
            <motion.span initial={false} animate={{ scale: now ? 1.08 : 1 }} className={`relative z-10 grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold ring-4 ring-surface transition-colors duration-300 ${on ? 'bg-emerald-500 text-white' : now ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500'}`}>
              {on ? <CheckIcon width={14} height={14} strokeWidth={3} /> : i + 1}
              {now && !reduce && <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand/40" />}
            </motion.span>
            <span className={`px-0.5 text-[11px] font-medium leading-tight sm:text-xs ${on || now ? 'text-fg' : 'text-slate-400'}`}>{l}</span>
          </li>
        )
      })}
    </ol>
  )
}
