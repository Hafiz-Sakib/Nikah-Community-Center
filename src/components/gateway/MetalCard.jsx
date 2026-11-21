/* Live card preview. Adapted from Motion Brew "Metal card stack" (https://motion-brew.com/components/metal-card-stack):
   same brushed-metal plate, chip, hologram and back face, rebuilt on Motion (no GSAP). It tilts toward the pointer,
   fills in as you type and turns over while the CVC field has focus. */
import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { Network } from './marks'

const METALS = {
  graphite: { base: 'linear-gradient(135deg, #5b6068 0%, #2f3338 38%, #4a4f56 62%, #23262a 100%)', ink: 'rgba(255,255,255,0.88)', edge: '#17191c' },
  gold: { base: 'linear-gradient(135deg, #f3dca2 0%, #c9a35a 34%, #e9cf8c 58%, #a8823c 100%)', ink: 'rgba(58,40,10,0.85)', edge: '#7a5a22' },
  titanium: { base: 'linear-gradient(135deg, #eef0f2 0%, #b9bec4 36%, #dfe2e6 60%, #9aa0a7 100%)', ink: 'rgba(30,34,40,0.82)', edge: '#6f757c' },
  obsidian: { base: 'linear-gradient(135deg, #2a2b2f 0%, #0c0c0e 40%, #1d1e22 64%, #050506 100%)', ink: 'rgba(255,255,255,0.82)', edge: '#000' },
}
const FINISH = { Visa: 'graphite', Mastercard: 'gold', Amex: 'titanium', Discover: 'obsidian' }
const W = 320, H = W / 1.586

/** Digits padded with bullets, grouped as the network prints them. */
function masked(d, brand) {
  const amex = brand === 'Amex'
  const full = (d + '•'.repeat(amex ? 15 : 16)).slice(0, amex ? 15 : 16)
  return amex ? [full.slice(0, 4), full.slice(4, 10), full.slice(10)].join(' ') : full.replace(/(.{4})(?=.)/g, '$1 ')
}

function Plate({ finish, children }) {
  const m = METALS[finish]
  return (
    <div className="relative overflow-hidden rounded-[18px]" style={{ width: W, height: H, background: m.base, color: m.ink, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
      <div aria-hidden className="absolute inset-0 opacity-70 mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 3px)' }} />
      <div aria-hidden className="absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.15) 52%, transparent 70%)', backgroundSize: '260% 260%', backgroundPosition: 'var(--sheen-x, 50%) var(--sheen-y, 50%)' }} />
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at var(--sheen-x, 50%) 0%, rgba(255,255,255,0.18), transparent 60%)' }} />
      {children}
    </div>
  )
}
const emboss = (f) => (f === 'gold' || f === 'titanium' ? '0 1px 0 rgba(255,255,255,0.55), 0 -1px 0 rgba(0,0,0,0.25)' : '0 1px 0 rgba(255,255,255,0.18), 0 -1px 0 rgba(0,0,0,0.6)')

function Front({ finish, digits, brand, holder, expiry, owner }) {
  const m = METALS[finish]
  return (
    <Plate finish={finish}>
      <div className="relative flex h-full flex-col px-5 pb-4 pt-4" style={{ textShadow: emboss(finish) }}>
        <div className="flex items-start justify-between">
          <span className="min-w-0 truncate text-base font-semibold uppercase tracking-[0.14em]">{owner || 'Cardholder'}</span>
          <span className="ml-3 shrink-0 text-xs font-medium uppercase tracking-[0.16em] opacity-70">Advance</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div aria-hidden className="relative h-8 w-11 overflow-hidden rounded-[7px]" style={{ background: 'linear-gradient(135deg, #f6e3a8, #c79d4f 50%, #ecd38f)', boxShadow: 'inset 0 0 0 1px rgba(90,60,10,0.35), 0 1px 1px rgba(0,0,0,0.25)' }}>
            <span className="absolute inset-x-0 top-1/3 h-px bg-black/25" /><span className="absolute inset-x-0 top-2/3 h-px bg-black/25" /><span className="absolute inset-y-0 left-1/2 w-px bg-black/25" /><span className="absolute inset-[30%] rounded-[3px] border border-black/25" />
          </div>
          <div aria-hidden className="relative h-9 w-[60px] overflow-hidden rounded-md" style={{ background: 'linear-gradient(135deg, #f4f5f7, #b8bcc2 45%, #e9ebee 60%, #9ea3aa)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5), 0 1px 1px rgba(0,0,0,0.25)' }}>
            <span className="absolute inset-0 opacity-60 mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(110deg, #ff9ad5, #9be7ff, #b8ffb0, #ffe59a, #ff9ad5)', backgroundSize: '300% 100%', backgroundPosition: 'var(--sheen-x, 50%) 50%' }} />
          </div>
        </div>
        <p className="mt-3 whitespace-nowrap font-mono text-xl font-medium tracking-[0.08em]">{masked(digits, brand)}</p>
        <div className="mt-1 flex items-center justify-end gap-2 text-xs">
          <span className="uppercase leading-[1.05] tracking-[0.08em] opacity-60" style={{ fontSize: 10 }}>Valid<br />thru</span>
          <span className="font-mono text-base tabular-nums">{expiry || 'MM/YY'}</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <span className="truncate text-sm font-medium uppercase tracking-[0.12em]">{holder || owner || 'Your name'}</span>
          <span className="flex h-9 shrink-0 items-end" style={{ textShadow: 'none' }}><Network brand={brand} ink={m.ink} /></span>
        </div>
      </div>
    </Plate>
  )
}

function Back({ finish, cvc }) {
  return (
    <Plate finish={finish}>
      <div className="relative flex h-full flex-col">
        <p className="truncate px-5 pt-3 text-xs opacity-80">Advance payment · Nikah Community Center</p>
        <div aria-hidden className="mt-2 h-9 w-full" style={{ background: 'linear-gradient(180deg, #1a1a1c, #050506 60%, #1f1f22)' }} />
        <div className="mt-3 flex items-center gap-2 px-5">
          <div aria-hidden className="h-8 flex-1 rounded-sm" style={{ background: 'repeating-linear-gradient(-8deg, #ffffff 0px, #ffffff 3px, #dfe7f3 3px, #dfe7f3 4px)' }} />
          <span className="grid h-8 w-12 place-items-center rounded-sm bg-white font-mono text-sm italic text-zinc-900">{cvc ? cvc.padEnd(3, '•') : '•••'}</span>
        </div>
        <p className="mt-auto px-5 pb-4 text-xs leading-snug opacity-70">Your CVC is only used for this payment and is never saved.</p>
      </div>
    </Plate>
  )
}

export function MetalCard({ digits = '', brand = null, holder = '', expiry = '', cvc = '', flipped = false, owner = '' }) {
  const still = !!useReducedMotion()
  const root = useRef(null)
  const [fit, setFit] = useState(1)
  useLayoutEffect(() => {
    const el = root.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setFit(Math.min(1, Math.max(0.6, el.clientWidth / (W + 8)))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const finish = FINISH[brand] || 'obsidian'
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  const move = (e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
    el.style.setProperty('--sheen-x', `${Math.max(0, Math.min(100, px * 100))}%`)
    el.style.setProperty('--sheen-y', `${Math.max(0, Math.min(100, py * 100))}%`)
    if (still || e.pointerType !== 'mouse') return
    ry.set((px - 0.5) * 14); rx.set(-(py - 0.5) * 12)
  }
  const leave = () => { rx.set(0); ry.set(0) }
  const face = 'absolute inset-0 rounded-[18px] shadow-[0_2px_4px_rgba(0,0,0,0.18),0_24px_44px_-18px_rgba(0,0,0,0.55)] [backface-visibility:hidden]'

  return (
    <div ref={root} className="mx-auto w-full max-w-[360px]" style={{ height: H * fit + 8 }} role="img"
      aria-label={`Card preview${brand ? `, ${brand}` : ''}${digits ? `, ending ${digits.slice(-4)}` : ''}`}>
      <div style={{ width: W, height: H, transform: fit < 1 ? `scale(${fit})` : undefined, transformOrigin: 'top left', marginInline: fit < 1 ? 0 : 'auto', perspective: 1100 }}>
        <motion.div onPointerMove={move} onPointerLeave={leave} style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', width: W, height: H }}>
          <motion.div className="relative" style={{ width: W, height: H, transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }} transition={still ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 17 }}>
            <div aria-hidden className="absolute inset-x-[3px] top-[3px] rounded-[18px] [backface-visibility:hidden]" style={{ height: H, background: METALS[finish].edge, transform: 'translateZ(-1px)' }} />
            <div className={face}><Front finish={finish} digits={digits} brand={brand} holder={holder} expiry={expiry} owner={owner} /></div>
            <div className={face} style={{ transform: 'rotateY(180deg)' }}><Back finish={finish} cvc={cvc} /></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
