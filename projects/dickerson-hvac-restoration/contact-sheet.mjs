// One settled frame per scene from the final render, labeled with its timecode and photo.
//
//   node contact-sheet.mjs   ->  brag-output/contact_sheet.png
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'brag-output');
const dir = path.join(outDir, 'work', 'contact');
const CHROME = process.env.CHROME || '/usr/bin/google-chrome-stable';

// [id, name, start, end, still time, photo]; starts match T in composition/timeline.js.
const SCENES = [
  ['1', 'Hook', 0, 3.0, 2.0, 'Photo 11, before half'],
  ['2', 'You may have a third option', 3.0, 5.4, 4.9, 'Photo 08, before/after slider'],
  ['3', 'Three paths', 5.4, 7.745, 6.9, 'Photo 08 after, dimmed'],
  ['4a', 'More than a basic tune-up', 7.745, 9.8, 9.4, 'Photo 01, before/after slider'],
  ['4b', 'May include: deep cleaning', 9.8, 11.98, 11.6, 'Photo 09, before/after slider'],
  ['4c', 'May include: age-related parts', 11.98, 14.08, 13.7, 'Photo 06, before/after slider'],
  ['4d', 'May include: checks, photos, report', 14.08, 16.475, 15.9, 'Photo 07, before/after slider'],
  ['5a', 'Evidence before recommendation', 16.475, 20.1, 19.2, 'Photo 03, blower wheel'],
  ['5b', 'Not the automatic answer', 20.1, 24.115, 23.4, 'Photo 03, dimmed'],
  ['6', 'The $85 first step', 24.115, 27.35, 26.6, 'Photo 02, clean coil'],
  ['7', 'End card', 27.35, 30.2, 29.5, 'Logo only'],
];

const tc = (s) => `0:${s.toFixed(2).padStart(5, '0')}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

fs.mkdirSync(dir, { recursive: true });
for (const [id, , , , still] of SCENES) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(still), '-i', path.join(outDir, 'brag.mp4'),
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
header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 34px; }
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
.legend { height: 569px; border: 2px solid #2b2b2b; border-radius: 8px; padding: 28px 26px;
  display: flex; flex-direction: column; gap: 20px; font-size: 20px; line-height: 1.35; color: #cfcfcf; }
.legend b { display: block; color: #fafafa; font-size: 22px; font-weight: 800; margin-bottom: 2px; }
</style></head><body><div id="sheet">
<header><h1>Dickerson Services <span>/</span> HVAC System Restoration</h1>
<div class="meta">30s vertical, 1080x1920, 30fps. One settled frame per scene.</div></header>
<div class="grid">${tiles}
  <div class="legend">
    <div><b>Format</b>30.2s, H.264 + AAC, captions inside the 1:1 center square</div>
    <div><b>Music</b>Happy Beats / Business Moves vol. 12, edited so the end card lands on the final hit</div>
    <div><b>Only price on screen</b>$85</div>
    <div><b>Photos</b>Real Dickerson jobs (01, 02, 03, 06, 07, 08, 09, 11)</div>
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
const out = path.join(outDir, 'contact_sheet.png');
await (await page.$('#sheet')).screenshot({ path: out });
await browser.close();
console.log(out);
