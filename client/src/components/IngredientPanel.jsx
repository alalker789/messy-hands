import { formatQty, scaleQty } from '../lib/format.js';

export default function IngredientPanel({ ingredients, servings, baseServings, flash }) {
  return (
    <div className="R">
      <div className="sv">
        SERVES {[2, 4, 6, 8].map((n) => <span key={n} className={`p${n === servings ? ' a' : ''}`}>{n}</span>)}
        {servings !== baseServings && <span>×{+(servings / baseServings).toFixed(2)}</span>}
      </div>
      <div className="lbl">NEEDED NOW</div>
      {ingredients.length
        ? ingredients.map((ing) => (
            <div key={ing.key} className={`ing${flash ? ' f' : ''}`}>
              <b>{formatQty(scaleQty(ing, servings, baseServings), ing.unit)}</b>{ing.name}
            </div>
          ))
        : <div className="none">Nothing to measure. Rest your arms 🙂</div>}
    </div>
  );
}
