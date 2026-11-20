"use client"
import { useId, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import clsx from "clsx"
import { twMerge } from "tailwind-merge"

const cn = (...a) => twMerge(clsx(a))

/* ---------- animated lucide-style icons ---------- */
const PATHS = {
  home: (<><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>),
  search: (<><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></>),
  chart: (<><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" /><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /></>),
  history: (<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></>),
  profile: (<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  chat: (<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />),
  calendar: (<><path d="M8 2v4M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></>),
}
const WIGGLE = {
  home: { y: [0, -4, 0], rotate: [0, -8, 8, 0] },
  search: { rotate: [0, -18, 14, 0], scale: [1, 1.12, 1] },
  chart: { rotate: [0, 80, 0], scale: [1, 1.12, 1] },
  history: { rotate: [0, -360] },
  profile: { y: [0, -4, 0], scale: [1, 1.15, 1] },
  chat: { rotate: [0, -12, 12, 0] },
  calendar: { scale: [1, 1.18, 0.94, 1] },
}

function Icon({ name, tick, size = 22 }) {
  const reduce = useReducedMotion()
  const play = tick > 0 && !reduce
  return (
    <motion.span key={tick} className="inline-flex" initial={play ? { scale: 0.6 } : false}
      animate={play ? { ...(WIGGLE[name] || {}), scale: WIGGLE[name]?.scale || [0.6, 1.2, 1] } : undefined}
      transition={{ duration: 0.65, ease: "easeOut" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {PATHS[name] || PATHS.home}
      </svg>
    </motion.span>
  )
}

function Badge({ count }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span key="b" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 520, damping: 16 }}
          className="absolute -right-1 -top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-surface">
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

const SPRING = { type: "spring", stiffness: 420, damping: 34 }

export function TabBar({ tabs, variant = "pill", value, defaultValue, onChange, actionLabel = "Create", onAction, className }) {
  const reduce = useReducedMotion()
  const uid = useId()
  const list = tabs || []
  const [inner, setInner] = useState(defaultValue ?? list[0]?.id)
  const active = value !== undefined ? value : inner
  const [ticks, setTicks] = useState({})
  const [spin, setSpin] = useState(0)
  const [pulse, setPulse] = useState(0)
  const refs = useRef({})

  const select = (id) => {
    if (value === undefined) setInner(id)
    setTicks((t) => ({ ...t, [id]: (t[id] || 0) + 1 }))
    onChange?.(id)
  }
  const onKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    const ids = list.map((t) => t.id)
    const cur = ids.indexOf(document.activeElement?.dataset?.tab ?? active)
    const next = ids[(cur + (e.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length]
    refs.current[next]?.focus(); select(next)
  }

  const shown = variant === "action" ? list.slice(0, 4) : list
  const rest = { duration: reduce ? 0 : undefined }

  const tabEl = (t) => {
    const on = active === t.id
    const tick = ticks[t.id] || 0
    const common = {
      ref: (el) => (refs.current[t.id] = el), "data-tab": t.id, type: "button", onClick: () => select(t.id),
      "aria-current": on ? "page" : undefined, "aria-label": t.label, tabIndex: on || (!active && t === shown[0]) ? 0 : -1,
      whileTap: reduce ? undefined : { scale: 0.92 }, transition: { type: "spring", stiffness: 500, damping: 18 },
    }
    const ripple = tick > 0 && !reduce && (
      <motion.span key={tick} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -ml-5 -mt-5 h-10 w-10 rounded-full bg-slate-400/35"
        initial={{ scale: 0.2, opacity: 0.6 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} />
    )

    if (variant === "labels") {
      return (
        <motion.button {...common} className={cn("group relative flex w-[4.25rem] flex-col items-center gap-1 rounded-2xl px-1 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-fg/40", on ? "text-fg" : "text-slate-400 hover:bg-slate-100/80")}>
          <span className="relative flex h-9 w-9 items-center justify-center">
            {on && <motion.span layoutId={uid + "disc"} className="absolute inset-0 rounded-full bg-slate-200/80" transition={reduce ? { duration: 0 } : SPRING} />}
            {ripple}
            <span className="relative"><Icon name={t.icon} tick={tick} size={20} /></span>
            <Badge count={t.badge} />
          </span>
          <span className="text-[12px] font-medium leading-none">{t.label}</span>
          <span className="relative h-1 w-1">{on && <motion.span layoutId={uid + "dot"} className="absolute inset-0 rounded-full bg-fg" transition={reduce ? { duration: 0 } : SPRING} />}</span>
        </motion.button>
      )
    }

    if (variant === "action") {
      return (
        <motion.button {...common} className={cn("relative flex h-12 w-12 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-fg/40", on ? "bg-slate-200/70 text-fg" : "text-slate-400 hover:bg-slate-100/80")}>
          {ripple}
          <span className="relative"><Icon name={t.icon} tick={tick} /></span>
          <Badge count={t.badge} />
          <span className="sr-only">{t.label}</span>
        </motion.button>
      )
    }

    return (
      <motion.button {...common} layout={!reduce} transition={reduce ? { duration: 0 } : SPRING}
        className={cn("relative flex h-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-fg/40", on ? "px-4 text-fg" : "w-11 text-slate-400 hover:bg-slate-100/80")}>
        {on && <motion.span layoutId={uid + "pill"} className="absolute inset-0 rounded-full bg-slate-200/70" transition={reduce ? { duration: 0 } : SPRING} />}
        {ripple}
        <motion.span layout={reduce ? false : "position"} className="relative flex items-center gap-2">
          <span className="relative"><Icon name={t.icon} tick={tick} /><Badge count={t.badge} /></span>
          <AnimatePresence initial={false}>
            {on && (
              <motion.span key="l" initial={{ opacity: 0, width: 0, filter: "blur(6px)" }} animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }} exit={{ opacity: 0, width: 0, filter: "blur(6px)" }}
                transition={{ duration: reduce ? 0 : 0.3 }} className="overflow-hidden whitespace-nowrap text-sm font-medium">
                {t.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </motion.button>
    )
  }

  const items = shown.map((t) => ({ key: t.id, el: tabEl(t) }))
  if (variant === "action") {
    items.splice(2, 0, {
      key: "__action",
      el: (
        <div className="relative -mt-6 mx-1">
          <motion.button type="button" aria-label={actionLabel}
            onClick={() => { setSpin((s) => s + 90); setPulse((p) => p + 1); onAction?.() }}
            whileHover={reduce ? undefined : { y: -3 }} whileTap={reduce ? undefined : { y: 2, scale: 0.95 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-fg text-surface shadow-lg shadow-slate-900/30 ring-4 ring-surface outline-none focus-visible:ring-slate-400">
            {pulse > 0 && !reduce && <motion.span key={pulse} aria-hidden className="absolute inset-0 rounded-full border-2 border-fg" initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.6 }} />}
            <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" animate={{ rotate: spin }} transition={{ duration: reduce ? 0 : 0.4 }}>
              <path d="M12 5v14M5 12h14" />
            </motion.svg>
          </motion.button>
        </div>
      ),
    })
  }

  return (
    <motion.nav aria-label="Primary" onKeyDown={onKey}
      initial={reduce ? false : { y: 48, opacity: 0, filter: "blur(12px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} transition={{ type: "spring", stiffness: 160, damping: 20 }}
      className={cn("inline-flex rounded-full bg-surface shadow-dock ring-1 ring-fg/5", className)}>
      <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: 0.15 } } }}
        className={cn("flex items-center gap-1 p-2", variant === "labels" && "gap-0 px-3 py-1.5")}>
        {items.map(({ key, el }) => (
          <motion.li key={key} variants={{ hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 12 }, show: { opacity: 1, y: 0 } }}>{el}</motion.li>
        ))}
      </motion.ul>
    </motion.nav>
  )
}
export default TabBar
