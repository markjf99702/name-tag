// Remembers your picks, your house and your shortlist in this browser. Nothing leaves it.
import { DEFAULT_CRITERIA } from './generate.js';

const KEY = 'name-tag:v1';
export const DEFAULTS = { ...DEFAULT_CRITERIA, house: '', surname: '', saved: [], last: '' };

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : {};
    return { ...DEFAULTS, ...data, saved: Array.isArray(data.saved) ? data.saved : [] };
  } catch {
    return { ...DEFAULTS };
  }
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private window or storage blocked */ }
}
