/* Action pill used on booking cards: lifts on hover, icon wiggles, a light sweeps across, presses in on tap.
   `attention` adds a soft pulsing ring (used for "Pay"). Respects reduced motion. */
import { motion, useReducedMotion } from 'motion/react'

const LOOK = {
  soft: 'bg-brand-soft text-brand-ink ring-1 ring-brand/40 hover:ring-brand',
  info: 'bg-sky-100 text-sky-800 ring-1 ring-sky-300 hover:bg-sky-200 dark:!bg-sky-400/15 dark:!text-sky-200 dark:!ring-sky-400/40',
  primary: 'bg-brand text-white ring-1 ring-brand-dark/50 hover:bg-brand-dark',
  neutral: 'bg-surface text-fg ring-1 ring-slate-300 hover:bg-slate-100 hover:ring-slate-400 dark:ring-slate-400',
  danger: 'bg-surface text-red-600 ring-1 ring-red-300 hover:bg-red-50 dark:text-red-300 dark:ring-red-400/50 dark:hover:bg-red-500/10',
  solidDanger: 'bg-red-500 text-white ring-1 ring-red-600/40 hover:bg-red-600',
}

export default function ActionButton({ icon: Icon, children, variant = 'soft', attention = false, delay = 0, wrap = '', className = '', ...props }) {
  const reduce = useReducedMotion()
  return (
    <motion.div className={wrap} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}>
      <motion.button type="button" {...props} initial="rest" animate="rest" whileHover={reduce ? undefined : 'hover'} whileTap={reduce ? undefined : 'tap'}
        variants={{ rest: { y: 0, scale: 1 }, hover: { y: -1, transition: { duration: 0.15 } }, tap: { scale: 0.94, y: 0, transition: { duration: 0.1 } } }}
        className={`relative inline-flex h-10 w-full select-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60 sm:w-auto ${LOOK[variant]} ${className}`}>
        {attention && !reduce && <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand" animate={{ opacity: [0.7, 0], scale: [1, 1.14] }} transition={{ duration: 1.7, repeat: Infinity, ease: 'easeOut' }} />}
        {Icon && <motion.span aria-hidden className="relative flex" variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: [0, -14, 12, -6, 0], scale: 1.18, transition: { duration: 0.5 } } }}><Icon width={16} height={16} /></motion.span>}
        <span className="relative">{children}</span>
      </motion.button>
    </motion.div>
  )
}
