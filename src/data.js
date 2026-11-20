export const CONTACT = {
  phone: '+880 1700-000000',
  whatsapp: '8801700000000',
  email: 'info@nikahcommunitycenter.com',
  address: 'Nikah Community Center, Chattogram, Bangladesh',
  hours: 'Daily, 9:00 AM – 9:00 PM',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Community+Center+Chattogram',
  adminPass: 'admin123',
}
export const BOOK_URL = '#booking'
export const img = (n) => `${import.meta.env.BASE_URL}images/${n}`

export const slides = [
  { image: 'hero-1.webp', title: 'The Perfect Venue For Your Next Event', text: 'Best decorated, clean and budget-friendly community center in Chittagong. Check a date and book in minutes.', cta: true },
  { image: 'hero-2.webp', title: 'Spacious. Elegant. Ready.', text: 'Air-conditioned hall for up to 600 guests with a dedicated team handling every detail.' },
  { image: 'hero-3.webp', title: 'Your Day, Beautifully Held', text: 'From stage decoration to guest flow — we are strict about quality and service.' },
  { image: 'hero-4.webp', title: 'Fresh, Generous Catering', text: 'In-house kitchen with menus for weddings, receptions, milad and corporate events.' },
]

export const eventTypes = ['Wedding', 'Reception', 'Holud', 'Corporate', 'Birthday', 'Milad', 'Other']
export const marquee = ['Weddings', 'Holud', 'Receptions', 'Aqiqah', 'Milad', 'Corporate Events', 'Seminars', 'Birthdays', 'Engagements', 'Book Fairs']

export const packages = [
  { id: 'business-fair', price: 30000, name: 'Business Fair', desc: 'Book fairs, craft fairs and expos.', cap: 300, items: ['Limited space access', 'Security facility', 'Event support', 'Decoration design', 'Per day bill'] },
  { id: 'wedding-basic', price: 55000, name: 'Wedding Basic', desc: 'Weddings with a basic plan and limited items.', cap: 400, items: ['Full space access', 'Food arrangement', 'Management support', 'Decoration design', 'Billed per shift'] },
  { id: 'wedding-plus', price: 85000, name: 'Wedding Plus', desc: 'Most weddings with premium plans.', cap: 600, popular: true, items: ['Full space access', 'Security facility', 'Dedicated team', 'Premium decoration', 'Pay as per plan'] },
  { id: 'corporate', price: 120000, name: 'Corporate Event', desc: 'Dedicated team for corporate events.', cap: 500, items: ['Full space access', 'Buffet food', 'Premium decoration', 'Sound & projector', 'Per day plan'] },
]

export const addons = [
  { id: 'catering', label: 'Catering (per guest)', price: 650, perGuest: true, hint: 'Full buffet menu' },
  { id: 'stage', label: 'Stage & floral decoration', price: 18000, hint: 'Themed stage, entrance, seating' },
  { id: 'sound', label: 'Sound, lights & projector', price: 9000, hint: 'Mic, DJ console, LED wall' },
  { id: 'photo', label: 'Photo & video coverage', price: 22000, hint: 'Photographer + cinematographer' },
  { id: 'bridal', label: 'Bridal / green room', price: 5000, hint: 'Private AC room with mirror' },
]

export const facilities = [
  { icon: 'users', title: 'Up to 600 guests', text: 'A column-free main hall with flexible round-table or theatre seating.' },
  { icon: 'snow', title: 'Fully air-conditioned', text: 'Central cooling keeps guests comfortable through every season.' },
  { icon: 'car', title: 'Parking for 80 cars', text: 'Secure on-site parking with attendants on busy event days.' },
  { icon: 'bolt', title: 'Backup generator', text: 'Uninterrupted power for lights, sound and cooling.' },
  { icon: 'crown', title: 'Bridal & green rooms', text: 'Private, mirrored rooms for the couple and the family.' },
  { icon: 'utensils', title: 'In-house kitchen', text: 'Experienced chefs and serving staff, with menus to suit your budget.' },
]

export const stats = [
  { value: 600, suffix: '', label: 'Guest capacity' },
  { value: 80, suffix: '', label: 'Parking spaces' },
  { value: 3, suffix: '', label: 'Daily shifts' },
  { value: 24, suffix: '/7', label: 'Booking online' },
]

export const gallery = [
  { src: 'hero-1.webp', alt: 'Couple walking through a flower shower', span: 'md:col-span-2 md:row-span-2' },
  { src: 'ceremony.webp', alt: 'Family wedding ceremony', span: '' },
  { src: 'hero-4.webp', alt: 'Catering and dining setup', span: '' },
  { src: 'crowd.webp', alt: 'Guests celebrating', span: 'md:col-span-2' },
  { src: 'hero-2.webp', alt: 'Main hall decoration', span: '' },
  { src: 'hero-3.webp', alt: 'Reception stage', span: '' },
]

export const reviews = [
  { name: 'Mr. Williamson', role: 'Wedding, Plus package', img: 'person-1.webp', stars: 5, text: 'Everything from the stage to the food was handled by one team. Booking online took five minutes and the advance was easy.' },
  { name: 'John Smith', role: 'Corporate annual dinner', img: 'person-2.webp', stars: 4.5, text: 'Clean hall, proper sound setup and punctual staff. Our guests kept asking where we found the venue.' },
  { name: 'Robert Henry', role: 'Reception, Basic package', img: 'person-3.webp', stars: 4, text: 'Fair pricing and no surprises on the day. Parking was a big help for our out-of-town guests.' },
]

export const faqs = [
  { q: 'How do I book the hall?', a: 'Use the online booking form: pick your package, choose a date and shift, add any extras and confirm. You will get a booking ID instantly and our team will call to confirm.' },
  { q: 'How much advance is required?', a: 'A 30% advance secures your date. The balance is due before the event. Your booking shows the exact advance amount in the summary.' },
  { q: 'What are the shift timings?', a: 'Morning is 10:00 AM – 3:00 PM, Evening is 5:00 PM – 10:30 PM, or book the Full Day for both shifts at a combined rate.' },
  { q: 'Is there a weekend surcharge?', a: 'Fridays and Saturdays carry a 15% surcharge because of high demand. It is shown clearly before you confirm.' },
  { q: 'What is your cancellation and refund policy?', a: 'Cancel 14 or more days before the event for a full advance refund. Within 14 days the advance is kept as a booking fee. You can cancel from "My Bookings".' },
  { q: 'Can I bring my own caterer or decorator?', a: 'Yes, with prior notice. Our in-house catering and decoration are optional add-ons you can select while booking.' },
]
