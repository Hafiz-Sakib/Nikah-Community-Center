const map = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-slate-200 text-slate-500' }
export default function StatusPill({ status }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[status]}`}>{status}</span>
}
