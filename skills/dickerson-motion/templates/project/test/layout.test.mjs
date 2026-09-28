// Checks every format's layout without rendering: `npm test` (node --test test/layout.test.mjs).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FORMATS, cover, layout } from '../composition/layout.js';

const inside = (b, r) => b.x >= r.x && b.y >= r.y && b.x + b.w <= r.x + r.w && b.y + b.h <= r.y + r.h;

for (const format of Object.keys(FORMATS)) {
  const L = layout(format);
  const frame = { x: 0, y: 0, w: L.w, h: L.h };

  test(`${format}: must-read boxes sit inside the safe area`, () => {
    for (const [name, b] of Object.entries({ logo: L.logo, headline: L.headline, body: L.body, ...L.end })) {
      assert.ok(inside(b, L.safe), `${name} ${JSON.stringify(b)} is outside safe ${JSON.stringify(L.safe)}`);
    }
  });

  test(`${format}: the photo window and safe area sit inside the frame`, () => {
    assert.ok(inside(L.photo, frame));
    assert.ok(inside(L.safe, frame));
  });

  test(`${format}: text boxes hold their line budget at full size`, () => {
    for (const name of ['headline', 'body']) {
      const b = L[name];
      assert.ok(b.size * b.lineHeight * b.maxLines <= b.h, `${name}: ${b.maxLines} lines of ${b.size}px overflow ${b.h}px`);
    }
  });

  test(`${format}: end card parts don't overlap`, () => {
    const parts = Object.values(L.end).sort((a, b) => a.y - b.y);
    for (let i = 1; i < parts.length; i++) assert.ok(parts[i].y >= parts[i - 1].y + parts[i - 1].h);
  });
}

test('layouts differ per format: nothing is a crop of another format', () => {
  const [v, s, l] = ['vertical', 'square', 'landscape'].map(layout);
  assert.notDeepEqual(v.headline, s.headline);
  assert.notDeepEqual(v.photo, l.photo);
  assert.equal(l.photo.fade, 'right');
});

test('cover fills the region and keeps the focal point in view', () => {
  const region = { x: 0, y: 0, w: 1080, h: 1160 };
  for (const [iw, ih] of [[4032, 3024], [3024, 4032], [1000, 1000]]) {
    for (const focus of [[0.5, 0.5], [0.1, 0.9], [0.95, 0.05]]) {
      for (const zoom of [1, 1.08]) {
        const c = cover(iw, ih, region, focus, zoom, 6, -4);
        assert.ok(c.x <= region.x + 1e-6 && c.y <= region.y + 1e-6, 'uncovered top or left edge');
        assert.ok(c.x + c.w >= region.x + region.w - 1e-6 && c.y + c.h >= region.y + region.h - 1e-6, 'uncovered edge');
        const fx = c.x + focus[0] * c.w;
        const fy = c.y + focus[1] * c.h;
        assert.ok(fx >= region.x - 1 && fx <= region.x + region.w + 1 && fy >= region.y - 1 && fy <= region.y + region.h + 1,
          `focus ${focus} out of view for ${iw}x${ih}`);
      }
    }
  }
});

test('unknown formats are rejected', () => {
  assert.throws(() => layout('portrait'), /unknown format/);
});
