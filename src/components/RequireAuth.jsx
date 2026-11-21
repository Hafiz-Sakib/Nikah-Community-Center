import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* <RequireAuth> = logged-in users. <RequireAuth admin> = admins (role comes from our DB via /api/me). */
export function RequireAuth({ children, admin }) {
  const { user, isAdmin, loading, meReady } = useAuth()
  const loc = useLocation()
  if (loading || (user && admin && !meReady)) return <div className="py-40 text-center text-slate-500">Loading…</div>
  if (!user) {
    try { sessionStorage.setItem('ncc.returnTo', loc.pathname + loc.search) } catch {}
    return <Navigate to="/login" replace />
  }
  if (admin && !isAdmin) return <Navigate to="/" replace />
  return children
}
export const RequireAdmin = ({ children }) => <RequireAuth admin>{children}</RequireAuth>
export default RequireAuth
