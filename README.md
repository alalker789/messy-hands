# Cook-Along Mode (MERN)

Hands-free cooking screen: voice (English + Hinglish), camera gestures, an elbow-sized control bar,
timers that survive refreshes, and ingredient scaling. React + Vite front end, Express + MongoDB back end.

## Run it
Needs Node 20+ and MongoDB (local, or an Atlas URI).

```bash
npm run install:all
cp server/.env.example server/.env      # edit MONGO_URI if needed
npm run seed                            # loads Methi Thepla + Masala Chai
npm run dev                             # API :5000, web :5173
```
Open http://localhost:5173 in Chrome or Edge. `localhost` counts as a secure origin, so camera and mic work without HTTPS.

## Structure
```
server/src
  models/     Recipe.js, Session.js (timers stored as absolute timestamps, 7-day TTL)
  routes/     recipes.js, sessions.js
  app.js      middleware + routes (also serves client/dist in production)
  seed.js     sample recipes
client/src
  lib/        format.js (scaling), commands.js (voice parser), motion.js (gesture detector), audio.js
  hooks/      useSession, useVoice, useCamera, useMicLevel, useWakeLock, useNow, useTransient
  components/ TopBar, StepPane, IngredientPanel, ElbowBar, HelpDrawer, Gate, CameraPip, MicPill, Toast
  Cook.jsx    the kitchen screen (wires hooks and components together)
  App.jsx     boot, recipe picker, resume
```

## API
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/recipes` | list recipes |
| GET | `/api/recipes/:slug` | one recipe |
| POST | `/api/sessions` | `{ recipeSlug }` start a cooking session |
| GET | `/api/sessions/:id` | resume a session |
| PUT | `/api/sessions/:id` | save step, servings, pause state, timers |

## Add a recipe
Add an object to `server/src/seed.js` (ingredients with `aliases` for voice, steps with optional `timer`) and run `npm run seed`.

## Deploy as one service
`npm run build` then `npm start`. Express serves `client/dist` and `/api` from one origin. Use any host with HTTPS
(Render, Railway, Fly.io) plus MongoDB Atlas. Set `MONGO_URI` and `PORT`.

## Notes
- Speech recognition uses the browser's Web Speech API (Chrome/Edge; it needs an internet connection).
- Gesture detection is plain frame-differencing on 64x48 frames: swipe, circle, cover-the-lens. No ML model, nothing uploaded.
