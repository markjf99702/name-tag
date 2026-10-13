// Remembers your picks, your house and your shortlist in this browser. Nothing leaves it.
import { DEFAULT_CRITERIA } from './generate.js';
import { SPECIES, COATS, TRAITS, THEMES } from './names.js';

const KEY = 'name-tag:v1';
export const DEFAULTS = { ...DEFAULT_CRITERIA, house: '', surname: '', saved: [], last: '', voice: '' };

export function load() {
  let data = {};
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) data = JSON.parse(raw);
  } catch { /* private window, storage blocked, or a broken copy */ }
  if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
  return { ...DEFAULTS, ...data, ...checked(data) };
}

// A damaged or hand-edited copy keeps whatever still makes sense, and anything of the wrong kind goes back to its
// default, rather than leaving Find or Check blank. Fields this version doesn't know are left alone above, so a newer
// version's settings survive a visit from an older offline copy.
function checked(d) {
  const oneOf = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);
  const someOf = (v, allowed) => (Array.isArray(v) ? v.filter(x => allowed.includes(x)) : []);
  const text = v => (typeof v === 'string' ? v : '');
  return {
    species: oneOf(d.species, SPECIES.map(s => s.id), DEFAULTS.species),
    sex: oneOf(d.sex, ['any', 'm', 'f'], DEFAULTS.sex),
    themes: someOf(d.themes, THEMES.map(t => t.id)),
    normal: oneOf(d.normal, ['normal', 'mix', 'weird'], DEFAULTS.normal),
    coats: someOf(d.coats, COATS),
    size: oneOf(d.size, ['tiny', 'big'], null),
    traits: someOf(d.traits, TRAITS),
    letter: text(d.letter).replace(/[^a-z]/gi, '').slice(0, 2),
    easy: typeof d.easy === 'boolean' ? d.easy : DEFAULTS.easy,
    house: text(d.house),
    surname: text(d.surname),
    last: text(d.last),
    voice: text(d.voice),
    // A saved name of an animal this version doesn't know stays on the shortlist.
    saved: (Array.isArray(d.saved) ? d.saved : [])
      .filter(s => s && typeof s === 'object' && typeof s.name === 'string')
      .map(s => (typeof s.species === 'string' ? s : { ...s, species: DEFAULTS.species })),
  };
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private window or storage blocked */ }
}
