# Purple Dragon Artwork — homepage concept

Concept redesign for Forge-CT's client Purple Dragon Artwork ([@purpledragonartwork](https://www.instagram.com/purpledragonartwork/)).

## Preview

Serve the folder and open `index.html`, for example `python3 -m http.server` and then http://localhost:8000. The page is static and loads nothing from other hosts.

## Type

All fonts are packaged in `assets/fonts/`: latin woff2 files from `@fontsource` 5.3.0, under the SIL Open Font License (licences included).

| Use | Font | Weights |
|---|---|---|
| Headings, nav, buttons | Barlow Condensed | 700, 800 |
| Body, captions | Barlow | 400, 400 italic, 600 |
| Item numbers, source lines only | IBM Plex Mono | 500 |

`font-synthesis: none` is set, so the browser never fakes a bold or italic. Chrome DevTools platform-font checks confirm each text style renders in its webfont, with no system fallback.

## Photos

Every image is the artist's own: a photo from a public Instagram post, or a still from one of the artist's Reels. All are saved locally in `assets/photos/` (no hotlinking).

`assets/photos/manifest.json` records, for each file:
- the source post or Reel URL
- the carousel item, or the time in the video for Reel stills
- the post date
- the original pixel size
- any crop

Crops only remove things the page must not show:
- price overlays
- printed or burned-in hours
- handwritten sales tallies
- burned-in Reel titles
- one coaster with profanity, and a cannabis-leaf coaster

Left out entirely:
- photos showing a price sign, the shop's licence certificate, an email address, private people's faces, or profanity that couldn't be cropped
- Reels with hours on every frame

Assets live in `assets/`, not `public/`, on purpose: with Vercel's "Other" preset, a `public/` folder becomes the site root and would hide `index.html`.

## Copy rules

Short, plain labels in the format "Item · Detail · Status". No slogans, quotes, exclamation marks, emoji, or third-person references to the artist.

- Hole in One numbers and "Sold" appear only where the artist's posts confirm them.
- No prices, availability claims, shipping, turnaround times, reviews, contact details other than Instagram, process claims, or pop-up days and hours.

## Gaps

- **Logan piece:** not found in any public post or search result.
- **Unavailable on Instagram:** two posts returned "Post isn't available": DZBU8XQk5UZ (Wu-Tang designs) and DZWK6wLxKoK (a Reel).
- **Not checked:** Highlights and most of the ~2,770 posts need a logged-in session.
