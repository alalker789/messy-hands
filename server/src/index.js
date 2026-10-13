import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const { PORT = 5000, MONGO_URI = 'mongodb://127.0.0.1:27017/cook-along' } = process.env;

try {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
} catch (err) {
  console.error('Startup failed:', err.message);
  process.exit(1);
}
