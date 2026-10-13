import { useState } from 'react';

export default function Gate({ recipes, resume, error, onStart }) {
  const [picked, setPicked] = useState(null);
  const slug = picked ?? recipes?.[0]?.slug; // first recipe is selected by default once loaded
  return (
    <div className="app">
      <div className="gate">
        <div className="card">
          <h1>Cook-Along <span>Mode</span></h1>
          <p>Hands full of dough? Run the recipe with your voice and a wave. Camera frames are processed on this device and never uploaded.</p>
          {error && <p style={{ color: 'var(--c3)' }}>Could not reach the server: {error}</p>}
          <div className="recipes">
            {(recipes || []).map((r) => (
              <button key={r.slug} className={`rc${r.slug === slug ? ' sel' : ''}`} onClick={() => setPicked(r.slug)}>{r.emoji} {r.title}</button>
            ))}
          </div>
          <div className="row"><em>🎙</em><div>Microphone<span>Voice commands and a loud-kitchen detector</span></div></div>
          <div className="row"><em>📷</em><div>Camera<span>Air-swipes, circles and lens-cover</span></div></div>
          <div className="row"><em>💪</em><div>Elbow bar<span>Always available, no permission needed</span></div></div>
          {resume && <button className="btn" onClick={() => onStart(null, true, true)}>Continue {resume.recipe.title} · step {resume.session.stepIndex + 1}</button>}
          <button className={`btn${resume ? ' g' : ''}`} disabled={!slug} onClick={() => onStart(slug, true)}>Start with camera + mic</button>
          <button className="btn g" disabled={!slug} onClick={() => onStart(slug, false)}>Start without sensors</button>
        </div>
      </div>
    </div>
  );
}
