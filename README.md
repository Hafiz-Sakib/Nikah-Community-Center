# Nikah Community Center
React + Vite + Tailwind CSS + Motion (motion/react) + React Router (HashRouter)

    npm install
    npm run dev
    npm run build

## Pages
/ (Home) · /about (About + Contact, /contact scrolls to it) · /food · /facilities · /events · /gallery · /packages · /booking · /my-bookings · /contact · /admin (staff)
Booking accepts query params: /booking?event=Wedding&package=wedding-plus&date=2026-12-05&guests=200

## PWA
Installable (manifest + service worker via vite-plugin-pwa), works offline after first visit. Icons in `public/` (favicon.svg/.ico, pwa-192/512, maskable, apple-touch-icon). Install button in footer / mobile menu, plus a one-time banner. Needs HTTPS to install (localhost is fine).

## Dark mode
Toggle in the navbar (circle-reveal animation). Follows system setting on first visit, then remembers the choice. Colours are CSS variables in `src/index.css`.

## Mobile tab bar
`src/components/tab-bar.jsx` — Motion Brew style TabBar (variants: pill | labels | action), used in `src/App.jsx`.

## Booking system (demo, localStorage)
Wizard, live availability, weekend surcharge, 30% advance, booking ID, .ics, WhatsApp, My bookings, staff dashboard (passcode in src/data.js, default admin123).
Replace functions in `src/lib/store.js` with real API calls for production.

## Your real info
Edit `src/data.js`: CONTACT, packages/prices (BDT), add-ons, facilities, events, FAQs.
