import { useEffect, useMemo, useReducer, useRef } from 'react';
import { api } from '../api.js';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function reducer(s, a) {
  switch (a.type) {
    case 'GO':
      return { ...s, stepIndex: clamp(s.stepIndex + a.d, 0, a.last) };
    case 'SCALE':
      return { ...s, servings: clamp(a.n, 1, 12) };
    case 'START': {
      const t = { ...a.timer, endsAt: a.now + a.timer.total * 1000, leftMs: null };
      return { ...s, paused: false, timers: [...s.timers.filter((x) => x.key !== t.key), t] };
    }
    case 'PAUSE': {
      const on = a.on ?? !s.paused;
      if (on === s.paused) return s;
      const timers = s.timers.map((t) =>
        on
          ? t.endsAt != null && t.endsAt > a.now ? { ...t, leftMs: t.endsAt - a.now, endsAt: null } : t
          : t.leftMs != null ? { ...t, endsAt: a.now + t.leftMs, leftMs: null } : t
      );
      return { ...s, paused: on, timers };
    }
    case 'RESET':
      return { ...s, stepIndex: 0, paused: false, timers: [] };
    case 'DISMISS':
      return { ...s, timers: s.timers.filter((t) => !(t.endsAt != null && t.endsAt <= a.now)) };
    default:
      return s;
  }
}

/** Cooking state + actions. Every change is saved to MongoDB (debounced), so a refresh resumes exactly here. */
export default function useSession(initial, recipe) {
  const [state, dispatch] = useReducer(reducer, initial);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = setTimeout(() => {
      const { stepIndex, servings, paused, timers } = state;
      api.saveSession(state._id, { stepIndex, servings, paused, timers }).catch(() => {});
    }, 400);
    return () => clearTimeout(id);
  }, [state]);

  const last = recipe.steps.length - 1;
  const actions = useMemo(() => ({
    next: () => dispatch({ type: 'GO', d: 1, last }),
    back: () => dispatch({ type: 'GO', d: -1, last }),
    scale: (n) => dispatch({ type: 'SCALE', n }),
    startTimer: (timer) => dispatch({ type: 'START', timer, now: Date.now() }),
    pause: (on) => dispatch({ type: 'PAUSE', on, now: Date.now() }),
    restart: () => dispatch({ type: 'RESET' }),
    dismiss: () => dispatch({ type: 'DISMISS', now: Date.now() }),
  }), [last]);

  return [state, actions];
}
