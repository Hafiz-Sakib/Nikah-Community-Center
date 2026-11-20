import { AnimatePresence, motion } from 'framer-motion'
import { useToasts } from '../lib/store'
import { CheckIcon, CloseIcon } from './Icons'
export default function Toaster() {
  const list = useToasts()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[80] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-dock">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${t.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
              {t.type === 'error' ? <CloseIcon width={14} height={14} /> : <CheckIcon width={14} height={14} />}
            </span>{t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
