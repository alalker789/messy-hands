import { useEffect, useMemo, useRef, useState } from 'react';
import TopBar from './components/TopBar.jsx';
import StepPane from './components/StepPane.jsx';
import IngredientPanel from './components/IngredientPanel.jsx';
import ElbowBar from './components/ElbowBar.jsx';
import HelpDrawer from './components/HelpDrawer.jsx';
import Toast from './components/Toast.jsx';
import Celebration from './components/Celebration.jsx';
import useSession from './hooks/useSession.js';
import useVoice from './hooks/useVoice.js';
import useNow from './hooks/useNow.js';
import useTransient from './hooks/useTransient.js';
import useWakeLock from './hooks/useWakeLock.js';
import { parseCommand, stripWake } from './lib/commands.js';
import { beep, speak } from './lib/audio.js';
import { mmss, pickHero, spokenQty, formatQty, scaleQty, timerView } from './lib/format.js';

export default function Cook({ recipe, session, sensors }) {
  const [state, act] = useSession(session, recipe);
  const now = useNow(1000);
  const [toast, setToast] = useTransient(2200);
  const [caption, setCaption] = useTransient(3500);
  const [cfg, setCfg] = useState({ wake: false, strict: false, demo: false });
  const [help, setHelp] = useState(false);
  const [noisy, setNoisy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [done, setDone] = useState(false);
  const announced = useRef(new Set());
  useWakeLock(true);

  const step = recipe.steps[state.stepIndex];
  const last = state.stepIndex === recipe.steps.length - 1;
  const timers = useMemo(() => state.timers.map((t) => timerView(t, now)), [state.timers, now]);
  const hero = pickHero(timers, step);
  const others = timers.filter((t) => t !== hero);
  const anyDone = timers.some((t) => t.done);
  const running = !!step.timer && timers.some((t) => t.key === step.timer.key && !t.done);
  const stepIngredients = step.ingredients.map((k) => recipe.ingredients.find((i) => i.key === k)).filter(Boolean);
  const say = (title, sub) => setToast({ title, sub });

  // NEXT on the final step means the food is ready: celebrate.
  const goNext = () => {
    if (!last) return act.next();
    act.dismiss();
    setDone(true); // Celebration plays the popper sound + confetti
    setTimeout(() => speak(`Enjoy your ${recipe.title}!`), 900);
  };

  // Alarm: speak the name once, then beep every 2 s until dismissed.
  useEffect(() => {
    timers.filter((t) => t.done && !announced.current.has(t.key)).forEach((t) => { announced.current.add(t.key); speak(`${t.name} timer is done`); });
    for (const k of [...announced.current]) if (!timers.some((t) => t.key === k)) announced.current.delete(k);
  }, [timers]);
  useEffect(() => {
    if (!anyDone) return;
    beep();
    const id = setInterval(beep, 2000);
    return () => clearInterval(id);
  }, [anyDone]);

  const startTimer = () => {
    const t = step.timer;
    if (!t) return say('No timer for this step');
    const total = cfg.demo ? Math.max(3, Math.round(t.seconds / 20)) : t.seconds;
    act.startTimer({ key: t.key, name: t.name, color: t.color, total });
    say(`⏲ ${t.name} ${mmss(total)} started`);
  };
  const togglePause = (on) => { act.pause(on); say(on ?? !state.paused ? '⏸ Timers paused' : '▶ Resumed'); };

  const exec = (c) => {
    switch (c.type) {
      case 'NEXT': return goNext();
      // "done": on the last step it fires the party; mid-recipe it ends a ringing alarm, otherwise moves on.
      case 'DONE': return last || !anyDone ? goNext() : act.dismiss();
      case 'BACK': return act.back();
      case 'START_TIMER': return startTimer();
      case 'PAUSE': return togglePause(true);
      case 'RESUME': return togglePause(false);
      case 'DISMISS': return act.dismiss();
      case 'REPEAT': speak(`${step.verb}. ${step.text}`); return say('🔊 Reading step');
      case 'SCALE':
        if (c.n < 1 || c.n > 12) return say('Pick 1 to 12 servings');
        act.scale(c.n); setFlash(true); setTimeout(() => setFlash(false), 1000);
        return say(`Serves ${c.n}`, 'amounts updated');
      case 'ASK_QTY': {
        const ing = recipe.ingredients.find((i) => i.key === c.key);
        say(formatQty(scaleQty(ing, state.servings, recipe.baseServings), ing.unit), ing.name);
        return speak(spokenQty(ing, state.servings, recipe.baseServings));
      }
      case 'TIME_LEFT': {
        if (!hero) { speak('No timers running'); return say('No timers running'); }
        const m = Math.floor(hero.left / 60), s = Math.ceil(hero.left % 60);
        speak(hero.done ? `${hero.name} is done` : `${m} minutes ${s} seconds left on ${hero.name}`);
        return say(hero.done ? 'DONE' : mmss(hero.left), hero.name);
      }
      default:
    }
  };

  const onSpeech = (text) => {
    if (done) return;
    const { hit, text: cmd } = stripWake(text);
    if (cfg.wake && !hit) return setCaption({ text: `“${text}”` });
    const c = parseCommand(cmd, recipe.ingredients);
    setCaption({ text: `“${text}”`, ok: !!c });
    if (c) exec(c); else if (hit) say('Not sure…', 'did you mean “next”?');
  };

  const onGesture = (g) => {
    if (done) return;
    if (g === 'r') goNext();
    if (g === 'l') act.back();
    if (g === 'c') exec({ type: 'REPEAT' });
    if (g === 'v') anyDone ? act.dismiss() : togglePause();
  };

  const onBar = (a) => {
    if (done) return;
    if (a === 'next') goNext();
    else if (a === 'back') act.back();
    else if (anyDone) act.dismiss();
    else if (step.timer && !timers.some((t) => t.key === step.timer.key)) startTimer();
    else togglePause();
  };

  const speech = useVoice({ enabled: sensors, onFinal: onSpeech, onInterim: (t) => setCaption({ text: `“${t}…”` }) });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' && !done) goNext();
      if (e.key === 'ArrowLeft') act.back();
      if (e.key === ' ') { e.preventDefault(); onBar('tm'); }
      if (e.key === '?') setHelp((h) => !h);
      if (e.key === 'Escape') setHelp(false);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const fullscreen = () => {
    try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => say('Fullscreen unavailable')); } catch { /* ignore */ }
  };
  const reset = () => { localStorage.removeItem('cook-along-sid'); location.reload(); };

  return (
    <div className={`app${anyDone ? ' alert' : ''}${noisy ? ' noisy' : ''}`}>
      <TopBar recipe={recipe} index={state.stepIndex} caption={caption} speech={speech} sensors={sensors}
        onNoisy={(n) => { setNoisy(n); if (n) say('🔊 Loud kitchen', 'voice may miss you. Wave or use the elbow bar'); }}
        onGesture={onGesture} onCamStatus={(s) => (s === 'blocked' || s === 'unavailable') && say('Camera unavailable', 'allow it in site settings')}
        onHelp={() => setHelp(true)} onFullscreen={fullscreen} />
      <div className="main" onPointerDown={() => say('💧 Touch ignored', 'use voice, wave, or the elbow bar')}>
        <StepPane steps={recipe.steps} index={state.stepIndex} hero={hero} others={others} />
        <IngredientPanel ingredients={stepIngredients} servings={state.servings} baseServings={recipe.baseServings} flash={flash} />
      </div>
      <ElbowBar last={last} anyDone={anyDone} paused={state.paused} running={running} step={step} strict={cfg.strict}
        onAction={onBar} onIgnored={() => say('💧 Small touch ignored', 'use your forearm or elbow')} />
      <Toast toast={toast} />
      {done && <Celebration title={recipe.title} emoji={recipe.emoji} onAgain={() => { act.restart(); setDone(false); }} onNew={reset} />}
      <HelpDrawer open={help} onClose={() => setHelp(false)} cfg={cfg} setCfg={setCfg}
        onSay={onSpeech} onGesture={onGesture} onReset={reset} />
    </div>
  );
}
