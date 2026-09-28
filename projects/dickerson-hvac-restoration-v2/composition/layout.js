// Where everything goes in each format. Scenes take every position and type size from
// layout(format) and never hard-code pixels, so each format is laid out, not cropped.
// Pure functions only: `npm test` checks the boxes without rendering anything.
//
// Every format reserves a header band that holds only the logo badge. Transitions (the photo
// swipe, the brand wipes) are confined to `content`, below the band, so the badge is never
// covered or cut; the badge also sits above every other layer.

export const FORMATS = {
  vertical: { id: '9x16', w: 1080, h: 1920 },
  square: { id: '1x1', w: 1080, h: 1080 },
  landscape: { id: '16x9', w: 1920, h: 1080 },
};

const box = (x, y, w, h) => ({ x, y, w, h });

const LAYOUTS = {
  // Primary. Reels and TikTok cover about the top 220 px, the bottom 420 px and a strip on the
  // right, so every must-read line stays inside `safe`.
  vertical: {
    safe: box(90, 220, 870, 1280),
    header: box(0, 0, 1080, 362),
    badge: box(90, 228, 220, 116),
    content: box(0, 362, 1080, 1558),
    photo: { ...box(0, 372, 1080, 690), fade: 'bottom' },
    text: { ...box(90, 1082, 870, 418), anchor: 'top' },
    kicker: { size: 36, gap: 16 },
    headline: { size: 104, lineHeight: 1.0 },
    rows: { size: 56, rowH: 112, gap: 20 },
    checklist: { size: 54, rowH: 84, gap: 18, box: 58 },
    statement: { size: 60, lineHeight: 1.15 },
    label: { size: 32, at: 0.42 },
    end: {
      logo: box(90, 400, 560, 299),
      offer: { ...box(90, 780, 870, 210), size: 100 },
      checks: { ...box(90, 1024, 870, 150), size: 50, rowH: 72, box: 48 },
      button: { ...box(90, 1214, 870, 124), size: 60 },
      url: { ...box(90, 1368, 870, 70), size: 50 },
    },
  },
  // The same stack, tighter. Feed placements have no overlays to dodge, only a margin.
  square: {
    safe: box(60, 30, 960, 1010),
    header: box(0, 0, 1080, 138),
    badge: box(60, 36, 170, 90),
    content: box(0, 138, 1080, 942),
    photo: { ...box(0, 146, 1080, 500), fade: 'bottom' },
    text: { ...box(60, 664, 960, 366), anchor: 'top' },
    kicker: { size: 32, gap: 12 },
    headline: { size: 84, lineHeight: 1.0 },
    rows: { size: 48, rowH: 96, gap: 16 },
    checklist: { size: 48, rowH: 72, gap: 14, box: 50 },
    statement: { size: 52, lineHeight: 1.15 },
    label: { size: 30, at: 0.44 },
    end: {
      logo: box(60, 170, 420, 224),
      offer: { ...box(60, 430, 960, 170), size: 84 },
      checks: { ...box(60, 622, 960, 128), size: 44, rowH: 64, box: 42 },
      button: { ...box(60, 776, 960, 108), size: 52 },
      url: { ...box(60, 908, 960, 62), size: 46 },
    },
  },
  // Photo left, text right. Type is sized to survive the 360-px phone test, since wide videos
  // also play in phone feeds: the smallest must-read text is 64 px.
  landscape: {
    safe: box(96, 30, 1728, 1020),
    header: box(0, 0, 1920, 150),
    badge: box(96, 38, 180, 95),
    content: box(0, 150, 1920, 930),
    photo: { ...box(0, 150, 980, 930), fade: 'right' },
    text: { ...box(1040, 190, 784, 840), anchor: 'center' },
    kicker: { size: 44, gap: 18 },
    headline: { size: 112, lineHeight: 1.0 },
    rows: { size: 52, rowH: 110, gap: 24 },
    checklist: { size: 60, rowH: 92, gap: 22, box: 64 },
    statement: { size: 64, lineHeight: 1.15 },
    label: { size: 40, at: 0.42 },
    end: {
      logo: box(140, 330, 720, 384),
      offer: { ...box(1040, 250, 784, 230), size: 108 },
      checks: { ...box(1040, 500, 784, 212), size: 60, rowH: 72, box: 52 },
      button: { ...box(1040, 736, 784, 124), size: 64 },
      url: { ...box(1040, 884, 784, 76), size: 60 },
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

// Interpolate between two boxes (the badge's travel into the end card logo).
export function lerpBox(a, b, p) {
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p };
}
