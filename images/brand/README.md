# Barefoot Baltic — brand logo (master assets)

Hand-lettered wordmark. Vector masters + raster fallbacks for any future use
(web, print, email, social, merch). Keep these as the source of truth.

- **Brand red:** `#982335`
- **Typeface:** Bristol (Jovanny Lemonad, via Canva) — the band-free "Barefoot
  Baltic." wordmark. These files are **outline traces**, so no font is embedded
  and there are no licensing strings. Note: the Bristol *font file* is free for
  personal use only (commercial licence sold separately) — do not extract or
  ship the font itself; use these traced outlines instead.
- **Spacing (tuned 2026-05-31):** horizontal word-gap ≈ 0.28× cap height,
  stacked line-gap ≈ 0.29×.

## Files

| Form | Use |
|------|-----|
| `barefoot-baltic-wide-*`    | Horizontal lockup, one line. Primary mark. |
| `barefoot-baltic-stacked-*` | Two-line lockup (square-ish). |

Colours: `-red` (#982335, brand), `-black` (#1a1a1a), `-white` (for dark
backgrounds). Each comes as `.svg` (scales infinitely — use this by default)
and `.png` (high-res raster fallback for contexts that don't support SVG).

`barefoot-baltic-monogram-*` is the standalone **B** mark (Bristol B, brand red),
used for the favicon and Apple touch icon where the full wordmark is illegible.

## Favicon

- `../favicon.ico` — multi-res (16/32/48), white-circle badge + red B.
- `../apple-touch-icon.png` — 180×180, opaque white + red B (iOS rounds corners).

Both regenerated band-free from `barefoot-baltic-monogram-red.svg`.

## Live-site rasters

The site nav, RSS channel images, invoice PDFs and JSON-LD schema all reference
fixed PNG filenames in `../` (parent `images/` folder), regenerated band-free
from these masters:

- `../logo-wide-color.png` — nav logo (aspect 207:56, sized by CSS `height:56`).
- `../logo-wide-white.png` — white variant (archived templates only).
- `../logo-full.png` — 512×512 schema/Organization logo.

These stay **PNG on purpose**: RSS readers and Google's invoice HTML→PDF
converter don't reliably render SVG. To regenerate after editing a master:

```bash
# nav logo (drop-in, keeps 207:56 footprint)
magick -background none -density 320 barefoot-baltic-wide-red.svg _w.png
#   then letterbox _w.png into a 621x168 transparent canvas, centered → ../logo-wide-color.png
# schema logo
magick -background none -density 360 barefoot-baltic-stacked-red.svg _s.png
#   then center into a 512x512 transparent canvas → ../logo-full.png
```
