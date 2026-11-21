import { useEffect, useState } from 'react'

/* Real profile photo (Google account) when there is one, otherwise a clean initials avatar.
   no-referrer is needed or Google images often fail to load; if the image errors we fall back to initials. */
const TONES = ['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-rose-600', 'bg-amber-600', 'bg-cyan-700', 'bg-fuchsia-600', 'bg-teal-600']
const tone = (s = '') => TONES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length]

export default function Avatar({ user, size = 36, className = '' }) {
  const [bad, setBad] = useState(false)
  const src = user?.avatar || null
  useEffect(() => { setBad(false) }, [src])
  const name = (user?.name || '').trim()
  const initials = (name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('') || '?').toUpperCase()
  return src && !bad
    ? <img src={src} alt="" width={size} height={size} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)}
        className={`shrink-0 rounded-full object-cover ring-2 ring-surface ${className}`} style={{ width: size, height: size }} />
    : <span aria-hidden className={`flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ring-2 ring-surface ${tone(name)} ${className}`} style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}>{initials}</span>
}
