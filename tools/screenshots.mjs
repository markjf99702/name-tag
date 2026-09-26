// Renders the README screenshots (docs/*.png) and the link preview (og.png):  node tools/screenshots.mjs
// Math.random is seeded, so the same names come out every time. Needs Playwright, and upng-js from `npm install`.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(join(execSync('npm root -g').toString().trim(), 'playwright')); }
const UPNG = require('upng-js');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let body;
  try { body = await readFile(join(root, path === '/' ? 'index.html' : path)); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'text/html' });
  res.end(body);
}).listen(0);
const base = `http://localhost:${server.address().port}/`;
const SEED = 11;
const browser = await pw.chromium.launch();
await mkdir(join(root, 'docs'), { recursive: true });

// A 256-colour palette keeps the PNGs small.
async function save(shot, path) {
  const img = UPNG.decode(shot);
  await writeFile(join(root, path), Buffer.from(UPNG.encode(UPNG.toRGBA8(img), img.width, img.height, 256)));
}

async function open(viewport, deviceScaleFactor, saved = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor, hasTouch: true, serviceWorkers: 'block', reducedMotion: 'reduce', colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.addInitScript(([seed, state]) => {
    let a = seed; // mulberry32
    Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('name-tag:v1', JSON.stringify(state));
      sessionStorage.setItem('seeded', '1');
    }
  }, [SEED, saved]);
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('#dealt .hang');
  return page;
}

const scrollTo = (page, sel, pad = 64) => page.evaluate(([s, p]) => window.scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - p), [sel, pad]);

// Phone screenshots for the README.
{
  const page = await open({ width: 390, height: 844 }, 2, { species: 'cat', themes: ['snacks'], coats: ['ginger'], normal: 'mix', easy: true });
  await scrollTo(page, '#results', 62);
  await save(await page.screenshot(), 'docs/phone-find.png');

  await page.goto(base + '#/check');
  await page.click('[data-group="checkSpecies"] [data-v="dog"]');
  await page.click('#home summary');
  await page.fill('#house', 'Kat, Mark');
  await page.fill('#surname', 'Farrell');
  await page.fill('#nameInput', 'Kit');
  await page.waitForFunction(() => document.querySelector('#report .stamp')?.textContent === 'Think again', null, { polling: 100 });
  await scrollTo(page, '#report', 64);
  await save(await page.screenshot(), 'docs/phone-check.png');

  await page.fill('#house', '');
  await page.fill('#nameInput', 'Butterscotch');
  await page.waitForFunction(() => document.querySelector('#report .stamp')?.textContent === 'Good name', null, { polling: 100 });
  await scrollTo(page, '#report .receipt', 70);
  await save(await page.screenshot(), 'docs/phone-report.png');
  await page.context().close();
}

// The shortlist on a laptop.
{
  const saved = ['Pickles', 'Gerald', 'Butterscotch', 'Hoof Hearted', 'Waffles', 'Kevin']
    .map((name, i) => ({ name, species: name === 'Hoof Hearted' ? 'horse' : i % 2 ? 'cat' : 'dog', at: i }));
  const page = await open({ width: 1280, height: 800 }, 1, { saved, house: 'Luna', surname: 'Farrell' });
  await page.goto(base + '#/check');
  await page.fill('#nameInput', 'Pesto');
  await page.waitForFunction(() => document.querySelector('#report .stamp')?.textContent === 'Great name', null, { polling: 100 });
  await page.waitForTimeout(300);
  await save(await page.screenshot(), 'docs/desktop-check.png');
  await page.context().close();
}

// Link preview, 1200 x 630: the name and one line on the left, three real tags with their verdicts on the right.
{
  const page = await open({ width: 1200, height: 630 }, 1);
  await page.evaluate(async () => {
    const { tagSVG } = await import('./js/tag.js');
    const { check } = await import('./js/check.js');
    const tags = [['Dobby', 'dog', 92], ['Gerald', 'cat', 170], ['Hoof Hearted', 'horse', 60]].map(([name, species, top]) => {
      const v = check(name, { species }).verdict;
      return `<div class="hang big og" style="margin-top:${top}px">${tagSVG(name, { species })}<span class="stamp s-${v.id}">${v.stamp}</span></div>`;
    }).join('');
    document.body.innerHTML = `<div class="ogcard">
      <div class="panel ogtext">
        <div class="ogbrand"><img src="icon.svg" alt="" width="68" height="68"></div>
        <h1>Name Tag</h1>
        <p>Find a name for a new pet, or find out what’s wrong with the one you picked.</p>
      </div>
      <div class="ogtags">${tags}</div>
    </div>`;
    const style = document.createElement('style');
    style.textContent = `
      body { width: 1200px; height: 630px; overflow: hidden; background-position: 0 0; }
      .ogcard { position: relative; height: 630px; }
      .ogtext { position: absolute; left: 52px; top: 50%; transform: translateY(-50%); width: 500px; padding: 36px 38px 40px; }
      .ogtext h1 { font-size: 82px; margin-top: 20px; white-space: nowrap; }
      .ogtext p { font-size: 27px; line-height: 1.32; color: var(--muted); margin-top: 16px; font-weight: 500; }
      .ogtags { position: absolute; left: 574px; right: 14px; top: 0; display: flex; justify-content: space-between; align-items: flex-start; }
      .hang.og { width: 204px; }
      .hang.og .tag { animation: none; }
      .hang.og .stamp { font-size: 1.2rem; }`;
    document.head.append(style);
    await document.fonts.ready;
  });
  await page.waitForTimeout(200);
  await save(await page.screenshot(), 'og.png');
  await page.context().close();
}

await browser.close();
server.close();
console.log('screenshots written');
