export const mmss = (sec) => {
  const n = Math.ceil(sec);
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
};

const FRAC = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' };
const UNIT_WORDS = { g: 'grams', ml: 'millilitres', tsp: 'teaspoons', tbsp: 'tablespoons', cup: 'cups', pcs: 'pieces' };
const ROUND5 = new Set(['g', 'ml']);

export const scaleQty = (ing, servings, baseServings) => (ing.qty * servings) / baseServings;

/** "240 g", "1½ tbsp": grams/ml round to 5, spoons to the nearest quarter. */
export function formatQty(q, unit) {
  if (ROUND5.has(unit)) return `${Math.round(q / 5) * 5} ${unit}`;
  const r = Math.round(q * 4) / 4;
  const whole = Math.floor(r);
  const text = `${whole || ''}${FRAC[r - whole]}` || '¼';
  return `${text} ${unit}`;
}

export function spokenQty(ing, servings, baseServings) {
  const q = formatQty(scaleQty(ing, servings, baseServings), ing.unit);
  const [amount, unit] = q.split(' ');
  return `${amount} ${UNIT_WORDS[unit] || unit} of ${ing.name.split(',')[0].split(' (')[0]}`;
}

/** Derives display state of a stored timer at time `now` (ms). */
export function timerView(t, now) {
  const running = t.endsAt != null;
  const left = running ? Math.max(0, t.endsAt - now) / 1000 : (t.leftMs ?? 0) / 1000;
  return { ...t, left, done: running && t.endsAt <= now };
}

export const pickHero = (timers, step) =>
  timers.find((t) => t.done) ||
  (step.timer && timers.find((t) => t.key === step.timer.key)) ||
  [...timers].sort((a, b) => a.left - b.left)[0];
