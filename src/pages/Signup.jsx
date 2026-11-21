import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../lib/store'
import AuthShell, { field, GoogleG } from '../components/AuthShell'

export default function Signup() {
  const { user, loading, signInGoogle, signUpEmail } = useAuth()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  if (!loading && user) { let to = '/'; try { to = sessionStorage.getItem('ncc.returnTo') || '/' } catch {} return <Navigate to={to} replace /> }

  const submit = async (e) => {
    e.preventDefault()
    if (f.password.length < 8) { toast('Password must be at least 8 characters', 'error'); return }
    setBusy(true)
    const { data, error } = await signUpEmail(f.email.trim(), f.password, f.name.trim())
    setBusy(false)
    if (error) toast(error.message, 'error')
    else if (!data.session) setSent(true)           // email confirmation is switched on
  }
  if (sent) return (
    <AuthShell title="Check your email">
      <p className="text-center text-sm text-slate-600">We sent a confirmation link to <b className="text-fg">{f.email}</b>. Open it to finish creating your account, then log in.</p>
      <Link to="/login" className="btn-primary mt-6 w-full">Go to log in</Link>
    </AuthShell>
  )
  return (
    <AuthShell title="Create account" text="One account to book dates, pay and download invoices.">
      <button type="button" onClick={() => signInGoogle()} className="flex w-full items-center justify-center gap-3 rounded-full bg-surface px-5 py-3 text-sm font-semibold text-fg ring-1 ring-slate-300 transition hover:bg-slate-50 active:scale-95"><GoogleG />Sign up with Google</button>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or with email<span className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={submit} className="space-y-3">
        <input className={field} required minLength={2} placeholder="Full name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={field} type="email" required placeholder="Email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={field} type="password" required placeholder="Password (min 8 characters)" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-medium text-brand hover:underline">Log in</Link></p>
    </AuthShell>
  )
}
