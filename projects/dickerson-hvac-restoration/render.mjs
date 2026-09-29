// Renders the composition in headless Chrome, one screenshot per frame, then encodes.
//
//   node render.mjs --stills 0,3.2,8.5 [--guides]   review stills -> brag-output/work/stills/
//   node render.mjs [--workers 3]                   full render  -> brag-output/brag.mp4
//
// Needs: composition/assets/ (bash prep-assets.sh <tarball>), brag-output/work/audio/mix.wav
// (python3 build-audio.py) for the full render, Chrome, ffmpeg.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const compDir = path.join(here, 'composition');
const outDir = path.join(here, 'brag-output');
const workDir = path.join(outDir, 'work');
const CHROME = process.env.CHROME || '/usr/bin/google-chrome-stable';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.svg': 'image/svg+xml',
};

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(compDir, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(compDir) || !fs.existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function openPage(port, query = '') {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      '--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--force-color-profile=srgb',
      '--font-render-hinting=none', '--disable-lcd-text', '--mute-audio',
    ],
    defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('status of 404')) console.error('[page]', m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) console.error('[page]', r.status(), r.url()); });
  page.on('pageerror', (e) => console.error('[page error]', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html${query}`, { waitUntil: 'load' });
  await page.evaluate(() => window.__ready);
  return { browser, page };
}

async function shoot(page, t, file) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  await page.screenshot({ path: file, type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 }, optimizeForSpeed: true });
}

function run(cmd, cmdArgs) {
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`${cmd} exited with ${r.status}`);
}

const server = await serve();
const { port } = server.address();

try {
  const stills = opt('--stills', null);
  if (stills) {
    const dir = path.join(workDir, 'stills');
    fs.mkdirSync(dir, { recursive: true });
    const { browser, page } = await openPage(port, flag('--guides') ? '?guides=1' : '');
    for (const s of stills.split(',').map(Number)) {
      const file = path.join(dir, `t_${s.toFixed(2).padStart(5, '0')}.png`);
      await shoot(page, s, file);
      console.log(file);
    }
    await browser.close();
  } else {
    const workers = Number(opt('--workers', 3));
    const framesDir = path.join(workDir, 'frames');
    fs.rmSync(framesDir, { recursive: true, force: true });
    fs.mkdirSync(framesDir, { recursive: true });

    const probe = await openPage(port);
    const { duration, fps } = await probe.page.evaluate(() => window.COMPOSITION);
    await probe.browser.close();
    const total = Math.round(duration * fps);
    console.log(`rendering ${total} frames at ${fps}fps with ${workers} workers`);

    const started = Date.now();
    let done = 0;
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const { browser, page } = await openPage(port);
      for (let f = w; f < total; f += workers) {
        await shoot(page, f / fps, path.join(framesDir, `f_${String(f).padStart(5, '0')}.png`));
        done += 1;
        if (done % 60 === 0) console.log(`  ${done}/${total} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
      }
      await browser.close();
    }));

    const audio = path.join(workDir, 'audio', 'mix.wav');
    if (!fs.existsSync(audio)) throw new Error(`missing ${audio}; run python3 build-audio.py first`);
    const out = path.join(outDir, 'brag.mp4');
    run('ffmpeg', [
      '-v', 'error', '-y',
      '-framerate', String(fps), '-i', path.join(framesDir, 'f_%05d.png'),
      '-i', audio,
      '-map', '0:v', '-map', '1:a',
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-level', '4.2', '-g', '60',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
      '-t', String(total / fps), '-movflags', '+faststart',
      out,
    ]);
    console.log(`wrote ${out} in ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
} finally {
  server.close();
}
