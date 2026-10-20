// The checker, the sound rules and the dealer:  node --test test/unit.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NAMES, THEMES, POPULAR } from '../js/names.js';
import { syllables, sound, plain } from '../js/sound.js';
import { check, alternatives, nicknames, displayName } from '../js/check.js';
import { deal, candidates } from '../js/generate.js';

const seeded = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const verdict = (name, ctx = {}) => check(name, ctx).verdict.id;
const status = (name, id, ctx = {}) => check(name, ctx).checks.find(c => c.id === id)?.status;

test('every theme has plenty of names, and the list is big', () => {
  for (const t of THEMES) assert.ok(NAMES.filter(e => e.themes.includes(t.id)).length >= 30, t.id);
  assert.ok(NAMES.length > 1500);
});

test('no name is in the list twice under another spelling, for the same animal', () => {
  const groups = new Map();
  for (const e of NAMES) {
    const k = e.name.toLowerCase().replace(/[^a-z]/g, '');
    groups.set(k, [...(groups.get(k) || []), e]);
  }
  for (const g of groups.values()) {
    const animals = g.flatMap(e => (e.only.length ? e.only : ['every']));
    assert.equal(new Set(animals).size, animals.length, g.map(e => e.name).join(' and '));
  }
});

test('every popular name is in the list', () => {
  const known = new Set(NAMES.map(e => e.name.toLowerCase()));
  for (const [sp, list] of Object.entries(POPULAR)) {
    for (const n of list.split(/\s+/).filter(Boolean)) assert.ok(known.has(n.toLowerCase()), `${sp}: ${n}`);
  }
});

test('syllables', () => {
  const want = { Max: 1, Luna: 2, Pickles: 2, Charles: 1, James: 1, Leo: 2, Maya: 2, Duke: 1, Zoe: 2, Penelope: 4, Juniper: 3, 'Tater Tot': 3, 'Sir Hiss': 1, Bartholomew: 4, Belle: 1, Maple: 2,
    Georgia: 2, Sienna: 3, Agnes: 2, Louie: 2, Leonard: 2, Cocoa: 2, Rosemary: 3, Quark: 1, Squash: 1, Guava: 2, Turquoise: 2, Joshua: 3, Fergus: 2, 'Nibbles McGee': 4 };
  for (const [n, s] of Object.entries(want)) assert.equal(syllables(n), s, n);
});

test('rhymes and first sounds', () => {
  assert.equal(sound('Molly').rhyme, sound('Polly').rhyme);
  assert.equal(sound('Kit').rhyme, 'It');
  assert.notEqual(sound('Leo').rhyme, sound('Milo').rhyme);
  assert.equal(sound('Bella').onset, sound('Benny').onset);
});

test('names that sound like commands', () => {
  assert.equal(status('Bo', 'command'), 'warn');
  assert.equal(status('Kit', 'command'), 'warn');
  assert.equal(status('Kay', 'command'), 'warn');
  assert.equal(status('Max', 'command'), 'good');
  assert.equal(status('Geoff', 'command'), 'good');
  assert.equal(verdict('Sit'), 'dont');
  assert.equal(status('Jack', 'command', { species: 'horse' }), 'warn');
  assert.equal(check('Bo', { species: 'cat' }).checks.find(c => c.id === 'command'), undefined);
});

test('clashes at home', () => {
  assert.equal(status('Molly', 'house', { house: ['Polly'] }), 'warn');
  assert.equal(status('Kit', 'house', { house: ['Kat'] }), 'warn');
  assert.equal(status('Luna', 'house', { house: ['luna'] }), 'bad');
  assert.equal(status('Gerald', 'house', { house: ['Mark', 'Luna'] }), 'good');
  assert.equal(status('Gerald', 'house'), 'info');
  assert.equal(verdict('Kit', { house: ['Kat'] }), 'again');
  const text = (name, house) => check(name, { house }).checks.find(c => c.id === 'house').text;
  assert.equal(text('Max', ['Luna', '2', '-']), 'Sounds nothing like Luna.');
  assert.equal(text('Max', ['K9']), 'Sounds nothing like K9.');
});

test('the waiting-room test', () => {
  assert.equal(verdict('Hoof Hearted', { species: 'horse' }), 'dont');
  assert.equal(verdict('Ben', { surname: 'Dover' }), 'dont');
  assert.ok(['great', 'good'].includes(verdict('Ben', { surname: 'Farrell' })));
  assert.equal(verdict('Fire'), 'dont');
  assert.match(check('Butterscotch').checks.find(c => c.id === 'vet').text, /Butt/);
  assert.match(check('Dickens').checks.find(c => c.id === 'vet').text, /Dick/);
  assert.equal(status('Titanium', 'vet'), 'good');
  assert.equal(status('Mom', 'vet'), 'warn');
});

test('a swear word only counts when it is inside one word, or spelled out in bits', () => {
  for (const [n, species] of [['Sushi Tuna', 'fish'], ['Rabbit Chaser'], ['Push It'], ['Agent Watson'], ['Sergeant Watkins'], ['Mrs Hitchcock', 'cat'], ['Obi-Wan Kenobi']]) {
    assert.doesNotMatch(check(n, { species }).checks.find(c => c.id === 'vet').text, /swear word/, n);
    assert.notEqual(verdict(n, { species }), 'dont', n);
  }
  // Spelled out in bits: one or two letters at a time, or words that run together into exactly a rude word.
  for (const n of ['Sh It', 'S-H-I-T', 'Scunthorpe', 'Wan Ker', 'Fuc K']) {
    assert.match(check(n).checks.find(c => c.id === 'vet').text, /swear word hiding/, n);
    assert.equal(verdict(n), 'dont', n);
  }
  assert.equal(verdict('Mike Hunt'), 'dont');
});

test('good names do well', () => {
  for (const n of ['Pickles', 'Gerald', 'Biscuit', 'Juniper', 'Waffles']) assert.ok(['great', 'good'].includes(verdict(n)), n);
  assert.equal(verdict('Bartholomew Montgomery the Third', { species: 'cat' }), 'again');
});

test('nothing in the list is a name we would tell you not to use', () => {
  for (const sp of ['dog', 'cat']) {
    for (const e of NAMES) {
      if (e.only.length && !e.only.includes(sp)) continue;
      assert.notEqual(check(e.name, { species: sp }).verdict.id, 'dont', `${e.name} for a ${sp}`);
    }
  }
});

test('odds and ends', () => {
  assert.equal(displayName('  pickles  mcgee '), 'Pickles Mcgee');
  assert.equal(displayName('McFly'), 'McFly');
  assert.equal(check('', {}), null);
  assert.equal(check('123', {}), null);
  assert.equal(status('Rex2', 'spell'), 'bad');
  assert.deepEqual(nicknames('Reginald').shown.slice(0, 2), ['Reggie', 'Reg']);
  assert.match(check('Pickles', { surname: 'Farrell' }).trouble, /^Pickles \w+ Farrell$/);
  const alts = alternatives('Kit', { species: 'dog' });
  assert.equal(alts.length, 4);
  for (const a of alts) assert.ok(['great', 'good'].includes(verdict(a)), a);
});

test('numbers stay in the name, and the numbers note leads', () => {
  assert.equal(displayName('k9'), 'K9');
  assert.equal(displayName('r2-d2'), 'R2-D2');
  assert.equal(displayName('Agent 99'), 'Agent 99');
  for (const n of ['K9', 'R2-D2', 'Agent 99', 'Rex2']) {
    const r = check(n);
    assert.equal(r.name, n);
    assert.match(r.verdict.line, /^Numbers on a tag look like a phone number/, n);
    assert.notEqual(r.verdict.id, 'dont', n);
  }
  // The letters read out with a number aren't tested on their own, with a hyphen or a space between them or not; a
  // word next to one still is.
  assert.equal(status('K9', 'say'), undefined);
  for (const n of ['K-9', 'K 9', 'C-3PO', 'BB-8']) {
    assert.equal(status(n, 'say'), undefined, n);
    assert.match(check(n).verdict.line, /^Numbers on a tag look like a phone number/, n);
  }
  assert.equal(status('Agent 99', 'say'), 'good');
  assert.equal(verdict('Xqzvbrt9'), 'dont');
  assert.match(check('K9', { surname: 'Farrell' }).trouble, /^K9 \w+ Farrell$/);
});

test('a name in another alphabet skips the sound tests, and says so', () => {
  for (const [n, species] of [['Барсик', 'cat'], ['ポチ', 'dog'], ['小白', 'dog'], ['Λούνα', 'cat']]) {
    const r = check(n, { species, house: ['Luna'] });
    assert.notEqual(r.verdict.id, 'dont', n);
    assert.match(r.verdict.line, /^The sound tests only work for names spelled in the English alphabet/, n);
    const ids = r.checks.map(c => c.id);
    for (const id of ['say', 'yell', 'command', 'house']) assert.ok(!ids.includes(id), `${n} got the ${id} test`);
    assert.doesNotMatch(r.checks.map(c => c.text).join(' '), /the way it sounds/, n);
    assert.deepEqual(r.nicknames, [], n);
  }
  // Accented names are in the English alphabet, and get every test.
  for (const n of ['Zoë', 'José']) {
    const ids = check(n, { species: 'dog', house: ['Luna'] }).checks.map(c => c.id);
    for (const id of ['say', 'yell', 'command', 'house']) assert.ok(ids.includes(id), `${n} missed the ${id} test`);
  }
});

test('nicknames only drop a plural s', () => {
  assert.equal(nicknames('Pickles').shown[0], 'Pickle');
  assert.equal(nicknames('Mittens').shown[0], 'Mitten');
  assert.equal(nicknames('Peaches').shown[0], 'Peach');
  for (const n of ['Venus', 'Atlas', 'Miles', 'Charles', 'Athens']) assert.ok(!nicknames(n).shown.includes(n.slice(0, -1)), n);
});

test('a long name gets cut down to a real short form, never the joke one', () => {
  const yell = n => check(n).checks.find(c => c.id === 'yell').text;
  assert.match(yell('Penelope'), /turn into Penny\./);
  assert.match(yell('Pawl McCartney'), /turn into Pawl\./);
  assert.match(yell('Dolly Parton'), /turn into Dolly\./);
  assert.match(yell('Nibbles McGee'), /turn into Nibbles\./);
  assert.match(yell('Pistachio'), /turn into something shorter\./);
  for (const e of NAMES) assert.doesNotMatch(yell(e.name), /-(bean|bug|pants|face|nugget|muffin)\b/, e.name);
});

test('dealing follows the picks', () => {
  const r = seeded(3);
  for (let i = 0; i < 20; i++) {
    const cat = deal({ species: 'cat', themes: ['puns'] }, { random: r });
    for (const p of cat.picks) assert.ok(p.entry.themes.includes('puns') && (!p.entry.only.length || p.entry.only.includes('cat')), p.name);
    const girl = deal({ sex: 'f', themes: ['office'] }, { random: r });
    for (const p of girl.picks) assert.notEqual(p.entry.sex, 'm', p.name);
    const big = deal({ themes: ['wrongsize'], size: 'big' }, { random: r });
    for (const p of big.picks) assert.equal(p.entry.size, 'tiny', p.name);
    const z = deal({ letter: 'z' }, { random: r });
    for (const p of z.picks) assert.match(p.name, /^Z/, p.name);
  }
  for (const c of candidates({ species: 'dog', easy: true })) {
    assert.notEqual(check(c.entry.name, { species: 'dog' }).checks.find(x => x.id === 'command').status, 'warn', c.entry.name);
  }
  const ginger = deal({ species: 'cat', coats: ['ginger'] }, { random: seeded(1) });
  assert.ok(ginger.picks.filter(p => p.entry.coats.includes('ginger')).length >= 5);
  assert.deepEqual(deal({}, { random: seeded(9) }).picks.map(p => p.name), deal({}, { random: seeded(9) }).picks.map(p => p.name));
});

test('the least robotic voice wins', async () => {
  const { pickVoice, englishVoices } = await import('../js/voice.js');
  const v = (name, lang = 'en-US', extra = {}) => ({ name, lang, ...extra });
  const mac = [v('Albert'), v('Bubbles'), v('Zarvox'), v('Fred'), v('Samantha', 'en-US', { default: true }), v('Daniel', 'en-GB'), v('Ava (Premium)'), v('Amélie', 'fr-CA')];
  assert.equal(pickVoice(mac).name, 'Ava (Premium)');
  assert.ok(!englishVoices(mac).some(x => /Albert|Bubbles|Zarvox|Fred|Amélie/.test(x.name)));
  const chrome = [v('Microsoft David - English (United States)'), v('Google US English'), v('Google Deutsch', 'de-DE')];
  assert.equal(pickVoice(chrome).name, 'Google US English');
  const edge = [v('Microsoft Zira - English (United States)'), v('Microsoft Aria Online (Natural) - English (United States)')];
  assert.match(pickVoice(edge).name, /Aria/);
  assert.equal(pickVoice(mac, 'Daniel').name, 'Daniel');
  assert.equal(pickVoice(mac, 'Gone Now').name, 'Ava (Premium)');
  assert.equal(pickVoice([v('Thomas', 'fr-FR')]), null);
});

test('nonsense gets told off, unusual but sayable names do not', () => {
  for (const g of ['asdfgh', 'qwerty', 'xqzvbrt', 'jkjkjk', 'fjdksla', 'zzzzz', 'bnmvcx', 'hjkl', 'aaaaaa', 'asdkfjasd', 'qpwoeiru', 'lkjhg']) {
    assert.equal(verdict(g), 'dont', g);
    assert.equal(status(g, 'say'), 'bad', g);
  }
  for (const n of ['Blorfnax', 'Zorblax', 'Wumbo', 'Flibbert', 'Brixley', 'Zephyr', 'Rhys', 'Dmitri', 'Ngozi', 'Kinsley', 'Everly']) {
    assert.ok(['good', 'ok'].includes(status(n, 'say')), n);
    assert.notEqual(verdict(n), 'dont', n);
  }
  for (const n of ['Xochitl', 'Aoife']) assert.equal(status(n, 'say'), 'warn', n);
  assert.equal(status('Luna', 'say'), 'good');
});

test('two words run together can be said, even with four consonants where they meet', () => {
  for (const n of ['Barksworth', 'Matchstick', 'Kingsbridge', 'Hartsfield', 'Wolfsbane']) assert.ok(['good', 'ok'].includes(status(n, 'say')), n);
  assert.notEqual(status('Sir Reginald Barksworth', 'say'), 'warn');
  assert.notEqual(verdict('Sir Reginald Barksworth'), 'dont');
  // Four consonants that don't split into an ending and a start names have are still hard to say.
  for (const n of ['Szczepan', 'Intwdaan']) assert.equal(status(n, 'say'), 'warn', n);
});

test('great has to be earned', () => {
  const tally = { great: 0, total: 0 };
  for (const e of NAMES) {
    if (e.only.length && !e.only.includes('dog')) continue;
    tally.total++;
    if (verdict(e.name, { species: 'dog' }) === 'great') tally.great++;
  }
  const share = tally.great / tally.total;
  assert.ok(share > 0.15 && share < 0.35, `great for ${Math.round(share * 100)}% of the list`);
  assert.equal(verdict('Nacho'), 'great');
  assert.equal(verdict('Luna'), 'good');
  assert.equal(verdict('Meatball'), 'good');
});

test('a damaged save keeps what it can, and never leaves a page blank', async () => {
  const stored = new Map();
  globalThis.localStorage = { getItem: k => stored.get(k) ?? null, setItem: (k, v) => stored.set(k, String(v)) };
  const { load, DEFAULTS } = await import('../js/store.js');
  const from = raw => { stored.set('name-tag:v1', raw); return load(); };
  // What the page does with it straight away: deal six names, check the last one, and draw the shortlist.
  const usable = (s, what) => {
    const ctx = { species: s.species, house: s.house.split(/[,;\n]+/).map(x => x.trim()).filter(Boolean), surname: s.surname.trim() };
    assert.equal(deal(s, { random: seeded(4) }).picks.length, 6, what);
    assert.ok(check(s.last || 'Gerald', ctx), what);
    for (const x of s.saved) check(x.name, { ...ctx, species: x.species }) && plain(x.name);
  };
  for (const junk of [{ themes: null }, { coats: null }, { traits: 'all' }, { normal: 'very' }, { sex: 'yes' }, { letter: 5 }, { house: 5 },
    { surname: null }, { last: {} }, { saved: [null] }, { saved: [{ name: 7 }] }, { saved: 'Rex' }]) usable(from(JSON.stringify(junk)), JSON.stringify(junk));
  for (const raw of ['{', 'null', '"Luna"', '[]', null]) assert.deepEqual(from(raw), DEFAULTS, raw);
  // A good copy comes back exactly as it was, with any settings a newer version added.
  const good = { ...DEFAULTS, species: 'cat', themes: ['snacks'], coats: ['ginger'], size: 'tiny', letter: 'b', easy: false, house: 'Luna', voice: 'Daniel',
    saved: [{ name: 'Gerald', species: 'cat', at: 1 }, { name: 'Rex', species: 'dragon', at: 2 }], later: 'kept' };
  assert.deepEqual(from(JSON.stringify(good)), good);
  assert.deepEqual(from(JSON.stringify({ saved: [{ name: 'Gerald', species: 'cat' }, null, { name: 7 }, 'Rex', { name: 'Kit' }] })).saved,
    [{ name: 'Gerald', species: 'cat' }, { name: 'Kit', species: 'dog' }]);
  delete globalThis.localStorage;
});
