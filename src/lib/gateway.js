/* ---------- Card payment gateway adapter ----------
   This build runs in DEMO mode: no money moves and nothing leaves the browser.
   To go live, set GATEWAY_LIVE = true and replace the body of chargeCard() with a call to your processor
   (SSLCommerz, Stripe, bKash PGW...). Real gateways must tokenise the card on their own hosted fields or
   redirect page; never send the raw number / CVC to your own server.
   Full card numbers and CVC are never stored by this app: only brand, last 4 digits, and a reference are kept. */
export const GATEWAY_LIVE = false

export const digitsOf = (v) => v.replace(/\D/g, '')

export function brandOf(d) {
  if (/^4/.test(d)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard'
  if (/^3[47]/.test(d)) return 'Amex'
  if (/^6(011|5)/.test(d)) return 'Discover'
  return null
}

/** Groups of four, or 4-6-5 for Amex. */
export function formatNumber(d) {
  const amex = brandOf(d) === 'Amex'
  const s = d.slice(0, amex ? 15 : 19)
  if (amex) return [s.slice(0, 4), s.slice(4, 10), s.slice(10, 15)].filter(Boolean).join(' ')
  return s.replace(/(.{4})(?=.)/g, '$1 ')
}

export function luhn(d) {
  let sum = 0
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i])
    if (i % 2) { n *= 2; if (n > 9) n -= 9 }
    sum += n
  }
  return sum % 10 === 0
}

export function formatExpiry(raw) {
  let d = digitsOf(raw).slice(0, 4)
  if (d.length === 1 && Number(d) > 1) d = `0${d}`
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export function expiryValid(v) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v)
  if (!m) return false
  const month = Number(m[1]), year = 2000 + Number(m[2])
  if (month < 1 || month > 12) return false
  const now = new Date()
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/** Demo charge. Test cards: any valid number works; a number ending in 0002 is declined. */
export async function chargeCard({ amount, bookingId, card }) {
  await wait(1600)
  const d = digitsOf(card.number)
  if (d.endsWith('0002')) throw new Error('Your card was declined. Please try another card.')
  return {
    ok: true,
    ref: 'TXN-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    brand: brandOf(d),
    last4: d.slice(-4),
    amount,
    bookingId,
    paidAt: new Date().toISOString(),
  }
}
