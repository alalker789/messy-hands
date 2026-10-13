import { useEffect } from 'react';

export default function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock;
    const request = () => navigator.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {});
    const onVisible = () => !document.hidden && request();
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => { document.removeEventListener('visibilitychange', onVisible); lock?.release?.(); };
  }, [active]);
}
