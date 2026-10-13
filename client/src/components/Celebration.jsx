import { useEffect, useRef } from 'react';
import { startConfetti } from '../lib/confetti.js';
import { partyPopper } from '../lib/audio.js';

/** "Food is ready" moment: two popper cannons fire confetti, with a matching pop + shimmer sound. */
export default function Celebration({ title, emoji, onAgain, onNew }) {
  const canvas = useRef(null);

  useEffect(() => {
    partyPopper();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return startConfetti(canvas.current);
  }, []);

  return (
    <div className="party" role="dialog" aria-label="Recipe complete">
      <span className="pp l">🎉</span>
      <span className="pp r">🎉</span>
      <div>
        <div className="big">{emoji}</div>
        <h2>{title} is ready!</h2>
        <p>Wah, kya baat hai, chef ji! Enjoy your meal 🎉</p>
        <div className="acts">
          <button className="btn" onClick={onAgain}>Cook again</button>
          <button className="btn g" onClick={onNew}>Choose another recipe</button>
        </div>
      </div>
      <canvas ref={canvas} />
    </div>
  );
}
