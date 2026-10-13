// On-device gesture detector. Works on tiny grayscale frames (no ML model, no network).
// Gestures: 'r' swipe right, 'l' swipe left, 'c' circle, 'v' lens covered by a palm.
const pathInfo = (pts) => {
  const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
  const my = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  let total = 0;
  let last = Math.atan2(pts[0].y - my, pts[0].x - mx);
  for (let i = 1; i < pts.length; i++) {
    const a = Math.atan2(pts[i].y - my, pts[i].x - mx);
    let d = a - last;
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    total += d;
    last = a;
  }
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  return { total, w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};

export function createDetector(W = 64, H = 48) {
  let prev = null, hist = [], cool = 0, darkSince = 0, base = 0;

  return function step(rgba, now) {
    const gray = new Float32Array(W * H);
    let lum = 0;
    for (let i = 0; i < W * H; i++) {
      gray[i] = rgba[i * 4] * 0.3 + rgba[i * 4 + 1] * 0.59 + rgba[i * 4 + 2] * 0.11;
      lum += gray[i];
    }
    lum /= W * H;
    if (!base) base = lum;
    const covered = base > 40 && lum < base * 0.35;
    if (!covered) base = base * 0.97 + lum * 0.03;

    let gesture = null;
    if (covered) {
      darkSince = darkSince || now;
      if (now - darkSince > 900 && now > cool) { cool = now + 1500; darkSince = 0; gesture = 'v'; }
    } else darkSince = 0;

    let n = 0, sx = 0, sy = 0;
    if (prev && !covered) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (Math.abs(gray[i] - prev[i]) > 26) { n++; sx += W - 1 - x; sy += y; } // x mirrored to match the preview
      }
    }
    prev = gray;
    const frac = n / (W * H);
    const moving = frac > 0.02 && frac < 0.5;
    const x = moving ? sx / n : 0, y = moving ? sy / n : 0;
    if (moving) hist.push({ t: now, x, y });
    hist = hist.filter((p) => now - p.t < 1800);

    if (!gesture && now >= cool) {
      if (hist.length >= 12) {
        const p = pathInfo(hist);
        if (Math.abs(p.total) > 5.4 && p.w > 10 && p.h > 10) gesture = 'c';
      }
      if (!gesture) {
        const q = hist.filter((p) => now - p.t < 800);
        if (q.length >= 4) {
          const a = q[0], b = q[q.length - 1], dx = b.x - a.x;
          if (Math.abs(dx) > W * 0.34 && Math.abs(b.y - a.y) < Math.abs(dx) * 0.8) gesture = dx > 0 ? 'r' : 'l';
        }
      }
      if (gesture) { cool = now + 1500; hist = []; }
    }
    return { gesture, moving, x: x / W, y: y / H };
  };
}
