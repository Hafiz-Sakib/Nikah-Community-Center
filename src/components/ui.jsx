import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'

/* Words rise out of a soft blur */
export function BlurText({ text, className = '', delay = 0, as: Tag = 'span' }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i} aria-hidden className="inline-block whitespace-pre" initial={reduce ? false : { opacity: 0, y: 18, filter: 'blur(12px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}} transition={{ duration: 0.7, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>{w + ' '}</motion.span>
      ))}
    </Tag>
  )
}

/* One word flips letter by letter on a loop */
export function FlipWords({ words, every = 2600, className = '' }) {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % words.length), every); return () => clearInterval(t) }, [words, every])
  return (
    <span className={`relative inline-flex ${className}`} aria-live="polite" style={{ perspective: 600 }}>
      <AnimatePresence mode="wait">
        <motion.span key={words[i]} className="inline-flex">
          {words[i].split('').map((ch, k) => (
            <motion.span key={k} className="inline-block origin-bottom whitespace-pre" initial={{ rotateX: -90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} exit={{ rotateX: 90, opacity: 0 }} transition={{ duration: 0.28, delay: k * 0.025 }}>{ch}</motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* Leans toward the cursor on a spring */
export function Magnetic({ children, strength = 0.3, className = '' }) {
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const move = (e) => { if (e.pointerType && e.pointerType !== 'mouse') return; const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * strength); y.set((e.clientY - r.top - r.height / 2) * strength) }
  const leave = () => { x.set(0); y.set(0) }
  return <motion.div style={{ x, y }} onPointerMove={move} onPointerLeave={leave} className={`inline-block ${className}`}>{children}</motion.div>
}

/* Hand-drawn pen mark that draws itself under a word */
export function Underline({ children, color = '#3f87f5' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <span ref={ref} className="relative inline-block">
      {children}
      <svg aria-hidden viewBox="0 0 200 14" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full overflow-visible">
        <motion.path d="M2 9 C 40 2, 80 13, 120 6 S 180 4, 198 8" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }} />
      </svg>
    </span>
  )
}
