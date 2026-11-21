/* Adapted from Motion Brew "Tilt card" (https://motion-brew.com/components/tilt-card), ported to JSX. */
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

const SPRING = { stiffness: 260, damping: 22, mass: 0.7 }

export function TiltCard({ children, className = '', maxTilt = 12, hoverScale = 1.03, glare = true, glareOpacity = 0.35, perspective = 800, ...props }) {
  const reduceMotion = useReducedMotion()
  const nx = useMotionValue(0.5)
  const ny = useMotionValue(0.5)
  const hover = useSpring(0, SPRING)
  const rotateX = useSpring(useTransform(ny, [0, 1], [maxTilt, -maxTilt]), SPRING)
  const rotateY = useSpring(useTransform(nx, [0, 1], [-maxTilt, maxTilt]), SPRING)
  const scale = useTransform(hover, [0, 1], [1, hoverScale])
  const glareX = useTransform(nx, [0, 1], [100, 0])
  const glareY = useTransform(ny, [0, 1], [100, 0])
  const glareAlpha = useTransform(hover, [0, 1], [0, glareOpacity])
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareAlpha}), transparent 60%)`

  const move = (e) => {
    if (reduceMotion || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    nx.set((e.clientX - r.left) / r.width); ny.set((e.clientY - r.top) / r.height); hover.set(1)
  }
  const leave = () => { nx.set(0.5); ny.set(0.5); hover.set(0) }

  return (
    <div style={{ perspective }} className="h-full">
      <motion.div onPointerMove={move} onPointerLeave={leave}
        style={reduceMotion ? undefined : { rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
        className={`relative h-full overflow-hidden rounded-3xl bg-surface shadow-card will-change-transform ${className}`} {...props}>
        {children}
        {glare && !reduceMotion && <motion.div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: glareBg }} />}
      </motion.div>
    </div>
  )
}
