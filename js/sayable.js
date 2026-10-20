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

// Four consonants in a row are often where two words meet: Barks|worth, Match|stick, Kings|bridge. That's easy to say
// when the run splits into an ending and a start that plenty of names in the list have: at least three end with the
// consonants before the split, and at least three start with the ones after it. An s joining the two (Kings|bridge,
// Wolfs|bane) is looked past, to the ending before it. Whole clusters, not just two letters, so In|twdaan doesn't pass.
const COMMON = 3;
const STARTS = new Map();
const ENDS = new Map();
for (const w of KNOWN) {
  const [first] = w.match(/^[^aeiouy]*/);
  const [last] = w.match(/[^aeiouy]*$/);
  STARTS.set(first, (STARTS.get(first) || 0) + 1);
  ENDS.set(last, (ENDS.get(last) || 0) + 1);
}
const common = (counts, letters) => (counts.get(letters) || 0) >= COMMON;
const endsLikeAWord = a => {
  const [end] = a.match(/[^aeiouy]*$/);
  return common(ENDS, end) || (end.length > 1 && end.endsWith('s') && common(ENDS, end.slice(0, -1)));
};
const startsLikeAWord = b => common(STARTS, b.match(/^[^aeiouy]*/)[0]);
const twoWords = w => {
  for (let i = 2; i < w.length - 1; i++) {
    const [a, b] = [w.slice(0, i), w.slice(i)];
    if (/[aeiouy]/.test(w[i - 1] + w[i]) || !/[aeiouy]/.test(a) || !/[aeiouy]/.test(b)) continue;
    if (consonantRun(a) < 4 && consonantRun(b) < 4 && endsLikeAWord(a) && startsLikeAWord(b)) return true;
  }
  return false;
};

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
  if ((run >= 4 && !twoWords(w)) || score < -5.2) return { level: 'warn', why: 'hard' };
  if (score < -4) return { level: 'ok', why: 'unusual' };
  return { level: 'good', why: 'plain' };
}

// Letters that go with a number are read out one at a time (K9, K-9, R2-D2, C-3PO, BB-8), so in a name with a number in
// it, only a run of letters long enough to be a word of its own (the Rex in Rex2, the Agent in Agent 99) gets tested.
const partsToSay = name => (/\d/.test(name) ? splitWords(name).filter(w => w.length > 2) : splitWords(name));

// The hardest word decides. Null when there's nothing to test but numbers and the letters read out with them.
export function sayability(name) {
  const words = partsToSay(name);
  if (!words.length) return /\d/.test(name) ? null : { level: 'bad', why: 'mash' };
  return words.map(oneWord).reduce((a, b) => (LEVEL[b.level] > LEVEL[a.level] ? b : a));
}
