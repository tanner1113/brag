// Where everything goes in each format. Scenes take every position and type size from
// layout(format) and never hard-code pixels, so each format is laid out, not cropped.
// Pure functions only: `npm test` checks the boxes without rendering anything.
//
// Every format reserves a header band that holds only the logo badge. Transitions (the photo
// push, the brand wipe) are confined to `content`, below the band, so the badge is never
// covered or cut; the badge also sits above every other layer.
// `split` is the axis the 4c before/after split runs along: side by side ('x') or stacked ('y');
// `grid` lays out the 5a evidence tiles the same way. Both follow the photo band's feather, so
// every half or tile fades alike.

export const FORMATS = {
  vertical: { id: '9x16', w: 1080, h: 1920 },
  square: { id: '1x1', w: 1080, h: 1080 },
  landscape: { id: '16x9', w: 1920, h: 1080 },
};

const box = (x, y, w, h) => ({ x, y, w, h });

const LAYOUTS = {
  // Primary. Reels and TikTok cover about the top 220 px, the bottom 420 px and a strip on the
  // right, so every must-read line stays inside `safe`. The photo band runs down behind the top
  // of the text block, feathering out under it.
  vertical: {
    safe: box(90, 220, 870, 1280),
    header: box(0, 0, 1080, 362),
    badge: box(90, 222, 250, 132),
    content: box(0, 362, 1080, 1558),
    photo: { ...box(0, 372, 1080, 940), fade: 'bottom' },
    text: { ...box(90, 1082, 870, 418), anchor: 'top' },
    kicker: { size: 50, gap: 16 },
    headline: { size: 104, lineHeight: 1.0 },
    rows: { size: 100, gap: 14 },
    checklist: { size: 56, rowH: 84, gap: 20, box: 58 },
    statement: { size: 60, lineHeight: 1.15 },
    label: { size: 50, at: 0.4, x: 0.5 },
    split: 'x',
    grid: { axis: 'x', gap: 12 },
    end: {
      logo: box(90, 392, 640, 342),
      offer: { ...box(90, 780, 870, 210), size: 100 },
      checks: { ...box(90, 1024, 870, 150), size: 54, rowH: 72, box: 52 },
      button: { ...box(90, 1200, 870, 140), size: 72 },
      url: { ...box(90, 1370, 870, 76), size: 56 },
    },
  },
  // The same stack, tighter. Feed placements have no overlays to dodge, only a margin.
  square: {
    safe: box(60, 30, 960, 1010),
    header: box(0, 0, 1080, 138),
    badge: box(60, 32, 190, 100),
    content: box(0, 138, 1080, 942),
    photo: { ...box(0, 146, 1080, 600), fade: 'bottom' },
    text: { ...box(60, 664, 960, 366), anchor: 'top' },
    kicker: { size: 46, gap: 12 },
    headline: { size: 84, lineHeight: 1.0 },
    rows: { size: 86, gap: 12 },
    checklist: { size: 50, rowH: 72, gap: 14, box: 50 },
    statement: { size: 52, lineHeight: 1.15 },
    label: { size: 46, at: 0.4, x: 0.5 },
    split: 'x',
    grid: { axis: 'x', gap: 12 },
    end: {
      logo: box(60, 152, 460, 246),
      offer: { ...box(60, 420, 960, 170), size: 84 },
      checks: { ...box(60, 606, 960, 128), size: 46, rowH: 64, box: 44 },
      button: { ...box(60, 752, 960, 120), size: 60 },
      url: { ...box(60, 896, 960, 64), size: 48 },
    },
  },
  // Photo left, text right. Wide videos also play small in phone feeds, so type is sized for the
  // 360-px phone test: must-read lines 84 px or more, kickers and labels 64-76.
  landscape: {
    safe: box(96, 30, 1728, 1020),
    header: box(0, 0, 1920, 150),
    badge: box(96, 30, 200, 106),
    content: box(0, 150, 1920, 930),
    photo: { ...box(0, 150, 860, 930), fade: 'right' },
    text: { ...box(900, 190, 924, 840), anchor: 'center' },
    kicker: { size: 76, gap: 22 },
    headline: { size: 120, lineHeight: 1.0 },
    rows: { size: 120, gap: 18 },
    checklist: { size: 84, rowH: 100, gap: 26, box: 80 },
    statement: { size: 84, lineHeight: 1.15 },
    label: { size: 64, at: 0.4, x: 0.42 },
    split: 'y',
    grid: { axis: 'y', gap: 14 },
    end: {
      logo: box(96, 400, 560, 299),
      offer: { ...box(760, 170, 1064, 250), size: 124 },
      checks: { ...box(760, 450, 1064, 300), size: 84, rowH: 92, box: 70 },
      button: { ...box(760, 780, 1064, 136), size: 88 },
      url: { ...box(760, 946, 1064, 90), size: 80 },
    },
  },
};

export function layout(format) {
  const f = FORMATS[format];
  if (!f) throw new Error(`unknown format "${format}"; use ${Object.keys(FORMATS).join(', ')}`);
  return { format, ...f, ...structuredClone(LAYOUTS[format]) };
}

const clampTo = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Scale and place an image so it covers `region`, with the focal point (0-1 on each axis)
// as close to the region's center as the image's edges allow. `zoom` > 1 pushes in around
// the focal point; `dx`/`dy` nudge it (seeded drift) without ever uncovering an edge.
export function cover(imgW, imgH, region, focus = [0.5, 0.5], zoom = 1, dx = 0, dy = 0) {
  const scale = Math.max(region.w / imgW, region.h / imgH) * zoom;
  const w = imgW * scale;
  const h = imgH * scale;
  const x = clampTo(region.x + region.w / 2 - focus[0] * w + dx, region.x + region.w - w, region.x);
  const y = clampTo(region.y + region.h / 2 - focus[1] * h + dy, region.y + region.h - h, region.y);
  return { x, y, w, h, scale };
}

// Split `length` into n tiles with `gap` between them: [{ at, size }] along one axis.
export function tiles(length, n, gap) {
  const size = (length - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ at: i * (size + gap), size }));
}

// Interpolate between two boxes (the badge's travel into the end card logo).
export function lerpBox(a, b, p) {
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p };
}
