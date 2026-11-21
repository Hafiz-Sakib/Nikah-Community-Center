import { useState } from 'react'

/* Google profile photo, falling back to initials. no-referrer is needed or Google images often fail to load. */
export default function Avatar({ user, size = 36, className = '' }) {
  const [bad, setBad] = useState(false)
  const initials = (user?.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return user?.avatar && !bad
    ? <img src={user.avatar} alt="" width={size} height={size} referrerPolicy="no-referrer" onError={() => setBad(true)}
        className={`rounded-full object-cover ${className}`} style={{ width: size, height: size }} />
    : <span className={`flex shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white ${className}`} style={{ width: size, height: size }}>{initials}</span>
}
