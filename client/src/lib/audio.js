let ctx = null;
let talking = false;

export const getCtx = () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
export const unlockAudio = () => { try { getCtx().resume(); } catch { /* ignore */ } };
export const isTalking = () => talking; // the mic ignores results while the app is speaking

export function speak(text) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    talking = true;
    u.onend = u.onerror = () => setTimeout(() => (talking = false), 500);
    speechSynthesis.speak(u);
  } catch { talking = false; }
}

export function beep() {
  try {
    const c = getCtx();
    c.resume();
    [0, 0.22, 0.44].forEach((d) => {
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + d;
      o.frequency.value = 880;
      o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.start(t); o.stop(t + 0.2);
    });
  } catch { /* ignore */ }
}

/** Short happy arpeggio for the "food is ready" moment. */
export function cheer() {
  try {
    const c = getCtx();
    c.resume();
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + i * 0.12;
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.start(t); o.stop(t + 0.4);
    });
  } catch { /* ignore */ }
}

// ---- party popper sound (synthesised, no audio files) ----
function noise(c, dur) {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function pop(c, t, pan) {
  const out = c.createStereoPanner ? c.createStereoPanner() : c.createGain();
  if (out.pan) out.pan.value = pan;
  out.connect(c.destination);
  // low "thump" of the air blast
  const o = c.createOscillator(), og = c.createGain();
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  og.gain.setValueAtTime(0.9, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.connect(og); og.connect(out);
  o.start(t); o.stop(t + 0.2);
  // bright "crack" of the shell
  const n = noise(c, 0.2), f = c.createBiquadFilter(), ng = c.createGain();
  f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.7;
  ng.gain.setValueAtTime(1, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  n.connect(f); f.connect(ng); ng.connect(out);
  n.start(t); n.stop(t + 0.2);
}

function shimmer(c, t) {
  const n = noise(c, 1.8), f = c.createBiquadFilter(), g = c.createGain();
  f.type = 'highpass'; f.frequency.value = 4000;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
  n.connect(f); f.connect(g); g.connect(c.destination);
  n.start(t); n.stop(t + 1.8);
  for (let i = 0; i < 14; i++) { // falling confetti sparkles
    const tt = t + 0.1 + Math.random() * 1.4, o = c.createOscillator(), og = c.createGain();
    o.frequency.value = 2000 + Math.random() * 3000;
    og.gain.setValueAtTime(0.0001, tt);
    og.gain.exponentialRampToValueAtTime(0.05, tt + 0.01);
    og.gain.exponentialRampToValueAtTime(0.0001, tt + 0.12);
    o.connect(og); og.connect(c.destination);
    o.start(tt); o.stop(tt + 0.15);
  }
}

/** Two poppers (left and right) + confetti shimmer, then a short happy arpeggio. */
export function partyPopper() {
  try {
    const c = getCtx();
    c.resume();
    const t = c.currentTime + 0.02;
    pop(c, t, -0.6);
    pop(c, t + 0.09, 0.6);
    shimmer(c, t + 0.04);
    setTimeout(cheer, 260);
  } catch { /* ignore */ }
}
