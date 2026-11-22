import { fmtDate } from './store'

export const invoiceNo = (b) => b.invoiceNo || 'INV-' + b.id.replace(/^NCC-/, '')

/* Everything on the bill/invoice comes from the booking's price snapshot (saved by the server at booking time),
   so changing a package price later never rewrites an old invoice. */
export const billQuote = (b) => b.priceSnapshot
export const paidOf = (b) => (b.payments ? b.payments.filter((p) => p.status === 'verified').reduce((s, p) => s + p.amount, 0) : b.paidAmount || 0)

/* One place that answers "how much is paid / due" for every screen (client billing, My bookings, admin).
   Amounts are whole taka. verified = confirmed by staff; waiting = submitted by the customer, not yet verified (counts as paid for now).
   room   = the most anyone may still add (total - verified - waiting)
   needAdvance = part of the advance not yet covered even by waiting payments.
   Mirrors the server's standing() in services/paymentService.js; the server is the authority and re-checks every payment. */
export function moneyOf(b) {
  const total = b.priceSnapshot?.total ?? b.total ?? 0
  const advance = b.priceSnapshot?.advance ?? b.advance ?? 0
  const paid = paidOf(b)
  const waiting = (b.payments || []).filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  // A cancelled / expired booking owes nothing and takes no payments: every taka already verified is to be refunded, never shown as "Fully paid".
  const closed = b.status === 'cancelled' || b.status === 'expired'
  if (closed) {
    const refunded = !!b.refundedAt   // staff have paid the money back and marked it
    return { total, advance, paid, waiting, balance: 0, room: 0, needAdvance: 0, advanceReceived: false, paidInFull: false, closed: true, refunded, refundedAmount: b.refundedAmount ?? paid, overpaid: !refunded && paid > 0, refundDue: refunded ? 0 : paid }
  }
  return {
    total, advance, paid, waiting,
    balance: Math.max(0, total - paid),
    room: Math.max(0, total - paid - waiting),
    needAdvance: Math.max(0, advance - paid - waiting),
    advanceReceived: paid >= advance,
    paidInFull: total > 0 && paid >= total,
    closed: false,
    overpaid: paid > total,
    refundDue: Math.max(0, paid - total),   // total fell below what was paid: staff refund the difference
  }
}

/* Itemised rows shared by the bill and the invoice. `tone` colours the proportion bar. */
export function billRows(b) {
  const q = b.priceSnapshot
  const rows = [{ id: 'hall', label: `Hall rental · ${q.pkgName}`, note: `${q.shiftLabel} shift (${q.shiftTime})`, amount: q.base, tone: '#2563d6' }]
  if (q.weekend) rows.push({ id: 'weekend', label: 'Weekend surcharge (15%)', note: 'Friday / Saturday', amount: q.weekendFee, tone: '#c2410c' })
  q.lines.forEach((l, i) => rows.push({ id: l.id, label: l.label, note: l.note, amount: l.amount, tone: l.id === 'catering' ? '#d4a017' : ['#3f87f5', '#0f766e', '#7c3aed', '#be185d'][i % 4] }))
  return { rows, q }
}
export const waText = (b, method) => `Hello! I booked ${b.eventType} on ${fmtDate(b.date)}. Booking ID: ${b.id}. Name: ${b.name}.${method ? ` I will pay the advance via ${method}.` : ''}`

/* Render the invoice node to an A4 PDF (libraries load only when needed).
   Shrunk to fit one A4 page; a very long invoice becomes one tall page, never split across pages. */
export async function downloadInvoicePdf(node, filename) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  if (document.fonts?.ready) { try { await document.fonts.ready } catch {} }   // Poppins must be loaded before the snapshot
  const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: 794 })
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const W = 210, H = 297
  const imgH = (canvas.height * W) / canvas.width
  const data = canvas.toDataURL('image/jpeg', 0.95)
  if (imgH <= H * 1.45) {
    // one A4 page: shrink to fit, so the barcode and totals are never cut in two
    const k = Math.min(1, H / imgH), w = W * k, h = imgH * k
    pdf.addImage(data, 'JPEG', (W - w) / 2, 0, w, h)
  } else {
    // very long invoice: one tall page instead of cutting through the barcode
    const tall = new jsPDF({ unit: 'mm', format: [W, imgH], compress: true })
    tall.addImage(data, 'JPEG', 0, 0, W, imgH)
    tall.save(filename)
    return
  }
  pdf.save(filename)
}
