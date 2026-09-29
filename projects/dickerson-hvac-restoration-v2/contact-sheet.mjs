// One frame per scene from the final vertical render, labeled with its window and photo.
//
//   node contact-sheet.mjs   ->  out/contact_sheet_9x16_v2.png
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { DURATION, T } from './composition/timing.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const video = path.join(here, 'out', 'dickerson-hvac-restoration_9x16_1080x1920_v2.mp4');
const dir = path.join(here, 'work', 'contact');
const CHROME = process.env.CHROME || '/usr/bin/google-chrome-stable';

// [id, name, start, end, still time, photo]. Before/after scenes are caught mid-reveal.
const SCENES = [
  ['1', 'Hook', 0, T.swipe, 2.2, 'Photo 11, overgrown packaged unit'],
  ['2', 'You may have a third option', T.swipe, T.paths, 4.45, 'Photo 08, condenser coil, sweep'],
  ['3', 'Repair / System Restoration / Replacement', T.paths, T.s4a, 7.0, 'Photo 08 after, darkened'],
  ['4a', 'More than a basic tune-up', T.s4a, T.s4b, 8.8, 'Photo 04, indoor coil, sweep'],
  ['4b', 'May include: deep cleaning', T.s4b, T.s4c, 10.98, 'Photo 09, condenser panel, top-down sweep'],
  ['4c', 'May include: age-related parts', T.s4c, T.s4d, 13.8, 'Photo 06, air handler drain, split'],
  ['4d', 'May include: checks, photos, report', T.s4d, T.s5a, 16.5, 'Photo 07, coil surface, sweep'],
  ['5a', 'Evidence before recommendation', T.s5a, T.s5b, 21.0, 'Photos 08, 04 and 09, before'],
  ['5b', 'Not the automatic answer', T.s5b, T.end, 24.3, 'Evidence grid, darkened'],
  ['6', 'End card: $85 Aging HVAC Evaluation', T.end, DURATION, 28.5, 'Logo, offer, phone and URL'],
];

const tc = (s) => `0:${s.toFixed(2).padStart(5, '0')}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

if (!fs.existsSync(video)) throw new Error(`render the video first: ${video}`);
fs.mkdirSync(dir, { recursive: true });
for (const [id, , , , still] of SCENES) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(still), '-i', video,
    '-frames:v', '1', path.join(dir, `s${id}.png`)], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`ffmpeg failed for scene ${id}`);
}

const font = pathToFileURL(path.join(here, 'composition', 'fonts', 'NotoSans-VF.ttf')).href;
const tiles = SCENES.map(([id, name, a, b, , photo]) => `
  <div class="tile">
    <img src="s${id}.png">
    <div class="row"><span class="id">${id}</span><span class="tc">${tc(a)} to ${tc(b)}</span></div>
    <div class="name">${esc(name)}</div>
    <div class="photo">${esc(photo)}</div>
  </div>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Noto Sans VF"; src: url("${font}"); font-weight: 100 900; font-stretch: 62.5% 100%; }
* { box-sizing: border-box; margin: 0; }
body { background: #111111; }
#sheet { width: 2152px; padding: 48px; background: #111111; color: #fafafa; font-family: "Noto Sans VF"; }
header { display: flex; flex-direction: column; gap: 8px; margin-bottom: 34px; }
h1 { font-weight: 900; font-stretch: 75%; font-size: 50px; text-transform: uppercase; letter-spacing: 0.01em; }
h1 span { color: #d51e30; }
.meta { font-size: 23px; color: #b8b8b8; font-weight: 500; }
.grid { display: grid; grid-template-columns: repeat(6, 320px); gap: 36px 24px; }
.tile img { display: block; width: 320px; height: 569px; border-radius: 8px; }
.row { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.id { background: #ab1525; font-weight: 800; font-size: 21px; padding: 4px 10px 5px; border-radius: 5px; }
.tc { font-size: 20px; color: #cfcfcf; font-weight: 600; font-variant-numeric: tabular-nums; }
.name { margin-top: 9px; font-size: 24px; font-weight: 800; font-stretch: 87.5%; line-height: 1.15; }
.photo { margin-top: 5px; font-size: 18px; color: #9a9a9a; font-weight: 500; }
.legend { grid-column: span 2; height: 569px; border: 2px solid #2b2b2b; border-radius: 8px; padding: 28px 26px;
  display: flex; flex-direction: column; gap: 22px; font-size: 21px; line-height: 1.35; color: #cfcfcf; }
.legend b { display: block; color: #fafafa; font-size: 23px; font-weight: 800; margin-bottom: 2px; }
</style></head><body><div id="sheet">
<header><h1>Dickerson Services <span>/</span> HVAC System Restoration v2</h1>
<div class="meta">${DURATION}s vertical, 1080x1920, 30fps. One frame per scene; before/after scenes mid-reveal.</div></header>
<div class="grid">${tiles}
  <div class="legend">
    <div><b>Formats</b>One timeline, rendered natively at 1080x1920, 1080x1080 and 1920x1080. H.264 + AAC, about -14 LUFS.</div>
    <div><b>Music</b>Happy Beats / Business Moves vol. 12, spliced on measured downbeats so the end card lands on the final hit</div>
    <div><b>Only price on screen</b>$85</div>
    <div><b>Photos</b>Real Dickerson jobs, central ducted equipment only: 04, 06, 07, 08, 09, 11. Photos 01 to 03 excluded; 06 cropped clear of the line set.</div>
  </div>
</div></div></body></html>`;
fs.writeFileSync(path.join(dir, 'sheet.html'), html);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--allow-file-access-from-files', '--force-color-profile=srgb', '--hide-scrollbars'],
  defaultViewport: { width: 2152, height: 1600, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(dir, 'sheet.html')).href, { waitUntil: 'load' });
await page.evaluate(async () => {
  await document.fonts.load('800 24px "Noto Sans VF"');
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.decode()));
});
const out = path.join(here, 'out', 'contact_sheet_9x16_v2.png');
await (await page.$('#sheet')).screenshot({ path: out });
await browser.close();
console.log(out);
