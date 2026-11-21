/* Status chip with a coloured dot and a ring, readable on both light and dark cards. */
const map = {
  pending: ['bg-amber-100 text-amber-800 ring-amber-300', 'bg-amber-500'],
  confirmed: ['bg-emerald-100 text-emerald-800 ring-emerald-300', 'bg-emerald-500'],
  cancelled: ['bg-red-50 text-red-700 ring-red-200', 'bg-red-500'],
  expired: ['bg-red-50 text-red-700 ring-red-200', 'bg-red-500'],
  completed: ['bg-sky-100 text-sky-800 ring-sky-300', 'bg-sky-500'],
  'in review': ['bg-sky-100 text-sky-800 ring-sky-300', 'bg-sky-500'],
  verified: ['bg-emerald-100 text-emerald-800 ring-emerald-300', 'bg-emerald-500'],
  rejected: ['bg-red-100 text-red-700 ring-red-300', 'bg-red-500'],
}
export default function StatusPill({ status }) {
  const [cls, dot] = map[status] ?? map.cancelled
  const label = status === 'expired' ? 'cancelled' : status
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset dark:!bg-white/10 dark:!ring-white/20 dark:!text-fg ${cls}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}</span>
}
