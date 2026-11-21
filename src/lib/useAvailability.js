import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { toISO } from './store'

/* Live availability from the API: { 'YYYY-MM-DD': { morning, evening } } for booked days only.
   Default window = today .. +13 months (the calendar's range). takenSlots(iso, map) reads it. */
const defaultRange = () => {
  const a = new Date(), b = new Date(); b.setMonth(b.getMonth() + 13)
  return [toISO(a), toISO(b)]
}

/* Several components on one page use this hook. They share ONE request per URL (and reuse it for 4 s),
   otherwise a burst of identical calls fills the browser's connection limit and a booking request waits behind them. */
const shared = new Map()   // url -> { at, promise }
function fetchShared(url, force) {
  const hit = shared.get(url)
  if (hit && (hit.pending || (!force && Date.now() - hit.at < 4000))) return hit.promise
  const entry = { at: Date.now(), pending: true }
  entry.promise = api(url).finally(() => { entry.pending = false; entry.at = Date.now() })
  shared.set(url, entry)
  return entry.promise
}

export function useAvailability(fromISO, toISO_) {
  const [dflt] = useState(defaultRange)
  const from = fromISO ?? dflt[0], to = toISO_ ?? dflt[1]
  const [map, setMap] = useState({})
  const [loaded, setLoaded] = useState(false)
  const url = `/availability?from=${from}&to=${to}`
  const load = useCallback((force = false) => fetchShared(url, force)
    .then((rows) => { setMap(Object.fromEntries(rows.map((r) => [r.date, { morning: r.morning, evening: r.evening }]))); setLoaded(true) })
    .catch(() => {}), [url])
  useEffect(() => { load() }, [load])
  /* Slots held or booked by other people must disappear without a page refresh: re-check every 30 s while the tab is visible and when it becomes visible again. */
  useEffect(() => {
    const tick = () => { if (!document.hidden) load() }
    const t = setInterval(tick, 30_000)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', tick) }
  }, [load])
  /* callers (after a booking / cancel) ask for a fresh copy */
  const reload = useCallback(() => load(true), [load])
  return { map, reload, loaded }
}
