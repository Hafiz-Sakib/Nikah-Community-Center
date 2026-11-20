import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import App from './App.jsx'
import './index.css'

/* keep the PWA install prompt so our own buttons can trigger it later */
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__pwaPrompt = e; window.dispatchEvent(new Event('pwa-ready')) })
window.addEventListener('appinstalled', () => { window.__pwaPrompt = null; window.dispatchEvent(new Event('pwa-installed')) })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <HashRouter><App /></HashRouter>
    </MotionConfig>
  </React.StrictMode>
)
