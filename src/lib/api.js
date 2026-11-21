import { supabase } from './supabase'
import { toast } from './store'

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')
let lastWake = 0

async function send(path, method, body, token) {
  return fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  })
}

/* fetch wrapper: adds the Supabase JWT, retries once after a 401 with a refreshed session,
   and shows a "waking up" hint when a free-tier server cold-starts (> 3 s). */
export async function api(path, { method = 'GET', body } = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const wake = setTimeout(() => {
    if (Date.now() - lastWake > 60_000) { lastWake = Date.now(); toast('Waking up the server… this can take up to a minute') }
  }, 3000)
  try {
    let res = await send(path, method, body, session?.access_token)
    if (res.status === 401 && session) {
      const { data } = await supabase.auth.refreshSession()
      if (data.session) res = await send(path, method, body, data.session.access_token)
      if (res.status === 401) await supabase.auth.signOut()          // session truly gone -> login again
    }
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(json.error || 'Request failed'), { status: res.status, details: json.details })
    return json
  } catch (e) {
    if (e.status) throw e
    throw Object.assign(new Error('Cannot reach the server. Please try again.'), { status: 0 })
  } finally { clearTimeout(wake) }
}
