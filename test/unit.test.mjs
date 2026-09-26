// The checker, the sound rules and the dealer:  node --test test/unit.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NAMES, THEMES, POPULAR } from '../js/names.js';
import { syllables, sound } from '../js/sound.js';
import { check, alternatives, nicknames, displayName } from '../js/check.js';
import { deal, candidates } from '../js/generate.js';

const seeded = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const verdict = (name, ctx = {}) => check(name, ctx).verdict.id;
const status = (name, id, ctx = {}) => check(name, ctx).checks.find(c => c.id === id)?.status;

test('every theme has plenty of names, and the list is big', () => {
  for (const t of THEMES) assert.ok(NAMES.filter(e => e.themes.includes(t.id)).length >= 30, t.id);
  assert.ok(NAMES.length > 1500);
});

test('every popular name is in the list', () => {
  const known = new Set(NAMES.map(e => e.name.toLowerCase()));
  for (const [sp, list] of Object.entries(POPULAR)) {
    for (const n of list.split(/\s+/).filter(Boolean)) assert.ok(known.has(n.toLowerCase()), `${sp}: ${n}`);
  }
});

test('syllables', () => {
  const want = { Max: 1, Luna: 2, Pickles: 2, Charles: 1, James: 1, Leo: 2, Maya: 2, Duke: 1, Zoe: 2, Penelope: 4, Juniper: 3, 'Tater Tot': 3, 'Sir Hiss': 1, Bartholomew: 4, Belle: 1, Maple: 2 };
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
});

test('the waiting-room test', () => {
  assert.equal(verdict('Hoof Hearted', { species: 'horse' }), 'dont');
  assert.equal(verdict('Ben', { surname: 'Dover' }), 'dont');
  assert.equal(verdict('Ben', { surname: 'Farrell' }), 'great');
  assert.equal(verdict('Fire'), 'dont');
  assert.match(check('Butterscotch').checks.find(c => c.id === 'vet').text, /Butt/);
  assert.match(check('Dickens').checks.find(c => c.id === 'vet').text, /Dick/);
  assert.equal(status('Titanium', 'vet'), 'good');
  assert.equal(status('Mom', 'vet'), 'warn');
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
