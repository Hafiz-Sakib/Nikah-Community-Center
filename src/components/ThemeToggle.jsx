import { motion, useReducedMotion } from 'motion/react'
import { toggleTheme, useDark, SWITCH_MS } from '../theme'

/* Day / night button: just two icons (sun and moon), no switch track, so it takes no extra space.
   Click swaps them. The page itself still changes through the growing circle from this button (see toggleTheme in theme.js). */
const GLIDE = { duration: (SWITCH_MS / 1000) * 0.6, ease: [0.5, 0.05, 0.25, 1] }
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315]

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="4.6" fill="currentColor" />
      {RAYS.map((a) => <line key={a} x1="12" y1="2.4" x2="12" y2="4.6" transform={`rotate(${a} 12 12)`} />)}
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a.7.7 0 0 0-.95-.82A9.6 9.6 0 1 0 21 15.55a.7.7 0 0 0-.8-.95Z" />
      <circle cx="17.5" cy="5.5" r="1" /><circle cx="20.5" cy="9" r=".7" />
    </svg>
  )
}

export default function ThemeToggle({ className = '' }) {
  const dark = useDark()
  const still = !!useReducedMotion()
  const t = still ? { duration: 0 } : GLIDE
  return (
    <motion.button type="button" aria-label={dark ? 'Switch to day mode' : 'Switch to night mode'} title={dark ? 'Switch to day mode' : 'Switch to night mode'}
      onClick={(e) => toggleTheme(e.currentTarget)} whileTap={still ? undefined : { scale: 0.88 }}
      className={`relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-slate-100 outline-none transition-colors duration-700 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-brand ${className}`}>
      <motion.span aria-hidden className="absolute text-amber-500" initial={false} animate={{ opacity: dark ? 0 : 1, rotate: dark ? 90 : 0, scale: dark ? 0.3 : 1 }} transition={t}><SunIcon /></motion.span>
      <motion.span aria-hidden className="absolute text-indigo-300" initial={false} animate={{ opacity: dark ? 1 : 0, rotate: dark ? 0 : -90, scale: dark ? 1 : 0.3 }} transition={t}><MoonIcon /></motion.span>
    </motion.button>
  )
}
