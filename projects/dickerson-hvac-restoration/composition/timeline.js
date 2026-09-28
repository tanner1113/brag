/* Dickerson Services: HVAC System Restoration, 30s vertical (1080x1920 @ 30fps).
   Every frame is a pure function of time: window.renderAt(t) sets every style.
   The renderer waits for window.__ready (fonts + decoded images + text fitting). */
(() => {
  const W = 1080;
  const DURATION = 30.2;

  // Scene starts in seconds. S4A sits on the bass entry, S5A on the fuller section and
  // S7 on the track's final hit (see build-audio.py for the music edit).
  const T = {
    s2: 3.0, s3: 5.4, s4a: 7.745, s4b: 9.8, s4c: 11.98, s4d: 14.08,
    s5a: 16.475, s5b: 20.1, s6: 24.115, s7: 27.35, end: DURATION,
  };
  const WIPE1 = [16.25, 0.36]; // S4 -> S5 brand wipe [start, duration]
  const WIPE2 = [23.9, 0.36]; // S5 -> S6

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const E = {
    lin: (p) => p,
    outCubic: (p) => 1 - (1 - p) ** 3,
    inCubic: (p) => p ** 3,
    inOutCubic: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
    outQuart: (p) => 1 - (1 - p) ** 4,
    inOutSine: (p) => -(Math.cos(Math.PI * p) - 1) / 2,
    outBack: (p) => { const c1 = 1.3, c3 = c1 + 1; return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2; },
  };
  const P = (t, start, dur, e = E.outCubic) => e(clamp((t - start) / dur));

  const stage = document.getElementById('stage');
  const images = [];
  const blocks = [];

  function el(tag, cls, parent = stage, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    parent.appendChild(e);
    return e;
  }
  const px = (v) => `${v}px`;
  function place(e, x, y) { e.style.left = px(x); e.style.top = px(y); return e; }
  function shown(e, on) { e.style.display = on ? '' : 'none'; return on; }
  function img(parent, src, cls) {
    const i = el('img', cls, parent);
    i.src = `assets/${src}`;
    images.push(i);
    return i;
  }

  // ---------- Components ----------

  const CHEVRONS = '<svg viewBox="0 0 40 40"><path d="M15 11 L7 20 L15 29 M25 11 L33 20 L25 29" fill="none" stroke="#fafafa" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHECK = '<svg viewBox="0 0 42 42"><path d="M9 22 L18 31 L34 12" fill="none" stroke="#fafafa" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1"/></svg>';

  // A feathered photo window. With `after`, it is a before/after slider: the after image
  // is revealed left to right behind a divider, and each image carries its own tag.
  function Viewport(parent, o) {
    const vp = el('div', 'vp', parent);
    vp.style.top = px(o.top);
    vp.style.height = px(o.height);
    const mask = `linear-gradient(to bottom, transparent 0px, #000 ${o.fTop}px, #000 ${o.height - o.fBot}px, transparent ${o.height}px)`;
    vp.style.webkitMaskImage = mask;
    vp.style.maskImage = mask;
    const tags = [];
    const mk = (src, tagText, tagCls) => {
      const layer = el('div', 'vp-layer', vp);
      const cam = el('div', 'cam', layer);
      cam.style.width = px(o.imgW);
      cam.style.height = px(o.imgH);
      cam.style.left = px((W - o.imgW) / 2);
      cam.style.top = px((o.height - o.imgH) / 2);
      if (o.origin) cam.style.transformOrigin = o.origin;
      img(cam, src);
      if (tagText) {
        const tag = el('div', `tag ${tagCls}`, layer, tagText);
        tag.style.top = px(o.tagY - o.top);
        if (tagCls === 'before') tag.style.right = '90px';
        else tag.style.left = '90px';
        tags.push(tag);
      }
      return { layer, cam };
    };
    const b = mk(o.before, o.after ? 'BEFORE' : null, 'before');
    const a = o.after ? mk(o.after, 'AFTER', 'after') : null;
    let line = null;
    let handle = null;
    if (a) {
      line = el('div', 'divider', vp);
      handle = el('div', 'handle', vp, CHEVRONS);
      handle.style.top = px(o.handleY ?? o.height / 2);
    }
    return {
      vp,
      cam(s, dx = 0, dy = 0) {
        const v = `translate3d(${dx}px, ${dy}px, 0) scale(${s})`;
        b.cam.style.transform = v;
        if (a) a.cam.style.transform = v;
      },
      wipe(p) {
        if (!a) return;
        const x = lerp(-60, W + 60, p);
        a.layer.style.clipPath = `inset(0 ${Math.max(0, W - x)}px 0 0)`;
        a.layer.style.visibility = x > 0 ? 'visible' : 'hidden';
        const onScreen = x > -45 && x < W + 45;
        line.style.visibility = onScreen ? 'visible' : 'hidden';
        handle.style.visibility = onScreen ? 'visible' : 'hidden';
        line.style.left = px(x);
        handle.style.left = px(x);
      },
      move(x, y, o2 = 1) {
        vp.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        vp.style.opacity = String(o2);
      },
      filter(f) { vp.style.filter = f; },
      tagOpacity(v) { for (const tg of tags) tg.style.opacity = String(v); },
      show(on) { return shown(vp, on); },
    };
  }

  // Lines of text that slide up through their own masks.
  function Lines(parent, o) {
    const root = el('div', o.cls, parent);
    place(root, o.x, o.y);
    root.style.fontSize = px(o.size);
    root.style.lineHeight = String(o.lh);
    if (o.style) Object.assign(root.style, o.style);
    const lines = o.lines.map(([text, extra]) => {
      const ln = el('div', 'ln', root);
      const inner = el('span', `in${extra ? ` ${extra}` : ''}`, ln, text);
      return { ln, inner };
    });
    const block = { root, lines, o };
    blocks.push(block);
    return block;
  }

  function animLines(block, t, tIn, tOut, { stagger = 0.06, dIn = 0.4, dOut = 0.2, outStagger = 0.02 } = {}) {
    let any = false;
    block.lines.forEach((l, i) => {
      const a = tIn + i * stagger;
      const b = tOut == null ? Infinity : tOut + i * outStagger;
      let y;
      if (t < a) y = 118;
      else if (t < b) y = 118 * (1 - E.outQuart(clamp((t - a) / dIn)));
      else y = -118 * E.inCubic(clamp((t - b) / dOut));
      const hidden = t < a || t >= b + dOut;
      l.inner.style.transform = `translate3d(0, ${y}%, 0)`;
      l.ln.style.visibility = hidden ? 'hidden' : 'visible';
      any = any || !hidden;
    });
    shown(block.root, any);
  }

  function Eyebrow(parent, text, x, y) {
    return place(el('div', 'eyebrow', parent, text), x, y);
  }

  function animEyebrow(e, t, tIn, tOut, dIn = 0.34, dOut = 0.18) {
    const hidden = t < tIn || (tOut != null && t >= tOut + dOut);
    if (!shown(e, !hidden)) return;
    const r = 100 * (1 - E.outCubic(clamp((t - tIn) / dIn)));
    const l = tOut != null && t >= tOut ? 100 * E.inCubic(clamp((t - tOut) / dOut)) : 0;
    e.style.clipPath = `inset(0 ${r}% 0 ${l}%)`;
  }

  function Check(parent, text, x, y, soft) {
    const e = place(el('div', `check${soft ? ' soft' : ''}`, parent,
      `<div class="box">${CHECK}</div><div class="txt">${text}</div>`), x, y);
    return { e, box: e.querySelector('.box'), path: e.querySelector('path'), txt: e.querySelector('.txt') };
  }

  function animCheck(c, t, tIn, tOut, dOut = 0.18) {
    const hidden = t < tIn || (tOut != null && t >= tOut + dOut);
    if (!shown(c.e, !hidden)) return;
    const p = P(t, tIn, 0.38);
    const pb = P(t, tIn, 0.34, E.outBack);
    const pd = P(t, tIn + 0.1, 0.28);
    const po = tOut == null ? 0 : P(t, tOut, dOut, E.inCubic);
    c.e.style.opacity = String(p * (1 - po));
    c.txt.style.transform = `translate3d(${lerp(-28, 0, p)}px, ${-22 * po}px, 0)`;
    c.box.style.transform = `scale(${lerp(0.4, 1, pb)})`;
    c.path.style.strokeDashoffset = String(1 - pd);
  }

  function PathRow(parent, text, y) {
    const e = el('div', 'path', parent, `<div class="fill"></div><div class="lbl">${text}</div>`);
    e.style.top = px(y);
    return { e, y, fill: e.querySelector('.fill'), lbl: e.querySelector('.lbl') };
  }

  function Shade(parent, top, height, css) {
    const s = el('div', 'shade', parent);
    s.style.top = px(top);
    s.style.height = px(height);
    s.style.background = css;
    return s;
  }

  // ---------- Build ----------

  const L = {};
  for (const id of ['hook', 'reveal', 's4', 's5', 's6', 's7']) L[id] = el('div', 'layer', stage);
  const topShade = Shade(stage, 0, 430,
    'linear-gradient(to bottom, rgba(17,17,17,0.92) 0%, rgba(17,17,17,0.6) 42%, rgba(17,17,17,0) 100%)');
  const header = el('div', '', stage);
  header.id = 'header';
  img(header, 'brand/logo-white-header.png');
  el('div', 'loc', header, 'NORTH ALABAMA');
  const wipebar = el('div', '', stage);
  wipebar.id = 'wipebar';

  // Scene 1: hook, settled at frame 0 so the first frame doubles as the poster.
  const s1 = {};
  s1.vp = Viewport(L.hook, {
    top: 270, height: 972, imgW: 1080, imgH: 972, fTop: 120, fBot: 300,
    before: 'photos/11_before_tall.png', origin: '64% 42%',
  });
  s1.shade = Shade(L.hook, 880, 1040,
    'linear-gradient(to bottom, rgba(17,17,17,0) 0px, rgba(17,17,17,0.8) 230px, #111111 420px)');
  s1.text = Lines(L.hook, {
    cls: 'hl', x: 90, y: 984, size: 124, lh: 1.0,
    lines: [['TIRED OF'], ['BEING TOLD'], ['YOU NEED A'], ['NEW SYSTEM?', 'red']],
  });

  // Scenes 2-3: the third option, then the three paths.
  const s2 = {};
  s2.vp = Viewport(L.reveal, {
    top: 170, height: 1010, imgW: 1080, imgH: 1200, fTop: 120, fBot: 270, tagY: 470,
    before: 'photos/08_before.png', after: 'photos/08_after.png',
  });
  s2.text = Lines(L.reveal, {
    cls: 'hl', x: 90, y: 1232, size: 124, lh: 1.0,
    lines: [['YOU MAY HAVE A'], ['THIRD OPTION.', 'red']],
  });
  const s3 = {};
  s3.rows = [
    PathRow(L.reveal, 'REPAIR', 700),
    PathRow(L.reveal, 'SYSTEM RESTORATION', 880),
    PathRow(L.reveal, 'REPLACEMENT', 1060),
  ];

  // Scene 4: what restoration is.
  const s4 = {};
  const band = (before, after) => ({
    top: 300, height: 756, imgW: 1080, imgH: 756, fTop: 80, fBot: 120, tagY: 470, before, after,
  });
  const tall = (before, after) => ({
    top: 170, height: 1010, imgW: 1080, imgH: 1200, fTop: 120, fBot: 270, tagY: 470, before, after,
  });
  s4.a = { vp: Viewport(L.s4, band('photos/01_before.png', 'photos/01_after.png')) };
  s4.b = { vp: Viewport(L.s4, tall('photos/09_before.png', 'photos/09_after.png')) };
  s4.c = { vp: Viewport(L.s4, band('photos/06_before.png', 'photos/06_after.png')) };
  s4.d = { vp: Viewport(L.s4, tall('photos/07_before.png', 'photos/07_after.png')) };
  s4.eyeSR = Eyebrow(L.s4, 'SYSTEM RESTORATION', 90, 1080);
  s4.eyeMI = Eyebrow(L.s4, 'MAY INCLUDE', 90, 1080);
  s4.a.text = Lines(L.s4, {
    cls: 'hl', x: 90, y: 1178, size: 120, lh: 1.0,
    lines: [['MORE THAN A', 'red'], ['BASIC TUNE-UP.']],
  });
  s4.b.text = Lines(L.s4, {
    cls: 'hl', x: 90, y: 1170, size: 100, lh: 1.0,
    lines: [['DEEP CLEANING'], ['OF ACCESSIBLE'], ['COMPONENTS']],
  });
  s4.c.text = Lines(L.s4, {
    cls: 'hl', x: 90, y: 1170, size: 100, lh: 1.0,
    lines: [['REPLACEMENT'], ['OF DEFINED'], ['AGE-RELATED PARTS']],
  });
  s4.d.checks = [
    Check(L.s4, 'PERFORMANCE CHECKS', 90, 1178),
    Check(L.s4, 'BEFORE/AFTER PHOTOS', 90, 1278),
    Check(L.s4, 'WRITTEN CONDITION REPORT', 90, 1378),
  ];

  // Scene 5: evidence before recommendation.
  const s5 = {};
  s5.vp = Viewport(L.s5, {
    top: 0, height: 1920, imgW: 1440, imgH: 1920, fTop: 0, fBot: 0,
    before: 'photos/03.png', origin: '46% 38%',
  });
  s5.shade = Shade(L.s5, 700, 1220,
    'linear-gradient(to bottom, rgba(17,17,17,0) 0px, rgba(17,17,17,0.84) 300px, rgba(17,17,17,0.94) 560px, #111111 1220px)');
  s5.dim = Shade(L.s5, 0, 1920, 'rgba(17,17,17,0.72)');
  s5.reticle = el('div', 'reticle', L.s5, '<i></i><i></i><i></i><i></i>');
  s5.eye = Eyebrow(L.s5, 'EVIDENCE BEFORE RECOMMENDATION', 90, 1066);
  s5.a = Lines(L.s5, {
    cls: 'say', x: 90, y: 1158, size: 80, lh: 1.16,
    lines: [['We don’t decide'], ['the answer before'], ['looking at the system.', 'red']],
  });
  s5.b1 = Lines(L.s5, {
    cls: 'say', x: 90, y: 738, size: 88, lh: 1.14,
    lines: [['Replacement may be'], ['the right answer.']],
  });
  s5.b2 = Lines(L.s5, {
    cls: 'say', x: 90, y: 988, size: 88, lh: 1.14,
    lines: [['It shouldn’t be the'], ['automatic answer.', 'red']],
  });

  // Scene 6: the invitation.
  const s6 = {};
  s6.vp = Viewport(L.s6, {
    top: 0, height: 1920, imgW: 1440, imgH: 1920, fTop: 0, fBot: 0,
    before: 'photos/02.png', origin: '50% 45%',
  });
  s6.dim = Shade(L.s6, 0, 1920,
    'linear-gradient(to bottom, rgba(17,17,17,0.62) 0%, rgba(17,17,17,0.7) 40%, rgba(17,17,17,0.9) 75%, #111111 100%)');
  s6.price = Lines(L.s6, {
    cls: 'hl', x: 84, y: 560, size: 300, lh: 0.96, style: { fontStretch: '100%' },
    lines: [['$85']],
  });
  s6.label = Lines(L.s6, {
    cls: 'hl', x: 90, y: 870, size: 94, lh: 1.0,
    lines: [['AGING HVAC'], ['SYSTEM EVALUATION']],
  });
  s6.rule = place(el('div', 'rule', L.s6), 90, 1092);
  s6.rule.style.width = '150px';
  s6.checks = [
    Check(L.s6, 'A clear first look', 90, 1142, true),
    Check(L.s6, 'A next-step recommendation', 90, 1232, true),
  ];

  // Scene 7: end card.
  const s7 = {};
  s7.logo = place(img(L.s7, 'brand/logo-silver-endcard.png', 'abs'), 260, 500);
  s7.cta = el('div', 'cta', L.s7, 'BOOK YOUR $85 EVALUATION');
  s7.cta.style.top = '900px';
  s7.phone = el('div', 'center-text', L.s7, '256-203-6612');
  Object.assign(s7.phone.style, { top: '1076px', fontSize: '108px', fontWeight: '800', lineHeight: '1' });
  s7.url = el('div', 'center-text', L.s7, 'dickersonservices.com');
  Object.assign(s7.url.style, { top: '1222px', fontSize: '56px', fontWeight: '600', lineHeight: '1' });

  // Optional crop guides for review stills (?guides=1): 1:1 and 4:5 center crops.
  if (new URLSearchParams(location.search).has('guides')) {
    const g = el('div', '', stage);
    g.id = 'guides';
    const box = (top, h, color) => { const d = el('div', '', g); d.style.top = px(top); d.style.height = px(h); d.style.borderColor = color; };
    box(420, 1080, '#00e5ff');
    box(285, 1350, '#ffd400');
  }

  // Shrink any text block whose widest line would pass the safe margin.
  function fitText() {
    for (const b of blocks) {
      const max = b.o.maxW ?? 900;
      const widest = Math.max(...b.lines.map((l) => l.inner.getBoundingClientRect().width));
      if (widest > max) b.root.style.fontSize = px(Math.floor(b.o.size * (max / widest)));
    }
    for (const c of [...s4.d.checks, ...s6.checks]) {
      const rowW = c.e.getBoundingClientRect().width;
      const txtW = c.txt.getBoundingClientRect().width;
      if (rowW > 900) {
        const fs = parseFloat(getComputedStyle(c.txt).fontSize);
        c.txt.style.fontSize = px(Math.floor(fs * (txtW - (rowW - 900)) / txtW));
      }
    }
    const ctaText = s7.cta.scrollWidth;
    if (ctaText > 860) s7.cta.style.fontSize = px(Math.floor(66 * 860 / ctaText));
  }

  // Magic move target: the S4 eyebrow's box, measured once after fonts load.
  let eyeBox = null;

  // ---------- Per-frame ----------

  function renderHeader(t) {
    const o = 1 - P(t, T.s7 - 0.2, 0.2, E.inCubic);
    header.style.opacity = String(o);
    topShade.style.opacity = String(o);
    shown(header, o > 0);
    shown(topShade, o > 0);
  }

  function renderHook(t) {
    if (!shown(L.hook, t < T.s2 + 0.45)) return;
    const k = clamp(t / 3.45);
    s1.vp.cam(lerp(1.0, 1.1, E.inOutSine(k)), 0, lerp(0, -12, k));
    const sw = P(t, T.s2, 0.42, E.inOutCubic);
    s1.vp.move(-W * sw, 0);
    s1.shade.style.transform = `translate3d(${-W * sw}px, 0, 0)`;
    animLines(s1.text, t, -1, T.s2);
  }

  function renderReveal(t) {
    if (!shown(L.reveal, t >= T.s2 && t < T.s4a + 0.05)) return;
    const sw = P(t, T.s2, 0.42, E.inOutCubic);
    const k = clamp((t - T.s2) / 4.8);
    const fade = P(t, T.s4a - 0.5, 0.4, E.inCubic);
    s2.vp.move(W * (1 - sw), 0, 1 - fade);
    s2.vp.cam(lerp(1.0, 1.06, k), 0, lerp(12, -18, k));
    s2.vp.wipe(P(t, T.s2 + 0.42, 1.0, E.inOutCubic));
    const d = P(t, T.s3, 0.45, E.inOutCubic);
    s2.vp.filter(d > 0 ? `brightness(${lerp(1, 0.3, d)}) blur(${lerp(0, 8, d)}px)` : 'none');
    s2.vp.tagOpacity(1 - P(t, T.s3, 0.2, E.inCubic));
    animLines(s2.text, t, T.s2 + 0.24, T.s3 + 0.08, { dIn: 0.34 });

    // Three paths: in, highlight the middle, then the middle one becomes the S4 label.
    const hi = P(t, 6.25, 0.3, E.outCubic);
    const mv = P(t, 7.25, 0.46, E.inOutCubic);
    s3.rows.forEach((r, i) => {
      const tIn = T.s3 + 0.05 + i * 0.08;
      const pin = P(t, tIn, 0.42, E.outQuart);
      const isMid = i === 1;
      const out = isMid ? 0 : P(t, 7.18, 0.22, E.inCubic);
      const dim = isMid ? 1 : lerp(1, 0.34, hi);
      if (!shown(r.e, t >= tIn && out < 1)) return;
      r.e.style.opacity = String(pin * dim * (1 - out));
      if (isMid) {
        r.fill.style.clipPath = `inset(0 ${100 * (1 - hi)}% 0 0)`;
        r.e.style.borderColor = hi > 0.5 ? '#ab1525' : 'rgba(250,250,250,0.42)';
        // Origin stays top-left; the highlight "pop" is compensated to scale about the center.
        const pop = lerp(1, 1.05, P(t, 6.25, 0.34, E.outBack));
        const popX = lerp(70, 0, pin) + 450 * (1 - pop);
        const popY = 75 * (1 - pop);
        const s = eyeBox ? eyeBox.s : 0.4;
        const tx = eyeBox ? eyeBox.x - 90 : 0;
        const ty = eyeBox ? eyeBox.y - r.y : 0;
        r.e.style.width = px(lerp(900, eyeBox ? eyeBox.w / s : 900, mv));
        r.e.style.height = px(lerp(150, eyeBox ? eyeBox.h / s : 150, mv));
        r.e.style.borderRadius = px(lerp(18, 0, mv));
        r.fill.style.borderRadius = px(lerp(18, 0, mv));
        r.e.style.transform = `translate3d(${lerp(popX, tx, mv)}px, ${lerp(popY, ty, mv)}px, 0) scale(${lerp(pop, s, mv)})`;
        shown(r.e, mv < 1);
      } else {
        r.fill.style.clipPath = 'inset(0 100% 0 0)';
        r.e.style.transform = `translate3d(${lerp(70, 0, pin)}px, 0, 0)`;
      }
    });
  }

  function beat(t, part, tIn, tOut, cfg) {
    // One S4 beat: photo pushes in, slider runs, photo pushes out.
    const on = t >= tIn - 0.01 && t < tOut + 0.25;
    if (!part.vp.show(on)) return;
    const pin = P(t, tIn, 0.34, E.outCubic);
    const pout = P(t, tOut, 0.2, E.inCubic);
    const y = (cfg.open ? 0 : lerp(44, 0, pin)) - 44 * pout;
    part.vp.move(0, y, (cfg.open ? 1 : pin) * (1 - pout));
    const k = clamp((t - tIn) / (tOut - tIn + 0.3));
    part.vp.cam(lerp(1.0, cfg.zoom ?? 1.06, k), 0, lerp(cfg.dy0 ?? 10, cfg.dy1 ?? -14, k));
    part.vp.wipe(P(t, cfg.wipe, cfg.wipeDur ?? 0.9, E.inOutCubic));
    if (cfg.open) {
      const po = P(t, cfg.open, 0.38, E.outCubic);
      part.vp.vp.style.clipPath = `inset(${50 * (1 - po)}% 0 ${50 * (1 - po)}% 0)`;
    }
  }

  function renderS4(t) {
    if (!shown(L.s4, t >= T.s4a - 0.25 && t < WIPE1[0] + WIPE1[1])) return;
    // The band opens from its center line while the label lands.
    beat(t, s4.a, T.s4a - 0.2, T.s4b - 0.02, { wipe: 8.15, open: T.s4a - 0.2 });
    beat(t, s4.b, T.s4b + 0.1, T.s4c - 0.02, { wipe: T.s4b + 0.5 });
    beat(t, s4.c, T.s4c + 0.1, T.s4d - 0.02, { wipe: T.s4c + 0.47 });
    beat(t, s4.d, T.s4d + 0.1, 99, { wipe: T.s4d + 0.47 });
    // Labels
    if (shown(s4.eyeSR, t >= 7.71 && t < T.s4b + 0.2)) {
      s4.eyeSR.style.clipPath = t >= T.s4b - 0.02
        ? `inset(0 0 0 ${100 * P(t, T.s4b - 0.02, 0.18, E.inCubic)}%)` : 'none';
    }
    animEyebrow(s4.eyeMI, t, T.s4b + 0.12, null);
    animLines(s4.a.text, t, T.s4a + 0.015, T.s4b - 0.02, { dIn: 0.34 });
    animLines(s4.b.text, t, T.s4b + 0.18, T.s4c - 0.02, { stagger: 0.05, dIn: 0.3 });
    animLines(s4.c.text, t, T.s4c + 0.16, T.s4d - 0.02, { stagger: 0.05, dIn: 0.3 });
    s4.d.checks.forEach((c, i) => animCheck(c, t, T.s4d + 0.14 + i * 0.28, null));
  }

  function renderS5(t) {
    if (!shown(L.s5, t >= WIPE1[0] && t < WIPE2[0] + WIPE2[1])) return;
    const k = clamp((t - WIPE1[0]) / (WIPE2[0] + WIPE2[1] - WIPE1[0]));
    s5.vp.cam(lerp(1.0, 1.12, E.inOutSine(k)), lerp(0, -40, k), lerp(0, -30, k));
    const d = P(t, T.s5b - 0.05, 0.5, E.inOutCubic);
    s5.dim.style.opacity = String(d);
    s5.vp.filter(d > 0 ? `blur(${lerp(0, 6, d)}px)` : 'none');
    s5.shade.style.opacity = String(1 - d);
    // Inspection frame: contracts onto the blower wheel, then clears for the statement.
    const pr = P(t, 16.8, 0.5, E.outQuart);
    const ro = P(t, T.s5b - 0.1, 0.25, E.inCubic);
    if (shown(s5.reticle, t >= 16.8 && ro < 1)) {
      const w = lerp(900, 560, pr);
      const h = lerp(760, 400, pr);
      const cx = 548;
      const cy = 736;
      place(s5.reticle, cx - w / 2, cy - h / 2);
      s5.reticle.style.width = px(w);
      s5.reticle.style.height = px(h);
      s5.reticle.style.opacity = String(Math.min(1, pr * 1.6) * (1 - ro));
    }
    animEyebrow(s5.eye, t, 16.52, T.s5b);
    animLines(s5.a, t, 16.6, T.s5b, { stagger: 0.07 });
    animLines(s5.b1, t, T.s5b + 0.15, null, { stagger: 0.07 });
    animLines(s5.b2, t, T.s5b + 1.3, null, { stagger: 0.07 });
  }

  function renderS6(t) {
    if (!shown(L.s6, t >= WIPE2[0] && t < T.s7 + 0.35)) return;
    const k = clamp((t - WIPE2[0]) / (T.s7 - WIPE2[0] + 0.3));
    s6.vp.cam(lerp(1.04, 1.12, k), lerp(20, -20, k), 0);
    const bgOut = P(t, T.s7 - 0.2, 0.45, E.inOutCubic);
    s6.vp.move(0, 0, 1 - bgOut);
    s6.dim.style.opacity = String(1 - bgOut);
    const out = T.s7 - 0.17;
    animLines(s6.price, t, 24.2, out, { dIn: 0.46, dOut: 0.16 });
    animLines(s6.label, t, 24.3, out, { stagger: 0.07, dOut: 0.16 });
    const pr = P(t, 24.58, 0.32, E.outCubic);
    const prOut = P(t, out, 0.16, E.inCubic);
    if (shown(s6.rule, pr > 0 && prOut < 1)) s6.rule.style.clipPath = `inset(0 ${100 * (1 - pr)}% 0 ${100 * prOut}%)`;
    s6.checks.forEach((c, i) => animCheck(c, t, 24.7 + i * 0.24, out, 0.16));
  }

  function renderS7(t) {
    if (!shown(L.s7, t >= T.s7 - 0.05)) return;
    const pl = P(t, T.s7, 0.5, E.outCubic);
    s7.logo.style.opacity = String(pl);
    s7.logo.style.transform = `translate3d(0, ${lerp(18, 0, pl)}px, 0) scale(${lerp(0.9, 1, pl)})`;
    const pc = P(t, T.s7 + 0.1, 0.36, E.outCubic);
    s7.cta.style.clipPath = `inset(0 ${100 * (1 - pc)}% 0 0)`;
    const pp = P(t, T.s7 + 0.22, 0.42, E.outQuart);
    s7.phone.style.opacity = String(pp);
    s7.phone.style.transform = `translate3d(0, ${lerp(40, 0, pp)}px, 0)`;
    const pu = P(t, T.s7 + 0.34, 0.42, E.outQuart);
    s7.url.style.opacity = String(pu);
    s7.url.style.transform = `translate3d(0, ${lerp(32, 0, pu)}px, 0)`;
  }

  function renderWipes(t) {
    // Brand wipes: a red edge sweeps left to right; new scene on its left, old on its right.
    const edge = ([start, dur]) => (t >= start && t <= start + dur
      ? lerp(-20, W + 20, E.inOutCubic(clamp((t - start) / dur))) : null);
    const x1 = edge(WIPE1);
    const x2 = edge(WIPE2);
    const keepRight = (x) => `inset(0 0 0 ${Math.max(0, x)}px)`;
    const keepLeft = (x) => `inset(0 ${Math.max(0, W - x)}px 0 0)`;
    L.s4.style.clipPath = x1 != null ? keepRight(x1) : 'none';
    L.s5.style.clipPath = x1 != null ? keepLeft(x1) : x2 != null ? keepRight(x2) : 'none';
    L.s6.style.clipPath = x2 != null ? keepLeft(x2) : 'none';
    const x = x1 ?? x2;
    if (shown(wipebar, x != null)) wipebar.style.left = px(x);
  }

  function renderAt(t) {
    renderHeader(t);
    renderHook(t);
    renderReveal(t);
    renderS4(t);
    renderS5(t);
    renderS6(t);
    renderS7(t);
    renderWipes(t);
    // Force style/layout now so the capture sees this frame.
    return stage.offsetHeight;
  }

  window.COMPOSITION = { duration: DURATION, fps: 30, scenes: T, wipes: [WIPE1, WIPE2] };
  window.renderAt = renderAt;
  window.__ready = (async () => {
    await document.fonts.load('900 100px "Noto Sans VF"');
    await document.fonts.ready;
    await Promise.all(images.map((i) => i.decode()));
    fitText();
    // Measure the S4 eyebrow so the S3 row can morph exactly into it.
    const r = s4.eyeSR.getBoundingClientRect();
    const lblFs = parseFloat(getComputedStyle(s3.rows[1].lbl).fontSize);
    const eyeFs = parseFloat(getComputedStyle(s4.eyeSR).fontSize);
    eyeBox = { x: r.left, y: r.top, w: r.width, h: r.height, s: eyeFs / lblFs };
    renderAt(0);
    return true;
  })();
})();
