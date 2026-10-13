import { useEffect, useRef, useState } from 'react';
import { createDetector } from '../lib/motion.js';

/** Opens the front camera and feeds tiny frames to the gesture detector (nothing leaves the device). */
export default function useCamera({ enabled, onGesture }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('off');
  const [blip, setBlip] = useState(null);
  const cb = useRef(onGesture);
  cb.current = onGesture;

  useEffect(() => {
    if (!enabled) return;
    let dead = false, stream, timer;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }, audio: false,
        });
        if (dead) return stream.getTracks().forEach((t) => t.stop());
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setStatus('on');
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 48;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const detect = createDetector(64, 48);
        timer = setInterval(() => {
          if (video.readyState < 2) return;
          ctx.drawImage(video, 0, 0, 64, 48);
          const r = detect(ctx.getImageData(0, 0, 64, 48).data, performance.now());
          setBlip(r.moving ? { x: r.x, y: r.y } : null);
          if (r.gesture) cb.current(r.gesture);
        }, 80);
      } catch (e) {
        setStatus(e?.name === 'NotAllowedError' ? 'blocked' : 'unavailable');
      }
    })();
    return () => { dead = true; clearInterval(timer); stream?.getTracks().forEach((t) => t.stop()); };
  }, [enabled]);

  return { videoRef, status, blip };
}
