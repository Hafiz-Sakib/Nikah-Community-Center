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
