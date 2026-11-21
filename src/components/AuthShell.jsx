import PageHero from './PageHero'

export const field = 'w-full rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-sm text-fg outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15'

export const GoogleG = (p) => (
  <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden {...p}>
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.7-.4-3.9z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" />
  </svg>
)

export default function AuthShell({ title, text, children }) {
  return (
    <>
      <PageHero title={title} text={text} image="hero-13.webp" />
      <section className="py-12 sm:py-16"><div className="container-x max-w-md"><div className="rounded-[2rem] bg-surface p-6 shadow-dock ring-1 ring-slate-100 sm:p-8">{children}</div></div></section>
    </>
  )
}
