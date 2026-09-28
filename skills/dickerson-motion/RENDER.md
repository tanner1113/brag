# Three formats from one timeline

Every piece renders natively in three formats from a single timeline:

| Format | Size | Id | Typical use |
|---|---|---|---|
| `vertical` | 1080×1920 | `9x16` | Reels, TikTok, Stories, Shorts |
| `square` | 1080×1080 | `1x1` | Facebook and Instagram feed |
| `landscape` | 1920×1080 | `16x9` | YouTube, the website, Facebook feed |

Each format is **laid out, not cropped**. The scenes ask `layout(format)` where things go and how big the type is, and every photo is reframed per format around its own focal point. Never make one format by cropping, scaling or letterboxing another.

## Project layout

Copy `templates/project/` to the project folder, for example `projects/<slug>/`:

```text
<slug>/
  composition/
    index.html      loads the modules; the page for ?format=vertical|square|landscape
    styles.css      brand colors and faces; no transitions or animations
    layout.js       FORMATS, layout(format) and cover(): where everything goes
    motion.js       easing, progress(), and the seeded rng() and noise()
    timeline.js     the shots and window.seek(t)
    fonts/          NotoSansDisplay-VF.ttf, NotoSans-VF.ttf (download: INSTALL.md)
  assets/photos/    job photos (never committed)
  assets/brand/     logo files from RULES.md (never committed)
  docs/             style_guide.md, shotlist.md, review_log.md
  work/             beats.json, audio/mix.wav, frames/<id>/ (the frame cache)
  out/              renders, posters, stills
  review/           critique images
  test/layout.test.mjs
  render.mjs
  package.json      puppeteer-core
```

## The layout function

`layout(format)` is a pure function that returns named regions in pixels. `cover()` fits an image to a region.

| Region | What it is |
|---|---|
| `safe` | Where must-read text may go. Platform UI covers the rest: in vertical, about the top 220 px, the bottom 420 px and a strip on the right. |
| `photo` | The photo window, and which edge fades into the background (`fade: 'bottom'` or `'right'`). |
| `logo` | The small logo lockup, on screen from frame 0. |
| `headline`, `body` | Text boxes with `size`, `lineHeight` and `maxLines`. Text shrinks to fit the box and never overflows it. |
| `label` | The size of labels that ride on the image (BEFORE and AFTER). |
| `end` | The end card: `logo`, `button`, `phone` and `url` boxes. |

- **Vertical** stacks the photo above the text.
- **Square** uses the same stack, tighter.
- **Landscape** puts the photo on the left and the text on the right.

Scenes contain no pixel positions of their own:

- They read every box from the layout and fit text to it.
- Every photo gets a focal point (`focus: [x, y]`, 0–1), so `cover()` keeps the subject in frame in every format, including during push-ins and seeded drift.
- Check the banned-imagery list against the whole photo, since each format shows a different part of it.

Check the layout without rendering anything:

```bash
npm test
```

It checks that every must-read box sits inside the safe area, that text fits its line budget, that end card parts don't overlap, and that `cover()` never uncovers an edge.

## The seek(t) contract

RULES.md section 3 has the rule. In practice:

- `timeline.js` builds the DOM once, then `window.seek(t)` sets every moving property from `t` alone, through `progress(t, start, dur, ease)`.
- It exposes `window.COMPOSITION` (`duration`, `fps`, `format`, `width`, `height`).
- It exposes `window.__ready`, which resolves once fonts are loaded, images decoded and text fitted. If anything is missing, it rejects with the list of missing files.
- Scene changes are visibility switches at exact times, under a hard cut on a beat or at the midpoint of a full-cover wipe.
- Previews in a browser (after `node render.mjs --serve`) use the same `seek`: `/composition/index.html?format=square&t=4.2`, with `&guides=1` to outline the layout boxes. Guides never appear in renders.

## Commands

Run these from the project folder:

```bash
npm install                                   # puppeteer-core (uses your installed Chrome)
node render.mjs --lint                        # the contract: no timers, clocks, Math.random, transitions
node render.mjs --check-determinism           # seek out of order in every format, compare frames
node render.mjs --stills 0,2,7.5 --format all # review stills -> out/stills/<id>/t_07.50.png (--guides to outline boxes)
node render.mjs --format all --audio work/audio/mix.wav --version 1    # the full render
node render.mjs --format square --range 12-16 --audio work/audio/mix.wav --version 2
                                              # re-render seconds 12-16 of one format, then re-encode
```

- `--format` takes `vertical`, `square`, `landscape`, a comma list, or `all` (the default).
- Other options: `--slug NAME` (default: the folder name), `--version N` (default 1), `--workers N` (default: CPU count − 1, at most 6). Set `CHROME` if Chrome isn't in a standard location.
- Every render mode runs `--lint` first and stops if it fails.
- `--range` needs a complete frame cache from an earlier full render of that format. It overwrites only those frames, then re-encodes the whole file, so the audio stays in sync.

## Output names

`out/<slug>_<id>_<width>x<height>_v<N>.mp4`, with its poster (frame 0) as `.jpg`:

```text
out/restoration-explainer_9x16_1080x1920_v2.mp4
out/restoration-explainer_9x16_1080x1920_v2.jpg
out/restoration-explainer_1x1_1080x1080_v2.mp4
out/restoration-explainer_16x9_1920x1080_v2.mp4
out/stills/9x16/t_07.50.png
work/frames/9x16/f_00000.png                   the frame cache
review/restoration-explainer_9x16_1080x1920_v2/round-1/   critique images
```

Frame 0 is the thumbnail on every platform, so the hook must be settled on it. The encode is H.264 High (level 4.2), yuv420p, CRF 17 with BT.709 tags, plus AAC at 192 kbps and 48 kHz, with faststart. The same mix goes into all three files.

## Adding a scene

1. Add it to `SHOTS` in `timeline.js` with its beat-aligned `start` and `end`, and its photo files and focal points.
2. Build its elements once, inside a `.scene`, placing them only with boxes from `L` (the layout).
3. Give it a frame function of `t` that sets transforms, clip paths and positions through `progress()`.
4. Call it from `seek(t)` and switch the scene's visibility at its exact times.
5. If the scene needs a box the layout doesn't have yet, add that region to all three formats in `layout.js`, and extend `test/layout.test.mjs`.
