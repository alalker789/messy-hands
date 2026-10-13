import mongoose from 'mongoose';

// Timers are stored as absolute timestamps, so a refresh (or a second device) never loses time.
const TimerSchema = new mongoose.Schema(
  {
    key: String,
    name: String,
    color: String,
    total: Number, // seconds
    endsAt: Number, // epoch ms while running, null while paused
    leftMs: Number, // remaining ms while paused
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    recipeSlug: { type: String, required: true },
    stepIndex: { type: Number, default: 0, min: 0 },
    servings: { type: Number, default: 4, min: 1, max: 12 },
    paused: { type: Boolean, default: false },
    timers: [TimerSchema],
  },
  { timestamps: true }
);

// Cooking sessions expire after 7 days of inactivity.
SessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export default mongoose.model('Session', SessionSchema);
