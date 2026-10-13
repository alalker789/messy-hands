import { mmss } from '../lib/format.js';

export default function ElbowBar({ last, anyDone, paused, running, step, strict, onAction, onIgnored }) {
  const tmLabel = anyDone ? '✔ DISMISS' : paused ? '▶ RESUME' : running ? '⏸ PAUSE' : step.timer ? `▶ ${mmss(step.timer.seconds)}` : '⏸ PAUSE';
  const press = (action) => (e) => {
    // Strict mode: ignore fingertip-sized contacts (needs a touchscreen that reports contact size).
    if (strict && e.pointerType === 'touch' && e.width > 1 && Math.max(e.width, e.height) < 28) return onIgnored();
    onAction(action);
  };
  return (
    <div className="bar">
      <button className="slab" onPointerDown={press('back')}>◀ BACK</button>
      <button className="slab next" onPointerDown={press('next')}>{last ? '🎉 DONE' : 'NEXT ▶'}</button>
      <button className={`slab tm${anyDone ? ' dis' : ''}`} onPointerDown={press('tm')}>{tmLabel}</button>
    </div>
  );
}
