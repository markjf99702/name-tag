// Can a name be said out loud? Catches keyboard mash, missing vowels and strings of consonants with a few plain
// rules, then compares its letter patterns with the ~1,700 names in names.js: real names, even ones it has never
// seen, use the same patterns, and mash doesn't. Unfamiliar real names (Xochitl, Aoife) only get a gentle note.
import { NAMES } from './names.js';
import { plain } from './sound.js';

const splitWords = s => plain(s).split(/[^a-z]+/).filter(Boolean);
const KNOWN = new Set(NAMES.flatMap(e => splitWords(e.name)));

// Letter-triple counts from the name list, for how ordinary a spelling looks.
const c3 = new Map();
const c2 = new Map();
const c1 = new Map();
const h2 = new Map();
const h1 = new Map();
let total = 0;
for (const w of KNOWN) {
  if (w.length < 2) continue;
  const s = `^^${w}$`;
  for (let i = 2; i < s.length; i++) {
    const tri = s.slice(i - 2, i + 1);
    const bi = s.slice(i - 1, i + 1);
    c3.set(tri, (c3.get(tri) || 0) + 1);
    h2.set(tri.slice(0, 2), (h2.get(tri.slice(0, 2)) || 0) + 1);
    c2.set(bi, (c2.get(bi) || 0) + 1);
    h1.set(bi[0], (h1.get(bi[0]) || 0) + 1);
    c1.set(s[i], (c1.get(s[i]) || 0) + 1);
    total++;
  }
}

// Average log-probability per letter: real names mostly sit above -4.3, keyboard mash below -6.
export function ordinariness(word) {
  const s = `^^${word}$`;
  let lp = 0;
  for (let i = 2; i < s.length; i++) {
    const tri = s.slice(i - 2, i + 1);
    const bi = s.slice(i - 1, i + 1);
    const p3 = (c3.get(tri) || 0) / (h2.get(tri.slice(0, 2)) || 1);
    const p2 = (c2.get(bi) || 0) / (h1.get(bi[0]) || 1);
    const p1 = (c1.get(s[i]) || 0) / total;
    lp += Math.log2(0.6 * p3 + 0.3 * p2 + 0.09 * p1 + 0.01 / 27);
  }
  return lp / (s.length - 2);
}

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].flatMap(r => [r, [...r].reverse().join('')]);
const keyboardRun = w => {
  for (let i = 0; i + 4 <= w.length; i++) if (ROWS.some(r => r.includes(w.slice(i, i + 4)))) return true;
  return false;
};
// Longest run of consonant sounds, counting ch, sh, th and the like as one.
const consonantRun = w => Math.max(0, ...(w.replace(/ch|sh|th|ph|gh|ck|ng|wh|qu/g, 'C').match(/[^aeiouy]+/g) || ['']).map(r => r.length));

const LEVEL = { good: 0, ok: 1, warn: 2, bad: 3 };

function oneWord(w) {
  if (KNOWN.has(w)) return { level: 'good', why: 'known' };
  if (w.length <= 2) return { level: /[aeiouy]/.test(w) ? 'good' : 'bad', why: /[aeiouy]/.test(w) ? 'plain' : 'vowel' };
  if (!/[aeiouy]/.test(w)) return { level: 'bad', why: 'vowel' };
  if (/(.)\1\1/.test(w) || /(..+)\1\1/.test(w)) return { level: 'bad', why: 'repeat' };
  if (keyboardRun(w)) return { level: 'bad', why: 'keyboard' };
  const run = consonantRun(w);
  const score = ordinariness(w);
  if (run >= 5 || score < -6) return { level: 'bad', why: 'mash' };
  if (run >= 4 || score < -5.2) return { level: 'warn', why: 'hard' };
  if (score < -4) return { level: 'ok', why: 'unusual' };
  return { level: 'good', why: 'plain' };
}

// The hardest word decides.
export function sayability(name) {
  const words = splitWords(name);
  if (!words.length) return { level: 'bad', why: 'mash' };
  return words.map(oneWord).reduce((a, b) => (LEVEL[b.level] > LEVEL[a.level] ? b : a));
}
