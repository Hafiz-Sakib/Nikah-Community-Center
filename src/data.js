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
  { id: 'wedding-basic', icon: 'heart', tag: 'Simple & elegant', ideal: 'Ideal for simple weddings', price: 55000, name: 'Wedding Basic', desc: 'Weddings with a basic plan and limited items.', cap: 400, items: [
    { icon: 'building', title: 'Full space access', text: 'The entire hall and entrance' },
    { icon: 'utensils', title: 'Food arrangement', text: 'Menus arranged with our kitchen' },
    { icon: 'users', title: 'Management support', text: 'On-the-day coordination' },
    { icon: 'sparkles', title: 'Decoration design', text: 'Standard stage and seating' },
    { icon: 'wallet', title: 'Billed per shift', text: 'Morning or evening' } ] },
  { id: 'wedding-plus', icon: 'sparkles', tag: 'Most booked', ideal: 'Ideal for grand weddings', price: 85000, name: 'Wedding Plus', desc: 'Most weddings with premium plans.', cap: 600, popular: true, items: [
    { icon: 'building', title: 'Full space access', text: 'The entire hall, entrance and rooms' },
    { icon: 'shield', title: 'Security facility', text: 'Guards and parking attendants' },
    { icon: 'users', title: 'Dedicated team', text: 'A coordinator for your event' },
    { icon: 'crown', title: 'Premium decoration', text: 'Themed stage, entrance and seating' },
    { icon: 'wallet', title: 'Pay as per plan', text: 'A flexible payment schedule' } ] },
  { id: 'corporate', icon: 'building', tag: 'Teams & brands', ideal: 'Ideal for corporate events', price: 120000, name: 'Corporate Event', desc: 'Dedicated team for corporate events.', cap: 500, items: [
    { icon: 'building', title: 'Full space access', text: 'Hall, lobby and breakout areas' },
    { icon: 'utensils', title: 'Buffet food', text: 'Served by trained staff' },
    { icon: 'crown', title: 'Premium decoration', text: 'Branding-friendly stage setup' },
    { icon: 'mic', title: 'Sound & projector', text: 'Mic, LED wall and AV support' },
    { icon: 'wallet', title: 'Per day plan', text: 'Billed per day' } ] },
]

export const addons = [
  { id: 'catering', label: 'Hall catering (per guest, from)', price: 450, perGuest: true, hint: 'Choose a food package while booking — see the Food page' },
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
  { src: 'hero-1.webp', alt: 'Bengali bride and groom entering the hall', span: 'md:col-span-2 md:row-span-2' },
  { src: 'ceremony.webp', alt: 'Nikah ceremony with family', span: '' },
  { src: 'hero-4.webp', alt: 'Wedding feast set up in the hall', span: '' },
  { src: 'crowd.webp', alt: 'Guests at a reception', span: 'md:col-span-2' },
  { src: 'hero-2.webp', alt: 'Convention hall decorated for a wedding', span: '' },
  { src: 'hero-3.webp', alt: 'Holud stage and decoration', span: '' },
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
  { label: 'Guest capacity', v: ['400', '600', '500'] },
  { label: 'Hall access', v: ['Full hall', 'Full hall', 'Full hall'] },
  { label: 'Security', v: [true, true, true] },
  { label: 'Decoration', v: ['Standard', 'Premium', 'Premium'] },
  { label: 'Dedicated event team', v: [false, true, true] },
  { label: 'Food arrangement', v: [true, true, 'Buffet'] },
  { label: 'Sound & projector', v: [false, false, true] },
  { label: 'Billing', v: ['Per shift', 'As per plan', 'Per day'] },
]

export const events = [
  { slug: 'Wedding', icon: 'heart', image: 'hero-6.webp', title: 'Weddings', text: 'A complete setting for your biggest day: stage, bridal room, catering and a team that keeps the day on schedule.', pkg: 'wedding-plus', guests: '100–600 guests' },
  { slug: 'Holud', icon: 'sparkles', image: 'hero-3.webp', title: 'Holud & Cultural', text: 'Colourful, high-energy evenings with room for dance, music and family traditions.', pkg: 'wedding-basic', guests: '80–400 guests' },
  { slug: 'Reception', icon: 'gift', image: 'ceremony.webp', title: 'Receptions', text: 'An elegant hall, warm lighting and buffet service for the celebration with everyone you love.', pkg: 'wedding-plus', guests: '150–600 guests' },
  { slug: 'Corporate', icon: 'mic', image: 'crowd.webp', title: 'Corporate & Seminars', text: 'Sound, projector and a professional setup for conferences, annual dinners and product launches.', pkg: 'corporate', guests: '50–500 guests' },
  { slug: 'Milad', icon: 'moon', image: 'hero-2.webp', title: 'Milad & Family', text: 'A calm, respectful space for milad, aqiqah and family gatherings, with food arranged for you.', pkg: 'wedding-basic', guests: '40–300 guests' },
  { slug: 'Birthday', icon: 'cake', image: 'hero-5.webp', title: 'Birthdays & Parties', text: 'Flexible morning or evening shifts with decoration and catering add-ons.', pkg: 'wedding-basic', guests: '30–300 guests' },
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
  { to: '/', label: 'Home', icon: 'home', hint: 'Start here' },
  { to: '/facilities', label: 'Facilities', icon: 'building', hint: 'Hall, parking, power & rooms' },
  { to: '/events', label: 'Events', icon: 'sparkles', hint: 'Weddings, holud, milad & more' },
  { to: '/food', label: 'Food', icon: 'utensils', hint: 'Bengali wedding menus' },
  { to: '/gallery', label: 'Gallery', icon: 'image', hint: 'Moments we have hosted' },
  { to: '/packages', label: 'Packages', icon: 'gift', hint: 'Pricing & what is included' },
  { to: '/about', label: 'About Us', icon: 'users', hint: 'Our story, contact & FAQ' },
]

/* ---------- Food menu ----------
   `by` = which packages serve the dish, and the variation each one gets.
   Photos: public/images/food-<id>.webp (a gradient + emoji tile shows until you add them). */
export const foodPkgs = [
  { id: 'wedding-basic', short: 'Basic', name: 'Wedding Basic', price: 450, text: 'Simple, hearty wedding menu' },
  { id: 'wedding-plus', short: 'Plus', name: 'Wedding Plus', price: 650, text: 'Full premium wedding feast' },
  { id: 'corporate', short: 'Corporate', name: 'Corporate Event', price: 550, text: 'Buffet with tea & coffee' },
]
export const foodCats = [
  { id: 'welcome', label: 'Welcome & starters', emoji: '🥤' },
  { id: 'rice', label: 'Polao & biryani', emoji: '🍚' },
  { id: 'meat', label: 'Meat curries', emoji: '🍖' },
  { id: 'fish', label: 'Fish & seafood', emoji: '🐟' },
  { id: 'sides', label: 'Dal & sides', emoji: '🥗' },
  { id: 'dessert', label: 'Mishti & dessert', emoji: '🍮' },
  { id: 'drinks', label: 'Drinks', emoji: '🥛' },
]
export const foodItems = [
  { id: 'sharbat', cat: 'welcome', name: 'Welcome Sharbat', bn: 'স্বাগত শরবত', by: { 'wedding-basic': 'Lemon sharbat', 'wedding-plus': 'Rooh Afza & lemon', corporate: 'Fresh juice' } },
  { id: 'jali-kabab', cat: 'welcome', name: 'Jali Kabab', bn: 'জালি কাবাব', by: { 'wedding-plus': 'Chicken, 1 pc', corporate: 'Chicken, 1 pc' } },
  { id: 'fish-fry', cat: 'welcome', name: 'Fish Fry', bn: 'ফিশ ফ্রাই', by: { 'wedding-plus': 'Bhetki, 1 pc' } },
  { id: 'morog-polao', cat: 'rice', name: 'Morog Polao', bn: 'মোরগ পোলাও', by: { 'wedding-basic': 'Chicken polao', 'wedding-plus': 'Special morog polao' } },
  { id: 'kacchi', cat: 'rice', name: 'Kacchi Biryani', bn: 'কাচ্চি বিরিয়ানি', by: { 'wedding-plus': 'Mutton kacchi', corporate: 'Chicken biryani' } },
  { id: 'plain-polao', cat: 'rice', name: 'Plain Polao', bn: 'সাদা পোলাও', by: { 'wedding-basic': 'With every menu', 'wedding-plus': 'With every menu', corporate: 'With every menu' } },
  { id: 'rezala', cat: 'meat', name: 'Rezala', bn: 'রেজালা', by: { 'wedding-basic': 'Beef rezala', 'wedding-plus': 'Mutton rezala' } },
  { id: 'mezbani', cat: 'meat', name: 'Mezbani Beef', bn: 'মেজবানি গরুর মাংস', by: { 'wedding-basic': 'Beef', 'wedding-plus': 'Beef, bone-in' } },
  { id: 'roast', cat: 'meat', name: 'Chicken Roast', bn: 'চিকেন রোস্ট', by: { 'wedding-plus': 'Leg piece', corporate: 'Regular piece' } },
  { id: 'rui', cat: 'fish', name: 'Rui Kalia', bn: 'রুই মাছের কালিয়া', by: { 'wedding-basic': 'Rui, 1 pc', 'wedding-plus': 'Rui, 1 pc' } },
  { id: 'ilish', cat: 'fish', name: 'Ilish Bhapa', bn: 'ইলিশ ভাপা', by: { 'wedding-plus': 'Seasonal' } },
  { id: 'chingri', cat: 'fish', name: 'Chingri Malaikari', bn: 'চিংড়ি মালাইকারি', by: { 'wedding-plus': 'Prawn' } },
  { id: 'dal', cat: 'sides', name: 'Dal', bn: 'ডাল', by: { 'wedding-basic': 'Moshur dal', 'wedding-plus': 'Moshur dal', corporate: 'Moshur dal' } },
  { id: 'veg', cat: 'sides', name: 'Mixed Vegetable', bn: 'মিক্স সবজি', by: { 'wedding-basic': 'Seasonal', corporate: 'Seasonal' } },
  { id: 'salad', cat: 'sides', name: 'Salad & Chutney', bn: 'সালাদ ও চাটনি', by: { 'wedding-basic': 'Green salad', 'wedding-plus': 'Salad & chutney', corporate: 'Green salad' } },
  { id: 'firni', cat: 'dessert', name: 'Firni', bn: 'ফিরনি', by: { 'wedding-basic': 'Small cup' } },
  { id: 'roshogolla', cat: 'dessert', name: 'Roshogolla', bn: 'রসগোল্লা', by: { 'wedding-basic': '1 pc', 'wedding-plus': '2 pcs' } },
  { id: 'zorda', cat: 'dessert', name: 'Zorda', bn: 'জর্দা', by: { 'wedding-plus': 'Sweet rice' } },
  { id: 'mishti-doi', cat: 'dessert', name: 'Mishti Doi', bn: 'মিষ্টি দই', by: { 'wedding-plus': 'Bogurar doi', corporate: 'Cup' } },
  { id: 'borhani', cat: 'drinks', name: 'Borhani', bn: 'বোরহানি', by: { 'wedding-basic': 'Glass', 'wedding-plus': 'Glass', corporate: 'Glass' } },
  { id: 'soft-drinks', cat: 'drinks', name: 'Soft Drinks', bn: 'কোমল পানীয়', by: { 'wedding-plus': 'Bottle', corporate: 'Bottle' } },
  { id: 'tea-coffee', cat: 'drinks', name: 'Tea & Coffee', bn: 'চা ও কফি', by: { corporate: 'Unlimited, all day' } },
]
