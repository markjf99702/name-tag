// Deals names that fit what you picked. Pure functions, no DOM.
import { NAMES, THEME_BY_ID, POPULAR_RANK } from './names.js';
import { soundOf, commandClash } from './check.js';
import { plain, callWords } from './sound.js';

export const DEFAULT_CRITERIA = {
  species: 'dog', sex: 'any', themes: [], normal: 'mix', coats: [], size: null, traits: [], letter: '', easy: true,
};

// How strongly each setting of "How normal?" favours names of each weirdness, 0 (Luna) to 3 (Allen Key).
const NORMAL = { normal: [1, 0.12, 0.02, 0.004], mix: [1.4, 1, 0.9, 0.75], weird: [0.01, 0.08, 0.5, 1] };
// Coat and personality picks are close to filters: names that miss them only fill in when too few fit.
const MISS = 0.0005;

export function weirdness(e, species) {
  const k = plain(e.name);
  if (e.themes.includes('classic') || POPULAR_RANK[species]?.has(k) || POPULAR_RANK.dog.has(k) || POPULAR_RANK.cat.has(k)) return 0;
  return Math.min(...e.themes.map(t => THEME_BY_ID.get(t).weird));
}

export function isEasy(name, species) {
  const s = soundOf(name);
  return s.syllables <= 3 && name.length <= 14 && !commandClash(s, species);
}

function themeFits(e, themes, size) {
  return themes.some(t => {
    if (!e.themes.includes(t)) return false;
    if (t === 'wrongsize' && size) return e.size && e.size !== size;
    return true;
  });
}

// Every name that fits, with a weight for how well.
export function candidates(criteria) {
  const c = { ...DEFAULT_CRITERIA, ...criteria };
  const letter = plain(c.letter || '').replace(/[^a-z]/g, '');
  const wrongSize = c.themes.includes('wrongsize');
  const out = [];
  for (const e of NAMES) {
    if (e.only.length && !e.only.includes(c.species)) continue;
    if (c.sex !== 'any' && e.sex && e.sex !== c.sex) continue;
    if (c.themes.length && !themeFits(e, c.themes, c.size)) continue;
    if (letter && !(callWords(e.name)[0] || '').startsWith(letter)) continue;
    if (c.easy && !isEasy(e.name, c.species)) continue;
    let w = NORMAL[c.normal][weirdness(e, c.species)];
    if (e.species.includes(c.species) || e.only.includes(c.species)) w *= 2.5;
    if (c.sex !== 'any' && e.sex === c.sex) w *= 1.3;
    const coats = e.coats.filter(x => c.coats.includes(x));
    const traits = e.traits.filter(x => c.traits.includes(x));
    let fits = true;
    if (c.coats.length && !coats.length) { w *= MISS; fits = false; }
    if (c.traits.length && !traits.length) { w *= MISS; fits = false; }
    let sizeFit = false;
    if (c.size && !wrongSize) {
      if (e.size === c.size) { w *= 6; sizeFit = true; }
      else if (e.size) w *= 0.05;
    }
    if (c.size && wrongSize && e.size && e.size !== c.size) sizeFit = true;
    out.push({ entry: e, weight: w, coats, traits, sizeFit, fits });
  }
  return out;
}

function reasons(cand, c) {
  const e = cand.entry;
  const bits = [];
  const theme = c.themes.find(t => e.themes.includes(t)) || e.themes.find(t => t !== 'classic') || e.themes[0];
  if (theme) bits.push(THEME_BY_ID.get(theme).label);
  bits.push(...cand.coats, ...cand.traits);
  if (cand.sizeFit) bits.push(e.size === 'tiny' ? 'tiny name' : 'big name');
  const n = soundOf(e.name).syllables;
  bits.push(`${n} syllable${n === 1 ? '' : 's'}`);
  return bits.slice(0, 3);
}

// Six (or count) names, drawn by weight without repeats. Names in `avoid` are drawn last.
export function deal(criteria, { count = 6, random = Math.random, avoid = [] } = {}) {
  const c = { ...DEFAULT_CRITERIA, ...criteria };
  const avoidSet = new Set(avoid.map(plain));
  const pool = candidates(c).map(x => ({ ...x, weight: avoidSet.has(plain(x.entry.name)) ? x.weight * 0.02 : x.weight }));
  const picks = [];
  while (picks.length < count && pool.length) {
    const total = pool.reduce((s, x) => s + x.weight, 0);
    let r = random() * total;
    let i = 0;
    while (i < pool.length - 1 && (r -= pool[i].weight) > 0) i++;
    const [x] = pool.splice(i, 1);
    picks.push({ name: x.entry.name, entry: x.entry, reasons: reasons(x, c), fits: x.fits });
  }
  const fit = picks.filter(p => p.fits).length + pool.filter(x => x.fits).length;
  return { picks, total: picks.length + pool.length, fit };
}
