import { useRef, useState } from 'react'
import { DownloadIcon, ClipboardIcon } from './Icons'
import { toast } from '../lib/store'
import { downloadInvoicePdf, invoiceNo } from '../lib/invoice'
import Invoice from './Invoice'

/* On screen the invoice is fluid: it re-flows for phone, tablet, laptop and TV instead of shrinking an A4 page.
   A fixed-size A4 copy sits off-screen and is what the PDF is made from, so the download is always crisp and identical on every device. */
export default function InvoiceView({ b }) {
  const full = useRef(null)
  const [busy, setBusy] = useState(false)
  const [pdf, setPdf] = useState(false)           // the A4 copy only exists while the PDF is being made
  const save = async () => {
    setBusy(true); setPdf(true)
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const imgs = [...(full.current?.querySelectorAll('img') ?? [])]
      await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r }))))
      await new Promise((r) => setTimeout(r, 60))   // let layout settle before the styles are read
      await downloadInvoicePdf(full.current, `${invoiceNo(b)}.pdf`, b); toast('Invoice downloaded')
    } catch (e) { console.error('Invoice PDF failed', e); toast('Could not create the PDF. Please try again.', 'error') }
    setPdf(false); setBusy(false)
  }
  const copyNo = async () => { try { await navigator.clipboard.writeText(invoiceNo(b)); toast('Invoice number copied') } catch { toast('Copy not available here', 'error') } }
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <p className="text-sm text-slate-500">Invoice <b className="tabular-nums text-fg">{invoiceNo(b)}</b></p>
        <div className="flex gap-2">
          <button type="button" onClick={copyNo} className="inline-flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-sm font-semibold text-fg ring-1 ring-slate-300 transition hover:ring-slate-400 active:scale-95"><ClipboardIcon width={16} height={16} />Copy no.</button>
          <button type="button" onClick={save} disabled={busy} className="btn-primary !h-10 !py-0 disabled:opacity-60"><DownloadIcon width={16} height={16} />{busy ? 'Preparing PDF…' : 'Download PDF'}</button>
        </div>
      </div>
      <div className="rounded-3xl bg-slate-100 p-2 ring-1 ring-slate-200 sm:p-6"><Invoice b={b} /></div>
      {pdf && <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}><Invoice ref={full} b={b} pdf /></div>}
    </div>
  )
}
