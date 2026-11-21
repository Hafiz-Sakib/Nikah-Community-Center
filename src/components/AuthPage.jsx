import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AuthCard } from '@/components/auth-card'
import { useAuth } from '../context/AuthContext'
import { img } from '../data'

/* One page for /login and /signup: the bridal photo on one side, the Motion Brew auth card on the other.
   The photo changes with the mode, so switching between sign in and sign up feels like turning a page. */
const SLIDES = ['auth-hands-henna.webp', 'auth-rings.webp', 'auth-hands-dark.webp']   // full-width, sharp photos that cross-fade slowly
const COPY = {
  signin: { line: 'Welcome back', sub: 'Your dates, bookings and invoices are waiting.' },
  signup: { line: 'Begin your story here', sub: 'One account to book a date, pay and download invoices.' },
}

const peek = () => { try { return sessionStorage.getItem('ncc.returnTo') || '/' } catch { return '/' } }
const take = () => { const to = peek(); try { sessionStorage.removeItem('ncc.returnTo') } catch {} return to }

export default function AuthPage() {
  const mode = useLocation().pathname.startsWith('/signup') ? 'signup' : 'signin'
  const { user, loading, signInGoogle, signInEmail, signUpEmail } = useAuth()
  const navigate = useNavigate()
  const reduce = !!useReducedMotion()
  const [hold, setHold] = useState(false)           // keep the page until the success animation has played
  const [sent, setSent] = useState(null)               // email awaiting confirmation
  const [slide, setSlide] = useState(0)
  useEffect(() => { if (reduce) return; const t = setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), 6500); return () => clearInterval(t) }, [reduce])
  if (!loading && user && !sent && !hold) return <Navigate to={peek()} replace />

  const photo = COPY[mode]

  const onSubmit = async (d) => {
    setHold(true)
    try { return await run(d) } catch (e) { setHold(false); throw e }
  }
  const run = async (d) => {
    if (d.mode === 'signup') {
      const { data, error } = await signUpEmail(d.email, d.password, d.name)
      if (error) throw error
      return { confirm: !data.session }                // email confirmation switched on
    }
    const { error } = await signInEmail(d.email, d.password)
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message)
    return {}
  }
  const onDone = (res, d) => { setHold(false); if (res?.confirm) setSent(d.email); else navigate(take(), { replace: true }) }

  return (
    <section className="pt-16">
      <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-ink">
        {/* bridal photo, full bleed behind everything */}
        <AnimatePresence initial={false}>
          <motion.img key={SLIDES[slide]} src={img(SLIDES[slide])} alt="" data-keep initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.6, ease: 'easeInOut' }} className="absolute inset-0 h-full w-full object-cover" />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/20 lg:bg-gradient-to-r lg:from-black/45 lg:via-black/10 lg:to-black/35" />

        <div className="container-x relative grid min-h-[calc(100svh-4rem)] grid-cols-1 content-center items-center gap-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-8 sm:py-10 lg:grid-cols-[1fr_26rem] lg:gap-16 lg:py-14 xl:grid-cols-[1fr_28rem]">
          {/* caption on the photo */}
          <div className="order-2 text-center text-white lg:order-1 lg:self-end lg:pb-4 lg:text-left [@media(max-height:520px)_and_(orientation:landscape)]:hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mode} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                <p className="text-xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">{photo.line}</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-white/80 sm:text-base lg:mx-0">{photo.sub}</p>
              </motion.div>
            </AnimatePresence>
            <p className="mt-3 text-xs text-white/60 sm:mt-5"><Link to="/" className="hover:text-white">Nikah Community Center</Link>, Chattogram</p>
          </div>

          <div className="order-1 flex w-full justify-center lg:order-2 lg:justify-end">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[26rem] rounded-[1.75rem] bg-surface p-6 text-center sm:rounded-[2rem] sm:p-7 shadow-dock ring-1 ring-slate-100">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-fg">Check your email</h2>
                  <p className="mt-2 text-sm text-slate-500">We sent a confirmation link to <b className="text-fg">{sent}</b>. Open it to finish creating your account, then sign in.</p>
                  <button type="button" onClick={() => { setSent(null); navigate('/login', { replace: true }) }} className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-surface transition active:scale-95">Go to sign in</button>
                </motion.div>
              ) : (
                <AuthCard key="card" mode={mode} onModeChange={(m) => navigate(m === 'signup' ? '/signup' : '/login', { replace: true })} onSubmit={onSubmit} onDone={onDone} onSocial={() => signInGoogle()} onForgot={() => navigate('/reset-password')} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
