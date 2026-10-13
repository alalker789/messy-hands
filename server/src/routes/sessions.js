import { Router } from 'express';
import mongoose from 'mongoose';
import Session from '../models/Session.js';
import Recipe from '../models/Recipe.js';
import wrap from '../utils/asyncHandler.js';

const router = Router();
const fail = (res, code, error) => res.status(code).json({ error });
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Math.round(Number(n)) || lo));

router.param('id', (_req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : fail(res, 400, 'Invalid session id')
);

router.post('/', wrap(async (req, res) => {
  const recipe = await Recipe.findOne({ slug: String(req.body.recipeSlug) }).lean();
  if (!recipe) return fail(res, 404, 'Recipe not found');
  res.status(201).json(await Session.create({ recipeSlug: recipe.slug, servings: recipe.baseServings }));
}));

router.get('/:id', wrap(async (req, res) => {
  const session = await Session.findById(req.params.id);
  session ? res.json(session) : fail(res, 404, 'Session not found');
}));

router.put('/:id', wrap(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) return fail(res, 404, 'Session not found');
  const recipe = await Recipe.findOne({ slug: session.recipeSlug }).lean();
  const b = req.body;
  session.stepIndex = clamp(b.stepIndex, 0, recipe.steps.length - 1);
  session.servings = clamp(b.servings, 1, 12);
  session.paused = !!b.paused;
  session.timers = (Array.isArray(b.timers) ? b.timers : []).slice(0, 8);
  await session.save();
  res.json(session);
}));

export default router;
