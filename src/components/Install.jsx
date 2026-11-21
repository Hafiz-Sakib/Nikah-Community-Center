import { useEffect, useState } from 'react'
import { DownloadIcon } from './Icons'
import { toast } from '../lib/store'

const KEY = 'ncc.installed'
const remembered = () => { try { return localStorage.getItem(KEY) === '1' } catch { return false } }
const remember = () => { try { localStorage.setItem(KEY, '1') } catch {} }
const standalone = () => {
  const on = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  if (on) remember()                      // opened as an installed app: never offer install again in this browser
  return on
}
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream

export function useInstall() {
  const [ready, setReady] = useState(() => !!window.__pwaPrompt)
  const [installed, setInstalled] = useState(() => standalone())
  useEffect(() => {
    const a = () => setReady(true), b = () => { remember(); setInstalled(true); setReady(false) }
    // Chrome can tell us if the app is already installed (button stays hidden then)
    navigator.getInstalledRelatedApps?.().then((apps) => { if (apps?.length) { remember(); setInstalled(true) } }).catch(() => {})
    window.addEventListener('pwa-ready', a); window.addEventListener('pwa-installed', b)
    return () => { window.removeEventListener('pwa-ready', a); window.removeEventListener('pwa-installed', b) }
  }, [])
  // Chrome/Edge only fire the prompt when the app is NOT installed, so `ready` is trustworthy. The remembered flag is only needed on iOS, which gives no signal.
  const ios = isIOS() && !installed && !remembered()
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

/* Icon-only install button, right next to the day/night toggle. Hidden when the app is already installed. */
export function InstallIconButton({ className = '' }) {
  const { available, install } = useInstall()
  if (!available) return null
  return (
    <button type="button" onClick={install} aria-label="Install app" title="Install app" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-brand-ink outline-none transition hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-brand active:scale-90 ${className}`}>
      <DownloadIcon width={19} height={19} />
    </button>
  )
}
