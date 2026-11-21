import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

// Where Supabase sends the user back after Google / email links. Defaults to the current origin;
// set VITE_SITE_URL (e.g. https://nikah-convention.vercel.app) to force it. Must be in Supabase > Auth > URL Configuration > Redirect URLs.
const SITE = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '')
const site = () => SITE || location.origin

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [me, setMe] = useState(undefined)          // undefined = not loaded yet, null = failed
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    // keep this callback sync and light: calling supabase.* inside it can deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {                                // role comes from our DB, not from the token
    if (!session) { setMe(undefined); return }
    let live = true
    setMe(undefined)
    api('/me').then((m) => live && setMe(m)).catch(() => live && setMe(null))
    return () => { live = false }
  }, [session?.user?.id])

  const u = session?.user
  const m = u?.user_metadata ?? {}
  const user = u && {
    id: u.id, email: u.email,
    name: m.full_name || m.name || u.email?.split('@')[0],
    avatar: m.avatar_url || m.picture || null,       // Google photo
  }

  const value = {
    user, session, loading, me,
    meReady: !session || me !== undefined,
    isAdmin: me?.role === 'admin',
    signInGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${site()}/auth/callback` } }),
    signInEmail: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUpEmail: (email, password, name) => supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${site()}/auth/callback` } }),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${site()}/reset-password` }),
    updatePassword: (password) => supabase.auth.updateUser({ password }),
    signOut: () => supabase.auth.signOut(),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
