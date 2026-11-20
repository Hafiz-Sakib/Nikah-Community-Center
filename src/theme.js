import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

/* Day / night theme (idea from the portfolio site).
   - <html> carries the "dark" class; Tailwind `dark:` variants and the CSS variables in index.css follow it.
   - First visit follows the system setting; an explicit choice is saved in localStorage.
   - An inline script in index.html applies the choice before first paint, so there is no flash. */
const KEY = 'theme'
const root = typeof document !== 'undefined' ? document.documentElement : null
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

export const isDark = () => !!root && root.classList.contains('dark')
export const SWITCH_MS = 1100
const SWITCH_EASE = 'cubic-bezier(.5,.05,.25,1)'
const PAGE_BG = { light: '#ffffff', dark: '#0a0e1c' }

function paint(dark) {
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? PAGE_BG.dark : PAGE_BG.light)
  try { localStorage.setItem(KEY, dark ? 'dark' : 'light') } catch { /* storage blocked */ }
  emit()
}
const subscribe = (cb) => { listeners.add(cb); return () => listeners.delete(cb) }
export const useDark = () => useSyncExternalStore(subscribe, isDark, () => false)

/** Flip the theme. With View Transitions the new theme grows out of `origin` (the toggle); elsewhere colours cross-fade. */
export function toggleTheme(origin) {
  const next = !isDark()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { paint(next); return }
  if (typeof document.startViewTransition === 'function' && origin) {
    const r = origin.getBoundingClientRect()
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const st = root.style
    st.setProperty('--vt-x', `${x}px`); st.setProperty('--vt-y', `${y}px`); st.setProperty('--vt-reach', `${reach}px`)
    st.setProperty('--vt-ms', `${SWITCH_MS}ms`); st.setProperty('--vt-ease', SWITCH_EASE)
    root.dataset.themeSwitch = next ? 'to-dark' : 'to-light'
    const vt = document.startViewTransition(() => { flushSync(() => paint(next)) })
    vt.ready.catch(() => {})
    vt.finished.finally(() => {
      delete root.dataset.themeSwitch
      ;['--vt-x', '--vt-y', '--vt-reach', '--vt-ms', '--vt-ease'].forEach((k) => st.removeProperty(k))
    })
    return
  }
  root.classList.add('theme-fade'); paint(next); setTimeout(() => root.classList.remove('theme-fade'), 1100)
}
