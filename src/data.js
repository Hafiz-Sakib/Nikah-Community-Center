export const CONTACT = {
  phone: '+880 1516-195904',
  whatsapp: '8801516195904',
  email: 'info@nikahcommunitycenter.com',
  address: 'Nikah Community Center, Chattogram, Bangladesh',
  hours: 'Daily, 9:00 AM – 9:00 PM',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Community+Center+Chattogram',
}
/* Advance-payment details shown on the billing screen & invoice. Replace the placeholders with your real numbers. */
export const PAYMENT = [
  { id: 'bkash', label: 'bKash', kind: 'Send Money (personal)', value: '01700-000000', color: '#e2136e' },
  { id: 'nagad', label: 'Nagad', kind: 'Send Money (personal)', value: '01700-000000', color: '#f6921e' },
  { id: 'bank', label: 'Bank', kind: 'Bank transfer / deposit', value: 'A/C 0000000000000 · Nikah Community Center · Your Bank, Chattogram', color: '#0f766e' },
  { id: 'office', label: 'At office', kind: 'Pay in cash or card', value: 'Nikah Community Center, Chattogram · Daily 9 AM – 9 PM', color: '#475569' },
]
export const img = (n) => `${import.meta.env.BASE_URL}images/${n}`

/* Hero carousel. `pos` = object-position (the point of the photo that must stay in frame: faces, couple, stage),
   `side: 'right'` moves the text to the right when the couple stands on the left of the photo. */
export const slides = [
  { image: 'hero-1.webp', pos: '50% 42%', eyebrow: 'Chattogram’s favourite venue', title: 'The perfect venue for your next event', text: 'Best decorated, clean and budget-friendly community center. Check a date and book in minutes.' },
  { image: 'hero-6.webp', pos: '45% 20%', side: 'right', eyebrow: 'Weddings & receptions', title: 'Where your story begins beautifully', text: 'Elegant stage décor, bridal rooms and a dedicated team for your biggest day.' },
  { image: 'hero-3.webp', pos: '50% 50%', eyebrow: 'Holud & celebrations', title: 'Make every moment unforgettable', text: 'A spacious, air-conditioned hall for up to 600 guests with easy parking.' },
  { image: 'hero-2.webp', pos: '60% 30%', eyebrow: 'Engagements & Nikah', title: 'Small details, handled with care', text: 'From flowers to flow of the day — one team looks after everything.' },
  { image: 'hero-4.webp', pos: '62% 50%', eyebrow: 'In-house catering', title: 'Fresh, generous menus for every guest', text: 'Experienced chefs and serving staff, with menus to suit your budget.' },
  { image: 'hero-12.webp', pos: '55% 42%', eyebrow: 'Bridal moments', title: 'Every bride deserves the perfect stage', text: 'Floral backdrops, royal seating and soft light, set up just the way you imagined.' },
  { image: 'hero-8.webp', pos: '72% 28%', eyebrow: 'Couple portraits', title: 'Memories made in beautiful places', text: 'Portraits before and after the ceremony, with a team that knows the best light.' },
  { image: 'hero-5.webp', pos: '58% 26%', eyebrow: 'Bridal portraits', title: 'Elegance in every little detail', text: 'Candle-lit pillars, soft florals and a stage made for beautiful photographs.' },
  { image: 'hero-9.webp', pos: '58% 38%', eyebrow: 'Nikah day', title: 'Two hearts, one beautiful day', text: 'Calm, respectful and joyful — a setting for the moments you will keep forever.' },
  { image: 'hero-11.webp', pos: '54% 52%', side: 'right', eyebrow: 'Grand receptions', title: 'Dress up, celebrate and be remembered', text: 'Room for the whole family, warm hospitality and a hall that feels like a celebration.' },
  { image: 'hero-13.webp', pos: '62% 60%', eyebrow: 'Love stories', title: 'Begin forever, together', text: 'From the first look to the last dance, we keep your day beautiful from start to finish.' },
]

export const eventTypes = ['Wedding', 'Reception', 'Holud', 'Corporate', 'Birthday', 'Milad', 'Other']
export const marquee = ['Weddings', 'Holud', 'Receptions', 'Aqiqah', 'Milad', 'Corporate Events', 'Seminars', 'Birthdays', 'Engagements', 'Book Fairs']

export const packages = [
  { id: 'wedding-basic', photo: 'g-couple-stage.webp', photoPos: '50% 22%', icon: 'heart', tag: 'Simple & elegant', ideal: 'Ideal for simple weddings', price: 55000, name: 'Wedding Basic', desc: 'Weddings with a basic plan and limited items.', cap: 400, items: [
    { icon: 'building', title: 'Full space access', text: 'The entire hall and entrance' },
    { icon: 'utensils', title: 'Food arrangement', text: 'Menus arranged with our kitchen' },
    { icon: 'users', title: 'Management support', text: 'On-the-day coordination' },
    { icon: 'sparkles', title: 'Decoration design', text: 'Standard stage and seating' },
    { icon: 'wallet', title: 'Billed per shift', text: 'Morning or evening' } ] },
  { id: 'wedding-plus', photo: 'hero-12.webp', photoPos: '55% 55%', icon: 'sparkles', tag: 'Most booked', ideal: 'Ideal for grand weddings', price: 85000, name: 'Wedding Plus', desc: 'Most weddings with premium plans.', cap: 600, popular: true, items: [
    { icon: 'building', title: 'Full space access', text: 'The entire hall, entrance and rooms' },
    { icon: 'shield', title: 'Security facility', text: 'Guards and parking attendants' },
    { icon: 'users', title: 'Dedicated team', text: 'A coordinator for your event' },
    { icon: 'crown', title: 'Premium decoration', text: 'Themed stage, entrance and seating' },
    { icon: 'wallet', title: 'Pay as per plan', text: 'A flexible payment schedule' } ] },
  { id: 'corporate', photo: 'corporate.webp', photoPos: '50% 45%', icon: 'building', tag: 'Teams & brands', ideal: 'Ideal for corporate events', price: 120000, name: 'Corporate Event', desc: 'Dedicated team for corporate events.', cap: 500, items: [
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
  { icon: 'wifi', title: 'Free Wi-Fi', text: 'Guest Wi-Fi for your team, vendors and photographers.' },
  { icon: 'camera', title: 'CCTV monitoring', text: 'Cameras at the entrance, lobby and parking on every event day.' },
  { icon: 'access', title: 'Accessible entry', text: 'A step-free entrance and ramp for elders and wheelchair users.' },
  { icon: 'music', title: 'Sound & stage lights', text: 'A built-in sound system and stage lighting, with an LED wall as an add-on.' },
  { icon: 'moon', title: 'Prayer space', text: 'A quiet space for prayer, with wudu facilities close by.' },
  { icon: 'sparkles', title: 'Spotless housekeeping', text: 'The hall is cleaned, set and checked before and after every shift.' },
]

export const stats = [
  { value: 600, suffix: '', label: 'Guest capacity' },
  { value: 80, suffix: '', label: 'Parking spaces' },
  { value: 3, suffix: '', label: 'Daily shifts' },
  { value: 24, suffix: '/7', label: 'Booking online' },
]

export const gallery = [
  { src: 'g-bride-diya.webp', alt: 'Bride in a red saree with diya', span: 'md:col-span-2 md:row-span-2' },
  { src: 'g-holud-girl.webp', alt: 'Holud morning with marigold garlands', span: '' },
  { src: 'g-couple-stage.webp', alt: 'Bride and groom on a floral stage', span: '' },
  { src: 'reception.webp', alt: 'Rose-covered entrance gate', span: '' },
  { src: 'g-bride-white.webp', alt: 'Bride among candle-lit pillars', span: '' },
  { src: 'g-hall.webp', alt: 'Our air-conditioned hall, set for an event', span: 'md:col-span-2' },
  { src: 'g-holud-play.webp', alt: 'Holud celebration with family and friends', span: '' },
  { src: 'n-hug.webp', alt: 'A warm embrace on the wedding stage', span: '' },
  { src: 'ceremony.webp', alt: 'Family together at a Nikah ceremony', span: '' },
  { src: 'n-family.webp', alt: 'Family greeting each other at the reception', span: 'md:col-span-2' },
  { src: 'party.webp', alt: 'Sunflower and rose engagement stage', span: '' },
  { src: 'g-bride-lamps.webp', alt: 'Bride in a red lehenga among lamps', span: '' },
  { src: 'n-three-girls.webp', alt: 'Holud sisters in marigold colours', span: '' },
  { src: 'g-veil.webp', alt: 'Bride in a long veil at sunset', span: '' },
  { src: 'n-drone.webp', alt: 'Couple resting on the lawn, seen from above', span: '' },
]

/* Home “Moments” 3D carousel (portrait photos) */
export const moments = [
  { src: 'm-1.webp', alt: 'Couple on a wooden bridge', tag: 'Couple portraits' },
  { src: 'm-2.webp', alt: 'A quiet moment under the trees', tag: 'Nikah day' },
  { src: 'm-3.webp', alt: 'Walking together', tag: 'First steps' },
  { src: 'm-4.webp', alt: 'Bride with gold jewellery and mehendi', tag: 'Bridal details' },
  { src: 'm-5.webp', alt: 'A kiss on the forehead', tag: 'Love stories' },
  { src: 'm-6.webp', alt: 'Laughing together in the garden', tag: 'Joyful moments' },
  { src: 'm-7.webp', alt: 'Bride and groom climbing the steps', tag: 'Together' },
  { src: 'm-8.webp', alt: 'Bride in a red Banarasi saree', tag: 'Bridal portrait' },
  { src: 'm-9.webp', alt: 'Bride and groom on a white floral stage', tag: 'Nikah day' },
  { src: 'm-10.webp', alt: 'Couple in red and ivory wedding wear', tag: 'Wedding day' },
  { src: 'm-11.webp', alt: 'Holud couple on the garden stairs', tag: 'Holud' },
  { src: 'm-12.webp', alt: 'A quiet moment between bride and groom', tag: 'Engagement' },
  { src: 'm-13.webp', alt: 'Couple walking through the garden', tag: 'Pre-wedding' },
  { src: 'm-14.webp', alt: 'Bride and groom in white by the arches', tag: 'Couple portraits' },
]

export const reviews = [
  { name: 'Tanvir Ahmed', role: 'Wedding, Plus package', stars: 5, photo: 'r-2.webp', text: 'Everything from the stage to the food was handled by one team. Booking online took five minutes and the advance was easy.' },
  { name: 'Nusrat Jahan', role: 'Corporate annual dinner', stars: 4.5, photo: 'r-3.webp', text: 'Clean hall, proper sound setup and punctual staff. Our guests kept asking where we found the venue.' },
  { name: 'Mahmudul Hasan', role: 'Reception, Basic package', stars: 4, photo: 'r-1.webp', text: 'Fair pricing and no surprises on the day. Parking was a big help for our out-of-town guests.' },
  { name: 'Sajid Hossain', role: 'Wedding, Plus package', stars: 5, photo: 'r-4.webp', text: 'The stage décor and lighting looked even better than the photos. Our relatives from Dhaka were really impressed.' },
  { name: 'Farzana Rahman', role: 'Holud, Basic package', stars: 4.5, photo: 'r-5.webp', text: 'The hall stayed cool and comfortable all evening, and the staff handled the holud programme smoothly without any rush.' },
  { name: 'Imran Chowdhury', role: 'Reception, Plus package', stars: 5, photo: 'r-6.webp', text: 'The kacchi and rezala were the talk of the night. Service was quick, and the team stayed with us until the very end.' },
]

export const faqs = [
  { q: 'How do I book the hall?', a: 'Use the online booking form: pick your package, choose a date and shift, add any extras and confirm. You will get a booking ID instantly and our team will call to confirm.' },
  { q: 'How much advance is required?', a: 'A 30% advance secures your date. Pay it within 3 days of booking — unpaid bookings are cancelled automatically and the date is released. The balance is due before the event.' },
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
  { slug: 'Reception', icon: 'gift', image: 'reception.webp', title: 'Receptions', text: 'An elegant hall, warm lighting and buffet service for the celebration with everyone you love.', pkg: 'wedding-plus', guests: '150–600 guests' },
  { slug: 'Corporate', icon: 'mic', image: 'corporate.webp', title: 'Corporate & Seminars', text: 'Sound, projector and a professional setup for conferences, annual dinners and product launches.', pkg: 'corporate', guests: '50–500 guests' },
  { slug: 'Milad', icon: 'moon', image: 'milad.webp', title: 'Milad & Family', text: 'A calm, respectful space for milad, aqiqah and family gatherings, with food arranged for you.', pkg: 'wedding-basic', guests: '40–300 guests' },
  { slug: 'Birthday', icon: 'cake', image: 'party.webp', title: 'Birthdays & Parties', text: 'Flexible morning or evening shifts with decoration and catering add-ons.', pkg: 'wedding-basic', guests: '30–300 guests' },
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
  { to: '/about', label: 'About Us', icon: 'users', hint: 'Our story, promise & how we work' },
  { to: '/contact', label: 'Contact', icon: 'phone', hint: 'Call, WhatsApp, visit or message us' },
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
