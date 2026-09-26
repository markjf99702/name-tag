// How a name sounds, roughly: syllables, rhymes, first sounds and other likely spellings.
// English spelling is a mess, so these are rules of thumb, tuned on the names in names.js.

const TITLES = new Set(['sir', 'lady', 'lord', 'dame', 'mr', 'mrs', 'miss', 'ms', 'mx', 'dr', 'doctor', 'captain', 'professor',
  'king', 'queen', 'prince', 'princess', 'baron', 'count', 'countess', 'duke', 'duchess', 'admiral', 'general', 'major',
  'chairman', 'little', 'big', 'old', 'the', 'mister', 'auntie', 'uncle', 'saint', 'st', 'officer', 'agent', 'judge', 'reverend']);
const SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'esq', 'the', 'first', 'second', 'third']);

export const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Letters only, word by word: "Sir Pounce-a-lot" -> ['sir', 'pounce', 'a', 'lot'].
export const words = name => plain(name).split(/[\s\-_.]+/).map(w => w.replace(/[^a-z]/g, '')).filter(Boolean);

// The part you'd actually shout: "Sir Reginald Barksworth III" -> ['reginald', 'barksworth'].
export function callWords(name) {
  let w = words(name);
  while (w.length > 1 && TITLES.has(w[0])) w = w.slice(1);
  while (w.length > 1 && SUFFIXES.has(w[w.length - 1])) w = w.slice(0, -1);
  return w;
}

// Names the rules below get wrong.
const SYLLABLES = {
  zoe: 2, chloe: 2, joey: 2, penelope: 4, persephone: 4, calliope: 4, phoebe: 2, aphrodite: 4, daphne: 2, kobe: 2, nike: 2,
  sake: 2, latte: 2, hermes: 2, hades: 2, achilles: 3, hercules: 3, socrates: 3, ares: 2, ulysses: 3, io: 2, jose: 2, rene: 2,
  hermione: 4, ukulele: 4, guacamole: 4, tamale: 3, quinoa: 2, beignet: 2, meringue: 2, gruyere: 2, provolone: 4,
  mascarpone: 4, chianti: 3, beyonce: 3, karaoke: 4, horatio: 4, wednesday: 2, eeyore: 2, abalone: 4, anemone: 4,
  andromeda: 4, cheerio: 3, pinot: 2, lucille: 2, isabelle: 3, estelle: 2, nicole: 2, stephanie: 3, melanie: 3,
  ophelia: 4, cordelia: 4, amelia: 4, olivia: 4, sophia: 3, sofia: 3, julia: 3, gloria: 3, aurelius: 4, marguerite: 3,
  genevieve: 3, evangeline: 4, clementine: 3, madeline: 3, caroline: 3, josephine: 3, geraldine: 3, pavlova: 3,
  sriracha: 3, poirot: 2, jalapeno: 4, pierogi: 3, mowgli: 2, calypso: 3, recipe: 3, simile: 3, apostrophe: 4,
  business: 2, every: 2, chocolate: 2, camembert: 3, limburger: 3, tortilla: 3, quesadilla: 4, reese: 1, george: 1,
  louise: 2, eunice: 2, maurice: 2, clarice: 2, beatrice: 3, janice: 2, candice: 2, bernice: 2, alice: 2, grace: 1,
  eugene: 2, irene: 2, nadine: 2, maxine: 2, pauline: 2, jolene: 2, arlene: 2, darlene: 2, ebenezer: 4, lucifer: 3,
  sequoia: 3, yosemite: 4, europa: 3, galileo: 4, ganymede: 3, nebula: 3, gnocchi: 2, espresso: 3, gouda: 2, brie: 1,
};

// Syllables in one word of letters.
function wordSyllables(w) {
  if (SYLLABLES[w]) return SYLLABLES[w];
  if (w.length <= 2) return 1;
  let s = w;
  s = s.replace(/lle$/, 'll');                                   // Belle, Estelle
  s = s.replace(/([^aeiouy])es$/, (m, c, i) => {                 // James (1) but Pickles (2)
    if ('szxcgh'.includes(c)) return m;
    if (c === 'l' && i > 0 && !'aeiouyrl'.includes(s[i - 1])) return m;
    return c;
  });
  s = s.replace(/([^aeiouy])e$/, (m, c, i) => {                  // Duke (1) but Pickle (2)
    if (c === 'l' && i > 0 && !'aeiouyrl'.includes(s[i - 1])) return m;
    return c;
  });
  s = s.replace(/^y(?=[aeiou])/, '');                            // Yoda, Yuri
  s = s.replace(/([aeiou])y(?=[aeiou])/g, '$1-');                 // Maya, Freya: the y is a consonant
  const groups = s.match(/[aeiouy]+/g) || [];
  let n = 0;
  for (const g of groups) {
    n += 1;
    // Vowel pairs that are usually said as two beats: Leo, Mia, Rio, Joshua, Sirius, Goa.
    n += (g.match(/eo|ia|io|iu|ua(?!$)|uo|ii/g) || []).length;
    if (/ua$/.test(g) && !/[qg]ua$/.test(s)) n += 1;
  }
  if (/[^aeiou]oa$/.test(s)) n += 1;
  return Math.max(1, n);
}

export function syllables(name) {
  const w = callWords(name);
  return w.reduce((sum, x) => sum + wordSyllables(x), 0) || 1;
}

// A rough phonetic spelling, one symbol per sound.
// Vowels: A E I O U short; 1 day, 2 see, 3 my, 4 go, 5 moon, 6 cow, 7 boy, 8 saw, 9 her, @ the "a" in Luna.
// Consonants are letters, with C ch, S sh, T th, N ng, J j.
export const VOWELS = 'AEIOU123456789@';

export function phonetic(word) {
  let w = word.replace(/[^a-z]/g, '');
  if (!w) return '';
  const oneBeat = wordSyllables(w) === 1;
  w = w.replace(/^kn/, 'n').replace(/^gn/, 'n').replace(/^pn/, 'n').replace(/^ps/, 's').replace(/^wr/, 'r')
    .replace(/^wh/, 'w').replace(/^mn/, 'n').replace(/^pt/, 't').replace(/^x/, 'z');
  w = w.replace(/lle$/, 'l');
  // Long vowels made by a silent final e: Kate, Steve, Mike, Rose, Duke.
  w = w.replace(/(^|[^aeiou])([aeiou])([^aeiouy])e(s?)$/, (m, b, v, c, s) => `${b}${{ a: '1', e: '2', i: '3', o: '4', u: '5' }[v]}${c}${s}`);
  w = w.replace(/([^aeiouyszxcgh])es$/, (m, c, i) => (c === 'l' && i > 0 && !'aeiouyrl'.includes(w[i - 1])) ? m : `${c}s`);
  w = w.replace(/([^aeiouyr])le(s?)$/, '$1@l$2');
  w = w.replace(/([^aeiouy])e$/, '$1');
  const rules = [
    [/eigh/g, '1'], [/igh/g, '3'], [/augh/g, '8'], [/ough/g, '4'],
    [/tch/g, 'C'], [/dge/g, 'J'], [/dg/g, 'J'], [/ch/g, 'C'], [/sh/g, 'S'], [/ph/g, 'f'], [/th/g, 'T'],
    [/ck/g, 'k'], [/qu/g, 'kw'], [/x/g, 'ks'], [/ng$/g, 'N'], [/ng(?=[^aeiouy])/g, 'N'],
    [/c(?=[eiy])/g, 's'], [/c/g, 'k'], [/g(?=[ey])/g, 'J'], [/g(?=in)/g, 'J'], [/j/g, 'J'],
    [/ee/g, '2'], [/ea/g, '2'], [/ie$/g, '2'], [/ei/g, '2'], [/ai/g, '1'], [/ay/g, '1'], [/ae/g, '1'],
    [/oa/g, '4'], [/oe$/g, '4'], [/ow$/g, '4'], [/ow/g, '6'], [/ou/g, '6'], [/oo/g, '5'], [/ew/g, '5'],
    [/ue$/g, '5'], [/ui/g, '5'], [/au/g, '8'], [/aw/g, '8'], [/oi/g, '7'], [/oy/g, '7'],
    [/(er|ir|ur)(?=[^aeiouy]|$)/g, '9'],
  ];
  for (const [re, to] of rules) w = w.replace(re, to);
  w = w.replace(/ey$/, oneBeat ? '1' : '2');
  w = w.replace(/y$/, oneBeat ? '3' : '2');
  w = w.replace(/a$/, '@').replace(/i$/, '2').replace(/o$/, '4').replace(/u$/, '5').replace(/e$/, '2');
  w = w.replace(/a/g, 'A').replace(/e/g, 'E').replace(/i/g, 'I').replace(/o/g, 'O').replace(/u/g, 'U');
  w = w.replace(/(?<=[^AEIOU123456789@])y/g, 'I');
  w = w.replace(/([a-zCSTNJ])\1+/g, '$1');
  return w;
}

// Sounds that differ only by voicing still nearly rhyme: Sid and sit, Bob and drop.
export const unvoice = p => p.replace(/d/g, 't').replace(/b/g, 'p').replace(/g/g, 'k').replace(/v/g, 'f').replace(/z/g, 's').replace(/J/g, 'C');

const isVowel = ch => VOWELS.includes(ch);

// The rhyming end of a word: from its last vowel to the end. Open endings (Molly, Luna, Milo)
// and weak ones (Pickles, Cooper) pull in the vowel before: Molly -> "Ol2", Pickles -> "Ik@ls".
export function rhyme(p) {
  const idx = [...p].map((ch, i) => isVowel(ch) ? i : -1).filter(i => i >= 0);
  if (!idx.length) return p;
  const last = idx[idx.length - 1];
  const weak = last === p.length - 1 || '@9'.includes(p[last]);
  return p.slice(idx.length > 1 && weak ? idx[idx.length - 2] : last);
}

// The first sound through the first vowel: Bella -> "bE".
export function onset(p) {
  const i = [...p].findIndex(isVowel);
  return i < 0 ? p : p.slice(0, i + 1);
}

export function sound(name) {
  const w = callWords(name);
  const ps = w.map(phonetic);
  const all = ps.join('');
  const last = ps[ps.length - 1] || '';
  return {
    words: w,
    phon: all,
    syllables: syllables(name),
    rhyme: rhyme(last),
    onset: onset(ps[0] || ''),
    first: w[0]?.[0] || '',
    lastSound: all[all.length - 1] || '',
    firstSound: all[0] || '',
  };
}

export function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

// Other ways people will spell it: Rosie -> Rosy, Rosey.
export function otherSpellings(name) {
  const w = words(name);
  if (w.length !== 1) return [];
  const s = w[0];
  const out = new Set();
  const ee = s.match(/(ie|ey|y)$/);
  if (ee && s.length > 3 && wordSyllables(s) > 1) {
    const stem = s.slice(0, -ee[1].length);
    const swap = { y: ['ie'], ie: ['y'], ey: ['ie', 'y'] }[ee[1]];
    for (const e of swap) out.add(stem + e);
  }
  if (s.includes('ph')) out.add(s.replace('ph', 'f'));
  if (/^c[aou]/.test(s) && s.length <= 5) out.add('k' + s.slice(1));
  if (/^ka[^aeiouy]e$/.test(s)) out.add('c' + s.slice(1));
  if (/[^aeiou]y[^aeiou]/.test(s.slice(1))) out.add(s[0] + s.slice(1).replace(/([^aeiou])y([^aeiou])/, '$1i$2'));
  if (/ae$/.test(s)) { out.add(s.replace(/ae$/, 'ay')); out.add(s.replace(/ae$/, 'ai')); }
  if (/ay$/.test(s) && s.length <= 4) out.add(s.replace(/ay$/, 'ae'));
  if (/eigh$/.test(s)) out.add(s.replace(/eigh$/, 'ee'));
  out.delete(s);
  const cap = x => x[0].toUpperCase() + x.slice(1);
  return [...out].slice(0, 3).map(cap);
}
