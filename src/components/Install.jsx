import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { DownloadIcon, CloseIcon } from './Icons'
import { LogoMark } from './Logo'
import { toast } from '../lib/store'

const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream

export function useInstall() {
  const [ready, setReady] = useState(() => !!window.__pwaPrompt)
  const [installed, setInstalled] = useState(() => standalone())
  useEffect(() => {
    const a = () => setReady(true), b = () => { setInstalled(true); setReady(false) }
    window.addEventListener('pwa-ready', a); window.addEventListener('pwa-installed', b)
    return () => { window.removeEventListener('pwa-ready', a); window.removeEventListener('pwa-installed', b) }
  }, [])
  const ios = isIOS() && !installed
  const available = !installed && (ready || ios)
  const install = async () => {
    const ev = window.__pwaPrompt
    if (ev) { ev.prompt(); try { await ev.userChoice } catch {} window.__pwaPrompt = null; setReady(false) }
    else if (ios) toast('Tap Share, then “Add to Home Screen”')
  }
  return { available, install }
}

export function InstallButton({ className = '', children = 'Install app' }) {
  const { available, install } = useInstall()
  if (!available) return null
  return <button onClick={install} className={className}><DownloadIcon width={18} height={18} />{children}</button>
}

/* Icon-only install button (used in the mobile navbar, left of the hamburger) */
export function InstallIconButton({ className = '' }) {
  const { available, install } = useInstall()
  if (!available) return null
  return (
    <button type="button" onClick={install} aria-label="Install app" title="Install app" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-brand-ink outline-none transition hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-brand active:scale-90 ${className}`}>
      <DownloadIcon width={19} height={19} />
    </button>
  )
}

/* Small install card, shown once per session when the browser offers install */
export function InstallBanner() {
  const { available, install } = useInstall()
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!available || sessionStorage.getItem('ncc.install.dismissed')) return
    const t = setTimeout(() => setShow(true), 9000)
    return () => clearTimeout(t)
  }, [available])
  const close = () => { setShow(false); try { sessionStorage.setItem('ncc.install.dismissed', '1') } catch {} }
  return (
    <AnimatePresence>
      {show && available && (
        <motion.div initial={{ y: 40, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed inset-x-3 bottom-4 z-[52] mx-auto flex max-w-sm items-center gap-3 rounded-3xl bg-surface p-3 pr-2 shadow-dock ring-1 ring-fg/5 lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0">
          <LogoMark size={44} />
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-fg">Install Nikah CC</p><p className="text-xs text-slate-500">Book faster from your home screen — works offline too.</p></div>
          <button onClick={() => { install(); close() }} className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white active:scale-95">Install</button>
          <button onClick={close} aria-label="Dismiss" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"><CloseIcon width={16} height={16} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
