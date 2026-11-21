import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api'
import { useAuth } from '../context/AuthContext'

/* The logged-in user's own bookings, shared by Navbar badge, My bookings and Billing. */
const Ctx = createContext({ bookings: [], loading: false, reload: async () => {} })
export const useMyBookings = () => useContext(Ctx)

export function BookingsProvider({ children }) {
  const { user } = useAuth()
  const uid = user?.id
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!uid) { setBookings([]); return [] }
    setLoading(true)
    try { const rows = await api('/bookings'); setBookings(rows); setError(''); return rows }
    catch (e) { setError(e.message); return [] }
    finally { setLoading(false) }
  }, [uid])

  useEffect(() => { reload() }, [reload])
  return createElement(Ctx.Provider, { value: { bookings, loading, error, reload } }, children)
}

export const isActive = (b) => b.status === 'pending' || b.status === 'confirmed'

/* A payment the customer has submitted (any transaction ID) is counted as paid for now and waits for staff to verify it. */
export const hasReview = (b) => !!b.payments?.some((p) => p.status === 'pending')
export const reviewAmount = (b) => (b.payments || []).filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
/* Status to show people: a pending booking whose payment is in review reads "in review", not "pending". */
export const shownStatus = (b) => (b.status === 'pending' && hasReview(b) ? 'in review' : b.status === 'expired' ? 'cancelled' : b.status)
/* An unpaid booking whose time ran out is kept in the list as Cancelled (never deleted). */
export const autoCancelled = (b) => b.status === 'expired'
