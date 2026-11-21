import { CONTACT, packages } from '../data'
import { SHIFTS } from '../lib/store'

export function downloadIcs(b) {
  const pkg = packages.find((p) => p.id === b.packageId)
  const s = SHIFTS.find((x) => x.id === b.shift)
  const t = { morning: ['100000', '150000'], evening: ['170000', '223000'], full: ['100000', '223000'] }[b.shift]
  const d = b.date.replace(/-/g, '')
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nikah Community Center//EN', 'BEGIN:VEVENT', `UID:${b.id}@ncc`, `DTSTAMP:${d}T000000`,
    `DTSTART:${d}T${t[0]}`, `DTEND:${d}T${t[1]}`, `SUMMARY:${b.eventType} at Nikah Community Center`, `LOCATION:${CONTACT.address}`,
    `DESCRIPTION:Booking ${b.id} - ${pkg.name} - ${s.label}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = `${b.id}.ics`; a.click()
}
