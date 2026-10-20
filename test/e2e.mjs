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
// With down set, the server cuts every connection, like having no signal. (Playwright's setOffline doesn't stop the
// service worker's own requests, so it can't show that the offline copy works.)
let down = false;
const sockets = new Set();
const server = createServer(async (req, res) => {
  if (down) { req.socket.destroy(); return; }
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  // A stand-in for another junkdrawer.works tool on the same address, which never starts Name Tag's worker.
  if (path === '/another-tool/') { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<!doctype html><title>Another tool</title>'); return; }
  let body;
  try { body = await readFile(join(root, path === '/' ? 'index.html' : path)); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'text/html' });
  res.end(body);
}).listen(0);
server.on('connection', s => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
const signal = on => { down = !on; if (down) for (const s of sockets) s.destroy(); };
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
page.on('requestfailed', r => { if (!down) problems.push('failed: ' + r.url()); });
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

// Every tool at junkdrawer.works/… shares one address, and so one cache storage. Other tools' offline copies, made
// before Name Tag's worker starts, have to survive it, even one whose name starts like Name Tag's; an old copy of
// Name Tag's own goes (checked once the worker is in charge, near the end).
await page.goto(base + 'another-tool/');
await page.evaluate(() => Promise.all(['another-tool-v1', 'name-tag-x-v1', 'name-tag-v0']
  .map(name => caches.open(name).then(c => c.put('index.html', new Response(name))))));
await page.goto(base);
await page.evaluate(() => document.fonts.ready);

// Find: six names are dealt straight away, and picks change them.
await page.waitForSelector('#dealt .hang');
assert.equal(await page.locator('#dealt .hang').count(), 6);

// With a mouse, moving off a tag leaves it hanging there: it doesn't blink out and swing in again.
const swungIn = tag => tag.evaluate(t => t.getAnimations().every(a => a.playState === 'finished'));
const firstTag = page.locator('#dealt .tag').first();
await page.waitForFunction(() => [...document.querySelectorAll('#dealt .tag')].every(t => t.getAnimations().every(a => a.playState === 'finished')));
await firstTag.hover();
await page.waitForTimeout(800);
await page.mouse.move(1, 1);
assert.ok(await swungIn(firstTag), 'the tag swung in again after the pointer left it');

// With reduced motion on, Deal names jumps straight down to the names instead of gliding there.
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.evaluate(() => window.scrollTo(0, 0));
const jumped = await page.evaluate(() => { document.querySelector('#dealBtn').click(); return scrollY; });
await page.emulateMedia({ reducedMotion: null });
assert.ok(jumped > 300, `Deal names glided with reduced motion on (at ${jumped} straight after the tap)`);
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

// Enter in Starts with closes the keyboard; it doesn't send the form, reload the page and deal a new hand.
const hand = () => page.locator('#dealt .tagbtn').evaluateAll(els => els.map(e => e.dataset.check));
await page.fill('#letter', 'b');
const before = { url: page.url(), hand: await hand() };
await page.press('#letter', 'Enter');
await page.waitForTimeout(500);
assert.equal(page.url(), before.url, 'Enter in Starts with reloaded the page');
assert.deepEqual(await hand(), before.hand);
await page.fill('#letter', '');

// Save a name; the tab shows the count.
const first = await page.locator('#dealt [data-save]').first().getAttribute('data-save');
await page.locator('#dealt [data-save]').first().click();
assert.equal(await page.textContent('#savedCount'), '1');

// Tapping a tag checks it, and Back returns to the same spot on Find, next to that tag. (The spot is taken as the tap
// happens: Playwright may scroll a little more while the tags are still swinging in.)
await page.evaluate(() => document.addEventListener('click', () => { window.tappedAt = scrollY; }, { capture: true, once: true }));
await page.locator('#dealt .tagbtn').nth(1).click();
const spot = await page.evaluate(() => window.tappedAt);
await page.waitForSelector('#page-check:not([hidden])');
assert.ok((await page.inputValue('#nameInput')).length > 0);
await page.waitForSelector('#report .receipt');
assert.equal(await page.locator('#report .hang.big.swing .stamp.thump').count(), 1, 'the tag didn’t swing in, or the stamp didn’t thump');
await page.goBack();
await page.waitForSelector('#page-find:not([hidden])');
await page.waitForFunction(y => Math.abs(scrollY - y) < 5, spot, { timeout: 3000 }).catch(() => {});
assert.ok(spot > 300 && Math.abs(await page.evaluate(() => scrollY) - spot) < 5, `Back went to ${await page.evaluate(() => scrollY)}, not ${spot}`);
await page.goForward();
await page.waitForSelector('#page-check:not([hidden]) #report .receipt');

// With a keyboard, Enter on a tag opens Check with the focus on its heading, so the next Tab goes to the name box.
await page.click('.tabs a[data-tab="find"]');
await page.waitForFunction(() => document.activeElement?.id === 'find-h'); // the tab's own page change is done
await page.locator('#dealt .tagbtn').nth(2).focus();
await page.keyboard.press('Enter');
await page.waitForSelector('#page-check:not([hidden])');
assert.equal(await page.evaluate(() => document.activeElement.id), 'check-h', 'the focus was lost on the way to Check');
await page.keyboard.press('Tab');
assert.equal(await page.evaluate(() => document.activeElement.id), 'nameInput');

// Check: a name that sounds like a command, for a dog.
await page.click('[data-group="checkSpecies"] [data-v="dog"]');
await page.fill('#nameInput', 'Bo');
await page.waitForFunction(() => document.querySelector('#report .verdict')?.textContent.includes('Rhymes with “no”'), null, { polling: 100 });
assert.equal(await page.textContent('#report .stamp'), 'It’ll do');

// Picking dog on Check deals Find again when it opens, rather than leaving the cat names it had there.
await page.click('.tabs a[data-tab="find"]');
await page.waitForSelector('#page-find:not([hidden])');
assert.deepEqual(await page.locator('#dealt .tagbtn').evaluateAll(els => [...new Set(els.map(e => e.dataset.species))]), ['dog'], 'Find still shows the last animal’s names');
await page.click('.tabs a[data-tab="check"]');
await page.waitForSelector('#page-check:not([hidden]) #report .receipt');

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

// Numbers stay on the tag (K9 used to be engraved K), and the note about them leads.
await page.fill('#nameInput', 'K9');
await page.waitForFunction(() => document.querySelector('#report .tag')?.getAttribute('aria-label').startsWith('K9,'), null, { polling: 100 });
assert.match(await page.textContent('#report .verdict'), /Numbers on a tag look like a phone number/);

// Something typed with no letters in it gets a line saying so; an empty box still gets the blank tag.
const noLetters = () => page.waitForFunction(() => document.querySelector('#report')?.textContent.trim() === 'There are no letters in that to engrave.', null, { polling: 100 });
await page.fill('#nameInput', '123');
await noLetters();
await page.fill('#nameInput', '');
await page.waitForFunction(() => document.querySelector('#report .tag')?.getAttribute('aria-label').startsWith('Your pet?'), null, { polling: 100 });
await page.fill('#nameInput', '🐶');
await noLetters();

// A name in another alphabet isn't called keyboard mash, and doesn't get an empty It'll get called.
await page.fill('#nameInput', 'Барсик');
await page.waitForFunction(() => document.querySelector('#report .tag')?.getAttribute('aria-label').startsWith('Барсик,'), null, { polling: 100 });
assert.notEqual(await page.textContent('#report .stamp'), 'Please don’t');
assert.match(await page.textContent('#report .verdict'), /only work for names spelled in the English alphabet/);
assert.equal(await page.locator('#report .nicks').count(), 0, 'an empty It’ll get called');

// A very long one-word name breaks inside the page instead of pushing it wider than the phone. (The page wouldn't
// scroll sideways either way, because main clips the overflow; the right edge would just be cut off.)
await page.fill('#nameInput', 'Wolfeschlegelsteinhausenbergerdorffvoral');
await page.waitForFunction(() => document.querySelector('#report .trouble')?.textContent.includes('Wolfeschlegel'), null, { polling: 100 });
const overhang = await page.evaluate(() => Math.max(...[...document.querySelectorAll('#page-check .panel')].map(p => p.getBoundingClientRect().right)) - (innerWidth - 16));
assert.ok(overhang < 1, `with a long name, the Check page runs ${Math.round(overhang)}px past the gutter`);

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

// Pick one for me takes a few seconds however long the shortlist is (20 names used to take over a minute).
const many = ['Biscuit', 'Gerald', 'Pickles', 'Juniper', 'Waffles', 'Nacho', 'Pesto', 'Mabel', 'Olive', 'Hank', 'Ziggy', 'Rosie',
  'Bramble', 'Pepper', 'Tofu', 'Moose', 'Clover', 'Doris', 'Kevin', 'Noodle'];
await page.evaluate(names => {
  const s = JSON.parse(localStorage.getItem('name-tag:v1'));
  s.saved = names.map((name, at) => ({ name, species: 'dog', at }));
  localStorage.setItem('name-tag:v1', JSON.stringify(s));
}, many);
await page.reload();
await page.waitForSelector('#saved .hang');
assert.equal(await page.locator('#saved .hang').count(), 20);
await page.click('#pickBtn');
await page.waitForSelector('#saved .hang.picked', { timeout: 8000 });

// One draw at a time: a second tap while it's going does nothing, and the toast names the card it lands on.
const rolls = values => page.evaluate(v => { const real = Math.random; Math.random = () => (v.length ? v.shift() : real()); }, values);
await rolls([0.1, 0.9]);
await page.click('#pickBtn');
await page.click('#pickBtn');
// The highlight lifts and tilts each tag as it passes (looking only at tags that have finished swinging in).
const lifted = () => {
  const lit = document.querySelector('#saved .hang.lit');
  if (!lit || lit.querySelector('.tag').getAnimations().some(a => a.playState === 'running')) return false;
  return [lit.querySelector('.tag'), lit.querySelector('.tagbtn')].some(el => !['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(el).transform));
};
assert.ok(await page.waitForFunction(lifted, null, { timeout: 3000 }).catch(() => false), 'the highlighted tag isn’t lifted');
await page.waitForSelector('#saved .hang.picked', { timeout: 8000 });
await page.waitForTimeout(800);
assert.deepEqual(await page.locator('#saved .hang.picked .tagbtn').evaluateAll(els => els.map(e => e.dataset.check)), ['Pickles'], 'two draws at once');
assert.equal(await page.textContent('#toast'), 'It’s Pickles.');

// Leaving the shortlist, or changing it, stops the draw: no pick, no toast and no error.
await page.evaluate(() => { document.querySelector('#toast').textContent = ''; });
await rolls([0.99]);
await page.click('#pickBtn');
assert.ok(await swungIn(page.locator('#saved .hang').nth(2).locator('.tag')), 'the last pick blinked out and swung in again when the next draw started');
await page.click('.tabs a[data-tab="find"]');
await page.waitForTimeout(4500);
assert.equal(await page.textContent('#toast'), '', 'the draw carried on after leaving the shortlist');
await page.click('.tabs a[data-tab="list"]');
await rolls([0.99]);
await page.click('#pickBtn');
for (let i = 0; i < 3; i++) await page.locator('#saved [data-remove]').first().click();
await page.waitForTimeout(4500);
assert.equal(await page.locator('#saved .hang').count(), 17);
assert.equal(await page.locator('#saved .hang.picked').count(), 0);
assert.equal(await page.textContent('#toast'), '', 'the draw carried on after the list changed');
assert.deepEqual(problems, [], 'problems during the draws');

// Copy the list: where the clipboard is refused, the list shows up under the buttons, selected, ready to copy by hand.
const clipboard = writeText => page.evaluate(how => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
  writeText: how === 'refuse' ? () => Promise.reject(new DOMException('Write permission denied.', 'NotAllowedError')) : text => { window.copied = text; return Promise.resolve(); },
} }), writeText);
await clipboard('refuse');
await page.click('#copyBtn');
await page.waitForSelector('#copyText:not([hidden])');
const shown = await page.evaluate(() => { const t = document.querySelector('#copyText'); return { text: t.value, focused: document.activeElement === t, from: t.selectionStart, to: t.selectionEnd }; });
assert.ok(shown.text.startsWith('Pet names we like:\n') && shown.text.split('\n').length === 1 + 17, `the list shown: ${shown.text}`);
assert.ok(shown.focused && shown.from === 0 && shown.to === shown.text.length, `the list isn’t selected: ${JSON.stringify(shown)}`);
assert.equal(await page.textContent('#toast'), 'Couldn’t copy here, so the list is selected: copy it from there.');
await clipboard('allow');
await page.click('#copyBtn');
await page.waitForFunction(() => document.querySelector('#toast').textContent === 'Copied. Paste it anywhere.');
assert.equal(await page.evaluate(() => window.copied), shown.text);
assert.equal(await page.locator('#copyText').getAttribute('hidden'), '', 'the list stayed on show after it was copied');

// Fits a phone: nothing scrolls sideways, on any page.
for (const tab of ['find', 'check', 'list']) {
  await page.click(`.tabs a[data-tab="${tab}"]`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `the ${tab} page scrolls sideways on a phone`);
}

// The small buttons are big enough for a thumb, the Try row stays on two lines, and two tags still hang side by side.
const boxes = sel => page.locator(sel).evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), height: r.height }; }));
await page.click('.tabs a[data-tab="check"]');
await page.waitForSelector('#page-check:not([hidden])');
const tries = await boxes('.try button');
assert.ok(Math.min(...tries.map(b => b.height)) >= 36 && new Set(tries.map(b => b.top)).size <= 2, `the Try buttons: ${JSON.stringify(tries)}`);
assert.ok(Math.min(...(await boxes('[data-group="checkSpecies"] .chip')).map(b => b.height)) >= 38, 'the animal buttons on Check are too small to tap');
await page.click('.tabs a[data-tab="list"]');
await page.waitForSelector('#page-list:not([hidden]) #saved .mini');
assert.ok(Math.min(...(await boxes('#saved .mini')).map(b => b.height)) >= 40, 'the Remove and Check buttons are too small to tap');
const [one, two] = await boxes('#saved .hang');
assert.equal(one.top, two.top, 'two tags no longer fit side by side');

// Leaves other tools' offline copies alone, and works offline once it has been opened.
await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 10000 });
assert.ok(await page.evaluate(() => caches.has('another-tool-v1')), 'the service worker deleted another tool’s offline copy');
assert.ok(await page.evaluate(() => caches.has('name-tag-x-v1')), 'the service worker deleted the offline copy of a tool whose name starts like Name Tag’s');
assert.equal(await page.evaluate(() => caches.has('name-tag-v0')), false, 'the service worker kept Name Tag’s own old copy');
signal(false);
await page.reload();
await page.waitForSelector('#page-list:not([hidden]) #saved .hang', { timeout: 10000 });
assert.equal(await page.title(), 'Name Tag', 'the page did not load offline');
await page.click('.tabs a[data-tab="find"]');
assert.equal(await page.locator('#dealt .hang').count(), 6, 'no names offline');
signal(true);

assert.deepEqual(problems, [], 'problems while using it');

// Without JavaScript, the message sits in the page with the usual gutter, above the footer.
const noScript = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
const plainPage = await noScript.newPage();
await plainPage.goto(base);
const message = await plainPage.locator('.noscript').boundingBox();
const footer = await plainPage.locator('.jd-foot').boundingBox();
assert.ok(message.x >= 16 && message.x + message.width <= 390 - 16 && message.y < footer.y, `the no-JavaScript message is at ${JSON.stringify(message)}`);
await noScript.close();

await browser.close();
server.close();
console.log('all good');
