import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Billing from '../components/Billing'
import { ChevronLeft } from '../components/Icons'
import { api } from '../lib/api'
import { useMyBookings } from '../lib/bookings'

/* Billing / pay screen as a normal page (/billing/:id), not a popup.
   Reached from My bookings ("Pay / billing") and straight after a new booking is submitted (state.fresh). */
export default function BillingPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { reload } = useMyBookings()
  const seed = state?.booking?.id === id ? state.booking : null
  const [b, setB] = useState(seed)
  const [err, setErr] = useState('')
  const fresh = !!(seed && state?.fresh)

  useEffect(() => {
    if (seed) return
    let live = true
    setB(null); setErr('')
    api(`/bookings/${encodeURIComponent(id)}`).then((x) => live && setB(x)).catch((e) => live && setErr(e.status === 404 ? 'We could not find that booking in your account.' : e.message))
    return () => { live = false }
  }, [id]) // eslint-disable-line

  const back = () => { reload(); navigate('/my-bookings') }

  return (
    <section className="min-h-[70vh] bg-gradient-to-b from-brand-soft/60 to-transparent pb-16 pt-24 sm:pt-28">
      <div className="container-wide max-w-[88rem] sm:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
          <button type="button" onClick={back} className="inline-flex items-center gap-1 rounded-full py-1 pr-2 font-medium text-brand-ink transition hover:underline"><ChevronLeft width={16} height={16} />My bookings</button>
          <span aria-hidden>/</span><span className="font-medium text-fg">Billing</span>{b && <span className="font-mono text-xs text-slate-400">{b.id}</span>}
        </nav>
        <div className="mb-5 sm:mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-4xl">{fresh ? 'Almost done: pay the advance' : 'Billing & payment'}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-500 sm:text-base">Review your bill, pay online and track verification. Your date is held while the advance is pending.</p>
        </div>
        {err ? (
          <div className="rounded-3xl bg-surface py-12 text-center shadow-card ring-1 ring-slate-200"><p className="text-sm text-red-500">{err}</p><div className="mt-5 flex justify-center gap-3"><button onClick={() => navigate('/my-bookings')} className="btn-primary">My bookings</button><Link to="/booking" className="rounded-full px-6 py-3 text-sm font-semibold text-brand-ink ring-1 ring-brand/40">Book a date</Link></div></div>
        ) : !b ? (
          <p className="py-16 text-center text-sm text-slate-500" role="status">Loading your bill…</p>
        ) : (
          <Billing key={b.id} b={b} fresh={fresh} page onManage={() => navigate('/my-bookings')} onNew={() => navigate('/booking')} onAdvanceDone={() => navigate('/my-bookings', { replace: true })} />
        )}
      </div>
    </section>
  )
}
