import { useRef, useState } from 'react'
import { DownloadIcon } from './Icons'
import { toast } from '../lib/store'
import { downloadInvoicePdf, invoiceNo } from '../lib/invoice'
import Invoice from './Invoice'

/* On screen the invoice is fluid: it re-flows for phone, tablet, laptop and TV instead of shrinking an A4 page.
   A fixed-size A4 copy sits off-screen and is what the PDF is made from, so the download is always crisp and identical on every device. */
export default function InvoiceView({ b }) {
  const full = useRef(null)
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try { await downloadInvoicePdf(full.current, `${invoiceNo(b)}.pdf`); toast('Invoice downloaded') }
    catch { toast('Could not create the PDF. Please try again.', 'error') }
    setBusy(false)
  }
  return (
    <div>
      <div className="rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200 sm:p-4"><Invoice b={b} /></div>
      <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}><Invoice ref={full} b={b} pdf /></div>
      <button onClick={save} disabled={busy} className="btn-primary mt-4 w-full disabled:opacity-60 sm:w-auto"><DownloadIcon width={18} height={18} />{busy ? 'Preparing PDF…' : 'Download invoice (PDF)'}</button>
    </div>
  )
}
