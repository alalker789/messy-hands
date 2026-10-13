import { useCallback, useRef, useState } from 'react';

/** A value that clears itself after `ms` (toasts, captions). */
export default function useTransient(ms) {
  const [value, setValue] = useState(null);
  const timer = useRef();
  const set = useCallback((v) => {
    setValue(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setValue(null), ms);
  }, [ms]);
  return [value, set];
}
