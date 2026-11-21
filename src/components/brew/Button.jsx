/* One button system for the whole app. Every variant has its own solid fill or a visible ring, so no button
   disappears into a card in day or night mode. `as` lets it render a Link or <a>. */
import { forwardRef } from 'react'

const VARIANTS = {
  primary: 'bg-brand text-white shadow-glow ring-1 ring-brand-dark/40 hover:bg-brand-dark',
  ink: 'bg-slate-900 text-page ring-1 ring-slate-900 hover:bg-slate-800',
  white: 'bg-white text-ink ring-1 ring-white shadow-lg hover:bg-slate-100',
  outline: 'bg-surface text-fg ring-1 ring-slate-300 hover:bg-slate-100 hover:ring-slate-400 dark:ring-slate-400 dark:hover:ring-slate-500',
  info: 'bg-sky-100 text-sky-800 ring-1 ring-sky-300 hover:bg-sky-200 dark:!bg-sky-400/15 dark:!text-sky-200 dark:!ring-sky-400/40',
  soft: 'bg-brand-soft text-brand-ink ring-1 ring-brand/40 hover:ring-brand',
  success: 'bg-emerald-600 text-white ring-1 ring-emerald-700/40 hover:bg-emerald-700',
  danger: 'bg-surface text-red-600 ring-1 ring-red-300 hover:bg-red-50 dark:text-red-300 dark:ring-red-400/50 dark:hover:bg-red-500/10',
  glass: 'bg-white/10 text-white ring-1 ring-white/50 backdrop-blur hover:bg-white/20 hover:ring-white/80',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-fg',
}
const SIZES = {
  sm: 'h-9 gap-1.5 px-3.5 text-[13px]',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-12 gap-2 px-7 text-[15px]',
  icon: 'h-10 w-10',
}

export const buttonClass = (variant = 'primary', size = 'md', extra = '') =>
  `inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`

const Button = forwardRef(function Button({ as: Tag = 'button', variant = 'primary', size = 'md', className = '', type, ...props }, ref) {
  const extra = Tag === 'button' ? { type: type ?? 'button' } : {}
  return <Tag ref={ref} {...extra} {...props} className={buttonClass(variant, size, className)} />
})
export default Button
