import { useState } from 'react'
import { motion } from 'motion/react'
import { CONTACT } from '../data'
import { PhoneIcon, MapPinIcon, ClockIcon, MailIcon, ChatIcon, SendIcon } from './Icons'
import Reveal from './Reveal'

const items = [
  { Icon: PhoneIcon, label: 'Call us', value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/[^+\d]/g, '')}` },
  { Icon: ChatIcon, label: 'WhatsApp', value: 'Chat with our team', href: `https://wa.me/${CONTACT.whatsapp}` },
  { Icon: MailIcon, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { Icon: MapPinIcon, label: 'Visit us', value: CONTACT.address, href: CONTACT.mapsUrl },
  { Icon: ClockIcon, label: 'Office hours', value: CONTACT.hours },
]
const input = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15'

export default function ContactInfo() {
  const [f, setF] = useState({ name: '', phone: '', msg: '' })
  const ok = f.name.trim() && f.msg.trim()
  const send = (e) => {
    e.preventDefault()
    if (!ok) return
    const text = encodeURIComponent(`Hello! I'm ${f.name.trim()}${f.phone ? ` (${f.phone.trim()})` : ''}.\n${f.msg.trim()}`)
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${text}`, '_blank', 'noopener')
  }
  return (
    <section className="py-12 sm:py-20">
      <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {items.map(({ Icon, label, value, href }, i) => {
            const C = href ? 'a' : 'div'
            return (
              <Reveal key={label} delay={i * 0.06} y={18}>
                <C {...(href ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: 'noreferrer' } : {})} className="group flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200/80 transition hover:shadow-dock">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white"><Icon /></span>
                  <span className="min-w-0"><span className="block text-xs text-slate-400">{label}</span><span className="block break-words font-medium text-ink">{value}</span></span>
                </C>
              </Reveal>
            )
          })}
        </ul>
        <Reveal y={24}>
          <form onSubmit={send} className="rounded-[2rem] bg-white p-6 shadow-dock ring-1 ring-slate-100 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">Send us a message</h2>
            <p className="mt-1 text-sm text-slate-500">Your message opens in WhatsApp so our team can reply right away.</p>
            <div className="mt-6 space-y-4">
              <input className={input} placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
              <input className={input} placeholder="Mobile number (optional)" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" />
              <textarea className={input} rows={5} placeholder="How can we help? Date, event type, number of guests…" value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} />
            </div>
            <motion.button whileTap={{ scale: 0.97 }} disabled={!ok} className="btn-primary mt-6 w-full disabled:opacity-50"><SendIcon width={18} height={18} />Send via WhatsApp</motion.button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
