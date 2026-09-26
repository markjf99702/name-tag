// Picks the least robotic English voice the browser offers. Voices differ by device:
// Chrome's "Google" voices, Edge's "Natural" ones and Apple's Enhanced or Premium downloads sound far more human
// than the compact defaults, and macOS also ships joke voices (Bubbles, Zarvox) that should never be picked.

const NOVELTY = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|fred|good news|hysterical|jester|junior|kathy|organ|pipe organ|princess|ralph|superstar|trinoids|whisper|wobble|zarvox|eddy|eloquence|grandma|grandpa|reed|rocko|sandy|shelley|flo)\b/i;

export function voiceScore(v) {
  const name = v.name || '';
  let s = 0;
  if (NOVELTY.test(name)) s -= 1000;
  if (/natural|neural|premium|enhanced|siri/i.test(name)) s += 60;
  if (/online/i.test(name)) s += 20;
  if (/google/i.test(name)) s += 40;
  if (/compact/i.test(name)) s -= 30;
  if (/^en[-_]us/i.test(v.lang)) s += 6;
  else if (/^en[-_](gb|au|ie|ca|nz)/i.test(v.lang)) s += 4;
  if (v.default) s += 2;
  return s;
}

export function englishVoices(voices) {
  return voices.filter(v => /^en([-_]|$)/i.test(v.lang || '') && !NOVELTY.test(v.name || ''));
}

// The chosen voice if it's still there, otherwise the best one.
export function pickVoice(voices, preferred = '') {
  const english = englishVoices(voices);
  if (preferred) {
    const chosen = english.find(v => v.name === preferred);
    if (chosen) return chosen;
  }
  return [...english].sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
}
