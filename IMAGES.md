# Image slots (public/images)

Replace a file with a new image **using the same file name** and the site updates everywhere. Use .webp (1600x900 for hero-*, ~900px wide for the rest).

| File | Used in |
|---|---|
| hero-1.webp | Home carousel 1 (red rose stage), Booking banner |
| hero-7.webp | Facilities banner (hall) |
| hero-6.webp | Home carousel 2 (couple on stage), Weddings event, Packages banner |
| hero-3.webp | Home carousel 3 (holud stage), About banner |
| hero-2.webp | Home carousel 4 (candle-lit couple), Events + My bookings banner |
| hero-8 / hero-9 / hero-10 .webp | Packages / Booking / About banners |
| hero-4.webp | Home carousel 5 (catering), Food banner |
| hero-5.webp | Gallery banner |
| ceremony.webp | Home + About ceremony block |
| reception / corporate / milad / party .webp | Events cards (Receptions / Corporate / Milad / Birthday) |
| crowd.webp | Home FAQ + About FAQ (group photo) |
| m-1..m-14.webp | Home “Moments” 3D carousel (portrait 3:4, 720x960; list in `src/data.js` -> `moments`) |
| n-*.webp | Extra gallery tiles |
| g-*.webp | Gallery page tiles (list in `src/data.js` -> `gallery`) |
| food-<id>.webp | Food menu dish photos (ids in `src/data.js` -> `foodItems`) |
| logo-mark.png | In-site logo (transparent; tinted by CSS) |

Icons (favicon, PWA, apple-touch) are in `public/`, generated from the venue logo emblem.

## Photo gallery (added in v15)

- `public/images/gallery/pNNN.webp` = full size (1400px, lightbox) and `pNNN-t.webp` = thumbnail (560px, grid). 103 photos, numbered in the order of the original Facebook.zip (`p001` = first file). `p057` (near-black frame) was left out.
- The full list with categories (Weddings / Nikah & Engagement / Reception / Holud / Couple shoots / Venue & events) is `src/galleryPhotos.js`. To add a photo: put `pNNN.webp` + `pNNN-t.webp` in `public/images/gallery/` and add one line there.
- hero-11 (Contact), hero-12 (Events), hero-13 (My bookings), hero-14 (Staff dashboard): page banners, one unique photo per page.
- Other spots using gallery photos: Home “Faces of happiness” ribbon (`PhotoMarquee` in `pages/Home.jsx`), and photo rows (`PhotoStrip`) on About, Facilities, Events and Packages.
- The gallery folder is not precached by the PWA; photos are cached as they are viewed.
