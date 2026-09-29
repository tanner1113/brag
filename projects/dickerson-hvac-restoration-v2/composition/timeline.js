// Dickerson Services, HVAC System Restoration, v3: one timeline, three native formats.
// Everything on screen is a pure function of t in seconds: window.seek(t) sets it, and nothing
// else moves anything. Shots, copy and times follow docs/shotlist.md; the times live in
// timing.js, and every scene change sits on a measured beat from work/beats.json.
// Preview: /composition/index.html?format=square&t=4.2 (add &guides=1 to outline the layout boxes).
import { cover, layout, lerpBox, tiles } from './layout.js';
import { clamp, ease, lerp, noise, progress } from './motion.js';
import { BUTTON, DURATION, FPS, PRE, PUSH, SPLIT, SWEEP, SWEEP_4D, T, pushP, travel, wipeSpan } from './timing.js';

const params = new URLSearchParams(location.search);
const FORMAT = params.get('format') || 'vertical';
const L = layout(FORMAT);

// A line is a string, or a list of [text, accent] segments.
const COPY = {
  hook: ['TIRED OF', 'BEING TOLD', 'YOU NEED A', [['NEW SYSTEM?', true]]],
  third: ['YOU MAY HAVE A', [['THIRD OPTION.', true]]],
  paths: ['REPAIR', 'SYSTEM RESTORATION', 'REPLACEMENT'],
  s4a: ['MORE THAN A', 'BASIC TUNE-UP.'],
  s4b: ['DEEP CLEANING', 'OF ACCESSIBLE', 'COMPONENTS'],
  s4c: ['REPLACEMENT', 'OF DEFINED', 'AGE-RELATED PARTS'],
  checklist: {
    vertical: ['Performance checks', 'Before-and-after photos', 'Written condition report'],
    square: ['Performance checks', 'Before-and-after photos', 'Written condition report'],
    landscape: ['Performance checks', 'Before-and-after\nphotos', 'Written condition\nreport'],
  },
  evidenceHead: [[['EVIDENCE', true], [' BEFORE', false]], 'RECOMMENDATION.'],
  evidence: {
    vertical: ['We don’t decide the answer', 'before looking at the system.'],
    square: ['We don’t decide the answer', 'before looking at the system.'],
    landscape: ['We don’t decide the', 'answer before looking', 'at the system.'],
  },
  // The last line turns red on the build downbeat (see `flip`).
  statement: ['REPLACEMENT MAY BE', 'THE RIGHT ANSWER.', 'IT SHOULDN’T BE THE', 'AUTOMATIC ANSWER.'],
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
const GAP = 18; // between a label and the divider it rides

// A photo layer: a still, or a before/after pair from one job, both halves framed alike (a slow
// push-in around the focal point plus seeded drift). Three reveals, so no move runs three times
// in a row: 'x' sweeps a divider left to right, 'y' sweeps it top to bottom, and 'split' slides
// the AFTER half in beside the BEFORE half, along L.split. BEFORE and AFTER ride the divider on
// their own sides; the divider starts and ends off the frame, so they ride in and out with it
// and nothing is ever parked or faded.
function photoLayer({ before, after = null, focus = [0.5, 0.5], seed = 1, z1 = 1.06, reveal = 'x', punch = null }) {
  const layer = el('div', 'layer', band);
  place(layer, inner);
  const halves = [el('div', 'half', layer)];
  const imgs = [image(photo(before), '', halves[0])];
  const split = reveal === 'split';
  const axis = split ? L.split : reveal;
  const len = axis === 'x' ? BW : BH;
  const pair = {};
  if (after) {
    halves.push(el('div', 'half', layer));
    imgs.push(image(photo(after), '', halves[1]));
    pair.divider = el('div', 'divider', layer);
    place(pair.divider, axis === 'x' ? { x: 0, y: 0, w: 6, h: BH } : { x: 0, y: 0, w: BW, h: 6 });
    pair.before = el('div', 'tag', layer);
    pair.after = el('div', 'tag red', layer);
    pair.before.textContent = 'BEFORE';
    pair.after.textContent = 'AFTER';
    for (const tag of [pair.before, pair.after]) tag.style.fontSize = px(L.label.size);
  }
  for (const h of halves) place(h, inner);
  const dim = el('div', 'dim', layer);
  place(dim, inner);
  const f = Array.isArray(focus) ? focus : focus[FORMAT];
  const extent = (tag) => (axis === 'x' ? tag.offsetWidth : tag.offsetHeight);

  // A label rides `ahead` of the divider at d (on the far-edge side) or behind it.
  function ride(tag, d, ahead, opacity) {
    const at = ahead ? d + GAP : d - GAP - extent(tag);
    if (axis === 'x') Object.assign(tag.style, { left: px(at), top: px(BH * L.label.at) });
    else Object.assign(tag.style, { left: px(BW * L.label.x - tag.offsetWidth / 2), top: px(at) });
    tag.style.opacity = String(opacity);
  }

  return (t, { on, t0, t1, move = null, dimAmt = 0, dx = 0 }) => {
    show(layer, on);
    if (!on) return;
    layer.style.transform = `translateX(${px(dx)})`;
    let z = lerp(1, z1, ease.inOutSine(clamp((t - t0) / (t1 - t0))));
    if (punch) z *= 1 + punch.amt * progress(t, punch.at, punch.dur, ease.outCubic);
    const nx = noise(seed, t * 0.35) * 6;
    const ny = noise(seed + 7, t * 0.35) * 4;
    let d = 0;
    let shift = [0, 0];
    if (after) {
      const sB = extent(pair.before);
      const sA = extent(pair.after);
      if (split) {
        // The divider comes in fast and lands softly in the middle; each half slides so its own
        // focal point ends centered.
        d = lerp(len + GAP + sB + 6, len / 2, move ? progress(t, move.start, move.dur, ease.outCubic) : 0);
        shift = [-Math.max(0, len - d) / 2, d / 2];
      } else {
        d = lerp(-(GAP + sB + 6), len + GAP + sA + 6, move ? progress(t, move.start, move.dur, ease.inOutSine) : 0);
      }
    }
    imgs.forEach((img, i) => {
      const c = cover(img.naturalWidth, img.naturalHeight, inner, f, z, nx, ny);
      const sx = axis === 'x' ? shift[i] : 0;
      const sy = axis === 'y' ? shift[i] : 0;
      Object.assign(img.style, { left: px(c.x + sx), top: px(c.y + sy), width: px(c.w), height: px(c.h) });
    });
    if (after) {
      const cut = px(clamp(len - d, 0, len));
      const at = px(clamp(d, 0, len));
      if (split) {
        halves[0].style.clipPath = axis === 'x' ? `inset(0 ${cut} 0 0)` : `inset(0 0 ${cut} 0)`;
        halves[1].style.clipPath = axis === 'x' ? `inset(0 0 0 ${at})` : `inset(${at} 0 0 0)`;
      } else {
        halves[1].style.clipPath = axis === 'x' ? `inset(0 ${cut} 0 0)` : `inset(0 0 ${cut} 0)`;
      }
      const clear = clamp(1 - dimAmt / 0.3);
      pair.divider.style[axis === 'x' ? 'left' : 'top'] = px(d - 3);
      pair.divider.style.opacity = String(clear);
      // In a sweep AFTER trails the divider and BEFORE leads it; in a split BEFORE is behind.
      ride(pair.before, d, !split, clear);
      ride(pair.after, d, split, clear);
    }
    dim.style.opacity = String(dimAmt);
  };
}

// The 5a evidence: the before photos of three jobs side by side (stacked in landscape), each
// with its own slow push-in. The brand wipe's trailing edge reveals them.
function gridLayer(items, { seed = 21, z1 = 1.05 } = {}) {
  const layer = el('div', 'layer', band);
  place(layer, inner);
  const alongX = L.grid.axis === 'x';
  const cells = tiles(alongX ? BW : BH, items.length, L.grid.gap).map(({ at, size }, i) => {
    const b = alongX ? { x: at, y: 0, w: size, h: BH } : { x: 0, y: at, w: BW, h: size };
    const cell = el('div', 'half', layer);
    place(cell, b);
    return { img: image(photo(items[i].name), '', cell), region: { x: 0, y: 0, w: b.w, h: b.h }, focus: items[i].focus };
  });
  const dim = el('div', 'dim', layer);
  place(dim, inner);
  return (t, { on, t0, t1, dimAmt = 0 }) => {
    show(layer, on);
    if (!on) return;
    const z = lerp(1, z1, ease.inOutSine(clamp((t - t0) / (t1 - t0))));
    cells.forEach(({ img, region, focus }, i) => {
      const c = cover(img.naturalWidth, img.naturalHeight, region, focus, z, noise(seed + i, t * 0.35) * 4, noise(seed + 9 + i, t * 0.35) * 3);
      Object.assign(img.style, { left: px(c.x), top: px(c.y), width: px(c.w), height: px(c.h) });
    });
    dim.style.opacity = String(dimAmt);
  };
}

// ---- type ----

// Lines that rise out of their masks one after another.
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
    spans,
    get height() { return lines.length * fs * lineHeight; },
    fit(maxW) {
      Object.assign(wrap.style, { fontSize: px(size), lineHeight: String(lineHeight) });
      const widest = Math.max(...spans.map((s) => s.getBoundingClientRect().width));
      fs = size * Math.min(1, maxW / widest);
      wrap.style.fontSize = px(fs);
      return api;
    },
    // `bleed` widens each line's mask past the block on the left and right, so a sideways slide
    // (the push into scene 2) is clipped there instead of at the block's own edges.
    at(x, y, w, bleed = [0, 0]) {
      place(wrap, { x, y, w, h: api.height });
      for (const s of spans) {
        Object.assign(s.parentElement.style, {
          marginLeft: px(-bleed[0]), paddingLeft: px(bleed[0]), marginRight: px(-bleed[1]), paddingRight: px(bleed[1]),
        });
      }
      return api;
    },
    // Lines rise in from tIn (0.08 s apart, or one time per line) and rise away from `out`. The
    // block shows only from `from` until `hide`, so a cut can bring it in or take it, and `dx`
    // slides every line sideways inside its mask (the push into scene 2).
    frame(t, tIn, { out = Infinity, from = -Infinity, hide = Infinity, dx = 0 } = {}) {
      let visible = false;
      spans.forEach((s, i) => {
        const start = Array.isArray(tIn) ? tIn[i] : tIn + i * 0.08;
        const pin = progress(t, start, 0.42, ease.outQuart);
        const pout = progress(t, out + i * 0.04, 0.25, ease.inCubic);
        s.style.transform = `translate(${px(dx)}, ${((1 - pin) * 110 - pout * 110).toFixed(2)}%)`;
        visible ||= pin > 0 && pout < 1;
      });
      show(wrap, visible && t >= from && t < hide);
    },
  };
  return api;
}

// A red kicker tag, revealed from the left; a cut takes it.
function kickerTag(text) {
  const tag = el('div', 'kicker');
  tag.textContent = text;
  tag.style.fontSize = px(L.kicker.size);
  let size = L.kicker.size;
  return {
    tag,
    get height() { return tag.offsetHeight; },
    get width() { return tag.offsetWidth; },
    get size() { return size; },
    fit(maxW) {
      size = L.kicker.size;
      tag.style.fontSize = px(size);
      if (tag.offsetWidth > maxW) size *= maxW / tag.offsetWidth;
      tag.style.fontSize = px(size);
    },
    at(x, y) {
      Object.assign(tag.style, { left: px(x), top: px(y) });
    },
    frame(t, tIn, { hide = Infinity, from = -Infinity, instant = false } = {}) {
      const pin = instant ? Number(t >= tIn) : progress(t, tIn, 0.25, ease.outCubic);
      tag.style.clipPath = `inset(0 ${((1 - pin) * 100).toFixed(2)}% 0 0)`;
      show(tag, pin > 0 && t >= from && t < hide);
    },
  };
}

const CHECK = '<svg viewBox="0 0 24 24"><polyline points="5.5,12.5 10,17 18.5,7.5" fill="none" stroke="#FAFAFA" stroke-width="3.2" stroke-linecap="square"/></svg>';

// Check rows: each row rises out of its own mask like a headline line, then its box ticks.
function checkRows(items, spec) {
  const rows = items.map((text) => {
    const r = el('div', 'check-row');
    const inner = el('div', 'check-inner', r);
    const b = el('div', 'cbox', inner);
    b.innerHTML = CHECK;
    const tx = el('span', 'txt', inner);
    tx.textContent = text;
    return { r, inner, b, tx, svg: b.querySelector('svg') };
  });
  let total = 0;
  return {
    get height() { return total; },
    fit(maxW) {
      const gap = 0.45;
      for (const { r, inner, b } of rows) {
        r.style.fontSize = px(spec.size);
        inner.style.gap = `${gap}em`;
        Object.assign(b.style, { width: px(spec.box), height: px(spec.box) });
      }
      const widest = Math.max(...rows.map(({ tx }) => tx.getBoundingClientRect().width));
      const fs = spec.size * Math.min(1, (maxW - spec.box - gap * spec.size) / widest);
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
    frame(t, starts, { hide = Infinity, from = -Infinity } = {}) {
      rows.forEach(({ r, inner, svg }, i) => {
        const p = progress(t, starts[i], 0.42, ease.outQuart);
        const k = progress(t, starts[i] + 0.16, 0.25, ease.outCubic);
        inner.style.transform = `translateY(${((1 - p) * 110).toFixed(2)}%)`;
        svg.style.transform = `scale(${k.toFixed(3)})`;
        show(r, p > 0 && t >= from && t < hide);
      });
    },
  };
}

// ---- scenes ----
const layers = {
  hook: photoLayer({ before: '11_before', focus: [0.5, 0.42], seed: 3, punch: { at: T.punch, amt: 0.06, dur: 0.6 } }),
  // Outdoor unit, exterior wash. A true pair (same unit, matched framing).
  s2: photoLayer({ before: '19_before', after: '20_after', focus: [0.5, 0.4], seed: 5 }),
  s4a: photoLayer({ before: '04_before', after: '04_after', focus: { vertical: [0.4, 0.55], square: [0.4, 0.62], landscape: [0.4, 0.55] }, seed: 7 }),
  // Outdoor unit, leaf clean-out inside the condenser. A true pair; the angle differs, so the
  // wipe compares the debris with the cleaned pan rather than a locked-off match.
  s4b: photoLayer({ before: '17_before', after: '18_after', focus: [0.48, 0.52], seed: 9, reveal: 'y' }),
  s4c: photoLayer({ before: '06_before', after: '06_after', focus: { vertical: [0.62, 0.5], square: [0.6, 0.5], landscape: [0.75, 0.5] }, seed: 11, reveal: 'split' }),
  s4d: photoLayer({ before: '07_before', after: '07_after', focus: { vertical: [0.5, 0.35], square: [0.5, 0.3], landscape: [0.5, 0.4] }, seed: 13 }),
  // Two dirty blower wheels from the evidence, side by side (stacked in landscape). No divider
  // and no BEFORE/AFTER: they are not a pair, and 23 (a clean wheel from another job) is not here.
  blowers: gridLayer([
    { name: '22_blower', focus: [0.42, 0.68] },
    { name: '21_blower', focus: [0.62, 0.48] },
  ], { seed: 17, z1: 1.06 }),
  // Before shots of the three parts: outdoor unit, blower, coil.
  s5: gridLayer([
    { name: '19_before', focus: [0.5, 0.4] },
    { name: '22_blower', focus: [0.42, 0.68] },
    { name: '04_before', focus: [0.45, 0.5] },
  ]),
};

const headline = (lines) => textLines('lines', lines, L.headline.size, L.headline.lineHeight);
const hook = headline(COPY.hook);
const third = headline(COPY.third);
const h4a = headline(COPY.s4a);
const h4b = headline(COPY.s4b);
const h4c = headline(COPY.s4c);
const checklist = checkRows(perFormat(COPY.checklist), L.checklist);
const kA = kickerTag('SYSTEM RESTORATION');
const kB = kickerTag('MAY INCLUDE');
const evHead = headline(COPY.evidenceHead);
const evidence = textLines('sentence', perFormat(COPY.evidence), L.statement.size, L.statement.lineHeight);
const statement = headline(COPY.statement);
// "AUTOMATIC ANSWER." gets a red copy on top that wipes in left to right.
const flipLine = statement.spans[3];
flipLine.classList.add('flip');
const flip = el('span', 'flip-red', flipLine);
flip.textContent = COPY.statement[3];

// Three paths, set as headline lines. On the highlight beat the middle one fills red and the
// others dim; then it shrinks and rises into the kicker slot, easing its width, weight, tracking
// and padding until it matches the SYSTEM RESTORATION kicker that replaces it on the cut to 4a.
const PATH_PAD = [0.1, 0.22];
const KICK_PAD = [0.22, 0.55]; // .kicker padding in styles.css
const paths = COPY.paths.map((label) => {
  const r = el('div', 'path');
  const fill = el('div', 'fill', r);
  el('span', '', r).textContent = label;
  return { r, fill };
});
const pathGeo = { size: 0, rows: [], track: 0.08 };
let kickerY = 0;
let pushBleed = [0, 0];

// End card.
const offer = textLines('lines', COPY.offer, L.end.offer.size, 1.0);
const endChecks = checkRows(perFormat(COPY.checks), { ...L.end.checks, gap: 12 });
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
  for (const k of [kA, kB]) k.fit(tw);
  const kickH = kA.height + L.kicker.gap;

  for (const h of [hook, third, h4a, h4b, h4c, evHead, statement]) h.fit(tw);
  pushBleed = [L.text.x - L.push.left, L.push.right - (L.text.x + tw)];
  hook.at(L.text.x, anchorTop(hook.height), tw, pushBleed);
  third.at(L.text.x, anchorTop(third.height), tw, pushBleed);
  statement.at(L.text.x, anchorTop(statement.height), tw);

  // 4a-4d share one kicker slot, so the kicker never jumps between scenes.
  checklist.fit(tw);
  const groupH = kickH + Math.max(h4a.height, h4b.height, h4c.height, checklist.height);
  kickerY = anchorTop(groupH);
  for (const k of [kA, kB]) k.at(L.text.x, kickerY);
  for (const h of [h4a, h4b, h4c]) h.at(L.text.x, kickerY + kickH, tw);
  checklist.at(L.text.x, kickerY + kickH);

  evidence.fit(tw);
  const evGap = Math.round(L.statement.size * 0.45);
  const evTop = anchorTop(evHead.height + evGap + evidence.height);
  evHead.at(L.text.x, evTop, tw);
  evidence.at(L.text.x, evTop + evHead.height + evGap, tw);

  // Three paths: one size for all three rows, as large as the column allows.
  const style = (r, size, stretch, weight, track, pad) => Object.assign(r.style, {
    fontSize: px(size), fontStretch: `${stretch}%`, fontWeight: String(weight),
    letterSpacing: `${track}em`, padding: `${pad[0]}em ${pad[1]}em`,
  });
  for (const { r } of paths) style(r, L.rows.size, 75, 900, 0.005, PATH_PAD);
  const size = L.rows.size * Math.min(1, tw / Math.max(...paths.map(({ r }) => r.offsetWidth)));
  const rowH = size * (1 + 2 * PATH_PAD[0]);
  const gap = L.rows.gap * size / L.rows.size;
  const rowsTop = anchorTop(3 * rowH + 2 * gap);
  pathGeo.size = size;
  pathGeo.rows = paths.map((_, i) => ({ x: L.text.x, y: rowsTop + i * (rowH + gap) }));
  // Tracking that makes the risen row exactly as wide as the kicker it turns into.
  const mid = paths[1].r;
  style(mid, kA.size, 100, 700, 0.08, KICK_PAD);
  pathGeo.track = 0.08 + (kA.width - mid.offsetWidth) / (COPY.paths[1].length * kA.size);

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
  const leave = progress(t, T.rise, 0.25, ease.inCubic);
  paths.forEach(({ r, fill }, i) => {
    show(r, on);
    if (!on) return;
    const pin = progress(t, T.paths - PRE + i * 0.08, 0.42, ease.outQuart);
    const { x, y } = pathGeo.rows[i];
    let clipL = 0;
    if (i === 1) {
      fill.style.clipPath = `inset(0 ${((1 - lit) * 100).toFixed(2)}% 0 0)`;
      Object.assign(r.style, {
        left: px(x), top: px(lerp(y, kickerY, rise)),
        fontSize: px(lerp(pathGeo.size, kA.size, rise)),
        fontStretch: `${lerp(75, 100, rise).toFixed(2)}%`,
        fontWeight: String(Math.round(lerp(900, 700, rise))),
        letterSpacing: `${lerp(0.005, pathGeo.track, rise).toFixed(4)}em`,
        padding: `${lerp(PATH_PAD[0], KICK_PAD[0], rise).toFixed(4)}em ${lerp(PATH_PAD[1], KICK_PAD[1], rise).toFixed(4)}em`,
      });
    } else {
      fill.style.clipPath = 'inset(0 100% 0 0)';
      Object.assign(r.style, { left: px(x), top: px(y), fontSize: px(pathGeo.size), opacity: String(1 - 0.62 * lit) });
      clipL = leave * 100;
    }
    // Rise out of a mask at the row's own box: slide down by d and clip what falls below it.
    const d = (1 - pin) * 100;
    r.style.transform = `translateY(${d.toFixed(2)}%)`;
    r.style.clipPath = `inset(0 0 ${d.toFixed(2)}% ${clipL.toFixed(2)}%)`;
  });
}

function wipeFrame(t) {
  const span = wipeSpan(t);
  wipe.style.clipPath = span
    ? `inset(0 ${((1 - span.to) * 100).toFixed(3)}% 0 ${(span.from * 100).toFixed(3)}%)`
    : 'inset(0 100% 0 0)';
  show(wipe, !!span);
}

function logoFrame(t) {
  const p = travel(t);
  const b = lerpBox(L.badge, L.end.logo, p);
  for (const img of [badge, silver]) {
    Object.assign(img.style, { left: px(b.x), top: px(b.y), width: px(b.w), height: px(b.w * img.naturalHeight / img.naturalWidth) });
  }
  // The silver lockup comes in with the move. Waiting for p>0.2 left the badge looking stuck.
  const mix = clamp((p - 0.05) / 0.62);
  badge.style.opacity = String(1 - mix);
  silver.style.opacity = String(mix);
  show(silver, mix > 0);
  show(badge, mix < 1);
}

function endFrame(t) {
  offer.frame(t, T.end - 0.1, { from: T.end });
  endChecks.frame(t, T.checks, { from: T.end });
  // The button settles a few pixels, whole. A left-to-right clip drew "BOOK 256-203-" for
  // about five frames; the phone number is fully painted on every frame it is visible.
  const b = progress(t, T.button, BUTTON, ease.outCubic);
  button.style.clipPath = 'none';
  button.style.transform = `translateY(${((1 - b) * 10).toFixed(2)}px)`;
  show(button, b > 0);
  url.frame(t, T.url, { from: T.end });
}

function seek(t) {
  t = clamp(t, 0, DURATION);
  const push = pushP(t);
  const tw = L.text.w;

  layers.hook(t, { on: t < T.swipe + PUSH, t0: 0, t1: T.swipe, dx: -push * BW });
  layers.s2(t, {
    on: t >= T.swipe && t < T.s4a, t0: T.swipe, t1: T.s4a, dx: (1 - push) * BW,
    move: { start: T.sweep2, dur: SWEEP }, dimAmt: 0.5 * progress(t, T.paths, 0.5, ease.inOutSine),
  });
  layers.s4a(t, { on: t >= T.s4a && t < T.s4b, t0: T.s4a, t1: T.s4b, move: { start: T.sweep4a, dur: SWEEP } });
  layers.s4b(t, { on: t >= T.s4b && t < T.s4c, t0: T.s4b, t1: T.s4c, move: { start: T.sweep4b, dur: SWEEP } });
  layers.s4c(t, { on: t >= T.s4c && t < T.s4d, t0: T.s4c, t1: T.s4d, move: { start: T.split4c, dur: SPLIT } });
  layers.s4d(t, { on: t >= T.s4d && t < T.blowers, t0: T.s4d, t1: T.blowers, move: { start: T.sweep4d, dur: SWEEP_4D } });
  layers.blowers(t, { on: t >= T.blowers && t < T.s5a, t0: T.blowers, t1: T.s5a });
  layers.s5(t, { on: t >= T.s5a && t < T.end, t0: T.s5a, t1: T.end, dimAmt: 0.72 * progress(t, T.s5b, 0.45, ease.inOutSine) });

  // The hook's text pushes out with its photo as scene 2 pushes in; after that, each text change
  // happens on the cut (or the beat) that changes the scene, so no beat lands on an empty frame.
  hook.frame(t, -1, { hide: T.swipe + PUSH, dx: -push * (tw + pushBleed[0]) });
  third.frame(t, -1, { from: T.swipe, hide: T.paths, dx: (1 - push) * (tw + pushBleed[1]) });
  pathsFrame(t);
  kA.frame(t, T.s4a, { hide: T.s4b, instant: true });
  h4a.frame(t, T.s4a - PRE, { from: T.s4a, hide: T.s4b });
  kB.frame(t, T.s4b - PRE, { from: T.s4b, hide: T.s5a });
  h4b.frame(t, T.s4b - PRE, { from: T.s4b, hide: T.s4c });
  h4c.frame(t, T.s4c - PRE, { from: T.s4c, hide: T.s4d });
  checklist.frame(t, [T.rows4d[0] - PRE, ...T.rows4d.slice(1)], { from: T.s4d, hide: T.s5a });
  evHead.frame(t, T.s5a + 0.06, { hide: T.s5b });
  evidence.frame(t, T.sentence5a, { hide: T.s5b });
  statement.frame(t, [T.s5b - PRE, T.s5b - PRE + 0.08, T.half5b, T.half5b + 0.08], { from: T.s5b, hide: T.end });
  flip.style.clipPath = `inset(0 ${((1 - progress(t, T.flip5b, 0.3, ease.outCubic)) * 100).toFixed(2)}% 0 0)`;

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
