// Pure voice-command parser (English + Hinglish). Easy to unit-test.
const NUMBER_WORDS = {
  one: 1, ek: 1, two: 2, three: 3, teen: 3, four: 4, char: 4, chaar: 4, five: 5, paanch: 5, panch: 5,
  six: 6, chhe: 6, chah: 6, seven: 7, saat: 7, eight: 8, aath: 8, nine: 9, nau: 9, ten: 10, das: 10,
};
const WAKE = /\b(chef\s*(ji|jee|g)|shef\s*ji)\b/;

export function stripWake(text) {
  const l = text.toLowerCase();
  return { hit: WAKE.test(l), text: l.replace(WAKE, '').trim() };
}

function numberIn(l) {
  const digits = l.match(/\d+/);
  if (digits) return Number(digits[0]);
  for (const w of l.split(/\W+/)) if (NUMBER_WORDS[w]) return NUMBER_WORDS[w];
  return 0;
}

function findIngredient(l, ingredients) {
  return ingredients.find((ing) => {
    const words = [...(ing.aliases || []), ...ing.name.toLowerCase().split(/\W+/).filter((w) => w.length > 2)];
    return words.some((w) => new RegExp(`\\b${w}\\b`).test(l));
  });
}

export function parseCommand(text, ingredients = []) {
  const l = text.toLowerCase();
  if (/time left|kitna time|how long|remaining/.test(l)) return { type: 'TIME_LEFT' };
  if (/(how much|kitna|kitni|kitne)/.test(l)) {
    const ing = findIngredient(l, ingredients);
    if (ing) return { type: 'ASK_QTY', key: ing.key };
  }
  if (/scale|serv|log|people|persons|ke liye|wapas\s*\d/.test(l) && numberIn(l)) return { type: 'SCALE', n: numberIn(l) };
  if (/\b(next|agla|aage|forward)\b/.test(l)) return { type: 'NEXT' };
  if (/\b(back|previous|pichla|peeche)\b/.test(l)) return { type: 'BACK' };
  if (/\b(start|shuru|timer)\b/.test(l)) return { type: 'START_TIMER' };
  if (/\b(pause|ruko|stop)\b/.test(l)) return { type: 'PAUSE' };
  if (/\b(resume|chalo|play)\b/.test(l)) return { type: 'RESUME' };
  if (/\b(done|finish|finished|complete|completed|ho gaya|hogaya|khatam)\b/.test(l)) return { type: 'DONE' };
  if (/\b(dismiss|ok|okay|silence|chup|snooze)\b/.test(l)) return { type: 'DISMISS' };
  if (/repeat|read|dobara|phir se/.test(l)) return { type: 'REPEAT' };
  return null;
}
