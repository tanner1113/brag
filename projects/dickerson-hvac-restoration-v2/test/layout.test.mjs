// Checks every format's layout and the timing without rendering: `npm test` (node --test test/layout.test.mjs).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FORMATS, cover, layout, lerpBox, tiles } from '../composition/layout.js';
import { DURATION, FPS, SWEEP_4D, T, pushP, travel, wipeSpan } from '../composition/timing.js';

const inside = (b, r) => b.x >= r.x && b.y >= r.y && b.x + b.w <= r.x + r.w && b.y + b.h <= r.y + r.h;
const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

for (const format of Object.keys(FORMATS)) {
  const L = layout(format);
  const frame = { x: 0, y: 0, w: L.w, h: L.h };

  test(`${format}: transitions can never reach the badge`, () => {
    assert.ok(inside(L.badge, L.header), 'badge outside its header band');
    assert.ok(!overlaps(L.content, L.badge), 'the transition area overlaps the badge');
    assert.ok(!overlaps(L.content, L.header), 'the transition area overlaps the header band');
    assert.ok(inside(L.photo, L.content), 'the photo band reaches into the header band');
  });

  test(`${format}: must-read boxes sit inside the safe area`, () => {
    for (const [name, b] of Object.entries({ badge: L.badge, text: L.text, ...L.end })) {
      assert.ok(inside(b, L.safe), `${name} ${JSON.stringify(b)} is outside safe ${JSON.stringify(L.safe)}`);
    }
  });

  test(`${format}: regions sit inside the frame`, () => {
    for (const b of [L.header, L.content, L.photo, L.safe]) assert.ok(inside(b, frame));
  });

  test(`${format}: the text area holds a kicker plus three headline lines, or four lines alone`, () => {
    const kickerH = L.kicker.size * 1.44 + L.kicker.gap;
    assert.ok(kickerH + 3 * L.headline.size * L.headline.lineHeight <= L.text.h);
    assert.ok(4 * L.headline.size * L.headline.lineHeight <= L.text.h);
    assert.ok(kickerH + 3 * L.checklist.rowH + 2 * L.checklist.gap <= L.text.h);
    assert.ok(3 * L.rows.size * 1.2 + 2 * L.rows.gap <= L.text.h, 'three path rows (0.1em padding) overflow');
  });

  test(`${format}: the badge never touches a wipe, and it's on screen from frame 0`, () => {
    for (let f = 0; f <= Math.round(DURATION * FPS); f++) {
      const t = f / FPS;
      const b = lerpBox(L.badge, L.end.logo, travel(t));
      assert.ok(inside(b, frame), `badge leaves the frame at ${t.toFixed(3)} s`);
      const span = wipeSpan(t);
      if (!span) continue;
      const w = { x: L.content.x + span.from * L.content.w, y: L.content.y, w: (span.to - span.from) * L.content.w, h: L.content.h };
      assert.ok(!overlaps(b, w), `the wipe reaches the badge at ${t.toFixed(3)} s`);
    }
    assert.equal(travel(0), 0);
    assert.ok(travel(T.end - 1 / FPS) === 0, 'the badge leaves the header band before the end card');
  });

  test(`${format}: end card parts stack without overlapping, and the logo clears them`, () => {
    const { logo, ...rest } = L.end;
    const parts = Object.values(rest).sort((a, b) => a.y - b.y);
    for (let i = 1; i < parts.length; i++) assert.ok(parts[i].y >= parts[i - 1].y + parts[i - 1].h, `end parts ${i - 1}/${i} overlap`);
    for (const p of parts) assert.ok(!overlaps(logo, p), `the end card logo overlaps ${JSON.stringify(p)}`);
    assert.ok(inside(lerpBox(L.badge, logo, 0.5), frame));
  });

  test(`${format}: the evidence tiles fill the photo band with even gaps`, () => {
    const along = L.grid.axis === 'x' ? L.photo.w : L.photo.h;
    const cells = tiles(along, 3, L.grid.gap);
    assert.equal(cells[0].at, 0);
    assert.ok(Math.abs(cells[2].at + cells[2].size - along) < 1e-9);
    assert.ok(Math.abs(cells[1].at - (cells[0].size + L.grid.gap)) < 1e-9);
  });
}

test('layouts differ per format: nothing is a crop of another format', () => {
  const [v, s, l] = ['vertical', 'square', 'landscape'].map(layout);
  assert.notDeepEqual(v.photo, s.photo);
  assert.notDeepEqual(v.photo, l.photo);
  assert.equal(l.photo.fade, 'right');
});

test('cover fills the region and keeps the focal point in view', () => {
  const region = { x: 0, y: 0, w: 1080, h: 690 };
  for (const [iw, ih] of [[1080, 1200], [1222, 720], [960, 1080], [990, 1230]]) {
    for (const focus of [[0.5, 0.5], [0.1, 0.9], [0.95, 0.05]]) {
      for (const zoom of [1, 1.08]) {
        const c = cover(iw, ih, region, focus, zoom, 6, -4);
        assert.ok(c.x <= region.x + 1e-6 && c.y <= region.y + 1e-6, 'uncovered top or left edge');
        assert.ok(c.x + c.w >= region.x + region.w - 1e-6 && c.y + c.h >= region.y + region.h - 1e-6, 'uncovered edge');
      }
    }
  }
});

test('unknown formats are rejected', () => {
  assert.throws(() => layout('portrait'), /unknown format/);
});

test('the push and the end-card logo move on the first frame', () => {
  // Out-cubic. The v2 in-out ease was still under a few pixels two frames after the beat.
  const frame = 1 / FPS;
  assert.ok(pushP(T.swipe + frame) > 0.04, 'scene 2 push is still eased in');
  assert.ok(travel(T.travel + frame) > 0.04, 'logo travel is still eased in');
  assert.equal(pushP(T.swipe), 0);
  assert.equal(travel(T.end - frame), 0);
});

test('the coil sweep finishes on the blower cut', () => {
  assert.ok(T.blowers > T.s4d && T.blowers < T.s5a);
  assert.ok(Math.abs(T.sweep4d + SWEEP_4D - T.blowers) < 0.002);
});
