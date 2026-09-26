// Name Tag: the page. Three views (find, check, shortlist) on one page, switched by the address hash.
import { SPECIES, COATS, TRAITS, THEMES } from './names.js';
import { deal } from './generate.js';
import { check, alternatives, displayName } from './check.js';
import { plain } from './sound.js';
import { tagSVG } from './tag.js';
import { load, save } from './store.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = s => s[0].toUpperCase() + s.slice(1);
const narrow = () => matchMedia('(max-width: 959px)').matches;
const state = load();
const persist = () => save(state);

// ---------- Chips ----------

const GROUPS = {
  species: { key: 'species', items: SPECIES.map(s => [s.id, `<span aria-hidden="true">${s.emoji}</span> ${s.label}`]) },
  checkSpecies: { key: 'species', items: SPECIES.map(s => [s.id, `<span aria-hidden="true">${s.emoji}</span> ${s.label}`]) },
  sex: { key: 'sex', items: [['any', 'Either'], ['m', 'Boy'], ['f', 'Girl']] },
  themes: { key: 'themes', multi: true, items: THEMES.map(t => [t.id, t.label]) },
  normal: { key: 'normal', items: [['normal', 'Normal'], ['mix', 'Bit of both'], ['weird', 'Weird']] },
  coats: { key: 'coats', multi: true, items: COATS.map(c => [c, cap(c)]) },
  size: { key: 'size', toggle: true, items: [['tiny', 'Tiny'], ['big', 'Big']] },
  traits: { key: 'traits', multi: true, items: TRAITS.map(t => [t, cap(t)]) },
};

function renderChips() {
  for (const box of $$('[data-group]')) {
    const g = GROUPS[box.dataset.group];
    box.setAttribute('role', 'group');
    box.innerHTML = g.items.map(([v, label]) => `<button type="button" class="chip" data-v="${v}">${label}</button>`).join('');
  }
  syncChips();
}

function syncChips() {
  for (const box of $$('[data-group]')) {
    const g = GROUPS[box.dataset.group];
    const val = state[g.key];
    for (const b of $$('.chip', box)) {
      const on = g.multi ? val.includes(b.dataset.v) : val === b.dataset.v;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-group] .chip');
  if (!b) return;
  const box = b.closest('[data-group]');
  const g = GROUPS[box.dataset.group];
  const v = b.dataset.v;
  if (g.multi) {
    const list = state[g.key];
    state[g.key] = list.includes(v) ? list.filter(x => x !== v) : [...list, v];
  } else if (g.toggle) {
    state[g.key] = state[g.key] === v ? null : v;
  } else {
    state[g.key] = v;
  }
  persist();
  syncChips();
  if (box.dataset.group === 'checkSpecies') renderReport();
  else { dealNow(); if (g.key === 'species') renderReport(); }
});

// ---------- Find ----------

let dealt = [];
let recent = [];
const savedKey = (name, species) => `${plain(name)}|${species}`;
const isSaved = (name, species) => state.saved.some(s => savedKey(s.name, s.species) === savedKey(name, species));

function dealNow() {
  const { picks, total, fit } = deal(state, { avoid: recent });
  recent = [...picks.map(p => p.name), ...recent].slice(0, 36);
  dealt = picks;
  const h = $('#results-h');
  if (!total) h.textContent = 'Nothing fits all of that';
  else if (!fit) h.textContent = 'Nothing fits all of that, so these are the closest';
  else if (fit < picks.length) h.textContent = `Only ${fit} fit${fit === 1 ? 's' : ''} everything, so the rest are close`;
  else h.textContent = `${picks.length} of ${fit.toLocaleString()} names that fit`;
  $('#againBtn').hidden = total <= picks.length;
  $('#dealt').innerHTML = total
    ? picks.map((p, i) => hangCard(p.name, state.species, { i, why: p.reasons.join(' · ') })).join('')
    : '<p class="empty">Try fewer picks. The coat, personality and letter choices narrow things down fastest.</p>';
}

function hangCard(name, species, { i = 0, why = '', stamp = null, removable = false } = {}) {
  const saved = isSaved(name, species);
  return `<figure class="hang" style="--i:${i}">
    <button type="button" class="tagbtn" data-check="${esc(name)}" data-species="${species}" title="Check ${esc(name)}">${tagSVG(name, { species })}${stamp ? `<span class="stamp small s-${stamp.id}">${esc(stamp.stamp)}</span>` : ''}</button>
    <figcaption>
      ${why ? `<span class="why">${esc(why)}</span>` : ''}
      <span class="acts">
        ${removable
          ? `<button type="button" class="mini" data-remove="${esc(name)}" data-species="${species}">Remove</button>`
          : `<button type="button" class="mini heart" data-save="${esc(name)}" data-species="${species}" aria-pressed="${saved}" aria-label="${saved ? 'Saved' : 'Save'} ${esc(name)}">${saved ? '♥' : '♡'} ${saved ? 'Saved' : 'Save'}</button>`}
        <button type="button" class="mini" data-check="${esc(name)}" data-species="${species}">Check</button>
      </span>
    </figcaption>
  </figure>`;
}

$('#dealBtn').addEventListener('click', () => {
  dealNow();
  if (narrow()) $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('#againBtn').addEventListener('click', dealNow);

const letter = $('#letter');
letter.value = state.letter || '';
letter.addEventListener('input', () => { state.letter = letter.value.replace(/[^a-z]/gi, '').slice(0, 2); persist(); dealNow(); });
const easy = $('#easy');
easy.checked = !!state.easy;
easy.addEventListener('change', () => { state.easy = easy.checked; persist(); dealNow(); });
const more = $('#more');
if (state.coats.length || state.traits.length || state.size || state.letter || matchMedia('(min-width: 960px)').matches) more.open = true;

// ---------- Saving ----------

function toggleSave(name, species) {
  if (isSaved(name, species)) state.saved = state.saved.filter(s => savedKey(s.name, s.species) !== savedKey(name, species));
  else { state.saved = [{ name, species, at: Date.now() }, ...state.saved]; toast(`${name} is on the shortlist.`); }
  persist();
  refreshSaveButtons();
  renderSaved();
}

function refreshSaveButtons() {
  for (const b of $$('[data-save]')) {
    const on = isSaved(b.dataset.save, b.dataset.species);
    b.setAttribute('aria-pressed', on);
    b.setAttribute('aria-label', `${on ? 'Saved' : 'Save'} ${b.dataset.save}`);
    b.innerHTML = b.classList.contains('big') ? `${on ? '♥ Saved' : '♡ Save to shortlist'}` : `${on ? '♥ Saved' : '♡ Save'}`;
  }
  const n = state.saved.length;
  const badge = $('#savedCount');
  badge.hidden = !n;
  badge.textContent = n;
}

document.addEventListener('click', e => {
  const s = e.target.closest('[data-save]');
  if (s) { toggleSave(s.dataset.save, s.dataset.species); return; }
  const r = e.target.closest('[data-remove]');
  if (r) { toggleSave(r.dataset.remove, r.dataset.species); return; }
  const c = e.target.closest('[data-check]');
  if (c) {
    if (c.dataset.species && c.dataset.species !== state.species) { state.species = c.dataset.species; persist(); syncChips(); }
    openCheck(c.dataset.check);
  }
});

// ---------- Check ----------

const input = $('#nameInput');
const house = $('#house');
const surname = $('#surname');
house.value = state.house;
surname.value = state.surname;
if (state.house || state.surname) $('#home').open = true;
input.value = state.last || '';

function openCheck(name) {
  input.value = name;
  state.last = name;
  persist();
  location.hash = '#/check';
  renderReport();
  window.scrollTo({ top: 0 });
}

let typing;
input.addEventListener('input', () => {
  state.last = input.value;
  persist();
  clearTimeout(typing);
  typing = setTimeout(renderReport, 140);
});
const showReport = () => { if (narrow()) $('#report').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
input.addEventListener('keydown', e => { if (e.key === 'Enter') { input.blur(); renderReport(); showReport(); } });
for (const [el, key] of [[house, 'house'], [surname, 'surname']]) {
  let wait;
  el.addEventListener('input', () => {
    state[key] = el.value;
    persist();
    clearTimeout(wait);
    wait = setTimeout(() => { renderReport(); renderSaved(); }, 200);
  });
}
$$('[data-try]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.try; state.last = b.dataset.try; persist(); renderReport(); showReport(); }));

const ctx = () => ({
  species: state.species,
  house: state.house.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean),
  surname: state.surname.trim(),
});

const ICON = { good: '✓', ok: '•', warn: '!', bad: '✕', info: 'i' };
const STATUS = { good: 'Passes', ok: 'Small note', warn: 'Problem', bad: 'Serious problem', info: 'Note' };
let lastStamp = '';

function renderReport() {
  const box = $('#report');
  const r = check(input.value, ctx());
  if (!r) {
    lastStamp = '';
    box.innerHTML = `<div class="report empty-report">
      <div class="hang big">${tagSVG('Your pet?', { species: state.species, metal: 'steel' })}</div>
      <p class="empty">The name gets engraved here as you type, then tested: can you shout it, does it sound like “sit” or “no”, does it rhyme with the cat, and will the vet snigger reading it out.</p>
    </div>`;
    return;
  }
  const alts = alternatives(r.name, ctx(), 4);
  const good = r.verdict.id === 'great' || r.verdict.id === 'good';
  const stampKey = `${r.name}|${r.verdict.id}`;
  const fresh = stampKey !== lastStamp;
  lastStamp = stampKey;
  const saved = isSaved(r.name, r.species);
  const speech = 'speechSynthesis' in window;
  box.innerHTML = `<div class="report v-${r.verdict.id}">
    <div class="report-tag">
      <div class="hang big${fresh ? ' swing' : ''}">
        ${tagSVG(r.name, { species: r.species })}
        <span class="stamp s-${r.verdict.id}${fresh ? ' thump' : ''}">${esc(r.verdict.stamp)}</span>
      </div>
      <div class="report-actions">
        <button type="button" class="btn heart big" data-save="${esc(r.name)}" data-species="${r.species}" aria-pressed="${saved}">${saved ? '♥ Saved' : '♡ Save to shortlist'}</button>
        ${speech ? `<button type="button" class="btn" id="callBtn">Call it</button><button type="button" class="btn" id="troubleBtn">Tell it off</button>` : ''}
      </div>
    </div>
    <div class="panel receipt">
      <p class="verdict"><strong>${esc(r.verdict.label)}.</strong> ${esc(r.verdict.line)}</p>
      <ul class="checks">
        ${r.checks.map(c => `<li class="c-${c.status}"><span class="ico" role="img" aria-label="${STATUS[c.status]}">${ICON[c.status]}</span><div><b>${esc(c.title)}</b><p>${esc(c.text)}</p></div></li>`).join('')}
      </ul>
      <div class="extras">
        <div><h3>It’ll get called</h3><p class="nicks">${r.nicknames.map(n => `<span>${esc(n)}</span>`).join('')}</p></div>
        <div><h3>When it’s in trouble</h3><p class="trouble">${esc(r.trouble)}!</p></div>
      </div>
    </div>
    ${alts.length ? `<div class="alts">
      <h3>${good ? 'More like it' : 'Try instead'}</h3>
      <div class="board mini-board">${alts.map((a, i) => `<figure class="hang small" style="--i:${i}"><button type="button" class="tagbtn" data-check="${esc(a)}" title="Check ${esc(a)}">${tagSVG(a, { species: r.species })}</button></figure>`).join('')}</div>
    </div>` : ''}
  </div>`;
  if (speech) {
    $('#callBtn').addEventListener('click', () => say(`${r.name}! ${r.name}! Come here!`, 1.05, 1.15));
    $('#troubleBtn').addEventListener('click', () => say(`${r.trouble}!`, 0.82, 0.7));
  }
}

function say(text, rate, pitch) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = pitch;
    speechSynthesis.speak(u);
  } catch { /* no voices */ }
}

// ---------- Shortlist ----------

function renderSaved() {
  const list = state.saved;
  const lede = $('#listLede');
  $('#listActions').hidden = !list.length;
  if (!list.length) {
    lede.textContent = 'Nothing saved yet. Tap Save under any name you like, and it waits here.';
    $('#saved').innerHTML = '';
    return;
  }
  lede.textContent = list.length === 1
    ? 'One name so far. Keep going, or check it again.'
    : `${list.length} names. Each one shows how it did on the tests with your house as it is now.`;
  $('#saved').innerHTML = list.map((s, i) => {
    const r = check(s.name, { ...ctx(), species: s.species });
    const sp = SPECIES.find(x => x.id === s.species);
    return hangCard(s.name, s.species, { i, why: `${sp?.emoji || ''} ${sp?.label || ''}`, stamp: r?.verdict, removable: true });
  }).join('');
}

$('#pickBtn').addEventListener('click', () => {
  const cards = $$('#saved .hang');
  if (!cards.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const winner = Math.floor(Math.random() * cards.length);
  cards.forEach(c => c.classList.remove('lit', 'picked'));
  const steps = reduce || cards.length === 1 ? 0 : 10 + cards.length * 2;
  let n = 0;
  let at = winner - steps;
  const tick = () => {
    cards.forEach(c => c.classList.remove('lit'));
    const idx = ((at % cards.length) + cards.length) % cards.length;
    if (n >= steps) {
      cards[winner].classList.add('picked');
      cards[winner].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      toast(`It’s ${state.saved[winner].name}.`);
      return;
    }
    cards[idx].classList.add('lit');
    n += 1;
    at += 1;
    setTimeout(tick, 60 + n * n * 1.6);
  };
  tick();
});

$('#copyBtn').addEventListener('click', async () => {
  const text = state.saved.map(s => {
    const r = check(s.name, { ...ctx(), species: s.species });
    return `${s.name} (${r ? r.verdict.label.toLowerCase() : ''})`;
  }).join('\n');
  try {
    await navigator.clipboard.writeText(`Pet names we like:\n${text}`);
    toast('Copied. Paste it anywhere.');
  } catch {
    toast('Couldn’t copy here. Try a screenshot instead.');
  }
});

// ---------- Toast and routing ----------

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function route() {
  const page = (location.hash.match(/^#\/(\w+)/) || [])[1];
  const current = ['find', 'check', 'list'].includes(page) ? page : 'find';
  for (const p of $$('.page')) p.hidden = p.id !== `page-${current}`;
  for (const a of $$('.tabs a')) {
    if (a.dataset.tab === current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  if (current === 'check') renderReport();
  if (current === 'list') renderSaved();
}
window.addEventListener('hashchange', () => { route(); window.scrollTo({ top: 0 }); });

// ---------- Start ----------

async function start() {
  renderChips();
  try { await Promise.race([document.fonts.load('700 30px "Bricolage Grotesque"'), new Promise(r => setTimeout(r, 1500))]); } catch { /* fonts are optional */ }
  dealNow();
  refreshSaveButtons();
  renderSaved();
  route();
  document.documentElement.classList.add('ready');
}
start();

if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !('single' in document.documentElement.dataset)) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// For tools/screenshots.mjs and the tests.
window.nameTag = { state, dealNow, renderReport, renderSaved, displayName };
