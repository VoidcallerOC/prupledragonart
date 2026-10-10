# Purple Dragon Artwork — homepage concept

Concept redesign for Forge-CT's client Purple Dragon Artwork ([@purpledragonartwork](https://www.instagram.com/purpledragonartwork/)). **Preview only. Not published or deployed.**

## Preview

Open `index.html` in a browser. It's a single static page; only the Google Fonts load from the network.

## Photos

Every image is the artist's own photo, downloaded from their public Instagram posts into `assets/photos/` (no hotlinking). `assets/photos/manifest.json` records, for each file, the source post URL, the carousel item, the post date, the original pixel size, and any crop.

Assets live in `assets/`, not `public/`, on purpose: with Vercel's "Other" preset, a `public/` folder becomes the site root and would hide `index.html`.

Crops were made only to remove things the page must not show:
- Instagram text overlays with prices ("$50 order")
- Printed pop-up hours on tag cards
- The artist's handwritten sales tallies
- One coaster with profanity, and a cannabis-leaf coaster
- An email address on a tag card (that photo was left out entirely)

Photos with printed hours that couldn't be cropped out (Frozen set, HiO #195 Korn) or with schedule text on the image (two Reel covers) are not used.

## Gaps

- **Logan piece:** not in any of the 12 posts visible on the public profile. Not shown.
- **Fine Fettle pop-up display:** no retrievable photo of the display itself. The "In person" section uses a custom-order photo of the coaster-covered table from a post that tags Fine Fettle, captioned without claiming where it was taken.
- **Highlights and older posts** need a logged-in session and weren't retrieved.

## Content rules followed

No prices, shipping, turnaround times, reviews, contact details other than Instagram, or pop-up days and hours. Hole in One numbers and "Sold" tags come from the artist's own posts. Handwritten quotes are taken verbatim from the artist's captions and tag cards.
