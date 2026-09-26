// Checks a name the way a sensible friend would: can you shout it, does it clash with anything,
// will the vet snigger, can anyone spell it. Pure functions, no DOM.
import { NAMES, BY_NAME, POPULAR_RANK, SPECIES } from './names.js';
import { sound, words, callWords, plain, unvoice, editDistance, otherSpellings, VOWELS } from './sound.js';

const PLACE = { dog: 'at the dog park', cat: 'at the vet', small: 'at the vet', bird: 'at the vet', fish: 'at the pet shop',
  reptile: 'at the vet', horse: 'at the stables' };

const cache = new Map();
export function soundOf(name) {
  const k = plain(name);
  if (!cache.has(k)) cache.set(k, sound(name));
  return cache.get(k);
}

// "pickles" -> "Pickles", "mcFLY" stays as typed.
export function displayName(raw) {
  const s = String(raw || '').replace(/[^\p{L}\p{M}\s'\-.]/gu, '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  if (s === s.toLowerCase() || s === s.toUpperCase()) {
    return s.toLowerCase().replace(/(^|[\s\-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  }
  return s;
}

const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const quote = s => `“${s}”`;
const orList = xs => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`;
const andList = xs => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

export function hash(s) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}

const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const NOUN = { dog: 'dog', cat: 'cat', small: 'pet', bird: 'bird', fish: 'fish', reptile: 'reptile', horse: 'horse' };

// Commands, with the rhyming sound in the same code sound.js uses.
const COMMANDS = {
  dog: [['sit', 'It'], ['stay', '1'], ['down', '6n'], ['come', 'Um'], ['no', '4'], ['heel', '2l'], ['off', 'Of'],
    ['drop', 'Op'], ['wait', '1t'], ['leave it', '2v'], ['yes', 'Es'], ['out', '6t'], ['up', 'Up']],
  horse: [['whoa', '4'], ['walk', '8k'], ['trot', 'Ot'], ['back', 'Ak']],
};
const EXACT_COMMANDS = new Set(['sit', 'stay', 'no', 'come', 'down', 'heel', 'drop', 'wait', 'off', 'yes', 'here', 'fetch',
  'leave it', 'shake', 'paw', 'speak', 'stop', 'go', 'bed', 'place', 'look', 'touch', 'free', 'ok', 'okay', 'good boy',
  'good girl', 'whoa', 'walk', 'trot', 'canter', 'back', 'stand', 'settle', 'quiet', 'drop it', 'let go', 'watch']);

export function commandClash(s, species) {
  const list = COMMANDS[species];
  if (!list) return null;
  const full = s.words.join(' ');
  if (EXACT_COMMANDS.has(full)) return { cmd: full, level: 'exact' };
  if (s.syllables !== 1) return null;
  for (const [cmd, r] of list) if (s.rhyme === r) return { cmd, level: 'rhyme' };
  for (const [cmd, r] of list) if (unvoice(s.rhyme) === unvoice(r)) return { cmd, level: 'near' };
  return null;
}

// What people hear when it's shouted or read out. Matched against whole words.
const HEARD = [
  { level: 'bad', words: 'fuck fucker fucking fucky shit shite shitty shithead cunt bitch bastard asshole arsehole dick dickhead cock pussy prick twat wanker slut whore hoe ho tits titty titties penis vagina boner dildo sex sexy porn',
    text: w => `${quote(cap(w))} is a rude word. You'd be shouting it in public and the vet would be reading it out.` },
  { level: 'bad', words: 'fire help bomb gun police thief murder murderer shooter terrorist',
    text: w => `Shouting ${quote(cap(w) + '!')} across a park gets you the wrong kind of attention.` },
  { level: 'bad', words: 'hitler adolf stalin mussolini osama nazi',
    text: () => 'People will assume it says something about you.' },
  { level: 'bad', words: 'cocaine heroin meth crack hooker pimp stripper',
    text: w => `${quote(cap(w))} is going to get looks at the vet.` },
  { level: 'warn', words: 'poop poo poopy pooper turd fart farty butt butts booty boob boobs nipple wiener weiner balls piss pissy crap crappy stinky tinkle pee weewee horny weed stoner drunk bum bumface',
    text: w => `${quote(cap(w))} gets giggles in the waiting room every time.` },
  { level: 'warn', words: 'fanny', text: () => 'In Britain it is a rude word.' },
  { level: 'warn', words: 'jesus christ god goddamn damn dammit hell bloody',
    text: () => 'Shouted across a park, it sounds like swearing. Some days it will be.' },
  { level: 'warn', words: 'uranus', text: () => 'Read out by the vet, it sounds like “your anus”.' },
  { level: 'warn', words: 'killer', text: () => 'It sounds like a warning, not a name.' },
  { level: 'ok', words: 'willy', text: () => 'Free Willy in America, a rude word in Britain.' },
  { level: 'ok', words: 'satan lucifer demon devil beelzebub', text: () => 'Some people will read something into it.' },
  { level: 'warn', words: 'mom mum mommy mummy dad daddy mama papa', text: () => 'Every parent in the park will turn around.' },
  { level: 'ok', words: 'baby', text: () => 'Half the park will turn around.' },
  { level: 'ok', words: 'doctor doc nurse', text: w => `At the vet, calling ${quote(cap(w) + '?')} will confuse everyone.` },
  { level: 'ok', words: 'taxi', text: () => 'Shout it on a street corner and you may get a cab.' },
  { level: 'ok', words: 'shark', text: () => 'Don’t shout it at the beach.' },
  { level: 'ok', words: 'stop run', text: () => 'People nearby will think you mean them.' },
  { level: 'ok', words: 'shiitake shihtzu', text: () => 'Say it quickly and listen.' },
];
const DOG_EXCITED = new Set(['treat', 'treats', 'ball', 'walk', 'walkies', 'dinner', 'squirrel', 'cheese', 'car', 'park']);
const HEARD_BY_WORD = new Map();
for (const h of HEARD) for (const w of h.words.split(' ')) HEARD_BY_WORD.set(w, h);
const SWEAR_INSIDE = /fuck|shit|cunt|twat|wank|bitch|whore/;
const PRANKS = ['hoofhearted', 'bendover', 'hughjass', 'hughjaas', 'seymourbutts', 'mikehunt', 'mikeoxlong', 'ivanatinkle',
  'heywoodjablome', 'phillmccracken', 'amandahugginkiss', 'bennydover', 'jacquesstrap', 'harrybutz', 'barrymcockiner'];

// Long names people shorten, and what they shorten to.
const SHORT = {
  maximilian: ['Max', 'Maxi'], maximus: ['Max'], bartholomew: ['Bart', 'Barty'], alexander: ['Alex', 'Xander'],
  alexandra: ['Alex', 'Lexi'], elizabeth: ['Lizzie', 'Betty'], penelope: ['Penny', 'Pen'], theodore: ['Theo', 'Teddy'],
  theodora: ['Teddie', 'Dora'], winifred: ['Winnie', 'Freddie'], reginald: ['Reggie', 'Reg'], archibald: ['Archie', 'Baldy'],
  montgomery: ['Monty', 'Gomers'], wellington: ['Welly', 'Wells'], cornelius: ['Neil', 'Corny'], percival: ['Percy', 'Val'],
  beatrice: ['Bea', 'Trixie'], genevieve: ['Viv', 'Evie'], clementine: ['Clem', 'Clemmie'], wilhelmina: ['Mina', 'Billie'],
  josephine: ['Josie', 'Jo'], frederick: ['Freddie', 'Fred'], gertrude: ['Gertie', 'Trudy'], mildred: ['Millie'],
  harold: ['Harry', 'Hal'], albert: ['Bertie', 'Al'], herbert: ['Herbie', 'Bert'], humphrey: ['Humph'], octavia: ['Tavi'],
  augustus: ['Gus', 'Augie'], sebastian: ['Seb', 'Bash'], ferdinand: ['Ferdie', 'Nando'], leopold: ['Leo', 'Polly'],
  horatio: ['Raish'], persephone: ['Percy', 'Seph'], arabella: ['Bella', 'Belle'], cordelia: ['Delia', 'Cordy'],
  ophelia: ['Phee', 'Lia'], florence: ['Flo', 'Florrie'], dorothy: ['Dot', 'Dottie'], margaret: ['Maggie', 'Peg'],
  katherine: ['Kate', 'Kit'], bernard: ['Bernie'], gerald: ['Gerry'], mortimer: ['Morty'], barnaby: ['Barney'],
  benedict: ['Ben', 'Benny'], fitzgerald: ['Fitz'], alistair: ['Ali'], seraphina: ['Sera', 'Phina'], evangeline: ['Evie', 'Angie'],
  rosalind: ['Roz', 'Rosie'], georgiana: ['Georgie'], lavinia: ['Vinnie'], esmeralda: ['Esme'], henrietta: ['Hettie', 'Etta'],
  imogen: ['Immy'], philippa: ['Pippa', 'Pip'], rosamund: ['Ros'], anastasia: ['Ana', 'Stacy'], clarissa: ['Clary'],
  marguerite: ['Maggie'], thaddeus: ['Thad'], ignatius: ['Iggy'], cosimo: ['Cos'], lysander: ['Sandy'], peregrine: ['Perry'],
  quentin: ['Quinn'], hercules: ['Herc'], lancelot: ['Lance'], guinevere: ['Gwen'], ebenezer: ['Eb'], christopher: ['Chris', 'Kit'],
  nicholas: ['Nick'], benjamin: ['Ben'], samuel: ['Sam'], william: ['Will', 'Willy'], richard: ['Rich', 'Dick'],
  robert: ['Rob', 'Bobby'], edward: ['Ed', 'Teddy'], thomas: ['Tom'], michael: ['Mike'], frances: ['Fran', 'Fanny'],
  francis: ['Frank'], patricia: ['Trish', 'Patty'], rebecca: ['Becky'], victoria: ['Tori', 'Vicky'], catherine: ['Cathy', 'Kate'],
  isabella: ['Izzy', 'Bella'], olivia: ['Liv'], charlotte: ['Lottie'], eleanor: ['Ellie', 'Nell'], abigail: ['Abby'],
  butterscotch: ['Butters', 'Scotch'], dumbledore: ['Dumbles'], mozzarella: ['Mozz'], cappuccino: ['Chino'],
  espresso: ['Presso'], snickerdoodle: ['Snicks', 'Doodle'], thingamajig: ['Thingy'], cauliflower: ['Cauli'],
  aurelius: ['Rell'], ulysses: ['Lyss'], achilles: ['Kill'], methuselah: ['Mo'], constance: ['Connie'], eunice: ['Eunie'],
  gloria: ['Glo'], harriet: ['Hattie'], marjorie: ['Marge'], bernadette: ['Bernie', 'Detta'], clarence: ['Clancy'],
  leonard: ['Lenny', 'Leo'], eugene: ['Gene'], dolores: ['Lola'], winston: ['Winnie'], sherlock: ['Lock'], atticus: ['Atty'],
};

// The first syllable, as spelled: Gerald -> "ger", Butterscotch -> "butt", Pickles -> "pick".
function stem(word) {
  const m = word.match(/^([^aeiouy]*)([aeiouy]+)([^aeiouy]*)/);
  if (!m) return word;
  let [, on, v, co] = m;
  if (co.length > 1 && word.length > on.length + v.length + co.length) {
    const keep = /^(ck|ch|sh|th|ng|tt|ll|ff|ss|pp|mm|nn|rr|gg|zz|dd|bb)/.test(co) ? 2 : 1;
    co = co.slice(0, keep);
  }
  return on + v + co;
}

function diminutive(st) {
  if (/(ck|ch|sh|y|ie)$/.test(st)) return /ch|sh$/.test(st) ? `${st}ie` : st.replace(/(y|ie)$/, '') + 'y';
  if (/[aeiou][bdfglmnprtvz]$/.test(st) && !/[aeiou]{2}.$/.test(st)) return st + st.slice(-1) + 'y';
  return st + 'y';
}

// What it'll turn into, and any short form that's a problem.
export function nicknames(name) {
  const w = callWords(name);
  const first = w[0] || '';
  const out = [];
  const stems = [];
  const s = soundOf(name);
  if (SHORT[first]) out.push(...SHORT[first]);
  if (w.length === 1 && /[^s]s$/.test(first) && first.length >= 5 && !SHORT[first]) out.push(cap(first.slice(0, -1)));
  if (first.length >= 4 && s.syllables >= 2) {
    const st = stem(first);
    // Only a closed first syllable (Butt-erscotch, Dick-ens) is likely to be said the way it's spelled.
    if (/(ck|tt|ll|ss|ff|pp|mm|nn|rr|gg|zz|dd|bb|th|sh|ch)$/.test(st)) {
      stems.push(st);
      if (s.syllables >= 3 && !SHORT[first]) out.push(cap(st.replace(/(.)\1$/, '$1')), cap(diminutive(st)));
    }
  }
  const suffix = ['bean', 'bug', 'pants', 'face', 'nugget', 'muffin'][hash(first) % 6];
  const base = cap(w.length > 1 ? w[0] : first);
  if (base) out.push(`${base}-${suffix}`);
  const seen = new Set([plain(name)]);
  const rude = k => ['bad', 'warn'].includes(HEARD_BY_WORD.get(k)?.level);
  const shown = out.filter(n => { const k = plain(n); if (seen.has(k) || k.length < 2 || rude(k)) return false; seen.add(k); return true; }).slice(0, 3);
  stems.push(...out.map(plain).filter(rude));
  return { shown, stems };
}

const MIDDLES = ['Bartholomew', 'Montgomery', 'Fitzgerald', 'Archibald', 'Beatrice', 'Penelope', 'Wilhelmina', 'Genevieve',
  'Reginald', 'Ophelia', 'Horatio', 'Clementine', 'Maximilian', 'Gertrude', 'Winifred', 'Ignatius', 'Octavia', 'Cornelius',
  'Theodora', 'Percival', 'Humphrey', 'Philippa', 'Augustus', 'Henrietta'];

// The full name, for when it's in trouble.
export function troubleName(name, surname) {
  const n = displayName(name);
  const sur = displayName(surname || '');
  if (words(n).length >= 3) return [n, sur].filter(Boolean).join(' ');
  let middle = MIDDLES[hash(plain(n)) % MIDDLES.length];
  if (plain(middle) === plain(n)) middle = MIDDLES[(hash(plain(n)) + 1) % MIDDLES.length];
  return [n, middle, sur].filter(Boolean).join(' ');
}

const PRONOUNCE = new Set(['gnocchi', 'quinoa', 'acai', 'pho', 'gyro', 'bruschetta', 'worcestershire', 'niamh', 'siobhan', 'saoirse',
  'caoimhe', 'aoife', 'chipotle', 'gruyere', 'hermione', 'persephone', 'joaquin', 'xavier', 'nguyen', 'bologna', 'chorizo',
  'croissant', 'tzatziki', 'macaron', 'gouda', 'caramel', 'pecan', 'schrodinger', 'nietzsche', 'goethe', 'cognac', 'beignet',
  'phoebe', 'penelope', 'hermes', 'nike', 'io', 'sekhmet', 'mjolnir', 'fenrir', 'odysseus', 'dionysus', 'calliope', 'eos',
  'gif', 'meme', 'paella', 'espresso', 'pierogi', 'halloumi', 'gyoza', 'baklava', 'sriracha', 'kohlrabi', 'endive', 'taleggio',
  'raclette', 'muenster', 'cotija', 'oaxaca', 'rooibos', 'horchata', 'pimms', 'fenugreek', 'coriander', 'thyme', 'zaatar',
  'yosemite', 'tulum', 'kyoto', 'seville', 'nguyen', 'aurelius', 'thaddeus', 'eeyore', 'ganymede', 'callisto', 'quixote',
  'poirot', 'chopin', 'haydn', 'brahms', 'bjork', 'beyonce', 'thelonious', 'coltrane', 'mingus']);

function pronounceNote(key) {
  if (PRONOUNCE.has(key.replace(/[^a-z]/g, ''))) return 'Half the people who read it will say it differently.';
  if (/^(kn|gn|pn|ps|mn|pt|x)/.test(key)) return 'It starts with a letter people won’t know to say or skip.';
  if (/ough|aoi|oei|uai/.test(key)) return 'People won’t be sure how to say it.';
  return '';
}

const RANK = { bad: 4, warn: 3, ok: 2, good: 1, info: 0 };
const worse = (a, b) => (RANK[a] >= RANK[b] ? a : b);

function yellCheck(s, species, name) {
  const n = s.syllables;
  let score = { 1: 2, 2: 2, 3: 1, 4: -0.5 }[n] ?? -1.5;
  const open = VOWELS.includes(s.lastSound);
  const hard = 'bkdgptJC'.includes(s.firstSound);
  if (open) score += 0.75;
  if (hard) score += 0.5;
  let status = score >= 2 ? 'good' : score >= 1 ? 'ok' : 'warn';
  const short = nicknames(name).shown[0];
  let text;
  if (n === 1) text = `One syllable: quick to shout${open ? ' and it rings out' : ', if a little easy to lose in a noisy park'}.`;
  else if (n === 2) text = `Two syllables${open ? ' with an open ending' : ''}: ${open ? 'the easiest shape of name to shout across a park' : 'easy to shout'}.`;
  else if (n === 3) text = 'Three syllables: fine, though it’ll get shortened on busy days.';
  else if (n === 4) text = `Four syllables. Nobody shouts that; it’ll turn into ${short || 'something shorter'}.`;
  else text = `${cap(NUMBERS[n] || String(n))} syllables. You’ll run out of breath before it turns around.`;
  if (hard && n <= 2) text += ' The hard first sound cuts through noise.';
  let title = 'Easy to call';
  if (species === 'fish' || species === 'reptile') {
    title = 'Easy to say';
    if (status === 'warn') status = 'ok';
    text += species === 'fish' ? ' Not that a fish will come when called.' : ' Not that it’ll come when called.';
  } else if (species === 'cat' && status === 'good') {
    text += ' Cats learn their names; they just choose when to answer.';
  }
  return { id: 'yell', title, status, text };
}

function commandCheck(s, species, name) {
  const clash = commandClash(s, species);
  const animal = NOUN[species];
  if (!COMMANDS[species]) return null;
  if (!clash) {
    const list = species === 'horse' ? 'whoa, walk, trot or back' : 'sit, stay, down, come or no';
    return { id: 'command', title: 'Commands', status: 'good', text: `Doesn’t sound like ${list}.` };
  }
  if (clash.level === 'exact') {
    return { id: 'command', title: 'Commands', status: 'bad', exact: true,
      text: `${quote(cap(clash.cmd))} is a command. Your ${animal} will never know if it’s being called or told what to do.` };
  }
  if (clash.level === 'rhyme') {
    return { id: 'command', title: 'Commands', status: 'warn',
      text: `Rhymes with ${quote(clash.cmd)}. To a ${animal}, ${quote(name)} and ${quote(clash.cmd)} are nearly the same word.` };
  }
  return { id: 'command', title: 'Commands', status: 'ok',
    text: `Close to ${quote(clash.cmd)}. Most ${animal}s cope, but say it crisply.` };
}

function houseCheck(s, name, house) {
  const others = house.map(displayName).filter(o => o && plain(o) !== '');
  if (!others.length) {
    return { id: 'house', title: 'Other names at home', status: 'info',
      text: 'Add the other pets and people in your house, and this checks nothing sounds alike.' };
  }
  let status = 'good';
  const notes = [];
  for (const o of others) {
    const t = soundOf(o);
    let st = null;
    let note = '';
    if (plain(o) === plain(name) || t.phon === s.phon) { st = 'bad'; note = `There’s already a ${o} in your house.`; }
    else if (t.rhyme === s.rhyme && t.syllables === s.syllables) { st = 'warn'; note = `${name} and ${o} rhyme. Expect both to come running, or neither.`; }
    else if (t.onset === s.onset && t.syllables === s.syllables) { st = 'warn'; note = `${name} and ${o} start the same way, which is easy to mix up in a hurry.`; }
    else if (editDistance(t.phon, s.phon) <= 1) { st = 'warn'; note = `${name} and ${o} are one sound apart.`; }
    else if (t.first && t.first === s.first) { st = 'ok'; note = `Same first letter as ${o}, but they sound different enough.`; }
    if (st) { status = worse(status, st); notes.push([st, note]); }
  }
  notes.sort((a, b) => RANK[b[0]] - RANK[a[0]]);
  const text = notes.length ? notes.slice(0, 2).map(n => n[1]).join(' ') : `Sounds nothing like ${andList(others)}.`;
  return { id: 'house', title: 'Other names at home', status, text };
}

function vetCheck(name, surname, s, species) {
  const tokens = words(name);
  const sur = displayName(surname || '');
  const called = [name, sur].filter(Boolean).join(' ');
  const joined = [...tokens, ...words(sur)].join('');
  const title = 'The waiting-room test';
  const found = [];
  if (PRANKS.some(p => joined.includes(p))) {
    found.push({ status: 'bad', text: `Read ${quote(called + '?')} out loud. Slowly. The vet’s receptionist will.` });
  }
  if (SWEAR_INSIDE.test(tokens.join('')) && !tokens.some(t => HEARD_BY_WORD.get(t)?.level === 'bad')) {
    found.push({ status: 'bad', text: 'There’s a swear word hiding in it, and someone will find it.' });
  }
  for (const t of tokens) {
    const h = HEARD_BY_WORD.get(t);
    if (h) found.push({ status: h.level, text: h.text(t) });
    if (species === 'dog' && DOG_EXCITED.has(t)) found.push({ status: 'ok', text: `Every dog in earshot knows ${quote(t)} means something good.` });
  }
  if (tokens.length === 1 && !found.length) {
    const nick = nicknames(name);
    for (const n of nick.stems) {
      const h = HEARD_BY_WORD.get(n);
      if (h && RANK[h.level] >= RANK.warn) {
        found.push({ status: h.level === 'bad' ? 'warn' : 'ok', text: `Watch out: the obvious short form is ${quote(cap(n))}.` });
        break;
      }
    }
  }
  if (!found.length) {
    return { id: 'vet', title, status: 'good', text: `${quote(called + '?')} Nobody in the waiting room will snigger.` };
  }
  found.sort((a, b) => RANK[b.status] - RANK[a.status]);
  return { id: 'vet', title, status: found[0].status, text: found.slice(0, 2).map(f => f.text).join(' ') };
}

function popularCheck(name, species) {
  const key = plain(name);
  const noun = NOUN[species];
  const place = PLACE[species];
  const rank = POPULAR_RANK[species]?.get(key);
  const title = 'How common';
  const top = species === 'dog' || species === 'cat' ? 12 : 4;
  if (rank && rank <= top) return { id: 'popular', title, status: 'ok', text: `One of the most popular ${noun} names there is. Expect company ${place}.` };
  if (rank) return { id: 'popular', title, status: 'good', text: `A popular ${noun} name, but not everywhere.` };
  const elsewhere = ['dog', 'cat'].find(sp => sp !== species && POPULAR_RANK[sp].get(key));
  if (elsewhere) return { id: 'popular', title, status: 'good', text: `A common ${elsewhere} name, which makes it an unusual ${noun} name.` };
  const e = BY_NAME.get(key);
  if (e?.themes.includes('office')) return { id: 'popular', title, status: 'good', text: `Uncommon for a ${noun}. It’s also a person’s name: funny at the park, awkward if your boss is called ${name}.` };
  if (e?.themes.includes('oldfolks')) return { id: 'popular', title, status: 'good', text: `Uncommon for a ${noun}. It’s also a person’s name, mostly your grandparents’ generation’s.` };
  if (e) return { id: 'popular', title, status: 'good', text: 'Uncommon. You probably won’t meet another.' };
  return { id: 'popular', title, status: 'good', text: `Rare. Probably the only one ${place}.` };
}

function spellCheck(name, raw) {
  const title = 'Say it, spell it';
  if (/\d/.test(raw)) return { id: 'spell', title, status: 'bad', text: 'Numbers on a tag look like a phone number.' };
  if (/\p{Extended_Pictographic}/u.test(raw)) return { id: 'spell', title, status: 'bad', text: 'Engravers can’t do emoji, and neither can the vet’s computer.' };
  const key = plain(name);
  let status = 'good';
  const bits = [];
  const alts = otherSpellings(name);
  if (alts.length) {
    const usual = !BY_NAME.has(key) && alts.find(a => BY_NAME.has(plain(a)));
    if (usual) { status = 'warn'; bits.push(`The usual spelling is ${usual}. Expect people to write that.`); }
    else { status = 'ok'; bits.push(`People will also write it ${orList(alts)}.`); }
  }
  const say = pronounceNote(key);
  if (say) { status = worse(status, 'warn'); bits.unshift(say); }
  if (/['’]/.test(name)) { status = worse(status, 'ok'); bits.push('The apostrophe will get dropped half the time.'); }
  if (!bits.length) bits.push('Spelled the way it sounds.');
  return { id: 'spell', title, status, text: bits.join(' ') };
}

function tagCheck(name) {
  const n = name.length;
  const title = 'Fits on a tag';
  if (n <= 9) return { id: 'tag', title, status: 'good', text: 'Fits on the smallest tag in big letters.' };
  if (n <= 14) return { id: 'tag', title, status: 'good', text: 'Fits on one line.' };
  if (n <= 22) return { id: 'tag', title, status: 'ok', text: 'Two lines on most tags, in small letters.' };
  return { id: 'tag', title, status: 'warn', text: 'Too long for most tags. The engraver will ask you to shorten it.' };
}

const TOXIC = {
  dog: { chocolate: 'Chocolate', grape: 'Grapes', raisin: 'Raisins', onion: 'Onions', garlic: 'Garlic', macadamia: 'Macadamia nuts', xylitol: 'Xylitol', mocha: 'Chocolate' },
  cat: { lily: 'Lilies', onion: 'Onions', garlic: 'Garlic', chocolate: 'Chocolate' },
  bird: { avocado: 'Avocado', chocolate: 'Chocolate', mocha: 'Chocolate', espresso: 'Coffee' },
  small: { chocolate: 'Chocolate', onion: 'Onions' },
  horse: { onion: 'Onions', chocolate: 'Chocolate' },
};
const SPECIES_WORDS = { dog: ['dog', 'doggy', 'puppy', 'pup'], cat: ['cat', 'kitty', 'kitten', 'puss', 'pussycat'], fish: ['fish', 'fishy'],
  bird: ['bird', 'birdie', 'tweety'], horse: ['horse', 'horsey', 'pony'], small: ['bunny', 'hamster', 'mouse'], reptile: ['lizard', 'snake', 'turtle'] };

function fitCheck(name, species) {
  const key = plain(name);
  const tokens = words(name);
  const e = BY_NAME.get(key);
  const noun = NOUN[species];
  const title = `For a ${noun}`;
  const label = sp => SPECIES.find(x => x.id === sp)?.label.toLowerCase();
  if (e?.only.length && !e.only.includes(species)) {
    return { id: 'fit', title, status: 'warn', text: `It’s a ${label(e.only[0])} pun. On a ${noun} it needs explaining.` };
  }
  for (const t of tokens) {
    const toxic = TOXIC[species]?.[t];
    if (toxic) return { id: 'fit', title, status: 'ok', text: `${toxic} can make a ${noun} ill. The name is fine; just keep the real thing out of reach.` };
  }
  if (species === 'fish' && tokens.some(t => ['sushi', 'fishstick', 'fillet', 'chips', 'tartare', 'sashimi', 'tuna'].includes(t))) {
    return { id: 'fit', title, status: 'ok', text: 'Dark. Everyone will make the same joke, and so will you.' };
  }
  for (const [sp, list] of Object.entries(SPECIES_WORDS)) {
    if (tokens.length === 1 && list.includes(tokens[0])) {
      return sp === species
        ? { id: 'fit', title, status: 'ok', text: `A ${noun} called ${name}. Bold.` }
        : { id: 'fit', title, status: 'ok', text: `A ${noun} called ${name}. You’ll explain it forever, and enjoy it.` };
    }
  }
  if (e?.species.includes(species) || e?.only.includes(species)) {
    return { id: 'fit', title, status: 'good', text: `A good fit for a ${noun}.` };
  }
  return null;
}

const VERDICTS = {
  great: { label: 'Great name', stamp: 'Great name' },
  good: { label: 'Good name', stamp: 'Good name' },
  fine: { label: 'It’ll do', stamp: 'It’ll do' },
  again: { label: 'Think again', stamp: 'Think again' },
  dont: { label: 'Please don’t', stamp: 'Please don’t' },
};
const PENALTY = { good: 0, info: 0, ok: 5, warn: 20, bad: 40 };

export function check(raw, ctx = {}) {
  const species = ctx.species || 'dog';
  const house = ctx.house || [];
  const name = displayName(raw);
  if (!name || !/\p{L}/u.test(name)) return null;
  const s = soundOf(name);
  const checks = [
    vetCheck(name, ctx.surname, s, species),
    commandCheck(s, species, name),
    yellCheck(s, species, name),
    houseCheck(s, name, house),
    popularCheck(name, species),
    spellCheck(name, String(raw)),
    tagCheck(name),
    fitCheck(name, species),
  ].filter(Boolean);
  const score = Math.max(0, 100 - checks.reduce((sum, c) => sum + PENALTY[c.status], 0));
  let id = score >= 95 ? 'great' : score >= 85 ? 'good' : score >= 70 ? 'fine' : score >= 45 ? 'again' : 'dont';
  const vet = checks.find(c => c.id === 'vet');
  const cmd = checks.find(c => c.id === 'command');
  if (vet.status === 'bad' || cmd?.exact) id = 'dont';
  const order = [...checks].sort((a, b) => RANK[b.status] - RANK[a.status]);
  const worst = order[0];
  const first = c => c.text.split(/(?<=[.?!])\s/)[0];
  let line;
  if (RANK[worst.status] <= RANK.good) line = 'Passes every test.';
  else if (id === 'great') line = 'Passes every test, with one small note.';
  else line = first(worst);
  const nick = nicknames(name);
  return {
    name,
    species,
    score,
    verdict: { id, ...VERDICTS[id], line },
    checks: order,
    nicknames: nick.shown,
    trouble: troubleName(name, ctx.surname),
  };
}

// Similar names that pass, for when this one doesn't (or for more like it).
export function alternatives(raw, ctx = {}, n = 4) {
  const name = displayName(raw);
  if (!name) return [];
  const species = ctx.species || 'dog';
  const s = soundOf(name);
  const key = plain(name);
  const entry = BY_NAME.get(key);
  const cands = [];
  for (const e of NAMES) {
    if (e.only.length && !e.only.includes(species)) continue;
    const k = plain(e.name);
    if (k === key) continue;
    const t = soundOf(e.name);
    let sim = 0;
    if (t.firstSound === s.firstSound) sim += 2;
    if (t.onset === s.onset) sim += 2;
    if (t.rhyme === s.rhyme) sim += 2;
    if (entry && e.themes.some(th => entry.themes.includes(th))) sim += 2;
    if (t.syllables === Math.min(Math.max(s.syllables, 1), 2)) sim += 1;
    if (sim >= 3) cands.push({ e, sim, tie: hash(k + key) });
  }
  cands.sort((a, b) => b.sim - a.sim || a.tie - b.tie);
  const out = [];
  for (const { e } of cands.slice(0, 60)) {
    const r = check(e.name, { ...ctx, species });
    if (r && r.score >= 85 && r.verdict.id !== 'dont') out.push(e.name);
    if (out.length >= n) break;
  }
  return out;
}
