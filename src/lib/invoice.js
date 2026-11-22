import { fmtDate, money } from './store'
import { code128 } from './code128'
import { CONTACT, img } from '../data'

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

/* Last-resort PDF: drawn straight with jsPDF (no HTML, no screenshot), so it works on any phone.
   The built-in PDF fonts are Latin only, so the taka sign is written "Tk" and anything else non-Latin becomes "?". */
const T = (v) => String(v ?? '').replace(/৳/g, 'Tk ').replace(/[–—]/g, '-').replace(/[^\x20-\xFF]/g, '?')
async function vectorInvoicePdf(b, filename) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const { rows, q } = billRows(b)
  const paid = paidOf(b)
  const full = q.total > 0 && paid >= q.total
  const balance = Math.max(0, q.total - paid)
  const status = b.status === 'cancelled' ? 'CANCELLED' : b.status === 'expired' ? 'EXPIRED' : full ? 'PAID IN FULL' : b.status === 'confirmed' ? 'CONFIRMED' : 'ADVANCE PENDING'
  const L = 16, R = 194
  const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
  const fill = (h) => doc.setFillColor(...rgb(h)), ink = (h) => doc.setTextColor(...rgb(h)), line = (h) => doc.setDrawColor(...rgb(h))
  const text = (t, x, y, o = {}) => { doc.setFont('helvetica', o.bold ? 'bold' : 'normal'); doc.setFontSize(o.size || 9); ink(o.color || '#0f172a'); doc.text(T(t), x, y, o.align ? { align: o.align } : undefined) }
  const wrap = (t, w, size) => { doc.setFontSize(size); return doc.splitTextToSize(T(t), w) }

  fill('#6f0202'); doc.rect(0, 0, 210, 4, 'F')
  let hx = L
  try {
    const blob = await (await fetch(img('logo-mark.png'))).blob()
    const url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob) })
    doc.addImage(url, 'PNG', L, 10, 16, 16); hx = L + 20
  } catch { /* the invoice is fine without the emblem */ }
  text('Nikah Community Center', hx, 17, { bold: true, size: 16, color: '#6f0202' })
  text(CONTACT.address, hx, 23, { size: 8, color: '#64748b' })
  text(`${CONTACT.phone}  |  ${CONTACT.email}`, hx, 27.5, { size: 8, color: '#64748b' })
  text('INVOICE', R, 18, { bold: true, size: 22, align: 'right' })
  text(`No. ${invoiceNo(b)}`, R, 25, { size: 9, align: 'right', color: '#475569' })
  text(`Issued ${fmtDate(b.createdAt.slice(0, 10))}`, R, 30, { size: 9, align: 'right', color: '#64748b' })
  text(status, R, 36, { bold: true, size: 9, align: 'right', color: full || b.status === 'confirmed' ? '#047857' : b.status === 'cancelled' || b.status === 'expired' ? '#b91c1c' : '#b45309' })

  if (full && b.status !== 'cancelled') text('PAID', 150, 62, { bold: true, size: 20, color: '#047857' })
  let y = 46
  const box = (x, w, label, big, sub) => {
    fill('#fdf4f4'); doc.roundedRect(x, y, w, 30, 3, 3, 'F')
    text(label.toUpperCase(), x + 5, y + 7, { size: 7, bold: true, color: '#64748b' })
    text(wrap(big, w - 10, 11)[0], x + 5, y + 14, { bold: true, size: 11 })
    sub.slice(0, 3).forEach((t, i) => text(t, x + 5, y + 20 + i * 4.5, { size: 8.5, color: '#64748b' }))
  }
  box(L, 86, 'Billed to', b.name, [b.phone, b.email].filter(Boolean))
  box(L + 92, 86, 'Event', `${b.eventType} - ${fmtDate(b.date, { day: 'numeric', month: 'long', year: 'numeric' })}`, [`${q.shiftLabel} - ${q.shiftTime}`, `${b.guests} guests - ${q.menuName ? `Hall catering (${q.menuName})` : 'Own caterer'}`])

  y = 82
  const stat = (x, label, val, c) => { line('#e2e8f0'); doc.roundedRect(x, y, 57, 17, 3, 3, 'S'); text(label.toUpperCase(), x + 4, y + 6, { size: 7, bold: true, color: '#64748b' }); text(money(val), x + 4, y + 13, { bold: true, size: 12, color: c }) }
  stat(L, 'Total bill', q.total, '#0f172a'); stat(L + 60.5, paid > q.advance ? 'Paid' : 'Advance paid', paid, '#047857'); stat(L + 121, 'Remaining due bill', balance, balance === 0 ? '#047857' : '#b45309')

  y = 108
  fill('#fdf4f4'); doc.rect(L, y, R - L, 8, 'F')
  text('#', L + 3, y + 5.5, { size: 7, bold: true, color: '#64748b' }); text('DESCRIPTION', L + 12, y + 5.5, { size: 7, bold: true, color: '#64748b' }); text('AMOUNT', R - 3, y + 5.5, { size: 7, bold: true, color: '#64748b', align: 'right' })
  y += 8
  rows.forEach((r, i) => {
    if (y + 17 > 262) { doc.addPage(); y = 20 }
    text(String(i + 1), L + 3, y + 6, { size: 9, color: '#64748b' })
    text(r.label, L + 12, y + 6, { bold: true, size: 9.5 })
    if (r.note) text(r.note, L + 12, y + 10.5, { size: 8, color: '#64748b' })
    text(money(r.amount), R - 3, y + 6, { bold: true, size: 9.5, align: 'right' })
    y += 17; line('#e2e8f0'); doc.line(L, y, R, y)
  })

  y += 8
  if (y + 50 > 270) { doc.addPage(); y = 20 }
  const tr = (label, val, c) => { text(label, 120, y, { size: 10, color: '#475569' }); text(money(val), R, y, { bold: true, size: 10, align: 'right', color: c || '#0f172a' }); y += 9 }
  tr('Total bill', q.total); tr(paid > q.advance ? 'Paid' : 'Advance paid', paid, '#047857')
  fill('#6f0202'); doc.roundedRect(118, y - 3, R - 118, 10, 3, 3, 'F')
  text('Remaining due bill', 122, y + 3.5, { bold: true, size: 10, color: '#ffffff' }); text(money(balance), R - 4, y + 3.5, { bold: true, size: 10, align: 'right', color: '#ffffff' })
  y += 18
  ;(b.payments || []).filter((p) => p.status !== 'rejected').forEach((p) => {
    const t = `${p.method}${p.reference ? ` - ${p.reference}` : ''} - ${p.status === 'verified' ? 'received' : 'awaiting verification'}`
    text(wrap(t, 70, 8)[0], 120, y, { size: 8, color: '#64748b' }); text(money(p.amount), R, y, { size: 8, align: 'right', color: '#64748b' }); y += 6.5
  })

  y = Math.max(y + 16, 200)
  if (y + 36 > 276) { doc.addPage(); y = 24 }
  text('TERMS', L, y, { size: 7, bold: true, color: '#64748b' })
  ;['Date held for 48 hours; confirmed once the advance is verified.', 'Cancel 14+ days before the event for a full advance refund.', `Package: ${q.pkgName}. Prices in BDT.`].forEach((t, i) => text(`- ${t}`, L, y + 6 + i * 5, { size: 8, color: '#64748b' }))
  const w = code128(b.id), total = w.reduce((a, c) => a + c, 0), bw = 62, k = bw / (total + 20), bx = 130
  let x = bx + 10 * k
  fill('#000000'); w.forEach((n, i) => { if (i % 2 === 0) doc.rect(x, y - 2, n * k, 20, 'F'); x += n * k })
  text(b.id, bx + bw / 2, y + 24, { size: 9, bold: true, align: 'center' }); text('Show this code at reception', bx + bw / 2, y + 28.5, { size: 7.5, color: '#64748b', align: 'center' })

  fill('#fdf4f4'); doc.rect(0, 280, 210, 17, 'F')
  text('Thank you for choosing Nikah Community Center.', L, 290, { size: 8, color: '#64748b' }); text('This is a computer-generated invoice.', R, 290, { size: 8, color: '#64748b', align: 'right' })
  doc.save(filename)
}

/* html2canvas snapshot of the styled invoice (see above). `inline` = style every element from a detached copy first. */
async function snapshotPdf(node, filename, inline) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  if (document.fonts?.ready) { try { await document.fonts.ready } catch {} }   // Poppins must be loaded before the snapshot
  const W_PX = 794
  let target = node, stage = null
  if (inline) {
    target = node.cloneNode(true)
    inlineStyles(node, target)
    stage = document.createElement('div')
    stage.setAttribute('aria-hidden', 'true')
    stage.style.cssText = `position:absolute;left:0;top:0;width:${W_PX}px;background:#fff;pointer-events:none;z-index:-1;`
    target.style.width = `${W_PX}px`; target.style.maxWidth = 'none'
    stage.appendChild(target); document.body.appendChild(stage)
  }
  try {
    await Promise.all([...target.querySelectorAll('img')].map(settled))
    const canvas = await html2canvas(target, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: W_PX, scrollX: 0, scrollY: 0 })
    if (!canvas.width || !canvas.height) throw new Error('empty canvas')
    const W = 210, H = 297
    const imgH = (canvas.height * W) / canvas.width
    const data = canvas.toDataURL('image/jpeg', 0.95)
    if (imgH <= H * 1.45) {
      // one A4 page: shrink to fit, so the barcode and totals are never cut in two
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
      const k = Math.min(1, H / imgH), w = W * k, h = imgH * k
      pdf.addImage(data, 'JPEG', (W - w) / 2, 0, w, h)
      pdf.save(filename)
    } else {
      // very long invoice: one tall page instead of cutting through the barcode
      const tall = new jsPDF({ unit: 'mm', format: [W, imgH], compress: true })
      tall.addImage(data, 'JPEG', 0, 0, W, imgH)
      tall.save(filename)
    }
  } finally { stage?.remove() }
}

const strings = (b) => { const { rows, q } = billRows(b); return [b.name, b.phone, b.email, b.eventType, q.pkgName, q.shiftLabel, q.shiftTime, q.menuName, ...rows.flatMap((r) => [r.label, r.note]), ...(b.payments || []).flatMap((p) => [p.method, p.reference])] }
const isLatin = (b) => { try { return !strings(b).some((t) => /[^\x20-\xFF\u09F3\u2013\u2014]/.test(String(t ?? ''))) } catch { return false } }

/* Phones draw text unreliably in an HTML screenshot (words run together, edges cut). So when everything on the invoice is Latin text
   the PDF is drawn directly (sharp, selectable, identical on every device). Bangla names need the screenshot route, which has fallbacks. */
/* Tries the styled snapshot first, then the plain one, then the drawn PDF, so a phone always gets a file. */
export async function downloadInvoicePdf(node, filename, booking) {
  const snaps = [() => snapshotPdf(node, filename, true), () => snapshotPdf(node, filename, false)]
  const drawn = booking ? [() => vectorInvoicePdf(booking, filename)] : []
  const tries = booking && isLatin(booking) ? [...drawn, ...snaps] : [...snaps, ...drawn]
  let err
  for (const t of tries) { try { await t(); return } catch (e) { err = e; console.warn('Invoice PDF attempt failed', e) } }
  throw err
}
