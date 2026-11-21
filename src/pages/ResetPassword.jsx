import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../lib/store'
import AuthShell, { field } from '../components/AuthShell'

/* No session: ask for the email. Session (arrived from the emailed recovery link): choose a new password. */
export default function ResetPassword() {
  const { user, loading, resetPassword, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [v, setV] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  if (loading) return <div className="py-40 text-center text-slate-500">Loading…</div>

  const ask = async (e) => {
    e.preventDefault(); setBusy(true)
    const { error } = await resetPassword(v.trim()); setBusy(false)
    if (error) toast(error.message, 'error'); else setSent(true)
  }
  const save = async (e) => {
    e.preventDefault()
    if (v.length < 8) { toast('Password must be at least 8 characters', 'error'); return }
    setBusy(true)
    const { error } = await updatePassword(v); setBusy(false)
    if (error) toast(error.message, 'error'); else { toast('Password updated'); navigate('/', { replace: true }) }
  }
  if (user) return (
    <AuthShell title="New password" text="Choose a new password for your account.">
      <form onSubmit={save} className="space-y-3">
        <input className={field} type="password" required placeholder="New password (min 8 characters)" autoComplete="new-password" value={v} onChange={(e) => setV(e.target.value)} />
        <button disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? 'Saving…' : 'Update password'}</button>
      </form>
    </AuthShell>
  )
  return (
    <AuthShell title="Reset password" text="We will email you a link to choose a new one.">
      {sent ? <p className="text-center text-sm text-slate-600">If an account exists for <b className="text-fg">{v}</b>, a reset link is on its way.</p> : (
        <form onSubmit={ask} className="space-y-3">
          <input className={field} type="email" required placeholder="Email" autoComplete="email" value={v} onChange={(e) => setV(e.target.value)} />
          <button disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
      <p className="mt-4 text-center text-sm"><Link to="/login" className="font-medium text-brand hover:underline">Back to log in</Link></p>
    </AuthShell>
  )
}
