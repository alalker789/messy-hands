// Canvas confetti that mimics a real party popper: two corner cannons fire a dense burst,
// a second wave rains from the top, then everything flutters down slowly and fades out.
const COLORS = ['#ff3d6e', '#ff8a3d', '#ffd23d', '#5bff6b', '#3dffe0', '#3d8bff', '#a14dff', '#ff4de1', '#ffffff'];
const rnd = (a, b) => a + Math.random() * (b - a);

export function startConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, s = 1;
  const fit = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    s = Math.max(0.6, Math.min(W, H) / 700);
  };
  fit();
  window.addEventListener('resize', fit);

  const parts = [];
  const spawn = (n, make) => {
    for (let i = 0; i < n; i++) {
      parts.push({
        ...make(),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        ribbon: Math.random() < 0.35,
        w: rnd(6, 12) * s, h: rnd(10, 20) * s,
        rot: rnd(0, 6.28), vr: rnd(-8, 8),
        flip: rnd(0, 6.28), vf: rnd(4, 10),
        sway: rnd(0, 6.28), vs: rnd(1.5, 3.5), amp: rnd(10, 40) * s,
        age: 0, life: rnd(3.5, 6.5),
      });
    }
  };
  // dir = +1 fires up and to the right (left corner), -1 up and to the left (right corner)
  const cannon = (x, dir, n) => spawn(n, () => {
    const a = -Math.PI / 2 + dir * rnd(0.05, 1.0), v = rnd(700, 1500) * s;
    return { x: x + rnd(-10, 10), y: H, vx: Math.cos(a) * v, vy: Math.sin(a) * v };
  });
  const rain = (n) => spawn(n, () => ({ x: rnd(0, W), y: rnd(-H * 0.2, H * 0.3), vx: rnd(-60, 60) * s, vy: rnd(0, 200) * s }));

  const timeline = [
    { t: 0, run: () => { cannon(W * 0.05, 1, 120); cannon(W * 0.95, -1, 120); } },
    { t: 0.2, run: () => rain(150) },
    { t: 0.5, run: () => { cannon(W * 0.05, 1, 50); cannon(W * 0.95, -1, 50); } },
    { t: 1.0, run: () => rain(80) },
  ];

  let raf, last = performance.now(), elapsed = 0, next = 0;
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; elapsed += dt;
    while (next < timeline.length && elapsed >= timeline[next].t) timeline[next++].run();

    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.age += dt;
      p.vy += 380 * s * dt;                       // gravity
      p.vx *= Math.exp(-2.4 * dt); p.vy *= Math.exp(-2.4 * dt); // air drag => slow flutter
      p.sway += p.vs * dt;
      p.x += (p.vx + Math.cos(p.sway) * p.amp) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt; p.flip += p.vf * dt;
      if (p.age > p.life || p.y > H + 60) { parts.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = p.age > p.life - 0.8 ? Math.max(0, (p.life - p.age) / 0.8) : 1;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.flip));
      if (p.ribbon) {
        ctx.strokeStyle = p.color; ctx.lineWidth = 2.2 * s;
        ctx.beginPath(); ctx.arc(0, 0, p.h * 0.45, 0, Math.PI * 1.15); ctx.stroke();
      } else {
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (next < timeline.length || parts.length) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', fit); ctx.clearRect(0, 0, W, H); };
}
