// Checks every format's layout without rendering: `npm test` (node --test test/layout.test.mjs).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FORMATS, cover, layout, lerpBox } from '../composition/layout.js';

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
    assert.ok(3 * L.rows.rowH + 2 * L.rows.gap <= L.text.h);
  });

  test(`${format}: end card parts don't overlap and the badge can travel to the logo`, () => {
    const parts = Object.values(L.end).filter((b) => b.x >= L.text.x - 1 || format !== 'landscape').sort((a, b) => a.y - b.y);
    for (let i = 1; i < parts.length; i++) assert.ok(parts[i].y >= parts[i - 1].y + parts[i - 1].h, `end parts ${i - 1}/${i} overlap`);
    const mid = lerpBox(L.badge, L.end.logo, 0.5);
    assert.ok(inside(mid, frame));
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
