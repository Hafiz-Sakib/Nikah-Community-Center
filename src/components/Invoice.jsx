import { forwardRef } from 'react'
import { CONTACT, img } from '../data'
import { fmtDate, money } from '../lib/store'
import { billRows, invoiceNo, paidOf } from '../lib/invoice'
import Barcode from './Barcode'

/* Printable invoice. Colours are fixed hex (not theme tokens) so it always looks the same, light or dark, on screen or in the PDF. */
const C = { ink: '#0f172a', mute: '#64748b', line: '#e2e8f0', maroon: '#6f0202', soft: '#fdf4f4', paper: '#ffffff' }
const S = {
  label: { fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mute, fontWeight: 600 },
  th: { fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.mute, fontWeight: 600, padding: '10px 12px', textAlign: 'left', borderBottom: `1px solid ${C.line}` },
  td: { padding: '12px', fontSize: 13, color: C.ink, borderBottom: `1px solid ${C.line}`, verticalAlign: 'top' },
}

const Invoice = forwardRef(function Invoice({ b }, ref) {
  const { rows, q } = billRows(b)
  const paid = paidOf(b)
  const payList = (b.payments || []).filter((p) => p.status !== 'rejected')
  const status = b.status === 'cancelled' ? ['CANCELLED', '#b91c1c', '#fef2f2'] : b.status === 'expired' ? ['EXPIRED', '#9a3412', '#fff7ed'] : b.status === 'completed' ? ['COMPLETED', '#0369a1', '#f0f9ff'] : b.status === 'confirmed' ? ['CONFIRMED', '#047857', '#ecfdf5'] : ['ADVANCE PENDING', '#b45309', '#fffbeb']
  const advanceDue = Math.max(0, q.advance - paid)
  const balance = q.total - paid
  return (
    <div ref={ref} style={{ width: 794, background: C.paper, color: C.ink, fontFamily: 'Poppins, system-ui, sans-serif', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ height: 10, background: `linear-gradient(90deg, ${C.maroon}, #b3261e 60%, #d4a017)` }} />
      <div style={{ padding: '36px 48px 0', display: 'flex', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <img data-keep src={img('logo-mark.png')} alt="" width={64} height={64} style={{ display: 'block' }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.maroon, lineHeight: 1.15 }}>Nikah Community Center</div>
            <div style={{ fontSize: 11, color: C.mute, marginTop: 4, lineHeight: 1.5 }}>{CONTACT.address}<br />{CONTACT.phone} · {CONTACT.email}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.08em', color: C.ink, lineHeight: 1 }}>INVOICE</div>
          <div style={{ fontSize: 12, color: C.mute, marginTop: 8 }}>No. <b style={{ color: C.ink }}>{invoiceNo(b)}</b></div>
          <div style={{ fontSize: 12, color: C.mute }}>Issued {fmtDate(b.createdAt.slice(0, 10))}</div>
          <div style={{ display: 'inline-block', marginTop: 8, padding: '4px 12px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: status[1], background: status[2] }}>{status[0]}</div>
        </div>
      </div>

      <div style={{ margin: '28px 48px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: C.soft, borderRadius: 16, padding: '16px 18px' }}>
          <div style={S.label}>Billed to</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{b.name}</div>
          <div style={{ fontSize: 12, color: C.mute, marginTop: 2, lineHeight: 1.6 }}>{b.phone}{b.email ? <><br />{b.email}</> : null}</div>
        </div>
        <div style={{ background: C.soft, borderRadius: 16, padding: '16px 18px' }}>
          <div style={S.label}>Event</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{b.eventType} · {fmtDate(b.date, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div style={{ fontSize: 12, color: C.mute, marginTop: 2, lineHeight: 1.6 }}>{q.shiftLabel} · {q.shiftTime}<br />{b.guests} guests · {q.menuName ? `Hall catering (${q.menuName})` : 'Own caterer'}</div>
        </div>
      </div>

      <table style={{ width: 'calc(100% - 96px)', margin: '26px 48px 0', borderCollapse: 'collapse' }}>
        <thead><tr><th style={{ ...S.th, width: 36 }}>#</th><th style={S.th}>Description</th><th style={{ ...S.th, textAlign: 'right' }}>Amount</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td style={{ ...S.td, color: C.mute }}>{i + 1}</td>
              <td style={S.td}><div style={{ fontWeight: 600 }}>{r.label}</div>{r.note && <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>{r.note}</div>}</td>
              <td style={{ ...S.td, textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>{money(r.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ margin: '18px 48px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 320 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}><span style={{ color: C.mute }}>Total</span><b>{money(q.total)}</b></div>
          {payList.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11, color: C.mute }}>
              <span>Payment · {p.method}{p.reference ? ` · ${p.reference}` : ''} · {p.status === 'verified' ? 'received' : 'awaiting verification'}</span><span>{money(p.amount)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}><span style={{ color: C.mute }}>Paid</span><b style={{ color: '#047857' }}>{money(paid)}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: C.maroon, color: '#fff', fontSize: 14, fontWeight: 600 }}><span>{advanceDue > 0 ? 'Advance due (30%)' : 'Advance (30%) received'}</span><span>{money(advanceDue > 0 ? advanceDue : q.advance)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 4px 0', fontSize: 12, color: C.mute }}><span>Balance, payable before the event</span><b style={{ color: C.ink }}>{money(balance)}</b></div>
        </div>
      </div>

      <div style={{ margin: '24px 48px 0', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28, alignItems: 'end' }}>
        <div>
          <div style={S.label}>Terms</div>
          <ul style={{ margin: '8px 0 0', padding: '0 0 0 16px', fontSize: 11, color: C.mute, lineHeight: 1.7 }}>
            <li>The date is held for 3 days; it is confirmed when the advance is received, otherwise the booking is cancelled automatically.</li>
            <li>Cancel 14+ days before the event for a full advance refund. Within 14 days the advance is kept as a booking fee.</li>
            <li>Quote &amp; package: {q.pkgName}. Prices in Bangladeshi Taka (BDT).</li>
          </ul>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Barcode value={b.id} height={62} />
          <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13, letterSpacing: '0.2em', marginTop: 6, fontWeight: 600 }}>{b.id}</div>
          <div style={{ fontSize: 10, color: C.mute, marginTop: 2 }}>Show this code at reception</div>
        </div>
      </div>

      <div style={{ marginTop: 28, padding: '14px 48px', background: C.soft, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.mute }}>
        <span>Thank you for choosing Nikah Community Center.</span><span>This is a computer-generated invoice.</span>
      </div>
    </div>
  )
})
export default Invoice
