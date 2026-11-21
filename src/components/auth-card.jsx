/* Auth card, after Motion Brew "Auth card" (https://motion-brew.com/components/auth-card).
   Ported to JSX, themed with this site's tokens (day + night), trimmed to email + Google. */
import * as React from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { LogoMark } from './Logo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const EASE = [0.22, 1, 0.36, 1]

/* ---------- icons ---------- */
const Svg = ({ children, size = 18, ...p }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>{children}</svg>
)
const IcUser = (p) => <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.6-3.6 3.4-5.6 7-5.6s6.4 2 7 5.6" /></Svg>
const IcAt = (p) => <Svg {...p}><circle cx="12" cy="12" r="3.4" /><path d="M15.4 12v1.3a2.4 2.4 0 0 0 4.8 0V12a8.2 8.2 0 1 0-3.2 6.5" /></Svg>
const IcLock = (p) => <Svg {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2.6" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></Svg>
const IcLockOpen = (p) => <Svg {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2.6" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 6.6-1.6" /></Svg>
const IcEye = (p) => <Svg {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></Svg>
const IcEyeOff = (p) => <Svg {...p}><path d="M3 3l18 18" /><path d="M10.6 6a8.6 8.6 0 0 1 1.4-.5C18 5.5 21.5 12 21.5 12a17 17 0 0 1-2.9 3.7M6.4 7.6C3.9 9.3 2.5 12 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.6-.8" /><path d="M9.9 10a2.8 2.8 0 0 0 4 4" /></Svg>
const IcCheck = (p) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>
const IcAlert = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.2M12 16.3v.01" /></Svg>
const IcArrow = (p) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
const IcGoogle = (p) => (
  <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden {...p}>
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.7-.4-3.9z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" />
  </svg>
)

/* ---------- small pieces ---------- */
function Roll({ id, children, className = '', reduce, as: Tag = 'span' }) {
  // words roll up (or down) to their new text through a blur
  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={id}
          initial={reduce ? { opacity: 0 } : { y: '70%', opacity: 0, filter: 'blur(6px)' }}
          animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={reduce ? { opacity: 0 } : { y: '-70%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: reduce ? 0.01 : 0.42, ease: EASE }}
          className="block"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* The venue's own emblem (the couple under the sunburst) on a round seal.
   It pulses softly, a dashed ring turns slowly round it, and the disc turns over each time you switch between sign in and sign up. */
function Seal({ spin, reduce }) {
  return (
    <div className="relative grid h-[76px] w-[76px] place-items-center" style={{ perspective: 400 }}>
      {!reduce && [0, 1].map((i) => (
        <motion.span key={i} aria-hidden className="absolute inset-1 rounded-full ring-1 ring-brand/40"
          initial={{ scale: 0.85, opacity: 0.55 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 2.8, repeat: Infinity, delay: i * 1.4, ease: 'easeOut' }} />
      ))}
      <motion.svg aria-hidden viewBox="0 0 76 76" className="absolute inset-0 text-brand/60" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
        <circle cx="38" cy="38" r="36" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="1.5 6.5" strokeLinecap="round" />
      </motion.svg>
      <motion.div
        initial={reduce ? false : { scale: 0.4, opacity: 0, rotate: -25 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}>
        <motion.div animate={{ rotateY: reduce ? 0 : spin * 360 }} transition={{ duration: 0.8, ease: EASE }} whileHover={reduce ? undefined : { scale: 1.06 }}
          className="grid h-14 w-14 place-items-center rounded-full bg-surface shadow-md ring-1 ring-slate-200">
          <LogoMark size={40} />
        </motion.div>
      </motion.div>
    </div>
  )
}

/* Each block of the card rises into place one after another when the card first appears. */
const Rise = ({ i = 0, reduce, className = '', children }) => (
  <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.12 + i * 0.075 }}>{children}</motion.div>
)

function Spinner({ className = '' }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden />
}

function Dots() {
  return (
    <span className="inline-flex gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1 w-1 rounded-full bg-current" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }} />
      ))}
    </span>
  )
}

/* ---------- field ---------- */
function Field({ id, label, type = 'text', value, onChange, icon: Icon, autoComplete, error, errorId, shakeKey, reduce, validate, trailing, placeholder, required = true, inputRef }) {
  const [focused, setFocused] = React.useState(false)
  const [paused, setPaused] = React.useState(false)
  const [tip, setTip] = React.useState(false)
  const controls = useAnimationControls()
  React.useEffect(() => { if (error && shakeKey && !reduce) controls.start({ x: [0, -7, 6, -4, 2, 0], transition: { duration: 0.42 } }) }, [shakeKey]) // eslint-disable-line
  const filled = value.length > 0
  const ok = validate ? filled && validate(value) : false
  const malformed = validate ? filled && !validate(value) && paused : false

  React.useEffect(() => {                       // "once typing pauses on a malformed one"
    setPaused(false)
    if (!validate || !value) return
    const t = setTimeout(() => setPaused(true), 900)
    return () => clearTimeout(t)
  }, [value]) // eslint-disable-line

  const bad = !!error || malformed
  const surface = focused ? 'bg-surface' : filled ? 'bg-surface' : 'bg-slate-100'
  const ring = bad
    ? '0 0 0 1px rgb(239 68 68 / .55)'
    : focused ? '0 0 0 4px rgb(var(--s200) / .9), 0 0 0 1px rgb(var(--s300))'
    : filled ? '0 0 0 1.5px rgb(var(--s300))' : '0 0 0 0 rgb(var(--s200) / 0)'

  return (
    <motion.div animate={controls}>
      <label htmlFor={id} className="mb-1.5 ml-4 block text-xs font-medium text-slate-500">{label}</label>
      <div className={`relative flex h-12 items-center rounded-full transition-[background-color,box-shadow] duration-300 ${surface}`} style={{ boxShadow: ring }}>
        <motion.span
          className={`ml-4 flex shrink-0 items-center transition-colors ${focused ? 'text-fg' : 'text-slate-400'}`}
          animate={focused && !reduce ? { rotate: [0, -14, 10, 0], scale: [1, 1.18, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Icon />
        </motion.span>
        <input
          ref={inputRef}
          id={id} name={id} type={type} value={value} required={required} placeholder={placeholder}
          autoComplete={autoComplete} autoCapitalize="none" spellCheck={false}
          aria-invalid={bad || undefined} aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-fg outline-none placeholder:text-slate-400 sm:text-sm"
        />
        <div className="mr-3 flex shrink-0 items-center">
          {trailing}
          <AnimatePresence initial={false}>
            {ok && !bad && (
              <motion.span key="ok" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 520, damping: 18 }} className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white" aria-label="Valid email">
                <IcCheck size={14} strokeWidth={2.6} />
              </motion.span>
            )}
            {malformed && (
              <motion.span key="bad" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 520, damping: 20 }} className="relative flex h-6 w-6 items-center justify-center text-red-500" tabIndex={0}
                onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)} onFocus={() => setTip(true)} onBlur={() => setTip(false)} aria-describedby={`${id}-tip`}>
                <IcAlert size={20} />
                <AnimatePresence>
                  {tip && (
                    <motion.span id={`${id}-tip`} role="tooltip" initial={{ opacity: 0, y: 4, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.16 }} className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-max max-w-[min(15rem,70vw)] rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium leading-snug text-surface shadow-lg">
                      Enter a full email address like name@example.com
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* one light comet gliding once round the red edge (masked conic ring) */}
        <AnimatePresence>
          {malformed && !reduce && (
            <motion.span key="comet" aria-hidden initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 overflow-hidden rounded-full p-px" style={{ WebkitMask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)', maskComposite: 'exclude' }}>
              <motion.span className="absolute left-1/2 top-1/2 block aspect-square w-[260%]" style={{ x: '-50%', y: '-50%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgb(248 113 113 / .0) 305deg, rgb(248 113 113) 355deg, rgb(254 202 202) 360deg)' }}
                initial={{ rotate: 0, opacity: 1 }} animate={{ rotate: 360, opacity: [1, 1, 0] }} transition={{ duration: 1.7, ease: 'easeInOut', times: [0, 0.8, 1] }} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p id={errorId} role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0.01 : 0.28, ease: EASE }} className="overflow-hidden pl-4 text-xs text-red-500">
            <span className="block pt-1.5">{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ---------- password strength ---------- */
function strength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++
  return pw.length < 8 ? Math.min(s, 1) : Math.max(s, 1)
}
const SEG = ['#ef4444', '#f59e0b', '#84cc16', '#22c55e']
const WORDS = ['8+ chars', 'Weak', 'Fair', 'Good', 'Strong']

function Meter({ value, reduce }) {
  const s = strength(value)
  return (
    <div className="flex items-center gap-3 px-4 pt-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5" role="img" aria-label={`Password strength: ${WORDS[value ? s : 0]}`}>
        {SEG.map((c, i) => (
          <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
            <motion.span className="block h-full origin-left rounded-full" style={{ background: SEG[Math.max(s - 1, 0)] }} initial={false} animate={{ scaleX: value && i < s ? 1 : 0 }} transition={{ duration: reduce ? 0.01 : 0.35, ease: EASE, delay: reduce ? 0 : i * 0.04 }} />
          </span>
        ))}
      </div>
      <span className="w-14 text-right text-xs text-slate-500"><Roll id={value ? s : 0} reduce={reduce}>{WORDS[value ? s : 0]}</Roll></span>
    </div>
  )
}

/* ---------- the card ---------- */
export function AuthCard({
  mode: modeProp, defaultMode = 'signin', onModeChange,
  onSubmit, onSocial, onDone,
  forgotHref = '/reset-password', onForgot,
  className = '',
}) {
  const reduce = !!useReducedMotion()
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '')
  const [inner, setInner] = React.useState(defaultMode)
  const mode = modeProp ?? inner
  const signup = mode === 'signup'
  const [v, setV] = React.useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = React.useState({})
  const [formError, setFormError] = React.useState('')
  const [shakeKey, setShakeKey] = React.useState(0)
  const [show, setShow] = React.useState(false)
  const [status, setStatus] = React.useState('idle')      // idle | loading | done
  const [social, setSocial] = React.useState(null)
  const [spin, setSpin] = React.useState(0)                // brand mark turns a sixth per mode change
  const busy = status !== 'idle'

  const setField = (k) => (val) => { setV((s) => ({ ...s, [k]: val })); if (errors[k]) setErrors((e) => ({ ...e, [k]: '' })); setFormError('') }
  const switchMode = () => {
    if (busy) return
    const next = signup ? 'signin' : 'signup'
    setSpin((n) => n + 1); setErrors({}); setFormError('')
    onModeChange ? onModeChange(next) : setInner(next)
  }

  const validate = () => {
    const e = {}
    if (signup && v.name.trim().length < 2) e.name = 'Please tell us your name.'
    if (!v.email.trim()) e.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(v.email.trim())) e.email = 'That doesn’t look like a full email address.'
    if (!v.password) e.password = 'Enter your password.'
    else if (signup && v.password.length < 8) e.password = 'Use at least 8 characters.'
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (busy) return
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) { setShakeKey((k) => k + 1); return }
    setFormError(''); setStatus('loading')
    const details = { mode, name: v.name.trim(), email: v.email.trim(), password: v.password }
    try {
      const result = await onSubmit?.(details)
      setStatus('done')
      setTimeout(() => onDone?.(result, details), reduce ? 200 : 1100)
    } catch (err) {
      setStatus('idle'); setShakeKey((k) => k + 1)
      setFormError(err?.message || 'Something went wrong. Please try again.')
    }
  }

  const google = async () => {
    if (busy || social) return
    setSocial('google'); setFormError('')
    try { await onSocial?.('google') } catch (err) { setFormError(err?.message || 'Google sign in failed.') }
    setTimeout(() => setSocial(null), 6000)    // the OAuth redirect normally leaves the page first
  }

  const title = signup ? 'Create your account' : 'Welcome back'
  const line = signup ? 'It takes less than a minute.' : 'Sign in to pick up where you left off.'
  const cta = signup ? 'Create account' : 'Get started'

  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: EASE }} className={`w-full max-w-[26rem] rounded-[1.75rem] bg-surface p-5 shadow-dock ring-1 ring-slate-100 min-[400px]:p-6 sm:rounded-[2rem] sm:p-7 ${className}`}>
      {/* brand mark, title, line */}
      <div className="flex flex-col items-center text-center">
        <Seal spin={spin} reduce={reduce} />
        <Rise i={1} reduce={reduce}>
          <h2 className="mt-2 text-[1.4rem] sm:mt-3 sm:text-[1.55rem] font-semibold leading-tight tracking-tight text-fg"><Roll id={mode} reduce={reduce}>{title}</Roll></h2>
          <p className="mt-1 text-sm text-slate-500"><Roll id={mode} reduce={reduce}>{line}</Roll></p>
        </Rise>
      </div>

      <form onSubmit={submit} noValidate className="mt-5 sm:mt-6" aria-label={signup ? 'Create account' : 'Sign in'}>
        <div>
          <AnimatePresence initial={false}>
            {signup && (
              <motion.div key="name" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0.01 : 0.4, ease: EASE }} className="overflow-hidden">
                <div className="pb-3">
                  <Field id={`${uid}-name`} label="Name" value={v.name} onChange={setField('name')} icon={IcUser} autoComplete="name" error={errors.name} errorId={`${uid}-name-err`} shakeKey={shakeKey} reduce={reduce} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Rise i={2} reduce={reduce} className="pb-3"><Field id={`${uid}-email`} label="Email" type="email" value={v.email} onChange={setField('email')} icon={IcAt} autoComplete="email" error={errors.email} errorId={`${uid}-email-err`} shakeKey={shakeKey} reduce={reduce} validate={(x) => EMAIL_RE.test(x.trim())} /></Rise>
          <Rise i={3} reduce={reduce}>
          <Field
            id={`${uid}-password`} label="Password" type={show ? 'text' : 'password'} value={v.password} onChange={setField('password')} icon={IcLock}
            autoComplete={signup ? 'new-password' : 'current-password'} error={errors.password} errorId={`${uid}-password-err`} shakeKey={shakeKey} reduce={reduce}
            trailing={
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:text-fg">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={show ? 'off' : 'on'} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.14 }}>
                    {show ? <IcEyeOff /> : <IcEye />}
                  </motion.span>
                </AnimatePresence>
              </button>
            }
          />
          </Rise>
        </div>

        {/* forgot link (sign in) folds into the strength meter (sign up) */}
        <AnimatePresence initial={false} mode="wait">
          {signup ? (
            <motion.div key="meter" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0.01 : 0.35, ease: EASE }} className="overflow-hidden">
              <Meter value={v.password} reduce={reduce} />
            </motion.div>
          ) : (
            <motion.div key="forgot" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0.01 : 0.3, ease: EASE }} className="overflow-hidden">
              <div className="flex justify-end px-3 pt-3">
                <a href={forgotHref} onClick={(e) => { if (onForgot) { e.preventDefault(); onForgot() } }} className="group relative inline-block py-1.5 text-xs text-slate-600 transition hover:text-fg sm:text-xs">
                  Forgot password?
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {formError && (
            <motion.p role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-center text-xs text-red-500">
              <span className="block pt-3">{formError}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* submit */}
        <Rise i={4} reduce={reduce}>
        <motion.button
          type="submit" disabled={busy} aria-busy={status === 'loading'}
          whileTap={reduce || busy ? undefined : { scale: 0.97 }}
          className={`group relative mt-5 flex h-12 w-full items-center justify-center overflow-hidden rounded-full text-sm font-semibold transition-colors duration-500 ${status === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-surface'}`}
        >
          {status === 'loading' && !reduce && (
            <motion.span aria-hidden className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" initial={{ x: '-120%' }} animate={{ x: '420%' }} transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }} />
          )}
          {status === 'done' && !reduce && (
            <motion.span aria-hidden className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full border-2 border-white/70" style={{ x: '-50%', y: '-50%' }} initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 9, opacity: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
          )}
          <AnimatePresence mode="wait" initial={false}>
            {status === 'idle' && (
              <motion.span key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex items-center gap-2">
                <Roll id={mode} reduce={reduce}>{cta}</Roll>
                <span className="transition-transform duration-300 group-hover:translate-x-1"><IcArrow size={16} /></span>
              </motion.span>
            )}
            {status === 'loading' && (
              <motion.span key="loading" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex items-center gap-2.5">
                <Spinner />
                <span>{signup ? 'Creating your account' : 'Signing you in'}</span><Dots />
              </motion.span>
            )}
            {status === 'done' && (
              <motion.span key="done" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 420, damping: 18 }} className="flex items-center gap-2">
                {signup ? <IcCheck size={18} strokeWidth={2.4} /> : <IcLockOpen size={18} />}
                <span>{signup ? 'Account created' : 'Signed in'}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        </Rise>
      </form>

      <Rise i={5} reduce={reduce}>
      {/* divider */}
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400" role="separator">
        <motion.span className="h-px flex-1 origin-right bg-slate-200" initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, ease: EASE, delay: 0.2 }} />
        or continue with
        <motion.span className="h-px flex-1 origin-left bg-slate-200" initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, ease: EASE, delay: 0.2 }} />
      </div>

      <motion.button type="button" onClick={google} disabled={busy || !!social} whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.98 }} className="group flex h-12 w-full items-center justify-center gap-3 rounded-full bg-slate-100 text-sm font-semibold text-fg transition-[background-color,box-shadow] hover:bg-surface hover:shadow-card disabled:opacity-70">
        {social === 'google' ? <Spinner className="text-slate-500" /> : <span className="transition-transform duration-300 group-hover:[animation:wiggle_.5s_ease]"><IcGoogle /></span>}
        Continue with Google
      </motion.button>

      {/* bottom line */}
      <p className="mt-4 text-center text-sm text-slate-500 sm:mt-5">
        <Roll id={mode} reduce={reduce}>{signup ? 'Already have an account?' : 'Don’t have an account?'}</Roll>{' '}
        <button type="button" onClick={switchMode} className="font-semibold text-fg transition-opacity hover:opacity-60">
          <Roll id={mode} reduce={reduce}>{signup ? 'Sign in' : 'Sign up'}</Roll>
        </button>
      </p>
      </Rise>
      <style>{`@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}60%{transform:rotate(10deg)}}`}</style>
    </motion.div>
  )
}

export default AuthCard
