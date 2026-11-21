import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../lib/store'
import AuthShell, { field, GoogleG } from '../components/AuthShell'

export default function Login() {
  const { user, loading, signInGoogle, signInEmail } = useAuth()
  const navigate = useNavigate()
  const [f, setF] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const peek = () => { try { return sessionStorage.getItem('ncc.returnTo') || '/' } catch { return '/' } }
  const take = () => { const to = peek(); try { sessionStorage.removeItem('ncc.returnTo') } catch {} return to }
  if (!loading && user) return <Navigate to={peek()} replace />

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    const { error } = await signInEmail(f.email.trim(), f.password)
    setBusy(false)
    if (error) toast(error.message === 'Invalid login credentials' ? 'Wrong email or password' : error.message, 'error')
    else navigate(take(), { replace: true })
  }
  return (
    <AuthShell title="Log in" text="Log in to book a date and manage your bookings.">
      <button type="button" onClick={() => signInGoogle()} className="flex w-full items-center justify-center gap-3 rounded-full bg-surface px-5 py-3 text-sm font-semibold text-fg ring-1 ring-slate-300 transition hover:bg-slate-50 active:scale-95"><GoogleG />Continue with Google</button>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or with email<span className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={submit} className="space-y-3">
        <input className={field} type="email" required placeholder="Email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={field} type="password" required placeholder="Password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? 'Signing in…' : 'Log in'}</button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm"><Link to="/reset-password" className="font-medium text-brand hover:underline">Forgot password?</Link><Link to="/signup" className="font-medium text-brand hover:underline">Create account</Link></div>
    </AuthShell>
  )
}
