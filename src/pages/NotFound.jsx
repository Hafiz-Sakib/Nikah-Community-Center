import { Link, useLocation } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { img } from '../data'
import { BlurText, Magnetic } from '../components/ui'
import Button from '../components/brew/Button'
import { ArrowRight, CalendarIcon } from '../components/Icons'

const LINKS = [['Packages', '/packages'], ['Events', '/events'], ['Gallery', '/gallery'], ['Contact', '/contact']]

/* The zero in 404 is a pair of wedding rings. They draw themselves in, then drift slightly apart as the cursor moves. */
function Rings() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 90, damping: 14 })
  const sy = useSpring(my, { stiffness: 90, damping: 14 })
  const ax = useTransform(sx, (v) => -v * 9), ay = useTransform(sy, (v) => -v * 5)
  const bx = useTransform(sx, (v) => v * 9), by = useTransform(sy, (v) => v * 5)
  const move = (e) => { if (reduce) return; mx.set(e.clientX / window.innerWidth - 0.5); my.set(e.clientY / window.innerHeight - 0.5) }
  const draw = (delay) => reduce ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] } }
  return (
    <svg onPointerMove={move} viewBox="28 12 144 96" className="h-[7.5rem] w-auto overflow-visible sm:h-[11.5rem]" role="img" aria-label="Two interlocked wedding rings">
      <defs>
        <linearGradient id="ring-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#bcd6ff" /></linearGradient>
        <linearGradient id="ring-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6aa5ff" /><stop offset="1" stopColor="#3f87f5" /></linearGradient>
        <clipPath id="ring-weave"><rect x="60" y="60" width="80" height="60" /></clipPath>
      </defs>
      <motion.g style={{ x: bx, y: by }}><motion.circle cx="122" cy="60" r="40" fill="none" stroke="url(#ring-b)" strokeWidth="9" {...draw(0.35)} /></motion.g>
      <motion.g style={{ x: ax, y: ay }}><motion.circle cx="78" cy="60" r="40" fill="none" stroke="url(#ring-a)" strokeWidth="9" {...draw(0.15)} /></motion.g>
      {/* second ring passes over the first at the bottom crossing, so they read as linked */}
      <g clipPath="url(#ring-weave)"><motion.g style={{ x: bx, y: by }}><motion.circle cx="122" cy="60" r="40" fill="none" stroke="url(#ring-b)" strokeWidth="9" {...draw(0.35)} /></motion.g></g>
    </svg>
  )
}

export default function NotFound() {
  const reduce = useReducedMotion()
  const { pathname } = useLocation()
  const up = (d) => reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  return (
    <section className="pt-16">
      <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-ink px-5 py-14 text-center">
        <img src={img('auth-rings.webp')} alt="" data-keep className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/70 to-ink/90" />
        <div aria-hidden className="absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/25 blur-3xl" />

        <div className="relative w-full max-w-xl text-white">
          <div className="flex items-center justify-center gap-1 sm:gap-3" aria-label="404">
            <motion.span {...up(0)} aria-hidden className="select-none text-[7.5rem] font-bold leading-none tracking-tight text-white sm:text-[11.5rem]">4</motion.span>
            <Rings />
            <motion.span {...up(0)} aria-hidden className="select-none text-[7.5rem] font-bold leading-none tracking-tight text-white sm:text-[11.5rem]">4</motion.span>
          </div>

          <BlurText as="h1" text="This page isn’t on the guest list" delay={0.25} className="mt-6 block text-2xl font-semibold tracking-tight sm:text-4xl" />
          <motion.p {...up(0.45)} className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">The link may be old or mistyped. Head back home, or see which dates are still open.</motion.p>
          <motion.p {...up(0.5)} className="mx-auto mt-4 inline-block max-w-full truncate rounded-full bg-white/10 px-4 py-1.5 font-mono text-xs text-white ring-1 ring-white/30">{pathname}</motion.p>

          <motion.div {...up(0.6)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Magnetic><Button as={Link} to="/" size="lg">Back to home<ArrowRight /></Button></Magnetic>
            <Magnetic><Button as={Link} to="/booking" size="lg" variant="white"><CalendarIcon width={18} height={18} />Check open dates</Button></Magnetic>
          </motion.div>

          <motion.nav {...up(0.75)} aria-label="Popular pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {LINKS.map(([label, to]) => <Button key={to} as={Link} to={to} size="sm" variant="glass">{label}</Button>)}
          </motion.nav>
        </div>
      </div>
    </section>
  )
}
