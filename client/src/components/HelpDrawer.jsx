const TESTS = ['Next', 'Done', 'Agla', 'Start timer', '6 logon ke liye', 'How much oil', 'Time left', 'Dismiss', 'Pause'];

export default function HelpDrawer({ open, onClose, cfg, setCfg, onSay, onGesture, onReset }) {
  const toggle = (k) => (e) => setCfg((c) => ({ ...c, [k]: e.target.checked }));
  return (
    <aside className={`help${open ? ' open' : ''}`}>
      <h3>Voice (English + Hinglish)</h3>
      <ul>
        <li><b>next / agla</b>, <b>back / pichla</b></li>
        <li><b>done / ho gaya</b>: finishes the step. On the last step it launches the party 🎉</li>
        <li><b>start timer / shuru</b>, <b>pause / ruko</b>, <b>resume / chalo</b></li>
        <li><b>6 logon ke liye</b>, <b>scale to 2 people</b></li>
        <li><b>how much oil? / kitna namak?</b>, <b>time left?</b>, <b>dismiss / ok</b>, <b>repeat</b></li>
      </ul>
      <h3>Camera gestures (motion based)</h3>
      <ul>
        <li><b>Swipe</b> across the camera: right = next, left = back</li>
        <li><b>Draw a circle</b> in the air: read the step aloud</li>
        <li><b>Cover the lens</b> with your palm for 1 s: dismiss alarm or pause. Works with floury hands.</li>
      </ul>
      <h3>Elbow bar &amp; touch</h3>
      <ul><li>The big slabs work with an elbow or wrist. Taps elsewhere are ignored on purpose.</li></ul>
      <h3>Settings</h3>
      <label><input type="checkbox" checked={cfg.wake} onChange={toggle('wake')} />Require “Chef ji” before commands</label>
      <label><input type="checkbox" checked={cfg.strict} onChange={toggle('strict')} />Strict elbow mode (ignore small touches; needs a touchscreen that reports contact size)</label>
      <label><input type="checkbox" checked={cfg.demo} onChange={toggle('demo')} />Demo timers at ×20 speed</label>
      <h3>Test without sensors</h3>
      <div className="t">{TESTS.map((x) => <button key={x} onClick={() => onSay(x)}>{x}</button>)}</div>
      <div className="t">
        <button onClick={() => onGesture('r')}>swipe →</button><button onClick={() => onGesture('l')}>← swipe</button>
        <button onClick={() => onGesture('c')}>circle</button><button onClick={() => onGesture('v')}>cover lens</button>
      </div>
      <button className="btn g" onClick={onReset}>Finish &amp; choose another recipe</button>
      <button className="btn g" onClick={onClose}>Close</button>
    </aside>
  );
}
