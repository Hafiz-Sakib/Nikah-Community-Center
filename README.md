# Nikah Community Center
React + Vite + Tailwind CSS + Framer Motion

    npm install
    npm run dev
    npm run build

## Booking system (demo, runs in the browser)
- 4-step wizard: event & package -> live calendar & shift -> extras & contact -> confirm
- Live availability (calendar dots, shift locking, no double booking), weekend surcharge, 30% advance
- Booking ID, Add-to-calendar (.ics), WhatsApp message
- "My bookings" (search by ID / mobile, cancel)
- Staff dashboard: footer "Staff login" or open `#admin` (passcode in `src/data.js`, default `admin123`): confirm / cancel / delete, CSV export

Data is stored in localStorage. Demo seed makes some dates look pre-booked (`src/lib/store.js`).
For production, replace the functions in `src/lib/store.js` with API calls to a real backend (and real auth for staff).

## Edit your real info
`src/data.js`: CONTACT (phone, WhatsApp, email, address, passcode), packages & prices (BDT), add-ons, facilities, FAQs.
