# Image slots (public/images)

Replace a file with a new image **using the same file name** and the site updates everywhere. Use .webp (about 1600px wide for hero images, 900px for the rest).

## Existing images -> Bengali wedding pictures
| File | Used in | What to put |
|---|---|---|
| hero-1.webp | Home carousel slide 1, Gallery (large) | Bengali bride & groom entering the hall (flower shower) |
| hero-2.webp | Home carousel, Gallery, Packages banner | Convention hall decorated for a wedding: stage, floral gate |
| hero-3.webp | Home carousel, About banner | Wide shot of a spacious AC convention hall, round tables set |
| hero-4.webp | Home carousel, Facilities and Food banner | Bengali wedding feast: buffet / guests dining |
| hero-5.webp | Gallery, Birthday event | Holud / mehendi decor or a hall entrance at night |
| hero-6.webp | Weddings event, Events banner | Bengali bride in red saree, close-up |
| ceremony.webp | Home + About (ceremony block), Receptions | Nikah / akd ceremony with family |
| crowd.webp | Gallery, Corporate event, FAQ | Guests celebrating at a reception |

## New: Food photos (optional, one per dish)
`food-<id>.webp`. Until a file exists the card shows a gradient + emoji tile, so nothing looks broken.

sharbat, jali-kabab, fish-fry, morog-polao, kacchi, plain-polao, rezala, mezbani, roast, rui, ilish, chingri, dal, veg, salad, firni, roshogolla, zorda, mishti-doi, borhani, soft-drinks, tea-coffee

Dishes, categories and which package serves what (with its variation) live in `src/data.js` -> `foodItems` (`by: { package-id: 'variation' }`).

Tip: use photos you have rights to (your own, or free-licence sources such as Unsplash / Pexels with attribution rules checked).
