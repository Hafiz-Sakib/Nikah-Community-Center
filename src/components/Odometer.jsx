import { motion } from 'motion/react'

/* Price that rolls like an odometer: every digit is a column 0-9 that slides to its value */
function Digit({ d }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none" aria-hidden>
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" initial={false} animate={{ y: `${-d * 10}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.9 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n} className="block h-[1em] text-center leading-none">{n}</span>)}
      </motion.span>
    </span>
  )
}

export default function Odometer({ value, prefix = '', className = '' }) {
  const chars = Math.round(value).toLocaleString('en-IN').split('')
  const n = chars.length
  return (
    <span className={`inline-flex items-end tabular-nums ${className}`} role="text" aria-label={`${prefix}${Math.round(value).toLocaleString('en-IN')}`}>
      {prefix && <span className="mr-0.5 self-start pt-[0.18em] text-[0.5em] font-semibold text-slate-400" aria-hidden>{prefix}</span>}
      <span className="inline-flex" aria-hidden>
        {chars.map((c, i) => (c === ',' ? <span key={`c${n - i}`} className="w-[0.28em] text-center leading-none">,</span> : <Digit key={`d${n - i}`} d={+c} />))}
      </span>
    </span>
  )
}
