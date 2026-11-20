import { motion } from 'framer-motion'
import { CONTACT } from '../data'
import { PhoneIcon, MapPinIcon, ClockIcon, MailIcon, ChatIcon } from './Icons'
import Reveal from './Reveal'

const items = [
  { Icon: PhoneIcon, label: 'Call us', value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/[^+\d]/g, '')}` },
  { Icon: ChatIcon, label: 'WhatsApp', value: 'Chat with our team', href: `https://wa.me/${CONTACT.whatsapp}` },
  { Icon: MailIcon, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { Icon: MapPinIcon, label: 'Visit', value: CONTACT.address, href: CONTACT.mapsUrl },
  { Icon: ClockIcon, label: 'Office hours', value: CONTACT.hours },
]

export default function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-24">
      <div className="container-x">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-60px' }} transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-brand-dark px-6 py-12 text-white sm:px-12 sm:py-16">
          <motion.div aria-hidden animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <motion.div aria-hidden animate={{ x: [0, -25, 0], y: [0, 25, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">Let’s plan your event</h2>
              <p className="mt-3 max-w-md text-white/85">Prefer to talk first? Our team is happy to show you around the hall and walk through packages.</p>
              <a href="#booking" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand shadow-xl transition hover:scale-105 active:scale-95">Book online</a>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map(({ Icon, label, value, href }, i) => {
                const C = href ? 'a' : 'div'
                return (
                  <Reveal key={label} delay={i * 0.06} y={16} className={i === 3 ? 'sm:col-span-2' : ''}>
                    <C {...(href ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: 'noreferrer' } : {})} className="flex items-center gap-3 rounded-2xl bg-white/12 p-4 backdrop-blur transition hover:bg-white/20">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20"><Icon width={20} height={20} /></span>
                      <span className="min-w-0"><span className="block text-xs text-white/70">{label}</span><span className="block truncate text-sm font-medium">{value}</span></span>
                    </C>
                  </Reveal>
                )
              })}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
