import { Link } from 'react-router-dom'
import { CONTACT } from '../data'
import { SHIFTS } from '../lib/store'
import { CalendarIcon, StackIcon, UtensilsIcon, WalletIcon, ClockIcon, CheckIcon, WhatsAppIcon, PhoneIcon, ArrowRight } from './Icons'
import Reveal from './Reveal'
import SectionHead from './SectionHead'

/* Where most people need to go after saying hello. Each card is a real page of the site. */
const TOPICS = [
  { Icon: CalendarIcon, title: 'Plan an event', text: 'Pick a date and shift, see the price at once and hold your date.', to: '/booking', cta: 'Check dates' },
  { Icon: StackIcon, title: 'Packages & prices', text: 'Compare hall packages side by side before you decide.', to: '/packages', cta: 'See packages' },
  { Icon: UtensilsIcon, title: 'Catering & menus', text: 'Browse the hall menus and price per guest.', to: '/food', cta: 'See menus' },
  { Icon: WalletIcon, title: 'Already booked?', text: 'Pay your advance, send a transaction ID or download your invoice.', to: '/my-bookings', cta: 'My bookings' },
]

export function HelpTopics() {
  return (
    <section className="bg-slate-50 py-14 sm:py-20">
      <div className="container-x">
        <SectionHead eyebrow="Quick help" title="What do you need today?" text="Most questions can be answered in one tap. For anything else, call or message us above." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map(({ Icon, title, text, to, cta }, i) => (
            <Reveal key={title} delay={i * 0.06} y={20} as="li" className="flex">
              <Link to={to} className="group flex w-full flex-col rounded-3xl bg-surface p-6 ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-dock">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white"><Icon /></span>
                <h3 className="mt-4 text-base font-semibold text-fg">{title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">{text}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">{cta}<ArrowRight width={15} height={15} className="transition-transform duration-200 group-hover:translate-x-1" /></span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

const PREP = [
  'The date or two you have in mind',
  'About how many guests you expect',
  'The kind of event (wedding, holud, birthday…)',
  'Whether you want our catering or your own',
]
const callHref = `tel:${CONTACT.phone.replace(/[^+\d]/g, '')}`

/* Hours, shift times and what to bring for a site visit. Everything comes from data.js, so it never disagrees with the rest of the site. */
export function VisitInfo() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container-x grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-[2rem] bg-surface p-6 ring-1 ring-slate-200/80 sm:p-8">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-fg"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand"><ClockIcon width={20} height={20} /></span>Hours & shifts</h2>
            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between gap-4 py-3"><dt className="text-slate-500">Office</dt><dd className="text-right font-medium text-fg">{CONTACT.hours}</dd></div>
              {SHIFTS.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-4 py-3"><dt className="text-slate-500">{s.label} shift</dt><dd className="text-right font-medium tabular-nums text-fg">{s.time}</dd></div>
              ))}
            </dl>
            <p className="mt-4 rounded-2xl bg-brand-soft p-3.5 text-xs leading-relaxed text-brand-ink">Calls and WhatsApp messages sent outside office hours are answered the next morning.</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="h-full rounded-[2rem] bg-surface p-6 ring-1 ring-slate-200/80 sm:p-8">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-fg"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:!bg-emerald-500/15 dark:!text-emerald-300"><CheckIcon width={20} height={20} strokeWidth={2.4} /></span>Planning a site visit?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">Call ahead so our team can have the hall open and a person free to walk you through it. It helps to have these ready:</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              {PREP.map((t) => <li key={t} className="flex items-start gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><CheckIcon width={12} height={12} strokeWidth={3.2} /></span>{t}</li>)}
            </ul>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              <a href={callHref} className="btn-primary"><PhoneIcon width={16} height={16} />Call to book a visit</a>
              <a href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hello! I would like to visit the hall. Is there a time that works this week?')}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe5a] active:scale-95"><WhatsAppIcon width={16} height={16} />Ask on WhatsApp</a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
