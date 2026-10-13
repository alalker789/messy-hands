import { useEffect, useState } from 'react';
import useCamera from '../hooks/useCamera.js';

const LABEL = { r: '👋 swipe →', l: '👋 ← swipe', c: '⟳ circle', v: '✋ lens covered' };
const TEXT = { on: 'Camera on', blocked: 'Camera blocked', unavailable: 'No camera' };

export default function CameraPip({ enabled, onGesture, onStatus }) {
  const [flash, setFlash] = useState(null);
  const { videoRef, status, blip } = useCamera({
    enabled,
    onGesture: (g) => {
      setFlash(LABEL[g]);
      setTimeout(() => setFlash(null), 1400);
      onGesture(g);
    },
  });
  useEffect(() => { onStatus?.(status); }, [status, onStatus]);

  const cls = flash ? 'act' : status === 'on' ? 'ok' : status === 'blocked' || status === 'unavailable' ? 'bad' : '';
  return (
    <>
      <div className={`pill ${cls}`}>📷<span className="t">{flash || TEXT[status] || 'Camera off'}</span></div>
      <div className={`pip${blip ? ' mv' : ''}`} style={{ display: status === 'on' ? 'block' : 'none' }}>
        <video ref={videoRef} muted playsInline />
        {blip && <span className="dot" style={{ display: 'block', left: `${blip.x * 100}%`, top: `${blip.y * 100}%` }} />}
      </div>
    </>
  );
}
