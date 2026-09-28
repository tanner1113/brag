// Where everything goes in each format. Scenes take every position and type size from
// layout(format) and never hard-code pixels, so each format is laid out, not cropped.
// Pure functions only: `npm test` checks the boxes without rendering anything.

export const FORMATS = {
  vertical: { id: '9x16', w: 1080, h: 1920 },
  square: { id: '1x1', w: 1080, h: 1080 },
  landscape: { id: '16x9', w: 1920, h: 1080 },
};

const box = (x, y, w, h) => ({ x, y, w, h });

const LAYOUTS = {
  // Photo on top, text below. Reels and TikTok cover about the top 220 px, the bottom 420 px
  // and a strip on the right, so must-read text stays inside `safe`.
  vertical: {
    safe: box(90, 220, 870, 1280),
    photo: { ...box(0, 0, 1080, 1160), fade: 'bottom' },
    logo: box(90, 250, 250, 60),
    headline: { ...box(90, 1030, 870, 464), size: 116, lineHeight: 1.0, maxLines: 4 },
    body: { ...box(90, 1030, 870, 464), size: 60, lineHeight: 1.2, maxLines: 6 },
    label: { size: 34 },
    end: {
      logo: box(90, 420, 600, 300),
      button: { ...box(90, 900, 870, 124), size: 54 },
      phone: { ...box(90, 1080, 870, 120), size: 104 },
      url: { ...box(90, 1220, 870, 70), size: 54 },
    },
  },
  // The same stack, tighter. Feed placements have no overlays to dodge, only a 60 px margin.
  square: {
    safe: box(60, 60, 960, 960),
    photo: { ...box(0, 0, 1080, 640), fade: 'bottom' },
    logo: box(60, 70, 210, 52),
    headline: { ...box(60, 620, 960, 380), size: 92, lineHeight: 1.0, maxLines: 4 },
    body: { ...box(60, 620, 960, 380), size: 52, lineHeight: 1.2, maxLines: 6 },
    label: { size: 32 },
    end: {
      logo: box(60, 150, 480, 240),
      button: { ...box(60, 520, 960, 112), size: 48 },
      phone: { ...box(60, 670, 960, 104), size: 90 },
      url: { ...box(60, 800, 960, 60), size: 48 },
    },
  },
  // Photo left, text right, inside a 96 px title-safe margin. Type is set large enough
  // to survive the 360-px phone test, since wide videos also play in phone feeds.
  landscape: {
    safe: box(96, 60, 1728, 960),
    photo: { ...box(0, 0, 1100, 1080), fade: 'right' },
    logo: box(1160, 96, 250, 60),
    headline: { ...box(1160, 300, 664, 560), size: 100, lineHeight: 1.0, maxLines: 5 },
    body: { ...box(1160, 300, 664, 560), size: 60, lineHeight: 1.2, maxLines: 7 },
    label: { size: 40 },
    end: {
      logo: box(1160, 150, 560, 280),
      button: { ...box(1160, 520, 664, 110), size: 46 },
      phone: { ...box(1160, 670, 664, 100), size: 88 },
      url: { ...box(1160, 790, 664, 60), size: 46 },
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
