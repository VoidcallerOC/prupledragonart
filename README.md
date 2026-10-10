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

## Navigation and layout

- **Header:** sticky, aligned to the content grid (`--max` 1320px, `--gutter` clamp(16px, 4vw, 56px)). Links run Work, Details, Hole in One, Process, Custom, Fine Fettle, Instagram.
- **Desktop (1024px and up):** one row of links. Each link is at least 44px tall, with an amber underline on hover and keyboard focus.
- **Below 1024px:** a compact menu button (`aria-expanded`, `aria-controls`). It opens and closes by click, tap, Enter or Space. Escape closes it and returns focus to the button. It also closes on outside click, on choosing a link, or when the window widens to desktop. Without JavaScript, the links simply wrap.
- **Anchors:** sections use `scroll-margin-top` tied to `--header-h`, so headings land below the sticky header.
- **Breakpoints:** 1099px (two-column gallery rhythm), 960px (stacked hero and section heads), 720px (single-column phones).

## Accents

A restrained psychedelic layer that sits around the work, never over it:
- **Colors:** eight colors sampled from the resin pieces (`--r-*` tokens in `index.html`).
- **Frames:** warped prismatic rings behind seven photos, peeking out around the edges.
- **Dividers:** wavy line dividers between sections.
- **Poster accents:** radiating rings in two empty areas, short prismatic bars under headings, prismatic hairlines on the header, footer and labels, and an offset color shadow on the hero heading.

The photos are never filtered or overlaid. A geometry check confirms the rings don't overlap any image or text at 1000, 1366 and 1920px. On phones the frames shrink to a single ring and the radiating rings are hidden.

## Starfield

`assets/starfield.js` (no dependencies) draws a fixed canvas behind all content. It ignores clicks and scrolling, which keep working normally.
- **Stars:** about 320 at 1366×900, in three depth layers of cool white, violet, amber and pink, with a few larger glowing points.
- **Mouse or pen:** stars spring toward the cursor and get dragged along by its motion, with short trails. They ease back home within about 2 seconds of the pointer stopping.
- **Touch screens:** slow ambient drift, no pointer response.
- **Reduced motion:** one still frame, with no trails and no pointer response.
- **Readability:** stars behind text blocks, labels and buttons are drawn at about a third of their brightness. Photos sit above the canvas.
- **Cost:** about 0.6 ms of script per frame at 60 fps in headless Chromium.

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
