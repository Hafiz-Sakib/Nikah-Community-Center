import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { toISO } from './store'

/* Live availability from the API: { 'YYYY-MM-DD': { morning, evening } } for booked days only.
   Default window = today .. +13 months (the calendar's range). takenSlots(iso, map) reads it. */
const defaultRange = () => {
  const a = new Date(), b = new Date(); b.setMonth(b.getMonth() + 13)
  return [toISO(a), toISO(b)]
}

export function useAvailability(fromISO, toISO_) {
  const [dflt] = useState(defaultRange)
  const from = fromISO ?? dflt[0], to = toISO_ ?? dflt[1]
  const [map, setMap] = useState({})
  const [loaded, setLoaded] = useState(false)
  const load = useCallback(() => api(`/availability?from=${from}&to=${to}`)
    .then((rows) => { setMap(Object.fromEntries(rows.map((r) => [r.date, { morning: r.morning, evening: r.evening }]))); setLoaded(true) })
    .catch(() => {}), [from, to])
  useEffect(() => { load() }, [load])
  return { map, reload: load, loaded }
}
