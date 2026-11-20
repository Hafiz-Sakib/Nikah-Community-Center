# Nikah Community Center
React + Vite + Tailwind CSS + Motion (motion/react) + React Router (HashRouter)

    npm install
    npm run dev
    npm run build

## Pages
/ (Home) · /about · /facilities · /events · /gallery · /packages · /booking · /my-bookings · /contact · /admin (staff)
Booking accepts query params: /booking?event=Wedding&package=wedding-plus&date=2026-12-05&guests=200

## Mobile tab bar
`src/components/tab-bar.jsx` — Motion Brew style TabBar (variants: pill | labels | action), used in `src/App.jsx`.

## Booking system (demo, localStorage)
Wizard, live availability, weekend surcharge, 30% advance, booking ID, .ics, WhatsApp, My bookings, staff dashboard (passcode in src/data.js, default admin123).
Replace functions in `src/lib/store.js` with real API calls for production.

## Your real info
Edit `src/data.js`: CONTACT, packages/prices (BDT), add-ons, facilities, events, FAQs.
