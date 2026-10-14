import { useEffect, useState } from "react";
import { api } from "./api.js";
import { unlockAudio } from "./lib/audio.js";
import Gate from "./components/Gate.jsx";
import Cook from "./Cook.jsx";

const SID = "cook-along-sid";

export default function App() {
  const [boot, setBoot] = useState({
    recipes: null,
    resume: null,
    error: null,
  });
  const [run, setRun] = useState(null); // { recipe, session, sensors }

  useEffect(() => {
    (async () => {
      const recipes = await api.recipes();
      let resume = null;
      const id = localStorage.getItem(SID);
      if (id) {
        try {
          const session = await api.getSession(id);
          resume = { session, recipe: await api.recipe(session.recipeSlug) };
        } catch {
          localStorage.removeItem(SID);
        }
      }
      setBoot({ recipes, resume, error: null });
    })().catch((e) => setBoot({ recipes: [], resume: null, error: e.message }));
  }, []);

  // Runs inside the click handler so audio and permission prompts have a user gesture.
  const start = async (slug, sensors, continuing = false) => {
    unlockAudio();
    if (continuing) return setRun({ ...boot.resume, sensors });
    const [recipe, session] = await Promise.all([
      api.recipe(slug),
      api.createSession(slug),
    ]);
    localStorage.setItem(SID, session._id);
    setRun({ recipe, session, sensors });
  };

  if (!run)
    return (
      <Gate
        recipes={boot.recipes}
        resume={boot.resume}
        error={boot.error}
        onStart={start}
      />
    );
  return <Cook key={run.session._id} {...run} />;
}
