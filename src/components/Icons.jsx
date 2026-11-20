const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
export const HomeIcon = (p) => (<svg {...base} {...p}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>)
export const PieIcon = (p) => (<svg {...base} {...p}><path d="M21 12A9 9 0 1 1 12 3v9z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" /></svg>)
export const HistoryIcon = (p) => (<svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></svg>)
export const SearchIcon = (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>)
export const UserIcon = (p) => (<svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>)
export const ArrowRight = (p) => (<svg {...base} width={18} height={18} strokeWidth={2} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>)
export const ChevronLeft = (p) => (<svg {...base} strokeWidth={2} {...p}><path d="m15 18-6-6 6-6" /></svg>)
export const ChevronRight = (p) => (<svg {...base} strokeWidth={2} {...p}><path d="m9 18 6-6-6-6" /></svg>)
export const ChevronDown = (p) => (<svg {...base} strokeWidth={2} {...p}><path d="m6 9 6 6 6-6" /></svg>)
export const CheckCircle = (p) => (<svg {...base} width={18} height={18} strokeWidth={2} {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>)
export const Star = ({ fill = 1, ...p }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <defs><linearGradient id={`g${fill}`}><stop offset={`${fill * 100}%`} stopColor="#f59e0b" /><stop offset={`${fill * 100}%`} stopColor="#e2e8f0" /></linearGradient></defs>
    <path fill={`url(#g${fill})`} d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
)
export const CalendarIcon = (p) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>)
export const UsersIcon = (p) => (<svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6" /></svg>)
export const SnowIcon = (p) => (<svg {...base} {...p}><path d="M12 2v20M4.2 7l15.6 10M19.8 7 4.2 17M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" /></svg>)
export const CarIcon = (p) => (<svg {...base} {...p}><path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3z" /><circle cx="7.5" cy="16" r=".6" /><circle cx="16.5" cy="16" r=".6" /></svg>)
export const BoltIcon = (p) => (<svg {...base} {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>)
export const CrownIcon = (p) => (<svg {...base} {...p}><path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z" /></svg>)
export const UtensilsIcon = (p) => (<svg {...base} {...p}><path d="M6 3v8a2 2 0 0 0 2 2v8M10 3v8M6 7h4M17 21V3c-2.5 1.5-3.5 4-3.5 7 0 2 1 3 3.5 3" /></svg>)
export const PhoneIcon = (p) => (<svg {...base} {...p}><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" /></svg>)
export const MapPinIcon = (p) => (<svg {...base} {...p}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>)
export const ClockIcon = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>)
export const MailIcon = (p) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>)
export const CloseIcon = (p) => (<svg {...base} strokeWidth={2} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>)
export const CheckIcon = (p) => (<svg {...base} strokeWidth={2.4} {...p}><path d="m5 12 5 5 9-10" /></svg>)
export const PlusIcon = (p) => (<svg {...base} strokeWidth={2} {...p}><path d="M12 5v14M5 12h14" /></svg>)
export const MinusIcon = (p) => (<svg {...base} strokeWidth={2} {...p}><path d="M5 12h14" /></svg>)
export const DownloadIcon = (p) => (<svg {...base} {...p}><path d="M12 3v12m0 0-4-4m4 4 4-4M4 20h16" /></svg>)
export const ChatIcon = (p) => (<svg {...base} {...p}><path d="M4 5h16v11H9l-5 4z" /></svg>)
export const ICONS = { users: UsersIcon, snow: SnowIcon, car: CarIcon, bolt: BoltIcon, crown: CrownIcon, utensils: UtensilsIcon }
