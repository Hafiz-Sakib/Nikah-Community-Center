import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center justify-center px-6 pt-24 text-center">
      <div><p className="text-7xl font-bold text-brand">404</p><h1 className="mt-3 text-2xl font-semibold text-ink">Page not found</h1><p className="mt-2 text-slate-500">The page you’re looking for doesn’t exist.</p><Link to="/" className="btn-primary mt-6">Back to home</Link></div>
    </section>
  )
}
