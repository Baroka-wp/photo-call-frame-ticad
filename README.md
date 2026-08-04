# TICAD Youth Drive 2026 — Photo Frame

Web app that lets participants drop their photo into the official **TICAD Youth Drive 2026** frame,
add their name and country, then download or share the result.

**Event:** August 13–14, 2026 · Mensvic Grand Hotel, Accra, Ghana

## What's in this repo

```
index.html        2026 app (mobile first)
styles.css        2026 styles
script.js         canvas composer
countries.js      country list (193 entries)
flags/            193 flag SVGs, self-hosted (from flag-icons, MIT)
frame.png         2026 frame artwork, 1274 x 1068
2025/             archived TICAD9 2025 edition, untouched
```

The previous edition is **archived, not deleted**. It stays reachable at `/2025/`.

## Features

- Mobile first layout, 48px touch targets, safe-area padding
- Photo added by tap, file picker or drag and drop
- Drag to reposition inside the frame, slider or pinch to zoom
- Name and country burned into the canvas in the frame's own typography (Montserrat, orange `#CE843C`)
- Flag of the selected country drawn next to the country name, with a thin white
  outline so pale flags stay readable on the green frame
- Automatic font shrinking so long names and country names stay inside the frame
- PNG download at full frame resolution
- Native share sheet on mobile, clipboard copy on desktop, download as fallback

## Frame geometry

All canvas coordinates live in the `FRAME` object at the top of `script.js`,
expressed in the frame's native pixels (1274 × 1068):

| Element      | Position                        |
| ------------ | ------------------------------- |
| Photo window | x 166, y 275, 420 × 454, r 24   |
| Name         | x 172, baseline 783, 51px / 800 |
| Flag         | x 172, 59 × 44, 14px gap before the country name |
| Country      | baseline 868, 60px / 300 italic |

If the artwork is ever re-exported at a different size, update those values only.

Five country names are too long to sit next to the flag at a readable size.
The `SHORT_NAMES` map holds the abbreviated form used on the frame; the dropdown
still shows the full official name.

## Running locally

Static site, no build step. Serve the folder over HTTP:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Serving over HTTP is required: the flags are
read with `fetch`, which browsers block on `file://`. Opened directly from disk
the app still works, just without the flag.

## Hashtags

`#TICADYouthDrive2026` `#AfricaJapanYouth`
