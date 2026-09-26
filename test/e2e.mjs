// Uses the app in Chromium through the real page:  node test/e2e.mjs  (needs Playwright)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(join(execSync('npm root -g').toString().trim(), 'playwright')); }
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

// Every file the service worker caches must exist, and every script the page loads must be cached.
const sw = await readFile(join(root, 'sw.js'), 'utf8');
const shell = [...sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]).filter(f => f !== './');
for (const f of shell) await readFile(join(root, f));
for (const f of ['app', 'names', 'sound', 'check', 'generate', 'tag', 'store', 'voice', 'sayable']) assert.ok(shell.includes(`js/${f}.js`), `sw.js is missing js/${f}.js`);

const browser = await pw.chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', e => problems.push(e.message));
page.on('console', m => { if (m.type() === 'error') problems.push(m.text()); });
page.on('requestfailed', r => problems.push('failed: ' + r.url()));
page.on('request', r => { if (!r.url().startsWith(base)) problems.push('left the site: ' + r.url()); });

// A stand-in for the browser's voices, so the test can see what would be said and by which voice.
await page.addInitScript(() => {
  const voices = [
    { name: 'Albert', lang: 'en-US' }, { name: 'Samantha', lang: 'en-US', default: true },
    { name: 'Ava (Premium)', lang: 'en-US' }, { name: 'Daniel', lang: 'en-GB' }, { name: 'Thomas', lang: 'fr-FR' },
  ];
  window.spoken = [];
  window.SpeechSynthesisUtterance = function (text) { this.text = text; this.rate = 1; this.pitch = 1; };
  // Like Chrome: the list is empty at first and fills in later, with a voiceschanged event.
  let ready = false;
  const heard = [];
  window.voicesArrive = () => { ready = true; heard.forEach(f => f()); };
  const synth = { getVoices: () => (ready ? voices : []), speak: u => window.spoken.push({ text: u.text, voice: u.voice?.name, rate: u.rate, pitch: u.pitch }), cancel() {}, addEventListener: (type, f) => { if (type === 'voiceschanged') heard.push(f); } };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
});
await page.goto(base);
await page.evaluate(() => document.fonts.ready);

// Find: six names are dealt straight away, and picks change them.
await page.waitForSelector('#dealt .hang');
assert.equal(await page.locator('#dealt .hang').count(), 6);
await page.click('[data-group="species"] [data-v="cat"]');
await page.click('[data-group="themes"] [data-v="puns"]');
const puns = await page.locator('#dealt .tagbtn').evaluateAll(els => els.map(e => e.dataset.check));
assert.equal(puns.length, 6);
assert.ok(puns.every(n => /Cat|Meow|Paw|Purr|Claw|Kitty|Fur|Pounce|Pic|Catprio|Catsby|Catniss/i.test(n)), `not all cat puns: ${puns}`);
assert.match(await page.textContent('#results-h'), /names that fit/);
await page.click('#againBtn');
const again = await page.locator('#dealt .tagbtn').evaluateAll(els => els.map(e => e.dataset.check));
assert.notDeepEqual(again, puns, 'Deal again dealt the same names');

// Nothing fits: a clear message rather than an empty board.
await page.click('#more summary');
await page.fill('#letter', 'q');
assert.match(await page.textContent('#dealt'), /Try fewer picks/);
await page.fill('#letter', '');
await page.click('[data-group="themes"] [data-v="puns"]');

// Save a name; the tab shows the count.
const first = await page.locator('#dealt [data-save]').first().getAttribute('data-save');
await page.locator('#dealt [data-save]').first().click();
assert.equal(await page.textContent('#savedCount'), '1');

// Tapping a tag checks it.
await page.locator('#dealt .tagbtn').nth(1).click();
await page.waitForSelector('#page-check:not([hidden])');
assert.ok((await page.inputValue('#nameInput')).length > 0);
await page.waitForSelector('#report .receipt');

// Check: a name that sounds like a command, for a dog.
await page.click('[data-group="checkSpecies"] [data-v="dog"]');
await page.fill('#nameInput', 'Bo');
await page.waitForFunction(() => document.querySelector('#report .verdict')?.textContent.includes('Rhymes with “no”'), null, { polling: 100 });
assert.equal(await page.textContent('#report .stamp'), 'It’ll do');

// Calling it uses the most natural voice at a normal pitch; the menu offers the English voices and remembers a pick.
assert.equal(await page.locator('#voicePick').count(), 0, 'a voice menu with no voices');
await page.evaluate(() => window.voicesArrive());
await page.waitForSelector('#voicePick', { timeout: 3000 });
await page.click('#callBtn');
assert.deepEqual(await page.evaluate(() => window.spoken.pop()), { text: 'Bo! Bo, come here!', voice: 'Ava (Premium)', rate: 1, pitch: 1 });
assert.deepEqual(await page.locator('#voicePick option').allTextContents(), ['Samantha', 'Ava (Premium)', 'Daniel']);
await page.selectOption('#voicePick', 'Daniel');
await page.click('#troubleBtn');
const off = await page.evaluate(() => window.spoken.pop());
assert.equal(off.voice, 'Daniel');
assert.match(off.text, /^Bo, \w+!$/);

// A clash at home.
await page.click('#home summary');
await page.fill('#house', 'Kat');
await page.fill('#nameInput', 'Kit');
await page.waitForFunction(() => document.querySelector('#report .stamp')?.textContent === 'Think again', null, { polling: 100 });
assert.match(await page.textContent('#report .checks'), /Kit and Kat are one sound apart/);
assert.equal(await page.locator('#report .alts .tagbtn').count(), 4);

// A stupid name.
await page.fill('#house', '');
await page.fill('#nameInput', 'Hoof Hearted');
await page.waitForFunction(() => document.querySelector('#report .stamp')?.textContent === 'Please don’t', null, { polling: 100 });
await page.click('#report [data-save]');
assert.equal(await page.textContent('#savedCount'), '2');

// Shortlist: both names, stamped, and one gets picked.
await page.click('.tabs a[data-tab="list"]');
await page.waitForSelector('#page-list:not([hidden])');
const saved = await page.locator('#saved .tagbtn').evaluateAll(els => els.map(e => e.dataset.check));
assert.deepEqual(saved, ['Hoof Hearted', first]);
assert.equal(await page.locator('#saved .stamp').count(), 2);
await page.click('#pickBtn');
await page.waitForSelector('#saved .hang.picked', { timeout: 8000 });
assert.match(await page.textContent('#toast'), /^It’s /);

// It remembers after a reload.
await page.reload();
await page.waitForSelector('#saved .hang');
assert.equal(await page.locator('#saved .hang').count(), 2);
await page.locator('#saved [data-remove]').first().click();
assert.equal(await page.locator('#saved .hang').count(), 1);

// Fits a phone: nothing scrolls sideways, on any page.
for (const tab of ['find', 'check', 'list']) {
  await page.click(`.tabs a[data-tab="${tab}"]`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `the ${tab} page scrolls sideways on a phone`);
}

// Works offline once it has been opened.
await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 10000 }).catch(() => {});
await ctx.setOffline(true);
await page.reload();
await page.waitForSelector('#page-list:not([hidden]) #saved .hang', { timeout: 5000 });
assert.ok(await page.title(), 'the page did not load offline');
await ctx.setOffline(false);

assert.deepEqual(problems.filter(p => !p.startsWith('failed:')), [], 'problems while using it');
await browser.close();
server.close();
console.log('all good');
