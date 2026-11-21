const map = {
  pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-slate-200 text-slate-500',
  expired: 'bg-orange-100 text-orange-700', completed: 'bg-sky-100 text-sky-700', verified: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700',
}
export default function StatusPill({ status }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${map[status] ?? 'bg-slate-200 text-slate-500'}`}>{status}</span>
}
