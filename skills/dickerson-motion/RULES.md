# Dickerson motion: rules

Read this whole file at the start of every run, before planning anything. A brief can add rules or make these stricter; it can't loosen them. Every critique round grades against this file.

## 1. The generic AI look is banned

| Banned | Do this instead |
|---|---|
| A centered title on a gradient | Set type on the layout grid (left-aligned, or on a clear axis) over a real photo or the flat `#111111` background. |
| Everything fading in | Give every entrance a direction and a reason: a mask reveal, a slide along the layout, a wipe that follows the before/after divider, a cut on the beat. Opacity can help a move along but is never the whole entrance. |
| A logo tacked on at the end as the only branding | Keep the brand present throughout: the logo on screen within the first 3 s and again on the end card, with the brand red and faces carrying every scene. |
| Corner labels | Labels ride on what they describe (BEFORE and AFTER travel with their slider halves). No scene numbers, "NEW" chips, timestamps, location tags or other chips parked in the corners. The location belongs in the logo lockup or on the end card. |
| Frame borders | No outlines, rounded "device" frames, polaroid borders or viewfinder brackets around the video or its photos. Photos bleed off the edge or feather into the background. |
| Glow on UI | No outer glow, neon, bloom or lens flare on text, buttons or graphics. Use flat brand color. A tight dark shadow (blur ≤ 18 px, opacity ≤ 55%) is allowed for legibility over photos. |
| Generic particle bursts | No confetti, sparkles, floating dust, bokeh, light leaks or particle explosions. Texture comes from the real photos, or from seeded grain at low strength. |

Also out, for the same reason: gradient blobs and mesh backgrounds, glassmorphism cards, emoji and stock icons (lightning bolts, sparkles, rockets), 3D spinning logos, text typed out letter by letter, and numbers that count up.

## 2. Hook and cadence

- **Hook in the first 2 seconds.** Frame 0 is a settled, meaningful frame: it's the thumbnail on every platform. The hook line is fully readable by 2.0 s. No black lead-in, logo sting or slow fade-up.
- **Something new every 2–4 seconds:** a cut, a new line, a slider reveal, a new photo, or a move that shows something new. Nothing may hold for more than 4 s without a new element. The 2 fps contact sheet in the critique loop makes stalls obvious.
- **Readable.** Keep one idea per scene. Any line meant to be read stays fully settled for about 0.3 s per word. Every word the viewer must read passes the 360-px phone test (see `CRITIQUE.md`).

## 3. Deterministic render contract

- The composition exposes `window.seek(t)`. Every visual property is a pure function of `t` in seconds, so seeking to the same `t` gives the same pixels no matter what was seeked before.
- Render mode has no CSS transitions, CSS animations or `@keyframes`, and no state driven by `setTimeout`, `setInterval` or `requestAnimationFrame`. Visual code never calls `Math.random`, `Date.now`, `performance.now` or `new Date`. Autoplaying `<video>` and `<audio>` and animated GIFs are out; if footage is needed, pre-extract its frames with ffmpeg.
- **Seeded noise only.** Use `rng(seed)` and `noise(seed, x)` from the template's `motion.js`. Grain is seeded by frame number.
- The renderer waits for `window.__ready` (fonts loaded, images decoded, text fitted) before the first `seek`.
- `node render.mjs --lint` must pass (it scans for the banned APIs), and `node render.mjs --check-determinism` must report identical frames.
- **One timeline, three native layouts:** 1080×1920, 1080×1080 and 1920×1080, each laid out by `layout(format)`. Never make one format by cropping, scaling or letterboxing another (see `RENDER.md`).

## 4. Brand (v1 values)

### Colors

Use a dark background, one red accent family and white text.

| Role | Hex | Source |
|---|---|---|
| Background | `#111111` | Pixel-sampled from the owner's current restoration ads (Drive "System restoration / 10/2026") |
| Red for fills, bars and labels | `#AB1525` | Same ads |
| Red for text on dark | `#D51E30` | Same ads |
| Text | `#FAFAFA` | Same ads; also "Off White" in the Branding Details doc |
| Website accent red | `#AB1B1F` | dickersonservices.com theme CSS (`--color_2/7/16`, rgba(171, 27, 31)), the same family as the ads |
| Brand doc red | `#E52000` | Branding Details doc (Drive). It doesn't match the site or the ads, so don't use it unless the brief says to. |
| Brand doc dark grey | `#333333` | Branding Details doc. Secondary surfaces only. |
| Slogan red | `#EE3324` | Sampled from `drive_Slogan.png`. It exists only inside the slogan artwork; never set type in it. |

### Faces

Use one display face and one UI face, and nothing else.

- **Display: Noto Sans Display**, ExtraBold to Black (800–900) at condensed widths (62.5–75%), in uppercase, for headlines. This echoes the tall condensed headlines in the owner's ads.
- **UI: Noto Sans**, SemiBold to Bold (600–700) at normal width, for labels, checklists, sentence-case lines, the phone number and the URL. It's the live site's theme font.
- Both are SIL OFL. `INSTALL.md` has the download commands.

### Logo

The logo appears in every piece: within the first 3 s and on the end card. Use the files as supplied. Never redraw, re-type, stretch, outline or add effects, and don't recolor beyond the supplied white and black versions.

| File (in the v1 asset bundle's `brand/` folder) | What it is | Use |
|---|---|---|
| `drive_Logo-w-name_transparent_grey-layer-style.png` | Silver "D" mark over DICKERSON / SERVICES, transparent | End card and large lockups on dark |
| `DERIVED_logo-w-name_WHITE_trimmed.png` | White recolor of the primary lockup, trimmed | The small lockup on dark or over photos |
| `DERIVED_logo-icon_WHITE_trimmed.png` | White "D" mark only | Tight spaces |
| `DERIVED_name-logo_WHITE_trimmed.png` | White wordmark only | Lockups that animate the mark and the name separately |
| `DERIVED_logo-w-name_BLACK_trimmed.png` | Black lockup, trimmed | Light backgrounds only |
| `drive_Logo-w-name_transparent.png` | Primary lockup, black, 4267×3000 | Light backgrounds and print |
| `drive_Logo-w-name-slogan_transparent.png` | Primary lockup plus the red slogan | Brand story end cards only |
| `drive_Logo-icon_transparent.png`, `drive_Name-Logo.png` | Black mark; black wordmark | Light backgrounds |
| `drive_Slogan.png` | "INNOVATE YOUR HOME, ELEVATE YOUR LIFE" in red | Brand story only |
| `drive_Logo-in-Name_Vector.eps` | Vector source | Re-export at any size |
| `drive_Truck-Pic-w-Logo.jpg` | Real photo of the wrapped Dickerson truck | Brand story and end card backgrounds |
| `site_logo_White-Dickerson-Services_full.png` | Website header logo (black despite the name, 398×280), from `https://irp.cdn-website.com/6562e0c4/dms3rep/multi/White-Dickerson-Services-a02f8a41.png` | Reference only; too small for video |
| `site_truck-illustration_Dickerson-Services-Truck.png`, `site_favicon.ico` | Cut-out of the wrapped truck from the website (transparent PNG); favicon | Only if the brief asks, and never in place of a job photo |

The `DERIVED_*` files are recolors of the official Drive PNGs (alpha kept, cropped to content), since Drive has no white logo. The sources are:
- Drive "07 Branding Logos": the PNGs.
- Drive "Logo and Branding": the EPS.
- Drive "06 Team Trucks Uniforms": the truck photo.
- The live site.

None of these files are in this public repo: copy them from the asset bundle into the project's `assets/brand/`.

### Contact details

For end cards: phone **256-203-6612** (never 850-491-7883, a hidden number on the site), **dickersonservices.com**, contact@dickersonservices.com, and "Guntersville, Alabama" or "North Alabama".

## 5. Tone and claims

- Honest and education-forward: about 90% education and 10% invitation, with one clear, low-pressure call to action. The brand voice is educational, direct, clear and engaging: "Guidance, Not Pressure".
- No fake urgency: no "limited time", countdowns, "act now" or "only a few left".
- No scare tactics about mold or health: no mold claims, no "your air is making you sick", no allergy or asthma claims.
- No invented stats, testimonials, reviews, star ratings or prices. Reviews and testimonials appear only when the brief supplies the exact text and who said it.
- **Prices: only those the brief explicitly supplies,** worded as supplied. The only other numbers allowed are the phone number and real readings visible in a real photo the brief approves (shown as that one job's reading, never as a general claim).
- No promised outcomes ("like new", "guaranteed extra years", "never replace again", savings percentages) and no attacks on competitors.

## 6. Imagery

- **Real job photos only**, from Dickerson's own jobs (CompanyCam). Never AI-generated, stock or invented equipment imagery, and never equipment composited into a scene.
- A before/after pair comes from one job, with matched framing. Allowed edits: crop, scale, reframe, light sharpening, and exposure or white-balance correction applied equally to both halves. Not allowed: adding or removing components, cleaning up a "before", or generative fill.
- Privacy: no customer faces without permission, and no house numbers, license plates, street signs or customer names. Strip GPS data. Never commit job photos to a public repo.
- **Banned imagery is a hard filter.** A brief can ban imagery, for example "no mini-splits", "no crawlspace shots" or "no competitor trucks". Handle it like this:
  - Copy the list into the constraints block at the top of the shot list.
  - Before planning, check every candidate photo against it. Check the whole photo, not one crop, because each format reframes it.
  - Drop any photo that fails.
  - The ban also covers icons, illustrations and words that depict a banned item.
  - Any banned item on screen fails the piece, whatever its other scores.
