import { useEffect, useRef, useState } from 'react'
import { DownloadIcon } from './Icons'
import { toast } from '../lib/store'
import { downloadInvoicePdf, invoiceNo } from '../lib/invoice'
import Invoice from './Invoice'

/* Scaled-to-fit invoice preview + PDF download. A full-size copy sits off-screen so the PDF is always crisp. */
export default function InvoiceView({ b }) {
  const wrap = useRef(null), full = useRef(null)
  const [scale, setScale] = useState(1)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const el = wrap.current; if (!el) return
    const f = () => setScale(Math.min(1, el.clientWidth / 794)); f()
    const ro = new ResizeObserver(f); ro.observe(el); return () => ro.disconnect()
  }, [])
  const save = async () => {
    setBusy(true)
    try { await downloadInvoicePdf(full.current, `${invoiceNo(b)}.pdf`); toast('Invoice downloaded') }
    catch { toast('Could not create the PDF. Please try again.', 'error') }
    setBusy(false)
  }
  return (
    <div>
      <div ref={wrap} className="overflow-hidden rounded-2xl bg-slate-100 p-0 ring-1 ring-slate-200 sm:p-0">
        <div style={{ height: 1123 * scale }}><div style={{ width: 794, transform: `scale(${scale})`, transformOrigin: 'top left' }}><Invoice b={b} /></div></div>
      </div>
      <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}><Invoice ref={full} b={b} /></div>
      <button onClick={save} disabled={busy} className="btn-primary mt-4 w-full disabled:opacity-60 sm:w-auto"><DownloadIcon width={18} height={18} />{busy ? 'Preparing PDF…' : 'Download invoice (PDF)'}</button>
    </div>
  )
}
