// The piece as one timeline. Everything on screen is a pure function of t in seconds:
// window.seek(t) sets it, and nothing else moves anything (RULES.md, section 3).
// Replace SHOTS with the approved docs/shotlist.md; its boundaries sit on beats from work/beats.json.
// Preview: /composition/index.html?format=square&t=4.2 (add &guides=1 to see the layout boxes).
import { layout, cover } from './layout.js';
import { clamp, lerp, ease, progress, noise } from './motion.js';

const params = new URLSearchParams(location.search);
const FORMAT = params.get('format') || 'vertical';
const L = layout(FORMAT);
const FPS = 30;

const LOGO_SMALL = '/assets/brand/DERIVED_logo-w-name_WHITE_trimmed.png';
const SHOTS = {
  hook: {
    start: 0, end: 3.0,
    photo: '/assets/photos/hook.jpg', focus: [0.5, 0.45],
    lines: ['REPLACE WITH', 'THE APPROVED', 'HOOK LINE'], accent: 2,
  },
  reveal: {
    start: 3.0, end: 7.6,
    before: '/assets/photos/before.jpg', after: '/assets/photos/after.jpg', focus: [0.5, 0.5],
    lines: ['ONE IDEA', 'PER SCENE'], accent: 0,
    sweep: { start: 4.1, dur: 1.4 },
  },
  end: {
    start: 7.6, end: 10.5,
    logo: '/assets/brand/drive_Logo-w-name_transparent_grey-layer-style.png',
    cta: 'THE CTA FROM THE BRIEF', phone: '256-203-6612', url: 'dickersonservices.com',
  },
};
const WIPE = { start: 7.3, dur: 0.6 }; // brand-red wipe; the scenes swap at its midpoint, under full cover
const DURATION = SHOTS.end.end;

const stage = document.getElementById('stage');
Object.assign(stage.style, { width: `${L.w}px`, height: `${L.h}px` });

const px = (v) => `${v.toFixed(2)}px`;
function el(tag, cls, parent = stage) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  parent.appendChild(e);
  return e;
}
function place(e, b) {
  Object.assign(e.style, { left: px(b.x), top: px(b.y), width: px(b.w), height: px(b.h) });
}
function image(src, cls, parent) {
  const i = el('img', cls, parent);
  i.src = src;
  i.alt = '';
  return i;
}

// A photo window: each layer covers the region around the focal point, pushes in slowly and
// drifts a few pixels on seeded noise. Layers share framing, so before/after halves line up.
function photoWindow(parent, region, focus, seed) {
  const wrap = el('div', `photo fade-${region.fade}`, parent);
  place(wrap, region);
  const inner = { x: 0, y: 0, w: region.w, h: region.h };
  const layers = [];
  return {
    wrap,
    add(src, into = wrap) {
      layers.push(image(src, '', into));
    },
    frame(t, t0, t1, z0 = 1.0, z1 = 1.06) {
      const z = lerp(z0, z1, ease.inOutSine(clamp((t - t0) / (t1 - t0))));
      const dx = noise(seed, t * 0.35) * 6;
      const dy = noise(seed + 7, t * 0.35) * 4;
      for (const i of layers) {
        const c = cover(i.naturalWidth, i.naturalHeight, inner, focus, z, dx, dy);
        Object.assign(i.style, { left: px(c.x), top: px(c.y), width: px(c.w), height: px(c.h) });
      }
    },
  };
}

// Display lines that slide up out of their masks one after another, fitted to their box.
function textBlock(parent, lines, b, accent) {
  const wrap = el('div', 'lines', parent);
  place(wrap, b);
  const spans = lines.map((text, i) => {
    const s = el('span', i === accent ? 'accent' : '', el('div', 'mask', wrap));
    s.textContent = text;
    return s;
  });
  return {
    fit() {
      Object.assign(wrap.style, { fontSize: px(b.size), lineHeight: String(b.lineHeight) });
      const widest = Math.max(...spans.map((s) => s.getBoundingClientRect().width));
      const scale = Math.min(1, b.w / widest, b.h / (lines.length * b.size * b.lineHeight));
      wrap.style.fontSize = px(b.size * scale);
    },
    frame(t, tIn) {
      spans.forEach((s, i) => {
        const p = progress(t, tIn + i * 0.08, 0.42, ease.outQuart);
        s.style.transform = `translateY(${((1 - p) * 110).toFixed(2)}%)`;
      });
    },
  };
}

// Before/after: the after photo is revealed as the divider sweeps left to right, and each
// label rides on its own half (no corner labels).
function beforeAfter(parent, shot) {
  const win = photoWindow(parent, L.photo, shot.focus, 11);
  win.add(shot.before);
  const clip = el('div', 'clip', win.wrap);
  place(clip, { x: 0, y: 0, w: L.photo.w, h: L.photo.h });
  win.add(shot.after, clip);
  const divider = el('div', 'divider', win.wrap);
  const before = el('div', 'tag', win.wrap);
  const after = el('div', 'tag red', win.wrap);
  before.textContent = 'BEFORE';
  after.textContent = 'AFTER';
  for (const tag of [before, after]) {
    tag.style.fontSize = px(L.label.size);
    tag.style.top = px(L.photo.h * 0.42);
  }
  return (t) => {
    const x = lerp(-0.02, 1.02, progress(t, shot.sweep.start, shot.sweep.dur, ease.inOutCubic)) * L.photo.w;
    clip.style.clipPath = `inset(0 ${px(Math.max(0, L.photo.w - x))} 0 0)`;
    divider.style.left = px(x - 3);
    const gap = 18;
    before.style.left = px(x + gap);
    after.style.left = px(x - gap - after.offsetWidth);
    before.style.opacity = String(clamp((L.photo.w - x - gap - before.offsetWidth) / 40));
    after.style.opacity = String(clamp((x - gap - after.offsetWidth) / 40));
    win.frame(t, shot.start, shot.end);
  };
}

// End card: logo, CTA, phone and URL, each revealed from the left edge of its own box.
function endCard(parent, shot) {
  const E = L.end;
  const logo = image(shot.logo, 'end-logo', parent);
  place(logo, E.logo);
  const button = el('div', 'button', parent);
  place(button, E.button);
  const cta = el('span', '', button);
  cta.textContent = shot.cta;
  const phone = el('div', 'phone', parent);
  const url = el('div', 'url', parent);
  phone.textContent = shot.phone;
  url.textContent = shot.url;
  for (const [e, b] of [[button, E.button], [phone, E.phone], [url, E.url]]) {
    place(e, b);
    e.style.fontSize = px(b.size);
  }
  const parts = [logo, button, phone, url];
  return {
    fit() {
      const room = button.clientWidth - 2 * parseFloat(getComputedStyle(button).paddingLeft);
      if (cta.offsetWidth > room) button.style.fontSize = px(E.button.size * (room / cta.offsetWidth));
    },
    frame(t) {
      parts.forEach((p, i) => {
        const k = progress(t, shot.start + 0.05 + i * 0.1, 0.45, ease.outQuart);
        p.style.transform = `translateX(${((1 - k) * -40).toFixed(2)}px)`;
        p.style.clipPath = `inset(0 ${((1 - k) * 100).toFixed(2)}% 0 0)`;
      });
    },
  };
}

const scenes = { hook: el('div', 'scene'), reveal: el('div', 'scene'), end: el('div', 'scene') };
const hookWin = photoWindow(scenes.hook, L.photo, SHOTS.hook.focus, 3);
hookWin.add(SHOTS.hook.photo);
const hookText = textBlock(scenes.hook, SHOTS.hook.lines, L.headline, SHOTS.hook.accent);
const revealFrame = beforeAfter(scenes.reveal, SHOTS.reveal);
const revealText = textBlock(scenes.reveal, SHOTS.reveal.lines, L.headline, SHOTS.reveal.accent);
const card = endCard(scenes.end, SHOTS.end);
const logo = image(LOGO_SMALL, 'bug', stage); // on screen from frame 0 until the end card takes over
place(logo, L.logo);
const wipe = el('div', 'wipe');

if (params.has('guides')) {
  for (const b of [L.safe, L.photo, L.headline, L.logo, ...Object.values(L.end)]) place(el('div', 'guide'), b);
}

const show = (e, on) => { e.style.visibility = on ? 'visible' : 'hidden'; };

function seek(t) {
  t = clamp(t, 0, DURATION);
  const { hook, reveal, end } = SHOTS;
  show(scenes.hook, t < hook.end);
  show(scenes.reveal, t >= reveal.start && t < reveal.end);
  show(scenes.end, t >= end.start);
  show(logo, t < end.start);

  hookWin.frame(t, hook.start, hook.end);
  hookText.frame(t, -1); // settled on frame 0: it's the thumbnail
  revealFrame(t);
  revealText.frame(t, reveal.start + 0.1);
  card.frame(t);

  const lead = progress(t, WIPE.start, WIPE.dur / 2, ease.inOutCubic);
  const trail = progress(t, WIPE.start + WIPE.dur / 2, WIPE.dur / 2, ease.inOutCubic);
  wipe.style.clipPath = `inset(0 ${((1 - lead) * 100).toFixed(3)}% 0 ${(trail * 100).toFixed(3)}%)`;
  show(wipe, lead > 0 && trail < 1);
  return t;
}

async function ready() {
  const missing = [];
  const fonts = [['900 100px "Noto Sans Display"', 'NotoSansDisplay-VF.ttf'], ['700 60px "Noto Sans"', 'NotoSans-VF.ttf']];
  for (const [spec, file] of fonts) {
    const faces = await document.fonts.load(spec).catch(() => []);
    if (!faces.length) missing.push(`composition/fonts/${file}`);
  }
  await Promise.all([...stage.querySelectorAll('img')].map((i) => i.decode().catch(() => missing.push(i.getAttribute('src')))));
  if (missing.length) throw new Error(`missing assets: ${missing.join(', ')} (see RENDER.md, "Project layout")`);
  hookText.fit();
  revealText.fit();
  card.fit();
  seek(Number(params.get('t') || 0));
  return true;
}

window.seek = seek;
window.COMPOSITION = { duration: DURATION, fps: FPS, format: FORMAT, width: L.w, height: L.h };
window.__ready = ready();
