import { Router } from 'express';
import Recipe from '../models/Recipe.js';
import wrap from '../utils/asyncHandler.js';

const router = Router();

router.get('/', wrap(async (_req, res) => {
  res.json(await Recipe.find({}, 'slug title emoji baseServings').sort('title').lean());
}));

router.get('/:slug', wrap(async (req, res) => {
  const recipe = await Recipe.findOne({ slug: req.params.slug }).lean();
  recipe ? res.json(recipe) : res.status(404).json({ error: 'Recipe not found' });
}));

export default router;
