import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 0 }, // quantity for baseServings
    unit: { type: String, enum: ['g', 'ml', 'tsp', 'tbsp', 'cup', 'pcs'], default: 'g' },
    aliases: [String], // words the voice parser understands (English + Hinglish)
  },
  { _id: false }
);

const StepSchema = new mongoose.Schema(
  {
    verb: { type: String, required: true }, // the giant word on screen
    text: { type: String, required: true },
    ingredients: [String], // ingredient keys needed in this step
    timer: { key: String, name: String, seconds: Number, color: String },
  },
  { _id: false }
);

const RecipeSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    emoji: { type: String, default: '🍽️' },
    baseServings: { type: Number, default: 4, min: 1 },
    ingredients: [IngredientSchema],
    steps: [StepSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Recipe', RecipeSchema);
