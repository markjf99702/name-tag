// Draws a name engraved on a pet tag, as an SVG string. Each name always gets the same tag.
import { hash } from './check.js';

export const METALS = {
  brass: { label: 'brass', stops: ['#fbe7a6', '#dcb65a', '#a9822c'], edge: '#80611c', ink: '#4f3a0e', glint: 'rgba(255,248,222,.8)' },
  steel: { label: 'steel', stops: ['#fafbfc', '#ccd3d9', '#939da6'], edge: '#727c86', ink: '#2e363e', glint: 'rgba(255,255,255,.85)' },
  rose: { label: 'rose gold', stops: ['#fbdcd2', '#e2a797', '#b9725f'], edge: '#95513f', ink: '#57271b', glint: 'rgba(255,242,238,.75)' },
  red: { label: 'red', stops: ['#ff9c89', '#e24b37', '#ad2d1c'], edge: '#861f12', ink: '#fff1ec', shade: 'rgba(80,12,4,.6)' },
  blue: { label: 'blue', stops: ['#9ccaff', '#3f82e2', '#2253a6'], edge: '#193f83', ink: '#f0f6ff', shade: 'rgba(8,26,70,.6)' },
  green: { label: 'green', stops: ['#aee8b2', '#45aa58', '#277637'], edge: '#1b5728', ink: '#f1fcf2', shade: 'rgba(8,45,16,.55)' },
  purple: { label: 'purple', stops: ['#dcc3ff', '#8d61e2', '#5f33a6'], edge: '#46238a', ink: '#f8f2ff', shade: 'rgba(36,8,74,.55)' },
  pink: { label: 'pink', stops: ['#ffc8df', '#f075ac', '#c44683'], edge: '#9f2d63', ink: '#fff4f9', shade: 'rgba(84,8,44,.5)' },
  black: { label: 'black', stops: ['#74747c', '#3b3b42', '#1e1e23'], edge: '#0d0d10', ink: '#ececf1', shade: 'rgba(0,0,0,.65)' },
};
const METAL_KEYS = Object.keys(METALS);

// Every shape hangs from a ring whose top is at y = 18, through a hole at (100, 58).
// body() returns the tag's outline pieces; text is where the name goes.
const SHAPES = {
  round: {
    label: 'round', h: 204, text: { x: 100, y: 130, w: 122, size: 36 },
    body: () => [['circle', { cx: 100, cy: 122, r: 78 }]],
  },
  bone: {
    label: 'bone-shaped', h: 136, text: { x: 100, y: 88, w: 148, size: 30 },
    body: () => [
      ['rect', { x: 40, y: 48, width: 120, height: 58 }],
      ['circle', { cx: 40, cy: 52, r: 28 }], ['circle', { cx: 40, cy: 102, r: 28 }],
      ['circle', { cx: 160, cy: 52, r: 28 }], ['circle', { cx: 160, cy: 102, r: 28 }],
    ],
  },
  heart: {
    label: 'heart-shaped', h: 200, text: { x: 100, y: 112, w: 128, size: 34 },
    body: () => [
      ['path', { d: 'M100 196C58 166 20 136 20 98C20 66 42 44 68 44C84 44 95 52 100 64C105 52 116 44 132 44C158 44 180 66 180 98C180 136 142 166 100 196Z' }],
      ['circle', { cx: 100, cy: 58, r: 13 }],
    ],
  },
  rect: {
    label: 'rectangular', h: 160, text: { x: 100, y: 110, w: 142, size: 36 },
    body: () => [['rect', { x: 16, y: 44, width: 168, height: 112, rx: 30 }]],
  },
  fish: {
    label: 'fish-shaped', h: 158, text: { x: 90, y: 110, w: 112, size: 30 },
    body: () => [
      ['ellipse', { cx: 92, cy: 106, rx: 76, ry: 48 }],
      ['path', { d: 'M150 106L194 70Q184 106 194 142Z' }],
      ['circle', { cx: 100, cy: 58, r: 13 }],
    ],
  },
};

const SHAPES_FOR = {
  dog: ['bone', 'round', 'bone', 'heart', 'rect'], cat: ['round', 'heart', 'round', 'rect'], fish: ['fish'],
  bird: ['round', 'heart'], small: ['round', 'heart'], reptile: ['rect', 'round'], horse: ['rect', 'round', 'heart'],
};

export function tagLook(name, species = 'dog') {
  const k = String(name).toLowerCase();
  const shapes = SHAPES_FOR[species] || SHAPES_FOR.dog;
  return { metal: METAL_KEYS[hash(k) % METAL_KEYS.length], shape: shapes[hash(k + '·shape') % shapes.length] };
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const attrs = o => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(' ');

// Width of text in the tag font, measured by the browser when there is one.
const FONT = `font-family="Bricolage Grotesque, Figtree, system-ui, sans-serif" font-weight="700" style="font-stretch:82%"`;
let probe = null;
function textWidth(text, size) {
  if (typeof document === 'undefined') return text.length * size * 0.5;
  if (!probe) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden';
    svg.innerHTML = `<text ${FONT} letter-spacing="0.3"></text>`;
    document.body.append(svg);
    probe = svg.firstChild;
  }
  probe.setAttribute('font-size', size);
  probe.textContent = text;
  return probe.getComputedTextLength() || text.length * size * 0.5;
}

function split(name) {
  const w = name.split(' ');
  if (w.length === 1 || name.length <= 11) return [name];
  let best = [name];
  let score = Infinity;
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(' ');
    const b = w.slice(i).join(' ');
    const s = Math.max(a.length, b.length);
    if (s < score) { score = s; best = [a, b]; }
  }
  return best;
}

let uid = 0;

export function tagSVG(name, { species = 'dog', metal, shape, className = '', peg = true } = {}) {
  const look = tagLook(name, species);
  const m = METALS[metal || look.metal];
  const sh = SHAPES[shape || look.shape];
  const id = `t${++uid}`;
  const t = sh.text;
  const lines = split(name);
  const max = lines.length > 1 ? t.size * 0.78 : t.size;
  let size = max;
  for (const line of lines) size = Math.min(size, (t.w * 100) / textWidth(line, 100));
  size = Math.max(11, Math.round(size * 10) / 10);
  const lead = size * 1.02;
  const top = t.y - ((lines.length - 1) * lead) / 2 + size * 0.34;
  const squash = line => (textWidth(line, size) > t.w ? ` textLength="${t.w}" lengthAdjust="spacingAndGlyphs"` : '');
  const text = (fill, dy) => lines.map((line, i) =>
    `<text x="${t.x}" y="${(top + i * lead + dy).toFixed(1)}" font-size="${size}" text-anchor="middle" letter-spacing="0.3" ${FONT} fill="${fill}"${squash(line)}>${esc(line)}</text>`).join('');
  const pieces = sh.body();
  const shapesWith = extra => pieces.map(([tag, a]) => `<${tag} ${attrs(a)} ${extra}/>`).join('');
  const engraved = m.glint ? text(m.glint, 1) + text(m.ink, 0) : text(m.shade, -1) + text(m.ink, 0);
  const label = `${name}, engraved on a ${m.label} ${sh.label} tag`;
  const pivot = `transform-origin:50% ${((17 / sh.h) * 100).toFixed(2)}%`;
  return `<svg class="tag ${className}" viewBox="0 0 200 ${sh.h}" role="img" aria-label="${esc(label)}" style="${pivot}">
<defs>
<linearGradient id="${id}m" gradientUnits="userSpaceOnUse" x1="20" y1="30" x2="180" y2="${sh.h}"><stop offset="0" stop-color="${m.stops[0]}"/><stop offset=".55" stop-color="${m.stops[1]}"/><stop offset="1" stop-color="${m.stops[2]}"/></linearGradient>
<linearGradient id="${id}s" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="200" y2="${Math.round(20 + sh.h * 0.35)}"><stop offset=".18" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".38"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".5" stop-color="#9aa3ab"/><stop offset="1" stop-color="#d7dce0"/></linearGradient>
<radialGradient id="${id}p" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#b9b3aa"/><stop offset=".6" stop-color="#5d574f"/><stop offset="1" stop-color="#2b2723"/></radialGradient>
</defs>
<clipPath id="${id}c">${shapesWith('')}</clipPath>
<g>${shapesWith(`fill="${m.edge}" stroke="${m.edge}" stroke-width="3"`)}${shapesWith(`fill="url(#${id}m)"`)}<rect width="200" height="${sh.h}" fill="url(#${id}s)" clip-path="url(#${id}c)"/></g>
<circle cx="100" cy="58" r="6.5" fill="rgba(0,0,0,.42)"/>
<circle cx="100" cy="38" r="20" fill="none" stroke="url(#${id}r)" stroke-width="4.5"/>
${engraved}
${peg ? `<circle cx="100" cy="17" r="6.5" fill="url(#${id}p)"/>` : ''}
</svg>`;
}
