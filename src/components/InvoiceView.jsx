import { useEffect, useRef, useState } from 'react'
import { DownloadIcon } from './Icons'
import { toast } from '../lib/store'
import { downloadInvoicePdf, invoiceNo } from '../lib/invoice'
import Invoice from './Invoice'

/* Scaled-to-fit invoice preview + PDF download. A full-size copy sits off-screen so the PDF is always crisp.
   The preview is exactly as tall as the invoice (no empty paper), and on small phones it stays readable:
   it never shrinks below 62% and can be swiped sideways. */
const W = 794, MIN = 0.62

export default function InvoiceView({ b }) {
  const wrap = useRef(null), inner = useRef(null), full = useRef(null)
  const [scale, setScale] = useState(1)
  const [h, setH] = useState(800)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const el = wrap.current, box = inner.current; if (!el || !box) return
    const f = () => { setScale(Math.max(MIN, Math.min(1, el.clientWidth / W))); setH(box.offsetHeight) }
    f()
    const ro = new ResizeObserver(f); ro.observe(el); ro.observe(box)
    return () => ro.disconnect()
  }, [])
  const save = async () => {
    setBusy(true)
    try { await downloadInvoicePdf(full.current, `${invoiceNo(b)}.pdf`); toast('Invoice downloaded') }
    catch { toast('Could not create the PDF. Please try again.', 'error') }
    setBusy(false)
  }
  const wide = scale * W > (wrap.current?.clientWidth ?? W) + 1
  return (
    <div>
      <div ref={wrap} className="overflow-x-auto overflow-y-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
        <div style={{ height: h * scale, width: W * scale }}><div ref={inner} style={{ width: W, transform: `scale(${scale})`, transformOrigin: 'top left' }}><Invoice b={b} /></div></div>
      </div>
      {wide && <p className="mt-2 text-center text-xs text-slate-400">Swipe sideways to see the whole invoice, or download the PDF.</p>}
      <div aria-hidden style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}><Invoice ref={full} b={b} /></div>
      <button onClick={save} disabled={busy} className="btn-primary mt-4 w-full disabled:opacity-60 sm:w-auto"><DownloadIcon width={18} height={18} />{busy ? 'Preparing PDF…' : 'Download invoice (PDF)'}</button>
    </div>
  )
}
