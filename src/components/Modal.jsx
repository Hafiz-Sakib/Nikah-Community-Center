import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { CloseIcon } from './Icons'

/* One dialog for every popup (billing, invoice, edit). Bottom sheet on phones, centred card on larger screens.
   The header stays put and only the body scrolls, so a tall bill never pushes the close button off screen. */
const SIZE = { sm: 'sm:max-w-md', md: 'sm:max-w-[640px]', lg: 'sm:max-w-3xl', xl: 'sm:max-w-[860px]' }

export default function Modal({ title, onClose, size = 'md', center = false, children }) {
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const key = (e) => { if (e.key === 'Escape') close.current() }
    window.addEventListener('keydown', key)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', key) }
  }, [])
  return (
    <motion.div className={`fixed inset-0 z-[75] flex justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6 ${center ? 'items-center p-3' : 'items-end'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) close.current() }}>
      <motion.div role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, y: center ? 16 : 56, scale: center ? 0.96 : 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: center ? 10 : 36, scale: center ? 0.97 : 0.98 }} transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden bg-surface shadow-dock ring-1 ring-slate-200 sm:max-h-[88dvh] sm:rounded-3xl ${center ? 'max-h-[88dvh] rounded-3xl' : 'rounded-t-[1.75rem]'} ${SIZE[size]}`}>
        <span aria-hidden className={`mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-slate-300 sm:hidden ${center ? 'hidden' : 'block'}`} />
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <p className="min-w-0 truncate text-base font-semibold text-fg sm:text-lg">{title}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-fg transition hover:bg-slate-200 active:scale-90"><CloseIcon width={18} height={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pb-6 sm:pt-5">{children}</div>
      </motion.div>
    </motion.div>
  )
}
