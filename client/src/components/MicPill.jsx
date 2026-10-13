import useMicLevel from '../hooks/useMicLevel.js';

export default function MicPill({ enabled, speech, onNoisy }) {
  const { bars, noisy, status } = useMicLevel({ enabled, onNoisy });
  let cls = '', text = 'Mic off';
  if (enabled) {
    if (status === 'blocked' || speech === 'blocked') [cls, text] = ['bad', 'Mic blocked'];
    else if (speech === 'unsupported') [cls, text] = ['bad', 'Use Chrome or Edge'];
    else if (speech === 'network') [cls, text] = ['bad', 'Speech needs internet'];
    else if (noisy) [cls, text] = ['bad', 'Loud: wave or elbow'];
    else [cls, text] = ['ok', 'Listening'];
  }
  return (
    <div className={`pill ${cls}`}>🎙<span className="t">{text}</span>
      <span className="lvl">{bars.map((h, i) => <i key={i} style={{ height: `${h}rem` }} />)}</span>
    </div>
  );
}
