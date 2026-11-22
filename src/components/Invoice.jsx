import { forwardRef } from 'react'
import { CONTACT, img } from '../data'
import { fmtDate, money } from '../lib/store'
import { billRows, invoiceNo, paidOf } from '../lib/invoice'
import Barcode from './Barcode'
import { statusOf } from '../lib/bookings'

/* Printable invoice. Colours are fixed hex (not theme tokens) so it always looks the same, light or dark, on screen or in the PDF.
   Layout lives in index.css (.inv-*): on screen the paper is fluid and re-flows with container queries (phone, tablet, desktop, TV);
   `pdf` renders the fixed 794 px A4 layout used for the download. */
const Invoice = forwardRef(function Invoice({ b, pdf = false }, ref) {
  const { rows, q } = billRows(b)
  const paid = paidOf(b)
  const payList = (b.payments || []).filter((p) => p.status !== 'rejected')
  const waiting = payList.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const inReview = b.status === 'pending' && waiting > 0
  const full = q.total > 0 && paid >= q.total
  const status = b.status === 'cancelled' ? ['CANCELLED', '#b91c1c', '#fef2f2'] : b.status === 'expired' ? ['EXPIRED', '#9a3412', '#fff7ed'] : full && statusOf(b) === 'completed' ? ['EVENT COMPLETED', '#0369a1', '#f0f9ff'] : full ? ['PAID IN FULL', '#047857', '#ecfdf5'] : statusOf(b) === 'completed' ? ['COMPLETED', '#0369a1', '#f0f9ff'] : b.status === 'confirmed' ? ['CONFIRMED', '#047857', '#ecfdf5'] : inReview ? ['PAYMENT IN REVIEW', '#0369a1', '#f0f9ff'] : ['ADVANCE PENDING', '#b45309', '#fffbeb']
  const advanceDue = Math.max(0, q.advance - paid)
  const advanceSubmitted = advanceDue > 0 && waiting >= advanceDue
  const balance = Math.max(0, q.total - paid)
  const paidLabel = paid > q.advance ? 'Paid' : 'Advance paid'
  return (
    <div className="inv-wrap" style={pdf ? { width: 794 } : undefined}>
      <div ref={ref} className={`inv ${pdf ? 'inv-pdf' : ''}`}>
        <div className="inv-bar" />
        {full && b.status !== 'cancelled' && <div className="inv-stamp" style={{ color: '#047857' }}>PAID</div>}
        <div className="inv-head">
          <div className="inv-brand">
            <img data-keep src={img('logo-mark.png')} alt="" width={64} height={64} className="inv-logo" />
            <div>
              <div className="inv-name">Nikah Community Center</div>
              <div className="inv-addr">{CONTACT.address}<br />{CONTACT.phone} · {CONTACT.email}</div>
            </div>
          </div>
          <div className="inv-meta">
            <div className="inv-title">INVOICE</div>
            <div className="inv-line">No. <b>{invoiceNo(b)}</b></div>
            <div className="inv-line">Issued {fmtDate(b.createdAt.slice(0, 10))}</div>
            <div className="inv-chip" style={{ color: status[1], background: status[2] }}>{status[0]}</div>
          </div>
        </div>

        <div className="inv-info">
          <div className="inv-box">
            <div className="inv-label">Billed to</div>
            <div className="inv-big">{b.name}</div>
            <div className="inv-sub">{b.phone}{b.email ? <><br />{b.email}</> : null}</div>
          </div>
          <div className="inv-box">
            <div className="inv-label">Event</div>
            <div className="inv-big">{b.eventType} · {fmtDate(b.date, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="inv-sub">{q.shiftLabel} · {q.shiftTime}<br />{b.guests} guests · {q.menuName ? `Hall catering (${q.menuName})` : 'Own caterer'}</div>
          </div>
        </div>

        <div className="inv-sum">
          <div><div className="inv-label">Total bill</div><b>{money(q.total)}</b></div>
          <div><div className="inv-label">{paidLabel}</div><b style={{ color: '#047857' }}>{money(paid)}</b></div>
          <div><div className="inv-label">Remaining due bill</div><b style={{ color: balance === 0 ? '#047857' : '#b45309' }}>{money(balance)}</b></div>
        </div>

        <table className="inv-table">
          <thead><tr><th className="inv-num">#</th><th>Description</th><th className="inv-right">Amount</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="inv-num inv-mute">{i + 1}</td>
                <td><div className="inv-strong">{r.label}</div>{r.note && <div className="inv-note">{r.note}</div>}</td>
                <td className="inv-right inv-strong inv-nowrap">{money(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="inv-totals-row">
          <div className="inv-tot">
            <div className="inv-trow inv-big-row"><span>Total bill</span><b>{money(q.total)}</b></div>
            <div className="inv-trow inv-big-row"><span>{paidLabel}</span><b style={{ color: '#047857' }}>{money(paid)}</b></div>
            <div className="inv-adv"><span>Remaining due bill</span><span className="inv-nowrap">{money(balance)}</span></div>
            {(payList.length > 0 || waiting > 0 || advanceDue > 0) && (
              <div className="inv-notes">
                {payList.map((p) => (
                  <div key={p.id} className="inv-prow">
                    <span>{p.method}{p.reference ? ` · ${p.reference}` : ''} · {p.status === 'verified' ? 'received' : 'awaiting verification'}</span><span className="inv-nowrap">{money(p.amount)}</span>
                  </div>
                ))}
                {waiting > 0 && <div className="inv-prow"><span>Submitted, in review (not counted yet)</span><span className="inv-nowrap">{money(waiting)}</span></div>}
                {advanceDue > 0 && <div className="inv-prow"><span>Advance (30%) still due</span><span className="inv-nowrap">{money(advanceDue)}</span></div>}
              </div>
            )}
          </div>
        </div>

        <div className="inv-foot-grid">
          <div>
            <div className="inv-label">Terms</div>
            <ul className="inv-terms">
              <li>Date held for 48 hours; confirmed once the advance is verified.</li>
              <li>Cancel 14+ days before the event for a full advance refund.</li>
              <li>Package: {q.pkgName}. Prices in BDT.</li>
            </ul>
          </div>
          <div className="inv-code">
            <Barcode value={b.id} height={62} />
            <div className="inv-codeid">{b.id}</div>
            <div className="inv-codehint">Show this code at reception</div>
          </div>
        </div>

        <div className="inv-end"><span>Thank you for choosing Nikah Community Center.</span><span>This is a computer-generated invoice.</span></div>
      </div>
    </div>
  )
})
export default Invoice
