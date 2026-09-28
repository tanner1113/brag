// Dickerson Services, HVAC System Restoration, v2: one timeline, three native formats.
// Everything on screen is a pure function of t in seconds: window.seek(t) sets it, and nothing
// else moves anything. Shots, copy and times follow docs/shotlist.md; every scene change sits on
// a measured beat from work/beats.json.
// Preview: /composition/index.html?format=square&t=4.2 (add &guides=1 to outline the layout boxes).
import { cover, layout, lerpBox } from './layout.js';
import { clamp, ease, lerp, noise, progress } from './motion.js';

const params = new URLSearchParams(location.search);
const FORMAT = params.get('format') || 'vertical';
const L = layout(FORMAT);
const FPS = 30;
const DURATION = 29.6;

// Video times of the measured beats each move sits on (docs/shotlist.md).
const T = {
  swipe: 3.265, sweep2: 3.784, paths: 5.445, highlight: 6.524, rise: 7.2,
  s4a: 7.621, sweep4a: 8.156, s4b: 9.807, sweep4b: 10.335, s4c: 11.987, sweep4c: 12.515,
  s4d: 14.169, rows4d: [14.169, 14.442, 14.715], sweep4d: 15.789,
  s5a: 18.528, s5b: 22.337, line2: 22.9, end: 25.086, build: 25.33,
};
const WIPE_DUR = 0.46;
const WIPES = [T.s5a, T.end]; // full cover lands on these downbeats

// A line is a string, or a list of [text, accent] segments.
const COPY = {
  hook: ['TIRED OF', 'BEING TOLD', 'YOU NEED A', [['NEW SYSTEM?', true]]],
  third: ['YOU MAY HAVE A', [['THIRD OPTION.', true]]],
  paths: ['REPAIR', 'SYSTEM RESTORATION', 'REPLACEMENT'],
  s4a: ['MORE THAN A', 'BASIC TUNE-UP.'],
  s4b: ['DEEP CLEANING', 'OF ACCESSIBLE', 'COMPONENTS'],
  s4c: ['REPLACEMENT', 'OF DEFINED', 'AGE-RELATED PARTS'],
  checklist: {
    vertical: ['PERFORMANCE CHECKS', 'BEFORE-AND-AFTER PHOTOS', 'WRITTEN CONDITION REPORT'],
    square: ['PERFORMANCE CHECKS', 'BEFORE-AND-AFTER PHOTOS', 'WRITTEN CONDITION REPORT'],
    landscape: ['PERFORMANCE CHECKS', 'BEFORE-AND-AFTER\nPHOTOS', 'WRITTEN CONDITION\nREPORT'],
  },
  evidence: {
    vertical: ['We don’t decide', 'the answer before', [['looking at the system.', true]]],
    square: ['We don’t decide', 'the answer before', [['looking at the system.', true]]],
    landscape: ['We don’t decide', 'the answer before', [['looking at', true]], [['the system.', true]]],
  },
  statement: ['Replacement may be', 'the right answer.', 'It shouldn’t be the', [['automatic answer.', true]]],
  offer: [[['$85 ', true], ['AGING HVAC', false]], 'EVALUATION'],
  checks: {
    vertical: ['A clear first look', 'A next-step recommendation'],
    square: ['A clear first look', 'A next-step recommendation'],
    landscape: ['A clear first look', 'A next-step\nrecommendation'],
  },
  phone: '256-203-6612',
  url: 'dickersonservices.com',
};
const perFormat = (v) => (Array.isArray(v) ? v : v[FORMAT]);

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
function image(src, cls, parent = stage) {
  const i = el('img', cls, parent);
  i.src = src;
  i.alt = '';
  return i;
}
const show = (e, on) => { e.style.visibility = on ? 'visible' : 'hidden'; };
const segs = (line) => (typeof line === 'string' ? [[line, false]] : line);
const photo = (name) => `/assets/photos/${name}.png`;

// ---- photo band: every photo lives inside it, so nothing photographic reaches the header band ----
const band = el('div', `band fade-${L.photo.fade}`);
place(band, L.photo);
const BW = L.photo.w;
const BH = L.photo.h;
const inner = { x: 0, y: 0, w: BW, h: BH };

// A photo layer: a still, or a before/after pair whose AFTER half is revealed by a divider that
// sweeps left to right, with each label riding on its own side of the divider (no corner labels).
// Both halves share one framing: a slow push-in around the focal point plus seeded drift.
function photoLayer({ before, after = null, focus = [0.5, 0.5], seed = 1, z1 = 1.06 }) {
  const layer = el('div', 'layer', band);
  place(layer, inner);
  const imgs = [image(photo(before), '', layer)];
  const pair = {};
  if (after) {
    pair.clip = el('div', 'clip', layer);
    place(pair.clip, inner);
    imgs.push(image(photo(after), '', pair.clip));
    pair.divider = el('div', 'divider', layer);
    pair.before = el('div', 'tag', layer);
    pair.after = el('div', 'tag red', layer);
    pair.before.textContent = 'BEFORE';
    pair.after.textContent = 'AFTER';
    for (const tag of [pair.before, pair.after]) {
      tag.style.fontSize = px(L.label.size);
      tag.style.top = px(BH * L.label.at);
    }
  }
  const dim = el('div', 'dim', layer);
  place(dim, inner);
  const f = Array.isArray(focus) ? focus : focus[FORMAT];
  return (t, { on, t0, t1, sweep = null, dimAmt = 0, dx = 0 }) => {
    show(layer, on);
    layer.style.transform = `translateX(${px(dx)})`;
    const z = lerp(1, z1, ease.inOutSine(clamp((t - t0) / (t1 - t0))));
    const nx = noise(seed, t * 0.35) * 6;
    const ny = noise(seed + 7, t * 0.35) * 4;
    for (const i of imgs) {
      const c = cover(i.naturalWidth, i.naturalHeight, inner, f, z, nx, ny);
      Object.assign(i.style, { left: px(c.x), top: px(c.y), width: px(c.w), height: px(c.h) });
    }
    if (after) {
      const x = lerp(-0.02, 1.02, sweep ? progress(t, sweep.start, sweep.dur, ease.inOutCubic) : 0) * BW;
      const gap = 18;
      pair.clip.style.clipPath = `inset(0 ${px(Math.max(0, BW - x))} 0 0)`;
      pair.divider.style.left = px(x - 3);
      pair.before.style.left = px(x + gap);
      pair.after.style.left = px(x - gap - pair.after.offsetWidth);
      const clear = clamp(1 - dimAmt / 0.3);
      pair.before.style.opacity = String(clamp((BW - x - gap - pair.before.offsetWidth) / 40) * clear);
      pair.after.style.opacity = String(clamp((x - gap - pair.after.offsetWidth) / 40) * clear);
    }
    dim.style.opacity = String(dimAmt);
  };
}

// ---- type ----

// Lines that rise out of their masks one after another, and rise away on exit.
function textLines(cls, lines, size, lineHeight) {
  const wrap = el('div', cls);
  const spans = lines.map((line) => {
    const inner = el('span', '', el('div', 'mask', wrap));
    for (const [text, accent] of segs(line)) {
      const s = el('span', accent ? 'accent' : '', inner);
      s.textContent = text;
    }
    return inner;
  });
  let fs = size;
  const api = {
    get height() { return lines.length * fs * lineHeight; },
    fit(maxW) {
      Object.assign(wrap.style, { fontSize: px(size), lineHeight: String(lineHeight) });
      const widest = Math.max(...spans.map((s) => s.getBoundingClientRect().width));
      fs = size * Math.min(1, maxW / widest);
      wrap.style.fontSize = px(fs);
      return api;
    },
    at(x, y, w) {
      place(wrap, { x, y, w, h: api.height });
      return api;
    },
    // tIn: a start time (lines follow 0.08 s apart) or one start time per line.
    frame(t, tIn, tOut = Infinity) {
      let visible = false;
      spans.forEach((s, i) => {
        const start = Array.isArray(tIn) ? tIn[i] : tIn + i * 0.08;
        const pin = progress(t, start, 0.42, ease.outQuart);
        const pout = progress(t, tOut + i * 0.04, 0.25, ease.inCubic);
        s.style.transform = `translateY(${((1 - pin) * 110 - pout * 110).toFixed(2)}%)`;
        visible ||= pin > 0 && pout < 1;
      });
      show(wrap, visible);
    },
  };
  return api;
}

// A red kicker tag, revealed from the left and cleared to the right.
function kickerTag(text) {
  const tag = el('div', 'kicker');
  tag.textContent = text;
  tag.style.fontSize = px(L.kicker.size);
  return {
    tag,
    get height() { return tag.offsetHeight; },
    fit(maxW) {
      tag.style.fontSize = px(L.kicker.size);
      if (tag.offsetWidth > maxW) tag.style.fontSize = px(L.kicker.size * maxW / tag.offsetWidth);
    },
    at(x, y) {
      Object.assign(tag.style, { left: px(x), top: px(y) });
    },
    frame(t, tIn, tOut = Infinity, instant = false) {
      const pin = instant ? Number(t >= tIn) : progress(t, tIn, 0.3, ease.outCubic);
      const pout = progress(t, tOut, 0.2, ease.inCubic);
      tag.style.clipPath = `inset(0 ${((1 - pin) * 100).toFixed(2)}% 0 ${(pout * 100).toFixed(2)}%)`;
      show(tag, pin > 0 && pout < 1);
    },
  };
}

const CHECK = '<svg viewBox="0 0 24 24"><polyline points="5.5,12.5 10,17 18.5,7.5" fill="none" stroke="#FAFAFA" stroke-width="3.2" stroke-linecap="square"/></svg>';

// Check rows: a red box that ticks, then the text slides in from the left out of a mask.
function checkRows(items, spec, caps) {
  const rows = items.map((text) => {
    const r = el('div', `check-row${caps ? ' caps' : ''}`);
    const b = el('div', 'cbox', r);
    b.innerHTML = CHECK;
    const tx = el('span', 'txt', r);
    tx.textContent = text;
    return { r, b, tx, svg: b.querySelector('svg') };
  });
  let total = 0;
  return {
    get height() { return total; },
    fit(maxW) {
      let fs = spec.size;
      const gap = 0.45;
      for (const { r, b } of rows) {
        r.style.fontSize = px(spec.size);
        r.style.gap = `${gap}em`;
        Object.assign(b.style, { width: px(spec.box), height: px(spec.box) });
      }
      const widest = Math.max(...rows.map(({ tx }) => tx.getBoundingClientRect().width));
      fs = spec.size * Math.min(1, (maxW - spec.box - gap * spec.size) / widest);
      for (const { r } of rows) r.style.fontSize = px(fs);
      total = rows.reduce((sum, { r }) => sum + r.offsetHeight, 0) + (rows.length - 1) * (spec.gap ?? 14);
    },
    at(x, y) {
      let yy = y;
      for (const { r } of rows) {
        Object.assign(r.style, { left: px(x), top: px(yy) });
        yy += r.offsetHeight + (spec.gap ?? 14);
      }
    },
    frame(t, starts, tHide = Infinity) {
      rows.forEach(({ r, svg }, i) => {
        const p = progress(t, starts[i], 0.4, ease.outQuart);
        const k = progress(t, starts[i] + 0.12, 0.25, ease.outCubic);
        r.style.transform = `translateX(${((1 - p) * -40).toFixed(2)}px)`;
        r.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`;
        svg.style.transform = `scale(${k.toFixed(3)})`;
        show(r, p > 0 && t < tHide);
      });
    },
  };
}

// ---- scenes ----
const layers = {
  hook: photoLayer({ before: '11_before', focus: [0.5, 0.42], seed: 3 }),
  s2: photoLayer({ before: '08_before', after: '08_after', focus: [0.45, 0.45], seed: 5 }),
  s4a: photoLayer({ before: '04_before', after: '04_after', focus: { vertical: [0.4, 0.55], square: [0.4, 0.62], landscape: [0.4, 0.55] }, seed: 7 }),
  s4b: photoLayer({ before: '09_before', after: '09_after', focus: [0.5, 0.45], seed: 9 }),
  s4c: photoLayer({ before: '06_before', after: '06_after', focus: { vertical: [0.62, 0.5], square: [0.6, 0.5], landscape: [0.75, 0.5] }, seed: 11 }),
  s4d: photoLayer({ before: '07_before', after: '07_after', focus: { vertical: [0.5, 0.35], square: [0.5, 0.3], landscape: [0.5, 0.4] }, seed: 13 }),
  s5: photoLayer({ before: '10_before', focus: { vertical: [0.55, 0.45], square: [0.55, 0.5], landscape: [0.5, 0.45] }, seed: 15, z1: 1.08 }),
};

const hook = textLines('lines', COPY.hook, L.headline.size, L.headline.lineHeight);
const third = textLines('lines', COPY.third, L.headline.size, L.headline.lineHeight);
const h4a = textLines('lines', COPY.s4a, L.headline.size, L.headline.lineHeight);
const h4b = textLines('lines', COPY.s4b, L.headline.size, L.headline.lineHeight);
const h4c = textLines('lines', COPY.s4c, L.headline.size, L.headline.lineHeight);
const checklist = checkRows(perFormat(COPY.checklist), L.checklist, true);
const kA = kickerTag('SYSTEM RESTORATION');
const kB = kickerTag('MAY INCLUDE');
const kC = kickerTag('EVIDENCE BEFORE RECOMMENDATION');
const evidence = textLines('sentence', perFormat(COPY.evidence), L.statement.size, L.statement.lineHeight);
const statement = textLines('sentence', COPY.statement, L.statement.size, L.statement.lineHeight);

// Three paths: rows slide in, the middle one fills red and then rises into the kicker slot.
const ROW_PAD = [0.34, 0.6];
const KICK_PAD = [0.22, 0.55];
const paths = COPY.paths.map((label) => {
  const r = el('div', 'path');
  const fill = el('div', 'fill', r);
  const s = el('span', '', r);
  s.textContent = label;
  return { r, fill };
});
const pathPos = [];
let kickerY = 0;

// End card.
const offer = textLines('lines', COPY.offer, L.end.offer.size, 1.0);
const endChecks = checkRows(perFormat(COPY.checks), { ...L.end.checks, gap: 12 }, false);
const button = el('div', 'button');
el('span', 'book', button).textContent = 'BOOK';
el('span', 'phone', button).textContent = COPY.phone;
const url = textLines('sentence url', [COPY.url], L.end.url.size, 1.2);

// Brand wipe: confined to the content area below the header band.
const wipe = el('div', 'wipe');
place(wipe, L.content);

// The badge: on screen from frame 0, above every layer, and it travels into the end card logo.
const badge = image('/assets/brand/logo-white.png', 'badge');
const silver = image('/assets/brand/logo-silver.png', 'logo-silver');

if (params.has('guides')) {
  for (const b of [L.safe, L.header, L.photo, L.text, L.badge, ...Object.values(L.end)]) place(el('div', 'guide'), b);
}

// ---- static layout, measured once fonts and images are ready ----
function arrange() {
  const tw = L.text.w;
  const anchorTop = (h) => (L.text.anchor === 'center' ? L.text.y + (L.text.h - h) / 2 : L.text.y);
  for (const k of [kA, kB, kC]) k.fit(tw);
  const kickH = kA.height + L.kicker.gap;

  for (const h of [hook, third, h4a, h4b, h4c]) h.fit(tw);
  hook.at(L.text.x, anchorTop(hook.height), tw);
  third.at(L.text.x, anchorTop(third.height), tw);

  // 4a-4d share one kicker slot, so the kicker never jumps between scenes.
  checklist.fit(tw);
  const groupH = kickH + Math.max(h4a.height, h4b.height, h4c.height, checklist.height);
  kickerY = anchorTop(groupH);
  for (const k of [kA, kB]) k.at(L.text.x, kickerY);
  for (const h of [h4a, h4b, h4c]) h.at(L.text.x, kickerY + kickH, tw);
  checklist.at(L.text.x, kickerY + kickH);

  evidence.fit(tw);
  const evTop = anchorTop(kickH + evidence.height);
  kC.at(L.text.x, evTop);
  evidence.at(L.text.x, evTop + kickH, tw);
  statement.fit(tw);
  statement.at(L.text.x, anchorTop(statement.height), tw);

  const rowsTop = anchorTop(3 * L.rows.rowH + 2 * L.rows.gap);
  paths.forEach(({ r }, i) => {
    r.style.fontSize = px(L.rows.size);
    r.style.padding = `${ROW_PAD[0]}em ${ROW_PAD[1]}em`;
    pathPos[i] = { x: L.text.x, y: rowsTop + i * (L.rows.rowH + L.rows.gap) + (L.rows.rowH - r.offsetHeight) / 2 };
  });

  const E = L.end;
  offer.fit(E.offer.w);
  offer.at(E.offer.x, E.offer.y, E.offer.w);
  endChecks.fit(E.checks.w);
  endChecks.at(E.checks.x, E.checks.y);
  place(button, E.button);
  button.style.fontSize = px(E.button.size);
  url.fit(E.url.w);
  url.at(E.url.x, E.url.y, E.url.w);
}

function pathsFrame(t) {
  const on = t >= T.paths && t < T.s4a;
  const lit = progress(t, T.highlight, 0.3, ease.outCubic);
  const rise = progress(t, T.rise, T.s4a - T.rise, ease.inOutCubic);
  paths.forEach(({ r, fill }, i) => {
    show(r, on);
    const p = progress(t, T.paths + i * 0.08, 0.4, ease.outQuart);
    let { x, y } = pathPos[i];
    let size = L.rows.size;
    let pad = ROW_PAD;
    let clipL = 0;
    if (i === 1) {
      fill.style.clipPath = `inset(0 ${((1 - lit) * 100).toFixed(2)}% 0 0)`;
      y = lerp(y, kickerY, rise);
      size = lerp(L.rows.size, L.kicker.size, rise);
      pad = [lerp(ROW_PAD[0], KICK_PAD[0], rise), lerp(ROW_PAD[1], KICK_PAD[1], rise)];
    } else {
      fill.style.clipPath = 'inset(0 100% 0 0)';
      r.style.opacity = String(1 - 0.55 * lit);
      clipL = progress(t, T.rise, 0.25, ease.inCubic) * 100;
    }
    Object.assign(r.style, {
      left: px(x + (1 - p) * -40), top: px(y), fontSize: px(size), padding: `${pad[0]}em ${pad[1]}em`,
      clipPath: `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 ${clipL.toFixed(2)}%)`,
    });
  });
}

function wipeFrame(t) {
  let clip = 'inset(0 100% 0 0)';
  let on = false;
  for (const mid of WIPES) {
    const lead = progress(t, mid - WIPE_DUR / 2, WIPE_DUR / 2, ease.inOutCubic);
    const trail = progress(t, mid, WIPE_DUR / 2, ease.inOutCubic);
    if (lead > 0 && trail < 1) {
      on = true;
      clip = `inset(0 ${((1 - lead) * 100).toFixed(3)}% 0 ${(trail * 100).toFixed(3)}%)`;
    }
  }
  wipe.style.clipPath = clip;
  show(wipe, on);
}

function logoFrame(t) {
  const p = progress(t, T.build, 0.66, ease.inOutCubic);
  const b = lerpBox(L.badge, L.end.logo, p);
  for (const img of [badge, silver]) {
    Object.assign(img.style, { left: px(b.x), top: px(b.y), width: px(b.w), height: px(b.w * img.naturalHeight / img.naturalWidth) });
  }
  const mix = clamp((p - 0.2) / 0.6);
  badge.style.opacity = String(1 - mix);
  silver.style.opacity = String(mix);
  show(silver, mix > 0);
  show(badge, mix < 1);
}

function endFrame(t) {
  const on = t >= T.end;
  offer.frame(t, on ? T.build + 0.22 : Infinity);
  endChecks.frame(t, [T.build + 0.72, T.build + 1.02]);
  const b = progress(t, T.build + 1.32, 0.38, ease.outQuart);
  button.style.clipPath = `inset(0 ${((1 - b) * 100).toFixed(2)}% 0 0)`;
  button.style.transform = `translateX(${((1 - b) * -30).toFixed(2)}px)`;
  show(button, b > 0);
  url.frame(t, on ? T.build + 1.52 : Infinity);
}

function seek(t) {
  t = clamp(t, 0, DURATION);
  const swipe = progress(t, T.swipe, 0.42, ease.inOutCubic);

  layers.hook(t, { on: t < T.swipe + 0.42, t0: 0, t1: T.swipe, dx: -0.3 * BW * swipe });
  layers.s2(t, {
    on: t >= T.swipe && t < T.s4a, t0: T.swipe, t1: T.s4a, dx: (1 - swipe) * BW,
    sweep: { start: T.sweep2, dur: 1.0 }, dimAmt: 0.62 * progress(t, T.paths, 0.5, ease.inOutSine),
  });
  layers.s4a(t, { on: t >= T.s4a && t < T.s4b, t0: T.s4a, t1: T.s4b, sweep: { start: T.sweep4a, dur: 1.0 } });
  layers.s4b(t, { on: t >= T.s4b && t < T.s4c, t0: T.s4b, t1: T.s4c, sweep: { start: T.sweep4b, dur: 1.0 } });
  layers.s4c(t, { on: t >= T.s4c && t < T.s4d, t0: T.s4c, t1: T.s4d, sweep: { start: T.sweep4c, dur: 1.0 } });
  layers.s4d(t, { on: t >= T.s4d && t < T.s5a, t0: T.s4d, t1: T.s5a, sweep: { start: T.sweep4d, dur: 1.2 } });
  layers.s5(t, { on: t >= T.s5a && t < T.end, t0: T.s5a, t1: T.end, dimAmt: 0.72 * progress(t, T.s5b, 0.45, ease.inOutSine) });

  hook.frame(t, -1, T.swipe - 0.28);
  third.frame(t, T.swipe + 0.04, T.paths - 0.28);
  pathsFrame(t);
  kA.frame(t, T.s4a, T.s4b - 0.22, true);
  h4a.frame(t, T.s4a + 0.04, T.s4b - 0.28);
  kB.frame(t, T.s4b + 0.06, t >= T.s5a ? -Infinity : Infinity);
  h4b.frame(t, T.s4b + 0.04, T.s4c - 0.28);
  h4c.frame(t, T.s4c + 0.04, T.s4d - 0.28);
  checklist.frame(t, T.rows4d, T.s5a);
  kC.frame(t, T.s5a + 0.04, T.s5b - 0.25);
  evidence.frame(t, T.s5a + 0.06, T.s5b - 0.25);
  statement.frame(t, [T.s5b, T.s5b + 0.08, T.line2, T.line2 + 0.08], t >= T.end ? -Infinity : Infinity);

  wipeFrame(t);
  logoFrame(t);
  endFrame(t);
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
  if (missing.length) throw new Error(`missing assets: ${missing.join(', ')} (run prep-assets.py; fonts: INSTALL.md)`);
  arrange();
  seek(Number(params.get('t') || 0));
  return true;
}

window.seek = seek;
window.COMPOSITION = { duration: DURATION, fps: FPS, format: FORMAT, width: L.w, height: L.h };
window.__ready = ready();
