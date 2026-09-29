// Renders the composition in headless Chrome, one screenshot per frame, then encodes with ffmpeg.
// See RENDER.md in the dickerson-motion skill.
//
//   node render.mjs --lint                                   scan composition/ for banned APIs
//   node render.mjs --check-determinism [--format all]       seek out of order, compare frames
//   node render.mjs --stills 0,2.5,7.5 [--format all] [--guides]   -> out/stills/<id>/t_07.50.png
//   node render.mjs [--format all] [--audio work/audio/mix.wav] [--version 2]
//                                                            -> out/<slug>_<id>_<w>x<h>_v2.mp4 (+ .jpg poster)
//   node render.mjs --format square --range 12-16 [--audio ...] [--version 2]
//                                                            re-render those seconds, re-encode
//   node render.mjs --serve                                  preview server for a browser
//
// Options: --slug NAME (default: this folder's name), --workers N, CHROME=/path/to/chrome.
// Every render runs --lint first and stops if it fails.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMATS } from './composition/layout.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const compDir = path.join(here, 'composition');
const outDir = path.join(here, 'out');
const framesRoot = path.join(here, 'work', 'frames');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : dflt;
};
const formatArg = opt('--format', 'all');
const formats = formatArg === 'all' ? Object.keys(FORMATS) : formatArg.split(',');
for (const f of formats) if (!FORMATS[f]) die(`unknown format "${f}"; use ${Object.keys(FORMATS).join(', ')} or all`);
const slug = opt('--slug', path.basename(here));
const version = Number(opt('--version', 1));
const workers = Number(opt('--workers', Math.max(1, Math.min(6, os.cpus().length - 1))));

function die(msg) {
  console.error(`render: ${msg}`);
  process.exit(1);
}

// ---- lint: the deterministic render contract (RULES.md, section 3) ----
const BANNED = [
  [/Math\.random\s*\(/, 'Math.random (use rng(seed) or noise() from motion.js)'],
  [/\bsetTimeout\s*\(/, 'setTimeout'],
  [/\bsetInterval\s*\(/, 'setInterval'],
  [/\brequestAnimationFrame\s*\(/, 'requestAnimationFrame'],
  [/\bDate\.now\s*\(|\bnew Date\s*\(/, 'wall-clock time (Date)'],
  [/\bperformance\.now\s*\(/, 'performance.now'],
  [/\.animate\s*\(/, 'element.animate (Web Animations)'],
  [/@keyframes/, '@keyframes'],
  [/(^|[;{\s"'])(transition|animation)(-[a-z-]+)?\s*:/, 'CSS transition or animation'],
  [/\.style\.(transition|animation)|setProperty\(\s*['"](transition|animation)/, 'CSS transition or animation set from JS'],
  [/\b(transition|animation)(Duration|Delay|Name|Property|TimingFunction)?\s*:\s*['"`]/, 'CSS transition or animation set from JS'],
  [/<video\b[^>]*\bautoplay|<audio\b/i, 'autoplaying media'],
  [/\.gif\b/i, 'animated GIF'],
];

function stripComments(text, ext) {
  // Blank out comments, keeping line numbers, so notes about banned APIs don't trip the lint.
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  if (ext === '.html') text = text.replace(/<!--[\s\S]*?-->/g, blank);
  text = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (ext !== '.css') text = text.replace(/(^|[^:"'\\])\/\/.*$/gm, (m, pre) => pre + blank(m.slice(pre.length)));
  return text;
}

function lint() {
  const problems = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
  for (const file of walk(compDir).filter((f) => /\.(m?js|css|html)$/.test(f))) {
    const lines = stripComments(fs.readFileSync(file, 'utf8'), path.extname(file)).split('\n');
    lines.forEach((line, i) => {
      for (const [re, what] of BANNED) if (re.test(line)) problems.push(`${path.relative(here, file)}:${i + 1}: ${what}`);
    });
  }
  return problems;
}

// ---- serving and Chrome ----
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2',
};

function serve(port = 0) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(here, rel === '/' ? 'composition/index.html' : rel);
    if (!file.startsWith(here + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

function chromePath() {
  const candidates = [
    process.env.CHROME,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ];
  const found = candidates.find((c) => c && fs.existsSync(c));
  if (!found) die('Chrome not found; set CHROME to its path (see INSTALL.md)');
  return found;
}

async function openPage(port, format, extra = '') {
  const { default: puppeteer } = await import('puppeteer-core');
  const { w, h } = FORMATS[format];
  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: [
      '--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--force-color-profile=srgb',
      '--font-render-hinting=none', '--disable-lcd-text', '--mute-audio',
    ],
    defaultViewport: { width: w, height: h, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('[page error]', e.message));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) console.error('[page]', r.status(), r.url()); });
  await page.goto(`http://127.0.0.1:${port}/composition/index.html?format=${format}${extra}`, { waitUntil: 'load' });
  try {
    await page.evaluate(() => window.__ready);
  } catch (err) {
    await browser.close();
    die(String(err.message || err).split('\n')[0]);
  }
  return { browser, page };
}

async function shoot(page, format, t, file) {
  const { w, h } = FORMATS[format];
  await page.evaluate((tt) => window.seek(tt), t);
  return page.screenshot({ path: file, type: 'png', clip: { x: 0, y: 0, width: w, height: h }, optimizeForSpeed: true });
}

function ffmpeg(argv) {
  const r = spawnSync('ffmpeg', argv, { stdio: 'inherit' });
  if (r.status !== 0) die(`ffmpeg exited with ${r.status}`);
}

const pad = (n, width) => String(n).padStart(width, '0');
const secs = (s) => s.toFixed(2).padStart(5, '0');

// ---- modes ----
if (flag('--lint') || !flag('--serve')) {
  const problems = lint();
  if (problems.length) {
    console.error(`render: the composition breaks the deterministic contract:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  if (flag('--lint')) {
    console.log('lint: composition/ uses no timers, clocks, unseeded randomness, CSS transitions or animations');
    process.exit(0);
  }
}

const server = await serve(flag('--serve') ? Number(opt('--port', 8080)) : 0);
const { port } = server.address();

try {
  if (flag('--serve')) {
    console.log(`preview: http://127.0.0.1:${port}/composition/index.html?format=vertical&t=0 (add &guides=1; Ctrl+C to stop)`);
    await new Promise(() => {});
  } else if (flag('--check-determinism')) {
    let ok = true;
    for (const format of formats) {
      const { browser, page } = await openPage(port, format);
      const { duration } = await page.evaluate(() => window.COMPOSITION);
      const t1 = +(duration * 0.23).toFixed(3);
      const t2 = +(duration * 0.61).toFixed(3);
      const a = await shoot(page, format, t2, undefined);
      await shoot(page, format, t1, undefined);
      await shoot(page, format, 0, undefined);
      const b = await shoot(page, format, t2, undefined);
      await browser.close();
      const same = Buffer.compare(a, b) === 0;
      ok &&= same;
      console.log(`${format}: frame at ${t2}s ${same ? 'identical' : 'DIFFERENT'} after seeking to ${t1}s and 0s in between`);
    }
    if (!ok) die('seek(t) is not a pure function of t: look for state carried between frames');
  } else if (opt('--stills', null)) {
    const times = opt('--stills').split(',').map(Number);
    for (const format of formats) {
      const dir = path.join(outDir, 'stills', FORMATS[format].id);
      fs.mkdirSync(dir, { recursive: true });
      const { browser, page } = await openPage(port, format, flag('--guides') ? '&guides=1' : '');
      for (const t of times) {
        const file = path.join(dir, `t_${secs(t)}${flag('--guides') ? '_guides' : ''}.png`);
        await shoot(page, format, t, file);
        console.log(path.relative(here, file));
      }
      await browser.close();
    }
  } else {
    const range = opt('--range', null);
    const audio = opt('--audio', path.join('work', 'audio', 'mix.wav'));
    const hasAudio = fs.existsSync(path.resolve(here, audio));
    if (!hasAudio) console.warn(`render: no audio at ${audio}; rendering silent (pass --audio)`);
    fs.mkdirSync(outDir, { recursive: true });
    for (const format of formats) {
      const { id, w, h } = FORMATS[format];
      const framesDir = path.join(framesRoot, id);
      const probe = await openPage(port, format);
      const { duration, fps } = await probe.page.evaluate(() => window.COMPOSITION);
      await probe.browser.close();
      const total = Math.round(duration * fps);
      let first = 0;
      let last = total;
      if (range) {
        const [a, b] = range.split('-').map(Number);
        first = Math.max(0, Math.floor(a * fps));
        last = Math.min(total, Math.ceil(b * fps) + 1);
        if (!fs.existsSync(path.join(framesDir, `f_${pad(total - 1, 5)}.png`))) {
          die(`no complete frame cache for ${format}; render it fully once before using --range`);
        }
      } else {
        fs.rmSync(framesDir, { recursive: true, force: true });
      }
      fs.mkdirSync(framesDir, { recursive: true });
      console.log(`${format}: frames ${first}-${last - 1} of ${total} at ${fps} fps with ${workers} workers`);

      const started = Date.now();
      let done = 0;
      await Promise.all(Array.from({ length: workers }, async (_, k) => {
        const { browser, page } = await openPage(port, format);
        for (let f = first + k; f < last; f += workers) {
          await shoot(page, format, f / fps, path.join(framesDir, `f_${pad(f, 5)}.png`));
          done += 1;
          if (done % 90 === 0) console.log(`  ${done}/${last - first} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
        }
        await browser.close();
      }));

      const base = path.join(outDir, `${slug}_${id}_${w}x${h}_v${version}`);
      ffmpeg([
        '-v', 'error', '-y',
        '-framerate', String(fps), '-i', path.join(framesDir, 'f_%05d.png'),
        ...(hasAudio ? ['-i', path.resolve(here, audio), '-map', '0:v', '-map', '1:a'] : []),
        '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-level', '4.2', '-g', String(2 * fps),
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
        ...(hasAudio ? ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000'] : []),
        '-t', String(total / fps), '-movflags', '+faststart', `${base}.mp4`,
      ]);
      ffmpeg(['-v', 'error', '-y', '-i', path.join(framesDir, 'f_00000.png'), '-q:v', '2', `${base}.jpg`]);
      console.log(`wrote ${path.relative(here, base)}.mp4 and .jpg (poster = frame 0) in ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
  }
} finally {
  server.close();
}
