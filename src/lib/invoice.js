import { fmtDate } from './store'

export const invoiceNo = (b) => b.invoiceNo || 'INV-' + b.id.replace(/^NCC-/, '')

/* Everything on the bill/invoice comes from the booking's price snapshot (saved by the server at booking time),
   so changing a package price later never rewrites an old invoice. */
export const billQuote = (b) => b.priceSnapshot
export const paidOf = (b) => (b.payments ? b.payments.filter((p) => p.status === 'verified').reduce((s, p) => s + p.amount, 0) : b.paidAmount || 0)

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
   Up to ~12% taller than one page is shrunk to fit on a single page; anything longer continues on extra pages. */
export async function downloadInvoicePdf(node, filename) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  if (document.fonts?.ready) { try { await document.fonts.ready } catch {} }   // Poppins must be loaded before the snapshot
  const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: 794 })
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const W = 210, H = 297
  const imgH = (canvas.height * W) / canvas.width
  if (imgH <= H * 1.12) {
    const k = Math.min(1, H / imgH), w = W * k, h = imgH * k
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', (W - w) / 2, 0, w, h)
  } else {
    const pagePx = Math.floor((canvas.width * H) / W)
    for (let y = 0, n = 0; y < canvas.height; y += pagePx, n++) {
      const part = document.createElement('canvas'); part.width = canvas.width; part.height = Math.min(pagePx, canvas.height - y)
      const ctx = part.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, part.width, part.height)
      ctx.drawImage(canvas, 0, y, canvas.width, part.height, 0, 0, canvas.width, part.height)
      if (n) pdf.addPage()
      pdf.addImage(part.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, W, (part.height * W) / canvas.width)
    }
  }
  pdf.save(filename)
}
