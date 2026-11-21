import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { BookingsProvider } from './lib/bookings'
import './index.css'

/* old shared links like /#/events keep working: turn them into /events before the router starts */
if (location.hash.startsWith('#/')) history.replaceState(null, '', location.hash.slice(1))

/* keep the PWA install prompt so our own buttons can trigger it later */
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__pwaPrompt = e; window.dispatchEvent(new Event('pwa-ready')) })
window.addEventListener('appinstalled', () => { window.__pwaPrompt = null; window.dispatchEvent(new Event('pwa-installed')) })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter><AuthProvider><BookingsProvider><App /></BookingsProvider></AuthProvider></BrowserRouter>
    </MotionConfig>
  </React.StrictMode>
)
