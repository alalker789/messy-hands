import { useEffect, useRef, useState } from 'react';
import { isTalking } from '../lib/audio.js';

/** Continuous speech recognition (Web Speech API: Chrome/Edge/Safari). Restarts itself when the browser stops it. */
export default function useVoice({ enabled, onFinal, onInterim }) {
  const [status, setStatus] = useState('off');
  const finalCb = useRef(onFinal), interimCb = useRef(onInterim);
  finalCb.current = onFinal;
  interimCb.current = onInterim;

  useEffect(() => {
    if (!enabled) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setStatus('unsupported'); return; }
    const rec = new SR();
    let alive = true;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-IN';
    rec.onresult = (e) => {
      if (isTalking()) return;
      let fin = '', mid = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript; else mid += r[0].transcript;
      }
      if (fin.trim()) finalCb.current(fin.trim());
      else if (mid.trim()) interimCb.current?.(mid.trim());
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { alive = false; setStatus('blocked'); }
      else if (e.error === 'network') setStatus('network');
    };
    rec.onend = () => { if (alive) setTimeout(() => { try { rec.start(); } catch { /* already started */ } }, 300); };
    try { rec.start(); setStatus('listening'); } catch { /* ignore */ }
    return () => { alive = false; rec.abort(); };
  }, [enabled]);

  return status;
}
