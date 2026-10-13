import CameraPip from './CameraPip.jsx';
import MicPill from './MicPill.jsx';

export default function TopBar({ recipe, index, caption, speech, sensors, onNoisy, onGesture, onCamStatus, onHelp, onFullscreen }) {
  return (
    <div className="top">
      <div className="brand">{recipe.emoji} {recipe.title}</div>
      <div className="sp">STEP {index + 1} / {recipe.steps.length}</div>
      <div className={`pill cap${caption?.ok ? ' act' : ''}`}>
        <span className="t">{caption?.text || 'Say “next”, wave, or use the elbow bar'}</span>
      </div>
      <MicPill enabled={sensors} speech={speech} onNoisy={onNoisy} />
      <CameraPip enabled={sensors} onGesture={onGesture} onStatus={onCamStatus} />
      <button className="ib" onClick={onFullscreen} aria-label="Fullscreen">⛶</button>
      <button className="ib" onClick={onHelp} aria-label="Help">?</button>
    </div>
  );
}
