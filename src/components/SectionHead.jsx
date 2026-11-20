import Reveal from './Reveal'
export default function SectionHead({ eyebrow, title, text, className = '' }) {
  return (
    <div className={`mx-auto max-w-2xl text-center ${className}`}>
      {eyebrow && <Reveal><span className="inline-block rounded-full bg-brand-soft px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-dark">{eyebrow}</span></Reveal>}
      <Reveal delay={0.05}><h2 className="section-title mt-3">{title}</h2></Reveal>
      {text && <Reveal delay={0.1}><p className="mt-3 text-slate-500">{text}</p></Reveal>}
    </div>
  )
}
