import { marquee } from '../data'
export default function Marquee() {
  const items = [...marquee, ...marquee]
  return (
    <div className="overflow-hidden border-y border-slate-100 bg-white py-4 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap text-sm font-medium uppercase tracking-widest text-slate-400">{t}<span className="h-1.5 w-1.5 rounded-full bg-brand/60" /></span>
        ))}
      </div>
    </div>
  )
}
