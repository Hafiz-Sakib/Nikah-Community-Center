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

/* html2canvas draws from a copy of the page that does not always get the site's stylesheet (on phones and in production builds it often
   arrives unstyled: plain Times text stacked in one column). So the PDF is made from a detached copy of the invoice where every element
   carries its final computed style inline. It no longer depends on any stylesheet, so the download looks the same on every device. */
const SKIP = /^(transition|animation|container|will-change|cursor|pointer-events)/
function inlineStyles(src, dst) {
  if (src.nodeType !== 1) return
  const cs = getComputedStyle(src)
  let css = ''
  for (let i = 0; i < cs.length; i++) { const p = cs[i]; if (!SKIP.test(p)) css += `${p}:${cs.getPropertyValue(p)};` }
  dst.setAttribute('style', css)
  for (let i = 0; i < src.children.length; i++) if (dst.children[i]) inlineStyles(src.children[i], dst.children[i])
}
const settled = (img) => (img.complete && img.naturalWidth ? null : new Promise((r) => { img.onload = img.onerror = r }))

/* Render the invoice node to an A4 PDF (libraries load only when needed).
   Shrunk to fit one A4 page; a very long invoice becomes one tall page, never split across pages. */
export async function downloadInvoicePdf(node, filename) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  if (document.fonts?.ready) { try { await document.fonts.ready } catch {} }   // Poppins must be loaded before the snapshot
  const W_PX = 794
  const clone = node.cloneNode(true)
  inlineStyles(node, clone)
  const stage = document.createElement('div')
  stage.setAttribute('aria-hidden', 'true')
  stage.style.cssText = `position:fixed;left:-10000px;top:0;width:${W_PX}px;background:#fff;pointer-events:none;`
  clone.style.width = `${W_PX}px`; clone.style.maxWidth = 'none'
  stage.appendChild(clone); document.body.appendChild(stage)
  try {
    await Promise.all([...clone.querySelectorAll('img')].map(settled))
    const canvas = await html2canvas(clone, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: W_PX, width: W_PX })
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
  } finally { stage.remove() }
}
