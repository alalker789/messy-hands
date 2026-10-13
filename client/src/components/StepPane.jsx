import { mmss } from '../lib/format.js';

function TimerZone({ hero, others }) {
  return (
    <div className="tz">
      {hero ? (
        <div className="ring" style={{ background: `conic-gradient(${hero.done ? 'var(--c3)' : hero.color} ${360 * (1 - hero.left / hero.total)}deg, var(--k2) 0)` }}>
          <div><div><b>{hero.done ? 'DONE' : mmss(hero.left)}</b><small>{hero.name}</small></div></div>
        </div>
      ) : <div className="idle">No timers running</div>}
      <div className="chips">
        {others.map((t) => (
          <div key={t.key} className={`chip${t.done ? ' done' : ''}`} style={{ '--c': t.color }}>
            <i />{t.name} {t.done ? 'DONE' : mmss(t.left)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StepPane({ steps, index, hero, others }) {
  const step = steps[index], next = steps[index + 1];
  return (
    <div className="L">
      <div className="dots">{steps.map((_, i) => <i key={i} className={i < index ? 'd' : i === index ? 'c' : ''} />)}</div>
      <div className="verb">{step.verb}</div>
      <div className="txt">{step.text}</div>
      {next && <div className="nx">NEXT UP ▸ <b>{next.verb}</b></div>}
      <TimerZone hero={hero} others={others} />
    </div>
  );
}
