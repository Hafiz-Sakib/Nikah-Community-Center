import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* Google / email-confirmation links land here; wait for the session, then go back where the user was. */
export default function AuthCallback() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const go = () => { let to = '/'; try { to = sessionStorage.getItem('ncc.returnTo') || '/'; sessionStorage.removeItem('ncc.returnTo') } catch {} navigate(to, { replace: true }) }
  useEffect(() => { if (user) go() }, [user]) // eslint-disable-line
  useEffect(() => {
    if (loading || user) return
    const t = setTimeout(() => navigate('/login', { replace: true }), 8000)   // no session after 8 s -> give up
    return () => clearTimeout(t)
  }, [loading, user, navigate])
  return <div className="py-40 text-center text-slate-500" role="status">Signing you in…</div>
}
