import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BinaryText } from '../components/brew/BinaryText'
import { GradientText } from '../components/brew/GradientText'
import { TiltCard } from '../components/brew/TiltCard'
import { Magnetic } from '../components/ui'
import { ArrowRight, CalendarIcon, HeartIcon, MapPinIcon } from '../components/Icons'
import { nav } from '../data'

/* Quick ways back into the site, taken from the main menu so they never go out of date */
const SUGGESTED = nav.filter((n) => ['/packages', '/events', '/gallery', '/contact'].includes(n.to))

export default function NotFound() {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()

  useEffect(() => {
    const prev = document.title
    document.title = '404 — Page not found | Nikah Community Center'
    return () => { document.title = prev }
  }, [])

  const rise = (delay = 0) => (reduce ? {} : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } })

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden pb-16 pt-28">
      {/* soft drifting colour behind everything */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 animate-drift rounded-full bg-brand/25 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 animate-drift rounded-full bg-violet-400/20 blur-3xl [animation-delay:-4s] sm:h-96 sm:w-96" />
      </div>

      <div className="container-x grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
        {/* ---------- text side ---------- */}
        <div className="text-center lg:text-left">
          <motion.span {...rise(0)} className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-semibold text-brand-ink">
            <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping-soft rounded-full bg-brand" /><span className="relative h-2 w-2 rounded-full bg-brand" /></span>
            Error 404
          </motion.span>

          <BinaryText as="h1" text="404" duration={1.2} className="mt-4 block text-[7rem] font-bold leading-none tracking-tight text-brand sm:text-[10rem]" />

          <motion.h2 {...rise(0.15)} className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-4xl">
            This page isn’t on the{' '}
            <GradientText as="span" text="guest list" className="inline-block" />
          </motion.h2>

          <motion.p {...rise(0.25)} className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base lg:mx-0">
            The link may be old or mistyped, or the page has moved. Let’s get you back to the celebration.
          </motion.p>

          <motion.p {...rise(0.3)} className="mx-auto mt-3 max-w-full truncate rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-500 lg:mx-0 lg:w-fit" title={pathname}>
            {pathname}
          </motion.p>

          <motion.div {...rise(0.38)} className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Magnetic><Link to="/" className="btn-primary">Back to home <ArrowRight /></Link></Magnetic>
            <Magnetic strength={0.25}>
              <Link to="/booking" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-surface px-6 py-3 text-sm font-semibold text-fg transition hover:border-brand hover:text-brand active:scale-95">
                <CalendarIcon width={18} height={18} /> Book a date
              </Link>
            </Magnetic>
          </motion.div>

          <motion.div {...rise(0.46)} className="mt-9">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Or try one of these</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
              {SUGGESTED.map((n) => (
                <motion.div key={n.to} whileHover={reduce ? undefined : { y: -3 }} whileTap={{ scale: 0.96 }}>
                  <Link to={n.to} className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-brand hover:text-white">{n.label}</Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ---------- invitation card ---------- */}
        <motion.div {...(reduce ? {} : { initial: { opacity: 0, y: 30, rotate: 2 }, animate: { opacity: 1, y: 0, rotate: 0 }, transition: { duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] } })} className="mx-auto w-full max-w-sm">
          <div className="animate-float">
            <TiltCard className="!h-auto border border-slate-200/70">
              <div className="relative bg-gradient-to-br from-brand to-brand-dark px-7 pb-8 pt-9 text-center text-white">
                <div aria-hidden className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,#fff_0,transparent_45%)]" />
                <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20"><HeartIcon width={22} height={22} /></span>
                <p className="relative mt-4 text-xs font-medium uppercase tracking-[0.25em] text-white/80">You are invited</p>
                <p className="relative mt-1 text-2xl font-semibold">Nikah Community Center</p>
              </div>

              {/* ticket tear line */}
              <div aria-hidden className="relative h-0 border-t-2 border-dashed border-slate-200">
                <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-page" />
                <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-page" />
              </div>

              <dl className="space-y-3.5 px-7 py-6 text-sm">
                <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Page</dt><dd className="max-w-[60%] truncate font-mono text-xs text-fg">{pathname}</dd></div>
                <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Status</dt><dd><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Not found</span></dd></div>
                <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Venue</dt><dd className="flex items-center gap-1.5 font-medium text-fg"><MapPinIcon width={15} height={15} className="text-brand" />Chattogram</dd></div>
              </dl>

              <div className="px-7 pb-7">
                <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-full bg-fg py-3 text-sm font-semibold text-page transition hover:opacity-90 active:scale-[.98]">Take me home <ArrowRight /></Link>
              </div>
            </TiltCard>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
