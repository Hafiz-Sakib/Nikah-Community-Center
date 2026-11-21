import { code128 } from '../lib/code128'

/* Code 128 barcode as inline SVG (scannable; always black on white) */
export default function Barcode({ value, height = 64, className = '' }) {
  const w = code128(value)
  const total = w.reduce((a, b) => a + b, 0)
  const Q = 10 // quiet zone
  let x = Q
  const bars = w.map((n, i) => { const r = i % 2 === 0 ? <rect key={i} x={x} y="0" width={n} height={height} fill="#000" /> : null; x += n; return r })
  return (
    <svg role="img" aria-label={`Barcode ${value}`} viewBox={`0 0 ${total + Q * 2} ${height}`} preserveAspectRatio="none" className={className} style={{ width: '100%', height, background: '#fff', display: 'block' }} shapeRendering="crispEdges" data-keep>
      <rect width={total + Q * 2} height={height} fill="#fff" />{bars}
    </svg>
  )
}
