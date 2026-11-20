export const CONTACT = {
  phone: '+880 1700-000000',
  whatsapp: '8801700000000',
  email: 'info@nikahcommunitycenter.com',
  address: 'Nikah Community Center, Chattogram, Bangladesh',
  hours: 'Daily, 9:00 AM – 9:00 PM',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Community+Center+Chattogram',
  adminPass: 'admin123',
}
export const img = (n) => `${import.meta.env.BASE_URL}images/${n}`

export const slides = [
  { image: 'hero-1.webp', eyebrow: 'Chattogram’s favourite venue', title: 'The perfect venue for your next event', text: 'Best decorated, clean and budget-friendly community center. Check a date and book in minutes.' },
  { image: 'hero-6.webp', eyebrow: 'Weddings & receptions', title: 'Where your story begins beautifully', text: 'Elegant stage décor, bridal rooms and a dedicated team for your biggest day.' },
  { image: 'hero-3.webp', eyebrow: 'Holud & celebrations', title: 'Make every moment unforgettable', text: 'A spacious, air-conditioned hall for up to 600 guests with easy parking.' },
  { image: 'hero-2.webp', eyebrow: 'Engagements & Nikah', title: 'Small details, handled with care', text: 'From flowers to flow of the day — one team looks after everything.' },
  { image: 'hero-4.webp', eyebrow: 'In-house catering', title: 'Fresh, generous menus for every guest', text: 'Experienced chefs and serving staff, with menus to suit your budget.' },
]

export const eventTypes = ['Wedding', 'Reception', 'Holud', 'Corporate', 'Birthday', 'Milad', 'Other']
export const marquee = ['Weddings', 'Holud', 'Receptions', 'Aqiqah', 'Milad', 'Corporate Events', 'Seminars', 'Birthdays', 'Engagements', 'Book Fairs']

export const packages = [
  { id: 'business-fair', icon: 'briefcase', tag: 'Fairs & expos', price: 30000, name: 'Business Fair', desc: 'Book fairs, craft fairs and expos.', cap: 300, items: ['Limited space access', 'Security facility', 'Event support', 'Decoration design', 'Per day bill'] },
  { id: 'wedding-basic', icon: 'heart', tag: 'Simple & elegant', price: 55000, name: 'Wedding Basic', desc: 'Weddings with a basic plan and limited items.', cap: 400, items: ['Full space access', 'Food arrangement', 'Management support', 'Decoration design', 'Billed per shift'] },
  { id: 'wedding-plus', icon: 'sparkles', tag: 'Most booked', price: 85000, name: 'Wedding Plus', desc: 'Most weddings with premium plans.', cap: 600, popular: true, items: ['Full space access', 'Security facility', 'Dedicated team', 'Premium decoration', 'Pay as per plan'] },
  { id: 'corporate', icon: 'building', tag: 'Teams & brands', price: 120000, name: 'Corporate Event', desc: 'Dedicated team for corporate events.', cap: 500, items: ['Full space access', 'Buffet food', 'Premium decoration', 'Sound & projector', 'Per day plan'] },
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

export const compare = [
  { label: 'Guest capacity', v: ['300', '400', '600', '500'] },
  { label: 'Hall access', v: ['Limited space', 'Full hall', 'Full hall', 'Full hall'] },
  { label: 'Security', v: [true, true, true, true] },
  { label: 'Decoration', v: ['Design only', 'Standard', 'Premium', 'Premium'] },
  { label: 'Dedicated event team', v: [false, false, true, true] },
  { label: 'Food arrangement', v: [false, true, true, 'Buffet'] },
  { label: 'Sound & projector', v: [false, false, false, true] },
  { label: 'Billing', v: ['Per day', 'Per shift', 'As per plan', 'Per day'] },
]

export const events = [
  { slug: 'Wedding', icon: 'heart', image: 'hero-6.webp', title: 'Weddings', text: 'A complete setting for your biggest day: stage, bridal room, catering and a team that keeps the day on schedule.', pkg: 'wedding-plus', guests: '100–600 guests' },
  { slug: 'Holud', icon: 'sparkles', image: 'hero-3.webp', title: 'Holud & Cultural', text: 'Colourful, high-energy evenings with room for dance, music and family traditions.', pkg: 'wedding-basic', guests: '80–400 guests' },
  { slug: 'Reception', icon: 'gift', image: 'ceremony.webp', title: 'Receptions', text: 'An elegant hall, warm lighting and buffet service for the celebration with everyone you love.', pkg: 'wedding-plus', guests: '150–600 guests' },
  { slug: 'Corporate', icon: 'mic', image: 'crowd.webp', title: 'Corporate & Seminars', text: 'Sound, projector and a professional setup for conferences, annual dinners and product launches.', pkg: 'corporate', guests: '50–500 guests' },
  { slug: 'Milad', icon: 'moon', image: 'hero-2.webp', title: 'Milad & Family', text: 'A calm, respectful space for milad, aqiqah and family gatherings, with food arranged for you.', pkg: 'wedding-basic', guests: '40–300 guests' },
  { slug: 'Birthday', icon: 'cake', image: 'hero-5.webp', title: 'Birthdays & Parties', text: 'Flexible morning or evening shifts with decoration and catering add-ons.', pkg: 'business-fair', guests: '30–300 guests' },
]

export const process = [
  { icon: 'eye', title: 'Visit or enquire', text: 'Call us, WhatsApp us, or drop by to see the hall in person.' },
  { icon: 'calendar', title: 'Pick date & shift', text: 'Check live availability and choose morning, evening or full day.' },
  { icon: 'clipboard', title: 'Confirm online', text: 'Choose a package and extras, then submit. You get a booking ID instantly.' },
  { icon: 'wallet', title: 'Pay the advance', text: 'Our team calls to confirm and collect the 30% advance.' },
  { icon: 'sparkles', title: 'Celebrate', text: 'Arrive on the day — decoration, food and staff are ready.' },
]

export const values = [
  { icon: 'shield', title: 'Clear, honest pricing', text: 'Itemised bills and a written summary, so there are no surprises on the day.' },
  { icon: 'users', title: 'A team that cares', text: 'Dedicated coordinators and trained staff stay with your event from start to finish.' },
  { icon: 'clipboard', title: 'Booking made simple', text: 'Live availability and instant booking IDs — no endless phone calls.' },
  { icon: 'sparkles', title: 'Spotless, ready spaces', text: 'Cleaned, set and checked before every shift so you can just arrive.' },
]

export const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/packages', label: 'Packages' },
  { to: '/contact', label: 'Contact' },
]
