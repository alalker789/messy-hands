import { useEffect, useRef, useState } from 'react';
import { getCtx } from '../lib/audio.js';

/** Live mic level (4 bars) + a "loud kitchen" flag when noise stays high for ~2 s. */
export default function useMicLevel({ enabled, onNoisy }) {
  const [bars, setBars] = useState([0.4, 0.4, 0.4, 0.4]);
  const [noisy, setNoisy] = useState(false);
  const [status, setStatus] = useState('off');
  const cb = useRef(onNoisy);
  cb.current = onNoisy;

  useEffect(() => {
    if (!enabled) return;
    let dead = false, stream, timer;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { noiseSuppression: false } });
        if (dead) return stream.getTracks().forEach((t) => t.stop());
        const ctx = getCtx(), analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(512);
        let streak = 0, loud = false;
        setStatus('on');
        timer = setInterval(() => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (const v of buf) sum += ((v - 128) / 128) ** 2;
          const rms = Math.sqrt(sum / buf.length);
          setBars([1, 2, 3, 4].map((i) => Math.max(0.4, Math.min(1.8, (rms * 18 * i) / 4))));
          streak = rms > 0.22 ? Math.min(streak + 1, 40) : Math.max(streak - 2, 0);
          const now = streak > 20;
          if (now !== loud) { loud = now; setNoisy(now); cb.current?.(now); }
        }, 100);
      } catch { setStatus('blocked'); }
    })();
    return () => { dead = true; clearInterval(timer); stream?.getTracks().forEach((t) => t.stop()); };
  }, [enabled]);

  return { bars, noisy, status };
}
