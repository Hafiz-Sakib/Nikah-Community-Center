import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { img } from '../data'
import { BlurText, Magnetic } from '../components/ui'
import Button from '../components/brew/Button'
import { ArrowRight, CalendarIcon, SparklesIcon } from '../components/Icons'

const LINKS = [['Packages', '/packages'], ['Events', '/events'], ['Gallery', '/gallery'], ['Connect', '/connect']]
const ROUTES = ['/events', '/food', '/packages', '/facilities', '/gallery', '/connect', '/booking', '/my-bookings', '/login']
const EASE = [0.22, 1, 0.36, 1]

/* ---- "did you mean …?" : nearest real page to the mistyped link ---- */
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}
function closest(path) {
  const seg = '/' + (path.toLowerCase().split('/')[1] || '')
  if (seg === '/') return null
  let best = null, score = 99
  for (const r of ROUTES) { const k = lev(seg, r); if (k < score) { score = k; best = r } }
  return score <= 3 ? best : null
}

/* ---- strings of fairy lights that sway and twinkle ---- */
const BULBS = ['#ffd479', '#ff9eb5', '#8fbcff', '#ffe9a8', '#b8f0d0']
function Lights() {
  const strings = useMemo(() => [{ y: 8, sag: 46, n: 14, seed: 0 }, { y: -10, sag: 74, n: 10, seed: 3 }].map((s) => ({
    ...s,
    d: `M0 ${s.y} Q500 ${s.y + 2 * s.sag} 1000 ${s.y}`,
    bulbs: Array.from({ length: s.n }, (_, i) => { const t = (i + 0.5) / s.n; return { x: 1000 * t, y: s.y + 4 * s.sag * t * (1 - t), c: BULBS[(i + s.seed) % BULBS.length], delay: ((i * 0.37 + s.seed) % 2.6).toFixed(2) } }),
  })), [])
  return (
    <svg aria-hidden viewBox="0 0 1000 150" className="pointer-events-none absolute inset-x-0 top-0 w-full">
      {strings.map((s, k) => (
        <g key={k} className="nf-string" style={{ animationDelay: `${k * -2.4}s` }}>
          <path d={s.d} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.4" />
          {s.bulbs.map((b, i) => (
            <g key={i}>
              <line x1={b.x} y1={b.y} x2={b.x} y2={b.y + 9} stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
              <circle className="nf-bulb" cx={b.x} cy={b.y + 15} r="6.5" fill={b.c} style={{ animationDelay: `${b.delay}s`, filter: `drop-shadow(0 0 7px ${b.c})` }} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}

/* ---- gold dust drifting up ---- */
function Dust() {
  const bits = useMemo(() => Array.from({ length: 26 }, () => ({
    left: Math.random() * 100, size: 2 + Math.random() * 4, dx: Math.round(Math.random() * 120 - 60),
    dur: 9 + Math.random() * 10, delay: -Math.random() * 16, c: Math.random() > 0.35 ? '#ffe9a8' : '#8fbcff',
  })), [])
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => <span key={i} className="nf-dust absolute -bottom-4 rounded-full" style={{ left: `${b.left}%`, width: b.size, height: b.size, background: b.c, boxShadow: `0 0 ${b.size * 3}px ${b.c}`, '--dx': `${b.dx}px`, '--dur': `${b.dur}s`, '--delay': `${b.delay}s` }} />)}
    </div>
  )
}

/* ---- a digit that scrambles, then settles on 4 (click it to replay) ---- */
function Digit({ reduce, delay = 0 }) {
  const [c, setC] = useState(reduce ? '4' : String(Math.floor(Math.random() * 10)))
  const [run, setRun] = useState(0)
  useEffect(() => {
    if (reduce) return
    let n = 0
    const total = 12 + Math.round(delay * 24)
    const id = setInterval(() => { n += 1; if (n >= total) { setC('4'); clearInterval(id) } else setC(String(Math.floor(Math.random() * 10))) }, 55)
    return () => clearInterval(id)
  }, [run, reduce, delay])
  return (
    <motion.button type="button" aria-hidden tabIndex={-1} onClick={() => setRun((r) => r + 1)} whileHover={reduce ? undefined : { y: -6, scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.94 }}
      initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay, ease: EASE }}
      className="inline-block w-[0.66em] cursor-pointer select-none bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-center text-[7.5rem] font-bold leading-none tabular-nums tracking-tight text-transparent sm:text-[11.5rem]">{c}</motion.button>
  )
}

/* ---- two interlocked rings: draw in, lean away from the cursor, and can be dragged around (they spring back) ---- */
function Sparkle({ cx, cy, delay, reduce }) {
  return (
    <motion.path d={`M${cx} ${cy - 9} L${cx + 2.2} ${cy - 2.2} L${cx + 9} ${cy} L${cx + 2.2} ${cy + 2.2} L${cx} ${cy + 9} L${cx - 2.2} ${cy + 2.2} L${cx - 9} ${cy} L${cx - 2.2} ${cy - 2.2}Z`} fill="#fff" style={{ transformOrigin: `${cx}px ${cy}px`, filter: 'drop-shadow(0 0 6px #fff)' }}
      initial={reduce ? false : { scale: 0, rotate: 0, opacity: 0 }} animate={reduce ? {} : { scale: [0, 1, 0.2, 1, 0], rotate: [0, 45, 90, 135, 180], opacity: [0, 1, 0.5, 1, 0] }} transition={{ duration: 3.2, delay, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }} />
  )
}
function Rings({ reduce }) {
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 90, damping: 14 }), sy = useSpring(my, { stiffness: 90, damping: 14 })
  const ax = useTransform(sx, (v) => -v * 9), ay = useTransform(sy, (v) => -v * 5)
  const bx = useTransform(sx, (v) => v * 9), by = useTransform(sy, (v) => v * 5)
  const move = (e) => { if (reduce) return; mx.set(e.clientX / window.innerWidth - 0.5); my.set(e.clientY / window.innerHeight - 0.5) }
  const draw = (delay) => reduce ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 1.3, delay, ease: EASE } }
  return (
    <motion.div drag={!reduce} dragSnapToOrigin dragElastic={0.45} dragTransition={{ bounceStiffness: 260, bounceDamping: 14 }} whileTap={reduce ? undefined : { scale: 0.95, cursor: 'grabbing' }} whileHover={reduce ? undefined : { rotate: -4 }}
      className="relative touch-none cursor-grab select-none" onPointerMove={move}>
      <div aria-hidden className="absolute left-1/2 top-1/2 h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/40 blur-2xl motion-safe:animate-pulse sm:h-40 sm:w-64" />
      <svg viewBox="28 8 144 104" className="relative h-[7.5rem] w-auto overflow-visible sm:h-[11.5rem]" role="img" aria-label="Two interlocked wedding rings. Drag them around.">
        <defs>
          <linearGradient id="nf-ring-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#bcd6ff" /></linearGradient>
          <linearGradient id="nf-ring-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6aa5ff" /><stop offset="1" stopColor="#3f87f5" /></linearGradient>
          <clipPath id="nf-weave"><rect x="60" y="60" width="80" height="60" /></clipPath>
        </defs>
        <motion.g style={{ x: bx, y: by }}><motion.circle cx="122" cy="60" r="40" fill="none" stroke="url(#nf-ring-b)" strokeWidth="9" {...draw(0.35)} /></motion.g>
        <motion.g style={{ x: ax, y: ay }}><motion.circle cx="78" cy="60" r="40" fill="none" stroke="url(#nf-ring-a)" strokeWidth="9" {...draw(0.15)} /></motion.g>
        <g clipPath="url(#nf-weave)"><motion.g style={{ x: bx, y: by }}><motion.circle cx="122" cy="60" r="40" fill="none" stroke="url(#nf-ring-b)" strokeWidth="9" {...draw(0.35)} /></motion.g></g>
        <Sparkle cx={100} cy={26} delay={1.6} reduce={reduce} />
        <Sparkle cx={100} cy={94} delay={2.6} reduce={reduce} />
        <Sparkle cx={50} cy={34} delay={3.4} reduce={reduce} />
      </svg>
    </motion.div>
  )
}

/* ---- the bad link, typed out like a terminal ---- */
function Typed({ text, reduce, delay = 0.9 }) {
  const [n, setN] = useState(reduce ? text.length : 0)
  useEffect(() => {
    if (reduce) return
    setN(0)
    let id
    const start = setTimeout(() => { id = setInterval(() => setN((v) => { if (v >= text.length) { clearInterval(id); return v } return v + 1 }), 45) }, delay * 1000)
    return () => { clearTimeout(start); clearInterval(id) }
  }, [text, reduce, delay])
  return <>{text.slice(0, n)}<span aria-hidden className="nf-caret ml-px inline-block h-3.5 w-[2px] translate-y-0.5 bg-white/80" /></>
}

export default function NotFound() {
  const reduce = useReducedMotion()
  const { pathname } = useLocation()
  const guess = useMemo(() => closest(pathname), [pathname])
  const up = (d) => reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.6, ease: EASE } }
  /* quick links drop in like little tags and settle with a wobble */
  const tag = (i) => reduce ? {} : { initial: { opacity: 0, y: -160, rotate: i % 2 ? 14 : -14 }, animate: { opacity: 1, y: 0, rotate: 0 }, transition: { type: 'spring', stiffness: 170, damping: 11, delay: 1.1 + i * 0.12 } }

  return (
    <section className="pt-16">
      <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-ink px-5 pb-14 pt-24 text-center sm:pt-28">
        <img src={img('auth-rings.webp')} alt="" data-keep className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/72 to-ink/95" />
        <div aria-hidden className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/25 blur-3xl motion-safe:animate-pulse" />
        <Lights />
        <Dust />

        <div className="relative w-full max-w-xl text-white">
          <div className="flex items-center justify-center gap-1 sm:gap-3" aria-label="404" role="img">
            <Digit reduce={reduce} delay={0} />
            <Rings reduce={reduce} />
            <Digit reduce={reduce} delay={0.25} />
          </div>
          {!reduce && <motion.p {...up(1.8)} className="mt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-white/50">psst… drag the rings</motion.p>}

          <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-4xl">
            <BlurText text="This page isn’t on the" delay={0.3} className="inline" />{' '}
            <motion.span {...up(0.75)} className="shimmer-text inline-block">guest list</motion.span>
          </h1>
          <motion.p {...up(0.55)} className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">The link may be old or mistyped. Head back home, or see which dates are still open.</motion.p>
          <motion.p {...up(0.65)} className="mx-auto mt-4 inline-flex max-w-full items-center truncate rounded-full bg-white/10 px-4 py-1.5 font-mono text-xs text-white ring-1 ring-white/30 backdrop-blur"><span className="mr-2 text-white/50">$</span><span className="truncate"><Typed text={pathname} reduce={reduce} /></span></motion.p>

          {guess && (
            <motion.div {...up(1.4)} className="mt-4">
              <Link to={guess} className="group inline-flex items-center gap-2 rounded-full bg-amber-300/15 px-4 py-2 text-sm font-medium text-amber-100 ring-1 ring-amber-200/50 transition hover:bg-amber-300/25">
                <SparklesIcon width={16} height={16} />Did you mean <b className="font-mono">{guess}</b>?<ArrowRight width={14} height={14} className="transition group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          )}

          <motion.div {...up(0.85)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Magnetic><Button as={Link} to="/" size="lg">Back to home<ArrowRight /></Button></Magnetic>
            <Magnetic><Button as={Link} to="/booking" size="lg" variant="white"><CalendarIcon width={18} height={18} />Check open dates</Button></Magnetic>
          </motion.div>

          <nav aria-label="Popular pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {LINKS.map(([label, to], i) => (
              <motion.div key={to} {...tag(i)} whileHover={reduce ? undefined : { y: -4, rotate: i % 2 ? 3 : -3 }}>
                <Button as={Link} to={to} size="sm" variant="glass">{label}</Button>
              </motion.div>
            ))}
          </nav>
        </div>
      </div>
    </section>
  )
}
