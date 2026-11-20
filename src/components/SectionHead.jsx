import Reveal from './Reveal'
import { BlurText } from './ui'
export default function SectionHead({ eyebrow, title, text, className = '' }) {
  return (
    <div className={`mx-auto max-w-2xl text-center ${className}`}>
      {eyebrow && <Reveal><span className="inline-block rounded-full bg-brand-soft px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-ink">{eyebrow}</span></Reveal>}
      <BlurText as="h2" text={title} className="section-title mt-3 block" />
      {text && <Reveal delay={0.1}><p className="mt-3 text-slate-500">{text}</p></Reveal>}
    </div>
  )
}
